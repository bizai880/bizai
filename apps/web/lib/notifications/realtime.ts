import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface NotificationEvent {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  important: boolean
}

class RealtimeNotificationService {
  private supabase = createClient()
  private channel: any = null
  private callbacks: ((notification: NotificationEvent) => void)[] = []

  // الاشتراك في الإشعارات
  subscribe(userId: string) {
    if (this.channel) {
      this.unsubscribe()
    }

    this.channel = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as NotificationEvent
          
          // تنبيه الإشعارات المهمة
          if (notification.important) {
            this.showNotificationToast(notification)
          }
          
          // استدعاء Callbacks
          this.callbacks.forEach(callback => callback(notification))
        }
      )
      .subscribe((status: string) => {
        console.log('Notification subscription status:', status)
      })
  }

  // إلغاء الاشتراك
  unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel)
      this.channel = null
    }
  }

  // إضافة Callback
  onNotification(callback: (notification: NotificationEvent) => void) {
    this.callbacks.push(callback)
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback)
    }
  }

  // عرض Toast للإشعار
  private showNotificationToast(notification: NotificationEvent) {
    const toastOptions = {
      duration: 5000,
      action: {
        label: 'عرض',
        onClick: () => {
          // فتح صفحة الإشعارات
          window.location.href = '/dashboard/notifications'
        }
      }
    }

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, {
          ...toastOptions,
          description: notification.message
        })
        break
      case 'error':
        toast.error(notification.title, {
          ...toastOptions,
          description: notification.message
        })
        break
      case 'warning':
        toast.warning(notification.title, {
          ...toastOptions,
          description: notification.message
        })
        break
      default:
        toast.info(notification.title, {
          ...toastOptions,
          description: notification.message
        })
    }
  }

  // إرسال إشعار مباشر
  async sendNotification(
    userId: string,
    notification: Omit<NotificationEvent, 'id'>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          ...notification,
          read: false,
          created_at: new Date().toISOString()
        }])

      return !error
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }

  // إرسال إشعار جماعي
  async broadcastNotification(
    userIds: string[],
    notification: Omit<NotificationEvent, 'id'>
  ): Promise<number> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        ...notification,
        read: false,
        created_at: new Date().toISOString()
      }))

      const { error } = await this.supabase
        .from('notifications')
        .insert(notifications)

      return error ? 0 : userIds.length
    } catch (error) {
      console.error('Error broadcasting notifications:', error)
      return 0
    }
  }
}

// إنشاء نسخة وحيدة (Singleton)
export const notificationService = new RealtimeNotificationService()
