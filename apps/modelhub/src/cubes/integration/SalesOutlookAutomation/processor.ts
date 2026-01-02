import { BaseCube } from "../../../core/BaseCube";
import {
	SalesRecord,
	AlertRule,
	EmailConfig,
	AutomationConfig,
	AlertResult,
	CubeExecutionResult,
} from "./types";
import * as nodemailer from "nodemailer";
import { parseExcelFile } from "./excel-parser";
import {
	generateFollowUpEmail,
	generateDeliveryAlertEmail,
	generatePriorityAlertEmail,
	generateEscalationEmail,
} from "./email-templates";
import { scheduleAutomation } from "./scheduler";

export class SalesOutlookAutomationCube extends BaseCube {
	private transporter: nodemailer.Transporter | null = null;
	private config: AutomationConfig | null = null;
	private lastExecution: Date | null = null;
	private alertHistory: Map<string, Date> = new Map();

	constructor() {
		super({
			name: "Sales Outlook Automation",
			description: "أتمتة تتبع المبيعات وإرسال إشعارات Outlook الآلية",
			category: "integration",
			tags: ["excel", "outlook", "sales", "automation", "email"],
			inputSchema: {
				type: "object",
				properties: {
					excelFile: {
						type: "string",
						description: "مسار ملف Excel أو بيانات base64",
					},
					emailConfig: {
						type: "object",
						properties: {
							senderEmail: { type: "string" },
							senderName: { type: "string" },
							smtpServer: { type: "string" },
							smtpPort: { type: "number" },
							smtpUsername: { type: "string" },
							smtpPassword: { type: "string" },
							useSSL: { type: "boolean" },
						},
						required: [
							"senderEmail",
							"smtpServer",
							"smtpUsername",
							"smtpPassword",
						],
					},
					recipients: {
						type: "object",
						properties: {
							salesAdmin: { type: "string" },
							salesEngineer: { type: "string" },
							manager: { type: "string" },
							salesTeam: { type: "array", items: { type: "string" } },
						},
					},
					options: {
						type: "object",
						properties: {
							checkInterval: {
								type: "string",
								enum: ["daily", "hourly", "realtime"],
								default: "daily",
							},
							workingDays: {
								type: "array",
								items: { type: "number" },
								default: [0, 1, 2, 3, 4], // الأحد إلى الخميس
							},
							timezone: { type: "string", default: "Asia/Riyadh" },
						},
					},
				},
				required: ["excelFile", "emailConfig"],
			},
			outputSchema: {
				type: "object",
				properties: {
					success: { type: "boolean" },
					alertsSent: { type: "number" },
					recordsProcessed: { type: "number" },
					summary: {
						type: "object",
						properties: {
							followUpReminders: { type: "number" },
							deliveryAlerts: { type: "number" },
							priorityAlerts: { type: "number" },
							escalationAlerts: { type: "number" },
						},
					},
					nextCheck: { type: "string", format: "date-time" },
					details: { type: "array" },
				},
			},
		});
	}

	async initialize(): Promise<void> {
		console.log("✅ تهيئة مكعب أتمتة المبيعات...");

		// يمكن إضافة تهيئة إضافية هنا
		// مثل تحميل قوالب البريد أو الاتصال بخدمات خارجية

		console.log("✅ مكعب أتمتة المبيعات جاهز");
	}

	async process(input: any): Promise<CubeExecutionResult> {
		try {
			const startTime = new Date();

			// 1. تحميل التكوين
			this.config = this.loadConfig(input);

			// 2. تهيئة محول البريد
			this.transporter = await this.initializeEmailTransporter(
				this.config.emailConfig,
			);

			// 3. تحليل ملف Excel
			const salesRecords = await parseExcelFile(
				input.excelFile,
				input.sheetName || "Sales Tracker",
			);

			// 4. تحميل قواعد الإنذار
			const rules = this.createAlertRules(input.recipients, input.options);

			// 5. معالجة السجلات وإرسال الإشعارات
			const results = await this.processSalesRecords(salesRecords, rules);

			// 6. جدولة التشغيل التلقائي إذا مطلوب
			if (input.options?.checkInterval !== "manual") {
				await scheduleAutomation(
					this.config,
					input.options?.checkInterval || "daily",
					this.process.bind(this),
					input,
				);
			}

			// 7. إعداد النتائج
			const summary = this.calculateSummary(results);

			const endTime = new Date();
			const executionTime = endTime.getTime() - startTime.getTime();

			return {
				success: true,
				alertsSent: results.filter((r) => r.triggered).length,
				recordsProcessed: salesRecords.length,
				results,
				summary,
				nextCheck: this.calculateNextCheck(
					input.options?.checkInterval || "daily",
				),
				executionTime,
			};
		} catch (error: any) {
			return {
				success: false,
				alertsSent: 0,
				recordsProcessed: 0,
				results: [],
				summary: {
					followUpReminders: 0,
					deliveryAlerts: 0,
					priorityAlerts: 0,
					escalationAlerts: 0,
				},
				nextCheck: new Date(),
				error: error.message,
				executionTime: 0,
			};
		}
	}

	private loadConfig(input: any): AutomationConfig {
		return {
			excelFilePath: input.excelFile,
			sheetName: input.sheetName || "Sales Tracker",
			checkInterval: input.options?.checkInterval || "daily",
			emailConfig: {
				senderEmail: input.emailConfig.senderEmail,
				senderName: input.emailConfig.senderName || "Sales Automation System",
				smtpServer: input.emailConfig.smtpServer || "smtp.office365.com",
				smtpPort: input.emailConfig.smtpPort || 587,
				smtpUsername: input.emailConfig.smtpUsername,
				smtpPassword: input.emailConfig.smtpPassword,
				useSSL: input.emailConfig.useSSL !== false,
				dailyLimit: input.emailConfig.dailyLimit || 100,
			},
			rules: [],
			emailTemplates: {},
		};
	}

	private async initializeEmailTransporter(
		config: EmailConfig,
	): Promise<nodemailer.Transporter> {
		return nodemailer.createTransport({
			host: config.smtpServer,
			port: config.smtpPort,
			secure: config.useSSL,
			auth: {
				user: config.smtpUsername,
				pass: config.smtpPassword,
			},
			tls: {
				ciphers: "SSLv3",
			},
		});
	}

	private createAlertRules(recipients: any, options: any): any[] {
		const rules = [];

		// 1. قاعدة تذكير المتابعة
		rules.push({
			id: "follow_up_reminder",
			name: "تذكير المتابعة",
			condition: (record: SalesRecord) => {
				if (!record.lastFollowUpDate) return false;

				const lastFollowUp = new Date(record.lastFollowUpDate);
				const now = new Date();

				// حساب الأيام العملية
				let workingDaysDiff = 0;
				const currentDate = new Date(lastFollowUp);

				while (currentDate < now) {
					const dayOfWeek = currentDate.getDay();
					if (
						options?.workingDays?.includes(dayOfWeek) ||
						(!options?.workingDays && dayOfWeek !== 5 && dayOfWeek !== 6)
					) {
						// الجمعة والسبت
						workingDaysDiff++;
					}
					currentDate.setDate(currentDate.getDate() + 1);
				}

				return workingDaysDiff > 3;
			},
			recipients: [
				{
					name: (record) => record.responsiblePerson,
					email: (record) =>
						this.extractEmail(record.responsiblePerson) ||
						recipients.salesAdmin,
					role: "Responsible Person",
				},
			],
			subjectTemplate: "Follow-Up Required – RFQ {rfqNumber}",
			bodyTemplate: generateFollowUpEmail,
			cooldownHours: 24,
		});

		// 2. قاعدة تأخير التسليم
		rules.push({
			id: "delivery_delay_alert",
			name: "إنذار تأخير التسليم",
			condition: (record: SalesRecord) => {
				if (!record.expectedDeliveryDate) return false;
				if (record.deliveryStatus === "Delivered") return false;

				const expectedDate = new Date(record.expectedDeliveryDate);
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				return expectedDate < today;
			},
			recipients: [
				{
					name: "Sales Admin",
					email: recipients.salesAdmin,
					role: "Sales Admin",
				},
				{
					name: "Sales Engineer",
					email: recipients.salesEngineer,
					role: "Sales Engineer",
				},
				{ name: "Manager", email: recipients.manager, role: "Manager" },
			],
			subjectTemplate:
				"Delivery Delay Alert – Order {orderNumber || rfqNumber}",
			bodyTemplate: generateDeliveryAlertEmail,
			cooldownHours: 12,
		});

		// 3. قاعدة طلبات الأولوية العالية
		rules.push({
			id: "high_priority_alert",
			name: "إنذار طلبات عالية الأولوية",
			condition: (record: SalesRecord) => {
				return record.priority === "High" || record.priority === "Critical";
			},
			recipients: (recipients.salesTeam || []).map((email: string) => ({
				name: "Sales Team Member",
				email,
				role: "Sales Team",
			})),
			subjectTemplate:
				"High Priority Sales Order – Immediate Attention Required",
			bodyTemplate: generatePriorityAlertEmail,
			cooldownHours: 6,
		});

		// 4. قاعدة التصعيد
		rules.push({
			id: "escalation_alert",
			name: "إنذار التصعيد",
			condition: (record: SalesRecord) => {
				return record.escalationFlag === "Yes";
			},
			recipients: [
				{
					name: "Sales Manager",
					email: recipients.manager,
					role: "Sales Manager",
				},
			],
			subjectTemplate: "Escalation Required – Customer {customerName}",
			bodyTemplate: generateEscalationEmail,
			cooldownHours: 1,
		});

		return rules;
	}

	private async processSalesRecords(
		records: SalesRecord[],
		rules: any[],
	): Promise<AlertResult[]> {
		const results: AlertResult[] = [];

		for (const record of records) {
			for (const rule of rules) {
				try {
					// التحقق من الشرط
					const shouldTrigger = rule.condition(record);

					if (!shouldTrigger) continue;

					// التحقق من فترة التبريد
					const alertKey = `${rule.id}_${record.rfqNumber}`;
					const lastTriggered = this.alertHistory.get(alertKey);

					if (lastTriggered) {
						const hoursSinceLast =
							(Date.now() - lastTriggered.getTime()) / (1000 * 60 * 60);
						if (hoursSinceLast < (rule.cooldownHours || 24)) {
							continue; // تجاهل، ما زال في فترة التبريد
						}
					}

					// الحصول على المستلمين
					const recipients = this.getRecipientsForRule(rule, record);

					// توليد موضوع ورسالة البريد
					const emailSubject = this.generateEmailSubject(
						rule.subjectTemplate,
						record,
					);
					const emailBody = rule.bodyTemplate(record);

					// إرسال البريد
					const emailSent = await this.sendEmail(
						recipients.map((r) => r.email),
						emailSubject,
						emailBody,
					);

					if (emailSent) {
						// تحديث التاريخ
						this.alertHistory.set(alertKey, new Date());
					}

					results.push({
						ruleId: rule.id,
						recordId: record.rfqNumber,
						triggered: emailSent,
						recipients,
						emailSubject,
						emailBody,
						timestamp: new Date(),
					});
				} catch (error: any) {
					results.push({
						ruleId: rule.id,
						recordId: record.rfqNumber,
						triggered: false,
						recipients: [],
						emailSubject: "",
						emailBody: "",
						timestamp: new Date(),
						error: error.message,
					});
				}
			}
		}

		return results;
	}

	private getRecipientsForRule(rule: any, record: SalesRecord): any[] {
		if (typeof rule.recipients === "function") {
			return rule.recipients(record);
		}
		return rule.recipients;
	}

	private generateEmailSubject(template: string, record: SalesRecord): string {
		return template
			.replace("{rfqNumber}", record.rfqNumber)
			.replace("{orderNumber}", record.orderNumber || record.rfqNumber)
			.replace("{customerName}", record.customerName);
	}

	private async sendEmail(
		recipients: string[],
		subject: string,
		body: string,
	): Promise<boolean> {
		if (!this.transporter || !this.config) {
			throw new Error("Email transporter not initialized");
		}

		try {
			const mailOptions = {
				from: `"${this.config.emailConfig.senderName}" <${this.config.emailConfig.senderEmail}>`,
				to: recipients.join(", "),
				subject: subject,
				html: body,
				text: this.stripHtml(body),
			};

			const info = await this.transporter.sendMail(mailOptions);
			console.log(`✅ Email sent: ${info.messageId}`);
			return true;
		} catch (error: any) {
			console.error(`❌ Failed to send email: ${error.message}`);
			throw error;
		}
	}

	private stripHtml(html: string): string {
		return html
			.replace(/<[^>]*>/g, "")
			.replace(/\s+/g, " ")
			.trim();
	}

	private extractEmail(text: string): string | null {
		const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
		const match = text.match(emailRegex);
		return match ? match[0] : null;
	}

	private calculateSummary(results: AlertResult[]): any {
		const summary = {
			followUpReminders: 0,
			deliveryAlerts: 0,
			priorityAlerts: 0,
			escalationAlerts: 0,
		};

		for (const result of results) {
			if (!result.triggered) continue;

			switch (result.ruleId) {
				case "follow_up_reminder":
					summary.followUpReminders++;
					break;
				case "delivery_delay_alert":
					summary.deliveryAlerts++;
					break;
				case "high_priority_alert":
					summary.priorityAlerts++;
					break;
				case "escalation_alert":
					summary.escalationAlerts++;
					break;
			}
		}

		return summary;
	}

	private calculateNextCheck(interval: string): Date {
		const next = new Date();

		switch (interval) {
			case "hourly":
				next.setHours(next.getHours() + 1);
				break;
			case "daily":
				next.setDate(next.getDate() + 1);
				next.setHours(9, 0, 0, 0); // 9 صباحاً
				break;
			case "realtime":
				next.setMinutes(next.getMinutes() + 15);
				break;
			default:
				next.setDate(next.getDate() + 1);
		}

		return next;
	}
}
