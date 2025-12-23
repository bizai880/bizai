export type AIProvider = 'groq' | 'gemini' | 'local' | 'huggingface';

export interface AIModelConfig {
  name: string;
  provider: AIProvider;
  maxTokens: number;
  costPerToken?: number;
  supportsArabic: boolean;
  fallbackOrder: number;
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  language?: string;
}

export interface AIResponse {
  content: string;
  modelUsed: string;
  provider: AIProvider;
  tokensUsed: number;
  processingTime: number;
  success: boolean;
  error?: string;
}

export interface AITemplateAnalysis {
  type: 'excel' | 'dashboard' | 'tracking';
  columns: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    formula?: string;
  }>;
  sheets: string[];
  charts?: Array<{
    type: 'bar' | 'line' | 'pie';
    dataRange: string;
    title: string;
  }>;
  metadata: Record<string, any>;
}
