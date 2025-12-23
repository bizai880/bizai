export interface ActivityLog {
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logActivity(activity: ActivityLog): Promise<{ success: boolean; logId?: string }> {
  try {
    console.log(`Logging activity: ${activity.userId} - ${activity.action}`);
    
    // Simulate logging
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      success: true,
      logId: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    };
  } catch (error) {
    console.error('Activity logging failed:', error);
    return { success: false };
  }
}

export default logActivity;
