export interface TokenPayload {
	userId: string;
	email?: string;
	role?: string;
	exp?: number;
	iat?: number;
}

export function verifyToken(token: string, _secret: string): TokenPayload {
	console.log("Verifying token...");

	// Simple mock implementation
	if (token === "invalid" || !token) {
		throw new Error("Invalid token");
	}

	return {
		userId: "user-123",
		email: "user@example.com",
		role: "user",
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + 3600,
	};
}

export function generateToken(payload: TokenPayload, _secret: string): string {
	return `mock-token-${Date.now()}`;
}
