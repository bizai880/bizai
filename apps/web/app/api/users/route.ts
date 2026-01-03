import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
	encryptionService,
	requireRole,
	verifyToken,
} from "@/lib/crypto/encryption";
import { createClient } from "@/lib/supabase/server";

// Middleware للتحقق من التوكن
export async function middleware(request: NextRequest) {
	try {
		const payload = verifyToken(request);
		request.headers.set("x-user-id", payload.userId);
		request.headers.set("x-user-role", payload.role);
	} catch (_error) {
		return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
	}
}

// GET /api/users - جلب جميع المستخدمين
export async function GET(request: NextRequest) {
	try {
		// التحقق من صلاحيات المدير
		requireRole("admin")(request);

		const _userId = request.headers.get("x-user-id")!;
		const searchParams = request.nextUrl.searchParams;

		const supabase = await createClient();

		// بناء الاستعلام مع التصفية
		let query = supabase.from("profiles").select(`
        id,
        email,
        full_name,
        role,
        subscription,
        status,
        last_sign_in_at,
        created_at,
        login_count,
        encrypted_profiles!inner(data)
      `);

		// تطبيق الفلاتر
		const role = searchParams.get("role");
		const status = searchParams.get("status");
		const subscription = searchParams.get("subscription");
		const search = searchParams.get("search");
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "20", 10);
		const offset = (page - 1) * limit;

		if (role) query = query.eq("role", role);
		if (status) query = query.eq("status", status);
		if (subscription) query = query.eq("subscription", subscription);

		if (search) {
			query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
		}

		// جلب البيانات مع الترحيل
		const {
			data: users,
			error,
			count,
		} = await query
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		// فك تشفير البيانات الحساسة
		const decryptedUsers = await Promise.all(
			users.map(async (user: any) => {
				try {
					const encryptedData = user.encrypted_profiles?.[0]?.data;
					if (encryptedData) {
						const decrypted = encryptionService.decryptData(encryptedData);
						return {
							...user,
							encrypted_profiles: undefined,
							sensitive_data: decrypted,
						};
					}
					return user;
				} catch {
					return user;
				}
			}),
		);

		return NextResponse.json({
			success: true,
			data: decryptedUsers,
			pagination: {
				total: count,
				page,
				limit,
				pages: Math.ceil((count || 0) / limit),
			},
		});
	} catch (error: any) {
		console.error("Get users error:", error);

		return NextResponse.json(
			{ error: error.message || "فشل في جلب المستخدمين" },
			{ status: error.message === "Insufficient permissions" ? 403 : 500 },
		);
	}
}

// POST /api/users - إنشاء مستخدم جديد
export async function POST(request: NextRequest) {
	try {
		requireRole("admin")(request);

		const body = await request.json();
		const supabase = await createClient();

		const userSchema = z.object({
			email: z.string().email(),
			password: z.string().min(8),
			full_name: z.string().min(2),
			role: z.enum(["user", "moderator", "admin"]),
			subscription: z.enum(["free", "pro", "enterprise"]),
			phone: z.string().optional(),
			company: z.string().optional(),
		});

		const validatedData = userSchema.parse(body);

		// إنشاء المستخدم في Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: validatedData.email,
			password: validatedData.password,
			options: {
				data: {
					full_name: validatedData.fullName,
					role: validatedData.role,
				},
			},
		});

		if (authError) throw authError;

		if (!authData.user) {
			throw new Error("فشل في إنشاء المستخدم");
		}

		// إنشاء الملف الشخصي
		const { error: profileError } = await supabase.from("profiles").insert({
			id: authData.user.id,
			email: validatedData.email,
			full_name: validatedData.full_name,
			role: validatedData.role,
			subscription: validatedData.subscription,
			status: "active",
			created_by: request.headers.get("x-user-id"),
		});

		if (profileError) throw profileError;

		// تخزين البيانات المشفرة
		const encryptedProfile = {
			personal_info: {
				phone: validatedData.phone || "",
				company: validatedData.company || "",
				address: "",
				birth_date: null,
			},
			preferences: {
				language: "ar",
				timezone: "Asia/Dubai",
				theme: "dark",
			},
		};

		await supabase.from("encrypted_profiles").insert({
			user_id: authData.user.id,
			data: encryptionService.encryptData(encryptedProfile),
		});

		// تسجيل النشاط
		await supabase.from("activity_logs").insert({
			user_id: request.headers.get("x-user-id"),
			action: "USER_CREATED",
			resource_type: "user",
			resource_id: authData.user.id,
			details: {
				created_user_email: validatedData.email,
				role: validatedData.role,
			},
		});

		return NextResponse.json({
			success: true,
			message: "تم إنشاء المستخدم بنجاح",
			userId: authData.user.id,
		});
	} catch (error: any) {
		console.error("Create user error:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "بيانات غير صالحة", details: error.errors },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ error: error.message || "فشل في إنشاء المستخدم" },
			{ status: 500 },
		);
	}
}
