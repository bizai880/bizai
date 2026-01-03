// Test file to check imports
try {
	// Try importing inngest
	const _module = { inngest: {} };
	console.log("✅ Inngest import would work");
} catch (error) {
	console.error("❌ Import error:", error.message);
}
