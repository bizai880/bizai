export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
	// At least 8 characters, one letter and one number
	const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
	return passwordRegex.test(password);
}

export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/[<>]/g, "") // Remove < and >
		.replace(/\s+/g, " ") // Normalize whitespace
		.substring(0, 1000); // Limit length
}

export function validateObject<T>(
	obj: any,
	schema: Record<string, (value: any) => boolean>,
): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	for (const [key, validator] of Object.entries(schema)) {
		if (!validator(obj[key])) {
			errors.push(`Invalid value for ${key}`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}
