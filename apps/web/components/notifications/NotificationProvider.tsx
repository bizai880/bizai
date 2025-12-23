'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  data?: any
  read: boolean
  important: boolean
  created_at: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  sendNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const supabase = createClient()

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [user, supabase])

  // الاشتراك في الإشعارات الجديدة
  useEffect(() => {
    if (!user) return

    fetchNotifications()

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)

          // عرض toast للإشعارات المهمة
          if (newNotification.important) {
            toast[newNotification.type](newNotification.title, {
              description: newNotification.message,
              duration: 5000,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, fetchNotifications])

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('فشل في تحديث الإشعار')
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      )
      setUnreadCount(0)
      toast.success('تم تحديد جميع الإشعارات كمقروءة')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('فشل في تحديث الإشعارات')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error

      const wasUnread = notifications.find(n => n.id === id)?.read === false
      setNotifications(prev => prev.filter(notif => notif.id !== id))
      
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      toast.success('تم حذف الإشعار')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('فشل في حذف الإشعار')
    }
  }

  const clearAll = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user?.id)

      if (error) throw error

      setNotifications([])
      setUnreadCount(0)
      toast.success('تم مسح جميع الإشعارات')
    } catch (error) {
      console.error('Error clearing notifications:', error)
      toast.error('فشل في مسح الإشعارات')
    }
  }

  const sendNotification = async (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          user_id: user?.id,
          read: false,
          created_at: new Date().toISOString()
        }])

      if (error) throw error
      
      toast.success('تم إرسال الإشعار')
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('فشل في إرسال الإشعار')
    }
  }

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    sendNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
