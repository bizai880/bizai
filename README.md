<div align="center">
  
# 🏗️ BizAI Factory - Artificial Intelligence Business Systems Building Platform

[![Node.js Version](https://img.shields.io/badge/Nodejs-22+-006102?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-4+-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-2025-orange?style=for-the-badge&logo=cloudflare)](https://www.cloudflare.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Javascript](https://img.shields.io/badge/Javascript-EFD81D?style=for-the-badge&logo=javascript&logoColor=white)](https://www.javascript.com)
[![Typescript](https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Turborepo](https://img.shields.io/badge/Turborepo-000000?style=for-the-badge&logo=turborepo&logoColor=white)](https://turborepo.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=ffffff)]

</div>

---

## ⚡ Overview

An integrated SaaS platform that allows the conversion of text descriptions into complete business systems (dashboard, tracking tools, intelligent Excel models) by assembling reusable smart components.

## 🏗️ Technology Architecture (Modern Full Stack)

The project follows a single warehouse architecture (Monorepo) using **Turborepo** for management, with a clear separation between components.

### **Main components:**

- **`apps/web`**: Next.js 14 (App Router) application with user interface and initial APIs.

- **`apps/ai-worker`**: An asynchronous processing service based on **Inngest** to handle long-term AI tasks.

- **`packages/database`**: a common data layer using **Drizzle ORM** and **Supabase PostgreSQL**.

- **`packages/ai-core`**: Common logic to connect to **Hugging Face Inference API** and sample processing.

- **`packages/shared`**: TypeScript definitions, constants, and help functions.

## 🚀 Quick start (local development)

### **Basic requirements**

- Node.js 18+ & npm@11.7.0 (preferred) or npm

- Accounts on: Supabase, Hugging Face, Inngest, Cloudinary

### **1. Reproduction and preparation of the environment**

```bash

Git clone https://github.com/bizai183/bizai.git

Cd bizai-factory

Cp .env.example .env.local

# Fill in the environmental variables in `.env.local` with your API keys

```

### **2. Local database operation (optional)**
```bash
docker-compose up -d

```

### **3. Stabilisation of credits and operation of the project**
```bash
npm install
npm dev
```
## It will run:

```bash
http://localhost:3000 front-end on Next.js App) in the same address API interfaces Router.
```
## 🔧 Infrastructure and services

(Infrastructure as Code)

- Publishing: GitHub Actions deploys **`apps/web`** on Railway on deploys **`apps/ai-worker`** and Vercel Automatically.

- Database: Supabase (PostgreSQL) For production, with a local Docker for development.

- Back functions: Inngest to manage a handling queue Artificial intelligence requests.

- Storage: Cloudinary for files, Upstash Redis for temporary storage.

- Monitoring: Sentry for error tracking, connected to Slack for alerts.

## 🧪 Tests

```bash
# Run all tests

npm test

# Running tests for a specific project
npm test --filter=web
```

## 🤝 Contribution

```bash
//Create a branch
Git checkout -b feature/Amazing-feature 
//Do Commit for changes
Git commit -m "Add amazing feature"
//push to the branch
Git push origin

(Pull Request) Open a merge request

```

## 🪪 The license
MIT

## **Built with:**
Next.js 14, Supabase, 
Inngest, LangChain, HuggingFace, Tailwind, CSS, Turborepo

## 🚀 BizAl Factory Project Structure:
Integrated with playback files

📂 The entire structure of the project

```text
bizai-factory/
├── 📂 apps/
│   ├── 📂 web/                            # Next.js 14 Application
│   │   ├── 📂 app/
│   │   │   ├── 📂 (auth)/                 # صفحات المصادقة
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── reset-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── 📂 (pages)/                # صفحات الموقع
│   │   │   │   ├── about/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── pricing/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── features/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── contact/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── docs/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── blog/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── legal/
│   │   │   │       ├── terms/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── privacy/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── 📂 (dashboard)/            # لوحة التحكم
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── billing/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── security/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── activity/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── settings/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── 📂 admin/                  # لوحة الإدارة
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── system/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── 📂 api/                    # واجهات API
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── register/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── logout/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── verify/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── reset-password/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── refresh/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── profile/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   ├── admin/
│   │   │   │   │   ├── verify/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── stats/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── users/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── system/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   ├── ai/
│   │   │   │   │   ├── generate/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── templates/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   ├── analyze/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── status/
│   │   │   │   │       └── [id]/
│   │   │   │   │           └── route.ts
│   │   │   │   │
│   │   │   │   ├── users/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── stats/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── route.ts
│   │   │   │   │
│   │   │   │   └── webhooks/
│   │   │   │       ├── stripe/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── supabase/
│   │   │   │       │   └── route.ts
│   │   │   │       └── inngest/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── layout.tsx                 # Layout الرئيسي
│   │   │   ├── page.tsx                   # الصفحة الرئيسية
│   │   │   └── globals.css               # الأنماط العامة
│   │   │
│   │   ├── 📂 components/                 # مكونات React
│   │   │   ├── 📂 auth/
│   │   │   │   ├── AuthProvider.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   │
│   │   │   ├── 📂 admin/
│   │   │   │   ├── AdminStats.tsx
│   │   │   │   ├── SystemHealth.tsx
│   │   │   │   ├── RecentActivities.tsx
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   └── BillingOverview.tsx
│   │   │   │
│   │   │   ├── 📂 notifications/
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   ├── NotificationList.tsx
│   │   │   │   └── NotificationProvider.tsx
│   │   │   │
│   │   │   ├── 📂 ai/
│   │   │   │   ├── AIChat.tsx
│   │   │   │   ├── AIForm.tsx
│   │   │   │   ├── AIResultViewer.tsx
│   │   │   │   └── AIProgress.tsx
│   │   │   │
│   │   │   ├── 📂 layout/
│   │   │   │   ├── MainNav.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MobileMenu.tsx
│   │   │   │
│   │   │   ├── 📂 ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Dialog.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   └── Table.tsx
│   │   │   │
│   │   │   ├── 📂 theme/
│   │   │   │   ├── ThemeProvider.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── ThemeSwitcher.tsx
│   │   │   │
│   │   │   └── 📂 error/
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── ErrorFallback.tsx
│   │   │       └── NotFound.tsx
│   │   │
│   │   ├── 📂 lib/                        # مكتبات وخدمات
│   │   │   ├── 📂 supabase/
│   │   │   │   ├── server.ts
│   │   │   │   ├── client.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── realtime.ts
│   │   │   │
│   │   │   ├── 📂 ai/
│   │   │   │   ├── core.ts
│   │   │   │   ├── orchestrator.ts
│   │   │   │   ├── 📂 providers/
│   │   │   │   │   ├── groq.ts
│   │   │   │   │   ├── gemini.ts
│   │   │   │   │   ├── local.ts
│   │   │   │   │   └── huggingface.ts
│   │   │   │   └── 📂 templates/
│   │   │   │       ├── excel.ts
│   │   │   │       ├── dashboard.ts
│   │   │   │       └── tracking.ts
│   │   │   │
│   │   │   ├── 📂 crypto/
│   │   │   │   ├── encryption.ts
│   │   │   │   ├── jwt.ts
│   │   │   │   └── hashing.ts
│   │   │   │
│   │   │   ├── 📂 cache/
│   │   │   │   ├── redis.ts
│   │   │   │   ├── memory.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── 📂 storage/
│   │   │   │   ├── cloudinary.ts
│   │   │   │   ├── s3.ts
│   │   │   │   └── local.ts
│   │   │   │
│   │   │   ├── 📂 excel/
│   │   │   │   ├── generator.ts
│   │   │   │   ├── parser.ts
│   │   │   │   └── formulas.ts
│   │   │   │
│   │   │   ├── 📂 notifications/
│   │   │   │   ├── pusher.ts
│   │   │   │   ├── realtime.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── 📂 analytics/
│   │   │   │   ├── tracker.ts
│   │   │   │   ├── events.ts
│   │   │   │   └── providers.ts
│   │   │   │
│   │   │   └── 📂 utils/
│   │   │       ├── date.ts
│   │   │       ├── format.ts
│   │   │       ├── validation.ts
│   │   │       └── helpers.ts
│   │   │
│   │   ├── 📂 public/                     # ملفات ثابتة
│   │   │   ├── fonts/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   ├── favicon.ico
│   │   │   ├── robots.txt
│   │   │   └── sitemap.xml
│   │   │
│   │   ├── 📂 styles/                     # أنماط إضافية
│   │   │   ├── animations.css
│   │   │   ├── themes.css
│   │   │   └── components.css
│   │   │
│   │   ├── 📂 hooks/                      Custom Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useAI.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   ├── middleware.ts                  # Next.js Middleware
│   │   ├── next.config.js                 # Next.js Config
│   │   ├── tailwind.config.js             # Tailwind Config
│   │   ├── postcss.config.js              # PostCSS Config
│   │   ├── tsconfig.json                  # TypeScript Config
│   │   └── package.json
│   │
│   └── 📂 ai-worker/                      # خدمة معالجة AI
│       ├── 📂 src/
│       │   ├── 📂 functions/              # وظائف Inngest
│       │   │   ├── generate-excel.ts
│       │   │   ├── generate-dashboard.ts
│       │   │   ├── process-template.ts
│       │   │   └── cleanup.ts
│       │   │
│       │   ├── 📂 lib/                    # مكتبات الـWorker
│       │   │   ├── 📂 ai/
│       │   │   │   ├── processors/
│       │   │   │   │   ├── excel-processor.ts
│       │   │   │   │   ├── dashboard-processor.ts
│       │   │   │   │   └── template-processor.ts
│       │   │   │   └── validators.ts
│       │   │   │
│       │   │   ├── 📂 excel/
│       │   │   │   ├── complex-generator.ts
│       │   │   │   └── charts.ts
│       │   │   │
│       │   │   ├── 📂 storage/
│       │   │   │   └── uploader.ts
│       │   │   │
│       │   │   └── 📂 monitoring/
│       │   │       ├── metrics.ts
│       │   │       └── logger.ts
│       │   │
│       │   ├── 📂 api/                    # واجهات Worker API
│       │   │   ├── health.ts
│       │   │   ├── status.ts
│       │   │   └── metrics.ts
│       │   │
│       │   ├── 📂 types/                  # أنواع TypeScript
│       │   │   ├── events.ts
│       │   │   ├── tasks.ts
│       │   │   └── results.ts
│       │   │
│       │   ├── index.ts                   # نقطة بدء الـWorker
│       │   ├── inngest.ts                 تهيئة Inngest
│       │   └── health.ts                  # Health Checks
│       │
│       ├── 📂 tests/                      # اختبارات الـWorker
│       │   ├── unit/
│       │   └── integration/
│       │
│       ├── Dockerfile
│       ├── docker-compose.yml
│       ├── railway.json
│       ├── tsconfig.json
│       └── package.json
│
├── 📂 packages/                           # حزم مشتركة
│   ├── 📂 shared/                         # كود مشترك
│   │   ├── 📂 src/
│   │   │   ├── 📂 types/                  # أنواع مشتركة
│   │   │   │   ├── ai.ts
│   │   │   │   ├── database.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── 📂 constants/              ثوابت مشتركة
│   │   │   │   ├── ai.ts
│   │   │   │   ├── errors.ts
│   │   │   │   └── limits.ts
│   │   │   │
│   │   │   ├── 📂 schemas/               # Zod Schemas
│   │   │   │   ├── auth.ts
│   │   │   │   ├── ai.ts
│   │   │   │   └── user.ts
│   │   │   │
│   │   │   └── 📂 utils/                  أدوات مشتركة
│   │   │       ├── validation.ts
│   │   │       ├── formatting.ts
│   │   │       └── encryption.ts
│   │   │
│   │   └── package.json
│   │
│   └── 📂 database/                       # طبقة قاعدة البيانات
│       ├── 📂 src/
│       │   ├── schema.ts                  # Drizzle Schema
│       │   ├── migrations/                # ملفات Migration
│       │   ├── seeds/                     # بيانات أولية
│       │   └── index.ts
│       ├── drizzle.config.ts
│       └── package.json
│
├── 📂 infra/                              # البنية التحتية
│   ├── 📂 docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.worker
│   │   └── docker-compose.prod.yml
│   │
│   ├── 📂 nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   │
│   ├── 📂 terraform/                      Terraform Configs
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── 📂 kubernetes/                     # Kubernetes Configs
│       ├── deployments/
│       ├── services/
│       └── ingress/
│
├── 📂 scripts/                            # سكريبتات مساعدة
│   ├── setup-db.js                       # إعداد قاعدة البيانات
│   ├── generate-secrets.js               # توليد مفاتيح
│   ├── backup-db.js                      # نسخ احتياطي
│   └── deploy.sh                         # نشر تلقائي
│
├── 📂 docs/                               # التوثيق
│   ├── 📂 api/
│   │   ├── endpoints.md
│   │   └── examples.md
│   │
│   ├── 📂 development/
│   │   ├── setup.md
│   │   ├── architecture.md
│   │   └── contributing.md
│   │
│   ├── 📂 deployment/
│   │   ├── production.md
│   │   └── monitoring.md
│   │
│   └── README.md
│
├── 📂 .github/                            # GitHub Actions
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   ├── tests.yml
│   │   └── security.yml
│   │
│   ├── dependabot.yml
│   └── CODEOWNERS
│
├── 📂 .husky/                             Git Hooks
│   ├── pre-commit
│   └── commit-msg
│
├── 📂 tests/                              # اختبارات شاملة
│   ├── 📂 e2e/
│   ├── 📂 integration/
│   └── 📂 performance/
│
├── 📂 configs/                            ملفات التكوين
│   ├── jest.config.js
│   ├── eslint.config.js
│   ├── prettier.config.js
│   └── playwright.config.ts
│
├── turbo.json                            # Turborepo Config
├── package.json                          # Root Package.json
├── .env.example                         # متغيرات البيئة
├── .gitignore
├── .nvmrc                               # Node.js Version
├── README.md                            # وثيقة المشروع الرئيسية
└── LICENSE
```

## 🤝 Contribute to the project

We welcome your contributions! Please follow these steps:

1. Setting up a fork for the warehouse.

2. Create a new branch of the feature you want to add (`git checkout -b feature/AmazingFeature`).

3. Make edits and then commit (`git commit -m 'Add some AmazingFeature'`).

4. Upload the modifications to the branch (`git push origin feature/AmazingFeature`).

5. Open a consolidation request (Pull Request).

## 📄 License
This project is authorised under the MIT license. SEE THE `LICENSE` FILE FOR MORE DETAILS.

## 👥 Communication


* **Supervisor:** Bizai Team
* **Project link:** https://github.com/bizai183/bizai.git