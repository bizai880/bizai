import { SalesOutlookAutomationCube } from "./processor";
import { BaseCube } from "../../../core/BaseCube";

// تصدير المكعب كافتراضي
export default SalesOutlookAutomationCube;

// تصدير الدوال المساعدة
export {
	parseExcelFile,
	createSampleExcelFile,
} from "./excel-parser";

export {
	generateFollowUpEmail,
	generateDeliveryAlertEmail,
	generatePriorityAlertEmail,
	generateEscalationEmail,
} from "./email-templates";

export {
	scheduleAutomation,
	calculateNextRun,
	stopScheduler,
} from "./scheduler";

export type {
	SalesRecord,
	EmailRecipient,
	AlertRule,
	EmailConfig,
	AutomationConfig,
	AlertResult,
	CubeExecutionResult,
} from "./types";
