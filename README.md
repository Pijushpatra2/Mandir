# Temple ERP Platform - Frontend Only

A premium, enterprise-grade Temple Management ERP Platform built with Next.js 15 (App Router), Tailwind CSS v4, TypeScript, and Framer Motion. This is a **frontend-only** implementation powered entirely by rich local mock datasets and client-side logic, demonstrating high-end SaaS UX, interactive workflows, and responsiveness.

---

## 🚀 Key Features

1. **Luxury Public Portal**: Immersive, elegant homepage and sub-pages (Darshan timings, Pooja booking, donations, hall reservation with interactive calendar, and live streaming UI).
2. **SaaS Admin Dashboard**: Complete management panels for 11 functional domains:
   - **Overview & Analytics**: Live stats counters, mock charts, notifications, and quick actions.
   - **Membership System**: Directory with search/filters, family profiles, digital cards, and approval states.
   - **Donation Management**: Campaign progress metrics, manual transaction entry, and receipt downloads.
   - **Hall & Pooja Bookings**: Calendar views, priest assignment logs, and payment status checks.
   - **Inventory Ledger**: Track physical assets (gold, silver, electronics, and documentation).
   - **Accounting**: Double-entry journal summaries, fund category records, and Tally-compatible export controls.
3. **Smooth Micro-interactions**: Smooth transitions powered by Framer Motion, utilizing blur-reveals, fade-ups, and scale-hovers.
4. **Responsive Layouts**: Designed mobile-first, matching layout aesthetics from Stripe, Airbnb, and Linear.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Animations**: Framer Motion
- **Form Controls**: React Hook Form
- **Form Validation**: Zod
- **Icons**: Lucide Icons

---

## 📂 Project Structure

```text
/
├── public/                 # Static assets (temple imagery, device mockups)
├── src/
│   ├── app/                # Next.js App Router folders
│   │   ├── (public)/       # Public website pages (Home, About, Donations, Contact, etc.)
│   │   ├── dashboard/      # Admin dashboard pages and sub-modules
│   │   └── layout.tsx      # Root styles and font setup
│   ├── components/         # Reusable presentation and layout files
│   │   ├── ui/             # Primitive buttons, modals, inputs, and drawers
│   │   ├── public/         # Landing page and public sections
│   │   └── dashboard/      # Dashboard charts, tables, and sidebars
│   ├── data/               # TS files with mock data structures
│   ├── hooks/              # Custom React state hooks
│   ├── lib/                # Helper utilities (CSS merge, form schemas)
│   ├── types/              # TS interface and type declarations
│   └── styles/             # Tailwind CSS v4 global stylesheets
├── README.md               # This file
├── PROJECT_CONTEXT.md      # Functional specifications & routes
├── DESIGN_SYSTEM.md        # Typography, colors, and layout rules
├── COMPONENT_GUIDELINES.md # Reusable element instructions
└── MOCK_DATA_GUIDE.md      # Data model schemas and formats
```

---

## ⚡ Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to preview the platform.

3. **Production Build**:
   ```bash
   npm run build
   ```
