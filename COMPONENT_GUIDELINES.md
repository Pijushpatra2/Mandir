# TEMPLE ERP - COMPONENT GUIDELINES

This document serves as the building specification for creating reusable UI components in the **Temple ERP Platform Frontend**.

---

## 1. SHARED UI ELEMENTS

### 1.1 Navigation Bar & Mobile Menu (`/src/components/shared/Navbar.tsx`)
- **Structure**: Floating header, glass background (`glass-card`), sticky position.
- **Interactions**:
  - Desktop: Golden underline transitions on hover.
  - Mobile: Fullscreen sliding slide-over menu with staggered items.
  - Profile dropdown with mock role switcher (Super Admin, Trustee, Accountant, Devotee).

### 1.2 Glass Card (`/src/components/ui/GlassCard.tsx`)
- **Structure**: Wrapping div configured with blur backdrop, rounded borders (`rounded-3xl`), and responsive padding.
- **Props**:
  - `variant`: `'light' | 'dark'`
  - `hoverEffect`: `boolean` (Adds scale and golden border on hover)

### 1.3 Section Header (`/src/components/shared/SectionHeader.tsx`)
- **Structure**: Centered or left-aligned typography block.
- **Styling**: Small golden uppercase label (eyebrow text) followed by a large Cormorant Garamond title, and a soft body summary.

---

## 2. MODULE WIDGETS

### 2.1 Interactive Booking Calendar (`/src/components/ui/Calendar.tsx`)
- **Structure**: Grid showing monthly calendar days.
- **Client State**: Track current selected month/year.
- **Functionality**:
  - Highlight "Available" (green dot) vs "Booked" (disabled/gray stripe) dates using data from `/src/data/hallBookings.ts`.
  - Clicking an available date opens the booking form drawer.

### 2.2 Mock Analytics Charts (`/src/components/dashboard/AnalyticsChart.tsx`)
- **Aesthetic**: Modern, clean bar or line charts using SVG elements to avoid heavy charting libraries while ensuring a beautiful dashboard UI.
- **Features**: Tooltips on hover, path drawings with primary gold gradients, and matching x/y grid lines.

### 2.3 Data Tables (`/src/components/dashboard/DataTable.tsx`)
- **Features**:
  - Pagination controls (Items per page, Current page index).
  - Search bar input matching properties inside the dataset.
  - Filter drop-down list (e.g. Filter by Status, Campaign Type).
  - Skeleton loaders shown for 500ms when changing pages or search filters to simulate API delays.

### 2.4 Status Badge Component (`/src/components/ui/StatusBadge.tsx`)
- **Structure**: Soft filled badge with matching colored text.
- **Color mappings**:
  - `CONFIRMED`/`PAID`/`ACTIVE`: Success Green
  - `PENDING`: Warning Gold
  - `CANCELLED`/`FAILED`: Error Red

---

## 3. FORM CONTROLS

All input components (text, numbers, selectors, date pickers) must support:
1. Underline or border styles matching the luxury brand (e.g. gold borders on focus).
2. Clean validation error display using React Hook Form's `error.message`.
3. Standard helper labels and accessibility mappings (`aria-describedby`, label associations).
