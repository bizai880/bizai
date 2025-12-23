import { AIRequest, AIResponse, AIProvider, AIModelConfig } from '@bizai/shared';
import { GroqProvider } from './providers/groq';
import { GeminiProvider } from './providers/gemini';
import { LocalAIProvider } from './providers/local';

// TODO: استيراد cache إذا كان موجوداً
// import { cache } from '@/lib/cache/redis';

export class AIOrchestrator {
  private providers: Map<AIProvider, any>;
  private fallbackOrder: AIProvider[] = ['groq', 'gemini', 'local'];
  private isLocalAvailable = false;

  constructor() {
    this.providers = new Map();
    this.initializeProviders();
    this.checkLocalAvailability();
  }

  private async initializeProviders() {
    // Initialize Groq
    if (process.env.GROQ_API_KEY) {
      this.providers.set('groq', new GroqProvider());
    }
    
    // Initialize Gemini
    if (process.env.GEMINI_API_KEY) {
      this.providers.set('gemini', new GeminiProvider());
    }
    
    // Initialize LocalAI/Ollama
    this.providers.set('local', new LocalAIProvider());
  }

  private async checkLocalAvailability() {
    try {
      const response = await fetch(`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/tags`, {
        timeout: 3000,
      });
      this.isLocalAvailable = response.ok;
    } catch {
      this.isLocalAvailable = false;
    }
  }

  async process(request: AIRequest): Promise<AIResponse> {
    let lastError: Error | null = null;
    
    // Try providers in fallback order
    for (const providerName of this.fallbackOrder) {
      // Skip Local if not available
      if (providerName === 'local' && !this.isLocalAvailable) {
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
        if (providerName !== 'local') {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    // All providers failed
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
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
    return Buffer.from(content).toString('base64').slice(0, 50);
  }
  
  async analyzeDescription(description: string): Promise<any> {
    const systemPrompt = `أنت مساعد متخصص في إنشاء قوالب Excel وأنظمة التتبع.
    قم بتحليل الوصف التالي وتحديد:
    1. نوع النظام المطلوب (تتبع موظفين، داشبورد مبيعات، إلخ)
    2. الأعمدة والبيانات اللازمة
    3. الصيغ والحسابات المطلوبة
    4. الرسوم البيانية المناسبة
    
    الهدف: إنشاء ملف Excel وظيفي وكامل.`;
    
    const request: AIRequest = {
      prompt: description,
      systemPrompt,
      temperature: 0.3,
      language: 'ar',
    };
    
    const response = await this.process(request);
    return this.parseAnalysis(response.content);
  }

  private parseAnalysis(aiOutput: string): any {
    // Convert AI output to usable structure
    try {
      // Look for JSON in the output
      const jsonMatch = aiOutput.match(/```json\n([\s\S]*?)\n```/) || 
                       aiOutput.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
        return JSON.parse(jsonString);
      }
      
      // Alternative text parsing
      return {
        type: this.detectTemplateType(aiOutput),
        columns: this.extractColumns(aiOutput),
        sheets: ['البيانات', 'الملخص', 'الرسوم البيانية'],
        metadata: { rawOutput: aiOutput.substring(0, 500) }
      };
    } catch (error: any) {
      console.error('Failed to parse AI analysis:', error);
      return this.getDefaultTemplate();
    }
  }

  private detectTemplateType(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('داشبورد') || lowerText.includes('dashboard')) return 'dashboard';
    if (lowerText.includes('تتبع') || lowerText.includes('tracking')) return 'tracking';
    return 'excel';
  }

  private extractColumns(text: string): Array<{name: string, type: string}> {
    // Simple logic for extracting columns
    const columns: Array<{name: string, type: string}> = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('عمود') || line.includes('column') || line.match(/\d+\./)) {
        columns.push({
          name: line.replace(/^\d+\.\s*/, '').trim(),
          type: this.guessColumnType(line)
        });
      }
    }
    
    return columns.length > 0 ? columns : [
      { name: 'الاسم', type: 'text' },
      { name: 'القيمة', type: 'number' },
      { name: 'التاريخ', type: 'date' },
    ];
  }

  private guessColumnType(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('تاريخ') || lowerText.includes('date')) return 'date';
    if (lowerText.includes('رقم') || lowerText.includes('عدد') || lowerText.includes('number')) return 'number';
    if (lowerText.includes('نعم') || lowerText.includes('لا') || lowerText.includes('boolean')) return 'boolean';
    return 'text';
  }

  private getDefaultTemplate() {
    return {
      type: 'excel',
      columns: [
        { name: 'المعرف', type: 'text' },
        { name: 'الوصف', type: 'text' },
        { name: 'القيمة', type: 'number' },
        { name: 'التاريخ', type: 'date' },
        { name: 'الحالة', type: 'text' },
      ],
      sheets: ['البيانات', 'الملخص'],
      metadata: { isDefault: true }
    };
  }
}