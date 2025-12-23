interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'success' | 'error';
    text?: string;
}

export default function StatusBadge({ status, text }: StatusBadgeProps) {
    const statusConfig = {
        active: { bg: 'bg-green-100', text: 'text-green-800', defaultText: 'Active' },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-800', defaultText: 'Inactive' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', defaultText: 'Pending' },
        success: { bg: 'bg-green-100', text: 'text-green-800', defaultText: 'Success' },
        error: { bg: 'bg-red-100', text: 'text-red-800', defaultText: 'Error' },
    };

    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${config.text.replace('text-', 'bg-')}`}></span>
            {text || config.defaultText}
        </span>
    );
}
