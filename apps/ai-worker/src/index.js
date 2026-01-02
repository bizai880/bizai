Object.defineProperty(exports, "__esModule", { value: true });
// AI Worker Main File
console.log("🚀 AI Worker API starting...");
// تصدير API للاستخدام الخارجي
var api_1 = require("./api");
exports.default = api_1.default;
// تشغيل الخادم إذا لم يكن في وضع استيراد
if (require.main === module) {
	var express = require("express");
	var app = express();
	var PORT_1 = process.env.PORT || 3001;
	app.use(express.json());
	app.use("/api", api_1.default.createApiRouter());
	app.get("/", (req, res) => {
		res.json({
			service: "ai-worker-api",
			status: "running",
			version: "1.0.0",
			timestamp: new Date().toISOString(),
		});
	});
	app.listen(PORT_1, () => {
		console.log("\u2705 AI Worker API running on port ".concat(PORT_1));
		console.log(
			"\uD83D\uDCE1 Health check: http://localhost:".concat(
				PORT_1,
				"/api/health",
			),
		);
	});
}
