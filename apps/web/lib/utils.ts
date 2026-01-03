import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// أدوات مساعدة للغة العربية
export const arabicUtils = {
	// تقطيع النص العربي مع الحفاظ على الاتصال
	truncate: (text: string, length: number): string => {
		if (text.length <= length) return text;
		return `${text.substring(0, length)}...`;
	},

	// تحويل الأرقام إلى عربية
	toArabicNumbers: (num: number | string): string => {
		const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
		return num
			.toString()
			.replace(/\d/g, (digit) => arabicDigits[parseInt(digit, 10)]);
	},

	// تنسيق التاريخ العربي
	formatDate: (date: Date | string): string => {
		const d = new Date(date);
		const options: Intl.DateTimeFormatOptions = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "Asia/Riyadh",
		};
		return d.toLocaleDateString("ar-SA", options);
	},

	// تنسيق الوقت العربي
	formatTime: (date: Date | string): string => {
		const d = new Date(date);
		return d.toLocaleTimeString("ar-SA", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Riyadh",
		});
	},

	// التحقق إذا كان النص عربي
	isArabic: (text: string): boolean => {
		const arabicRegex =
			/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
		return arabicRegex.test(text);
	},

	// عكس النص إذا كان مختلط العربية والإنجليزية
	fixMixedText: (text: string): string => {
		if (!arabicUtils.isArabic(text)) return text;

		// فصل الكلمات والعكس عند الحاجة
		const words = text.split(" ");
		const fixedWords = words.map((word) => {
			if (arabicUtils.isArabic(word)) {
				return word;
			}
			return word.split("").reverse().join("");
		});

		return fixedWords.join(" ");
	},
};
