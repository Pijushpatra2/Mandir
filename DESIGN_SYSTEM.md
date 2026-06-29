# TEMPLE ERP - DESIGN SYSTEM (FRONTEND ONLY)

This document establishes the UI specifications, Tailwind CSS configurations, and visual variables for the **Temple ERP Platform Frontend**.

Our aesthetic combines the heritage of spiritual traditions with a premium, luxury SaaS visual layout inspired by Apple, Stripe, and Linear.

---

## 1. BRAND PALETTE (HEX & Tailwind v4)

In Tailwind CSS v4, custom colors can be defined directly via CSS variables in the theme layer or standard theme configuration.

```css
@theme {
  --color-primary-gold: #C59D5F;
  --color-secondary-bronze: #8B5E34;
  --color-dark-surface: #111111;
  --color-bg-warm: #FAF7F2;
  --color-surface-white: #FFFFFF;
  --color-accent-purple: #7C3AED;
  --color-success-green: #16A34A;
  --color-warning-amber: #F59E0B;
  --color-error-red: #DC2626;

  --font-heading: "Cormorant Garamond", serif;
  --font-body: "Inter", sans-serif;
  
  --radius-luxury: 24px;
}
```

---

## 2. TYPOGRAPHY HIERARCHY

- **Heading Style (Cormorant Garamond)**:
  - Font weights: Medium (500), SemiBold (600), Bold (700)
  - Layout spacing: `tracking-wide`
  - Style: Subtle italicized highlights for spiritual themes (e.g. *"Divine Darshan"*).
- **Body & Interactive Style (Inter)**:
  - Font weights: Regular (400) for reading, Medium (500) for UI headers, SemiBold (600) for buttons and active states.
  - Spacing: `tracking-normal` or `tracking-tight` on small UI text.

---

## 3. GLASSMORPHIC UI COMPONENTS

All major card containers utilize custom glassmorphism styles:

```css
/* Glass Card Utility */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(139, 94, 52, 0.04);
}

/* Glass Card Dark Accent */
.glass-card-dark {
  background: rgba(17, 17, 17, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.25);
}
```

---

## 4. FRAMER MOTION INTERACTION PRESETS

Use the following transition tokens to ensure visual alignment:

### 4.1 Blur Reveal (Hero Titles)
```typescript
export const blurReveal = {
  hidden: { filter: "blur(12px)", opacity: 0 },
  visible: { 
    filter: "blur(0px)", 
    opacity: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
  }
};
```

### 4.2 Fade Up Stagger (Grid lists, Cards)
```typescript
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};
```

### 4.3 Interactive Hover (Buttons, Navigation items)
- **Primary Buttons**: Scale slightly (`scale: 1.02`), change background color overlay, drop shadow expands slightly.
- **Glass Cards**: Shift up (`y: -6px`), increase shadow depth, golden border highlights slightly (`border-color: rgba(197, 157, 95, 0.4)`).
