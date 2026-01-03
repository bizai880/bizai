import { cache } from "@/lib/cache/redis";
import { encryptionService } from "@/lib/crypto/encryption";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";
import { HuggingFaceProvider } from "./providers/huggingface";
import { LocalAIProvider } from "./providers/local";

export interface AIRequest {
	prompt: string;
	systemPrompt?: string;
	temperature?: number;
	maxTokens?: number;
	model?: string;
	stream?: boolean;
	language?: "ar" | "en";
	context?: any;
}

export interface AIResponse {
	content: string;
	modelUsed: string;
	provider: string;
	tokensUsed: number;
	processingTime: number;
	cost?: number;
	cached?: boolean;
	error?: string;
}

export interface AIModel {
	id: string;
	name: string;
	provider: "groq" | "gemini" | "local" | "huggingface";
	maxTokens: number;
	supportsArabic: boolean;
	costPerToken: number;
	capabilities: string[];
	fallbackOrder: number;
}

export class AICore {
	private providers = {
		groq: new GroqProvider(),
		gemini: new GeminiProvider(),
		local: new LocalAIProvider(),
		huggingface: new HuggingFaceProvider(),
	};

	private models: AIModel[] = [
		{
			id: "groq-llama3",
			name: "Llama 3 70B",
			provider: "groq",
			maxTokens: 8192,
			supportsArabic: true,
			costPerToken: 0.0000007,
			capabilities: ["text", "analysis", "generation"],
			fallbackOrder: 1,
		},
		{
			id: "gemini-pro",
			name: "Gemini Pro",
			provider: "gemini",
			maxTokens: 32768,
			supportsArabic: true,
			costPerToken: 0.0000005,
			capabilities: ["text", "multimodal", "analysis"],
			fallbackOrder: 2,
		},
		{
			id: "local-llama3",
			name: "Llama 3 8B",
			provider: "local",
			maxTokens: 4096,
			supportsArabic: true,
			costPerToken: 0,
			capabilities: ["text", "generation"],
			fallbackOrder: 3,
		},
		{
			id: "hf-mistral",
			name: "Mistral 7B",
			provider: "huggingface",
			maxTokens: 4096,
			supportsArabic: true,
			costPerToken: 0.0000003,
			capabilities: ["text", "analysis"],
			fallbackOrder: 4,
		},
	];

	async process(request: AIRequest): Promise<AIResponse> {
		// توليد مفتاح التخزين المؤقت
		const cacheKey = `ai:${encryptionService.createHash(
			JSON.stringify(request) + Date.now(),
		)}`;

		// محاولة جلب النتيجة من التخزين المؤقت
		const cached = await cache.get<AIResponse>(cacheKey);
		if (cached && !request.stream) {
			return { ...cached, cached: true };
		}

		// اختيار النموذج المناسب
		const _model = this.selectModel(request);

		let lastError: Error | null = null;

		// تجربة المزودين حسب ترتيب Fallback
		const fallbackModels = this.getFallbackModels(request);
		for (const modelItem of fallbackModels) {
			try {
				console.log(`Trying ${modelItem.provider} with ${modelItem.name}...`);

				const provider =
					this.providers[modelItem.provider as keyof typeof this.providers];
				const response = await provider.generate({
					...request,
					model: modelItem.id,
				});

				const aiResponse: AIResponse = {
					content: response.content,
					modelUsed: modelItem.name,
					provider: modelItem.provider,
					tokensUsed: response.tokensUsed || 0,
					processingTime: response.processingTime,
					cost: modelItem.costPerToken * (response.tokensUsed || 0),
				};

				// تخزين في الذاكرة المؤقتة (ساعة واحدة)
				await cache.set(cacheKey, aiResponse, 3600);

				// تسجيل الاستخدام
				await this.logUsage(aiResponse, request);

				return aiResponse;
			} catch (error: any) {
				console.warn(
					`${modelItem.provider} failed:`,
					error?.message || "Unknown error",
				);
				lastError = error;

				// انتظار قبل المحاولة التالية
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
		}

		throw new Error(
			`All AI providers failed. Last error: ${lastError?.message || "Unknown error"}`,
		);
	}

	async processStream(request: AIRequest) {
		const model = this.selectModel(request);
		const provider =
			this.providers[model.provider as keyof typeof this.providers];

		return await provider.generateStream(request);
	}

	async analyzeExcelRequest(description: string): Promise<any> {
		const systemPrompt = `You are an Excel and business systems expert. Analyze the user's request and return a structured JSON with:
    1. template_type: 'excel', 'dashboard', 'tracking', 'report', or 'form'
    2. required_sheets: array of sheet names
    3. columns: array of {name, type, formula?, validation?}
    4. charts: array of {type, title, data_range}
    5. formulas: array of {cell, formula}
    6. validations: array of {cell, type, options?}
    7. metadata: any additional info
    
    User request: ${description}
    
    Return ONLY valid JSON.`;

		const response = await this.process({
			prompt: description,
			systemPrompt,
			temperature: 0.3,
			maxTokens: 2000,
			language: description.match(/[\u0600-\u06FF]/) ? "ar" : "en",
		});

		try {
			const jsonMatch =
				response.content.match(/```json\n([\s\S]*?)\n```/) ||
				response.content.match(/{[\s\S]*}/);

			let parsedContent: any;
			if (jsonMatch) {
				parsedContent = jsonMatch[0].startsWith("{")
					? JSON.parse(jsonMatch[0])
					: JSON.parse(jsonMatch[1]);
			} else {
				parsedContent = this.parseStructuredResponse(response.content);
			}

			// التحقق من أن المحتوى يحتوي على الهيكل الأساسي
			if (!parsedContent.template_type) {
				parsedContent.template_type = "excel";
			}
			if (!parsedContent.columns || !Array.isArray(parsedContent.columns)) {
				parsedContent.columns = this.getDefaultTemplate(description).columns;
			}

			return parsedContent;
		} catch (error: any) {
			console.error(
				"Failed to parse AI analysis:",
				error?.message || "Unknown error",
			);
			return this.getDefaultTemplate(description);
		}
	}

	async generateExcelTemplate(analysis: any): Promise<Buffer> {
		const { ExcelGenerator } = await import("@/lib/excel/generator");
		const generator = new ExcelGenerator();

		return await generator.generateFromAnalysis(analysis);
	}

	async generateDashboard(analysis: any): Promise<any> {
		const systemPrompt = `Generate a complete dashboard configuration including:
    1. Layout: grid configuration
    2. Widgets: array of widgets with type, position, size
    3. DataSources: connections to data
    4. Filters: interactive filters
    5. Theme: color scheme and styling
    
    Requirements: ${JSON.stringify(analysis)}`;

		const response = await this.process({
			prompt: JSON.stringify(analysis),
			systemPrompt,
			temperature: 0.2,
			maxTokens: 4000,
		});

		try {
			return JSON.parse(response.content);
		} catch (error: any) {
			console.error(
				"Failed to parse dashboard config:",
				error?.message || "Unknown error",
			);
			return this.getDefaultDashboardConfig();
		}
	}

	private selectModel(request: AIRequest): AIModel {
		// اختيار النموذج بناءً على المتطلبات
		const isArabic =
			request.language === "ar" || request.prompt?.match(/[\u0600-\u06FF]/);
		const needsLongContext = request.prompt && request.prompt.length > 1000;

		let filteredModels = this.models.filter((model) =>
			isArabic ? model.supportsArabic : true,
		);

		if (needsLongContext) {
			filteredModels = filteredModels.sort((a, b) => b.maxTokens - a.maxTokens);
		}

		// ترجيح النماذج الأقل تكلفة
		return (
			filteredModels.sort((a, b) => a.fallbackOrder - b.fallbackOrder)[0] ||
			this.models[0]
		);
	}

	private getFallbackModels(request: AIRequest): AIModel[] {
		const primary = this.selectModel(request);
		const fallbacks = this.models
			.filter((m) => m.id !== primary.id)
			.sort((a, b) => a.fallbackOrder - b.fallbackOrder);

		return [primary, ...fallbacks];
	}

	private async logUsage(
		response: AIResponse,
		_request: AIRequest,
	): Promise<void> {
		try {
			// استخدام fetch فقط في بيئة المتصفح
			if (typeof window !== "undefined" && typeof fetch !== "undefined") {
				await fetch("/api/ai/usage", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						model: response.modelUsed,
						provider: response.provider,
						tokens: response.tokensUsed,
						cost: response.cost,
						duration: response.processingTime,
						cached: response.cached,
						timestamp: new Date().toISOString(),
					}),
				});
			} else {
				// تسجيل في السيرفر سايد
				console.log("AI Usage:", {
					model: response.modelUsed,
					provider: response.provider,
					tokens: response.tokensUsed,
					cost: response.cost,
					duration: response.processingTime,
					cached: response.cached,
				});
			}
		} catch (error: any) {
			console.error(
				"Failed to log AI usage:",
				error?.message || "Unknown error",
			);
		}
	}

	private parseStructuredResponse(text: string): any {
		// تحليل النص المنظم إلى JSON
		const lines = text.split("\n").filter((line) => line.trim());
		const result: any = {
			columns: [],
			sheets: ["البيانات"],
			template_type: "excel",
			metadata: {},
		};

		for (const line of lines) {
			if (
				line.includes("أعمدة") ||
				line.includes("columns") ||
				line.includes("column")
			) {
				const match = line.match(/\d+\.\s*(.+)/) || line.match(/-\s*(.+)/);
				if (match) {
					result.columns.push({
						name: match[1].trim(),
						type: this.guessColumnType(match[1]),
					});
				}
			} else if (line.includes("مخطط") || line.includes("chart")) {
				const chartType =
					line.includes("شريطي") || line.includes("bar")
						? "bar"
						: line.includes("دائري") || line.includes("pie")
							? "pie"
							: line.includes("خط") || line.includes("line")
								? "line"
								: "bar";

				if (!result.charts) result.charts = [];
				result.charts.push({
					type: chartType,
					title: line.trim(),
					data_range: "A1:D100",
				});
			}
		}

		if (result.columns.length === 0) {
			result.columns = [
				{ name: "المعرف", type: "text" },
				{ name: "الوصف", type: "text" },
				{ name: "القيمة", type: "number" },
				{ name: "التاريخ", type: "date" },
			];
		}

		return result;
	}

	private guessColumnType(text: string): string {
		const lower = text.toLowerCase();
		if (
			lower.includes("تاريخ") ||
			lower.includes("date") ||
			lower.includes("time")
		)
			return "date";
		if (
			lower.includes("رقم") ||
			lower.includes("عدد") ||
			lower.includes("number") ||
			lower.includes("قيمة") ||
			lower.includes("value") ||
			lower.includes("كمية") ||
			lower.includes("amount")
		)
			return "number";
		if (
			lower.includes("نعم") ||
			lower.includes("لا") ||
			lower.includes("yes") ||
			lower.includes("no") ||
			lower.includes("صحيح") ||
			lower.includes("خاطئ")
		)
			return "boolean";
		if (
			lower.includes("صورة") ||
			lower.includes("image") ||
			lower.includes("رابط") ||
			lower.includes("link") ||
			lower.includes("url")
		)
			return "url";
		if (lower.includes("بريد") || lower.includes("email")) return "email";
		return "text";
	}

	private getDefaultTemplate(description: string): any {
		const isArabic = description.match(/[\u0600-\u06FF]/);

		return {
			template_type: "excel",
			sheets: isArabic ? ["البيانات", "الملخص"] : ["Data", "Summary"],
			columns: [
				{
					name: isArabic ? "المعرف" : "ID",
					type: "text",
					validation: "unique",
				},
				{ name: isArabic ? "الاسم" : "Name", type: "text" },
				{ name: isArabic ? "القيمة" : "Value", type: "number", formula: "SUM" },
				{ name: isArabic ? "التاريخ" : "Date", type: "date" },
				{
					name: isArabic ? "الحالة" : "Status",
					type: "text",
					validation: "list:Active,Inactive,Pending",
				},
			],
			charts: [
				{
					type: "bar",
					title: isArabic ? "توزيع القيم" : "Value Distribution",
					data_range: "C2:C100",
				},
				{
					type: "pie",
					title: isArabic ? "توزيع الحالات" : "Status Distribution",
					data_range: "E2:E100",
				},
			],
			metadata: {
				is_default: true,
				language: isArabic ? "ar" : "en",
				generated_at: new Date().toISOString(),
			},
		};
	}

	private getDefaultDashboardConfig(): any {
		return {
			layout: { rows: 4, cols: 6 },
			widgets: [
				{
					type: "statistic",
					position: [0, 0],
					size: [2, 2],
					title: "المؤشرات الرئيسية",
				},
				{
					type: "chart",
					position: [0, 2],
					size: [2, 4],
					title: "التحليل البياني",
				},
				{
					type: "table",
					position: [2, 0],
					size: [2, 6],
					title: "البيانات التفصيلية",
				},
			],
			theme: {
				primaryColor: "#3b82f6",
				secondaryColor: "#10b981",
				backgroundColor: "#f8fafc",
			},
		};
	}
}

// Export singleton
export const aiCore = new AICore();
