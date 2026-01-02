import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "مصمم المكعبات الذكية - BizAI Builder",
	description: "صمم ونفذ مكعبات ذكاء اصطناعي قابلة لإعادة الاستخدام في منصتك",
};

export default function CubeBuilderLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
	);
}
