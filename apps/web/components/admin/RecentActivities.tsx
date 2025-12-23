export default function RecentActivities() {
    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                            <div>
                                <p className="text-sm font-medium">Activity {i}</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Completed</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
