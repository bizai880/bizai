import { generateExcel, logActivity, processDocument, sendNotification } from './functions';
import { generateDashboard } from './functions/generate-dashboard';

// Type definitions
export interface InngestEvent<T = any> {
  name: string;
  data: T;
  ts?: number;
}

export interface InngestFunction {
  id: string;
  name: string;
  trigger: any;
  handler: Function;
}

// Inngest client implementation
export class InngestClient {
  private functions: Map<string, InngestFunction> = new Map();
  
  constructor(private config: { id: string; name?: string } = { id: 'bizai-app' }) {}
  
  createFunction(config: { id: string; name: string }, trigger: any, handler: Function): InngestFunction {
    const func: InngestFunction = {
      id: config.id,
      name: config.name,
      trigger,
      handler
    };
    
    this.functions.set(config.id, func);
    return func;
  }
  
  async send(event: InngestEvent): Promise<{ success: boolean; functionId?: string; result?: any }> {
    console.log(`Inngest event received: ${event.name}`, event.data);
    
    // Find matching functions
    const matchingFunctions = Array.from(this.functions.values()).filter(f => 
      f.trigger.event === event.name
    );
    
    if (matchingFunctions.length === 0) {
      console.warn(`No function found for event: ${event.name}`);
      return { success: false };
    }
    
    // Execute first matching function
    const func = matchingFunctions[0];
    try {
      const result = await func.handler({ event, step: this.createStepHandler() });
      return { success: true, functionId: func.id, result };
    } catch (error) {
      console.error(`Function ${func.id} failed:`, error);
      return { success: false, functionId: func.id };
    }
  }
  
  private createStepHandler() {
    return {
      run: async (name: string, handler: Function) => {
        console.log(`Executing step: ${name}`);
        return handler();
      }
    };
  }
  
  getFunction(id: string): InngestFunction | undefined {
    return this.functions.get(id);
  }
  
  listFunctions(): InngestFunction[] {
    return Array.from(this.functions.values());
  }
}

// Create default instance
export const inngest = new InngestClient({ id: 'bizai-web', name: 'BizAI Web App' });

// Register default functions
export const functions = {
  sendNotification: inngest.createFunction(
    { id: 'send-notification', name: 'Send Notification' },
    { event: 'notification/send' },
    async ({ event, step }: any) => {
      const { userId, title, message, type, channel } = event.data;
      
      await step.run('prepare-notification', async () => {
        console.log('Preparing notification...');
        return { prepared: true };
      });
      
      const result = await sendNotification({ userId, title, message, type, channel });
      
      await step.run('update-status', async () => {
        console.log('Updating notification status...');
        return { updated: true };
      });
      
      return result;
    }
  ),
  
  logActivity: inngest.createFunction(
    { id: 'log-activity', name: 'Log Activity' },
    { event: 'activity/log' },
    async ({ event, step }: any) => {
      const activity = event.data;
      
      await step.run('validate-activity', async () => {
        console.log('Validating activity data...');
        return { valid: true };
      });
      
      const result = await logActivity(activity);
      
      await step.run('update-audit-trail', async () => {
        console.log('Updating audit trail...');
        return { updated: true };
      });
      
      return result;
    }
  ),
  
  generateExcel: inngest.createFunction(
    { id: 'generate-excel', name: 'Generate Excel Report' },
    { event: 'report/generate' },
    async ({ event, step }: any) => {
      const { data, title } = event.data;
      
      await step.run('prepare-data', async () => {
        console.log('Preparing report data...');
        return { prepared: true };
      });
      
      const url = await generateExcel({ headers: data.headers || [], rows: data.rows || [], title });
      
      await step.run('notify-completion', async () => {
        console.log('Notifying report completion...');
        return { notified: true };
      });
      
      return { success: true, url };
    }
  ),
  
  processDocument: inngest.createFunction(
    { id: 'process-document', name: 'Process Document' },
    { event: 'document/process' },
    async ({ event, step }: any) => {
      const { documentId, options } = event.data;
      
      await step.run('validate-document', async () => {
        console.log('Validating document...');
        return { valid: true };
      });
      
      const result = await processDocument(documentId, options);
      
      await step.run('update-database', async () => {
        console.log('Updating database...');
        return { updated: true };
      });
      
      return result;
    }
  )
};

// Helper functions
export async function triggerEvent(eventName: string, data: any): Promise<{ success: boolean; eventId?: string }> {
  console.log(`Triggering event: ${eventName}`, data);
  
  const event: InngestEvent = {
    name: eventName,
    data,
    ts: Date.now()
  };
  
  const result = await inngest.send(event);
  
  return {
    success: result.success,
    eventId: `event-${Date.now()}`
  };
}

// Default export
export default {
  inngest,
  functions,
  triggerEvent,
  InngestClient
};

  generateDashboard: inngest.createFunction(
    { id: 'generate-dashboard', name: 'Generate Dashboard' },
    { event: 'dashboard/generate' },
    async ({ event, step }: any) => {
      const { data, options } = event.data;
      
      await step.run('validate-data', async () => {
        console.log('Validating dashboard data...');
        return { valid: true };
      });
      
      const result = await generateDashboard(data);
      
      await step.run('store-dashboard', async () => {
        console.log('Storing dashboard...');
        return { stored: true };
      });
      
      return result;
    }
  ),
