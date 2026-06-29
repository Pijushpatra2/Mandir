/**
 * Design System Utility Tokens
 * This file centralizes standard classes for Sri Radhe Krishna Mandir ERP.
 * Use these tokens instead of writing hardcoded classes directly on elements.
 */

export const colors = {
  primaryGold: "#C59D5F",
  secondaryBronze: "#8B5E34",
  darkSurface: "#111111",
  bgWarm: "#FAF7F2",
  surfaceWhite: "#FFFFFF",
  accentPurple: "#7C3AED",
  successGreen: "#16A34A",
  warningAmber: "#F59E0B",
  errorRed: "#DC2626",
  neutralGray: "#E5E3DF",
};

export const layout = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  sectionPadding: "py-16 md:py-24",
  sectionHeaderSpacing: "mb-12 md:mb-16",
  gridCols2: "grid grid-cols-1 md:grid-cols-2 gap-8",
  gridCols3: "grid grid-cols-1 md:grid-cols-3 gap-8",
  gridCols4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
};

export const buttons = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-error-red text-white hover:bg-red-700 transition-all shadow-md cursor-pointer",
  ghost: "inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium text-secondary-bronze hover:bg-primary-gold/5 transition-all cursor-pointer",
  icon: "p-2.5 rounded-full hover:bg-primary-gold/10 text-secondary-bronze transition-all cursor-pointer",
};

export const inputs = {
  text: "input-standard",
  checkbox: "w-4 h-4 rounded text-primary-gold border-neutral-gray focus:ring-primary-gold focus:ring-2 accent-primary-gold cursor-pointer",
  label: "block text-xs font-semibold text-secondary-bronze/70 mb-1.5 uppercase tracking-wider",
  select: "input-standard bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%238B5E34%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10 appearance-none cursor-pointer",
};

export const cards = {
  glass: "glass-card",
  glassDark: "glass-card-dark",
  white: "bg-white border border-primary-gold/10 rounded-3xl p-6 md:p-8 shadow-sm",
  whiteHover: "bg-white border border-primary-gold/10 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md hover:border-primary-gold/20 transition-all duration-300",
};

export const badges = {
  success: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-green/10 text-success-green border border-success-green/20",
  warning: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-amber/10 text-warning-amber border border-warning-amber/20",
  error: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-red/10 text-error-red border border-error-red/20",
  info: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-purple/10 text-accent-purple border border-accent-purple/20",
  gold: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-gold/10 text-secondary-bronze border border-primary-gold/20",
};

export const typography = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  h5: "text-h5",
  bodyLg: "text-body-lg",
  body: "text-body",
  bodySm: "text-body-sm",
  caption: "text-caption",
};
