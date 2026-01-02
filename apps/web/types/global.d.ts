// تعريفات TypeScript العالمية
declare module "*.css" {
	const content: { [className: string]: string };
	export default content;
}

declare module "*.scss" {
	const content: { [className: string]: string };
	export default content;
}

declare module "*.svg" {
	import React from "react";
	const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
	export default ReactComponent;
}

// تعريفات لـ Next.js 15.5.9
declare module "next/navigation" {
	export * from "next/dist/client/components/navigation";
}

// تعريفات للبيئة
declare namespace NodeJS {
	interface ProcessEnv {
		JWT_SECRET: string;
		NEXT_PUBLIC_SUPABASE_URL: string;
		NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
		SUPABASE_SERVICE_ROLE_KEY: string;
		DATABASE_URL: string;
		NEXTAUTH_URL: string;
	}
}
