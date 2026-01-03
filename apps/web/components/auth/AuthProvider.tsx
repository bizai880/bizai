"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string, fullName: string) => Promise<void>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();
	const supabase = createClient();

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setIsLoading(false);

			// إعادة التوجيه بناءً على حالة المصادقة
			if (session?.user && pathname?.startsWith("/auth")) {
				router.push("/dashboard");
			} else if (!session?.user && pathname?.startsWith("/dashboard")) {
				router.push("/auth/login");
			}
		});

		// جلب المستخدم الحالي
		const getUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);
			setIsLoading(false);
		};

		getUser();

		return () => subscription.unsubscribe();
	}, [router, pathname, supabase]);

	const value = {
		user,
		isLoading,
		signIn: async (email: string, password: string) => {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
		},
		signUp: async (email: string, password: string, fullName: string) => {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: { full_name: fullName },
				},
			});
			if (error) throw error;
		},
		signOut: async () => {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			router.push("/auth/login");
		},
		resetPassword: async (email: string) => {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			});
			if (error) throw error;
		},
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
