'use client';

/**
 * useBookings.ts
 *
 * Strategy: CACHED 5-min — fetched when the bookings/calendar page opens.
 * Mutations invalidate bookings + tables (seating changes).
 *
 * Hooks:
 *   useBookings()        → GET /canteen/bookings (optional date filter)
 *   useAddBooking()      → POST /canteen/bookings
 *   useUpdateBooking()   → PATCH /canteen/bookings/:id
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApiClient } from '@/lib/apiClient';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { ApiResponse, CanteenBooking, BookingStatus } from '@/lib/api/canteen.types';

// ─── Fetch Bookings ───────────────────────────────────────────────────────────

/**
 * useBookings
 *
 * Fetches reservations for a given date or all upcoming bookings.
 * Each date is cached separately, so clicking different dates doesn't re-fetch.
 *
 * @example
 * const { data: bookings = [] } = useBookings();
 * const { data: bookings = [] } = useBookings({ date: '2026-07-05' });
 */
export function useBookings(filters?: { date?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings(filters?.date),
    queryFn: async (): Promise<CanteenBooking[]> => {
      const { data } = await staffApiClient.get<ApiResponse<CanteenBooking[]>>(
        '/canteen/bookings',
        { params: filters },
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
}

// ─── Add Booking ──────────────────────────────────────────────────────────────

interface AddBookingPayload {
  customer_name: string;
  customer_phone: string;
  customer_id?: string | null;
  table_id: string;
  booking_date: string;    // YYYY-MM-DD
  booking_time: string;    // HH:MM:SS
  party_size: number;
  special_notes?: string;
}

/**
 * useAddBooking
 *
 * Strategy: ON-ACT — fires on receptionist form submit.
 * After success: invalidates all bookings (not date-specific to cover calendar refresh).
 */
export function useAddBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddBookingPayload) => {
      const { data } = await staffApiClient.post<ApiResponse<CanteenBooking>>(
        '/canteen/bookings',
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      // Invalidate all bookings cache (covers any date filter)
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    retry: false,
  });
}

// ─── Update Booking ───────────────────────────────────────────────────────────

interface UpdateBookingPayload {
  id: string;
  updates: {
    status?: BookingStatus;
    table_id?: string;
    booking_date?: string;
    booking_time?: string;
    party_size?: number;
    special_notes?: string;
  };
}

/**
 * useUpdateBooking
 *
 * Strategy: ON-ACT — fires when manager updates a booking status (e.g., SEATED).
 * After success: invalidates bookings + tables (RESERVED → OCCUPIED status change).
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: UpdateBookingPayload) => {
      const { data } = await staffApiClient.patch<ApiResponse<CanteenBooking>>(
        `/canteen/bookings/${id}`,
        updates,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Table status changes when a booking is SEATED
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tables() });
    },
    retry: false,
  });
}
