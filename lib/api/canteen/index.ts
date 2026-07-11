/**
 * index.ts — Barrel file for all Canteen API hooks
 *
 * Import all hooks from a single path:
 *   import { useMenu, useOrders, usePlaceOrder } from '@/lib/api/canteen';
 *
 * Types are imported from:
 *   import type { CanteenOrder } from '@/lib/api/canteen.types';
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────
export {
  useStaffLogin,
  useStaffProfile,
  useStaffLogout,
  useStaffList,
  useAddStaff,
  useDeleteStaff,
} from './useAuth';

// ─── Menu ─────────────────────────────────────────────────────────────────────
export { useMenu, useAddMenuItem, useEditMenuItem, useDeleteMenuItem } from './useMenu';

// ─── Tables ───────────────────────────────────────────────────────────────────
export { useTables, useUpdateTable, useAddTable } from './useTables';

// ─── Kitchen Queue ────────────────────────────────────────────────────────────
export { useKitchenQueue, useUpdateOrderStatus } from './useKitchenQueue';

// ─── Orders ───────────────────────────────────────────────────────────────────
export { useOrders, usePlaceOrder, useRecordPayment, useCancelOrder } from './useOrders';

// ─── Customers ────────────────────────────────────────────────────────────────
export { useCustomers, useCustomerSearch, useAddCustomer, useEditCustomer } from './useCustomers';

// ─── Bookings ─────────────────────────────────────────────────────────────────
export { useBookings, useAddBooking, useUpdateBooking } from './useBookings';

// ─── Inventory ────────────────────────────────────────────────────────────────
export { useInventory, useLowStock, useAdjustInventory, useLogWaste } from './useInventory';

// ─── Reports ──────────────────────────────────────────────────────────────────
export { useTodayReport, useTopCustomers, useReportsSummary } from './useReports';

// ─── Categories ───────────────────────────────────────────────────────────────
export { useCategories, useAddCategory, useDeleteCategory, useUpdateCategory } from './useCategories';
