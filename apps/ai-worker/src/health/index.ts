export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
        database: boolean;
        cache: boolean;
        aiService: boolean;
    };
}

export async function getHealthStatus(): Promise<HealthStatus> {
    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: true,
            cache: true,
            aiService: true
        }
    };
}

// تصدير افتراضي
export default {
    getHealthStatus
};
