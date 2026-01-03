"use client";

import {
	BarChart3,
	CreditCard,
	TrendingDown,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";

import dynamic from "next/dynamic";

const _MotionDiv = dynamic(
	() => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
	{ ssr: false },
);

interface AdminStatsProps {
	stats?: {
		totalUsers: number;
		activeUsers: number;
		totalRevenue: number;
		monthlyGrowth: number;
		totalRequests: number;
		successRate: number;
		storageUsed: number;
		storageTotal: number;
	};
}

export default function AdminStats({ stats }: AdminStatsProps) {
	const defaultStats = {
		totalUsers: 1254,
		activeUsers: 892,
		totalRevenue: 45230,
		monthlyGrowth: 12.5,
		totalRequests: 12458,
		successRate: 94.2,
		storageUsed: 245,
		storageTotal: 1000,
	};

	const data = stats || defaultStats;

	const statCards = [
		{
			title: "إجمالي المستخدمين",
			value: data.totalUsers.toLocaleString(),
			change: `+${((data.activeUsers / data.totalUsers) * 100).toFixed(1)}% نشط`,
			icon: <Users className="w-6 h-6" />,
			color: "from-blue-500 to-cyan-400",
			trend: "up",
		},
		{
			title: "الإيرادات",
			value: `$${data.totalRevenue.toLocaleString()}`,
			change: `${data.monthlyGrowth > 0 ? "+" : ""}${data.monthlyGrowth}% عن الشهر الماضي`,
			icon: <CreditCard className="w-6 h-6" />,
			color: "from-green-500 to-emerald-400",
			trend: data.monthlyGrowth > 0 ? "up" : "down",
		},
		{
			title: "الطلبات",
			value: data.totalRequests.toLocaleString(),
			change: `${data.successRate}% نجاح`,
			icon: <BarChart3 className="w-6 h-6" />,
			color: "from-purple-500 to-purple-400",
			trend: data.successRate > 90 ? "up" : "down",
		},
		{
			title: "التخزين",
			value: `${data.storageUsed}GB`,
			change: `${((data.storageUsed / data.storageTotal) * 100).toFixed(1)}% مستخدم`,
			icon: <Zap className="w-6 h-6" />,
			color: "from-orange-500 to-yellow-400",
			trend: data.storageUsed / data.storageTotal > 0.8 ? "up" : "steady",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{statCards.map((stat, index) => (
				<motion.div
					key={stat.title}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: index * 0.1 }}
					className="glass-card p-6"
				>
					<div className="flex items-start justify-between mb-4">
						<div
							className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3`}
						>
							{stat.icon}
						</div>
						<div
							className={`flex items-center text-sm px-2 py-1 rounded-full ${
								stat.trend === "up"
									? "bg-success/10 text-success"
									: stat.trend === "down"
										? "bg-error/10 text-error"
										: "bg-warning/10 text-warning"
							}`}
						>
							{stat.trend === "up" ? (
								<TrendingUp className="w-3 h-3 ml-1" />
							) : stat.trend === "down" ? (
								<TrendingDown className="w-3 h-3 ml-1" />
							) : null}
							{stat.change}
						</div>
					</div>

					<div className="mb-2">
						<div className="text-3xl font-bold text-text-primary">
							{stat.value}
						</div>
						<div className="text-sm text-text-secondary">{stat.title}</div>
					</div>

					<div className="h-2 bg-background-lighter rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
							style={{
								width:
									stat.title === "التخزين"
										? `${(data.storageUsed / data.storageTotal) * 100}%`
										: "75%",
							}}
						/>
					</div>
				</motion.div>
			))}
		</div>
	);
}
