/**
 * authStorage.ts
 *
 * Secure helpers for reading and writing JWT tokens in localStorage.
 * All reads/writes are guarded by a client-side window check so they
 * never crash during Next.js server-side rendering.
 */

const STAFF_ACCESS_KEY  = 'canteen_staff_access_token';
const STAFF_REFRESH_KEY = 'canteen_staff_refresh_token';
const ADMIN_ACCESS_KEY  = 'admin_access_token';
const ADMIN_REFRESH_KEY = 'admin_refresh_token';

// ─── Staff (Canteen POS Terminal) ────────────────────────────────────────────

export function getStaffAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STAFF_ACCESS_KEY);
}

export function getStaffRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STAFF_REFRESH_KEY);
}

export function setStaffTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STAFF_ACCESS_KEY, accessToken);
  localStorage.setItem(STAFF_REFRESH_KEY, refreshToken);
}

export function clearStaffTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STAFF_ACCESS_KEY);
  localStorage.removeItem(STAFF_REFRESH_KEY);
  localStorage.removeItem('canteen_is_logged_in');
  localStorage.removeItem('canteen_role');
  localStorage.removeItem('canteen_active_staff');
  localStorage.removeItem('canteen_user_name');
  localStorage.removeItem('canteen_user_email');
}

// ─── Admin (Global Admin Panel) ──────────────────────────────────────────────

export function getAdminAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_ACCESS_KEY);
}

export function getAdminRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_REFRESH_KEY);
}

export function setAdminTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_ACCESS_KEY, accessToken);
  localStorage.setItem(ADMIN_REFRESH_KEY, refreshToken);
}

export function clearAdminTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_ACCESS_KEY);
  localStorage.removeItem(ADMIN_REFRESH_KEY);
}

// ─── Devotee (Website / Devotee Portal) ──────────────────────────────────────

const DEVOTEE_ACCESS_KEY  = 'devotee_access_token';
const DEVOTEE_REFRESH_KEY = 'devotee_refresh_token';

export function getDevoteeAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVOTEE_ACCESS_KEY);
}

export function getDevoteeRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVOTEE_REFRESH_KEY);
}

export function setDevoteeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVOTEE_ACCESS_KEY, accessToken);
  localStorage.setItem(DEVOTEE_REFRESH_KEY, refreshToken);
}

export function clearDevoteeTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEVOTEE_ACCESS_KEY);
  localStorage.removeItem(DEVOTEE_REFRESH_KEY);
  localStorage.removeItem('devotee_is_logged_in');
  localStorage.removeItem('devotee_profile');
}

