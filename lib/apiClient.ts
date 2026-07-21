/**
 * apiClient.ts
 *
 * Central Axios instances for the Swami Canteen POS API.
 *
 * Two separate clients are exported:
 *   - staffApiClient  → Used by Canteen POS terminal (staff JWT)
 *   - adminApiClient  → Used by Admin panel (admin JWT)
 *
 * Each client:
 *   - Automatically attaches the stored JWT in the Authorization header.
 *   - Handles 401 responses by silently refreshing the token once.
 *   - On refresh failure, clears tokens and redirects to the login page.
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getActiveClient() {
  const hasAdminToken = typeof window !== 'undefined' && !!getAdminAccessToken();
  return hasAdminToken ? adminApiClient : staffApiClient;
}

/** Track in-flight refresh attempts to avoid refresh loops. */
let staffRefreshing = false;
let adminRefreshing = false;

/** Queue of requests waiting for a token refresh to complete. */
let staffQueue: Array<(token: string) => void> = [];
let adminQueue: Array<(token: string) => void> = [];

function processQueue(queue: Array<(token: string) => void>, token: string) {
  queue.forEach((cb) => cb(token));
}

// ─── Staff API Client ─────────────────────────────────────────────────────────

export const staffApiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** Attach canteen staff JWT on every outgoing request. */
staffApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStaffAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/** Handle 401 — silently refresh the staff token once. */
staffApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (staffRefreshing) {
      // Queue request until the ongoing refresh completes
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
      const refreshToken = getStaffRefreshToken();
      if (!refreshToken) throw new Error('No staff refresh token');

      const { data } = await axios.post(`${BASE_URL}/canteen/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken: string = data.data.accessToken;
      const newRefreshToken: string = data.data.refreshToken ?? refreshToken;

      setStaffTokens(newAccessToken, newRefreshToken);
      processQueue(staffQueue, newAccessToken);
      staffQueue = [];

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return staffApiClient(original);
    } catch (refreshError) {
      clearStaffTokens();
      staffQueue = [];
      // Redirect to canteen login if refresh fails and we are not already on the login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/canteenPOS') {
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

/** Handle 401 — silently refresh the admin token once. */
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (adminRefreshing) {
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
      processQueue(adminQueue, newAccessToken);
      adminQueue = [];

      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return adminApiClient(original);
    } catch (refreshError) {
      clearAdminTokens();
      adminQueue = [];
      // Redirect to admin login if refresh fails
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/login';
      }
      return Promise.reject(refreshError);
    } finally {
      adminRefreshing = false;
    }
  },
);
