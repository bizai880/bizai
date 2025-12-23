# مرحلة البناء
FROM node:20-alpine AS builder

WORKDIR /workspace

# تثبيت أدوات البناء
RUN apk add --no-cache python3 py3-pip make g++ git

# نسخ ملفات الاعتماديات الأساسية أولاً (لتحسين layer caching)
COPY package*.json ./
COPY turbo.json ./
COPY apps/ai-worker/package.json ./apps/ai-worker/
COPY packages/shared/package.json ./packages/shared/

# تثبيت turbo globally (مهم!)
RUN npm install -g turbo@latest

# تثبيت dependencies الجذرية
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# نسخ باقي الكود
COPY . .

# البناء باستخدام turbo مع التركيز على ai-worker فقط
RUN turbo build --filter=@bizai/ai-worker --no-daemon

# ============================================
# مرحلة الإنتاج النهائية
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# تثبيت أدوات التشغيل الأساسية فقط
RUN apk add --no-cache tini curl

# إعداد مستخدم غير root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# نسخ node_modules المبنية فقط
COPY --from=builder --chown=nodejs:nodejs /workspace/node_modules ./node_modules

# نسخ package.json
COPY --from=builder --chown=nodejs:nodejs /workspace/apps/ai-worker/package.json ./

# نسخ الملفات المبنية
COPY --from=builder --chown=nodejs:nodejs /workspace/apps/ai-worker/dist ./dist

# نسخ shared package المبنية (مهم!)
COPY --from=builder --chown=nodejs:nodejs /workspace/packages/shared/dist ./node_modules/@bizai/shared

# التبديل إلى المستخدم غير الجذر
USER nodejs

# المتغيرات البيئية
ENV NODE_ENV=production \
    PORT=3001 \
    TZ=UTC \
    NODE_OPTIONS="--max-old-space-size=512"

# فتح المنفذ
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# استخدام tini كـ init process
ENTRYPOINT ["/sbin/tini", "--"]

# الأمر التشغيلي
CMD ["node", "dist/index.js"]