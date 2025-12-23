import { Inngest } from 'inngest';
import { serve } from 'inngest/next';

// تعريف الأحداث
export type Events = {
  'bizai/generate.request': {
    data: {
      requestId: string;
      description: string;
      templateType: 'excel' | 'dashboard' | 'tracking';
      userId: string;
      options?: {
        language: string;
        includeCharts?: boolean;
        theme?: 'light' | 'dark';
        format?: 'xlsx' | 'csv' | 'pdf';
      };
      priority?: 'low' | 'normal' | 'high';
    };
  };
  
  'bizai/generate.completed': {
    data: {
      requestId: string;
      status: 'success' | 'failed' | 'cancelled';
      result?: {
        fileUrl: string;
        downloadUrl: string;
        previewUrl?: string;
        fileSize?: number;
        fileName?: string;
        metadata: Record<string, any>;
        processingTime?: number;
        tokensUsed?: number;
      };
      error?: string;
      warnings?: string[];
    };
  };
  
  'bizai/generate.progress': {
    data: {
      requestId: string;
      progress: number; // 0-100
      step: 'processing' | 'generating' | 'formatting' | 'uploading';
      message?: string;
      estimatedTimeRemaining?: number; // في الثواني
    };
  };
  
  'bizai/notification.send': {
    data: {
      userId: string;
      type: 'info' | 'success' | 'warning' | 'error';
      title: string;
      message: string;
      data?: Record<string, any>;
      important?: boolean;
    };
  };
  
  'bizai/user.activity': {
    data: {
      userId: string;
      action: 'generate' | 'download' | 'view' | 'share' | 'upgrade';
      resourceId?: string;
      details?: Record<string, any>;
    };
  };
};

// إنشاء عميل Inngest مع التكوين المناسب
export const inngest = new Inngest({
  id: 'bizai-factory',
  name: 'BizAI Factory',
  
  // في التطوير استخدم Dev Server
  ...(process.env.NODE_ENV === 'development' && process.env.INNGEST_DEV_URL
    ? { baseUrl: process.env.INNGEST_DEV_URL }
    : {}),
  
  // مفاتيح الأمان
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
  
  // إعدادات إضافية
  env: process.env.NODE_ENV,
  branch: process.env.VERCEL_GIT_COMMIT_REF || 'local',
  commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  
  // تسجيل مفصل في التطوير
  logger: process.env.NODE_ENV === 'development' 
    ? {
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }
    : undefined,
});

// وظائف Inngest
import { generateExcel } from '@/lib/inngest/functions/generate-excel';
import { generateDashboard } from '@/lib/inngest/functions/generate-dashboard';
import { sendNotification } from '@/lib/inngest/functions/send-notification';
import { logActivity } from '@/lib/inngest/functions/log-activity';

// تصدير serve مع جميع الوظائف
export const serveInngest = serve({
  client: inngest,
  functions: [
    generateExcel,
    generateDashboard,
    sendNotification,
    logActivity,
  ],
  // إعدادات الإرسال
  streaming: true,
  onFailure: async (error, event) => {
    console.error('Inngest function failed:', error, event);
    // يمكنك إضافة منطق إعادة المحاولة أو الإشعارات هنا
  },
});

// أدوات مساعدة
export async function sendEvent<T extends keyof Events>(
  eventName: T,
  data: Events[T]['data']
) {
  try {
    return await inngest.send({
      name: eventName,
      data,
      ...(process.env.NODE_ENV === 'development' && {
        v: 'dev',
      }),
    });
  } catch (error) {
    console.error(`Failed to send event ${eventName}:`, error);
    throw error;
  }
}

export async function sendGenerateRequest(data: Events['bizai/generate.request']['data']) {
  return sendEvent('bizai/generate.request', data);
}

export async function sendGenerateCompleted(data: Events['bizai/generate.completed']['data']) {
  return sendEvent('bizai/generate.completed', data);
}

export async function sendGenerateProgress(data: Events['bizai/generate.progress']['data']) {
  return sendEvent('bizai/generate.progress', data);
}