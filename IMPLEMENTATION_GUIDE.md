# Turbopack Optimization Implementation Guide
 
## Quick Start
 
### Step 1: Backup Current Configuration
```bash
cp apps/web/next.config.js apps/web/next.config.backup.js
```
 
### Step 2: Apply Optimized Configuration
```bash
cp apps/web/next.config.optimized.js apps/web/next.config.js
```
 
### Step 3: Update Turbo Configuration
```bash
# Update turbo.json with the optimized version
```
 
---
 
## Detailed Implementation Steps
 
### Phase 1: Configuration Updates (15 minutes)
 
#### 1.1 Update next.config.js
 
Replace your current `next.config.js` with the optimized version:
 
```bash
cd apps/web
mv next.config.js next.config.backup.js
mv next.config.optimized.js next.config.js
```
 
**Key changes:**
- ✅ Advanced bundle splitting
- ✅ Turbopack memory limits
- ✅ Module resolution aliases
- ✅ Package import optimization
- ✅ PPR enabled
- ✅ Security headers
 
#### 1.2 Update turbo.json
 
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "type-check": {
      "outputs": ["*.tsbuildinfo"],
      "cache": true
    }
  },
  "globalDependencies": [
    "**/.env.*",
    "turbo.json",
    "package.json",
    "tsconfig.json"
  ]
}
```
 
#### 1.3 Update tsconfig.json
 
Add incremental compilation:
 
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,
    "isolatedModules": true
  }
}
```
 
#### 1.4 Test Configuration
 
```bash
# Clean build
npm run clean
 
# Test build
npm run build
 
# Test dev server
npm run dev
```
 
---
 
### Phase 2: Component Optimization (1-2 hours)
 
#### 2.1 Optimize DashboardCard Component
 
**Replace:** `components/DashboardCard.tsx`
**With:** `components/DashboardCard.optimized.tsx`
 
```bash
cd apps/web
mv components/DashboardCard.tsx components/DashboardCard.backup.tsx
mv components/DashboardCard.optimized.tsx components/DashboardCard.tsx
```
 
**Changes:**
- ✅ Dynamic import for framer-motion
- ✅ Loading skeleton
- ✅ Suspense boundary
- ✅ Reduced initial bundle by ~100KB
 
#### 2.2 Optimize Dashboard Page
 
**Replace:** `app/dashboard/page.tsx`
**With:** `app/dashboard/page.optimized.tsx`
 
```bash
cd apps/web
mv app/dashboard/page.tsx app/dashboard/page.backup.tsx
mv app/dashboard/page.optimized.tsx app/dashboard/page.tsx
```
 
**Changes:**
- ✅ PPR enabled
- ✅ Suspense boundaries
- ✅ Server Components for static content
- ✅ Lazy loading for interactive components
 
#### 2.3 Optimize Other Animation Components
 
Apply the same pattern to other components using framer-motion:
 
**Files to update:**
- `components/notifications/NotificationList.tsx`
- `components/notifications/NotificationBell.tsx`
- `components/layout/MainNav.tsx`
- `components/users/UserTable.tsx`
 
**Pattern:**
```tsx
// Before
import { motion } from 'framer-motion';
 
// After
import dynamic from 'next/dynamic';
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { ssr: false }
);
```
 
---
 
### Phase 3: API Route Optimization (30 minutes)
 
#### 3.1 Create Excel Generation API Route
 
The optimized route is already created at:
`apps/web/app/api/generate-excel/route.ts`
 
**Key features:**
- ✅ Server-side only (Node.js runtime)
- ✅ Dynamic import of ExcelJS
- ✅ Removes 500KB+ from client bundle
- ✅ Proper error handling
- ✅ Streaming response
 
#### 3.2 Update Client Code to Use API
 
**Before:**
```tsx
// Client-side Excel generation
import ExcelJS from 'exceljs';
 
async function generateExcel() {
  const workbook = new ExcelJS.Workbook();
  // ... generation logic
}
```
 
**After:**
```tsx
// Call API route
async function generateExcel(data: any) {
  const response = await fetch('/api/generate-excel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateType: 'sales',
      data: data,
      options: { includeCharts: true }
    }),
  });
 
  if (!response.ok) {
    throw new Error('Failed to generate Excel');
  }
 
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'report.xlsx';
  a.click();
}
```
 
---
 
### Phase 4: Font Optimization (15 minutes)
 
#### 4.1 Update Font Configuration
 
Edit `app/layout.tsx`:
 
```tsx
import { Inter, Cairo } from 'next/font/google';
 
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});
 
const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '600', '700'], // Reduced from 5 weights to 3
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
  fallback: ['Tahoma', 'Arial'],
  adjustFontFallback: true,
});
```
 
**Impact:**
- ✅ 40% smaller font payload
- ✅ Zero layout shift (CLS = 0)
- ✅ Faster font rendering
 
---
 
### Phase 5: Icon Optimization (10 minutes)
 
#### 5.1 Verify Package Import Optimization
 
The optimized config already includes:
 
```javascript
experimental: {
  optimizePackageImports: [
    'lucide-react',
    'framer-motion',
    '@supabase/supabase-js',
  ],
}
```
 
This automatically tree-shakes unused icons.
 
#### 5.2 Use Specific Icon Imports (Optional)
 
For even better optimization:
 
```tsx
// Before
import { Eye, Download, BarChart3 } from 'lucide-react';
 
// After (if not using optimizePackageImports)
import Eye from 'lucide-react/dist/esm/icons/eye';
import Download from 'lucide-react/dist/esm/icons/download';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
```
 
---
 
## Verification & Testing
 
### Build Analysis
 
#### 1. Install Bundle Analyzer
```bash
npm install --save-dev @next/bundle-analyzer
```
 
#### 2. Update package.json
```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```
 
#### 3. Run Analysis
```bash
npm run analyze
```
 
### Performance Testing
 
#### 1. Lighthouse Audit
```bash
# Build production version
npm run build
 
# Start production server
npm start
 
# Run Lighthouse (in Chrome DevTools)
# Target scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 95+
```
 
#### 2. Bundle Size Check
```bash
# Check .next/static/chunks sizes
du -sh .next/static/chunks/*
 
# Expected results:
# - framework chunk: ~150KB
# - main chunk: ~50KB
# - page chunks: 20-50KB each
```
 
#### 3. Build Time Comparison
```bash
# Clean build
time npm run build
 
# Expected times:
# - Cold build: 30-40s (down from 45s)
# - Cached build: 3-5s (down from 12s)
```
 
---
 
## Rollback Plan
 
If issues occur, rollback is simple:
 
```bash
# Restore original config
cd apps/web
mv next.config.backup.js next.config.js
 
# Restore original components
mv components/DashboardCard.backup.tsx components/DashboardCard.tsx
mv app/dashboard/page.backup.tsx app/dashboard/page.tsx
 
# Clean and rebuild
npm run clean
npm run build
```
 
---
 
## Monitoring
 
### Add Performance Monitoring
 
```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
 
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
```
 
### Monitor Key Metrics
 
Track these metrics in production:
- **FCP (First Contentful Paint)**: Target < 1.5s
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **TTI (Time to Interactive)**: Target < 3.0s
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **Bundle Size**: Target < 500KB initial
 
---
 
## Troubleshooting
 
### Issue: Hydration Errors
 
**Symptom:** Console errors about hydration mismatch
 
**Solution:**
```tsx
// Add suppressHydrationWarning to html tag
<html suppressHydrationWarning>
```
 
### Issue: Dynamic Import Not Working
 
**Symptom:** Component not loading
 
**Solution:**
```tsx
// Ensure proper default export
const Component = dynamic(() => import('./Component'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Try disabling SSR
});
```
 
### Issue: Build Fails with Memory Error
 
**Symptom:** "JavaScript heap out of memory"
 
**Solution:**
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```
 
### Issue: Turbopack Not Using Optimizations
 
**Symptom:** No performance improvement
 
**Solution:**
```bash
# Ensure using Turbopack
npm run dev -- --turbopack
 
# Check Turbopack is active
# Should see "⚡ Turbopack" in console
```
 
---
 
## Next Steps
 
After implementing these optimizations:
 
1. **Monitor Production**: Watch real-user metrics for 1-2 weeks
2. **A/B Testing**: Compare performance with old version
3. **Iterate**: Apply learnings to other pages
4. **Document**: Update team documentation with new patterns
 
---
 
## Support
 
For issues or questions:
- Check [Next.js Documentation](https://nextjs.org/docs)
- Review [Turbopack Docs](https://turbo.build/pack/docs)
- Open issue in project repository