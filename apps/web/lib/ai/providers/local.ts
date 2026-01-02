import type { AIRequest, AIResponse } from "@bizai/shared";

export class LocalAIProvider {
	private baseUrl: string;
	private model: string;

	constructor() {
		this.baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
		this.model = process.env.LOCAL_MODEL || "llama3:8b";
	}

	async generate(request: AIRequest): Promise<Omit<AIResponse, "provider">> {
		const startTime = Date.now();

		try {
			const response = await fetch(`${this.baseUrl}/api/generate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: this.model,
					prompt: this.formatPrompt(request),
					system: request.systemPrompt || "You are a helpful assistant.",
					stream: false,
					options: {
						temperature: request.temperature || 0.7,
						num_predict: request.maxTokens || 1000,
					},
				}),
				timeout: 60000, // 60 ثانية كحد أقصى
			});

			if (!response.ok) {
				throw new Error(`LocalAI error: ${response.statusText}`);
			}

			const data = await response.json();
			const endTime = Date.now();

			return {
				content: data.response,
				modelUsed: this.model,
				tokensUsed: data.eval_count || 0,
				processingTime: endTime - startTime,
				success: true,
			};
		} catch (error) {
			console.error("LocalAI provider error:", error);
			throw new Error(`LocalAI failed: ${error.message}`);
		}
	}

	private formatPrompt(request: AIRequest): string {
		let prompt = "";

		if (request.language === "ar") {
			prompt += `باللغة العربية:\n\n`;
		}

		prompt += request.prompt;

		if (request.systemPrompt) {
			prompt = `${request.systemPrompt}\n\n${prompt}`;
		}

		return prompt;
	}

	async isAvailable(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/api/tags`, {
				method: "GET",
				timeout: 3000,
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async getAvailableModels(): Promise<string[]> {
		try {
			const response = await fetch(`${this.baseUrl}/api/tags`);
			const data = await response.json();
			return data.models?.map((m: any) => m.name) || [];
		} catch {
			return [];
		}
	}
}
