# TEMPLE ERP PLATFORM - MASTER BUILD PROMPT

You are a world-class SaaS AI Coding Agent working on the **Temple ERP Platform**. This file serves as the core instruction guide and permanent knowledge base. When working on this codebase, you must adhere strictly to the architecture, guidelines, and constraints defined here.

---

## 1. PRINCIPLES & GOALS
1. **Premium Aesthetics**: The platform must feel like a luxury SaaS product (such as Linear, Stripe, Apple, or Airbnb). It is **not** a traditional, outdated temple website.
2. **Enterprise Architecture**: Built for scalability, robustness, security, and high performance. The code must be clean, dry, type-safe, and self-documenting.
3. **Multi-Tenant Ready**: Designed such that a single instance can support multiple physical temples, regions, and multi-language locales (English, Hindi, Gujarati).
4. **Offline Resilience & API First**: All business logic must be driven via APIs and Server Actions with clean validations (Zod), suitable for both web and mobile access.

---

## 2. TECHNOLOGY STACK
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Shadcn UI, Framer Motion, React Hook Form, Zod, TanStack Query.
- **Backend & Logic**: Next.js Server Actions, Next.js API Routes (REST), Prisma ORM.
- **Database & State**: PostgreSQL (relational storage), Redis (caching & rate-limiting).
- **Authentication**: JWT & Refresh Tokens, cookie-based session management, Role-Based Access Control (RBAC).
- **Payments**: Stripe & Razorpay dual-integration.
- **Storage**: AWS S3 compatible object storage for assets, galleries, and document uploads.

---

## 3. MASTER DIRECTORY STRUCTURE
Ensure that all files conform to the following directory structure:
```text
/
├── .github/                # CI/CD Workflows
├── prisma/                 # Database migrations and Prisma schema
├── public/                 # Static assets (logos, fallback images)
├── src/
│   ├── app/                # Next.js App Router Pages & API Routes
│   │   ├── (public)/       # Public website pages (Home, About, Darshan, etc.)
│   │   ├── (portal)/       # Devotee portal pages
│   │   ├── admin/          # Admin Dashboard pages
│   │   ├── api/            # REST API endpoints (Mobile App API layer, Webhooks)
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Radix UI + Custom primitive components
│   │   ├── public/         # Public-facing widgets (Hero, FestivalSlider, etc.)
│   │   ├── admin/          # Admin dashboard components
│   │   └── shared/         # Reusable form controls, cards, loaders
│   ├── hooks/              # Custom React hooks (useAuth, useQuery, etc.)
│   ├── lib/                # Shared utilities & configurations
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── redis.ts        # Redis client utility
│   │   ├── s3.ts           # AWS S3 client utility
│   │   ├── auth.ts         # JWT sign, verify, and session helpers
│   │   ├── stripe.ts       # Stripe gateway integrations
│   │   └── razorpay.ts     # Razorpay gateway integrations
│   ├── middleware.ts       # Next.js Middleware for Auth & RBAC
│   ├── styles/             # Global styles (Tailwind CSS v4 entry)
│   └── types/              # TypeScript global type definitions
├── DESIGN_SYSTEM.md        # UI/UX specifications and design tokens
├── PROJECT_CONTEXT.md      # Functional specifications, database, and modules
├── MASTER_PROMPT.md        # This file
├── package.json
└── tsconfig.json
```

---

## 4. CODE & QUALITY STANDARDS
- **No Placeholders**: Never write placeholders or stub functions. All code must be fully written, complete, and functional.
- **Type Safety**: Maintain strict TypeScript rules. Do not use `any` unless absolutely necessary, and if so, document why.
- **Validations**: Validate all client inputs using Zod. Use React Hook Form with Zod resolver for frontend forms.
- **Server Actions**: Use Next.js Server Actions for forms, updates, and backend processes. Secure actions with authentication and RBAC checks.
- **Error Handling**: Use structured try-catch blocks. Return standard error response envelopes: `{ success: false, error: string }`.
- **Database Operations**: Perform database operations using Prisma. Never raw query unless optimized search/aggregation requires it. Always clean up connections.

---

## 5. DEVELOPER INSTRUCTIONS
- Refer to `PROJECT_CONTEXT.md` for database schemas, entity relationship diagrams, user roles, and detailed module requirements.
- Refer to `DESIGN_SYSTEM.md` for styling guidelines, color variables, premium Glassmorphism utilities, and typography.
- When adding new modules, update `PROJECT_CONTEXT.md` with relevant data models and business workflows.
