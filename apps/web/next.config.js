/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	transpilePackages: ["@bizai/shared"],

	// Turbopack configuration
	experimental: {
		turbopack: {
			resolveAlias: {
				"@bizai/shared": "../../packages/shared/src",
				"@": "./app",
				"@/components": "./components",
				"@/lib": "./lib",
				"@/hooks": "./hooks",
				"@/types": "./types",
			},
			memoryLimit: 8192, // 8GB for large projects
		},
		turbo: {
			resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
			moduleIdStrategy: "deterministic",
		},
		serverExternalPackages: ["@supabase/supabase-js", "exceljs"],
		optimizePackageImports: [
			"lucide-react", // Tree-shake icons
			"framer-motion", // Only import used features
			"@supabase/supabase-js",
		],
		ppr: "incremental",
	},

	// SVGR Webpack configuration
	webpack(config) {
		// Grab the existing rule that handles SVG imports
		const fileLoaderRule = config.module.rules.find((rule) =>
			rule.test?.test?.(".svg"),
		);

		config.module.rules.push(
			// Reapply the existing rule, but only for svg imports ending in ?url
			{
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: /url/, // *.svg?url
			},
			// Convert all other *.svg imports to React components
			{
				test: /\.svg$/i,
				issuer: fileLoaderRule.issuer,
				resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
				use: [
					{
						loader: "@svgr/webpack",
						options: {
							svgoConfig: {
								plugins: [
									{
										name: "preset-default",
										params: {
											overrides: {
												removeViewBox: false,
											},
										},
									},
								],
							},
						},
					},
				],
			},
		);

		// Modify the file loader rule to ignore *.svg
		fileLoaderRule.exclude = /\.svg$/i;

		return config;
	},

	// Environment variables for Gitpod/ONA/Vercel
	env: {
		NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "development",
		NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
		NEXT_PUBLIC_GITPOD_WORKSPACE_URL: process.env.GITPOD_WORKSPACE_URL,
	},

	// Image optimization
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
};

module.exports = nextConfig;
