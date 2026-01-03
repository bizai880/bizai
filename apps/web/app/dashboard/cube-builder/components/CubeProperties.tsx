"use client";

import { Code, Cpu, Database, Eye, Save, Settings, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CubeDefinition } from "../actions";

interface CubePropertiesProps {
	cube: CubeDefinition | null;
	onUpdate: (cube: CubeDefinition) => void;
}

export function CubeProperties({ cube, onUpdate }: CubePropertiesProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("custom");
	const [tags, setTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [version, setVersion] = useState("1.0.0");
	const [executionTime, setExecutionTime] = useState(100);
	const [memoryUsage, setMemoryUsage] = useState(256);
	const [pricePer1000, setPricePer1000] = useState(0);
	const [requiresGPU, setRequiresGPU] = useState(false);

	useEffect(() => {
		if (cube) {
			setName(cube.name);
			setDescription(cube.description || "");
			setCategory(cube.category);
			setTags(cube.tags || []);
			setIsActive(cube.isActive);
			setVersion(cube.version || "1.0.0");
		} else {
			resetForm();
		}
	}, [cube, resetForm]);

	const resetForm = () => {
		setName("");
		setDescription("");
		setCategory("custom");
		setTags([]);
		setIsActive(true);
		setVersion("1.0.0");
		setExecutionTime(100);
		setMemoryUsage(256);
		setPricePer1000(0);
		setRequiresGPU(false);
	};

	const handleSave = () => {
		if (!name.trim()) return;

		const updatedCube: CubeDefinition = {
			id: cube?.id || `cube_${Date.now()}`,
			name,
			description,
			category: category as any,
			tags,
			inputSchema: cube?.inputSchema || {
				type: "object",
				properties: {},
				required: [],
			},
			outputSchema: cube?.outputSchema || { type: "object", properties: {} },
			version,
			author: cube?.author || "المستخدم الحالي",
			isActive,
			createdAt: cube?.createdAt || new Date(),
			updatedAt: new Date(),
			metadata: {
				executionTime,
				memoryUsage,
				pricePer1000,
				requiresGPU,
				...cube?.metadata,
			},
		};

		onUpdate(updatedCube);
	};

	const handleAddTag = () => {
		if (newTag.trim() && !tags.includes(newTag.trim())) {
			setTags([...tags, newTag.trim()]);
			setNewTag("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const categoryOptions = [
		{
			value: "vision",
			label: "👁️ الرؤية الحاسوبية",
			description: "معالجة الصور والفيديو",
		},
		{
			value: "nlp",
			label: "💬 معالجة اللغة",
			description: "تحليل النصوص واللغات",
		},
		{
			value: "data",
			label: "📊 تحليل البيانات",
			description: "معالجة وتحليل البيانات",
		},
		{
			value: "integration",
			label: "🔗 التكامل",
			description: "تكامل مع أنظمة خارجية",
		},
		{
			value: "custom",
			label: "🎨 مخصص",
			description: "مكعب مخصص حسب الاحتياج",
		},
	];

	const performanceLevels = [
		{ time: 50, label: "سريع جداً", color: "bg-green-100 text-green-800" },
		{ time: 100, label: "سريع", color: "bg-blue-100 text-blue-800" },
		{ time: 500, label: "متوسط", color: "bg-yellow-100 text-yellow-800" },
		{ time: 1000, label: "بطيء", color: "bg-red-100 text-red-800" },
	];

	const getPerformanceLevel = (time: number) => {
		return (
			performanceLevels.find((level) => time <= level.time) ||
			performanceLevels[3]
		);
	};

	const performance = getPerformanceLevel(executionTime);

	if (!cube) {
		return (
			<Card>
				<CardContent className="p-6 text-center">
					<div className="text-gray-400 mb-4">
						<Cpu className="w-12 h-12 mx-auto" />
					</div>
					<h3 className="text-lg font-medium mb-2">لا يوجد مكعب محدد</h3>
					<p className="text-gray-500">
						اختر مكعباً من المكتبة أو أنشئ مكعباً جديداً لرؤية خصائصه
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* معلومات أساسية */}
			<div className="space-y-4">
				<div>
					<Label htmlFor="cube-name">اسم المكعب</Label>
					<Input
						id="cube-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="أدخل اسم المكعب"
					/>
				</div>

				<div>
					<Label htmlFor="cube-description">الوصف</Label>
					<Textarea
						id="cube-description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="صف وظيفة المكعب واستخداماته..."
						rows={3}
					/>
				</div>

				<div>
					<Label>الفئة</Label>
					<Select value={category} onValueChange={setCategory}>
						<SelectTrigger>
							<SelectValue placeholder="اختر فئة" />
						</SelectTrigger>
						<SelectContent>
							{categoryOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									<div className="flex items-center">
										<span className="ml-2">{option.label}</span>
										<span className="text-xs text-gray-500 mr-auto">
											{option.description}
										</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label>الوسوم</Label>
					<div className="flex space-x-2 mb-2">
						<Input
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							placeholder="أضف وسم جديد"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleAddTag();
								}
							}}
						/>
						<Button onClick={handleAddTag} size="sm">
							إضافة
						</Button>
					</div>
					<div className="flex flex-wrap gap-2">
						{tags.map((tag) => (
							<Badge
								key={tag}
								variant="secondary"
								className="flex items-center"
							>
								{tag}
								<button
									type="button"
									onClick={() => handleRemoveTag(tag)}
									className="mr-2 text-gray-500 hover:text-gray-700"
								>
									×
								</button>
							</Badge>
						))}
						{tags.length === 0 && (
							<span className="text-sm text-gray-500">لا توجد وسوم</span>
						)}
					</div>
				</div>
			</div>

			{/* إعدادات التقنية */}
			<div className="space-y-4 pt-4 border-t">
				<h4 className="font-medium flex items-center">
					<Settings className="w-4 h-4 ml-2" />
					الإعدادات التقنية
				</h4>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="cube-version">الإصدار</Label>
						<Input
							id="cube-version"
							value={version}
							onChange={(e) => setVersion(e.target.value)}
							placeholder="مثل: 1.0.0"
						/>
					</div>

					<div>
						<Label htmlFor="execution-time">وقت التنفيذ (مللي ثانية)</Label>
						<Input
							id="execution-time"
							type="number"
							value={executionTime}
							onChange={(e) => setExecutionTime(Number(e.target.value))}
							min={1}
							max={10000}
						/>
						<div className="mt-1">
							<Badge className={performance.color}>{performance.label}</Badge>
						</div>
					</div>

					<div>
						<Label htmlFor="memory-usage">استخدام الذاكرة (MB)</Label>
						<Input
							id="memory-usage"
							type="number"
							value={memoryUsage}
							onChange={(e) => setMemoryUsage(Number(e.target.value))}
							min={1}
							max={8192}
						/>
					</div>

					<div>
						<Label htmlFor="price">السعر لكل 1000 طلب ($)</Label>
						<Input
							id="price"
							type="number"
							value={pricePer1000}
							onChange={(e) => setPricePer1000(Number(e.target.value))}
							min={0}
							step="0.01"
						/>
					</div>
				</div>

				<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<div>
						<div className="font-medium">يتطلب بطاقة رسوميات (GPU)</div>
						<div className="text-sm text-gray-500">
							للمكعبات الثقيلة التي تحتاج معالجة متقدمة
						</div>
					</div>
					<Switch checked={requiresGPU} onCheckedChange={setRequiresGPU} />
				</div>

				<div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<div>
						<div className="font-medium">المكعب نشط</div>
						<div className="text-sm text-gray-500">
							سيظهر في المكتبة ويكون متاحاً للاستخدام
						</div>
					</div>
					<Switch checked={isActive} onCheckedChange={setIsActive} />
				</div>
			</div>

			{/* إحصائيات المكعب */}
			<div className="space-y-4 pt-4 border-t">
				<h4 className="font-medium flex items-center">
					<Zap className="w-4 h-4 ml-2" />
					إحصائيات المكعب
				</h4>

				<div className="grid grid-cols-2 gap-4">
					<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<div className="text-2xl font-bold">0</div>
						<div className="text-sm text-gray-500">مرات التنفيذ</div>
					</div>

					<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<div className="text-2xl font-bold">0</div>
						<div className="text-sm text-gray-500">المستخدمين</div>
					</div>

					<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<div className="text-2xl font-bold">100%</div>
						<div className="text-sm text-gray-500">معدل النجاح</div>
					</div>

					<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
						<div className="text-2xl font-bold">0</div>
						<div className="text-sm text-gray-500">التقييمات</div>
					</div>
				</div>
			</div>

			{/* معاينة مخطط الإدخال/الإخراج */}
			<div className="space-y-4 pt-4 border-t">
				<h4 className="font-medium flex items-center">
					<Code className="w-4 h-4 ml-2" />
					معاينة المخططات
				</h4>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label>مخطط الإدخال</Label>
						<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono overflow-auto max-h-32">
							{JSON.stringify(cube.inputSchema, null, 2)}
						</div>
					</div>

					<div>
						<Label>مخطط الإخراج</Label>
						<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm font-mono overflow-auto max-h-32">
							{JSON.stringify(cube.outputSchema, null, 2)}
						</div>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm" className="flex-1">
						<Eye className="w-4 h-4 ml-2" />
						معاينة الكود
					</Button>

					<Button variant="outline" size="sm" className="flex-1">
						<Database className="w-4 h-4 ml-2" />
						بيانات التجربة
					</Button>
				</div>
			</div>

			{/* أزرار الإجراءات */}
			<div className="pt-4 border-t">
				<Button onClick={handleSave} className="w-full">
					<Save className="w-4 h-4 ml-2" />
					حفظ التغييرات
				</Button>
			</div>

			{/* معلومات إضافية */}
			<div className="text-sm text-gray-500 space-y-1">
				<div className="flex justify-between">
					<span>تاريخ الإنشاء:</span>
					<span>{new Date(cube.createdAt).toLocaleString("ar-SA")}</span>
				</div>
				<div className="flex justify-between">
					<span>آخر تحديث:</span>
					<span>{new Date(cube.updatedAt).toLocaleString("ar-SA")}</span>
				</div>
				<div className="flex justify-between">
					<span>المؤلف:</span>
					<span>{cube.author}</span>
				</div>
				<div className="flex justify-between">
					<span>المعرف:</span>
					<span className="font-mono text-xs">{cube.id}</span>
				</div>
			</div>
		</div>
	);
}
