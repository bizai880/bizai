import type * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
	return (
		<div
			className={cn(
				"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2",
				{
					"border-transparent bg-blue-600 dark:bg-blue-500 text-gray-50 hover:bg-blue-600/80 dark:hover:bg-blue-500/80":
						variant === "default",
					"border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80":
						variant === "secondary",
					"border-transparent bg-red-500 dark:bg-red-600 text-gray-50 hover:bg-red-500/80 dark:hover:bg-red-600/80":
						variant === "destructive",
					"border-gray-200 dark:border-gray-700 bg-transparent text-gray-950 dark:text-gray-50":
						variant === "outline",
				},
				className,
			)}
			{...props}
		/>
	);
}

export { Badge };
