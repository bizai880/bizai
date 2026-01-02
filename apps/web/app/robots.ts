import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bizaifactory.com";

	return {
		rules: {
			userAgent: "*",
			allow: [
				"/",
				"/about",
				"/pricing",
				"/features",
				"/contact",
				"/docs",
				"/legal/terms",
				"/legal/privacy",
			],
			disallow: [
				"/admin/",
				"/dashboard/",
				"/api/",
				"/auth/",
				"/_next/",
				"/static/",
			],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
		host: baseUrl,
	};
}
