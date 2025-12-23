// types/cloudinary-automation.ts
export interface CloudinaryAutomationEvent {
  notification_type: 'upload' | 'delete' | 'update';
  response: {
    public_id: string;
    secure_url: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    context?: Record<string, string>;
    tags?: string[];
  };
  timestamp: string;
}

export interface AutomationResult {
  success: boolean;
  message?: string;
  data?: {
    slackMessage?: any;
    databaseUpdate?: boolean;
    aiDescription?: string;
    processedAt: Date;
  };
}

export interface AutomationConfig {
  id: string;
  name: string;
  description: string;
  trigger: 'upload' | 'schedule' | 'api';
  conditions: {
    folder?: string;
    tags?: string[];
    minSize?: number;
    maxSize?: number;
  };
  actions: {
    type: 'slack' | 'database' | 'ai_processing' | 'transform';
    config: any;
  }[];
  enabled: boolean;
}