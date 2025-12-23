# نشر على Vercel

## الإعداد النهائي

تم إعداد المشروع للنشر على Vercel. الملفات المضافة:

### 1. `vercel.json`
- يوجه Vercel لبناء `apps/web` فقط
- تحديد مجلد الإخراج: `apps/web/.next`
- إعدادات Framework: Next.js

### 2. `.vercelignore`
- يتجاهل الملفات غير الضرورية
- يركز على بناء `apps/web` فقط
- يحسن سرعة البناء

### 3. `apps/web/public/`
- مجلد للstatic files
- يحتوي على `robots.txt` و `sitemap.xml`

### 4. `apps/web/next.config.js`
- تم تحديثه بإضافة `output: 'standalone'` لـ Vercel
- محافظ على كل الإعدادات الحالية

## الخطوات التالية

### في Vercel Dashboard:
1. **Project Settings** → **Build & Development Settings**:
   - Build Command: `npm run vercel-build`
   - Output Directory: `apps/web/.next`
   - Install Command: `npm install`

2. **Environment Variables**:
   أضف المتغيرات التالية:
   - `NODE_ENV`: `production`
   - `SLACK_TOKEN`
   - `INNGEST_SIGNING_KEY`
   - `INNGEST_EVENT_KEY`
   - `SUPABASE_JWT_SECRET`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REDIS_URL`
   - `UPSTASH_REDIS_URL`
   - `UPSTASH_REDIS_TOKEN`
   - `REDIS_PASSWORD`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - `GROQ_API_KEY`

3. **Domains**:
   - إعداد النطاق المخصص

## أوامر الرفع

```bash
# رفع التغييرات
git add vercel.json .vercelignore apps/web/public/ package.json apps/web/package.json apps/web/next.config.js
git commit -m "feat: إعداد Vercel النهائي للمونوريبو"
git push origin main

# بعد الرفع، Vercel سيبني تلقائياً
