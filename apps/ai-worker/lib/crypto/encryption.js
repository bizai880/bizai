Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.generateToken = generateToken;
function verifyToken(token, _secret) {
	// تنفيذ مبسط للتحقق من التوكن
	console.log("Verifying token with secret:", `${secret.substring(0, 10)}...`);
	// محاكاة التحقق من التوكن
	if (token === "invalid-token") {
		throw new Error("Invalid token");
	}
	return {
		userId: "user-123",
		email: "user@example.com",
		role: "user",
	};
}
function generateToken(payload, _secret) {
	return "token-".concat(Date.now(), "-").concat(payload.userId);
}
