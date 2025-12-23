export default function BillingOverview() {
    const billingData = [
        { month: 'Jan', revenue: 4000, expenses: 2400 },
        { month: 'Feb', revenue: 3000, expenses: 1398 },
        { month: 'Mar', revenue: 9800, expenses: 2000 },
        { month: 'Apr', revenue: 3908, expenses: 2780 },
        { month: 'May', revenue: 4800, expenses: 1890 },
    ];

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Billing Overview</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="text-2xl font-bold">$12,450.75</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="text-lg font-semibold">May 15, 2024</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-lg font-bold text-green-700">$8,450</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm text-gray-600">Expenses</p>
                        <p className="text-lg font-bold text-blue-700">$3,240</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                        <p className="text-sm text-gray-600">Profit</p>
                        <p className="text-lg font-bold text-purple-700">$5,210</p>
                    </div>
                </div>
                <div className="pt-4 border-t">
                    <h4 className="text-md font-medium mb-2">Monthly Summary</h4>
                    <div className="space-y-2">
                        {billingData.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span className="text-sm">{item.month}</span>
                                <div className="flex space-x-4">
                                    <span className="text-sm text-green-600">+${item.revenue}</span>
                                    <span className="text-sm text-red-600">-${item.expenses}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
