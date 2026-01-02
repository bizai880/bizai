import { SalesOutlookAutomationCube } from "../src/cubes/integration/SalesOutlookAutomation";
import { createSampleExcelFile } from "../src/cubes/integration/SalesOutlookAutomation/excel-parser";

describe("SalesOutlookAutomationCube", () => {
	let cube: SalesOutlookAutomationCube;

	beforeAll(() => {
		cube = new SalesOutlookAutomationCube();
	});

	test("should initialize successfully", async () => {
		await cube.initialize();
		expect(cube).toBeDefined();
	});

	test("should process sales records and send alerts", async () => {
		// إنشاء ملف Excel تجريبي
		const sampleBuffer = createSampleExcelFile();
		const base64Data = sampleBuffer.toString("base64");
		const excelDataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;

		const input = {
			excelFile: excelDataUrl,
			emailConfig: {
				senderEmail: "test@example.com",
				senderName: "Test Automation",
				smtpServer: "smtp.example.com",
				smtpPort: 587,
				smtpUsername: "test@example.com",
				smtpPassword: "test123",
				useSSL: false,
			},
			recipients: {
				salesAdmin: "admin@example.com",
				salesEngineer: "engineer@example.com",
				manager: "manager@example.com",
				salesTeam: ["team1@example.com", "team2@example.com"],
			},
			options: {
				checkInterval: "manual", // للتجربة اليدوية
				workingDays: [0, 1, 2, 3, 4], // الأحد إلى الخميس
				timezone: "Asia/Riyadh",
			},
		};

		const result = await cube.process(input);

		expect(result).toBeDefined();
		expect(result.success).toBeTruthy();
		expect(result.recordsProcessed).toBeGreaterThan(0);
		expect(result.summary).toBeDefined();

		console.log("Test Result:", {
			success: result.success,
			recordsProcessed: result.recordsProcessed,
			alertsSent: result.alertsSent,
			summary: result.summary,
		});
	});

	test("should handle invalid input gracefully", async () => {
		const invalidInput = {
			excelFile: "invalid-path.xlsx",
			emailConfig: {
				senderEmail: "test@example.com",
				smtpServer: "smtp.example.com",
				smtpUsername: "test@example.com",
				smtpPassword: "test123",
			},
		};

		const result = await cube.process(invalidInput);

		expect(result.success).toBeFalsy();
		expect(result.error).toBeDefined();
	});
});
