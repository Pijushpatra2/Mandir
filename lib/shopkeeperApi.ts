import axios from "axios";
import {
  getAdminAccessToken,
  getShopkeeperAccessToken,
  setShopkeeperTokens,
  clearShopkeeperTokens
} from "@/lib/authStorage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

const api = axios.create({
  baseURL: `${BASE_URL}/shopkeepers`,
  headers: { "Content-Type": "application/json" },
});

// Attach Authorization header dynamically (prioritize shopkeeper token for shopkeeper actions, admin token for admin actions)
api.interceptors.request.use((config) => {
  const shopkeeperToken = getShopkeeperAccessToken();
  const adminToken = getAdminAccessToken();
  
  // If requesting an admin endpoint, use admin token
  if (config.url?.includes('/admin')) {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    // Otherwise use shopkeeper token or admin fallback
    const token = shopkeeperToken || adminToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface ShopkeeperItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  store_name?: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  is_active: number | boolean;
  avatar_url?: string | null;
  address?: string | null;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

export interface ShopkeeperDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  todaySalesUGX: number;
  totalRevenueUGX: number;
}

// ─── Shopkeeper Auth & Profile ──────────────────────────────────────────────

export async function loginShopkeeper(credentials: { email: string; password: string }): Promise<{
  shopkeeper: ShopkeeperItem;
  accessToken: string;
}> {
  const res = await api.post("/login", credentials);
  if (res.data.data?.accessToken) {
    setShopkeeperTokens(res.data.data.accessToken, res.data.data.accessToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("shopkeeper_is_logged_in", "true");
      localStorage.setItem("shopkeeper_profile", JSON.stringify(res.data.data.shopkeeper));
    }
  }
  return res.data.data;
}

export async function getShopkeeperProfile(): Promise<ShopkeeperItem> {
  try {
    const res = await api.get("/me");
    if (res.data?.data?.shopkeeper) {
      if (typeof window !== "undefined") {
        localStorage.setItem("shopkeeper_profile", JSON.stringify(res.data.data.shopkeeper));
      }
      return res.data.data.shopkeeper;
    }
    throw new Error("Invalid profile response");
  } catch (err: any) {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("shopkeeper_profile");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    throw err;
  }
}

export async function updateShopkeeperProfile(data: {
  name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}): Promise<ShopkeeperItem> {
  const res = await api.put("/profile", data);
  if (typeof window !== "undefined" && res.data.data?.shopkeeper) {
    localStorage.setItem("shopkeeper_profile", JSON.stringify(res.data.data.shopkeeper));
  }
  return res.data.data.shopkeeper;
}

export async function changeShopkeeperPassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const res = await api.put("/change-password", data);
  return res.data;
}

export async function getShopkeeperDashboardStats(): Promise<ShopkeeperDashboardStats> {
  const res = await api.get("/dashboard/stats");
  return res.data.data;
}

export function logoutShopkeeper(): void {
  clearShopkeeperTokens();
}

// ─── Admin Shopkeeper Management APIs ────────────────────────────────────────

export async function adminListShopkeepers(): Promise<ShopkeeperItem[]> {
  const res = await api.get("/admin/list");
  return res.data.data.shopkeepers || [];
}

export async function adminCreateShopkeeper(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  store_name?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  address?: string;
}): Promise<ShopkeeperItem> {
  const res = await api.post("/admin/create", data);
  return res.data.data.shopkeeper;
}

export async function adminUpdateShopkeeper(
  id: string,
  data: {
    name?: string;
    phone?: string;
    store_name?: string;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    is_active?: boolean | number;
    address?: string;
  }
): Promise<ShopkeeperItem> {
  const res = await api.put(`/admin/${id}`, data);
  return res.data.data.shopkeeper;
}

export async function adminResetShopkeeperPassword(
  id: string,
  password: string
): Promise<{ message: string }> {
  const res = await api.put(`/admin/${id}/reset-password`, { password });
  return res.data;
}

export async function adminDeleteShopkeeper(id: string): Promise<{ message: string }> {
  const res = await api.delete(`/admin/${id}`);
  return res.data;
}
