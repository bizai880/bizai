"use client";

import { useState } from "react";
import {
	Check,
	X,
	AlertCircle,
	CheckCircle,
	Info,
	AlertTriangle,
	Clock,
	ExternalLink,
} from "lucide-react";
import { useNotifications } from "./NotificationProvider";
import dynamic from "next/dynamic";
const MotionDiv = dynamic(
	() => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
	{ ssr: false },
);

export default function NotificationList() {
	const { notifications, markAsRead, deleteNotification } = useNotifications();
	const [activeTab, setActiveTab] = useState<"all" | "unread">("unread");

	const filteredNotifications = notifications.filter((notif) =>
		activeTab === "unread" ? !notif.read : true,
	);

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "success":
				return <CheckCircle className="w-4 h-4 text-success" />;
			case "error":
				return <X className="w-4 h-4 text-error" />;
			case "warning":
				return <AlertTriangle className="w-4 h-4 text-warning" />;
			default:
				return <Info className="w-4 h-4 text-info" />;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "success":
				return "bg-success/10 border-success/20";
			case "error":
				return "bg-error/10 border-error/20";
			case "warning":
				return "bg-warning/10 border-warning/20";
			default:
				return "bg-info/10 border-info/20";
		}
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return "الآن";
		if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
		if (diffHours < 24) return `قبل ${diffHours} ساعة`;
		if (diffDays < 7) return `قبل ${diffDays} يوم`;
		return date.toLocaleDateString("ar-EG");
	};

	if (filteredNotifications.length === 0) {
		return (
			<div className="p-8 text-center">
				<div className="w-16 h-16 bg-background-lighter rounded-full flex items-center justify-center mx-auto mb-4">
					<Check className="w-8 h-8 text-text-secondary" />
				</div>
				<h3 className="text-lg font-medium text-text-primary mb-2">
					لا توجد إشعارات
				</h3>
				<p className="text-text-secondary">
					{activeTab === "unread"
						? "جميع إشعاراتك مقروءة"
						: "لم تتلق أي إشعارات بعد"}
				</p>
			</div>
		);
	}

	return (
		<div>
			{/* Tabs */}
			<div className="flex border-b border-border">
				<button
					onClick={() => setActiveTab("unread")}
					className={`flex-1 py-3 text-sm font-medium ${
						activeTab === "unread"
							? "text-primary border-b-2 border-primary"
							: "text-text-secondary hover:text-text-primary"
					}`}
				>
					غير المقروء
				</button>
				<button
					onClick={() => setActiveTab("all")}
					className={`flex-1 py-3 text-sm font-medium ${
						activeTab === "all"
							? "text-primary border-b-2 border-primary"
							: "text-text-secondary hover:text-text-primary"
					}`}
				>
					الكل
				</button>
			</div>

			{/* Notifications */}
			<div className="divide-y divide-border">
				{filteredNotifications.slice(0, 10).map((notification, index) => (
					<motion.div
						key={notification.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: index * 0.05 }}
						className={`p-4 hover:bg-background-hover transition-colors ${
							!notification.read ? "bg-primary/5" : ""
						}`}
					>
						<div className="flex items-start">
							{/* Icon */}
							<div
								className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)} ml-3`}
							>
								{getTypeIcon(notification.type)}
							</div>

							{/* Content */}
							<div className="flex-1">
								<div className="flex items-start justify-between mb-1">
									<h4
										className={`font-medium ${
											!notification.read
												? "text-text-primary"
												: "text-text-secondary"
										}`}
									>
										{notification.title}
									</h4>
									<div className="flex items-center space-x-2">
										<span className="text-xs text-text-secondary flex items-center">
											<Clock className="w-3 h-3 ml-1" />
											{formatTime(notification.created_at)}
										</span>
										{notification.important && (
											<span className="w-2 h-2 bg-accent rounded-full"></span>
										)}
									</div>
								</div>

								<p className="text-sm text-text-secondary mb-2">
									{notification.message}
								</p>

								{/* Actions */}
								<div className="flex items-center space-x-3 mt-2">
									{!notification.read && (
										<button
											onClick={() => markAsRead(notification.id)}
											className="text-xs text-primary hover:text-primary-light flex items-center"
										>
											<Check className="w-3 h-3 ml-1" />
											تحديد كمقروء
										</button>
									)}
									{notification.data?.link && (
										<a
											href={notification.data.link}
											className="text-xs text-info hover:text-info-light flex items-center"
										>
											<ExternalLink className="w-3 h-3 ml-1" />
											عرض التفاصيل
										</a>
									)}
									<button
										onClick={() => deleteNotification(notification.id)}
										className="text-xs text-error hover:text-error-light flex items-center"
									>
										حذف
									</button>
								</div>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	);
}
