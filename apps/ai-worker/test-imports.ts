import { aicore } from "./lib/ai/core";
import { verifyToken } from "./lib/crypto/encryption";
import { getHealthStatus } from "./src/health";

console.log("✅ All imports working!");
console.log("AI Core:", typeof aicore);
console.log("Health function:", typeof getHealthStatus);
console.log("Verify token:", typeof verifyToken);
