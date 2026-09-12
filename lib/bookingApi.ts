import axios from "axios";
import { getAdminAccessToken, getDevoteeAccessToken } from "@/lib/authStorage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

const api = axios.create({
  baseURL: `${BASE_URL}/temple-bookings`,
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization header dynamically
api.interceptors.request.use((config) => {
  const adminToken = getAdminAccessToken();
  const devoteeToken = getDevoteeAccessToken();
  const token = adminToken || devoteeToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types for Temple Bookings API
export interface TempleHallItem {
  id: string;
  name: string;
  description: string;
  capacity: number;
  max_people_at_a_time: number;
  space_sqft: number;
  price_per_day: number;
  price_per_half_day: number;
  image_url: string | null;
  amenities: string[] | string | null;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TempleHallBookingItem {
  id: string;
  hall_id: string;
  hall_name: string;
  devotee_id: string | null;
  devotee_name: string;
  devotee_email: string | null;
  devotee_phone: string;
  event_title: string;
  booking_date: string;
  duration_type: "full" | "half" | "multi";
  duration_days: number;
  start_time: string;
  end_time: string;
  expected_guests: number;
  base_price: number;
  cleaning_fee: number;
  deposit: number;
  total_price: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
  payment_status: "PENDING" | "PAID" | "REFUNDED";
  notes: string | null;
  created_at?: string;
}

export interface TempleDarshanSlotItem {
  id: string;
  slot_name: string;
  start_time: string;
  end_time: string;
  max_visitors_limit: number;
  time_zone: string;
  description: string | null;
  badge: string | null;
  is_active: number | boolean;
}

export interface TempleDarshanBookingItem {
  id: string;
  slot_id: string | null;
  slot_name: string;
  devotee_id: string | null;
  devotee_name: string;
  devotee_phone: string;
  devotee_email: string | null;
  visit_date: string;
  visitor_count: number;
  qr_code_url: string | null;
  status: "CONFIRMED" | "CHECKED_IN" | "CANCELLED";
  created_at?: string;
}

export interface TemplePujaItem {
  id: string;
  name: string;
  category: "Special" | "Abhishek" | "Daily" | "Homa" | "General";
  description: string;
  base_price: number;
  samagri_price: number;
  duration_minutes: number;
  priest_role: string;
  image_url: string | null;
  is_active: number | boolean;
}

export interface TemplePujaBookingItem {
  id: string;
  puja_id: string;
  puja_name: string;
  devotee_id: string | null;
  devotee_name: string;
  devotee_phone: string | null;
  devotee_email: string | null;
  gothra: string | null;
  nakshatra: string | null;
  booking_date: string;
  time_slot: string;
  has_samagri: number | boolean;
  base_amount: number;
  samagri_amount: number;
  total_amount: number;
  priest_name: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
  payment_status: "PAID" | "PENDING" | "REFUNDED";
  receipt_number: string;
  created_at?: string;
}

// ─── 1. Halls API ─────────────────────────────────────────────────────────────

export async function fetchHalls(includeInactive = false): Promise<TempleHallItem[]> {
  const res = await api.get<{ status: string; data: { halls: TempleHallItem[] } }>(
    `/halls${includeInactive ? "?all=true" : ""}`
  );
  return res.data.data.halls;
}

export async function createHall(data: Partial<TempleHallItem>): Promise<TempleHallItem> {
  const res = await api.post<{ status: string; data: { hall: TempleHallItem } }>("/halls", data);
  return res.data.data.hall;
}

export async function updateHall(id: string, data: Partial<TempleHallItem>): Promise<TempleHallItem> {
  const res = await api.put<{ status: string; data: { hall: TempleHallItem } }>(`/halls/${id}`, data);
  return res.data.data.hall;
}

export async function deleteHall(id: string): Promise<void> {
  await api.delete(`/halls/${id}`);
}

// ─── 2. Hall Bookings API ─────────────────────────────────────────────────────

export async function createHallBooking(data: Partial<TempleHallBookingItem>): Promise<TempleHallBookingItem> {
  const res = await api.post<{ status: string; data: { booking: TempleHallBookingItem } }>(
    "/hall-bookings",
    data
  );
  return res.data.data.booking;
}

export async function fetchAllHallBookings(): Promise<TempleHallBookingItem[]> {
  const res = await api.get<{ status: string; data: { bookings: TempleHallBookingItem[] } }>(
    "/hall-bookings"
  );
  return res.data.data.bookings;
}

export interface DevoteeFilterParams {
  devotee_id?: string | null;
  email?: string | null;
  phone?: string | null;
}

const buildDevoteeQueryParams = (params: string | DevoteeFilterParams): string => {
  if (typeof params === "string") {
    const clean = params.trim();
    return `devotee_id=${encodeURIComponent(clean)}&email=${encodeURIComponent(clean)}&phone=${encodeURIComponent(clean)}`;
  }
  const searchParams = new URLSearchParams();
  if (params.devotee_id) searchParams.set("devotee_id", params.devotee_id);
  if (params.email) searchParams.set("email", params.email);
  if (params.phone) searchParams.set("phone", params.phone);
  return searchParams.toString();
};

export async function fetchMyHallBookings(
  params: string | DevoteeFilterParams
): Promise<TempleHallBookingItem[]> {
  const query = buildDevoteeQueryParams(params);
  const res = await api.get<{ status: string; data: { bookings: TempleHallBookingItem[] } }>(
    `/hall-bookings/my?${query}`
  );
  return res.data.data.bookings;
}

export async function updateHallBookingStatus(
  id: string,
  status: string,
  payment_status?: string
): Promise<TempleHallBookingItem> {
  const res = await api.patch<{ status: string; data: { booking: TempleHallBookingItem } }>(
    `/hall-bookings/${id}/status`,
    { status, payment_status }
  );
  return res.data.data.booking;
}

// ─── 3. Darshan Slots API ─────────────────────────────────────────────────────

export async function fetchDarshanSlots(includeInactive = false): Promise<TempleDarshanSlotItem[]> {
  const res = await api.get<{ status: string; data: { slots: TempleDarshanSlotItem[] } }>(
    `/darshan-slots${includeInactive ? "?all=true" : ""}`
  );
  return res.data.data.slots;
}

export async function createDarshanSlot(data: Partial<TempleDarshanSlotItem>): Promise<TempleDarshanSlotItem> {
  const res = await api.post<{ status: string; data: { slot: TempleDarshanSlotItem } }>(
    "/darshan-slots",
    data
  );
  return res.data.data.slot;
}

export async function updateDarshanSlot(
  id: string,
  data: Partial<TempleDarshanSlotItem>
): Promise<TempleDarshanSlotItem> {
  const res = await api.put<{ status: string; data: { slot: TempleDarshanSlotItem } }>(
    `/darshan-slots/${id}`,
    data
  );
  return res.data.data.slot;
}

export async function deleteDarshanSlot(id: string): Promise<void> {
  await api.delete(`/darshan-slots/${id}`);
}

// ─── 4. Darshan Bookings API ─────────────────────────────────────────────────

export async function createDarshanBooking(data: Partial<TempleDarshanBookingItem>): Promise<TempleDarshanBookingItem> {
  const res = await api.post<{ status: string; data: { booking: TempleDarshanBookingItem } }>(
    "/darshan-bookings",
    data
  );
  return res.data.data.booking;
}

export async function fetchAllDarshanBookings(): Promise<TempleDarshanBookingItem[]> {
  const res = await api.get<{ status: string; data: { bookings: TempleDarshanBookingItem[] } }>(
    "/darshan-bookings"
  );
  return res.data.data.bookings;
}

export async function fetchMyDarshanBookings(
  params: string | DevoteeFilterParams
): Promise<TempleDarshanBookingItem[]> {
  const query = buildDevoteeQueryParams(params);
  const res = await api.get<{ status: string; data: { bookings: TempleDarshanBookingItem[] } }>(
    `/darshan-bookings/my?${query}`
  );
  return res.data.data.bookings;
}

export async function updateDarshanBookingStatus(
  id: string,
  status: string
): Promise<TempleDarshanBookingItem> {
  const res = await api.patch<{ status: string; data: { booking: TempleDarshanBookingItem } }>(
    `/darshan-bookings/${id}/status`,
    { status }
  );
  return res.data.data.booking;
}

// ─── 5. Pujas API ─────────────────────────────────────────────────────────────

export async function fetchPujas(includeInactive = false): Promise<TemplePujaItem[]> {
  const res = await api.get<{ status: string; data: { pujas: TemplePujaItem[] } }>(
    `/pujas${includeInactive ? "?all=true" : ""}`
  );
  return res.data.data.pujas;
}

export async function createPuja(data: Partial<TemplePujaItem>): Promise<TemplePujaItem> {
  const res = await api.post<{ status: string; data: { puja: TemplePujaItem } }>("/pujas", data);
  return res.data.data.puja;
}

export async function updatePuja(id: string, data: Partial<TemplePujaItem>): Promise<TemplePujaItem> {
  const res = await api.put<{ status: string; data: { puja: TemplePujaItem } }>(`/pujas/${id}`, data);
  return res.data.data.puja;
}

export async function deletePuja(id: string): Promise<void> {
  await api.delete(`/pujas/${id}`);
}

// ─── 6. Puja Bookings API ─────────────────────────────────────────────────────

export async function createPujaBooking(data: Partial<TemplePujaBookingItem>): Promise<TemplePujaBookingItem> {
  const res = await api.post<{ status: string; data: { booking: TemplePujaBookingItem } }>(
    "/puja-bookings",
    data
  );
  return res.data.data.booking;
}

export async function fetchAllPujaBookings(): Promise<TemplePujaBookingItem[]> {
  const res = await api.get<{ status: string; data: { bookings: TemplePujaBookingItem[] } }>(
    "/puja-bookings"
  );
  return res.data.data.bookings;
}

export async function fetchMyPujaBookings(
  params: string | DevoteeFilterParams
): Promise<TemplePujaBookingItem[]> {
  const query = buildDevoteeQueryParams(params);
  const res = await api.get<{ status: string; data: { bookings: TemplePujaBookingItem[] } }>(
    `/puja-bookings/my?${query}`
  );
  return res.data.data.bookings;
}

export async function updatePujaBookingStatus(
  id: string,
  status: string,
  payment_status?: string
): Promise<TemplePujaBookingItem> {
  const res = await api.patch<{ status: string; data: { booking: TemplePujaBookingItem } }>(
    `/puja-bookings/${id}/status`,
    { status, payment_status }
  );
  return res.data.data.booking;
}
