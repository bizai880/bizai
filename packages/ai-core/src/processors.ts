// AI Processors
export interface AIRequest {
	prompt: string;
	model?: string;
	temperature?: number;
}

export interface AIResponse {
	text: string;
	tokens: number;
	model: string;
}
