"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

interface AIRequest {
	prompt: string;
	type?: "excel" | "dashboard" | "tracking";
	options?: any;
}

interface AIResponse {
	success: boolean;
	requestId: string;
	message: string;
	statusUrl: string;
}

export function useAI() {
	const [isLoading, setIsLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<any>(null);

	const generate = useCallback(
		async (request: AIRequest): Promise<AIResponse> => {
			setIsLoading(true);
			setProgress(0);
			setResult(null);

			try {
				const interval = setInterval(() => {
					setProgress((prev) => Math.min(prev + 10, 90));
				}, 500);

				const response = await fetch("/api/ai/generate", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("access_token")}`,
					},
					body: JSON.stringify(request),
				});

				clearInterval(interval);

				if (!response.ok) {
					const error = await response.json();
					throw new Error(error.error || "فشل في معالجة الطلب");
				}

				const data = await response.json();
				setProgress(100);
				setResult(data);

				// بدء تتبع الحالة
				if (data.requestId) {
					trackStatus(data.requestId);
				}

				toast.success("تم بدء معالجة طلبك بنجاح");
				return data;
			} catch (error: any) {
				toast.error(error.message || "حدث خطأ أثناء المعالجة");
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[trackStatus],
	);

	const trackStatus = useCallback(async (requestId: string) => {
		const checkStatus = async () => {
			try {
				const response = await fetch(`/api/ai/status/${requestId}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("access_token")}`,
					},
				});

				if (response.ok) {
					const data = await response.json();

					if (data.data.status === "completed") {
						toast.success("تم الانتهاء من معالجة طلبك!");
						setResult(data.data);
						return true;
					} else if (data.data.status === "failed") {
						toast.error("فشلت معالجة الطلب");
						return true;
					}
				}

				return false;
			} catch (error) {
				console.error("Error checking status:", error);
				return false;
			}
		};

		// فحص كل 3 ثواني لمدة دقيقة
		let attempts = 0;
		const maxAttempts = 20;

		const interval = setInterval(async () => {
			attempts++;
			const isDone = await checkStatus();

			if (isDone || attempts >= maxAttempts) {
				clearInterval(interval);
			}
		}, 3000);
	}, []);

	const analyze = useCallback(async (description: string) => {
		try {
			const response = await fetch("/api/ai/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ description }),
			});

			if (!response.ok) {
				throw new Error("فشل في تحليل الوصف");
			}

			return await response.json();
		} catch (error) {
			toast.error("فشل في تحليل الوصف");
			throw error;
		}
	}, []);

	const getTemplates = useCallback(async () => {
		try {
			const response = await fetch("/api/ai/templates");

			if (!response.ok) {
				throw new Error("فشل في جلب القوالب");
			}

			return await response.json();
		} catch (error) {
			toast.error("فشل في جلب القوالب");
			throw error;
		}
	}, []);

	return {
		generate,
		analyze,
		getTemplates,
		isLoading,
		progress,
		result,
		reset: () => {
			setResult(null);
			setProgress(0);
		},
	};
}
