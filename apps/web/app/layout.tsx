// apps/web/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';

// ⭐ تكوين الخطوط باستخدام next/font (الطريقة الصحيحة في Next.js 15)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true, // Reduce CLS
});

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['Tahoma', 'Arial'],
  adjustFontFallback: true, // Prevents CLS
});

// Preload critical fonts
export const metadata = {
  title: 'BizAI Factory - منصة أنظمة الأعمال الذكية',
  description: 'منصة متكاملة لتحويل الأوصاف النصية إلى أنظمة أعمال كاملة',
  keywords: ['ذكاء اصطناعي', 'أنظمة أعمال', 'أتمتة', 'تحليل بيانات'],
  authors: [{ name: 'BizAI Factory' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://bizaifactory.com',
    title: 'BizAI Factory - منصة أنظمة الأعمال الذكية',
    description: 'منصة متكاملة لتحويل الأوصاف النصية إلى أنظمة أعمال كاملة',
    siteName: 'BizAI Factory',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizAI Factory - منصة أنظمة الأعمال الذكية',
    description: 'منصة متكاملة لتحويل الأوصاف النصية إلى أنظمة أعمال كاملة',
  other: {
    'font-display': 'swap',
  },
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
      className={`${inter.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* التحقق من SEO */}
        <meta name="google-site-verification" content="your-verification-code" />
        <meta name="msvalidate.01" content="your-bing-code" />
      </head>
      <body className={`${cairo.className} antialiased bg-background text-foreground`}>
        {/* يمكنك إضافة Providers هنا إذا احتجت */}
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* يمكن إضافة فوتر ثابت هنا */}
        {/* <Footer /> */}
      </body>
    </html>
  );
}