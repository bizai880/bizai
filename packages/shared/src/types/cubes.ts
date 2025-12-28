export interface CubeMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: 'vision' | 'nlp' | 'data' | 'integration' | 'custom';
  tags: string[];
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  price: number;
  usageLimit: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CubeExecutionInput {
  cubeId: string;
  data: any;
  options?: {
    cache?: boolean;
    timeout?: number;
    priority?: 'low' | 'normal' | 'high';
  };
}

export interface CubeExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  cached: boolean;
}