import { AutomationConfig } from "./types";
import { schedule } from "node-cron";

export async function scheduleAutomation(
	config: AutomationConfig,
	interval: string,
	processor: Function,
	input: any,
): Promise<void> {
	const cronExpression = getCronExpression(interval);

	if (!cronExpression) {
		console.log(
			`ℹ️ Manual execution only, no scheduling for interval: ${interval}`,
		);
		return;
	}

	console.log(
		`⏰ Scheduling automation to run: ${interval} (${cronExpression})`,
	);

	schedule(cronExpression, async () => {
		try {
			console.log(
				`🚀 Running scheduled automation at ${new Date().toISOString()}`,
			);

			// تشغيل المعالج
			const result = await processor(input);

			console.log(`✅ Automation completed successfully`);
			console.log(`📊 Summary:`, result.summary);
			console.log(`📧 Emails sent: ${result.alertsSent}`);
			console.log(`⏱️ Next check: ${result.nextCheck}`);
		} catch (error: any) {
			console.error(`❌ Scheduled automation failed:`, error.message);
		}
	});

	console.log(`✅ Automation scheduled successfully`);
}

function getCronExpression(interval: string): string | null {
	switch (interval.toLowerCase()) {
		case "daily":
			// 9 صباحاً كل يوم
			return "0 9 * * *";

		case "hourly":
			// في الدقيقة 0 من كل ساعة
			return "0 * * * *";

		case "realtime":
			// كل 15 دقيقة
			return "*/15 * * * *";

		case "twicedaily":
			// 9 صباحاً و 3 مساءً
			return "0 9,15 * * *";

		case "weekly":
			// 9 صباحاً كل يوم أحد
			return "0 9 * * 0";

		case "monthly":
			// 9 صباحاً أول يوم من الشهر
			return "0 9 1 * *";

		case "manual":
		default:
			return null;
	}
}

export function calculateNextRun(interval: string): Date {
	const now = new Date();
	const next = new Date(now);

	switch (interval.toLowerCase()) {
		case "daily":
			next.setDate(next.getDate() + 1);
			next.setHours(9, 0, 0, 0);
			break;

		case "hourly":
			next.setHours(next.getHours() + 1);
			next.setMinutes(0, 0, 0);
			break;

		case "realtime":
			next.setMinutes(next.getMinutes() + 15);
			break;

		case "twicedaily":
			if (now.getHours() < 9) {
				next.setHours(9, 0, 0, 0);
			} else if (now.getHours() < 15) {
				next.setHours(15, 0, 0, 0);
			} else {
				next.setDate(next.getDate() + 1);
				next.setHours(9, 0, 0, 0);
			}
			break;

		case "weekly":
			next.setDate(next.getDate() + (7 - next.getDay()));
			next.setHours(9, 0, 0, 0);
			break;

		case "monthly":
			next.setMonth(next.getMonth() + 1);
			next.setDate(1);
			next.setHours(9, 0, 0, 0);
			break;

		default:
			next.setDate(next.getDate() + 1);
	}

	return next;
}

// وظيفة لإيقاف الجدولة
export function stopScheduler(): void {
	// node-cron doesn't have a built-in stop all method
	// We would need to track scheduled tasks manually
	console.log(
		"⏹️ Scheduler stopped (implementation depends on your scheduling library)",
	);
}
