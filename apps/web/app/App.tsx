"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Analytics } from "@/components/analytics/Analytics";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import Footer from "@/components/layout/Footer";
import MainNav from "@/components/layout/MainNav";
import { LoadingProvider } from "@/components/loading/LoadingProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";
import { AdvancedImage } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import type React from "react";
import { AIOrchestrator } from "@/lib/ai/orchestrator";

const orchestrator = new AIOrchestrator();

// بناء نظام باستخدام المكعبات
const system = await orchestrator.orchestrateCubes({
	description: "أريد نظام متابعة موظفين مع كشف الوجه وتحليل الإنتاجية",
	systemType: "employee_tracking",
	options: {
		useCache: true,
		priority: "high",
	},
});

if (system.success) {
	console.log("✅ النظام تم بناؤه بنجاح");
	console.log("المكعبات المستخدمة:", system.cubesUsed);
	console.log("وقت التنفيذ:", system.totalExecutionTime);
	console.log("الاقتراحات:", system.suggestions);

	// حفظ النظام في قاعدة البيانات
	await saveSystemToDatabase(system.system);

	// توليد Excel
	const excelResult = await generateExcel(system.system);

	// إظهار النتيجة للمستخدم
	showResultToUser(excelResult);
}

const App = () => {
	const cld = new Cloudinary({ cloud: { cloudName: "dsdwgrcyf" } });

	// Use this sample image or upload your own via the Media Library
	const img = cld
		.image("cld-sample-5")
		.format("auto") // Optimize delivery by resizing and applying auto-format and auto-quality
		.quality("auto")
		.resize(auto().gravity(autoGravity()).width(500).height(500)); // Transform the image: auto-crop to square aspect_ratio

	return <AdvancedImage cldImg={img} />;
};

export default function App({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// التحقق من الجلسة
		const checkSession = async () => {
			try {
				const response = await fetch("/api/auth/session", {
					credentials: "include",
				});

				if (!response.ok && pathname?.startsWith("/dashboard")) {
					router.push("/auth/login");
				}
			} catch (error) {
				console.error("Session check error:", error);
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();
	}, [router, pathname]);

	// صفحات لا تحتاج إلى layout كامل
	const minimalPages = [
		"/auth/login",
		"/auth/register",
		"/auth/forgot-password",
	];
	const isMinimalPage = minimalPages.some((page) => pathname?.startsWith(page));

	if (isLoading) {
		return (
			<html lang="ar" dir="rtl">
				<body
					style={{
						margin: 0,
						padding: 0,
						fontFamily: "'IBM Plex Sans Arabic', 'Inter', sans-serif",
					}}
				>
					<div
						style={{
							minHeight: "100vh",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "var(--background)",
							color: "var(--text-primary)",
						}}
					>
						<div style={{ textAlign: "center" }}>
							<div
								style={{
									width: "4rem",
									height: "4rem",
									border: "4px solid var(--primary)",
									borderTop: "4px solid transparent",
									borderRadius: "50%",
									animation: "spin 1s linear infinite",
									margin: "0 auto 1rem",
								}}
							/>
							<p style={{ color: "var(--text-secondary)" }}>جاري التحميل...</p>
						</div>
					</div>
				</body>
			</html>
		);
	}

	return (
		<html lang="ar" dir="rtl" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap&subset=arabic"
					rel="stylesheet"
				/>
				<style>{`
          :root {
            --font-inter: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            --font-arabic: 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
			</head>
			<body
				style={{
					margin: 0,
					padding: 0,
					fontFamily: "'IBM Plex Sans Arabic', 'Inter', sans-serif",
					backgroundColor: "var(--background)",
					color: "var(--text-primary)",
					fontFeatureSettings: '"calt", "liga", "clig", "kern"',
					WebkitFontSmoothing: "antialiased",
					MozOsxFontSmoothing: "grayscale",
				}}
			>
				<ErrorBoundary>
					<ThemeProvider>
						<LoadingProvider>
							<AuthProvider>
								<NotificationProvider>
									<Analytics />

									{!isMinimalPage && <MainNav />}

									<main
										style={
											isMinimalPage
												? {}
												: { paddingTop: "4rem", minHeight: "100vh" }
										}
									>
										{children}
									</main>

									{!isMinimalPage && <Footer />}

									<Toaster
										position="top-center"
										toastOptions={{
											duration: 4000,
											style: {
												background: "var(--background-card)",
												border: "1px solid var(--border)",
												color: "var(--text-primary)",
												backdropFilter: "blur(10px)",
												borderRadius: "var(--radius-md)",
												padding: "var(--spacing-md)",
												fontSize: "0.875rem",
											},
										}}
									/>
								</NotificationProvider>
							</AuthProvider>
						</LoadingProvider>
					</ThemeProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}
