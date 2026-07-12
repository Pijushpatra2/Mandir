"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SeatingTable,
  FoodItem,
  CanteenOrder,
  TableBooking,
  InventoryItem,
  Supplier,
  CanteenCustomer,
  initialSuppliers,
  initialInventory,
  initialCustomers
} from "@/data/canteen";
import {
  useOfflineMenu,
  useOfflineTables,
  useOfflineOrder,
} from "@/lib/offline";
import {
  useOrders,
  useUpdateOrderStatus,
  useBookings,
  useAddBooking,
  useUpdateBooking,
  useCustomers,
  useAddCustomer,
  useUpdateTable,
} from "@/lib/api/canteen";
import { staffApiClient } from "@/lib/apiClient";
import { setStaffTokens, clearStaffTokens } from "@/lib/authStorage";

export type POSRole = "manager" | "receptionist" | "cashier" | "kitchen";
export type POSTab =
  | "dashboard"
  | "pos"
  | "orders"
  | "tables"
  | "bookings"
  | "menu"
  | "inventory"
  | "customers"
  | "kitchen"
  | "reports"
  | "settings";

export interface PosSession {
  isOpen: boolean;
  openingCash: number;
  startTime: string;
  cashierName: string;
}

interface CanteenContextType {
  currentRole: POSRole | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  activeTab: POSTab;
  setActiveTab: (tab: POSTab) => void;

  // Core Data
  tables: SeatingTable[];
  setTables: React.Dispatch<React.SetStateAction<SeatingTable[]>>;
  menu: FoodItem[];
  setMenu: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  orders: CanteenOrder[];
  setOrders: React.Dispatch<React.SetStateAction<CanteenOrder[]>>;
  bookings: TableBooking[];
  setBookings: React.Dispatch<React.SetStateAction<TableBooking[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  customers: CanteenCustomer[];
  setCustomers: React.Dispatch<React.SetStateAction<CanteenCustomer[]>>;
  wasteLogs: any[];
  setWasteLogs: React.Dispatch<React.SetStateAction<any[]>>;

  // UI / Global
  refreshKey: number;
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
  showNotifications: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  globalSearch: string;
  setGlobalSearch: React.Dispatch<React.SetStateAction<string>>;
  dateTime: string;

  // Modals / Overlays
  selectedOrder: CanteenOrder | null;
  setSelectedOrder: React.Dispatch<React.SetStateAction<CanteenOrder | null>>;
  receiptOrder: CanteenOrder | null;
  setReceiptOrder: React.Dispatch<React.SetStateAction<CanteenOrder | null>>;
  showAddTableModal: boolean;
  setShowAddTableModal: React.Dispatch<React.SetStateAction<boolean>>;
  showAddMenuModal: boolean;
  setShowAddMenuModal: React.Dispatch<React.SetStateAction<boolean>>;
  showBookingModal: boolean;
  setShowBookingModal: React.Dispatch<React.SetStateAction<boolean>>;
  showWasteModal: boolean;
  setShowWasteModal: React.Dispatch<React.SetStateAction<boolean>>;

  // POS State
  posCategory: string;
  setPosCategory: React.Dispatch<React.SetStateAction<string>>;
  posSearch: string;
  setPosSearch: React.Dispatch<React.SetStateAction<string>>;
  cart: { item: FoodItem; qty: number; notes?: string }[];
  setCart: React.Dispatch<React.SetStateAction<{ item: FoodItem; qty: number; notes?: string }[]>>;
  posSelectedTable: string;
  setPosSelectedTable: React.Dispatch<React.SetStateAction<string>>;
  posCustomerName: string;
  setPosCustomerName: React.Dispatch<React.SetStateAction<string>>;
  posCustomerPhone: string;
  setPosCustomerPhone: React.Dispatch<React.SetStateAction<string>>;
  posDiscount: number;
  setPosDiscount: React.Dispatch<React.SetStateAction<number>>;
  posOrderNote: string;
  setPosOrderNote: React.Dispatch<React.SetStateAction<string>>;
  posPaymentMethod: "CASH" | "UPI" | "CARD" | "PENDING";
  setPosPaymentMethod: React.Dispatch<React.SetStateAction<"CASH" | "UPI" | "CARD" | "PENDING">>;

  // Handlers
  handleRoleChange: (role: POSRole) => void;
  handleAddToCart: (item: FoodItem) => void;
  handleUpdateCartQty: (itemId: string, delta: number) => void;
  handleUpdateItemNote: (itemId: string, note: string) => void;
  handlePosCheckout: (isPaymentProcessed: boolean) => void;
  handleUpdateOrderStatus: (orderId: string, nextStatus: CanteenOrder["status"]) => void;
  handleUpdateTableStatus: (tableId: string, status: SeatingTable["status"]) => void;
  handleCreateBooking: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSeatBooking: (bookingId: string) => void;
  handleCancelBooking: (bookingId: string) => void;
  getTodaySales: () => number;
  getTodayOrdersCount: () => number;
  getActiveTablesCount: () => number;
  getUpcomingBookingsCount: () => number;
  getAverageOrderValue: () => number;
  getInventoryAlertsCount: () => number;
  posSession: PosSession | null;
  openPosSession: (openingCash: number) => void;
  closePosSession: () => void;
  saveState: (key: string, data: any) => void;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

export function CanteenProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Authentication State
  const [currentRole, setCurrentRole] = useState<POSRole | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<POSTab>("dashboard");

  // Core Data States
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<CanteenOrder[]>([]);
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<CanteenCustomer[]>([]);
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);

  // ─── API Query & Offline Hooks ──────────────────────────────────────────────
  const { data: apiMenu } = useOfflineMenu({ enabled: isLoggedIn });
  const { data: apiTables } = useOfflineTables(undefined, { enabled: isLoggedIn });
  const { data: apiOrders } = useOrders(undefined, { enabled: isLoggedIn });
  const { data: apiBookings } = useBookings(undefined, { enabled: isLoggedIn });
  const { data: apiCustomers } = useCustomers(undefined, { enabled: isLoggedIn });

  // Map API Menu Catalog to FoodItem[]
  useEffect(() => {
    if (apiMenu) {
      const mappedMenu: FoodItem[] = apiMenu.map((m) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        category: m.category,
        variety: m.variety,
        available: !!m.available,
        image: m.image_url ?? undefined,
      }));
      setMenu(mappedMenu);
    }
  }, [apiMenu]);

  // Map API Tables Layout to SeatingTable[]
  useEffect(() => {
    if (apiTables) {
      const mappedTables: SeatingTable[] = apiTables.map((t) => {
        let occupiedMins = "";
        if (t.occupied_since) {
          const diffMs = Date.now() - new Date(t.occupied_since).getTime();
          occupiedMins = `${Math.max(0, Math.floor(diffMs / 60000))} mins`;
        }
        return {
          id: t.id,
          name: t.name,
          capacity: t.capacity,
          status: t.status,
          currentBill: t.current_bill,
          occupiedDuration: t.status === "OCCUPIED" ? occupiedMins : undefined,
        };
      });
      setTables(mappedTables);
    }
  }, [apiTables]);

  // Map API Orders Register to CanteenOrder[]
  useEffect(() => {
    if (apiOrders) {
      const mappedOrders: CanteenOrder[] = apiOrders.map((o) => ({
        id: o.id,
        tokenNumber: o.token_number,
        customerName: o.customer_name,
        customerPhone: o.customer_phone ?? "N/A",
        tableName: o.table_name,
        items: o.items
          ? o.items.map((item) => ({
              item: {
                id: item.menu_item_id,
                name: item.item_name,
                price: item.item_price,
                category: "Mains",
                variety: "Regular",
                available: true,
              },
              qty: item.quantity,
              notes: item.cooking_notes ?? undefined,
            }))
          : [],
        subtotal: o.subtotal,
        tax: o.tax_amount,
        serviceCharge: o.service_charge,
        discount: o.discount_amount,
        total: o.total_amount,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status === "PAID" ? "PAID" : "PENDING",
        status: o.order_status,
        timestamp: new Date(o.ordered_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(o.ordered_at).toISOString().split("T")[0],
        notes: o.notes ?? undefined,
      }));
      setOrders(mappedOrders);
    }
  }, [apiOrders]);

  // Map API Bookings Calendar to TableBooking[]
  useEffect(() => {
    if (apiBookings) {
      const mappedBookings: TableBooking[] = apiBookings.map((b) => {
        const matchingTable = tables.find((t) => t.id === b.table_id);
        return {
          id: b.id,
          customerName: b.customer_name,
          customerPhone: b.customer_phone,
          tableId: b.table_id,
          tableName: matchingTable ? matchingTable.name : "Table Assigned",
          time: b.booking_time,
          date: b.booking_date,
          partySize: b.party_size,
          status: b.status === "SEATED" ? "SEATED" : b.status === "CANCELLED" ? "CANCELLED" : "CONFIRMED",
        };
      });
      setBookings(mappedBookings);
    }
  }, [apiBookings, tables]);

  // Map API Customer CRM to CanteenCustomer[]
  useEffect(() => {
    if (apiCustomers?.data) {
      const mappedCustomers: CanteenCustomer[] = apiCustomers.data.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        totalOrders: c.total_orders,
        totalSpent: c.total_spent,
        lastVisit: c.last_visit ? new Date(c.last_visit).toISOString().split("T")[0] : "Never",
      }));
      setCustomers(mappedCustomers);
    }
  }, [apiCustomers]);

  // ─── API & Offline Mutations ────────────────────────────────────────────────
  const { placeOrder: apiPlaceOrder } = useOfflineOrder();
  const { mutate: apiUpdateOrderStatus } = useUpdateOrderStatus();
  const { mutate: apiUpdateTable } = useUpdateTable();
  const { mutate: apiAddBooking } = useAddBooking();
  const { mutate: apiUpdateBooking } = useUpdateBooking();
  const { mutate: apiAddCustomer } = useAddCustomer();

  // UI / Global States
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [dateTime, setDateTime] = useState<string>("");

  // Modal / Selection States
  const [selectedOrder, setSelectedOrder] = useState<CanteenOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<CanteenOrder | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);

  const [posSession, setPosSession] = useState<PosSession | null>(null);

  // POS State
  const [posCategory, setPosCategory] = useState<string>("All");
  const [posSearch, setPosSearch] = useState("");
  const [cart, setCart] = useState<{ item: FoodItem; qty: number; notes?: string }[]>([]);
  const [posSelectedTable, setPosSelectedTable] = useState<string>("");
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posOrderNote, setPosOrderNote] = useState("");
  const [posPaymentMethod, setPosPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "PENDING">("UPI");

  // Load static elements or non-REST states on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const getOrSet = (key: string, initialData: any) => {
        const stored = localStorage.getItem(key);
        if (!stored) {
          localStorage.setItem(key, JSON.stringify(initialData));
          return initialData;
        }
        try {
          return JSON.parse(stored);
        } catch (e) {
          localStorage.setItem(key, JSON.stringify(initialData));
          return initialData;
        }
      };

      setInventory(getOrSet("canteen_inventory", initialInventory));
      setSuppliers(getOrSet("canteen_suppliers", initialSuppliers));
      setWasteLogs(getOrSet("canteen_wastelogs", [
        { id: "w-1", name: "Fresh Milk", qty: 3, unit: "Litre", cost: 150, reason: "Soured/Expired", date: "2026-07-03" },
        { id: "w-2", name: "Premium Paneer", qty: 1.5, unit: "kg", cost: 270, reason: "Spoiled by power outage", date: "2026-07-02" }
      ]));

      // Pre-seed some default alert lists
      setNotifications([
        { id: 1, title: "Low Stock Alert", message: "Premium Paneer is below minimum levels (14kg left)", type: "warning", read: false },
        { id: 2, title: "Upcoming Reservation", message: "Pankaj Shah (6 guests) arriving at 02:30 PM", type: "info", read: false },
        { id: 3, title: "New KDS Order", message: "Token TK-2042 sent to kitchen queue", type: "success", read: true }
      ]);

      // POS session recovery
      const storedSession = localStorage.getItem("canteen_pos_session");
      if (storedSession) {
        try {
          setPosSession(JSON.parse(storedSession));
        } catch (e) {
          localStorage.removeItem("canteen_pos_session");
        }
      }

      // Authentication session recovery
      const logged = localStorage.getItem("canteen_is_logged_in") === "true";
      const role = localStorage.getItem("canteen_role") as POSRole | null;
      if (logged && role) {
        setIsLoggedIn(true);
        setCurrentRole(role);
      }
    }
  }, [refreshKey]);

  // Synchronize clock
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      };
      setDateTime(new Date().toLocaleDateString("en-US", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage helper
  const saveState = (key: string, data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await staffApiClient.post("/canteen/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data && response.data.data) {
        const { accessToken, refreshToken, staff } = response.data.data;

        // Save tokens
        setStaffTokens(accessToken, refreshToken);

        // Update context states
        setIsLoggedIn(true);
        setCurrentRole(staff.assignedRole);

        // Save local storage indicators
        localStorage.setItem("canteen_is_logged_in", "true");
        localStorage.setItem("canteen_role", staff.assignedRole);
        localStorage.setItem("canteen_user_name", staff.name);
        localStorage.setItem("canteen_user_email", staff.email);
        localStorage.setItem("canteen_active_staff", JSON.stringify({
          id: `staff-${staff.id}`,
          name: staff.name,
          email: staff.email,
          assignedRole: staff.assignedRole,
          createdAt: new Date().toISOString().split("T")[0]
        }));

        // Auto-set the initial landing route path based on roles
        let targetPath = "/canteenPOS/dashboard";
        if (staff.assignedRole === "kitchen") {
          targetPath = "/canteenPOS/kitchen";
          setActiveTab("kitchen");
        } else if (staff.assignedRole === "receptionist" || staff.assignedRole === "cashier") {
          targetPath = "/canteenPOS/pos";
          setActiveTab("pos");
        } else {
          setActiveTab("dashboard");
        }
        router.push(targetPath);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[CanteenContext Login Failed]", err);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentRole(null);
    clearStaffTokens();
    router.push("/canteenPOS");
  };

  // Switch tabs (routes) manually
  const handleRoleChange = (role: POSRole) => {
    setCurrentRole(role);
    localStorage.setItem("canteen_role", role);
    let targetPath = "/canteenPOS/dashboard";
    if (role === "kitchen") {
      targetPath = "/canteenPOS/kitchen";
      setActiveTab("kitchen");
    } else if (role === "receptionist" || role === "cashier") {
      targetPath = "/canteenPOS/pos";
      setActiveTab("pos");
    } else {
      setActiveTab("dashboard");
    }
    router.push(targetPath);
  };

  // --- ACTIONS ---
  const handleAddToCart = (item: FoodItem) => {
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      setCart(cart.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { item, qty: 1 }]);
    }
  };

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.item.id === itemId) {
            const nextQty = c.qty + delta;
            return { ...c, qty: nextQty };
          }
          return c;
        })
        .filter((c) => c.qty > 0)
    );
  };

  const handleUpdateItemNote = (itemId: string, note: string) => {
    setCart(cart.map((c) => (c.item.id === itemId ? { ...c, notes: note } : c)));
  };

  const handlePosCheckout = (isPaymentProcessed: boolean) => {
    if (cart.length === 0) {
      alert("Please add items to cart.");
      return;
    }

    const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
    const tax = 0; // 0% GST (Removed automatic addition)
    const serviceCharge = 0; // 0% Service Charge (Removed automatic addition)
    const discount = Number(posDiscount) || 0;
    const total = Math.max(0, subtotal + tax + serviceCharge - discount);

    const tokenNum = "TK-" + Math.floor(2000 + Math.random() * 8000);
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateToday = new Date().toISOString().split("T")[0];

    let allocatedTableName = "Counter Walk-in";
    if (posSelectedTable) {
      const tbl = tables.find((t) => t.id === posSelectedTable);
      if (tbl) allocatedTableName = tbl.name;
    }

    // Map cart items to API order items
    const apiOrderItems = cart.map((c) => ({
      menu_item_id: c.item.id,
      item_name: c.item.name,
      item_price: c.item.price,
      quantity: c.qty,
      line_total: c.item.price * c.qty,
      cooking_notes: c.notes ?? null,
    }));

    // Trigger apiPlaceOrder (handles online API and offline Dexie storage automatically)
    apiPlaceOrder({
      customer_name: posCustomerName.trim() || "Guest Devotee",
      customer_phone: posCustomerPhone.trim() || null,
      table_id: posSelectedTable || null,
      table_name: allocatedTableName,
      items: apiOrderItems,
      subtotal,
      tax_amount: tax,
      service_charge: serviceCharge,
      discount_amount: discount,
      total_amount: total,
      payment_method: isPaymentProcessed ? posPaymentMethod : "PENDING",
      payment_status: isPaymentProcessed ? "PAID" : "PENDING",
      order_status: "NEW",
      notes: posOrderNote || null,
    })
      .then(({ id, local }) => {
        // Build local order object to show on UI immediately
        const newOrder: CanteenOrder = {
          id,
          tokenNumber: tokenNum,
          customerName: posCustomerName.trim() || "Guest Devotee",
          customerPhone: posCustomerPhone.trim() || "N/A",
          tableName: allocatedTableName,
          items: [...cart],
          subtotal,
          tax,
          serviceCharge,
          discount,
          total,
          paymentMethod: isPaymentProcessed ? posPaymentMethod : "PENDING",
          paymentStatus: isPaymentProcessed ? "PAID" : "PENDING",
          status: "NEW",
          timestamp: timeNow,
          date: dateToday,
          notes: posOrderNote,
        };

        // Set invoice receipt popup
        setReceiptOrder(newOrder);

        // Update local orders state for instant UI update
        setOrders((prev) => [newOrder, ...prev]);

        // Optimistically update tables status locally if table assigned
        if (posSelectedTable) {
          setTables((prev) =>
            prev.map((t) =>
              t.id === posSelectedTable
                ? {
                    ...t,
                    status: "OCCUPIED" as const,
                    currentBill: total,
                    occupiedDuration: "0 mins",
                  }
                : t
            )
          );
        }

        // Update customer list locally if new customer is registered
        if (posCustomerPhone) {
          const existCust = customers.find((c) => c.phone === posCustomerPhone);
          if (!existCust) {
            const newCust: CanteenCustomer = {
              id: "cust-" + Date.now(),
              name: posCustomerName || "Guest Devotee",
              phone: posCustomerPhone,
              totalOrders: 1,
              totalSpent: total,
              lastVisit: dateToday,
            };
            setCustomers((prev) => [...prev, newCust]);

            // Sync new devotee profile to the backend CRM
            apiAddCustomer({
              name: posCustomerName || "Guest Devotee",
              phone: posCustomerPhone,
              customer_type: "Regular",
            });
          }
        }
      })
      .catch((err) => {
        console.error("[POS Checkout] Order placing failed:", err);
      });

    // Reset cart states
    setCart([]);
    setPosCustomerName("");
    setPosCustomerPhone("");
    setPosSelectedTable("");
    setPosDiscount(0);
    setPosOrderNote("");
    setPosPaymentMethod("UPI");

    // Add alert notification
    const newNotif = {
      id: Date.now(),
      title: "New Order Placed",
      message: `Token ${tokenNum} generated for ${allocatedTableName}. Total: UGX ${total}`,
      type: "success",
      read: false,
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: CanteenOrder["status"]) => {
    // Optimistic local state update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));

    // Trigger API mutation
    apiUpdateOrderStatus({ id: orderId, status: nextStatus });
  };

  const handleUpdateTableStatus = (tableId: string, status: SeatingTable["status"]) => {
    // Optimistic local state update
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status,
              currentBill: status === "AVAILABLE" || status === "CLEANING" ? 0 : t.currentBill,
              occupiedDuration: status === "OCCUPIED" ? "1 min" : "",
            }
          : t
      )
    );

    // Trigger API mutation
    apiUpdateTable({
      id: tableId,
      updates: { status },
    });
  };

  const openPosSession = (openingCash: number) => {
    let cashierName = "Canteen Cashier";
    if (typeof window !== "undefined") {
      const activeSession = localStorage.getItem("canteen_active_staff");
      if (activeSession) {
        try {
          cashierName = JSON.parse(activeSession).name || "Canteen Cashier";
        } catch (e) {}
      }
    }

    const session: PosSession = {
      isOpen: true,
      openingCash,
      startTime: new Date().toISOString(),
      cashierName,
    };
    setPosSession(session);
    if (typeof window !== "undefined") {
      localStorage.setItem("canteen_pos_session", JSON.stringify(session));
    }
  };

  const closePosSession = () => {
    setPosSession(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("canteen_pos_session");
    }
  };

  const handleCreateBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const custName = data.get("customerName") as string;
    const phone = data.get("customerPhone") as string;
    const tId = data.get("tableId") as string;
    const size = Number(data.get("partySize"));
    const time = data.get("time") as string;
    const date = data.get("date") as string;

    const matchedTable = tables.find((t) => t.id === tId);
    const tableName = matchedTable ? matchedTable.name : "Unassigned";

    // Optimistic local state update
    const newBooking: TableBooking = {
      id: "book-" + Date.now(),
      customerName: custName,
      customerPhone: phone,
      tableId: tId,
      tableName,
      time,
      date,
      partySize: size,
      status: "CONFIRMED",
    };
    setBookings((prev) => [...prev, newBooking]);

    // Trigger API mutation
    apiAddBooking({
      customer_name: custName,
      customer_phone: phone,
      table_id: tId,
      booking_date: date,
      booking_time: time + ":00", // Format time to HH:MM:SS matching schema
      party_size: size,
    });

    setShowBookingModal(false);
  };

  const handleSeatBooking = (bookingId: string) => {
    const b = bookings.find((bk) => bk.id === bookingId);
    if (!b) return;

    // Optimistic local state update
    setBookings((prev) => prev.map((bk) => (bk.id === bookingId ? { ...bk, status: "SEATED" as const } : bk)));

    // Trigger API mutation
    apiUpdateBooking({
      id: bookingId,
      updates: { status: "SEATED" },
    });

    // Pre-populate customer details on POS Tab & redirect to POS
    setPosCustomerName(b.customerName);
    setPosCustomerPhone(b.customerPhone);
    setPosSelectedTable(b.tableId);
    setActiveTab("pos");
    router.push("/canteenPOS/pos");
  };

  const handleCancelBooking = (bookingId: string) => {
    const b = bookings.find((bk) => bk.id === bookingId);
    if (!b) return;

    // Optimistic local state update
    setBookings((prev) => prev.map((bk) => (bk.id === bookingId ? { ...bk, status: "CANCELLED" as const } : bk)));

    // Trigger API mutation
    apiUpdateBooking({
      id: bookingId,
      updates: { status: "CANCELLED" },
    });
  };

  // --- STATS SELECTORS ---
  const getTodaySales = () => {
    return orders
      .filter((o) => o.status === "COMPLETED" || (o.paymentStatus === "PAID" && o.status !== "CANCELLED"))
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  };

  const getTodayOrdersCount = () => {
    return orders.length;
  };

  const getActiveTablesCount = () => {
    return tables.filter((t) => t.status === "OCCUPIED").length;
  };

  const getUpcomingBookingsCount = () => {
    const today = new Date().toISOString().split("T")[0];
    return bookings.filter((b) => b.date === today && b.status === "CONFIRMED").length;
  };

  const getAverageOrderValue = () => {
    const paidOrders = orders.filter(
      (o) => o.status === "COMPLETED" || (o.paymentStatus === "PAID" && o.status !== "CANCELLED")
    );
    if (paidOrders.length === 0) return 0;
    return Math.round(getTodaySales() / paidOrders.length);
  };

  const getInventoryAlertsCount = () => {
    return inventory.filter((i) => i.stock <= i.minStock).length;
  };

  return (
    <CanteenContext.Provider
      value={{
        currentRole,
        isLoggedIn,
        login,
        logout,
        activeTab,
        setActiveTab,

        // Core Data
        tables,
        setTables,
        menu,
        setMenu,
        orders,
        setOrders,
        bookings,
        setBookings,
        inventory,
        setInventory,
        suppliers,
        setSuppliers,
        customers,
        setCustomers,
        wasteLogs,
        setWasteLogs,

        // UI / Global
        refreshKey,
        setRefreshKey,
        showNotifications,
        setShowNotifications,
        notifications,
        setNotifications,
        globalSearch,
        setGlobalSearch,
        dateTime,

        // Modals / Overlays
        selectedOrder,
        setSelectedOrder,
        receiptOrder,
        setReceiptOrder,
        showAddTableModal,
        setShowAddTableModal,
        showAddMenuModal,
        setShowAddMenuModal,
        showBookingModal,
        setShowBookingModal,
        showWasteModal,
        setShowWasteModal,

        // POS State
        posCategory,
        setPosCategory,
        posSearch,
        setPosSearch,
        cart,
        setCart,
        posSelectedTable,
        setPosSelectedTable,
        posCustomerName,
        setPosCustomerName,
        posCustomerPhone,
        setPosCustomerPhone,
        posDiscount,
        setPosDiscount,
        posOrderNote,
        setPosOrderNote,
        posPaymentMethod,
        setPosPaymentMethod,

        // Handlers
        handleRoleChange,
        handleAddToCart,
        handleUpdateCartQty,
        handleUpdateItemNote,
        handlePosCheckout,
        handleUpdateOrderStatus,
        handleUpdateTableStatus,
        handleCreateBooking,
        handleSeatBooking,
        handleCancelBooking,
        getTodaySales,
        getTodayOrdersCount,
        getActiveTablesCount,
        getUpcomingBookingsCount,
        getAverageOrderValue,
        getInventoryAlertsCount,
        posSession,
        openPosSession,
        closePosSession,
        saveState
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
}

export function useCanteen() {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error("useCanteen must be used within a CanteenProvider");
  }
  return context;
}
