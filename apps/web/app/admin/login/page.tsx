// apps/web/app/admin/login/page.tsx
"use client";

import { AlertTriangle, Eye, EyeOff, Lock, LogIn, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect") || "/admin";

	useEffect(() => {
		// التحقق من حالة تسجيل الدخول عبر الـ API
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/admin/login", {
					method: "GET",
					credentials: "include", // مهم: لإرسال الكوكيز
				});

				if (response.ok) {
					const data = await response.json();
					if (data.authenticated) {
						router.push("/admin");
					}
				}
			} catch (_err) {
				console.log("Not authenticated or error checking auth");
			} finally {
				setIsCheckingAuth(false);
			}
		};

		checkAuth();
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("/api/admin/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
				credentials: "include", // ⭐ مهم: لإرسال واستقبال الكوكيز
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "فشل تسجيل الدخول");
			}

			// ✅ التوكن الآن في الكوكيز (HttpOnly)، لا نحتاج لحفظه في localStorage
			// ✅ معلومات المستخدم الأساسية أيضاً في كوكيز غير HttpOnly

			// إعادة التوجيه إلى لوحة التحكم
			router.push(redirect);
		} catch (err: any) {
			setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
			console.error("Login error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await fetch("/api/admin/login", {
				method: "DELETE",
				credentials: "include",
			});
			router.push("/admin/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	// عرض شاشة تحميل أثناء التحقق من المصادقة
	if (isCheckingAuth) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600 dark:text-gray-400">
						جاري التحقق من الجلسة...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
			<div className="w-full max-w-md">
				{/* Card */}
				<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
							<Shield className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
							تسجيل دخول المدير
						</h1>
						<p className="text-gray-600 dark:text-gray-300">
							مساحة إدارة النظام والتحكم الشامل
						</p>
					</div>

					{/* Warning Alert */}
					<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
						<div className="flex items-center">
							<AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 ml-2" />
							<span className="text-yellow-700 dark:text-yellow-300 font-medium">
								هذه الصفحة مخصصة للمديرين والمشرفين فقط
							</span>
						</div>
					</div>

					{/* Error Message */}
					{error && (
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
							<div className="flex items-center">
								<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 ml-2" />
								<span className="text-red-700 dark:text-red-300 font-medium">
									{error}
								</span>
							</div>
						</div>
					)}

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								البريد الإلكتروني
							</label>
							<div className="relative">
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
									placeholder="admin@example.com"
									required
									disabled={isLoading}
								/>
								<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<Shield className="w-5 h-5 text-gray-400 dark:text-gray-500" />
								</div>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								كلمة المرور
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-4 py-3 pl-12 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
									placeholder="••••••••"
									required
									disabled={isLoading}
								/>
								<div className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
								</div>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
									disabled={isLoading}
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="remember"
									className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:ring-2"
									disabled={isLoading}
								/>
								<label
									htmlFor="remember"
									className="ml-2 text-sm text-gray-600 dark:text-gray-400"
								>
									تذكر هذا الجهاز
								</label>
							</div>

							{/* رابط لاستعادة كلمة المرور */}
							<button
								type="button"
								onClick={() => router.push("/admin/forgot-password")}
								className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
								disabled={isLoading}
							>
								نسيت كلمة المرور؟
							</button>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<div className="flex items-center justify-center">
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
									جاري تسجيل الدخول...
								</div>
							) : (
								<>
									<LogIn className="w-5 h-5 inline ml-2" />
									تسجيل الدخول
								</>
							)}
						</button>
					</form>

					{/* Admin Help Section */}
					<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
						<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							للمساعدة الفنية:
						</h3>
						<ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
							<li>• تأكد من استخدام بريد مدير مسجل في النظام</li>
							<li>• تواصل مع الدعم الفني إذا نسيت بيانات الدخول</li>
							<li>• جميع محاولات الدخول مسجلة لأغراض الأمان</li>
						</ul>
					</div>

					{/* Back to Main Site */}
					<div className="text-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
						<p className="text-gray-600 dark:text-gray-400">
							<Link
								href="/"
								className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
							>
								العودة إلى الموقع الرئيسي
							</Link>
						</p>
					</div>
				</div>

				{/* Security Notes */}
				<div className="mt-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						<Shield className="w-4 h-4 inline ml-1" />
						جميع الأنشطة مسجلة ومراقبة لأغراض الأمان
					</p>
					{/* Logout Button for Testing */}
					<button
						onClick={handleLogout}
						className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
					>
						تسجيل الخروج من جميع الأجهزة
					</button>
				</div>
			</div>
		</div>
	);
}
