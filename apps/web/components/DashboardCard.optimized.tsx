'use client';
 
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Eye, Download, BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
 
// Lazy load framer-motion to reduce initial bundle
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { 
    ssr: false,
    loading: () => <CardSkeleton />
  }
);
 
interface DashboardCardProps {
  title: string;
  type: string;
  color: string;
  index: number;
}
 
// Loading skeleton for better UX
function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-2 bg-gray-200 dark:bg-gray-700" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-full" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    </div>
  );
}
 
export default function DashboardCard({ title, type, color, index }: DashboardCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'dashboard': return <BarChart3 className="w-5 h-5" />;
      case 'tracking': return <Users className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };
 
  const getStats = () => {
    switch (type) {
      case 'dashboard': return { uses: '1.2K', rating: '4.8' };
      case 'tracking': return { uses: '890', rating: '4.6' };
      default: return { uses: '540', rating: '4.9' };
    }
  };
 
  const stats = getStats();
 
  return (
    <Suspense fallback={<CardSkeleton />}>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group border border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className={`h-2 ${color.includes('from-') ? `bg-gradient-to-r ${color}` : color}`} />
 
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${color.includes('from-') ? `bg-gradient-to-br ${color}` : `bg-${color}`} p-3 text-white`}>
              {getIcon()}
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {type === 'dashboard' ? 'داشبورد' : type === 'tracking' ? 'تتبع' : 'تحليل'}
            </span>
          </div>
 
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>
 
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            نظام متكامل مع لوحة تحكم تفاعلية، تقارير ذكية، وإشعارات تلقائية.
          </p>
 
          {/* Preview Image */}
          <div className="mb-6 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-12 rounded ${
                    i % 2 === 0 
                      ? 'bg-gradient-to-r from-blue-200 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20' 
                      : 'bg-gradient-to-r from-purple-200 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 text-gray-500 dark:text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">تحديث آلي</span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-3 h-3 text-gray-500 dark:text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{stats.uses} استخدام</span>
                </div>
              </div>
              <div className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                ⭐ {stats.rating}
              </div>
            </div>
          </div>
 
          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300">
              <Eye className="w-4 h-4 mr-2" />
              معاينة
            </button>
            <button className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
              <Download className="w-4 h-4 mr-2" />
              استخدام القالب
            </button>
          </div>
        </div>
      </MotionDiv>
    </Suspense>
  );
}