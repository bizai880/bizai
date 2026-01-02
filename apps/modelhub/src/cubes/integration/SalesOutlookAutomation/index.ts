import { BaseCube } from "../../../core/BaseCube";
import { SalesOutlookAutomationCube } from "./processor";

// تصدير المكعب كافتراضي
export default SalesOutlookAutomationCube;

export {
	generateDeliveryAlertEmail,
	generateEscalationEmail,
	generateFollowUpEmail,
	generatePriorityAlertEmail,
} from "./email-templates";
// تصدير الدوال المساعدة
export {
	createSampleExcelFile,
	parseExcelFile,
} from "./excel-parser";

export {
	calculateNextRun,
	scheduleAutomation,
	stopScheduler,
} from "./scheduler";

export type {
	AlertResult,
	AlertRule,
	AutomationConfig,
	CubeExecutionResult,
	EmailConfig,
	EmailRecipient,
	SalesRecord,
} from "./types";
