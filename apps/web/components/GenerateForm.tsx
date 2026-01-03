"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const _MotionDiv = dynamic(
	() => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
	{ ssr: false },
);

import {
	FileSpreadsheet,
	Globe,
	LayoutDashboard,
	Send,
	Settings,
	Users,
} from "lucide-react";

const templateTypes = [
	{
		id: "excel",
		label: "ملف Excel",
		icon: <FileSpreadsheet className="w-5 h-5" />,
		color: "from-green-500 to-emerald-400",
	},
	{
		id: "dashboard",
		label: "داشبورد",
		icon: <LayoutDashboard className="w-5 h-5" />,
		color: "from-primary to-primary-light",
	},
	{
		id: "tracking",
		label: "نظام تتبع",
		icon: <Users className="w-5 h-5" />,
		color: "from-accent to-pink-400",
	},
];

const industries = [
	"الموارد البشرية",
	"المبيعات",
	"التعليم",
	"المشاريع",
	"المخزون",
	"المالية",
	"التسويق",
	"أخرى",
];

export default function GenerateForm() {
	const [description, setDescription] = useState("");
	const [selectedType, setSelectedType] = useState("excel");
	const [selectedIndustry, setSelectedIndustry] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [advancedOptions, setAdvancedOptions] = useState({
		language: "ar",
		includeCharts: true,
		autoRefresh: false,
		notifications: true,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsGenerating(true);

		// محاكاة عملية المعالجة
		await new Promise((resolve) => setTimeout(resolve, 2000));

		setIsGenerating(false);
		// هنا سيتم استدعاء API حقيقي
	};

	const wordCount = description.trim().split(/\s+/).filter(Boolean).length;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className="glass-card p-8"
		>
			<div className="flex items-center mb-8">
				<div className="w-12 h-12 rounded-xl bg-gradient-primary p-3 mr-4">
					<Send className="w-6 h-6 text-white" />
				</div>
				<div>
					<h2 className="text-2xl font-bold text-text-primary">
						أنشئ نظامك الآن
					</h2>
					<p className="text-text-secondary">
						صف ما تحتاجه بدقة واحصل على نظام كامل
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* نوع القالب */}
				<div>
					<label className="block text-text-primary mb-3 font-medium">
						اختر نوع النظام
					</label>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{templateTypes.map((type) => (
							<button
								key={type.id}
								type="button"
								onClick={() => setSelectedType(type.id)}
								className={`p-4 rounded-xl border-2 transition-all duration-300 ${
									selectedType === type.id
										? `border-primary bg-gradient-to-br ${type.color}/20`
										: "border-border hover:border-primary/50 hover:bg-background-hover"
								}`}
							>
								<div
									className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.color} p-2 mb-3`}
								>
									{type.icon}
								</div>
								<span className="font-medium text-text-primary">
									{type.label}
								</span>
							</button>
						))}
					</div>
				</div>

				{/* مجال العمل */}
				<div>
					<label className="block text-text-primary mb-3 font-medium">
						مجال العمل
					</label>
					<div className="flex flex-wrap gap-2">
						{industries.map((industry) => (
							<button
								key={industry}
								type="button"
								onClick={() => setSelectedIndustry(industry)}
								className={`px-4 py-2 rounded-full border transition-all duration-300 ${
									selectedIndustry === industry
										? "border-primary bg-primary/10 text-primary"
										: "border-border text-text-secondary hover:text-text-primary hover:border-primary/50"
								}`}
							>
								{industry}
							</button>
						))}
					</div>
				</div>

				{/* وصف النظام */}
				<div>
					<div className="flex items-center justify-between mb-3">
						<label className="block text-text-primary font-medium">
							صف نظامك المطلوب
						</label>
						<span
							className={`text-sm ${
								wordCount > 10 ? "text-success" : "text-warning"
							}`}
						>
							{wordCount} كلمة
						</span>
					</div>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="مثال: أريد نظام لمتابعة أداء الموظفين يظهر إنتاجية كل موظف، نسبة الحضور، وتقييم الأداء مع تنبيهات تلقائية عند انخفاض الأداء..."
						className="input-modern w-full h-48 resize-none"
						required
					/>
					<div className="flex items-center justify-between mt-2">
						<div className="flex items-center space-x-4">
							<div className="flex items-center">
								<Globe className="w-4 h-4 text-text-secondary mr-2" />
								<span className="text-sm text-text-secondary">
									اللغة: العربية
								</span>
							</div>
							<div className="flex items-center">
								<Settings className="w-4 h-4 text-text-secondary mr-2" />
								<span className="text-sm text-text-secondary">
									ذكاء اصطناعي متقدم
								</span>
							</div>
						</div>
						<button
							type="button"
							onClick={() =>
								setAdvancedOptions((prev) => ({
									...prev,
									language: prev.language === "ar" ? "en" : "ar",
								}))
							}
							className="text-sm text-primary hover:text-primary-light transition-colors duration-300"
						>
							{advancedOptions.language === "ar"
								? "Switch to English"
								: "التبديل للعربية"}
						</button>
					</div>
				</div>

				{/* خيارات متقدمة */}
				<div className="border border-border rounded-xl p-4">
					<div className="flex items-center justify-between mb-4">
						<span className="font-medium text-text-primary">خيارات متقدمة</span>
						<button
							type="button"
							className="text-sm text-primary hover:text-primary-light transition-colors duration-300"
						>
							{advancedOptions.language === "ar" ? "إظهار الكل" : "Show All"}
						</button>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<label className="flex items-center space-x-3">
							<input
								type="checkbox"
								checked={advancedOptions.includeCharts}
								onChange={(e) =>
									setAdvancedOptions((prev) => ({
										...prev,
										includeCharts: e.target.checked,
									}))
								}
								className="w-4 h-4 text-primary rounded border-border focus:ring-primary focus:ring-2"
							/>
							<span className="text-text-primary">إضافة رسوم بيانية</span>
						</label>
						<label className="flex items-center space-x-3">
							<input
								type="checkbox"
								checked={advancedOptions.notifications}
								onChange={(e) =>
									setAdvancedOptions((prev) => ({
										...prev,
										notifications: e.target.checked,
									}))
								}
								className="w-4 h-4 text-primary rounded border-border focus:ring-primary focus:ring-2"
							/>
							<span className="text-text-primary">إشعارات تلقائية</span>
						</label>
					</div>
				</div>

				{/* زر الإرسال */}
				<div className="pt-4">
					<button
						type="submit"
						disabled={isGenerating || wordCount < 5}
						className={`w-full btn-primary py-4 text-lg font-medium ${
							isGenerating || wordCount < 5
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
					>
						{isGenerating ? (
							<div className="flex items-center justify-center">
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
								<span>جاري الإنشاء...</span>
							</div>
						) : (
							<>
								<Send className="w-5 h-5 inline mr-2" />
								<span>أنشئ النظام الآن (مجاناً)</span>
							</>
						)}
					</button>
					<p className="text-center text-text-secondary text-sm mt-3">
						سيتم إنشاء النظام في 30-60 ثانية. يمكنك تتبع العملية في لوحة التحكم.
					</p>
				</div>
			</form>

			{/* Tips */}
			<div className="mt-8 pt-8 border-t border-border">
				<h4 className="font-medium text-text-primary mb-3">
					نصائح للحصول على أفضل نتيجة:
				</h4>
				<ul className="space-y-2 text-sm text-text-secondary">
					<li className="flex items-start">
						<div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
						كن محدداً في الوصف واذكر التفاصيل المهمة
					</li>
					<li className="flex items-start">
						<div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
						حدد نوع البيانات التي تريد تتبعها (تواريخ، أرقام، نصوص)
					</li>
					<li className="flex items-start">
						<div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3" />
						اذكر إذا كنت تحتاج تقارير دورية أو إشعارات
					</li>
				</ul>
			</div>
		</motion.div>
	);
}
