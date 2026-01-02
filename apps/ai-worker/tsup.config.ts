import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	minify: process.env.NODE_ENV === "production",
	treeshake: true,
	external: ["express", "redis", "@supabase/supabase-js"],
	noExternal: ["@bizai/shared"],
	esbuildOptions(options) {
		options.define = {
			"process.env.NODE_ENV": JSON.stringify(
				process.env.NODE_ENV || "development",
			),
		};
	},
	outExtension({ format }) {
		return {
			js: format === "cjs" ? ".js" : ".mjs",
		};
	},
});
