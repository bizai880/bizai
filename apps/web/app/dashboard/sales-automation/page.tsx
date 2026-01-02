// في apps/web/app/dashboard/sales-automation/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SalesAutomationPage() {
	const [excelFile, setExcelFile] = useState<File | null>(null);
	const [config, setConfig] = useState({
		senderEmail: "",
		smtpServer: "smtp.office365.com",
		smtpPort: 587,
		smtpUsername: "",
		smtpPassword: "",
		useSSL: true,
		checkInterval: "daily",
	});
	const [isRunning, setIsRunning] = useState(false);

	const handleFileUpload = async (file: File) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const base64 = e.target?.result as string;
			// تخزين base64 للاستخدام لاحقاً
			sessionStorage.setItem("salesExcelData", base64);
		};
		reader.readAsDataURL(file);
		setExcelFile(file);
	};

	const runAutomation = async () => {
		if (!excelFile) {
			toast.error("يرجى تحميل ملف Excel أولاً");
			return;
		}

		setIsRunning(true);

		try {
			const excelData = sessionStorage.getItem("salesExcelData");

			const response = await fetch("/api/ai/cubes/sales-automation", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					excelFile: excelData,
					emailConfig: config,
					recipients: {
						salesAdmin: "admin@company.com",
						salesEngineer: "engineer@company.com",
						manager: "manager@company.com",
					},
					options: {
						checkInterval: config.checkInterval,
					},
				}),
			});

			const result = await response.json();

			if (result.success) {
				toast.success(`تم إرسال ${result.alertsSent} إنذار بنجاح`);
			} else {
				toast.error(`فشل التشغيل: ${result.error}`);
			}
		} catch (error) {
			toast.error("حدث خطأ أثناء تشغيل الأتمتة");
		} finally {
			setIsRunning(false);
		}
	};

	return (
		<div className="container mx-auto p-6 space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>أتمتة تتبع المبيعات وإرسال إشعارات</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* رفع ملف Excel */}
					<div className="space-y-4">
						<Label>ملف تتبع المبيعات (Excel)</Label>
						<Input
							type="file"
							accept=".xlsx,.xls"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleFileUpload(file);
							}}
						/>
						{excelFile && (
							<p className="text-sm text-green-600">
								✓ تم تحميل: {excelFile.name}
							</p>
						)}
					</div>

					{/* إعدادات البريد */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>البريد المرسل</Label>
							<Input
								value={config.senderEmail}
								onChange={(e) =>
									setConfig({ ...config, senderEmail: e.target.value })
								}
								placeholder="sales@company.com"
							/>
						</div>

						<div className="space-y-2">
							<Label>خادم SMTP</Label>
							<Input
								value={config.smtpServer}
								onChange={(e) =>
									setConfig({ ...config, smtpServer: e.target.value })
								}
								placeholder="smtp.office365.com"
							/>
						</div>

						<div className="space-y-2">
							<Label>اسم المستخدم</Label>
							<Input
								value={config.smtpUsername}
								onChange={(e) =>
									setConfig({ ...config, smtpUsername: e.target.value })
								}
							/>
						</div>

						<div className="space-y-2">
							<Label>كلمة المرور</Label>
							<Input
								type="password"
								value={config.smtpPassword}
								onChange={(e) =>
									setConfig({ ...config, smtpPassword: e.target.value })
								}
							/>
						</div>
					</div>

					{/* خيارات إضافية */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<Label>استخدام SSL</Label>
								<p className="text-sm text-gray-500">تشفير اتصال البريد</p>
							</div>
							<Switch
								checked={config.useSSL}
								onCheckedChange={(checked) =>
									setConfig({ ...config, useSSL: checked })
								}
							/>
						</div>

						<div className="space-y-2">
							<Label>فترة التشغيل</Label>
							<select
								value={config.checkInterval}
								onChange={(e) =>
									setConfig({ ...config, checkInterval: e.target.value })
								}
								className="w-full p-2 border rounded"
							>
								<option value="manual">يدوي</option>
								<option value="daily">يومي</option>
								<option value="hourly">كل ساعة</option>
								<option value="realtime">حقيقي (كل 15 دقيقة)</option>
							</select>
						</div>
					</div>

					{/* زر التشغيل */}
					<Button
						onClick={runAutomation}
						disabled={isRunning}
						className="w-full"
					>
						{isRunning ? "جاري التشغيل..." : "تشغيل الأتمتة"}
					</Button>

					{/* معلومات */}
					<div className="p-4 bg-blue-50 rounded-lg">
						<h4 className="font-medium mb-2">القواعد المطبقة:</h4>
						<ul className="text-sm space-y-1">
							<li>• تذكير المتابعة بعد 3 أيام عمل</li>
							<li>• إنذار تأخير التسليم</li>
							<li>• تنبيه الطلبات عالية الأولوية</li>
							<li>• إشعارات التصعيد</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
