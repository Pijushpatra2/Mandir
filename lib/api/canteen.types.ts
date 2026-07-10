/**
 * canteen.types.ts
 *
 * Frontend TypeScript interfaces that mirror the backend canteen.types.ts.
 * Used by all query hooks, mutations, and Dexie offline schema.
 * All DB column names stay in snake_case to match API responses exactly.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type CanteenStaffRole = 'manager' | 'receptionist' | 'cashier' | 'kitchen';

export interface CanteenStaffProfile {
  id: number;
  name: string;
  email: string;
  assigned_role: CanteenStaffRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

// ─── Tables ───────────────────────────────────────────────────────────────────

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';

export interface CanteenTable {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  current_bill: number;
  occupied_since: string | null;
  location_zone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export type MenuCategory = string;
export type MenuVariety  = 'Regular' | 'Jain' | 'Spicy' | 'Sweet';

export interface CanteenMenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  variety: MenuVariety;
  description: string | null;
  image_url: string | null;
  available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export type CustomerType = 'VIP' | 'Regular' | 'Guest';

export interface CanteenCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  customer_type: CustomerType;
  total_orders: number;
  total_visits: number;
  total_spent: number;
  last_visit: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'PENDING';
export type PaymentStatus = 'PAID' | 'PENDING' | 'REFUNDED';
export type OrderStatus   = 'NEW' | 'PREPARING' | 'READY_TO_SERVE' | 'COMPLETED' | 'CANCELLED';

export interface CanteenOrderItem {
  id?: number;
  order_id?: string;
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  line_total: number;
  cooking_notes?: string | null;
}

export interface CanteenOrder {
  id: string;
  token_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  table_id: string | null;
  table_name: string;
  served_by: number | null;
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes: string | null;
  ordered_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  items?: CanteenOrderItem[];
}

/** Shape of a kitchen queue row from canteen_vw_kitchen_queue view */
export interface KitchenQueueItem {
  order_id: string;
  token_number: string;
  table_name: string;
  customer_name: string;
  order_status: OrderStatus;
  ordered_at: string;
  item_name: string;
  quantity: number;
  cooking_notes: string | null;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingStatus = 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';

export interface CanteenBooking {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  table_id: string;
  booking_date: string;
  booking_time: string;
  party_size: number;
  status: BookingStatus;
  special_notes: string | null;
  booked_by: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type InventoryCategory = 'Grains' | 'Dairy' | 'Spices' | 'Beverages' | 'Vegetables' | 'Other';

export interface CanteenInventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  stock: number;
  unit: string;
  min_stock: number;
  supplier_id: string | null;
  unit_cost: number | null;
  last_restocked: string | null;
  created_at: string;
  updated_at: string;
}

export interface LowStockItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
  unit: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface TodayReportSummary {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  avg_order_value: number;
  cash_revenue: number;
  upi_revenue: number;
  card_revenue: number;
}

export interface TopCustomer {
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  total_spent: number;
  total_orders: number;
  last_visit: string;
}

export interface ReportSummary {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

// ─── API response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
