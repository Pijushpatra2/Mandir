/**
 * apiClient.ts
 *
 * Central Axios instances for the Swami Canteen POS API.
 *
 * Two separate clients are exported:
 *   - staffApiClient  → Used by Canteen POS terminal (staff JWT preferred,
 *                       falls back to admin JWT so super-admins can operate
 *                       the POS without a separate canteen staff login)
 *   - adminApiClient  → Used by the Admin dashboard (admin JWT only)
 *
 * Token Resolution Priority (staffApiClient):
 *   1. canteen_staff_access_token  (canteen staff login)
 *   2. admin_access_token          (super admin / module admin fallback)
 *
 * Each client:
 *   - Automatically attaches the resolved JWT in the Authorization header.
 *   - On 401: silently attempts a single token refresh before failing.
 *   - On refresh failure: clears tokens and redirects to the correct login.
 *   - Queues all parallel 401 requests while a refresh is in-flight so that
 *     only ONE refresh call is ever made (prevents refresh storm).
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  getStaffAccessToken,
  getStaffRefreshToken,
  setStaffTokens,
  clearStaffTokens,
  getAdminAccessToken,
  getAdminRefreshToken,
  setAdminTokens,
  clearAdminTokens,
} from '@/lib/authStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001/api';

// ─── Active Client Helper ─────────────────────────────────────────────────────

/**
 * Returns the correct Axios client based on which token is present.
 * Admin dashboard always uses adminApiClient.
 * CanteenPOS uses staffApiClient (which internally falls back to admin token).
 */
export function getActiveClient(): AxiosInstance {
  const hasAdminToken =
    typeof window !== 'undefined' && !!getAdminAccessToken();
  return hasAdminToken ? adminApiClient : staffApiClient;
}

// ─── Refresh State ────────────────────────────────────────────────────────────

/** In-flight refresh guard — prevents concurrent refresh storms. */
let staffRefreshing = false;
let adminRefreshing = false;

/**
 * Session-invalid flags.
 * Set to true ONLY after a refresh attempt has failed.
 * Must be explicitly reset via resetStaffSession() / resetAdminSession()
 * when the user logs in again.
 */
let staffSessionInvalid = false;
let adminSessionInvalid = false;

/** Queues of callbacks waiting for an in-flight refresh to complete. */
let staffQueue: Array<(token: string) => void> = [];
let adminQueue: Array<(token: string) => void> = [];

/** Drains all queued request callbacks with the new access token. */
function processQueue(
  queue: Array<(token: string) => void>,
  token: string,
): void {
  queue.forEach((cb) => cb(token));
}

// ─── Public Reset Helpers ─────────────────────────────────────────────────────

/**
 * Reset all staff-session refresh state.
 * Call this immediately after a successful staff OR admin login so that
 * stale session-invalid flags from a previous session don't block requests.
 */
export function resetStaffSession(): void {
  staffSessionInvalid = false;
  staffRefreshing = false;
  staffQueue = [];
}

/**
 * Reset all admin-session refresh state.
 * Call this immediately after a successful admin login.
 */
export function resetAdminSession(): void {
  adminSessionInvalid = false;
  adminRefreshing = false;
  adminQueue = [];
}

// ─── Staff API Client ─────────────────────────────────────────────────────────

export const staffApiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Request interceptor — token resolution:
 *  1. Try canteen_staff_access_token  (canteen staff)
 *  2. Fall back to admin_access_token (super admin accessing POS)
 */
staffApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStaffAccessToken() ?? getAdminAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor — handles 401 Unauthorized:
 *
 * Flow:
 *  ┌─ 401 received ──────────────────────────────────────────────────────┐
 *  │  Already retried or session invalid?                                │
 *  │    ├─ Admin token present? → reject silently (admin handles itself) │
 *  │    └─ No admin token? → clear staff tokens → redirect to login      │
 *  │  Refresh in-flight? → queue request, wait for refresh              │
 *  │  Otherwise → attempt staff token refresh                           │
 *  │    ├─ No staff refresh token but admin token exists?               │
 *  │    │    → re-attach admin token and retry (super admin shortcut)   │
 *  │    ├─ Refresh success → drain queue → retry original request       │
 *  │    └─ Refresh failure → clear tokens → redirect to canteen login   │
 *  └─────────────────────────────────────────────────────────────────────┘
 */
staffApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Already retried or session is known invalid
    if (staffSessionInvalid || original._retry) {
      // If the user is a super-admin, don't redirect them to the canteen login.
      // The adminApiClient's own 401 handler will deal with admin token expiry.
      const hasAdminSession = !!getAdminAccessToken();
      if (!hasAdminSession) {
        staffSessionInvalid = true;
        clearStaffTokens();
        staffQueue = [];
        if (
          typeof window !== 'undefined' &&
          window.location.pathname !== '/canteenPOS'
        ) {
          window.location.href = '/canteenPOS';
        }
      }
      return Promise.reject(error);
    }

    // Another refresh is already in-flight — queue this request
    if (staffRefreshing) {
      original._retry = true;
      return new Promise((resolve) => {
        staffQueue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(staffApiClient(original));
        });
      });
    }

    original._retry = true;
    staffRefreshing = true;

    try {
      const staffRefreshToken = getStaffRefreshToken();

      // ── Super-admin shortcut ──────────────────────────────────────────────
      // No staff refresh token but an admin access token exists → the request
      // was made by a super-admin.  Re-attach the admin token and retry; the
      // admin token is still valid (the 401 was because the request was sent
      // without any token on the very first load before state hydrated).
      if (!staffRefreshToken) {
        const adminToken = getAdminAccessToken();
        if (adminToken) {
          original.headers.Authorization = `Bearer ${adminToken}`;
          processQueue(staffQueue, adminToken);
          staffQueue = [];
          return staffApiClient(original);
        }
        throw new Error('No staff refresh token and no admin token available');
      }

      // ── Normal staff token refresh ────────────────────────────────────────
      const { data } = await axios.post(`${BASE_URL}/canteen/auth/refresh`, {
        refreshToken: staffRefreshToken,
      });

      const newAccessToken: string = data.data.accessToken;
      const newRefreshToken: string = data.data.refreshToken ?? staffRefreshToken;

      setStaffTokens(newAccessToken, newRefreshToken);
      staffSessionInvalid = false;
      processQueue(staffQueue, newAccessToken);
      staffQueue = [];

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return staffApiClient(original);
    } catch (refreshError) {
      // Staff refresh failed — only redirect if no admin session exists
      const hasAdminSession = !!getAdminAccessToken();
      clearStaffTokens();
      staffSessionInvalid = true;
      staffQueue = [];

      if (
        !hasAdminSession &&
        typeof window !== 'undefined' &&
        window.location.pathname !== '/canteenPOS'
      ) {
        window.location.href = '/canteenPOS';
      }
      return Promise.reject(refreshError);
    } finally {
      staffRefreshing = false;
    }
  },
);

// ─── Admin API Client ─────────────────────────────────────────────────────────

export const adminApiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Attach global admin JWT on every outgoing request. */
adminApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAdminAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor — handles 401 for the admin dashboard client.
 *
 * Flow:
 *  ┌─ 401 received ──────────────────────────────────────────────────────┐
 *  │  Already retried or session invalid? → clear → redirect to login    │
 *  │  Refresh in-flight? → queue request, wait for refresh              │
 *  │  Otherwise → attempt admin token refresh                           │
 *  │    ├─ Success → drain queue → retry original request               │
 *  │    └─ Failure → clear tokens → redirect to /dashboard/login        │
 *  └─────────────────────────────────────────────────────────────────────┘
 */
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (adminSessionInvalid || original._retry) {
      adminSessionInvalid = true;
      clearAdminTokens();
      adminQueue = [];
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/login';
      }
      return Promise.reject(error);
    }

    // Another refresh is already in-flight — queue this request
    if (adminRefreshing) {
      original._retry = true;
      return new Promise((resolve) => {
        adminQueue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(adminApiClient(original));
        });
      });
    }

    original._retry = true;
    adminRefreshing = true;

    try {
      const refreshToken = getAdminRefreshToken();
      if (!refreshToken) throw new Error('No admin refresh token');

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken: string = data.data.accessToken;
      const newRefreshToken: string = data.data.refreshToken ?? refreshToken;

      setAdminTokens(newAccessToken, newRefreshToken);
      adminSessionInvalid = false;
      processQueue(adminQueue, newAccessToken);
      adminQueue = [];

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return adminApiClient(original);
    } catch (refreshError) {
      clearAdminTokens();
      adminSessionInvalid = true;
      adminQueue = [];
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/login';
      }
      return Promise.reject(refreshError);
    } finally {
      adminRefreshing = false;
    }
  },
);
