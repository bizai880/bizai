# المرحلة 1: بناء التطبيق
FROM node:20-alpine AS builder

WORKDIR /app

# نسخ ملفات الاعتماديات
COPY package*.json ./
COPY turbo.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/

# تثبيت الاعتماديات
RUN npm install -g npm@11.7.0
RUN npm install --frozen-lockfile

# نسخ الكود المصدري
COPY . .

# بناء التطبيق
RUN npm build --filter=web

# المرحلة 2: تشغيل التطبيق
FROM node:20-alpine AS runner

WORKDIR /app

# إعداد المستخدم غير الجذر
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# نسخ الملفات المبنية
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# نسخ ملفات البيئة
COPY apps/web/.env.production .env.local

# تغيير الملكية
RUN chown -R nextjs:nodejs /app

# التبديل إلى المستخدم غير الجذر
USER nextjs

# فتح المنفذ
EXPOSE 3000

# متغير البيئة
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# تشغيل التطبيق
CMD ["node", "apps/web/server.js"]
