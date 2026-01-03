"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRole?: "admin" | "moderator" | "user";
}

export default function ProtectedRoute({
	children,
	requiredRole = "user",
}: ProtectedRouteProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !user) {
			router.push(
				`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`,
			);
		}
	}, [user, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
					<p className="text-text-secondary">جاري التحقق من الصلاحيات...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	// هنا يمكن إضافة منطق التحقق من الصلاحيات
	// بناءً على requiredRole

	return <>{children}</>;
}
