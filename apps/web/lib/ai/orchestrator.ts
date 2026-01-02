import {
	AIRequest,
	AIResponse,
	AIProvider,
	AIModelConfig,
	CubeMetadata,
	CubeExecutionInput,
	CubeExecutionResult,
} from "@bizai/shared";
import { GroqProvider } from "./providers/groq";
import { GeminiProvider } from "./providers/gemini";
import { LocalAIProvider } from "./providers/local";
import { HuggingFaceProvider } from "./providers/huggingface";
import { ModelHubClient } from "./providers/modelhub";
import { SalesOutlookAutomationCube } from "@bizai/modelhub";

async function runSalesAutomation() {
	const cube = new SalesOutlookAutomationCube();
	await cube.initialize();

	const input = {
		excelFile: "/path/to/Advanced Sales Admin Tracker.xlsx",
		emailConfig: {
			senderEmail: process.env.SALES_EMAIL,
			senderName: "Sales Automation System",
			smtpServer: process.env.SMTP_SERVER,
			smtpPort: parseInt(process.env.SMTP_PORT || "587"),
			smtpUsername: process.env.SMTP_USERNAME,
			smtpPassword: process.env.SMTP_PASSWORD,
			useSSL: true,
		},
		recipients: {
			salesAdmin: "sales.admin@company.com",
			salesEngineer: "sales.engineer@company.com",
			manager: "sales.manager@company.com",
			salesTeam: [
				"team1@company.com",
				"team2@company.com",
				"team3@company.com",
			],
		},
		options: {
			checkInterval: "daily",
			workingDays: [0, 1, 2, 3, 4], // الأحد إلى الخميس
			timezone: "Asia/Riyadh",
		},
	};

	const result = await cube.process(input);

	if (result.success) {
		console.log(`✅ Sent ${result.alertsSent} alerts successfully`);
		console.log("Summary:", result.summary);
		console.log("Next check:", result.nextCheck);
	} else {
		console.error("❌ Automation failed:", result.error);
	}
}
// أنواع جديدة للمكعبات
export interface CubeOrchestrationRequest {
	description: string;
	systemType: string;
	cubes?: string[];
	options?: {
		useCache?: boolean;
		timeout?: number;
		priority?: "low" | "normal" | "high";
	};
}

export interface CubeOrchestrationResult {
	success: boolean;
	system: {
		type: string;
		components: any[];
		cubesUsed: string[];
		workflow: any[];
	};
	cubes: CubeExecutionResult[];
	totalExecutionTime: number;
	suggestions?: string[];
}

export interface SystemRequirements {
	type: "tracking" | "dashboard" | "analytics" | "management" | "custom";
	category:
		| "hr"
		| "sales"
		| "inventory"
		| "education"
		| "healthcare"
		| "general";
	features: string[];
	cubes: {
		required: string[];
		recommended: string[];
	};
	outputFormat: "excel" | "web" | "mobile" | "api" | "all";
}

export class AIOrchestrator {
	private providers: Map<AIProvider, any>;
	private modelHub: ModelHubClient | null = null;
	private fallbackOrder: AIProvider[] = [
		"groq",
		"gemini",
		"huggingface",
		"local",
	];
	private isLocalAvailable = false;
	private cubeRegistry: Map<string, CubeMetadata> = new Map();
	private cubeCategories = new Map<string, string[]>();

	constructor() {
		this.providers = new Map();
		this.initializeProviders();
		this.initializeModelHub();
		this.initializeCubeRegistry();
		this.checkLocalAvailability();
	}

	private async initializeProviders() {
		// Initialize Groq
		if (process.env.GROQ_API_KEY) {
			this.providers.set("groq", new GroqProvider());
		}

		// Initialize Gemini
		if (process.env.GEMINI_API_KEY) {
			this.providers.set("gemini", new GeminiProvider());
		}

		// Initialize HuggingFace
		if (process.env.HUGGINGFACE_TOKEN) {
			this.providers.set("huggingface", new HuggingFaceProvider());
		}

		// Initialize LocalAI/Ollama
		this.providers.set("local", new LocalAIProvider());
	}

	private async initializeModelHub() {
		try {
			if (process.env.MODELHUB_URL) {
				this.modelHub = new ModelHubClient(process.env.MODELHUB_URL);

				// اختبار الاتصال
				const health = await this.modelHub.healthCheck();
				if (health.status === "ok") {
					console.log("✅ ModelHub connected successfully");

					// تحميل المكعبات المتاحة
					await this.loadAvailableCubes();
				}
			}
		} catch (error) {
			console.warn("⚠️ ModelHub not available:", error.message);
		}
	}

	private async loadAvailableCubes() {
		if (!this.modelHub) return;

		try {
			const cubes = await this.modelHub.getAvailableCubes();
			cubes.forEach((cube) => {
				this.cubeRegistry.set(cube.id, cube);

				// تنظيم المكعبات حسب الفئة
				if (!this.cubeCategories.has(cube.category)) {
					this.cubeCategories.set(cube.category, []);
				}
				this.cubeCategories.get(cube.category)!.push(cube.id);
			});

			console.log(`📦 Loaded ${cubes.length} cubes from ModelHub`);
		} catch (error) {
			console.error("❌ Failed to load cubes:", error);
		}
	}

	private initializeCubeRegistry() {
		// مكعبات افتراضية حتى يتم الاتصال بـ ModelHub
		const defaultCubes: CubeMetadata[] = [
			{
				id: "face_recognition",
				name: "التعرف على الوجه",
				description: "التعرف على الوجوه والتحقق من الهوية",
				version: "1.0.0",
				author: "BizAI Team",
				category: "vision",
				tags: ["face", "recognition", "security"],
				inputSchema: {
					type: "object",
					properties: {
						image: { type: "string", description: "Base64 image or URL" },
						mode: { type: "string", enum: ["detect", "recognize", "compare"] },
					},
					required: ["image"],
				},
				outputSchema: {
					type: "object",
					properties: {
						faces: { type: "array" },
						count: { type: "number" },
					},
				},
				price: 0.01,
				usageLimit: 1000,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "sentiment_analysis",
				name: "تحليل المشاعر",
				description: "تحليل المشاعر في النصوص العربية والإنجليزية",
				version: "1.0.0",
				author: "BizAI Team",
				category: "nlp",
				tags: ["sentiment", "arabic", "analysis"],
				inputSchema: {
					type: "object",
					properties: {
						text: { type: "string" },
						language: { type: "string", enum: ["ar", "en"] },
					},
					required: ["text"],
				},
				outputSchema: {
					type: "object",
					properties: {
						sentiment: {
							type: "string",
							enum: ["positive", "negative", "neutral"],
						},
						confidence: { type: "number" },
						scores: { type: "object" },
					},
				},
				price: 0.001,
				usageLimit: 5000,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "data_forecasting",
				name: "التنبؤ بالبيانات",
				description: "التنبؤ بالقيم المستقبلية بناءً على البيانات التاريخية",
				version: "1.0.0",
				author: "BizAI Team",
				category: "data",
				tags: ["forecasting", "prediction", "analytics"],
				inputSchema: {
					type: "object",
					properties: {
						data: { type: "array", items: { type: "number" } },
						periods: { type: "number" },
						method: { type: "string", enum: ["arima", "prophet", "linear"] },
					},
					required: ["data", "periods"],
				},
				outputSchema: {
					type: "object",
					properties: {
						predictions: { type: "array" },
						accuracy: { type: "number" },
						chartData: { type: "object" },
					},
				},
				price: 0.005,
				usageLimit: 2000,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "excel_generator",
				name: "مولد Excel",
				description: "توليد ملفات Excel مع تنسيق وصيغ مخصصة",
				version: "1.0.0",
				author: "BizAI Team",
				category: "integration",
				tags: ["excel", "spreadsheet", "generator"],
				inputSchema: {
					type: "object",
					properties: {
						data: { type: "array" },
						template: { type: "string" },
						formulas: { type: "array" },
						charts: { type: "array" },
					},
					required: ["data"],
				},
				outputSchema: {
					type: "object",
					properties: {
						fileUrl: { type: "string" },
						fileSize: { type: "number" },
						sheets: { type: "array" },
					},
				},
				price: 0,
				usageLimit: 10000,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		defaultCubes.forEach((cube) => {
			this.cubeRegistry.set(cube.id, cube);

			if (!this.cubeCategories.has(cube.category)) {
				this.cubeCategories.set(cube.category, []);
			}
			this.cubeCategories.get(cube.category)!.push(cube.id);
		});
	}

	private async checkLocalAvailability() {
		try {
			const response = await fetch(
				`${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/tags`,
				{
					timeout: 3000,
				},
			);
			this.isLocalAvailable = response.ok;
		} catch {
			this.isLocalAvailable = false;
		}
	}

	// =============== الوظائف الأساسية للذكاء الاصطناعي ===============

	async process(request: AIRequest): Promise<AIResponse> {
		let lastError: Error | null = null;

		// Try providers in fallback order
		for (const providerName of this.fallbackOrder) {
			// Skip Local if not available
			if (providerName === "local" && !this.isLocalAvailable) {
				continue;
			}

			// Skip HuggingFace إذا لم يكن هناك توكن
			if (providerName === "huggingface" && !process.env.HUGGINGFACE_TOKEN) {
				continue;
			}

			const provider = this.providers.get(providerName);
			if (!provider) continue;

			try {
				console.log(`Trying ${providerName} provider...`);
				const response = await provider.generate(request);
				return {
					...response,
					provider: providerName,
					success: true,
				};
			} catch (error: any) {
				console.warn(`Provider ${providerName} failed:`, error.message);
				lastError = error;

				// Wait before next attempt
				if (providerName !== "local") {
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			}
		}

		// All providers failed
		throw new Error(
			`All AI providers failed. Last error: ${lastError?.message}`,
		);
	}

	async processWithCache(request: AIRequest): Promise<AIResponse> {
		// Create unique cache key for the request
		const cacheKey = this.generateCacheKey(request);

		// TODO: Implement actual cache retrieval
		// const cached = await cache.getAIResult<AIResponse>(cacheKey);
		// if (cached) {
		//   console.log('Cache hit for:', cacheKey);
		//   return { ...cached, cached: true };
		// }

		// If not in cache, process the request
		const result = await this.process(request);

		// TODO: Store result in Redis (1 hour)
		// await cache.setAIResult(cacheKey, { ...result, cached: false }, 3600);

		// TODO: Update usage statistics
		// await cache.incrementCounter(`ai_requests:${result.provider}`);

		return { ...result, cached: false };
	}

	private generateCacheKey(request: AIRequest): string {
		const content = `${request.prompt}-${request.language}-${request.temperature}`;
		return Buffer.from(content).toString("base64").slice(0, 50);
	}

	// =============== وظائف ModelHub والمكعبات ===============

	async orchestrateCubes(
		request: CubeOrchestrationRequest,
	): Promise<CubeOrchestrationResult> {
		const startTime = Date.now();
		const results: CubeExecutionResult[] = [];
		const cubesUsed: string[] = [];

		try {
			// 1. تحليل المتطلبات لاختيار المكعبات المناسبة
			const systemRequirements = await this.analyzeSystemRequirements(
				request.description,
			);

			// 2. تحديد المكعبات المطلوبة
			const requiredCubes =
				request.cubes || (await this.selectCubesForSystem(systemRequirements));

			// 3. تنفيذ المكعبات بالتسلسل
			const executionOrder = this.determineExecutionOrder(
				requiredCubes,
				systemRequirements,
			);

			for (const cubeId of executionOrder) {
				if (!this.cubeRegistry.has(cubeId)) {
					console.warn(`Cube ${cubeId} not found, skipping...`);
					continue;
				}

				const cubeMetadata = this.cubeRegistry.get(cubeId)!;

				// 4. تحضير مدخلات المكعب بناءً على السياق
				const cubeInput = await this.prepareCubeInput(
					cubeId,
					request.description,
					results,
				);

				// 5. تنفيذ المكعب
				const cubeResult = await this.executeCube(
					cubeId,
					cubeInput,
					request.options,
				);

				results.push(cubeResult);
				cubesUsed.push(cubeId);

				// 6. التحقق من الأخطاء
				if (!cubeResult.success) {
					console.warn(`Cube ${cubeId} failed:`, cubeResult.error);
					// يمكن إعادة المحاولة أو استخدام بديل
				}
			}

			// 7. بناء النظام النهائي
			const system = await this.buildSystemFromResults(
				systemRequirements,
				results,
			);

			// 8. اقتراح تحسينات
			const suggestions = await this.generateSuggestions(
				systemRequirements,
				results,
			);

			const totalExecutionTime = Date.now() - startTime;

			return {
				success: true,
				system,
				cubes: results,
				totalExecutionTime,
				suggestions,
				cubesUsed,
			};
		} catch (error: any) {
			return {
				success: false,
				system: { type: "error", components: [], cubesUsed: [], workflow: [] },
				cubes: results,
				totalExecutionTime: Date.now() - startTime,
				suggestions: [`Error: ${error.message}`],
			};
		}
	}

	private async analyzeSystemRequirements(
		description: string,
	): Promise<SystemRequirements> {
		const systemPrompt = `أنت مساعد متخصص في تحليل متطلبات أنظمة الأعمال.
    قم بتحليل الوصف التالي وتحديد:
    1. نوع النظام (تتبع، داشبورد، تحليلات، إدارة)
    2. المجال (موارد بشرية، مبيعات، مخازن، تعليم، رعاية صحية)
    3. الميزات المطلوبة
    4. المكعبات الذكية المناسبة
    
    أعد الإجابة بتنسيق JSON فقط.`;

		const request: AIRequest = {
			prompt: description,
			systemPrompt,
			temperature: 0.2,
			language: "ar",
		};

		try {
			const response = await this.process(request);

			// محاولة استخراج JSON
			const jsonMatch =
				response.content.match(/```json\n([\s\S]*?)\n```/) ||
				response.content.match(/{[\s\S]*}/);

			if (jsonMatch) {
				const jsonString = jsonMatch[0].startsWith("{")
					? jsonMatch[0]
					: jsonMatch[1];
				const parsed = JSON.parse(jsonString);

				return {
					type: parsed.type || "custom",
					category: parsed.category || "general",
					features: parsed.features || [],
					cubes: {
						required: parsed.cubes?.required || [],
						recommended: parsed.cubes?.recommended || [],
					},
					outputFormat: parsed.outputFormat || "excel",
				};
			}
		} catch (error) {
			console.warn("Failed to parse AI analysis, using defaults:", error);
		}

		// النسخة الاحتياطية
		return this.guessSystemRequirements(description);
	}

	private guessSystemRequirements(description: string): SystemRequirements {
		const lowerDesc = description.toLowerCase();

		// تحديد النوع
		let type: SystemRequirements["type"] = "custom";
		if (lowerDesc.includes("تتبع") || lowerDesc.includes("tracking"))
			type = "tracking";
		if (lowerDesc.includes("داشبورد") || lowerDesc.includes("dashboard"))
			type = "dashboard";
		if (lowerDesc.includes("تحليل") || lowerDesc.includes("analytics"))
			type = "analytics";
		if (lowerDesc.includes("إدارة") || lowerDesc.includes("management"))
			type = "management";

		// تحديد المجال
		let category: SystemRequirements["category"] = "general";
		if (lowerDesc.includes("موظف") || lowerDesc.includes("hr")) category = "hr";
		if (lowerDesc.includes("مبيعات") || lowerDesc.includes("sales"))
			category = "sales";
		if (lowerDesc.includes("مخزون") || lowerDesc.includes("inventory"))
			category = "inventory";
		if (lowerDesc.includes("تعليم") || lowerDesc.includes("education"))
			category = "education";
		if (lowerDesc.includes("صحة") || lowerDesc.includes("health"))
			category = "healthcare";

		// تحديد الميزات
		const features: string[] = [];
		if (lowerDesc.includes("وجه") || lowerDesc.includes("face"))
			features.push("face_recognition");
		if (lowerDesc.includes("مشاعر") || lowerDesc.includes("sentiment"))
			features.push("sentiment_analysis");
		if (lowerDesc.includes("تنبؤ") || lowerDesc.includes("forecast"))
			features.push("forecasting");
		if (lowerDesc.includes("إشعار") || lowerDesc.includes("notification"))
			features.push("notifications");

		return {
			type,
			category,
			features,
			cubes: {
				required: features,
				recommended: [],
			},
			outputFormat: "excel",
		};
	}

	private async selectCubesForSystem(
		requirements: SystemRequirements,
	): Promise<string[]> {
		const selectedCubes: string[] = [];

		// إضافة المكعبات المطلوبة
		selectedCubes.push(...requirements.cubes.required);

		// إضافة المكعبات الموصى بها
		selectedCubes.push(...requirements.cubes.recommended);

		// إضافة مكعبات أساسية حسب النوع
		if (requirements.type === "tracking") {
			if (!selectedCubes.includes("excel_generator")) {
				selectedCubes.push("excel_generator");
			}
		}

		if (requirements.type === "dashboard") {
			if (!selectedCubes.includes("data_forecasting")) {
				selectedCubes.push("data_forecasting");
			}
		}

		// إزالة التكرارات
		return [...new Set(selectedCubes)];
	}

	private determineExecutionOrder(
		cubes: string[],
		requirements: SystemRequirements,
	): string[] {
		// ترتيب تنفيذ المكعبات حسب التبعيات
		const dependencies: Record<string, string[]> = {
			data_forecasting: ["excel_generator"],
			sentiment_analysis: ["excel_generator"],
			face_recognition: [],
		};

		// خوارزمية فرز طوبولوجي بسيطة
		const visited = new Set<string>();
		const order: string[] = [];

		const visit = (cubeId: string) => {
			if (visited.has(cubeId)) return;
			visited.add(cubeId);

			// زيارة التبعيات أولاً
			if (dependencies[cubeId]) {
				dependencies[cubeId].forEach((dep) => visit(dep));
			}

			order.push(cubeId);
		};

		cubes.forEach((cubeId) => visit(cubeId));

		// وضع مولد Excel في النهاية عادةً
		const excelIndex = order.indexOf("excel_generator");
		if (excelIndex !== -1 && excelIndex !== order.length - 1) {
			order.splice(excelIndex, 1);
			order.push("excel_generator");
		}

		return order;
	}

	private async prepareCubeInput(
		cubeId: string,
		description: string,
		previousResults: CubeExecutionResult[],
	): Promise<any> {
		const cubeMetadata = this.cubeRegistry.get(cubeId);
		if (!cubeMetadata) {
			throw new Error(`Cube ${cubeId} not found`);
		}

		// إنشاء مدخلات حسب نوع المكعب
		switch (cubeId) {
			case "face_recognition":
				return {
					image: await this.extractImageInfo(description),
					mode: "detect",
				};

			case "sentiment_analysis":
				const textData = await this.extractTextData(
					description,
					previousResults,
				);
				return {
					text: textData,
					language: "ar",
				};

			case "data_forecasting":
				const historicalData = await this.generateSampleData(description);
				return {
					data: historicalData,
					periods: 7,
					method: "linear",
				};

			case "excel_generator":
				const allData = await this.prepareExcelData(previousResults);
				return {
					data: allData,
					template: "default",
					formulas: this.generateExcelFormulas(description),
					charts: this.generateCharts(description),
				};

			default:
				return { description };
		}
	}

	private async executeCube(
		cubeId: string,
		input: any,
		options?: any,
	): Promise<CubeExecutionResult> {
		const startTime = Date.now();

		try {
			// إذا كان ModelHub متاحاً، استخدمه
			if (this.modelHub) {
				const cubeInput: CubeExecutionInput = {
					cubeId,
					data: input,
					options: {
						cache: options?.useCache ?? true,
						timeout: options?.timeout ?? 30000,
						priority: options?.priority ?? "normal",
					},
				};

				return await this.modelHub.executeCube(cubeInput);
			}

			// نسخة احتياطية محلية
			return await this.executeCubeLocally(cubeId, input);
		} catch (error: any) {
			return {
				success: false,
				error: error.message,
				executionTime: Date.now() - startTime,
				cached: false,
			};
		}
	}

	private async executeCubeLocally(
		cubeId: string,
		input: any,
	): Promise<CubeExecutionResult> {
		const startTime = Date.now();

		try {
			let result: any;

			switch (cubeId) {
				case "sentiment_analysis":
					result = await this.executeSentimentAnalysis(input);
					break;

				case "data_forecasting":
					result = await this.executeDataForecasting(input);
					break;

				case "excel_generator":
					result = await this.executeExcelGeneration(input);
					break;

				default:
					throw new Error(`Cube ${cubeId} not implemented locally`);
			}

			return {
				success: true,
				data: result,
				executionTime: Date.now() - startTime,
				cached: false,
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.message,
				executionTime: Date.now() - startTime,
				cached: false,
			};
		}
	}

	private async executeSentimentAnalysis(input: any): Promise<any> {
		// استخدام HuggingFace لتحليل المشاعر
		const huggingface = this.providers.get("huggingface");
		if (huggingface) {
			try {
				const response = await huggingface.sentimentAnalysis(
					input.text,
					input.language,
				);
				return response;
			} catch (error) {
				console.warn("HuggingFace sentiment analysis failed, using fallback");
			}
		}

		// نسخة احتياطية بسيطة
		const arabicPositiveWords = ["جيد", "ممتاز", "رائع", "مذهل", "جميل"];
		const arabicNegativeWords = ["سيء", "رديء", "مزعج", "مخيب", "فظيع"];

		const text = input.text.toLowerCase();
		let positiveScore = 0;
		let negativeScore = 0;

		arabicPositiveWords.forEach((word) => {
			if (text.includes(word)) positiveScore++;
		});

		arabicNegativeWords.forEach((word) => {
			if (text.includes(word)) negativeScore++;
		});

		if (positiveScore > negativeScore) {
			return {
				sentiment: "positive",
				confidence: positiveScore / (positiveScore + negativeScore),
				scores: { positive: positiveScore, negative: negativeScore },
			};
		} else if (negativeScore > positiveScore) {
			return {
				sentiment: "negative",
				confidence: negativeScore / (positiveScore + negativeScore),
				scores: { positive: positiveScore, negative: negativeScore },
			};
		} else {
			return {
				sentiment: "neutral",
				confidence: 0.5,
				scores: { positive: positiveScore, negative: negativeScore },
			};
		}
	}

	private async executeDataForecasting(input: any): Promise<any> {
		// تنبؤ بسيط
		const data = input.data || [];
		const periods = input.periods || 7;

		if (data.length === 0) {
			// توليد بيانات عشوائية للعرض التوضيحي
			const demoData = Array.from(
				{ length: 30 },
				(_, i) => Math.random() * 100 + 50 + Math.sin(i * 0.2) * 20,
			);
			return this.forecastLinear(demoData, periods);
		}

		return this.forecastLinear(data, periods);
	}

	private forecastLinear(data: number[], periods: number): any {
		const n = data.length;
		let sumX = 0,
			sumY = 0,
			sumXY = 0,
			sumX2 = 0;

		for (let i = 0; i < n; i++) {
			sumX += i;
			sumY += data[i];
			sumXY += i * data[i];
			sumX2 += i * i;
		}

		const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
		const intercept = (sumY - slope * sumX) / n;

		const predictions = Array.from(
			{ length: periods },
			(_, i) => intercept + slope * (n + i),
		);

		// حساب دقة بسيطة
		const lastValue = data[n - 1];
		const accuracy = Math.max(
			0.7,
			1 - Math.abs(predictions[0] - lastValue) / lastValue,
		);

		return {
			predictions,
			accuracy: parseFloat(accuracy.toFixed(3)),
			chartData: {
				historical: data,
				forecast: predictions,
				labels: Array.from({ length: n + periods }, (_, i) => `Day ${i + 1}`),
			},
		};
	}

	private async executeExcelGeneration(input: any): Promise<any> {
		// توليد Excel باستخدام مكتبة exceljs
		const ExcelJS = await import("exceljs");
		const workbook = new ExcelJS.Workbook();

		// ورقة البيانات
		const dataSheet = workbook.addWorksheet("البيانات");

		// إضافة العناوين
		const headers = Object.keys(input.data[0] || {});
		dataSheet.columns = headers.map((header) => ({
			header,
			key: header,
			width: 20,
		}));

		// إضافة البيانات
		input.data.forEach((row: any) => {
			dataSheet.addRow(row);
		});

		// إضافة الصيغ إذا كانت موجودة
		if (input.formulas && input.formulas.length > 0) {
			input.formulas.forEach((formula: any) => {
				// تطبيق الصيغ
				const cell = dataSheet.getCell(formula.cell);
				cell.value = { formula: formula.formula };
			});
		}

		// إضافة الرسوم البيانية
		if (input.charts && input.charts.length > 0) {
			input.charts.forEach((chartConfig: any) => {
				this.addChartToSheet(dataSheet, chartConfig);
			});
		}

		// حفظ الملف مؤقتاً
		const buffer = await workbook.xlsx.writeBuffer();
		const fileUrl = await this.uploadToStorage(buffer, "system.xlsx");

		return {
			fileUrl,
			fileSize: buffer.byteLength,
			sheets: workbook.worksheets.map((ws) => ws.name),
			downloadUrl: fileUrl,
		};
	}

	private async buildSystemFromResults(
		requirements: SystemRequirements,
		cubeResults: CubeExecutionResult[],
	): Promise<any> {
		const components: any[] = [];
		const workflow: any[] = [];

		// بناء المكونات من نتائج المكعبات
		cubeResults.forEach((result, index) => {
			if (result.success && result.data) {
				components.push({
					type: "cube",
					cubeId: cubeResults[index].cubeId,
					data: result.data,
					executionTime: result.executionTime,
				});

				workflow.push({
					step: index + 1,
					cubeId: cubeResults[index].cubeId,
					status: "completed",
					outputType: this.getOutputType(result.data),
				});
			}
		});

		// إضافة مكونات النظام الأساسية
		if (requirements.outputFormat === "excel") {
			components.push({
				type: "excel_file",
				sheets: ["البيانات", "الملخص", "التحليل"],
				features: requirements.features,
			});
		}

		if (requirements.outputFormat === "web") {
			components.push({
				type: "web_dashboard",
				pages: ["لوحة التحكم", "التقارير", "الإعدادات"],
				features: requirements.features,
			});
		}

		return {
			type: requirements.type,
			category: requirements.category,
			components,
			workflow,
			outputFormat: requirements.outputFormat,
			estimatedDevelopmentTime: this.calculateDevelopmentTime(
				requirements,
				cubeResults,
			),
		};
	}

	private async generateSuggestions(
		requirements: SystemRequirements,
		cubeResults: CubeExecutionResult[],
	): Promise<string[]> {
		const suggestions: string[] = [];

		// اقتراحات بناءً على نوع النظام
		if (requirements.type === "tracking") {
			suggestions.push("إضافة إشعارات تلقائية عند انخفاض الأداء");
			suggestions.push("دمج مع تطبيق الهاتف للمتابعة الميدانية");
		}

		if (requirements.type === "dashboard") {
			suggestions.push("إضافة تحديث حي للبيانات");
			suggestions.push("إمكانية تصدير التقارير بصيغة PDF");
		}

		// اقتراحات بناءً على المكعبات المستخدمة
		cubeResults.forEach((result) => {
			if (result.cubeId === "sentiment_analysis" && result.success) {
				suggestions.push("إضافة تحليل المشاعر لتعليقات العملاء");
			}

			if (result.cubeId === "data_forecasting" && result.success) {
				suggestions.push("إضافة تنبؤات ذكية للمبيعات المستقبلية");
			}
		});

		return suggestions.slice(0, 5); // الحد الأقصى 5 اقتراحات
	}

	// =============== وظائف مساعدة ===============

	private async extractImageInfo(description: string): Promise<string> {
		// في الواقع، سيكون هناك رفع صورة
		// هذا للعرض التوضيحي فقط
		return "sample_image_base64_or_url";
	}

	private async extractTextData(
		description: string,
		previousResults: CubeExecutionResult[],
	): Promise<string> {
		// استخراج النصوص من الوصف والنتائج السابقة
		let textData = description;

		previousResults.forEach((result) => {
			if (result.data && typeof result.data === "string") {
				textData += " " + result.data;
			} else if (result.data && result.data.text) {
				textData += " " + result.data.text;
			}
		});

		return textData;
	}

	private async generateSampleData(description: string): Promise<number[]> {
		// توليد بيانات عينة للعرض التوضيحي
		return Array.from(
			{ length: 30 },
			(_, i) => Math.random() * 100 + 50 + Math.sin(i * 0.2) * 20,
		);
	}

	private async prepareExcelData(
		cubeResults: CubeExecutionResult[],
	): Promise<any[]> {
		const data: any[] = [];

		cubeResults.forEach((result, index) => {
			if (result.success && result.data) {
				data.push({
					cube: result.cubeId,
					executionTime: result.executionTime,
					success: result.success,
					...(typeof result.data === "object"
						? result.data
						: { value: result.data }),
				});
			}
		});

		return data.length > 0
			? data
			: [
					{
						example: "بيانات تجريبية",
						value: 100,
						date: new Date().toISOString(),
					},
				];
	}

	private generateExcelFormulas(description: string): any[] {
		const formulas: any[] = [];

		if (description.includes("مجموع") || description.includes("sum")) {
			formulas.push({
				cell: "B10",
				formula: "SUM(B2:B9)",
				description: "مجموع القيم",
			});
		}

		if (description.includes("متوسط") || description.includes("average")) {
			formulas.push({
				cell: "C10",
				formula: "AVERAGE(C2:C9)",
				description: "متوسط القيم",
			});
		}

		return formulas;
	}

	private generateCharts(description: string): any[] {
		const charts: any[] = [];

		if (description.includes("رسم") || description.includes("chart")) {
			charts.push({
				type: "column",
				title: "البيانات الرئيسية",
				dataRange: "A1:B10",
				position: "E2",
			});
		}

		return charts;
	}

	private getOutputType(data: any): string {
		if (Array.isArray(data)) return "array";
		if (typeof data === "object") return "object";
		if (typeof data === "string") return "string";
		if (typeof data === "number") return "number";
		return "unknown";
	}

	private calculateDevelopmentTime(
		requirements: SystemRequirements,
		cubeResults: CubeExecutionResult[],
	): number {
		// تقدير وقت التطوير بناءً على التعقيد
		let baseTime = 1; // يوم

		cubeResults.forEach((result) => {
			if (result.success) baseTime += 0.5;
		});

		if (requirements.outputFormat === "web") baseTime += 2;
		if (requirements.outputFormat === "mobile") baseTime += 3;
		if (requirements.outputFormat === "all") baseTime += 4;

		return Math.ceil(baseTime);
	}

	private addChartToSheet(sheet: any, chartConfig: any): void {
		// تنفيذ إضافة الرسم البياني
		// هذه دالة افتراضية، تحتاج إلى تنفيذ فعلي
		console.log("Adding chart to sheet:", chartConfig);
	}

	private async uploadToStorage(
		buffer: Buffer,
		filename: string,
	): Promise<string> {
		// رفع الملف إلى التخزين السحابي
		// هذا للعرض التوضيحي فقط
		return `/api/download/${filename}?temp=${Date.now()}`;
	}

	// =============== واجهات عامة للمكعبات ===============

	async getAvailableCubes(category?: string): Promise<CubeMetadata[]> {
		if (category && this.cubeCategories.has(category)) {
			const cubeIds = this.cubeCategories.get(category)!;
			return cubeIds.map((id) => this.cubeRegistry.get(id)!).filter(Boolean);
		}

		return Array.from(this.cubeRegistry.values());
	}

	async getCubeById(cubeId: string): Promise<CubeMetadata | null> {
		return this.cubeRegistry.get(cubeId) || null;
	}

	async testCube(cubeId: string, testInput: any): Promise<CubeExecutionResult> {
		return await this.executeCube(cubeId, testInput);
	}

	// =============== التوافق مع الكود القديم ===============

	async analyzeDescription(description: string): Promise<any> {
		const systemPrompt = `أنت مساعد متخصص في إنشاء قوالب Excel وأنظمة التتبع.
    قم بتحليل الوصف التالي وتحديد:
    1. نوع النظام المطلوب (تتبع موظفين، داشبورد مبيعات، إلخ)
    2. الأعمدة والبيانات اللازمة
    3. الصيغ والحسابات المطلوبة
    4. الرسوم البيانية المناسبة
    5. المكعبات الذكية المطلوبة
    
    الهدف: إنشاء ملف Excel وظيفي وكامل.`;

		const request: AIRequest = {
			prompt: description,
			systemPrompt,
			temperature: 0.3,
			language: "ar",
		};

		const response = await this.process(request);
		return this.parseAnalysis(response.content);
	}

	private parseAnalysis(aiOutput: string): any {
		try {
			const jsonMatch =
				aiOutput.match(/```json\n([\s\S]*?)\n```/) ||
				aiOutput.match(/{[\s\S]*}/);

			if (jsonMatch) {
				const jsonString = jsonMatch[0].startsWith("{")
					? jsonMatch[0]
					: jsonMatch[1];
				const parsed = JSON.parse(jsonString);

				// إضافة المكعبات المطلوبة
				if (parsed.requiredCubes) {
					parsed.cubes = { required: parsed.requiredCubes };
				}

				return parsed;
			}

			return {
				type: this.detectTemplateType(aiOutput),
				columns: this.extractColumns(aiOutput),
				sheets: ["البيانات", "الملخص", "الرسوم البيانية"],
				cubes: { required: this.extractCubesFromText(aiOutput) },
				metadata: { rawOutput: aiOutput.substring(0, 500) },
			};
		} catch (error: any) {
			console.error("Failed to parse AI analysis:", error);
			return this.getDefaultTemplate();
		}
	}

	private detectTemplateType(text: string): string {
		const lowerText = text.toLowerCase();
		if (lowerText.includes("داشبورد") || lowerText.includes("dashboard"))
			return "dashboard";
		if (lowerText.includes("تتبع") || lowerText.includes("tracking"))
			return "tracking";
		return "excel";
	}

	private extractColumns(text: string): Array<{ name: string; type: string }> {
		const columns: Array<{ name: string; type: string }> = [];
		const lines = text.split("\n");

		for (const line of lines) {
			if (
				line.includes("عمود") ||
				line.includes("column") ||
				line.match(/\d+\./)
			) {
				columns.push({
					name: line.replace(/^\d+\.\s*/, "").trim(),
					type: this.guessColumnType(line),
				});
			}
		}

		return columns.length > 0
			? columns
			: [
					{ name: "الاسم", type: "text" },
					{ name: "القيمة", type: "number" },
					{ name: "التاريخ", type: "date" },
				];
	}

	private extractCubesFromText(text: string): string[] {
		const cubes: string[] = [];
		const lowerText = text.toLowerCase();

		if (lowerText.includes("وجه") || lowerText.includes("face"))
			cubes.push("face_recognition");
		if (lowerText.includes("مشاعر") || lowerText.includes("sentiment"))
			cubes.push("sentiment_analysis");
		if (lowerText.includes("تنبؤ") || lowerText.includes("forecast"))
			cubes.push("data_forecasting");

		return cubes;
	}

	private guessColumnType(text: string): string {
		const lowerText = text.toLowerCase();
		if (lowerText.includes("تاريخ") || lowerText.includes("date"))
			return "date";
		if (
			lowerText.includes("رقم") ||
			lowerText.includes("عدد") ||
			lowerText.includes("number")
		)
			return "number";
		if (
			lowerText.includes("نعم") ||
			lowerText.includes("لا") ||
			lowerText.includes("boolean")
		)
			return "boolean";
		return "text";
	}

	private getDefaultTemplate() {
		return {
			type: "excel",
			columns: [
				{ name: "المعرف", type: "text" },
				{ name: "الوصف", type: "text" },
				{ name: "القيمة", type: "number" },
				{ name: "التاريخ", type: "date" },
				{ name: "الحالة", type: "text" },
			],
			sheets: ["البيانات", "الملخص"],
			cubes: { required: [] },
			metadata: { isDefault: true },
		};
	}
}
