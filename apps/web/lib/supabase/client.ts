import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	// التحقق من وجود متغيرات البيئة
	if (!supabaseUrl || !supabaseAnonKey) {
		if (typeof window !== "undefined") {
			console.error("Missing Supabase environment variables");
		}
		// إرجاع عميل وهمي للاستمرار في التطوير
		return createBrowserClient(
			"https://placeholder.supabase.co",
			"placeholder-key",
		);
	}

	return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// دالة تسجيل الدخول
export async function signIn(email: string, password: string) {
	const supabase = createClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		console.error("Sign in error:", error);
		throw new Error(error.message || "فشل تسجيل الدخول");
	}

	if (!data.user) {
		throw new Error("لم يتم العثور على بيانات المستخدم");
	}

	try {
		// تحديث آخر تسجيل دخول
		const { error: updateError } = await supabase
			.from("profiles")
			.update({
				last_sign_in_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.eq("id", data.user.id);

		if (updateError) {
			console.error("Profile update error:", updateError);
			// لا نرمي خطأ هنا لأن تسجيل الدخول ناجح
		}
	} catch (updateError) {
		console.error("Error updating profile:", updateError);
	}

	return data;
}

// دالة تسجيل الخروج
export async function signOut(): Promise<void> {
	try {
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("Sign out error:", error);
			throw new Error(error.message || "فشل تسجيل الخروج");
		}
	} catch (error) {
		console.error("Error in signOut:", error);
		throw error;
	}
}

// دالة التسجيل
export async function signUp(
	email: string,
	password: string,
	fullName: string,
) {
	const supabase = createClient();

	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${getBaseUrl()}/auth/callback`,
			data: {
				full_name: fullName,
			},
		},
	});

	if (error) {
		console.error("Sign up error:", error);
		throw new Error(error.message || "فشل إنشاء الحساب");
	}

	// إنشاء ملف تعريف إذا تم إنشاء المستخدم
	if (data.user) {
		try {
			const { error: profileError } = await supabase.from("profiles").insert({
				id: data.user.id,
				full_name: fullName,
				email: email,
				role: "user",
				subscription: "free",
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			});

			if (profileError) {
				console.error("Profile creation error:", profileError);
				// لا نرمي خطأ هنا لأن الحساب تم إنشاؤه بالفعل
			}
		} catch (profileError) {
			console.error("Error creating profile:", profileError);
		}
	}

	return data;
}

// دالة إعادة تعيين كلمة المرور
export async function resetPassword(email: string): Promise<void> {
	try {
		const supabase = createClient();
		const baseUrl = getBaseUrl();

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${baseUrl}/auth/reset-password`,
		});

		if (error) {
			console.error("Reset password error:", error);
			throw new Error(error.message || "فشل إرسال رابط إعادة التعيين");
		}
	} catch (error) {
		console.error("Error in resetPassword:", error);
		throw error;
	}
}

// دالة تحديث كلمة المرور
export async function updatePassword(newPassword: string): Promise<void> {
	try {
		const supabase = createClient();

		const { error } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (error) {
			console.error("Update password error:", error);
			throw new Error(error.message || "فشل تحديث كلمة المرور");
		}
	} catch (error) {
		console.error("Error in updatePassword:", error);
		throw error;
	}
}

// دالة جلب المستخدم الحالي
export async function getCurrentUser() {
	try {
		const supabase = createClient();
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser();

		if (error) {
			console.error("Get user error:", error);
			return null;
		}

		return user;
	} catch (error) {
		console.error("Error in getCurrentUser:", error);
		return null;
	}
}

// دالة جلب ملف المستخدم
export async function getUserProfile(userId: string) {
	try {
		const supabase = createClient();
		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single();

		if (error) {
			console.error("Get profile error:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("Error in getUserProfile:", error);
		return null;
	}
}

// دالة تحديث ملف المستخدم
export async function updateUserProfile(
	userId: string,
	updates: Record<string, any>,
) {
	try {
		const supabase = createClient();

		const { data, error } = await supabase
			.from("profiles")
			.update({
				...updates,
				updated_at: new Date().toISOString(),
			})
			.eq("id", userId)
			.select()
			.single();

		if (error) {
			console.error("Update profile error:", error);
			throw new Error(error.message || "فشل تحديث الملف الشخصي");
		}

		return data;
	} catch (error) {
		console.error("Error in updateUserProfile:", error);
		throw error;
	}
}

// دالة مساعدة للحصول على الرابط الأساسي
function getBaseUrl(): string {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	// للاستخدام في البيئات غير المتصفح
	return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
