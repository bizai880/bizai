import type {
	CubeExecutionInput,
	CubeExecutionResult,
	CubeMetadata,
} from "@bizai/shared";
import Redis from "ioredis";
import type { BaseCube } from "./BaseCube";

export class CubeManager {
	private cubes: Map<string, BaseCube> = new Map();
	private redis: Redis;

	constructor() {
		this.redis = new Redis(process.env.REDIS_URL);
	}

	async registerCube(cube: BaseCube): Promise<void> {
		await cube.initialize();
		this.cubes.set(cube.metadata.id, cube);

		// تخزين في Redis للموازنة
		await this.redis.hset(
			"cubes:registry",
			cube.metadata.id,
			JSON.stringify(cube.metadata),
		);

		console.log(
			`✅ Cube registered: ${cube.metadata.name} (${cube.metadata.id})`,
		);
	}

	async getCube(cubeId: string): Promise<BaseCube | null> {
		if (this.cubes.has(cubeId)) {
			return this.cubes.get(cubeId)!;
		}

		// محاولة تحميل من المخزن المؤقت
		const cubeData = await this.redis.get(`cube:${cubeId}`);
		if (cubeData) {
			// يمكن تحميل المكعب ديناميكياً
			console.log(`⚠️ Cube ${cubeId} loaded from cache`);
		}

		return null;
	}

	async executeCube(input: CubeExecutionInput): Promise<CubeExecutionResult> {
		const cube = await this.getCube(input.cubeId);
		if (!cube) {
			return {
				success: false,
				error: `Cube not found: ${input.cubeId}`,
				executionTime: 0,
				cached: false,
			};
		}

		// التحقق من الحدود
		const usageKey = `usage:${input.cubeId}:${new Date().toISOString().slice(0, 10)}`;
		const usage = await this.redis.incr(usageKey);

		if (usage > cube.metadata.usageLimit) {
			return {
				success: false,
				error: "Usage limit exceeded",
				executionTime: 0,
				cached: false,
			};
		}

		// التنفيذ
		return await cube.execute(input);
	}

	async discoverCubes(category?: string): Promise<CubeMetadata[]> {
		const cubeIds = await this.redis.hkeys("cubes:registry");
		const cubes: CubeMetadata[] = [];

		for (const cubeId of cubeIds) {
			const cubeData = await this.redis.hget("cubes:registry", cubeId);
			if (cubeData) {
				const metadata = JSON.parse(cubeData);
				if (!category || metadata.category === category) {
					cubes.push(metadata);
				}
			}
		}

		return cubes;
	}
}
