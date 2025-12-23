'use client'

import { Server, Database, Cpu, Cloud, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);

interface SystemHealthProps {
  health?: {
    database: { status: string; latency: number }
    redis: { status: string; memory: number }
    aiServices: Array<{ name: string; status: string; latency: number }>
    uptime: number
    lastIncident: string
  }
}

export default function SystemHealth({ health }: SystemHealthProps) {
  const defaultHealth = {
    database: { status: 'healthy', latency: 12 },
    redis: { status: 'healthy', memory: 45 },
    aiServices: [
      { name: 'OpenAI GPT-4', status: 'healthy', latency: 145 },
      { name: 'Google Gemini', status: 'healthy', latency: 89 },
      { name: 'Anthropic Claude', status: 'degraded', latency: 210 },
      { name: 'Local AI', status: 'healthy', latency: 45 },
    ],
    uptime: 99.95,
    lastIncident: '2024-01-15T08:30:00Z'
  }

  const data = health || defaultHealth

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-success" />
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-warning" />
      case 'down': return <XCircle className="w-4 h-4 text-error" />
      default: return <AlertTriangle className="w-4 h-4 text-warning" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success'
      case 'degraded': return 'text-warning'
      case 'down': return 'text-error'
      default: return 'text-warning'
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-text-primary flex items-center">
          <Server className="w-5 h-5 mr-2" />
          صحة النظام
        </h3>
        <div className="text-sm text-text-secondary">
          Uptime: {data.uptime}%
        </div>
      </div>

      <div className="space-y-6">
        {/* Database */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Database className="w-4 h-4 text-info mr-2" />
              <span className="font-medium text-text-primary">قاعدة البيانات</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${getStatusColor(data.database.status)}`}>
                {data.database.status === 'healthy' ? 'سليم' : 
                 data.database.status === 'degraded' ? 'متدني' : 'معطل'}
              </span>
              {getStatusIcon(data.database.status)}
            </div>
          </div>
          <div className="h-2 bg-background-lighter rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-info to-cyan-400"
              style={{ width: '100%' }}
            />
          </div>
          <div className="text-xs text-text-secondary mt-2">
            زمن الاستجابة: {data.database.latency}ms
          </div>
        </div>

        {/* Redis Cache */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Cpu className="w-4 h-4 text-warning mr-2" />
              <span className="font-medium text-text-primary">ذاكرة التخزين المؤقت</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${getStatusColor(data.redis.status)}`}>
                {data.redis.status === 'healthy' ? 'سليم' : 
                 data.redis.status === 'degraded' ? 'متدني' : 'معطل'}
              </span>
              {getStatusIcon(data.redis.status)}
            </div>
          </div>
          <div className="h-2 bg-background-lighter rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-warning to-yellow-400"
              style={{ width: `${data.redis.memory}%` }}
            />
          </div>
          <div className="text-xs text-text-secondary mt-2">
            الذاكرة المستخدمة: {data.redis.memory}%
          </div>
        </div>

        {/* AI Services */}
        <div>
          <h4 className="font-medium text-text-primary mb-3 flex items-center">
            <Cloud className="w-4 h-4 text-primary mr-2" />
            خدمات الذكاء الاصطناعي
          </h4>
          <div className="space-y-3">
            {data.aiServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-background-lighter"
              >
                <div className="flex items-center">
                  {getStatusIcon(service.status)}
                  <span className="mr-3 text-text-primary">{service.name}</span>
                </div>
                <div className="text-sm text-text-secondary">
                  {service.latency}ms
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Last Incident */}
        {data.lastIncident && (
          <div className="pt-4 border-t border-border">
            <div className="text-sm text-text-secondary">
              آخر حادث: {new Date(data.lastIncident).toLocaleDateString('ar-EG')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
