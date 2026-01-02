"use client";

import { Bell, Check, Settings, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import NotificationList from "./NotificationList";
import { useNotifications } from "./NotificationProvider";

const MotionDiv = dynamic(
	() => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
	{ ssr: false },
);

export default function NotificationBell() {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { unreadCount, markAllAsRead } = useNotifications();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleBellClick = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Bell Button */}
			<button
				onClick={handleBellClick}
				className="relative p-2 rounded-lg hover:bg-background-hover transition-colors duration-300"
			>
				<Bell className="w-5 h-5 text-text-secondary hover:text-text-primary" />

				{/* Badge for unread notifications */}
				{unreadCount > 0 && (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center"
					>
						{unreadCount > 9 ? "9+" : unreadCount}
					</motion.div>
				)}
			</button>

			{/* Dropdown */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute left-0 mt-2 w-96 glass-card rounded-xl shadow-2xl z-50 overflow-hidden"
					>
						{/* Header */}
						<div className="p-4 border-b border-border">
							<div className="flex items-center justify-between mb-2">
								<h3 className="font-semibold text-text-primary">الإشعارات</h3>
								<div className="flex items-center space-x-2">
									<button
										onClick={markAllAsRead}
										className="text-sm text-primary hover:text-primary-light flex items-center"
										disabled={unreadCount === 0}
									>
										<Check className="w-4 h-4 ml-1" />
										تحديد الكل كمقروء
									</button>
									<button className="text-text-secondary hover:text-text-primary">
										<Settings className="w-4 h-4" />
									</button>
								</div>
							</div>

							<div className="text-sm text-text-secondary">
								{unreadCount} إشعار غير مقروء
							</div>
						</div>

						{/* Notifications List */}
						<div className="max-h-96 overflow-y-auto">
							<NotificationList />
						</div>

						{/* Footer */}
						<div className="p-3 border-t border-border bg-background-lighter">
							<div className="flex items-center justify-between">
								<button className="text-sm text-primary hover:text-primary-light">
									عرض جميع الإشعارات
								</button>
								<button className="text-sm text-text-secondary hover:text-text-primary flex items-center">
									<Trash2 className="w-4 h-4 ml-1" />
									مسح الكل
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
