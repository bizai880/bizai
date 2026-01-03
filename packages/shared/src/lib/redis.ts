import { Redis } from "@upstash/redis";

// أنواع بيانات التخزين المؤقت
export interface CacheItem<T = unknown> {
	data: T;
	timestamp: number;
	ttl: number;
}

export class BizAICache {
	private redis: Redis;
	private prefix = "bizai:";

	constructor() {
		this.redis = new Redis({
			url: process.env.UPSTASH_REDIS_URL!,
			token: process.env.UPSTASH_REDIS_TOKEN!,
		});
	}

	// تخزين نتيجة AI مع TTL
	async setAIResult(
		key: string,
		data: unknown,
		ttl: number = 3600,
	): Promise<void> {
		const cacheItem: CacheItem = {
			data,
			timestamp: Date.now(),
			ttl,
		};

		await this.redis.set(`${this.prefix}ai:${key}`, JSON.stringify(cacheItem), {
			ex: ttl,
		});
	}

	// استرجاع نتيجة AI
	async getAIResult<T = unknown>(key: string): Promise<T | null> {
		const cached = await this.redis.get<string>(`${this.prefix}ai:${key}`);

		if (!cached) return null;

		const item: CacheItem<T> = JSON.parse(cached);

		// التحقق من انتهاء الصلاحية
		if (Date.now() > item.timestamp + item.ttl * 1000) {
			await this.redis.del(`${this.prefix}ai:${key}`);
			return null;
		}

		return item.data;
	}

	// تخزين حالة الطلب
	async setRequestStatus(requestId: string, status: unknown): Promise<void> {
		await this.redis.set(
			`${this.prefix}request:${requestId}`,
			JSON.stringify(status),
			{ ex: 86400 }, // 24 ساعة
		);
	}

	// استرجاع حالة الطلب
	async getRequestStatus(requestId: string): Promise<unknown> {
		const status = await this.redis.get(`${this.prefix}request:${requestId}`);
		return status ? JSON.stringify(status) : null;
	}

	// زيادة عداد الاستخدام
	async incrementCounter(key: string): Promise<number> {
		return await this.redis.incr(`${this.prefix}counter:${key}`);
	}

	// الحصول على الإحصائيات
	async getStats(): Promise<unknown> {
		const keys = await this.redis.keys(`${this.prefix}*`);
		const stats: unknown = {};

		for (const key of keys) {
			const type = key.split(":")[1];
			stats[type] = (stats[type] || 0) + 1;
		}

		return stats;
	}

	// تنظيف الذاكرة المؤقتة
	async clearPattern(pattern: string): Promise<void> {
		const keys = await this.redis.keys(`${this.prefix}${pattern}*`);
		if (keys.length > 0) {
			await this.redis.del(...keys);
		}
	}
}

// إنشاء نسخة وحيدة (Singleton)
export const cache = new BizAICache();
