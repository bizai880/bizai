export default function UserProfile() {
	const user = {
		name: "John Doe",
		email: "john.doe@example.com",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
		role: "Administrator",
		joinDate: "January 15, 2023",
		lastLogin: "2 hours ago",
	};

	return (
		<div className="p-6 bg-white rounded-lg shadow">
			<div className="flex items-center space-x-4 mb-6">
				<div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
					👤
				</div>
				<div>
					<h2 className="text-2xl font-bold">{user.name}</h2>
					<p className="text-gray-600">{user.email}</p>
					<span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
						{user.role}
					</span>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div className="p-3 bg-gray-50 rounded">
					<p className="text-sm text-gray-500">Join Date</p>
					<p className="font-medium">{user.joinDate}</p>
				</div>
				<div className="p-3 bg-gray-50 rounded">
					<p className="text-sm text-gray-500">Last Login</p>
					<p className="font-medium">{user.lastLogin}</p>
				</div>
			</div>
			<div className="mt-6 pt-6 border-t">
				<h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
				<div className="space-y-3">
					<button className="w-full text-left p-3 hover:bg-gray-50 rounded border">
						Edit Profile Information
					</button>
					<button className="w-full text-left p-3 hover:bg-gray-50 rounded border">
						Change Password
					</button>
					<button className="w-full text-left p-3 hover:bg-gray-50 rounded border">
						Notification Settings
					</button>
					<button className="w-full text-left p-3 hover:bg-gray-50 rounded border text-red-600">
						Delete Account
					</button>
				</div>
			</div>
		</div>
	);
}
