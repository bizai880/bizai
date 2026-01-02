export function getSession() {
	return {
		user: { id: "1", name: "Admin", email: "admin@example.com" },
		expires: "2024-12-31",
	};
}

export function requireAuth() {
	return true;
}

export function hasPermission(permission: string) {
	return true;
}
