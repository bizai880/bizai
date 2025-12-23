0
// app/dashboard/page.optimized.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
 
// Enable Partial Prerendering for this page
export const experimental_ppr = true;
 
// Lazy load the DashboardCard component
const DashboardCard = dynamic(() => import('@/components/DashboardCard.optimized'), {
  loading: () => <CardSkeleton />,
  ssr: false, // Cards have animations, no need for SSR
});
 
// Static data that can be prerendered
const cards = [
  { title: 'لوحة تحكم المبيعات', type: 'dashboard', color: 'from-blue-500 to-cyan-400', index: 0 },
  { title: 'تتبع العملاء', type: 'tracking', color: 'from-purple-500 to-pink-400', index: 1 },
  { title: 'تحليل الأداء', type: 'analytics', color: 'from-green-500 to-emerald-400', index: 2 },
  { title: 'تقارير الموظفين', type: 'dashboard', color: 'from-orange-500 to-amber-400', index: 3 },
  { title: 'إدارة المشاريع', type: 'tracking', color: 'from-red-500 to-rose-400', index: 4 },
  { title: 'لوحة التحكم المالية', type: 'analytics', color: 'from-indigo-500 to-violet-400', index: 5 },
];
 
// Loading skeleton component
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
      </div>
    </div>
  );
}
 
// Stats skeleton
function StatsSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
  );
}
 
// Server Component for static stats (can be cached)
async function DashboardStats() {
  // In a real app, this would fetch from database
  // For now, using static data
  const stats = [
    { title: 'إجمالي المستخدمين', value: '1,847', color: 'text-primary' },
    { title: 'النشاط اليومي', value: '+12.5%', color: 'text-green-500' },
    { title: 'المهام المكتملة', value: '89%', color: 'text-purple-500' },
    { title: 'وقت التشغيل', value: '99.9%', color: 'text-blue-500' },
  ];
 
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="glass-card p-4">
          <h3 className="text-lg font-semibold text-text-primary">{stat.title}</h3>
          <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
 
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark p-4 md:p-8">
      {/* Static header - renders immediately with PPR */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">لوحة التحكم الرئيسية</h1>
        <p className="text-text-secondary mt-2">مرحباً بعودتك! هنا نظرة عامة على أداء نظامك.</p>
      </header>
 
      {/* Dynamic cards - streams in with Suspense */}
      <Suspense 
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <DashboardCard
              key={card.index}
              title={card.title}
              type={card.type}
              color={card.color}
              index={card.index}
            />
          ))}
        </div>
      </Suspense>
 
      {/* Stats section - can be cached separately */}
      <Suspense 
        fallback={
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsSkeleton key={i} />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>
    </div>
  );
}
 
// Metadata for SEO (static, prerendered)
export const metadata = {
  title: 'لوحة التحكم | BizAI Factory',
  description: 'لوحة التحكم الرئيسية لإدارة أنظمة الأعمال الذكية',
};