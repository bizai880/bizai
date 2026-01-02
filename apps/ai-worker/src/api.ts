// API Module - Fixed with correct imports
import { Request, Response } from "express";

// Correct imports - use relative paths
import { getHealthStatus } from "./health/index";
import { aicore } from "../lib/ai/core";
import { verifyToken } from "../lib/crypto/encryption";

// Type definitions
interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	statusCode: number;
}

interface AuthRequest extends Request {
	user?: any;
	token?: string;
}

// Error handling
export function handleError(error: unknown): ApiResponse {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const statusCode = errorMessage.includes("Invalid token") ? 401 : 500;

	return {
		success: false,
		error: errorMessage,
		statusCode,
	};
}

// Success response
export function successResponse<T>(
	data: T,
	statusCode: number = 200,
): ApiResponse<T> {
	return {
		success: true,
		data,
		statusCode,
	};
}

// Health check endpoint
export async function healthCheck(): Promise<ApiResponse> {
	try {
		const health = await getHealthStatus();
		return successResponse(health);
	} catch (error) {
		return handleError(error);
	}
}

// AI processing
export async function processAIRequest(prompt: string): Promise<ApiResponse> {
	try {
		if (!prompt || prompt.trim().length === 0) {
			return handleError(new Error("Prompt is required"));
		}

		const response = await aicore.generateText({
			prompt,
			model: "gpt-3.5-turbo",
			temperature: 0.7,
			maxTokens: 1000,
		});

		if (!response.success) {
			return handleError(new Error(response.error || "AI processing failed"));
		}

		return successResponse({
			result: response.data,
			usage: response.usage,
		});
	} catch (error) {
		return handleError(error);
	}
}

// Authentication middleware
export async function authenticate(
	req: AuthRequest,
	res: Response,
	next: () => void,
) {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader?.split(" ")[1];

		if (!token) {
			const response = handleError(new Error("Token required"));
			res.status(response.statusCode).json(response);
			return;
		}

		const secret = process.env.JWT_SECRET || "default-secret";
		const user = verifyToken(token, secret);
		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		const response = handleError(error);
		res.status(response.statusCode).json(response);
	}
}

// Create API router
export function createApiRouter() {
	const express = require("express");
	const router = express.Router();

	// Health endpoint
	router.get("/health", async (req: Request, res: Response) => {
		const response = await healthCheck();
		res.status(response.statusCode).json(response);
	});

	// AI endpoint
	router.post("/ai/process", async (req: Request, res: Response) => {
		const { prompt } = req.body;
		const response = await processAIRequest(prompt);
		res.status(response.statusCode).json(response);
	});

	// Protected endpoint example
	router.get(
		"/protected",
		async (req: Request, res: Response, next: () => void) => {
			await authenticate(req as AuthRequest, res, next);

			if (res.headersSent) return;

			res.json(
				successResponse({
					message: "Access granted",
					user: (req as AuthRequest).user,
				}),
			);
		},
	);

	return router;
}

// Default export
const api = {
	handleError,
	successResponse,
	healthCheck,
	processAIRequest,
	authenticate,
	createApiRouter,
};

export default api;
