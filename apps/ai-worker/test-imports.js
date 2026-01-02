"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("./lib/ai/core");
var health_1 = require("./src/health");
var encryption_1 = require("./lib/crypto/encryption");
console.log("✅ All imports working!");
console.log("AI Core:", typeof core_1.aicore);
console.log("Health function:", typeof health_1.getHealthStatus);
console.log("Verify token:", typeof encryption_1.verifyToken);
