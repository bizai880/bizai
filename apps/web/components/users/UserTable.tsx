"use client";

import dynamic from "next/dynamic";
const MotionDiv = dynamic(
	() => import("framer-motion").then((mod) => ({ default: mod.motion.div })),
	{ ssr: false },
);
import {
	Mail,
	Shield,
	Crown,
	User,
	Calendar,
	CheckCircle,
	XCircle,
	MoreVertical,
	ChevronDown,
} from "lucide-react";

interface User {
	id: string;
	email: string;
	full_name: string;
	role: string;
	subscription: string;
	last_sign_in_at: string;
	email_verified: boolean;
	created_at: string;
	requests_count: number;
}

interface UserTableProps {
	users: User[];
	selectedUser: User | null;
	onSelectUser: (user: User) => void;
	onRoleChange: (userId: string, newRole: string) => void;
	onDeleteUser: (userId: string) => void;
	isLoading: boolean;
}

export default function UserTable({
	users,
	selectedUser,
	onSelectUser,
	onRoleChange,
	onDeleteUser,
	isLoading,
}: UserTableProps) {
	const getRoleIcon = (role: string) => {
		switch (role) {
			case "admin":
				return <Shield className="w-4 h-4 text-purple-500" />;
			case "moderator":
				return <Crown className="w-4 h-4 text-yellow-500" />;
			default:
				return <User className="w-4 h-4 text-blue-500" />;
		}
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-purple-500/10 text-purple-500 border-purple-500/20";
			case "moderator":
				return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
			default:
				return "bg-blue-500/10 text-blue-500 border-blue-500/20";
		}
	};

	const getSubscriptionColor = (subscription: string) => {
		switch (subscription) {
			case "enterprise":
				return "bg-gradient-primary text-white";
			case "pro":
				return "bg-accent/20 text-accent border-accent/30";
			default:
				return "bg-success/10 text-success border-success/20";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("ar-EG", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (isLoading) {
		return (
			<div className="glass-card p-8 text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
				<p className="mt-4 text-text-secondary">جاري تحميل المستخدمين...</p>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="glass-card p-8 text-center">
				<div className="w-16 h-16 bg-background-lighter rounded-full flex items-center justify-center mx-auto mb-4">
					<User className="w-8 h-8 text-text-secondary" />
				</div>
				<h3 className="text-lg font-medium text-text-primary mb-2">
					لا يوجد مستخدمين
				</h3>
				<p className="text-text-secondary">
					لم يتم العثور على مستخدمين مطابقين للبحث
				</p>
			</div>
		);
	}

	return (
		<div className="glass-card overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-border">
							<th className="text-right py-4 px-6 text-sm font-medium text-text-secondary">
								المستخدم
							</th>
							<th className="text-right py-4 px-6 text-sm font-medium text-text-secondary">
								الصلاحية
							</th>
							<th className="text-right py-4 px-6 text-sm font-medium text-text-secondary">
								الاشتراك
							</th>
							<th className="text-right py-4 px-6 text-sm font-medium text-text-secondary">
								الحالة
							</th>
							<th className="text-right py-4 px-6 text-sm font-medium text-text-secondary">
								آخر دخول
							</th>
							<th className="text-right py-4 px-6 text-sm font-medium text-text-secondary">
								الإجراءات
							</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user, index) => (
							<motion.tr
								key={user.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.05 }}
								className={`border-b border-border last:border-0 hover:bg-background-hover transition-colors ${
									selectedUser?.id === user.id ? "bg-primary/5" : ""
								}`}
								onClick={() => onSelectUser(user)}
							>
								<td className="py-4 px-6">
									<div className="flex items-center">
										<div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold ml-3">
											{user.full_name?.[0] || user.email[0].toUpperCase()}
										</div>
										<div>
											<div className="font-medium text-text-primary">
												{user.full_name || "بدون اسم"}
											</div>
											<div className="text-sm text-text-secondary flex items-center">
												<Mail className="w-3 h-3 ml-1" />
												{user.email}
											</div>
										</div>
									</div>
								</td>

								<td className="py-4 px-6">
									<div className="flex items-center">
										{getRoleIcon(user.role)}
										<select
											value={user.role}
											onChange={(e) => onRoleChange(user.id, e.target.value)}
											className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)} focus:outline-none focus:ring-2 focus:ring-primary/30`}
											onClick={(e) => e.stopPropagation()}
										>
											<option value="user">مستخدم</option>
											<option value="moderator">مشرف</option>
											<option value="admin">مدير</option>
										</select>
									</div>
								</td>

								<td className="py-4 px-6">
									<span
										className={`px-3 py-1 rounded-full text-xs font-medium border ${getSubscriptionColor(user.subscription)}`}
									>
										{user.subscription === "enterprise"
											? "مؤسسة"
											: user.subscription === "pro"
												? "احترافي"
												: "مجاني"}
									</span>
								</td>

								<td className="py-4 px-6">
									<div className="flex items-center">
										{user.email_verified ? (
											<>
												<CheckCircle className="w-4 h-4 text-success ml-1" />
												<span className="text-success text-sm">نشط</span>
											</>
										) : (
											<>
												<XCircle className="w-4 h-4 text-error ml-1" />
												<span className="text-error text-sm">غير مؤكد</span>
											</>
										)}
									</div>
								</td>

								<td className="py-4 px-6 text-sm text-text-secondary">
									<div className="flex items-center">
										<Calendar className="w-3 h-3 ml-1" />
										{formatDate(user.last_sign_in_at)}
									</div>
								</td>

								<td className="py-4 px-6">
									<div
										className="flex items-center space-x-2"
										onClick={(e) => e.stopPropagation()}
									>
										<button
											onClick={() => onDeleteUser(user.id)}
											className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
										>
											حذف
										</button>
										<button className="p-2 text-text-secondary hover:bg-background-hover rounded-lg">
											<MoreVertical className="w-4 h-4" />
										</button>
									</div>
								</td>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between p-4 border-t border-border">
				<div className="text-sm text-text-secondary">
					عرض 1-{users.length} من {users.length}
				</div>
				<div className="flex items-center space-x-2">
					<button className="p-2 rounded-lg border border-border hover:bg-background-hover">
						السابق
					</button>
					<button className="p-2 rounded-lg border border-border bg-primary text-white">
						1
					</button>
					<button className="p-2 rounded-lg border border-border hover:bg-background-hover">
						2
					</button>
					<button className="p-2 rounded-lg border border-border hover:bg-background-hover">
						التالي
					</button>
				</div>
			</div>
		</div>
	);
}
