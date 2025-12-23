import { ApiResponse, PaginatedResponse } from '../types/common';

export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    statusCode
  };
}

export function errorResponse(
  error: string,
  statusCode: number = 500,
  details?: any
): ApiResponse {
  return {
    success: false,
    error,
    statusCode,
    ...(details && { details })
  };
}

export function paginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): PaginatedResponse<T> {
  return {
    success: true,
    data: items,
    message,
    statusCode: 200,
    page,
    limit,
    total,
    hasMore: page * limit < total
  };
}

export function notFoundResponse(resource: string): ApiResponse {
  return errorResponse(`${resource} not found`, 404);
}

export function unauthorizedResponse(message: string = 'Unauthorized'): ApiResponse {
  return errorResponse(message, 401);
}

export function badRequestResponse(message: string): ApiResponse {
  return errorResponse(message, 400);
}
