// Simple in-memory cache system

interface CacheItem {
	value: unknown;
	expiresAt: number | null;
}

class MemoryCache {
	private store = new Map<string, CacheItem>();
	private defaultTTL = 60 * 60 * 1000; // 1 hour in milliseconds

	async get<T>(key: string): Promise<T | null> {
		const item = this.store.get(key);

		if (!item) return null;

		// Check if expired
		if (item.expiresAt && Date.now() > item.expiresAt) {
			this.store.delete(key);
			return null;
		}

		return item.value as T;
	}

	async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
		const expiresAt = ttlMs ? Date.now() + ttlMs : null;
		this.store.set(key, { value, expiresAt });
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}

	async has(key: string): Promise<boolean> {
		const item = this.store.get(key);
		if (!item) return false;

		if (item.expiresAt && Date.now() > item.expiresAt) {
			this.store.delete(key);
			return false;
		}

		return true;
	}

	async clear(): Promise<void> {
		this.store.clear();
	}

	async getOrSet<T>(
		key: string,
		fetcher: () => Promise<T>,
		ttlMs?: number,
	): Promise<T> {
		const cached = await this.get<T>(key);
		if (cached !== null) return cached;

		const value = await fetcher();
		await this.set(key, value, ttlMs);
		return value;
	}
}

// Export singleton instance
export const cache = new MemoryCache();

// Helper functions
export async function cached<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttlMs?: number,
): Promise<T> {
	return cache.getOrSet(key, fetcher, ttlMs);
}

export async function clearCache(): Promise<void> {
	await cache.clear();
}
