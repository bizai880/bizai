'use client'

import { Users, Activity, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import dynamic from 'next/dynamic';
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);

interface User {
  id: string
  role: string
  subscription: string
  email_verified: boolean
  created_at: string
  requests_count: number
}

interface UserStatsProps {
  users: User[]
}

export default function UserStats({ users }: UserStatsProps) {
  const stats = {
    total: users.length,
    active: users.filter(u => u.email_verified).length,
    admins: users.filter(u => u.role === 'admin').length,
    proUsers: users.filter(u => u.subscription === 'pro').length,
    enterpriseUsers: users.filter(u => u.subscription === 'enterprise').length,
    totalRequests: users.reduce((sum, user) => sum + user.requests_count, 0),
    newToday: users.filter(u => {
      const created = new Date(u.created_at)
      const today = new Date()
      return created.toDateString() === today.toDateString()
    }).length
  }

  const statCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.total,
      icon: <Users className="w-6 h-6" />,
      color: 'from-primary to-primary-light',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'المستخدمون النشطون',
      value: stats.active,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-400',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'المشرفون',
      value: stats.admins,
      icon: <Activity className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-400',
      change: '+2',
      trend: 'up'
    },
    {
      title: 'طلبات اليوم',
      value: stats.newToday,
      icon: <Clock className="w-6 h-6" />,
      color: 'from-accent to-pink-400',
      change: '+24%',
      trend: 'up'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
              {stat.icon}
            </div>
            <div className={`flex items-center text-sm px-2 py-1 rounded-full ${
              stat.trend === 'up' 
                ? 'bg-success/10 text-success' 
                : 'bg-error/10 text-error'
            }`}>
              <TrendingUp className={`w-3 h-3 ml-1 ${
                stat.trend === 'up' ? 'text-success' : 'text-error'
              }`} />
              {stat.change}
            </div>
          </div>
          
          <div className="mb-2">
            <div className="text-3xl font-bold text-text-primary">
              {stat.value}
            </div>
            <div className="text-sm text-text-secondary">
              {stat.title}
            </div>
          </div>
          
          <div className="h-2 bg-background-lighter rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
              style={{ width: `${Math.min((stat.value / stats.total) * 100, 100)}%` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
