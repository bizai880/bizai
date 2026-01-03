import type {
	CubeExecutionInput,
	CubeExecutionResult,
	CubeMetadata,
} from "@bizai/shared";

export abstract class BaseCube {
	public metadata: CubeMetadata;
	protected cache: Map<string, unknown> = new Map();

	constructor(metadata: Partial<CubeMetadata>) {
		this.metadata = {
			id: metadata.id || `cube_${Date.now()}`,
			name: metadata.name || "Unnamed Cube",
			description: metadata.description || "",
			version: metadata.version || "1.0.0",
			author: metadata.author || "Anonymous",
			category: metadata.category || "custom",
			tags: metadata.tags || [],
			inputSchema: metadata.inputSchema || {},
			outputSchema: metadata.outputSchema || {},
			price: metadata.price || 0,
			usageLimit: metadata.usageLimit || 1000,
			isActive: metadata.isActive ?? true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	}

	abstract initialize(): Promise<void>;
	abstract process(input: unknown): Promise<unknown>;

	async execute(input: CubeExecutionInput): Promise<CubeExecutionResult> {
		const startTime = Date.now();
		let _cached = false;

		try {
			// التحقق من وجود تخزين مؤقت
			const cacheKey = this.generateCacheKey(input.data);
			if (input.options?.cache && this.cache.has(cacheKey)) {
				cached = true;
				return {
					success: true,
					data: this.cache.get(cacheKey),
					executionTime: Date.now() - startTime,
					cached: true,
				};
			}

			// التحقق من الصحة
			this.validateInput(input.data);

			// التنفيذ
			const result = await this.process(input.data);

			// التخزين المؤقت
			if (input.options?.cache) {
				this.cache.set(cacheKey, result);
			}

			return {
				success: true,
				data: result,
				executionTime: Date.now() - startTime,
				cached: false,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				executionTime: Date.now() - startTime,
				cached: false,
			};
		}
	}

	protected validateInput(data: unknown): void {
		// التحقق الأساسي - يمكن توسيعها
		if (!data) {
			throw new Error("Input data is required");
		}
	}

	protected generateCacheKey(data: unknown): string {
		return JSON.stringify(data);
	}
}
