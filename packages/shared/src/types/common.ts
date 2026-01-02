export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	page: number;
	limit: number;
	total: number;
	hasMore: boolean;
}

export interface User {
	id: string;
	email: string;
	name?: string;
	createdAt: Date;
	updatedAt?: Date;
}

export interface AuthToken {
	token: string;
	expiresAt: Date;
	userId: string;
}

export interface ErrorResponse {
	code: string;
	message: string;
	details?: any;
}
