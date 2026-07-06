'use client';

/**
 * useAuth.ts
 *
 * Canteen Staff authentication hooks.
 *
 * Hooks:
 *   useStaffLogin()    → mutation: POST /canteen/auth/login
 *   useStaffProfile()  → query: GET /canteen/auth/me (ONCE per session)
 *   useStaffLogout()   → clears tokens + redirects to login
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import { setStaffTokens, clearStaffTokens } from '@/lib/authStorage';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { ApiResponse, CanteenStaffProfile, CanteenStaffRole } from '@/lib/api/canteen.types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  staff: CanteenStaffProfile;
  accessToken: string;
  refreshToken: string;
}

// ─── Login Mutation ───────────────────────────────────────────────────────────

/**
 * useStaffLogin
 *
 * Strategy: ON-ACT — called only when user clicks the login button.
 * On success: stores tokens in localStorage and prefetches staff profile.
 *
 * @example
 * const { mutate: login, isPending } = useStaffLogin();
 * login({ email, password }, { onSuccess: () => router.push('/canteenPOS/dashboard') });
 */
export function useStaffLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload): Promise<LoginResponse> => {
      const { data } = await staffApiClient.post<ApiResponse<LoginResponse>>(
        '/canteen/auth/login',
        payload,
      );
      return data.data;
    },
    onSuccess: (result) => {
      // Store tokens for future requests
      setStaffTokens(result.accessToken, result.refreshToken);
      // Pre-seed the profile query so it never needs to fetch separately
      queryClient.setQueryData(QUERY_KEYS.staffProfile(), result.staff);
    },
    retry: false, // Never retry login failures
  });
}

// ─── Staff Profile Query ──────────────────────────────────────────────────────

/**
 * useStaffProfile
 *
 * Strategy: ONCE per session — fetches on mount, cached for 60 minutes.
 * Only called if a token exists in localStorage.
 *
 * @example
 * const { data: profile, isLoading } = useStaffProfile();
 */
export function useStaffProfile() {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('canteen_staff_access_token')
      : null;

  return useQuery({
    queryKey: QUERY_KEYS.staffProfile(),
    queryFn: async (): Promise<CanteenStaffProfile> => {
      const { data } = await staffApiClient.get<ApiResponse<CanteenStaffProfile>>(
        '/canteen/auth/me',
      );
      return data.data;
    },
    enabled: !!token,           // Only fetch if token exists
    staleTime: 60 * 60 * 1000, // 60 minutes — profile never changes during shift
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });
}

// ─── Logout Helper ────────────────────────────────────────────────────────────

/**
 * useStaffLogout
 *
 * Clears all cached queries and staff tokens, then navigates to login.
 *
 * @example
 * const logout = useStaffLogout();
 * <button onClick={logout}>Sign Out</button>
 */
export function useStaffLogout() {
  const queryClient = useQueryClient();

  return () => {
    clearStaffTokens();
    queryClient.clear(); // Remove ALL cached queries for this session
    if (typeof window !== 'undefined') {
      window.location.href = '/canteenPOS';
    }
  };
}

// ─── Staff Administrative CRUD Hooks (Admin panel only) ──────────────────────

import { adminApiClient } from '@/lib/apiClient';

/**
 * useStaffList
 *
 * Strategy: ONCE (60 min stale) — gets all canteen staff accounts for administrative CRM list.
 */
export function useStaffList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.staffList(),
    queryFn: async (): Promise<CanteenStaffProfile[]> => {
      // Admin dashboard requests go through adminApiClient
      const { data } = await adminApiClient.get<ApiResponse<CanteenStaffProfile[]>>(
        '/canteen/staff'
      );
      return data.data;
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

interface CreateStaffPayload {
  name: string;
  email: string;
  password_hash?: string; // standard password passed by client is hashed/processed by server
  password?: string;
  assigned_role: CanteenStaffRole;
}

/**
 * useAddStaff
 *
 * Adds a new staff account profile.
 * Invalidates staffList on success.
 */
export function useAddStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      const { data } = await adminApiClient.post<ApiResponse<CanteenStaffProfile>>(
        '/canteen/staff',
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffList() });
    },
  });
}

/**
 * useDeleteStaff
 *
 * Deletes a staff account.
 * Invalidates staffList on success.
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await adminApiClient.delete(`/canteen/staff/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffList() });
    },
  });
}
