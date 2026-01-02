import {
	CubeExecutionInput,
	CubeExecutionResult,
	CubeMetadata,
} from "@bizai/shared";

export class ModelHubClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	async healthCheck(): Promise<{ status: string }> {
		const response = await fetch(`${this.baseUrl}/health`);
		return response.json();
	}

	async getAvailableCubes(): Promise<CubeMetadata[]> {
		const response = await fetch(`${this.baseUrl}/api/v1/cubes`);
		return response.json();
	}

	async executeCube(input: CubeExecutionInput): Promise<CubeExecutionResult> {
		const response = await fetch(`${this.baseUrl}/api/v1/cubes/execute`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			throw new Error(`ModelHub API error: ${response.status}`);
		}

		return response.json();
	}

	async getCube(cubeId: string): Promise<CubeMetadata> {
		const response = await fetch(`${this.baseUrl}/api/v1/cubes/${cubeId}`);
		return response.json();
	}

	async discoverCubes(category?: string): Promise<CubeMetadata[]> {
		const url = category
			? `${this.baseUrl}/api/v1/cubes/discover?category=${category}`
			: `${this.baseUrl}/api/v1/cubes/discover`;

		const response = await fetch(url);
		return response.json();
	}
}
