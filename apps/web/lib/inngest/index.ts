export { inngest, functions, triggerEvent } from "./inngest";
export * from "./functions";

// Re-export specific functions
export { sendNotification } from "./functions/send-notification";
export { logActivity } from "./functions/log-activity";
export { generateExcel } from "./functions/generate-excel";
export { generateDashboard } from "./functions/generate-dashboard";

// Default export
import { inngest, functions, triggerEvent } from "./inngest";
export default {
	inngest,
	functions,
	triggerEvent,
};
