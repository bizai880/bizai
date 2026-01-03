export type AIProvider = "groq" | "gemini" | "local" | "huggingface";

export interface AIModelConfig {
	name: string;
	provider: AIProvider;
	maxTokens: number;
	costPerToken?: number;
	supportsArabic: boolean;
	fallbackOrder: number;
}

export interface AIRequest {
	prompt: string;
	systemPrompt?: string;
	temperature?: number;
	maxTokens?: number;
	language?: string;
}

export interface AIResponse {
	content: string;
	modelUsed: string;
	provider: AIProvider;
	tokensUsed: number;
	processingTime: number;
	success: boolean;
	error?: string;
}

export interface AITemplateAnalysis {
	type: "excel" | "dashboard" | "tracking";
	columns: Array<{
		name: string;
		type: "text" | "number" | "date" | "boolean";
		formula?: string;
	}>;
	sheets: string[];
	charts?: Array<{
		type: "bar" | "line" | "pie";
		dataRange: string;
		title: string;
	}>;
	metadata: Record<string, unknown>;
}

export interface CubeMetadata {
	id: string;
	name: string;
	description: string;
	version: string;
	author: string;
	category: "vision" | "nlp" | "data" | "integration" | "custom";
	tags: string[];
	inputSchema: Record<string, unknown>;
	outputSchema: Record<string, unknown>;
	price: number;
	usageLimit: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CubeExecutionInput {
	cubeId: string;
	data: unknown;
	options?: {
		cache?: boolean;
		timeout?: number;
		priority?: "low" | "normal" | "high";
	};
}

export interface CubeExecutionResult {
	cubeId?: string;
	success: boolean;
	data?: unknown;
	error?: string;
	executionTime: number;
	cached: boolean;
}
