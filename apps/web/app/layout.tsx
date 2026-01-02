// apps/web/app/layout.tsx
import type { Metadata } from "next";
import { Cairo, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const cairo = Cairo({
	subsets: ["arabic", "latin"],
	variable: "--font-cairo",
	display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
	subsets: ["arabic", "latin"],
	variable: "--font-noto-sans-arabic",
	display: "swap",
});

export const metadata: Metadata = {
	title: "BizAI Builder - منصة بناء أنظمة الأعمال الذكية",
	description:
		"منصة واحدة تجمع بين قوة الذكاء الاصطناعي المعياري وسهولة بناء أنظمة الأعمال",
	keywords: [
		"ذكاء اصطناعي",
		"أنظمة أعمال",
		"مكعبات ذكية",
		"Excel",
		"تحليلات",
		"BizAI",
	],
	authors: [{ name: "BizAI Team" }],
	creator: "BizAI Builder",
	publisher: "BizAI Factory",
	robots: "index, follow",
	viewport: "width=device-width, initial-scale=1, maximum-scale=5",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
	],
	openGraph: {
		type: "website",
		locale: "ar_SA",
		url: "https://bizai-builder.com",
		title: "BizAI Builder - منصة بناء أنظمة الأعمال الذكية",
		description:
			"منصة واحدة تجمع بين قوة الذكاء الاصطناعي المعياري وسهولة بناء أنظمة الأعمال",
		siteName: "BizAI Builder",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "BizAI Builder",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "BizAI Builder - منصة بناء أنظمة الأعمال الذكية",
		description:
			"منصة واحدة تجمع بين قوة الذكاء الاصطناعي المعياري وسهولة بناء أنظمة الأعمال",
		images: ["/og-image.png"],
		creator: "@bizaibuilder",
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon-16x16.png",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="ar"
			dir="rtl"
			className={`${cairo.variable} ${notoSansArabic.variable}`}
			suppressHydrationWarning
		>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" sizes="any" />
				{/* دعم المتصفحات القديمة */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
					}}
				/>
			</head>
			<body className="min-h-screen bg-background font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster
						position="top-center"
						richColors
						closeButton
						dir="rtl"
						toastOptions={{
							className: "rtl:text-right",
							duration: 5000,
						}}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
