import { ModelHubClient } from "@bizai/modelhub";

export class CubeProcessor {
	private modelHub: ModelHubClient;

	constructor() {
		this.modelHub = new ModelHubClient(process.env.MODELHUB_URL);
	}

	async processCube(cubeId: string, input: unknown) {
		// إرسال طلب معالجة إلى ModelHub
		return await this.modelHub.executeCube(cubeId, input);
	}

	async trainCube(cubeId: string, trainingData: unknown) {
		// تدريب مكعب مخصص
		return await this.modelHub.trainCube(cubeId, trainingData);
	}
}
