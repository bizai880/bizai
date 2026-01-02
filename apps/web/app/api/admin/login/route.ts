// apps/web/app/api/admin/login/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password } = body;

		// التحقق من بيانات المدخل
		if (!email || !password) {
			return NextResponse.json(
				{ error: "البريد الإلكتروني وكلمة المرور مطلوبان" },
				{ status: 400 },
			);
		}

		// التحقق من وجود JWT_SECRET (هنا فقط للتحقق، لا تستخدمه مباشرة)
		if (!process.env.JWT_SECRET) {
			console.error("JWT_SECRET environment variable is not set");
			return NextResponse.json(
				{ error: "إعدادات الخادم غير مكتملة" },
				{ status: 500 },
			);
		}

		const supabase = await createClient();

		// محاولة تسجيل الدخول
		const { data: authData, error: authError } =
			await supabase.auth.signInWithPassword({
				email,
				password,
			});

		if (authError) {
			console.error("Supabase auth error:", authError.message);
			return NextResponse.json(
				{ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
				{ status: 401 },
			);
		}

		// التحقق من صلاحيات المدير
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("role, full_name")
			.eq("id", authData.user.id)
			.single();

		if (profileError) {
			console.error("Profile fetch error:", profileError.message);
			return NextResponse.json(
				{ error: "حدث خطأ في التحقق من صلاحيات المستخدم" },
				{ status: 500 },
			);
		}

		if (profile?.role !== "admin") {
			return NextResponse.json(
				{
					error: "غير مصرح بالدخول إلى لوحة الإدارة",
					details: "يجب أن يكون لديك صلاحية مدير للوصول",
				},
				{ status: 403 },
			);
		}

		// استيراد jsonwebtoken ديناميكياً لتجنب مشاكل البناء
		const jwt = await import("jsonwebtoken");

		// إنشاء توكن JWT بشكل آمن
		const token = jwt.default.sign(
			{
				userId: authData.user.id,
				email: authData.user.email,
				role: profile.role,
				name: profile.full_name || authData.user.email,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "24h",
				algorithm: "HS256", // تحديد الخوارزمية بشكل صريح
			},
		);

		// إرجاع الاستجابة بدون التوكن في body إذا أردت استخدام HttpOnly cookie
		const response = NextResponse.json({
			success: true,
			user: {
				id: authData.user.id,
				email: authData.user.email,
				role: profile.role,
				name: profile.full_name || authData.user.email,
			},
		});

		// إضافة التوكن كـ HttpOnly cookie (أكثر أماناً)
		response.cookies.set({
			name: "admin_token",
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24, // 24 ساعة
			path: "/",
		});

		// إضافة cookie أخرى للمعلومات الأساسية (غير حساسة)
		response.cookies.set({
			name: "admin_user",
			value: JSON.stringify({
				id: authData.user.id,
				email: authData.user.email,
				role: profile.role,
				name: profile.full_name || authData.user.email,
			}),
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24,
			path: "/",
		});

		return response;
	} catch (error: any) {
		console.error("Admin login error:", error);

		// رسائل خطأ أكثر تحديداً
		let errorMessage = "حدث خطأ في الخادم";
		const statusCode = 500;

		if (error.name === "JsonWebTokenError") {
			errorMessage = "خطأ في إنشاء رمز المصادقة";
		} else if (error.name === "TokenExpiredError") {
			errorMessage = "انتهت صلاحية رمز المصادقة";
		} else if (error.message?.includes("database")) {
			errorMessage = "خطأ في الاتصال بقاعدة البيانات";
		}

		return NextResponse.json(
			{
				error: errorMessage,
				details:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			},
			{ status: statusCode },
		);
	}
}

// دالة التحقق من التوكن (Endpoint للتحقق)
export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("admin_token")?.value;

		if (!token) {
			return NextResponse.json(
				{ authenticated: false, error: "لم يتم توفير رمز المصادقة" },
				{ status: 401 },
			);
		}

		// استيراد ديناميكي
		const jwt = await import("jsonwebtoken");

		// التحقق من التوكن
		const decoded = jwt.default.verify(token, process.env.JWT_SECRET!);

		return NextResponse.json({
			authenticated: true,
			user: decoded,
		});
	} catch (error: any) {
		console.error("Token verification error:", error);

		if (
			error.name === "JsonWebTokenError" ||
			error.name === "TokenExpiredError"
		) {
			return NextResponse.json(
				{
					authenticated: false,
					error: "رمز المصادقة غير صالح أو منتهي الصلاحية",
				},
				{ status: 401 },
			);
		}

		return NextResponse.json(
			{ authenticated: false, error: "خطأ في التحقق من المصادقة" },
			{ status: 500 },
		);
	}
}

// دالة لتسجيل الخروج
export async function DELETE(request: NextRequest) {
	const response = NextResponse.json({
		success: true,
		message: "تم تسجيل الخروج بنجاح",
	});

	// حذف الكوكيز
	response.cookies.delete("admin_token");
	response.cookies.delete("admin_user");

	return response;
}
