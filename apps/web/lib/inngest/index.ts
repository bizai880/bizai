export * from "./functions";
export { generateDashboard } from "./functions/generate-dashboard";
export { generateExcel } from "./functions/generate-excel";
export { logActivity } from "./functions/log-activity";
// Re-export specific functions
export { sendNotification } from "./functions/send-notification";
export { functions, inngest, triggerEvent } from "./inngest";

// Default export
import { functions, inngest, triggerEvent } from "./inngest";
export default {
	inngest,
	functions,
	triggerEvent,
};
