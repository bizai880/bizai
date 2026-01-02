// Utility functions for @bizai/shared

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

/**
 * Generate a random ID
 */
export function generateId(): string {
	return Math.random().toString(36).substr(2, 9);
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
	return value === null || value === undefined || value === "";
}
