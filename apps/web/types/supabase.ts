// تعريفات Supabase لتفادي أخطاء TypeScript
export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					email: string;
					full_name: string | null;
					role: "user" | "moderator" | "admin";
					subscription: "free" | "pro" | "enterprise";
					status: "active" | "inactive" | "suspended";
					last_sign_in_at: string | null;
					created_at: string;
					login_count: number;
				};
				Insert: {
					id: string;
					email: string;
					full_name?: string | null;
					role?: "user" | "moderator" | "admin";
					subscription?: "free" | "pro" | "enterprise";
					status?: "active" | "inactive" | "suspended";
					last_sign_in_at?: string | null;
					created_at?: string;
					login_count?: number;
				};
				Update: {
					id?: string;
					email?: string;
					full_name?: string | null;
					role?: "user" | "moderator" | "admin";
					subscription?: "free" | "pro" | "enterprise";
					status?: "active" | "inactive" | "suspended";
					last_sign_in_at?: string | null;
					created_at?: string;
					login_count?: number;
				};
			};
			// يمكنك إضافة المزيد من الجداول هنا
		};
	};
}
