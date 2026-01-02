export default function UserManagement() {
	const users = [
		{
			id: 1,
			name: "John Doe",
			email: "john@example.com",
			role: "Admin",
			status: "Active",
		},
		{
			id: 2,
			name: "Jane Smith",
			email: "jane@example.com",
			role: "User",
			status: "Active",
		},
		{
			id: 3,
			name: "Bob Johnson",
			email: "bob@example.com",
			role: "User",
			status: "Inactive",
		},
	];

	return (
		<div className="p-4 bg-white rounded-lg shadow">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">User Management</h3>
				<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
					Add User
				</button>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead>
						<tr>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
								Name
							</th>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
								Email
							</th>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
								Role
							</th>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
								Status
							</th>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{users.map((user) => (
							<tr key={user.id}>
								<td className="px-4 py-3 text-sm">{user.name}</td>
								<td className="px-4 py-3 text-sm">{user.email}</td>
								<td className="px-4 py-3 text-sm">
									<span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
										{user.role}
									</span>
								</td>
								<td className="px-4 py-3 text-sm">
									<span
										className={`px-2 py-1 text-xs rounded ${user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
									>
										{user.status}
									</span>
								</td>
								<td className="px-4 py-3 text-sm">
									<button className="text-blue-600 hover:text-blue-800 mr-3">
										Edit
									</button>
									<button className="text-red-600 hover:text-red-800">
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
