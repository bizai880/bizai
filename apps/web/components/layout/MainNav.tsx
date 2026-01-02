"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	Users,
	Settings,
	Bell,
	HelpCircle,
	LogOut,
	ChevronDown,
	Menu,
	X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import NotificationBell from "@/components/notifications/NotificationBell";
import dynamic from "next/dynamic";
const MotionDiv = dynamic(
	() => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
	{ ssr: false },
);

export default function MainNav() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const pathname = usePathname();
	const { user, signOut } = useAuth();

	const navItems = [
		{
			href: "/dashboard",
			label: "لوحة التحكم",
			icon: <LayoutDashboard className="w-4 h-4" />,
		},
		{
			href: "/dashboard/users",
			label: "المستخدمين",
			icon: <Users className="w-4 h-4" />,
		},
		{
			href: "/dashboard/settings",
			label: "الإعدادات",
			icon: <Settings className="w-4 h-4" />,
		},
	];

	const handleLogout = async () => {
		try {
			await signOut();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	if (pathname?.startsWith("/auth")) {
		return null;
	}

	return (
		<nav className="nav-blur fixed top-0 w-full z-50">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
							<span className="text-white font-bold">ب</span>
						</div>
						<div>
							<span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
								BizAI
							</span>
							<span className="text-text-secondary text-sm block">Factory</span>
						</div>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-1">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-300 ${
									pathname === item.href
										? "bg-primary text-white"
										: "text-text-secondary hover:text-text-primary hover:bg-background-hover"
								}`}
							>
								<span className="ml-2">{item.icon}</span>
								{item.label}
							</Link>
						))}
					</div>

					{/* Right Section */}
					<div className="flex items-center space-x-3">
						{/* Notifications */}
						<NotificationBell />

						{/* Help */}
						<button className="p-2 rounded-lg hover:bg-background-hover transition-colors">
							<HelpCircle className="w-5 h-5 text-text-secondary hover:text-text-primary" />
						</button>

						{/* Profile Dropdown */}
						<div className="relative">
							<button
								onClick={() => setIsProfileOpen(!isProfileOpen)}
								className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background-hover transition-colors"
							>
								<div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
									{user?.email?.[0].toUpperCase() || "U"}
								</div>
								<div className="text-right hidden md:block">
									<div className="text-sm font-medium text-text-primary">
										{user?.user_metadata?.full_name || "مستخدم"}
									</div>
									<div className="text-xs text-text-secondary">
										{user?.email}
									</div>
								</div>
								<ChevronDown
									className={`w-4 h-4 text-text-secondary transition-transform ${
										isProfileOpen ? "rotate-180" : ""
									}`}
								/>
							</button>

							{/* Dropdown Menu */}
							<AnimatePresence>
								{isProfileOpen && (
									<motion.div
										initial={{ opacity: 0, y: 10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 10, scale: 0.95 }}
										className="absolute left-0 mt-2 w-64 glass-card rounded-xl shadow-2xl overflow-hidden"
									>
										<div className="p-4 border-b border-border">
											<div className="flex items-center space-x-3">
												<div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
													{user?.email?.[0].toUpperCase() || "U"}
												</div>
												<div>
													<div className="font-medium text-text-primary">
														{user?.user_metadata?.full_name || "مستخدم"}
													</div>
													<div className="text-sm text-text-secondary">
														{user?.email}
													</div>
												</div>
											</div>
										</div>

										<div className="p-2">
											<Link
												href="/dashboard/profile"
												className="flex items-center px-3 py-2 rounded-lg hover:bg-background-hover transition-colors"
											>
												<Settings className="w-4 h-4 ml-2 text-text-secondary" />
												<span>الملف الشخصي</span>
											</Link>
											<Link
												href="/dashboard/settings"
												className="flex items-center px-3 py-2 rounded-lg hover:bg-background-hover transition-colors"
											>
												<Settings className="w-4 h-4 ml-2 text-text-secondary" />
												<span>الإعدادات</span>
											</Link>
											<button
												onClick={handleLogout}
												className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-error/10 text-error transition-colors"
											>
												<LogOut className="w-4 h-4 ml-2" />
												<span>تسجيل الخروج</span>
											</button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="md:hidden p-2 rounded-lg hover:bg-background-hover transition-colors"
						>
							{isMenuOpen ? (
								<X className="w-5 h-5 text-text-primary" />
							) : (
								<Menu className="w-5 h-5 text-text-primary" />
							)}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{isMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="md:hidden overflow-hidden"
						>
							<div className="py-4 space-y-2 border-t border-border">
								{navItems.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
											pathname === item.href
												? "bg-primary text-white"
												: "text-text-secondary hover:text-text-primary hover:bg-background-hover"
										}`}
										onClick={() => setIsMenuOpen(false)}
									>
										<span className="ml-3">{item.icon}</span>
										{item.label}
									</Link>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</nav>
	);
}
