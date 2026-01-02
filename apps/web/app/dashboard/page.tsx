// app/dashboard/page.tsx
import DashboardCard from "@/components/DashboardCard";

export default function DashboardPage() {
	const cards = [
		{
			title: "لوحة تحكم المبيعات",
			type: "dashboard",
			color: "from-blue-500 to-cyan-400",
			index: 0,
		},
		{
			title: "تتبع العملاء",
			type: "tracking",
			color: "from-purple-500 to-pink-400",
			index: 1,
		},
		{
			title: "تحليل الأداء",
			type: "analytics",
			color: "from-green-500 to-emerald-400",
			index: 2,
		},
		{
			title: "تقارير الموظفين",
			type: "dashboard",
			color: "from-orange-500 to-amber-400",
			index: 3,
		},
		{
			title: "إدارة المشاريع",
			type: "tracking",
			color: "from-red-500 to-rose-400",
			index: 4,
		},
		{
			title: "لوحة التحكم المالية",
			type: "analytics",
			color: "from-indigo-500 to-violet-400",
			index: 5,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-background-dark p-4 md:p-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-text-primary">
					لوحة التحكم الرئيسية
				</h1>
				<p className="text-text-secondary mt-2">
					مرحباً بعودتك! هنا نظرة عامة على أداء نظامك.
				</p>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{cards.map((card) => (
					<DashboardCard
						key={card.index}
						title={card.title}
						type={card.type}
						color={card.color}
						index={card.index}
					/>
				))}
			</div>

			{/* إحصائيات إضافية */}
			<div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="glass-card p-4">
					<h3 className="text-lg font-semibold text-text-primary">
						إجمالي المستخدمين
					</h3>
					<p className="text-3xl font-bold text-primary mt-2">1,847</p>
				</div>
				<div className="glass-card p-4">
					<h3 className="text-lg font-semibold text-text-primary">
						النشاط اليومي
					</h3>
					<p className="text-3xl font-bold text-green-500 mt-2">+12.5%</p>
				</div>
				<div className="glass-card p-4">
					<h3 className="text-lg font-semibold text-text-primary">
						المهام المكتملة
					</h3>
					<p className="text-3xl font-bold text-purple-500 mt-2">89%</p>
				</div>
				<div className="glass-card p-4">
					<h3 className="text-lg font-semibold text-text-primary">
						وقت التشغيل
					</h3>
					<p className="text-3xl font-bold text-blue-500 mt-2">99.9%</p>
				</div>
			</div>
		</div>
	);
}
