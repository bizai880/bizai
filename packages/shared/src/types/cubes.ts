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
	success: boolean;
	data?: unknown;
	error?: string;
	executionTime: number;
	cached: boolean;
}
