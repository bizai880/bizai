export interface SalesRecord {
  customerName: string;
  rfqNumber: string;
  quotationStatus: string;
  deliveryStatus: string;
  expectedDeliveryDate: string | Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  escalationFlag: 'Yes' | 'No';
  responsiblePerson: string;
  lastFollowUpDate: string | Date;
  orderNumber?: string;
  escalationReason?: string;
  currentStatus?: string;
  recommendedAction?: string;
}

export interface EmailRecipient {
  name: string;
  email: string;
  role: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: (record: SalesRecord) => boolean;
  recipients: EmailRecipient[];
  subjectTemplate: string;
  bodyTemplate: (record: SalesRecord) => string;
  cooldownHours?: number;
  lastTriggered?: Map<string, Date>;
}

export interface EmailConfig {
  senderEmail: string;
  senderName: string;
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  useSSL: boolean;
  dailyLimit?: number;
}

export interface AutomationConfig {
  excelFilePath: string;
  sheetName: string;
  checkInterval: 'daily' | 'hourly' | 'realtime';
  emailConfig: EmailConfig;
  rules: AlertRule[];
  emailTemplates: {
    [key: string]: {
      subject: string;
      body: string;
      cc?: string[];
      bcc?: string[];
    };
  };
}

export interface AlertResult {
  ruleId: string;
  recordId: string;
  triggered: boolean;
  recipients: EmailRecipient[];
  emailSubject: string;
  emailBody: string;
  timestamp: Date;
  error?: string;
}

export interface CubeExecutionResult {
  success: boolean;
  alertsSent: number;
  recordsProcessed: number;
  results: AlertResult[];
  summary: {
    followUpReminders: number;
    deliveryAlerts: number;
    priorityAlerts: number;
    escalationAlerts: number;
  };
  nextCheck: Date;
  error?: string;
}