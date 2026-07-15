"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Grid,
  Calendar,
  BookOpen,
  Archive,
  Users,
  Tv,
  BarChart3,
  Settings,
  Search,
  Bell,
  Plus,
  Trash2,
  Check,
  CheckCircle,
  X,
  AlertTriangle,
  Clock,
  Printer,
  TrendingUp,
  ArrowRight,
  Percent,
  PlusCircle,
  MinusCircle,
  Sparkles,
  Lock,
  Mail,
  LogOut,
  UserCheck
} from "lucide-react";
import {
  SeatingTable,
  FoodItem,
  CanteenOrder,
  TableBooking,
  InventoryItem,
  Supplier,
  CanteenCustomer,
  CanteenStaffAccount,
  initialTables,
  initialMenu,
  initialOrders,
  initialBookings,
  initialSuppliers,
  initialInventory,
  initialCustomers,
  initialStaffAccounts
} from "@/data/canteen";
import { useCanteen } from "./context/CanteenContext";
import { useCategories } from "@/lib/api/canteen";

type POSTab =
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

export default function CanteenPOSPage() {
  const { login } = useCanteen();
  // Session & Auth states
  const [activeStaff, setActiveStaff] = useState<CanteenStaffAccount | null>(null);
  const { data: apiCategories = [] } = useCategories({ enabled: !!activeStaff });
  const [staffAccounts, setStaffAccounts] = useState<CanteenStaffAccount[]>([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

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

  // UI state keys
  const [refreshKey, setRefreshKey] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");

  // Modal / Selection States
  const [selectedOrder, setSelectedOrder] = useState<CanteenOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<CanteenOrder | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);

  // POS State
  const [posCategory, setPosCategory] = useState<string>("All");
  const [posSearch, setPosSearch] = useState("");

  const menuCategories = Array.from(new Set(menu.map(m => m.category))).filter(Boolean);
  const categoriesList = Array.from(new Set([
    "All",
    ...apiCategories.map(c => c.name),
    ...menuCategories,
    "Mains",
    "Snacks",
    "Beverages",
    "Desserts",
    "Combos",
    "Add-ons"
  ]));
  const [cart, setCart] = useState<{ item: FoodItem; qty: number; notes?: string }[]>([]);
  const [posSelectedTable, setPosSelectedTable] = useState<string>("");
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posOrderNote, setPosOrderNote] = useState("");
  const [posPaymentMethod, setPosPaymentMethod] = useState<"CASH" | "UPI" | "CARD" | "PENDING">("UPI");

  // Time & Date Clock state
  const [dateTime, setDateTime] = useState<string>("");

  // 1. Initial State Loading & Synchronization with localStorage
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

      setTables(getOrSet("canteen_tables", initialTables));
      setMenu(getOrSet("canteen_menu", initialMenu));
      setOrders(getOrSet("canteen_orders", initialOrders));
      setBookings(getOrSet("canteen_bookings", initialBookings));
      setInventory(getOrSet("canteen_inventory", initialInventory));
      setSuppliers(getOrSet("canteen_suppliers", initialSuppliers));
      setCustomers(getOrSet("canteen_customers", initialCustomers));
      setStaffAccounts(getOrSet("canteen_staff_accounts", initialStaffAccounts));
      setWasteLogs(getOrSet("canteen_wastelogs", [
        { id: "w-1", name: "Fresh Milk", qty: 3, unit: "Litre", cost: 150, reason: "Soured/Expired", date: "2026-07-03" },
        { id: "w-2", name: "Premium Paneer", qty: 1.5, unit: "kg", cost: 270, reason: "Spoiled by power outage", date: "2026-07-02" }
      ]));

      // Check for active staff session
      const activeSession = localStorage.getItem("canteen_active_staff");
      if (activeSession) {
        try {
          const parsed = JSON.parse(activeSession);
          setActiveStaff(parsed);
          // Set initial tab based on role
          if (parsed.assignedRole === "kitchen") {
            setActiveTab("kitchen");
          } else if (parsed.assignedRole === "receptionist" || parsed.assignedRole === "cashier") {
            setActiveTab("pos");
          } else {
            setActiveTab("dashboard");
          }
        } catch (e) {
          localStorage.removeItem("canteen_active_staff");
        }
      }

      setNotifications([
        { id: 1, title: "Low Stock Alert", message: "Premium Paneer is below minimum levels (14kg left)", type: "warning", read: false },
        { id: 2, title: "Upcoming Reservation", message: "Pankaj Shah (6 guests) arriving at 02:30 PM", type: "info", read: false },
        { id: 3, title: "New KDS Order", message: "Token TK-2042 sent to kitchen queue", type: "success", read: true }
      ]);
    }

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
  }, [refreshKey]);

  // Helper helper to write to storage
  const saveState = (key: string, data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // --- LOGIN AND LOGOUT FLOWS ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }

    const success = await login(loginEmail, loginPassword);
    if (!success) {
      setLoginError("Invalid email or password. Please try again.");
      return;
    }

    // Sync state locally
    if (typeof window !== "undefined") {
      const activeSession = localStorage.getItem("canteen_active_staff");
      if (activeSession) {
        try {
          setActiveStaff(JSON.parse(activeSession));
        } catch (err) {}
      }
    }

    // Clear form
    setLoginEmail("");
    setLoginPassword("");
  };

  const handleLogout = () => {
    setActiveStaff(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("canteen_active_staff");
    }
    setActiveTab("dashboard");
  };

  // --- POS CART ACTIONS ---
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

    const newOrder: CanteenOrder = {
      id: "ord-" + Date.now(),
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
      notes: posOrderNote
    };

    // Update orders list
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveState("canteen_orders", updatedOrders);

    // Update tables state if table assigned
    if (posSelectedTable) {
      const updatedTables = tables.map((t) =>
        t.id === posSelectedTable
          ? {
              ...t,
              status: "OCCUPIED" as const,
              currentBill: total,
              occupiedDuration: "0 mins"
            }
          : t
      );
      setTables(updatedTables);
      saveState("canteen_tables", updatedTables);
    }

    // Update Customer list (Devotees)
    if (posCustomerPhone) {
      const existCust = customers.find((c) => c.phone === posCustomerPhone);
      let updatedCustomers;
      if (existCust) {
        updatedCustomers = customers.map((c) =>
          c.phone === posCustomerPhone
            ? {
                ...c,
                totalOrders: c.totalOrders + 1,
                totalSpent: c.totalSpent + total,
                lastVisit: dateToday
              }
            : c
        );
      } else {
        const newCust: CanteenCustomer = {
          id: "cust-" + Date.now(),
          name: posCustomerName || "Guest Devotee",
          phone: posCustomerPhone,
          totalOrders: 1,
          totalSpent: total,
          lastVisit: dateToday
        };
        updatedCustomers = [...customers, newCust];
      }
      setCustomers(updatedCustomers);
      saveState("canteen_customers", updatedCustomers);
    }

    // Set invoice receipt popup
    setReceiptOrder(newOrder);

    // Reset states
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
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  // --- KITCHEN ACTION HANDLERS ---
  const handleUpdateOrderStatus = (orderId: string, nextStatus: CanteenOrder["status"]) => {
    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        if (nextStatus === "COMPLETED" || nextStatus === "CANCELLED") {
          const tbl = tables.find((t) => t.name === o.tableName);
          if (tbl) {
            const updatedTables = tables.map((t) =>
              t.id === tbl.id
                ? {
                    ...t,
                    status: nextStatus === "COMPLETED" ? ("CLEANING" as const) : ("AVAILABLE" as const),
                    currentBill: 0,
                    occupiedDuration: ""
                  }
                : t
            );
            setTables(updatedTables);
            saveState("canteen_tables", updatedTables);
          }
        }
        return { ...o, status: nextStatus };
      }
      return o;
    });
    setOrders(updatedOrders);
    saveState("canteen_orders", updatedOrders);
  };

  // --- TABLE STATUS UPDATERS ---
  const handleUpdateTableStatus = (tableId: string, status: SeatingTable["status"]) => {
    const updated = tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status,
            currentBill: status === "AVAILABLE" || status === "CLEANING" ? 0 : t.currentBill,
            occupiedDuration: status === "OCCUPIED" ? "1 min" : ""
          }
        : t
    );
    setTables(updated);
    saveState("canteen_tables", updated);
  };

  // --- BOOKING CREATION ---
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

    const newBooking: TableBooking = {
      id: "book-" + Date.now(),
      customerName: custName,
      customerPhone: phone,
      tableId: tId,
      tableName,
      time,
      date,
      partySize: size,
      status: "CONFIRMED"
    };

    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    saveState("canteen_bookings", updatedBookings);

    // Update table status to RESERVED if booking is today
    const dateToday = new Date().toISOString().split("T")[0];
    if (date === dateToday && tId) {
      const updatedTables = tables.map((t) => (t.id === tId ? { ...t, status: "RESERVED" as const } : t));
      setTables(updatedTables);
      saveState("canteen_tables", updatedTables);
    }

    setShowBookingModal(false);
  };

  const handleSeatBooking = (bookingId: string) => {
    const b = bookings.find((bk) => bk.id === bookingId);
    if (!b) return;

    // Update booking status
    const updatedBookings = bookings.map((bk) => (bk.id === bookingId ? { ...bk, status: "SEATED" as const } : bk));
    setBookings(updatedBookings);
    saveState("canteen_bookings", updatedBookings);

    // Set Table occupied
    const updatedTables = tables.map((t) =>
      t.id === b.tableId ? { ...t, status: "OCCUPIED" as const, occupiedDuration: "0 mins", currentBill: 0 } : t
    );
    setTables(updatedTables);
    saveState("canteen_tables", updatedTables);

    // Pre-populate customer details on POS Tab & redirect to POS
    setPosCustomerName(b.customerName);
    setPosCustomerPhone(b.customerPhone);
    setPosSelectedTable(b.tableId);
    setActiveTab("pos");
  };

  const handleCancelBooking = (bookingId: string) => {
    const b = bookings.find((bk) => bk.id === bookingId);
    if (!b) return;

    const updatedBookings = bookings.map((bk) => (bk.id === bookingId ? { ...bk, status: "CANCELLED" as const } : bk));
    setBookings(updatedBookings);
    saveState("canteen_bookings", updatedBookings);

    if (b.tableId) {
      const tbl = tables.find((t) => t.id === b.tableId);
      if (tbl && tbl.status === "RESERVED") {
        const updatedTables = tables.map((t) => (t.id === b.tableId ? { ...t, status: "AVAILABLE" as const } : t));
        setTables(updatedTables);
        saveState("canteen_tables", updatedTables);
      }
    }
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

  // Filter Menu Items
  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(posSearch.toLowerCase());
    const matchesCategory = posCategory === "All" || item.category === posCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter global orders search
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.tokenNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      o.customerPhone.includes(globalSearch) ||
      o.tableName.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesSearch;
  });

  // Render Screens
  const renderDashboard = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayBookings = bookings.filter((b) => b.date === today);

    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Today's Revenue</span>
              <span className="p-1 bg-green-50 text-green-600 rounded-lg"><TrendingUp className="w-4 h-4" /></span>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mt-2">UGX {getTodaySales().toLocaleString("en-UG")}</h4>
            <p className="text-[10px] text-green-500 mt-1 font-semibold">12% from yesterday</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Orders</span>
              <span className="p-1 bg-blue-50 text-blue-600 rounded-lg"><ClipboardList className="w-4 h-4" /></span>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mt-2">{getTodayOrdersCount().toLocaleString("en-UG")} Tickets</h4>
            <p className="text-[10px] text-gray-500 mt-1">Cashier speed avg: 2.1m</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Active Tables</span>
              <span className="p-1 bg-red-50 text-red-600 rounded-lg"><Grid className="w-4 h-4" /></span>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mt-2">{getActiveTablesCount()} / {tables.length}</h4>
            <p className="text-[10px] text-red-500 mt-1 font-semibold">Peak load: 85%</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Reservations</span>
              <span className="p-1 bg-amber-50 text-amber-600 rounded-lg"><Calendar className="w-4 h-4" /></span>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mt-2">{getUpcomingBookingsCount()} Booked</h4>
            <p className="text-[10px] text-amber-500 mt-1 font-semibold">{bookings.filter(b=>b.status==="CONFIRMED").length} total upcoming</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Average Value</span>
              <span className="p-1 bg-purple-50 text-purple-600 rounded-lg"><ShoppingCart className="w-4 h-4" /></span>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mt-2">UGX {getAverageOrderValue().toLocaleString("en-UG")}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Annadan sponsors active</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-bold tracking-wider text-red-500">Stock Alerts</span>
              <span className="p-1 bg-red-50 text-red-500 rounded-lg"><AlertTriangle className="w-4 h-4" /></span>
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mt-2">{getInventoryAlertsCount()} Low Items</h4>
            <p className="text-[10px] text-red-500 mt-1 font-semibold">Immediate reorder needed</p>
          </div>
        </div>

        {/* Floor Plan */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Live Table Floor Layout</h3>
              <p className="text-[11px] text-gray-400">Real-time table status updates. Click to configure status.</p>
            </div>
            <div className="flex gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Cleaning</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {tables.map((table) => {
              const cardBorder =
                table.status === "AVAILABLE" ? "border-green-100 hover:border-green-300" :
                table.status === "OCCUPIED" ? "border-red-100 hover:border-red-300" :
                table.status === "RESERVED" ? "border-amber-100 hover:border-amber-300" :
                "border-blue-100 hover:border-blue-300";

              return (
                <div key={table.id} className={`bg-white border-2 rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between h-44 ${cardBorder}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">{table.name}</h4>
                      <span className="text-xs text-gray-400 font-medium">{table.capacity} Seats</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      table.status === "AVAILABLE" ? "bg-green-50 text-green-700" :
                      table.status === "OCCUPIED" ? "bg-red-50 text-red-700" :
                      table.status === "RESERVED" ? "bg-amber-50 text-amber-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {table.status}
                    </span>
                  </div>

                  <div className="my-2.5 text-xs font-semibold text-gray-600">
                    {table.status === "OCCUPIED" ? (
                      <div className="space-y-1.5 text-left">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-normal">Active Bill:</span>
                          <span className="text-red-650 font-bold text-sm">UGX {(Number(table.currentBill) || 0).toLocaleString("en-UG")}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-normal">Duration:</span>
                          <span className="flex items-center gap-1.5 text-gray-700"><Clock className="w-3.5 h-3.5 text-gray-400" /> {table.occupiedDuration}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-300 text-xs italic">Table is currently empty</p>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end border-t border-gray-50 pt-2 text-[10px] font-bold">
                    {table.status !== "AVAILABLE" && (
                      <button
                        onClick={() => handleUpdateTableStatus(table.id, "AVAILABLE")}
                        className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded transition-colors"
                      >
                        Free
                      </button>
                    )}
                    {table.status === "AVAILABLE" && (
                      <button
                        onClick={() => handleUpdateTableStatus(table.id, "OCCUPIED")}
                        className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors"
                      >
                        Occupy
                      </button>
                    )}
                    {table.status !== "CLEANING" && (
                      <button
                        onClick={() => handleUpdateTableStatus(table.id, "CLEANING")}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                      >
                        Clean
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 2: Today's Bookings */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Today's Bookings</h3>
                <p className="text-[10px] text-gray-400">Total {todayBookings.length} bookings scheduled today</p>
              </div>
              <button
                onClick={() => setShowBookingModal(true)}
                className="p-1 bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100 rounded-lg text-[10px] font-bold px-2 py-1 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Book Table
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-1">
              {todayBookings.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-gray-300">
                  <Calendar className="w-10 h-10 text-gray-200 mb-2" />
                  <p className="text-[11px]">No bookings scheduled for today.</p>
                </div>
              ) : (
                <table className="w-full text-xs font-sans text-left">
                  <thead>
                    <tr className="border-b border-gray-50 text-gray-400 font-bold uppercase text-[9px] pb-2">
                      <th className="pb-2">Devotee / Contact</th>
                      <th className="pb-2">Details</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {todayBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5">
                          <p className="font-bold text-gray-800">{b.customerName}</p>
                          <span className="text-[10px] text-gray-400">{b.customerPhone}</span>
                        </td>
                        <td className="py-2.5">
                          <p className="font-semibold text-gray-700">{b.tableName}</p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 font-bold text-gray-500">
                            {b.time} • {b.partySize} Pax
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          {b.status === "CONFIRMED" ? (
                            <button
                              onClick={() => handleSeatBooking(b.id)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-bold transition-all shadow-sm"
                            >
                              Seat Customer
                            </button>
                          ) : (
                            <span className="text-[9px] uppercase font-bold text-green-500 px-2 py-0.5 bg-green-50 rounded">
                              Seated
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Section 3: Recent Orders */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent Orders</h3>
                <p className="text-[10px] text-gray-400">Showing last 8 active order tickets</p>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto">
              <table className="w-full text-xs font-sans text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-gray-400 font-bold uppercase text-[9px] pb-2">
                    <th className="pb-2">Token / Cust</th>
                    <th className="pb-2">Table</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Pay Status</th>
                    <th className="pb-2">Order Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.slice(0, 8).map((o) => {
                    const payBadge =
                      o.paymentStatus === "PAID"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200";

                    const orderBadge =
                      o.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                      o.status === "READY_TO_SERVE" ? "bg-green-100 text-green-800" :
                      o.status === "PREPARING" ? "bg-blue-100 text-blue-800" :
                      "bg-amber-100 text-amber-800";

                    return (
                      <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5">
                          <p className="font-bold text-gray-800 font-mono">{o.tokenNumber}</p>
                          <span className="text-[9px] text-gray-400">{o.customerName}</span>
                        </td>
                        <td className="py-2.5 font-semibold text-gray-700">{o.tableName}</td>
                        <td className="py-2.5 font-bold text-gray-800">UGX {o.total}</td>
                        <td className="py-2.5">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${payBadge}`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${orderBadge}`}>
                            {o.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="text-gray-400 hover:text-blue-600 font-bold hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPOS = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[calc(100vh-170px)]">
        {/* Left Panel: Category tabs & Food item grid */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[650px]">
          <div className="space-y-4 mb-4 flex-shrink-0">
            <div className="flex gap-2 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                placeholder="Search food items (e.g. Masala Dosa)..."
                className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors shadow-inner"
              />
              {posSearch && (
                <button onClick={() => setPosSearch("")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1.5 select-none scrollbar-thin">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPosCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                    posCategory === cat
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto pr-1">
            {filteredMenu.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-gray-300">
                <BookOpen className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-[11px]">No food items found matching criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredMenu.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleAddToCart(item)}
                    className="group border border-gray-100 rounded-2xl p-3 flex flex-col justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all bg-white relative overflow-hidden select-none"
                  >
                    <span className={`absolute top-2 left-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase z-10 shadow-sm ${
                      item.variety === "Jain" ? "bg-green-50 text-green-700 border border-green-200" :
                      item.variety === "Spicy" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                      item.variety === "Sweet" ? "bg-pink-50 text-pink-700 border border-pink-200" :
                      "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}>
                      {item.variety}
                    </span>

                    <div className="w-full h-24 rounded-xl bg-gray-50 mb-2 flex items-center justify-center text-2xl overflow-hidden relative">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <span>🍛</span>
                      )}
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-bold uppercase">
                          Out of stock
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-800 text-xs truncate group-hover:text-blue-600 transition-colors">{item.name}</h4>
                    
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-50 flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">UGX {item.price}</span>
                      <button className="p-1 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg text-blue-600 transition-all">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[650px]">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
            Running Order Allocations
          </h3>

          <div className="space-y-4 flex-grow overflow-y-auto pr-1">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase text-gray-400">Allocate Seating Table</label>
              <select
                value={posSelectedTable}
                onChange={(e) => setPosSelectedTable(e.target.value)}
                className="w-full p-2 border border-gray-100 rounded-xl text-xs outline-none bg-gray-50 text-gray-600 font-semibold focus:bg-white"
              >
                <option value="">Counter Walk-in (No Table)</option>
                <optgroup label="Available Tables">
                  {tables
                    .filter((t) => t.status === "AVAILABLE" || t.status === "CLEANING")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.capacity} Seats) - {t.status}
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Occupied/Reserved Tables">
                  {tables
                    .filter((t) => t.status === "OCCUPIED" || t.status === "RESERVED")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.capacity} Seats) - {t.status}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 block">Customer Name</label>
                <input
                  type="text"
                  placeholder="Devotee name"
                  value={posCustomerName}
                  onChange={(e) => setPosCustomerName(e.target.value)}
                  className="w-full p-2 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 block">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+256..."
                  value={posCustomerPhone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPosCustomerPhone(val);
                    const match = customers.find((c) => c.phone === val || c.phone.includes(val) && val.length > 5);
                    if (match) {
                      setPosCustomerName(match.name);
                    }
                  }}
                  className="w-full p-2 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-gray-50 pt-4 space-y-3 text-left">
              <label className="text-[10px] font-bold uppercase text-gray-400 block">Order Items</label>

              {cart.length === 0 ? (
                <div className="py-16 text-center text-gray-300 text-xs">
                  <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p>Cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {cart.map((c) => (
                    <div key={c.item.id} className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="text-left">
                          <h4 className="font-bold text-gray-800">{c.item.name}</h4>
                          <span className="text-[9px] text-gray-400">UGX {c.item.price} each</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateCartQty(c.item.id, -1)}
                            className="text-gray-400 hover:text-red-500 p-0.5 rounded cursor-pointer"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-gray-800 w-4 text-center">{c.qty}</span>
                          <button
                            onClick={() => handleUpdateCartQty(c.item.id, 1)}
                            className="text-gray-400 hover:text-blue-500 p-0.5 rounded cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Add cooking notes..."
                        value={c.notes || ""}
                        onChange={(e) => handleUpdateItemNote(c.item.id, e.target.value)}
                        className="w-full text-[9px] p-1 bg-white border border-gray-100 rounded outline-none text-gray-500 focus:border-blue-400"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-[650px]">
          <div>
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
              Cart Summary & Payments
            </h3>

            {(() => {
              const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
              const tax = 0;
              const serviceCharge = 0;
              const discount = Number(posDiscount) || 0;
              const total = Math.max(0, subtotal + tax + serviceCharge - discount);

              return (
                <div className="space-y-4">
                  <div className="space-y-3 font-sans text-xs text-left">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase text-gray-400">Order Notes</span>
                      <textarea
                        rows={2}
                        placeholder="Type comments..."
                        value={posOrderNote}
                        onChange={(e) => setPosOrderNote(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-400 resize-none text-gray-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase text-gray-400">Discount (UGX )</span>
                      <div className="flex gap-1 relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Percent className="w-3.5 h-3.5" /></span>
                        <input
                          type="number"
                          placeholder="0"
                          value={posDiscount || ""}
                          onChange={(e) => setPosDiscount(Math.max(0, Number(e.target.value)))}
                          className="w-full pl-9 p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs font-sans text-gray-500 text-left">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-gray-800">UGX {subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%):</span>
                      <span className="font-semibold text-gray-800">UGX {tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Charge (2.5%):</span>
                      <span className="font-semibold text-gray-800">UGX {serviceCharge}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-red-500 font-semibold">
                        <span>Discount:</span>
                        <span>- UGX {discount}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200/50 my-2 pt-2 flex justify-between font-bold text-sm text-gray-800">
                      <span>Net Total:</span>
                      <span className="text-blue-600 font-bold">UGX {total}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-bold uppercase text-gray-400 block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
                {["UPI", "CASH", "CARD"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPosPaymentMethod(method as any)}
                    className={`py-2 rounded-xl border text-center transition-all cursor-pointer ${
                      posPaymentMethod === method
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-100 hover:bg-gray-50 text-gray-500 bg-white"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {activeStaff?.assignedRole === "receptionist" && (
                <button
                  onClick={() => handlePosCheckout(false)}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" /> Generate Token (Pay Cashier)
                </button>
              )}

              {activeStaff?.assignedRole === "cashier" && (
                <button
                  onClick={() => handlePosCheckout(true)}
                  className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" /> Collect & Save Bill
                </button>
              )}

              {activeStaff?.assignedRole === "manager" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePosCheckout(false)}
                    className="py-2.5 rounded-xl border border-amber-500 hover:bg-amber-50 text-amber-600 font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Hold Token
                  </button>
                  <button
                    onClick={() => handlePosCheckout(true)}
                    className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-md cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Pay Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 min-h-[500px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Order Ledger</h3>
            <p className="text-[11px] text-gray-400">Database of all token receipts issued today</p>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Search className="w-3.5 h-3.5" /></span>
            <input
              type="text"
              placeholder="Search orders..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-60 pl-8 pr-4 py-1.5 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="flex-grow overflow-x-auto">
          <table className="w-full text-xs text-left font-sans">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[9px] pb-3">
                <th className="pb-3">Token No</th>
                <th className="pb-3">Date & Time</th>
                <th className="pb-3">Devotee Name</th>
                <th className="pb-3">Table No</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 italic font-semibold">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-bold text-gray-800 font-mono">{o.tokenNumber}</td>
                    <td className="py-3 text-gray-400 text-[10px]">{o.date} • {o.timestamp}</td>
                    <td className="py-3">
                      <p className="font-semibold text-gray-700">{o.customerName}</p>
                      <span className="text-[10px] text-gray-400">{o.customerPhone}</span>
                    </td>
                    <td className="py-3 text-gray-600 font-semibold">{o.tableName}</td>
                    <td className="py-3 font-bold text-gray-800">UGX {o.total}</td>
                    <td className="py-3">
                      <span className={`text-[8px] font-bold px-2 py-0.5 border rounded uppercase ${
                        o.paymentStatus === "PAID" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${
                        o.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                        o.status === "READY_TO_SERVE" ? "bg-green-50 text-green-700 animate-pulse" :
                        o.status === "PREPARING" ? "bg-blue-50 text-blue-700" :
                        o.status === "CANCELLED" ? "bg-red-50 text-red-650" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer"
                      >
                        Invoice
                      </button>
                      <button
                        onClick={() => setReceiptOrder(o)}
                        className="px-2 py-1 text-[10px] text-gray-650 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTables = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Tables Layout Coordinator</h3>
              <p className="text-[11px] text-gray-400">Total capacity: {tables.reduce((sum,t)=>sum+t.capacity,0)} devotees</p>
            </div>
            <button
              onClick={() => setShowAddTableModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Table
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {tables.map((t) => (
              <div key={t.id} className="border border-gray-100 p-4 rounded-2xl bg-white shadow-sm flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs">{t.name}</h4>
                    <p className="text-[10px] text-gray-400">{t.capacity} Seating Capacity</p>
                  </div>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    t.status === "AVAILABLE" ? "bg-green-50 text-green-700" :
                    t.status === "OCCUPIED" ? "bg-red-50 text-red-700" :
                    t.status === "RESERVED" ? "bg-amber-50 text-amber-700" :
                    "bg-blue-50 text-blue-700"
                  }`}>
                    {t.status}
                  </span>
                </div>

                <div className="text-xs text-gray-650 font-semibold my-2 text-left">
                  {t.status === "OCCUPIED" ? (
                    <div>
                      <p className="text-[10px] text-gray-400 font-normal">Current Bill: <b className="text-red-500 font-bold">UGX {t.currentBill}</b></p>
                      <p className="text-[10px] text-gray-400 font-normal">Active Since: <b className="text-gray-800 font-bold">{t.occupiedDuration}</b></p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-300 italic">No bill details</p>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-gray-50 pt-2 text-[9px] font-bold">
                  <div className="flex gap-1.5">
                    <button onClick={() => handleUpdateTableStatus(t.id, "AVAILABLE")} className="text-green-600 hover:underline cursor-pointer">Free</button>
                    <button onClick={() => handleUpdateTableStatus(t.id, "OCCUPIED")} className="text-red-650 hover:underline cursor-pointer">Occupy</button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remove ${t.name}?`)) {
                        const updated = tables.filter((item) => item.id !== t.id);
                        setTables(updated);
                        saveState("canteen_tables", updated);
                      }
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            Operations & Analytics
          </h3>

          <div className="space-y-3.5 text-left">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Merge Seating Tables</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans text-gray-650">
              <select className="p-2 border border-gray-100 rounded-xl bg-gray-50 outline-none" id="merge-tbl-1">
                <option value="">Table A</option>
                {tables.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select className="p-2 border border-gray-100 rounded-xl bg-gray-50 outline-none" id="merge-tbl-2">
                <option value="">Table B</option>
                {tables.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <button
              onClick={() => {
                const el1 = document.getElementById("merge-tbl-1") as HTMLSelectElement;
                const el2 = document.getElementById("merge-tbl-2") as HTMLSelectElement;
                if (!el1.value || !el2.value || el1.value === el2.value) {
                  alert("Please select two different tables to merge.");
                  return;
                }
                alert("Tables merged successfully!");
              }}
              className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Combine Tables
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 text-left">
            <span className="text-[10px] font-bold uppercase text-gray-400 block">Table Analytics</span>
            <div className="space-y-3 text-xs font-sans text-gray-500">
              <div className="flex justify-between">
                <span>Peak Occupancy Time:</span>
                <span className="font-bold text-gray-800">12:30 PM - 02:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Occupied Time:</span>
                <span className="font-bold text-gray-800">38 mins</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold pt-2">
                <span>CURRENT FLOOR UTILIZATION</span>
                <span className="text-blue-600">37.5%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "37.5%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[500px]">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Reservations Coordinator</h3>
                <p className="text-[11px] text-gray-400">Scheduled calendar bookings log</p>
              </div>
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Reservation
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px] pb-2.5">
                    <th className="pb-2.5">Customer details</th>
                    <th className="pb-2.5">Table No</th>
                    <th className="pb-2.5">Date & Time</th>
                    <th className="pb-2.5">Party Size</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-semibold">
                        <p className="text-gray-800 font-bold">{b.customerName}</p>
                        <span className="text-[10px] text-gray-400">{b.customerPhone}</span>
                      </td>
                      <td className="py-3 font-bold text-gray-600">{b.tableName}</td>
                      <td className="py-3 text-gray-500 font-semibold">{b.date} • {b.time}</td>
                      <td className="py-3 font-bold text-gray-700">{b.partySize} guests</td>
                      <td className="py-3">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          b.status === "SEATED" ? "bg-green-50 text-green-700" :
                          b.status === "CANCELLED" ? "bg-red-50 text-red-750" :
                          "bg-amber-50 text-amber-700"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {b.status === "CONFIRMED" && (
                          <>
                            <button
                              onClick={() => handleSeatBooking(b.id)}
                              className="px-2 py-1 text-[9px] font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors cursor-pointer"
                            >
                              Seat
                            </button>
                            <button
                              onClick={() => handleCancelBooking(b.id)}
                              className="px-2 py-1 text-[9px] font-bold text-red-650 bg-red-50 hover:bg-red-100 rounded transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="border-t border-gray-50 pt-4 mt-6 text-[10px] text-gray-400 italic text-left">
            * Note: Reservations hold tables automatically 30 minutes prior to booking slot.
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            Schedule Overview
          </h3>
          <div className="space-y-3.5 text-left">
            {["11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map((tSlot) => {
              const matched = bookings.filter((b) => b.time.includes(tSlot.split(":")[0]) && b.status === "CONFIRMED");
              return (
                <div key={tSlot} className="flex justify-between items-center text-xs font-sans p-2.5 border border-gray-50 rounded-xl bg-gray-50/50">
                  <span className="font-bold text-gray-600">{tSlot}</span>
                  {matched.length > 0 ? (
                    <div className="text-right">
                      <span className="font-bold text-amber-600 block text-[10px]">{matched[0].customerName}</span>
                      <span className="text-[9px] text-gray-400">{matched[0].tableName} • {matched[0].partySize} guests</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-300 italic">No bookings</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMenu = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Food Menu Catalog</h3>
              <p className="text-[11px] text-gray-400">Add, edit, or adjust pricing of canteen items</p>
            </div>
            <button
              onClick={() => setShowAddMenuModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Food Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px] pb-2.5">
                  <th className="pb-2.5">Item Name</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Variety</th>
                  <th className="pb-2.5">Price</th>
                  <th className="pb-2.5 text-center">Availability</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {menu.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 font-bold text-gray-800">{m.name}</td>
                    <td className="py-2.5 text-gray-500 font-semibold">{m.category}</td>
                    <td className="py-2.5">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        m.variety === "Jain" ? "bg-green-50 text-green-700 border border-green-200" :
                        m.variety === "Spicy" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                        m.variety === "Sweet" ? "bg-pink-50 text-pink-700 border border-pink-200" :
                        "bg-gray-50 text-gray-700 border border-gray-200"
                      }`}>
                        {m.variety}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-blue-600">UGX {m.price}</td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => {
                          const updated = menu.map(item => item.id === m.id ? { ...item, available: !item.available } : item);
                          setMenu(updated);
                          saveState("canteen_menu", updated);
                        }}
                        className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-colors border cursor-pointer ${
                          m.available 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {m.available ? "In Stock" : "Out of Stock"}
                      </button>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${m.name}?`)) {
                            const updated = menu.filter(item => item.id !== m.id);
                            setMenu(updated);
                            saveState("canteen_menu", updated);
                          }
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2 flex justify-between items-center">
              <span>Combo Offers</span>
            </h3>
            <div className="space-y-3 text-left">
              {menu.filter(m=>m.category === "Combos").map(c => (
                <div key={c.id} className="flex justify-between items-center text-xs font-sans p-2.5 border border-gray-50 rounded-xl bg-gray-50/50">
                  <div>
                    <h5 className="font-bold text-gray-700">{c.name}</h5>
                    <span className="text-[9px] text-gray-400">Combo bundle</span>
                  </div>
                  <span className="font-bold text-blue-600">UGX {c.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
              Add-on Toppings
            </h3>
            <div className="space-y-3 text-left">
              {menu.filter(m=>m.category === "Add-ons").map(a => (
                <div key={a.id} className="flex justify-between items-center text-xs font-sans p-2.5 border border-gray-50 rounded-xl bg-gray-50/50">
                  <div>
                    <h5 className="font-bold text-gray-700">{a.name}</h5>
                  </div>
                  <span className="font-bold text-blue-600">+ UGX {a.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-gray-50 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Stock Ledger</h3>
              <p className="text-[11px] text-gray-400">Raw materials inventory management</p>
            </div>
            <button
              onClick={() => setShowWasteModal(true)}
              className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Log Waste Loss
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px] pb-2.5">
                  <th className="pb-2.5">Raw Item Name</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Stock Level</th>
                  <th className="pb-2.5">Safety Level</th>
                  <th className="pb-2.5">Supplier</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inventory.map((invItem) => {
                  const isLow = invItem.stock <= invItem.minStock;
                  const supName = suppliers.find(s=>s.id===invItem.supplierId)?.name || "Local purchase";

                  return (
                    <tr key={invItem.id} className={`hover:bg-gray-50/50 transition-colors ${isLow ? "bg-red-50/20" : ""}`}>
                      <td className="py-2.5 text-left">
                        <p className="font-bold text-gray-800">{invItem.name}</p>
                        {isLow && <span className="text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">Low stock warning</span>}
                      </td>
                      <td className="py-2.5 text-gray-500 font-semibold">{invItem.category}</td>
                      <td className={`py-2.5 font-bold ${isLow ? "text-red-500" : "text-gray-800"}`}>
                        {invItem.stock} {invItem.unit}
                      </td>
                      <td className="py-2.5 text-gray-400 font-semibold">{invItem.minStock} {invItem.unit}</td>
                      <td className="py-2.5 text-gray-650">{supName}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => {
                            const newStock = prompt(`Update stock:`, String(invItem.stock));
                            if (newStock !== null) {
                              const updated = inventory.map(item => item.id === invItem.id ? { ...item, stock: Number(newStock) || 0 } : item);
                              setInventory(updated);
                              saveState("canteen_inventory", updated);
                            }
                          }}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-[9px] font-bold text-gray-700 transition-colors border border-gray-100 cursor-pointer"
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
              Food Distributors
            </h3>
            <div className="space-y-3 text-xs font-sans">
              {suppliers.map(sup => (
                <div key={sup.id} className="p-3 border border-gray-50 rounded-2xl bg-gray-50/50 space-y-1 text-left">
                  <h5 className="font-bold text-gray-700">{sup.name}</h5>
                  <p className="text-[10px] text-gray-400">Phone: {sup.phone}</p>
                  <div className="flex gap-1.5 flex-wrap pt-1.5">
                    {sup.itemsSupplied.map((tag, idx) => (
                      <span key={idx} className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomers = () => {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 min-h-[500px]">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Devotee Customer User Directory</h3>
          <p className="text-[11px] text-gray-400">History and statistics of customer users booking food or tables</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px] pb-2.5">
                <th className="pb-2.5">User/Devotee Name</th>
                <th className="pb-2.5">Contact Number</th>
                <th className="pb-2.5">Visits / Orders</th>
                <th className="pb-2.5">Total Contributions</th>
                <th className="pb-2.5">Last Check-in</th>
                <th className="pb-2.5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 font-bold text-gray-800">{c.name}</td>
                  <td className="py-3 text-gray-500 font-semibold font-mono">{c.phone}</td>
                  <td className="py-3 font-bold text-gray-800">{c.totalOrders} visits</td>
                  <td className="py-3 font-bold text-blue-600">UGX {c.totalSpent.toLocaleString("en-IN")}</td>
                  <td className="py-3 text-gray-400 font-semibold">{c.lastVisit}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setPosCustomerName(c.name);
                        setPosCustomerPhone(c.phone);
                        setActiveTab("pos");
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                    >
                      New Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderKDS = () => {
    const newOrders = orders.filter((o) => o.status === "NEW");
    const prepOrders = orders.filter((o) => o.status === "PREPARING");
    const readyOrders = orders.filter((o) => o.status === "READY_TO_SERVE");
    const doneOrders = orders.filter((o) => o.status === "COMPLETED");

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 min-h-[calc(100vh-170px)] items-stretch">
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col h-[650px] border-t-4 border-t-amber-500">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
            <span className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> New Tickets
            </span>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
              {newOrders.length}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3.5 pr-1">
            {newOrders.length === 0 ? (
              <p className="text-gray-300 italic text-[10px] py-16 text-center">Empty queue</p>
            ) : (
              newOrders.map((o) => (
                <div key={o.id} className="bg-[#FAF7F2]/55 p-3 rounded-2xl border border-amber-200/50 shadow-sm text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-700 text-xs font-mono">{o.tokenNumber}</span>
                    <span className="text-[9px] text-gray-400">{o.timestamp}</span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-800">
                    <p className="font-semibold text-gray-400 uppercase text-[8px]">Table Assignment</p>
                    <p className="text-gray-700">{o.tableName}</p>
                  </div>
                  <ul className="text-xs font-sans text-gray-800 border-t border-dashed border-amber-200 pt-2 space-y-1 font-bold">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{i.item.name} {i.item.variety === "Jain" ? "• Jain" : ""}</span>
                        <span className="text-blue-600 font-bold">x {i.qty}</span>
                      </li>
                    ))}
                  </ul>
                  {o.notes && <p className="text-[8px] bg-amber-100 text-amber-800 p-1 rounded font-semibold italic">Notes: {o.notes}</p>}
                  <button
                    onClick={() => handleUpdateOrderStatus(o.id, "PREPARING")}
                    className="w-full mt-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold text-center transition-colors shadow-sm cursor-pointer"
                  >
                    Start Preparing
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col h-[650px] border-t-4 border-t-blue-500">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
            <span className="text-[10px] font-bold uppercase text-blue-600 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500 animate-spin" /> Preparing
            </span>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              {prepOrders.length}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3.5 pr-1">
            {prepOrders.length === 0 ? (
              <p className="text-gray-300 italic text-[10px] py-16 text-center">Empty queue</p>
            ) : (
              prepOrders.map((o) => (
                <div key={o.id} className="bg-white p-3 rounded-2xl border border-blue-200/50 shadow-sm text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-700 text-xs font-mono">{o.tokenNumber}</span>
                    <span className="text-[9px] text-gray-400">{o.timestamp}</span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-800">
                    <p className="font-semibold text-gray-400 uppercase text-[8px]">Table Assignment</p>
                    <p className="text-gray-700">{o.tableName}</p>
                  </div>
                  <ul className="text-xs font-sans text-gray-800 border-t border-dashed border-blue-200 pt-2 space-y-1 font-bold">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{i.item.name} {i.item.variety === "Jain" ? "• Jain" : ""}</span>
                        <span className="text-blue-600 font-bold">x {i.qty}</span>
                      </li>
                    ))}
                  </ul>
                  {o.notes && <p className="text-[8px] bg-blue-50 text-blue-800 p-1 rounded font-semibold italic">Notes: {o.notes}</p>}
                  <button
                    onClick={() => handleUpdateOrderStatus(o.id, "READY_TO_SERVE")}
                    className="w-full mt-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold text-center transition-colors shadow-sm cursor-pointer"
                  >
                    Mark Ready to Serve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col h-[650px] border-t-4 border-t-green-500">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
            <span className="text-[10px] font-bold uppercase text-green-600 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Ready to Serve
            </span>
            <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3.5 pr-1">
            {readyOrders.length === 0 ? (
              <p className="text-gray-300 italic text-[10px] py-16 text-center">Empty queue</p>
            ) : (
              readyOrders.map((o) => (
                <div key={o.id} className="bg-green-50/20 p-3 rounded-2xl border border-green-200/50 shadow-sm text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-700 text-xs font-mono">{o.tokenNumber}</span>
                    <span className="text-[9px] text-gray-400">{o.timestamp}</span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-800">
                    <p className="font-semibold text-gray-400 uppercase text-[8px]">Table Assignment</p>
                    <p className="text-gray-700">{o.tableName}</p>
                  </div>
                  <ul className="text-xs font-sans text-gray-800 border-t border-dashed border-green-200 pt-2 space-y-1 font-bold">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{i.item.name}</span>
                        <span className="text-blue-600 font-bold">x {i.qty}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpdateOrderStatus(o.id, "COMPLETED")}
                    className="w-full mt-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold text-center transition-colors shadow-sm cursor-pointer"
                  >
                    Mark Served & Clear
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm flex flex-col h-[650px]">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2 mb-3">
            <span className="text-[10px] font-bold uppercase text-gray-500">Completed Today</span>
            <span className="text-[10px] font-bold bg-gray-50 text-gray-700 px-2 py-0.5 rounded">
              {doneOrders.length}
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3 pr-1">
            {doneOrders.length === 0 ? (
              <p className="text-gray-300 italic text-[10px] py-16 text-center">Empty ledger</p>
            ) : (
              doneOrders.map((o) => (
                <div key={o.id} className="bg-gray-50 p-2.5 border border-gray-100 rounded-xl opacity-70 text-left text-xs font-sans space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="font-mono text-gray-700">{o.tokenNumber}</span>
                    <span className="text-[9px] text-gray-400">{o.timestamp}</span>
                  </div>
                  <p className="text-gray-500 font-semibold">Table: {o.tableName}</p>
                  <p className="text-[10px] text-green-600 font-bold">Served and closed</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-left">Weekly Revenue Analytics</h4>
              <p className="text-[11px] text-gray-400 text-left">Total generated revenue over the last 7 days</p>
            </div>
            <div className="h-56 relative w-full pt-4">
              <svg viewBox="0 0 500 200" className="w-full h-full">
                <line x1="40" y1="10" x2="480" y2="10" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="60" x2="480" y2="60" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="110" x2="480" y2="110" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="160" x2="480" y2="160" stroke="#E5E7EB" strokeWidth="1.5" />
                <text x="5" y="15" fill="#9ca3af" fontSize="9" fontWeight="bold">UGX 25,000</text>
                <text x="5" y="65" fill="#9ca3af" fontSize="9" fontWeight="bold">UGX 15,000</text>
                <text x="5" y="115" fill="#9ca3af" fontSize="9" fontWeight="bold">UGX 5,000</text>
                <text x="15" y="165" fill="#9ca3af" fontSize="9" fontWeight="bold">UGX 0</text>
                <path d="M 50,150 L 120,135 L 190,110 L 260,95 L 330,70 L 400,60 L 470,30" fill="none" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="50" cy="150" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="120" cy="135" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="190" cy="110" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="260" cy="95" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="330" cy="70" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="400" cy="60" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="470" cy="30" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <text x="40" y="185" fill="#6b7280" fontSize="9" fontWeight="bold">Mon</text>
                <text x="110" y="185" fill="#6b7280" fontSize="9" fontWeight="bold">Tue</text>
                <text x="180" y="185" fill="#6b7280" fontSize="9" fontWeight="bold">Wed</text>
                <text x="250" y="185" fill="#6b7280" fontSize="9" fontWeight="bold">Thu</text>
                <text x="320" y="185" fill="#6b7280" fontSize="9" fontWeight="bold">Fri</text>
                <text x="390" y="185" fill="#6b7280" fontSize="9" fontWeight="bold">Sat</text>
                <text x="460" y="185" fill="#6b7280" fontSize="9" fontWeight="bold">Sun</text>
              </svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider text-left">Category Sales Breakdown</h4>
              <p className="text-[11px] text-gray-400 text-left">Total item distributions sold by catalog category</p>
            </div>
            <div className="h-56 relative w-full pt-4">
              <svg viewBox="0 0 500 200" className="w-full h-full">
                <line x1="40" y1="10" x2="480" y2="10" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="85" x2="480" y2="85" stroke="#f3f4f6" strokeWidth="1" />
                <line x1="40" y1="160" x2="480" y2="160" stroke="#E5E7EB" strokeWidth="1.5" />
                <rect x="70" y="40" width="35" height="120" fill="#10B981" rx="4" />
                <text x="75" y="32" fill="#10B981" fontSize="9" fontWeight="bold">UGX 28.4k</text>
                <text x="72" y="180" fill="#6b7280" fontSize="9" fontWeight="bold">Mains</text>
                <rect x="160" y="70" width="35" height="90" fill="#3B82F6" rx="4" />
                <text x="165" y="62" fill="#3B82F6" fontSize="9" fontWeight="bold">UGX 19.2k</text>
                <text x="162" y="180" fill="#6b7280" fontSize="9" fontWeight="bold">Snacks</text>
                <rect x="250" y="90" width="35" height="70" fill="#F59E0B" rx="4" />
                <text x="255" y="82" fill="#F59E0B" fontSize="9" fontWeight="bold">UGX 11.8k</text>
                <text x="245" y="180" fill="#6b7280" fontSize="9" fontWeight="bold">Beverages</text>
                <rect x="340" y="115" width="35" height="45" fill="#8B5E34" rx="4" />
                <text x="348" y="107" fill="#8B5E34" fontSize="9" fontWeight="bold">UGX 6.4k</text>
                <text x="336" y="180" fill="#6b7280" fontSize="9" fontWeight="bold">Desserts</text>
                <rect x="420" y="100" width="35" height="60" fill="#8B5E34" rx="4" />
                <text x="428" y="92" fill="#8B5E34" fontSize="9" fontWeight="bold">UGX 9.8k</text>
                <text x="418" y="180" fill="#6b7280" fontSize="9" fontWeight="bold">Combos</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 max-w-4xl text-left">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Settings</h3>
          <p className="text-[11px] text-gray-400">Configure parameters, tax rules, and receipt printer interfaces</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); alert("Saved!"); }} className="space-y-6 font-sans text-xs">
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-blue-600 border-b border-gray-50 pb-1">Business Credentials</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block">Business Name *</label>
                <input type="text" required defaultValue="SKSS Kampala Canteen" className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700" />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block">Store Address Coordinates *</label>
                <input type="text" required defaultValue="Shree Swaminarayan Complex, Bukoto, Kampala" className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-blue-600 border-b border-gray-50 pb-1">GST & Tax Configurations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block">VAT / GST Rate (%)</label>
                <input type="number" defaultValue="5" className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700" />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block">Service Charge Rate (%)</label>
                <input type="number" defaultValue="2.5" className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700" />
              </div>
              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block">Currency Symbol</label>
                <input type="text" defaultValue="UGX " className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 flex justify-end">
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer">
              Save Configuration Settings
            </button>
          </div>
        </form>
      </div>
    );
  };

  // --- RENDER LOGIN VIEW ---
  if (!activeStaff) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] font-sans flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 text-center relative overflow-hidden">
          
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-500"></div>

          <div className="mb-6">
            <span className="text-4xl">🕉️</span>
            <h2 className="text-lg font-bold text-gray-800 mt-3 font-sans">Swami Canteen POS</h2>
            <p className="text-xs text-gray-400">Secure Terminal Sign In</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="staff@swami.com"
                className="w-full p-3 border border-gray-150 rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-blue-500 transition-all text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-gray-150 rounded-2xl outline-none bg-gray-50 focus:bg-white focus:border-blue-500 transition-all text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-100 transition-all mt-6 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Login to POS Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Shortcuts for Testing Roles */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-left">
            <h4 className="text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-3">Quick Demo Logins (Click to Auto-fill)</h4>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              {[
                { email: "manager@swami.com", pass: "manager123", label: "Canteen Manager" },
                { email: "receptionist@swami.com", pass: "receptionist123", label: "Receptionist" },
                { email: "cashier@swami.com", pass: "cashier123", label: "Cashier" },
                { email: "kitchen@swami.com", pass: "kitchen123", label: "Kitchen Display" }
              ].map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLoginEmail(demo.email);
                    setLoginPassword(demo.pass);
                    setLoginError("");
                  }}
                  className="p-2 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all text-left truncate cursor-pointer font-sans"
                >
                  <span className="font-bold text-gray-700 block">{demo.label}</span>
                  <span className="text-gray-400 block text-[8px]">{demo.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN LAYOUT FOR AUTHENTICATED STAFF ---
  const userRole = activeStaff.assignedRole;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex text-gray-800">
      
      {/* 1. SIDEBAR NAVIGATION - Hide if kitchen staff */}
      {userRole !== "kitchen" && (
        <aside className="w-64 bg-white border-r border-gray-100 shrink-0 flex flex-col justify-between hidden lg:flex">
          <div>
            <div className="h-16 px-6 border-b border-gray-50 flex items-center gap-2">
              <span className="text-2xl">🕉️</span>
              <div className="text-left">
                <h1 className="text-xs font-bold uppercase tracking-wider text-gray-800 font-sans">Swami POS</h1>
                <p className="text-[9px] text-gray-400 font-semibold">{activeStaff.name}</p>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["manager"] },
                { id: "pos", label: "Counter POS", icon: ShoppingCart, roles: ["manager", "receptionist", "cashier"] },
                { id: "orders", label: "Orders Register", icon: ClipboardList, roles: ["manager", "receptionist", "cashier"] },
                { id: "tables", label: "Table Layout", icon: Grid, roles: ["manager"] },
                { id: "bookings", label: "Table Bookings", icon: Calendar, roles: ["manager", "receptionist"] },
                { id: "menu", label: "Menu Catalog", icon: BookOpen, roles: ["manager"] },
                { id: "inventory", label: "Inventory Stock", icon: Archive, roles: ["manager"] },
                { id: "customers", label: "Customer CRM", icon: Users, roles: ["manager", "receptionist"] },
                { id: "kitchen", label: "Kitchen Display", icon: Tv, roles: ["manager", "kitchen"] },
                { id: "reports", label: "Sales Reports", icon: BarChart3, roles: ["manager"] },
                { id: "settings", label: "System Settings", icon: Settings, roles: ["manager"] }
              ].map((link) => {
                if (!link.roles.includes(userRole)) return null;
                const isActive = activeTab === link.id;

                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </span>

                    {link.id === "kitchen" && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-blue-600":"bg-blue-50 text-blue-600"}`}>
                        {orders.filter(o=>o.status==="NEW"||o.status==="PREPARING").length}
                      </span>
                    )}
                    {link.id === "inventory" && getInventoryAlertsCount() > 0 && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-red-600":"bg-red-50 text-red-600"}`}>
                        {getInventoryAlertsCount()}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-50 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-650 text-[10px] font-bold uppercase rounded-xl transition-all border border-red-100 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
            <a
              href="/dashboard/canteen"
              className="w-full flex items-center justify-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-xl transition-all border border-gray-100"
            >
              ↩️ Exit to ERP Admin
            </a>
          </div>
        </aside>
      )}

      {/* 2. MAIN APP CONTENT PANEL */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        
        {/* Header Toolbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-gray-400 font-mono">
              🕒 {dateTime}
            </span>
          </div>

          {/* Quick Active Staff details */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Terminal User</span>
              <span className="text-xs font-bold text-gray-800">{activeStaff.name} ({activeStaff.assignedRole.toUpperCase()})</span>
            </div>

            {/* Logout button for KDS / Kitchen which doesn't have sidebar */}
            {userRole === "kitchen" && (
              <button
                onClick={handleLogout}
                className="p-1 px-3 bg-red-50 hover:bg-red-100 border border-red-150 rounded-xl text-red-650 text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            )}

            {/* Notification center */}
            {userRole !== "kitchen" && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 border border-gray-100 hover:bg-gray-50 rounded-xl transition-all relative cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-gray-500" />
                  {notifications.filter(n=>!n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white font-bold text-[8px] flex items-center justify-center">
                      {notifications.filter(n=>!n.read).length}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-25" onClick={() => setShowNotifications(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-gray-100 shadow-xl z-30 overflow-hidden text-left"
                      >
                        <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-[10px] font-bold uppercase text-gray-500">
                          <span>Terminal Alerts</span>
                          <button
                            onClick={() => setNotifications(notifications.map(n=>({...n, read: true})))}
                            className="text-blue-600 hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                          {notifications.map((n) => (
                            <div key={n.id} className={`p-3 text-[11px] font-sans ${n.read ? "bg-white" : "bg-blue-50/20"}`}>
                              <p className="font-bold text-gray-800">{n.title}</p>
                              <p className="text-gray-500 text-[10px] mt-0.5">{n.message}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
              {activeStaff.name.slice(0, 1).toUpperCase()}
            </div>

          </div>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "pos" && renderPOS()}
              {activeTab === "orders" && renderOrders()}
              {activeTab === "tables" && renderTables()}
              {activeTab === "bookings" && renderBookings()}
              {activeTab === "menu" && renderMenu()}
              {activeTab === "inventory" && renderInventory()}
              {activeTab === "customers" && renderCustomers()}
              {activeTab === "kitchen" && renderKDS()}
              {activeTab === "reports" && renderReports()}
              {activeTab === "settings" && renderSettings()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* --- POPUP MODALS IN OVERLAYS --- */}

      {/* 1. ORDER DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-2.5 mb-4">
              Order Token: {selectedOrder.tokenNumber}
            </h4>

            <div className="space-y-3.5 text-xs font-sans text-gray-600">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-bold">Devotee Name</span>
                  <span className="font-bold text-gray-800">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-bold">Contact Phone</span>
                  <span className="font-semibold">{selectedOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-bold">Table No</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.tableName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase text-[9px] font-bold">Time Placed</span>
                  <span className="font-semibold">{selectedOrder.date} • {selectedOrder.timestamp}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <span className="text-[9px] font-bold uppercase text-gray-400 block">Ordered Items</span>
                <div className="space-y-1.5 font-sans">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between font-bold">
                      <span>{i.item.name} x {i.qty}</span>
                      <span>UGX {i.item.price * i.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-[11px] text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>UGX {selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5% GST):</span>
                  <span>UGX {selectedOrder.tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service charge (2.5%):</span>
                  <span>UGX {selectedOrder.serviceCharge}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-500 font-bold">
                    <span>Discount:</span>
                    <span>- UGX {selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-gray-800 pt-1.5 border-t border-gray-50">
                  <span>NET TOTAL:</span>
                  <span className="text-blue-600 font-bold">UGX {selectedOrder.total}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl flex justify-between items-center mt-3 border border-gray-100 text-[10px] font-bold">
                <span className="text-gray-500">PAYMENT STATUS</span>
                <span className={`px-2 py-0.5 rounded uppercase ${
                  selectedOrder.paymentStatus === "PAID" ? "bg-green-50 text-green-700 font-bold":"bg-red-50 text-red-700 font-bold"
                }`}>
                  {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5 border-t border-gray-50 pt-4">
              {selectedOrder.paymentStatus === "PENDING" && activeStaff.assignedRole === "cashier" && (
                <button
                  onClick={() => {
                    const updated = orders.map(o => o.id === selectedOrder.id ? { ...o, paymentStatus: "PAID" as const, paymentMethod: "CASH" as const } : o);
                    setOrders(updated);
                    saveState("canteen_orders", updated);
                    setSelectedOrder(null);
                    alert("Payment settled!");
                  }}
                  className="flex-grow py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-md cursor-pointer"
                >
                  Collect Cashier Payment
                </button>
              )}
              {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "COMPLETED" && (
                <button
                  onClick={() => {
                    handleUpdateOrderStatus(selectedOrder.id, "CANCELLED");
                    setSelectedOrder(null);
                    alert("Token cancelled.");
                  }}
                  className="py-2 px-3 border border-red-500 text-red-650 hover:bg-red-50 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PRINT THERMAL RECEIPT */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl relative text-left">
            <button
              onClick={() => setReceiptOrder(null)}
              className="absolute top-3 right-3 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div id="thermal-receipt-content-page" className="border border-gray-150 p-4 rounded-xl bg-gray-50 text-xs font-mono text-gray-800 space-y-3.5 leading-normal shadow-inner max-h-[480px] overflow-y-auto">
              <div className="text-center border-b border-gray-250 pb-3">
                <h4 className="font-bold text-sm tracking-wider uppercase">SKSS Kampala Canteen</h4>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5">Bukoto Complex, Kampala</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>TOKEN NO:</span>
                  <span className="text-blue-600 font-bold text-sm">{receiptOrder.tokenNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Allocation:</span>
                  <span className="font-bold">{receiptOrder.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{receiptOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{receiptOrder.date} • {receiptOrder.timestamp}</span>
                </div>
              </div>

              <div className="border-t border-gray-200/50 my-2" />

              <div className="space-y-1 text-[10px] font-bold">
                {receiptOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.item.name} x {i.qty}</span>
                    <span>UGX {i.item.price * i.qty}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200/50 my-2" />

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>UGX {receiptOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST / Tax (5%):</span>
                  <span>UGX {receiptOrder.tax}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service tax (2.5%):</span>
                  <span>UGX {receiptOrder.serviceCharge}</span>
                </div>
                {receiptOrder.discount > 0 && (
                  <div className="flex justify-between text-red-500 font-bold">
                    <span>Discount:</span>
                    <span>- UGX {receiptOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-gray-200 pt-1.5 mt-1.5">
                  <span>TOTAL AMOUNT:</span>
                  <span className="text-blue-600 font-bold">UGX {receiptOrder.total}</span>
                </div>
              </div>

              {/* Dynamic Stall Token Slips */}
              {(() => {
                const itemsByCategory = receiptOrder.items.reduce((groups: Record<string, typeof receiptOrder.items>, item) => {
                  const cat = item.item.category || "General";
                  if (!groups[cat]) groups[cat] = [];
                  groups[cat].push(item);
                  return groups;
                }, {});

                return Object.entries(itemsByCategory).map(([category, items]) => (
                  <div key={category} className="border-t border-dashed border-gray-300 pt-3.5 mt-3.5 text-left">
                    <div className="text-center font-bold text-[9px] text-gray-400 tracking-wider my-1 uppercase">
                      - - - TEAR SLIP FOR STALL: {category} - - -
                    </div>
                    <div className="border border-gray-200 p-2.5 bg-white rounded-xl space-y-1.5 text-[10px]">
                      <div className="flex justify-between font-bold">
                        <span>TOKEN NO: {receiptOrder.tokenNumber}</span>
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider">{category}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>Allocation: {receiptOrder.tableName}</span>
                        <span>{receiptOrder.timestamp}</span>
                      </div>
                      <div className="border-t border-gray-100 my-1" />
                      <div className="space-y-1 font-bold text-gray-800">
                        {items.map((i, idx) => (
                          <div key={idx} className="flex justify-between items-start">
                            <span>{i.item.name} x {i.qty}</span>
                            {i.notes && <span className="text-[8px] text-amber-600 font-normal block italic">Note: {i.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ));
              })()}

              <div className="border-t border-gray-200 pb-1 mt-3 pt-3 text-center text-[9px] font-sans text-gray-400">
                <p>Present token copy at pick-up shelf when served.</p>
                <p className="mt-1 font-bold uppercase text-gray-600">PAID STATUS: {receiptOrder.paymentStatus} ({receiptOrder.paymentMethod === "UPI" ? "Mobile Money" : receiptOrder.paymentMethod})</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  const printContent = document.getElementById("thermal-receipt-content-page");
                  if (printContent) {
                    const iframe = document.createElement("iframe");
                    iframe.style.position = "absolute";
                    iframe.style.width = "0px";
                    iframe.style.height = "0px";
                    iframe.style.border = "none";
                    document.body.appendChild(iframe);
                    const doc = iframe.contentWindow?.document;
                    if (doc) {
                      doc.write(`
                        <html>
                          <head>
                            <title>Receipt ${receiptOrder.tokenNumber}</title>
                            <style>
                              @page { size: auto; margin: 0mm; }
                              body { font-family: monospace; font-size: 11px; color: #000; margin: 8px; padding: 0; width: 72mm; }
                              .text-center { text-align: center; }
                              .font-bold { font-weight: bold; }
                              .text-sm { font-size: 12px; }
                              .text-blue-600 { color: #000 !important; }
                              .bg-blue-50 { background: none !important; border: 1px solid #000; padding: 1px 3px; }
                              .flex { display: flex; }
                              .justify-between { justify-content: space-between; }
                              .justify-end { display: flex; justify-content: flex-end; }
                              .space-y-1 > * + * { margin-top: 2px; }
                              .space-y-3.5 > * + * { margin-top: 10px; }
                              .my-2 { border-top: 1px solid #000; margin: 6px 0; }
                              .border-t { border-top: 1px solid #000; }
                              .border-b { border-bottom: 1px solid #000; }
                              .border-dashed { border-top: 1px dashed #000; margin: 10px 0; }
                              .border { border: 1px solid #000; padding: 6px; border-radius: 4px; }
                              .rounded-xl { border-radius: 4px; }
                              .uppercase { text-transform: uppercase; }
                              .text-gray-400 { color: #555; }
                              .text-red-500 { color: #000; }
                            </style>
                          </head>
                          <body>
                            <div>${printContent.innerHTML}</div>
                            <script>
                              window.onload = function() {
                                window.focus();
                                window.print();
                                setTimeout(function() {
                                  window.parent.document.body.removeChild(window.frameElement);
                                }, 1000);
                              };
                            </script>
                          </body>
                        </html>
                      `);
                      doc.close();
                    }
                  }
                  setReceiptOrder(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Thermal Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEW RESERVATION */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-2.5 mb-4">
              Add Table Reservation
            </h4>

            <form onSubmit={handleCreateBooking} className="space-y-4 font-sans text-xs text-gray-600">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Customer / Devotee Name *</label>
                <input
                  type="text"
                  required
                  name="customerName"
                  placeholder="e.g. Pankaj Shah"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  name="customerPhone"
                  placeholder="+256..."
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Party Size *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    name="partySize"
                    defaultValue="4"
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Allocate Table *</label>
                  <select
                    name="tableId"
                    required
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold"
                  >
                    {tables.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Booking Date *</label>
                  <input
                    type="date"
                    required
                    name="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Booking Time *</label>
                  <select
                    name="time"
                    required
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold"
                  >
                    <option>12:00 PM</option>
                    <option>12:30 PM</option>
                    <option>01:00 PM</option>
                    <option>01:30 PM</option>
                    <option>02:00 PM</option>
                    <option>02:30 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors cursor-pointer"
              >
                Schedule Table Reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD TABLE */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowAddTableModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-2.5 mb-4">
              Add Seating Table
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const name = data.get("tableName") as string;
                const capacity = Number(data.get("tableCapacity"));
                if (!name) return;

                const newT: SeatingTable = {
                  id: "tab-" + Date.now(),
                  name,
                  capacity,
                  status: "AVAILABLE"
                };

                const updated = [...tables, newT];
                setTables(updated);
                saveState("canteen_tables", updated);
                setShowAddTableModal(false);
              }}
              className="space-y-4 font-sans text-xs text-gray-650"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Table Label / Name *</label>
                <input
                  type="text"
                  required
                  name="tableName"
                  placeholder="e.g. Table 9 (Window)"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Seating Capacity *</label>
                <input
                  type="number"
                  required
                  min={1}
                  defaultValue="4"
                  name="tableCapacity"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors cursor-pointer"
              >
                Create Seating Table
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD MENU ITEM */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowAddMenuModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-2.5 mb-4">
              Add Food Item
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const name = data.get("foodName") as string;
                const price = Number(data.get("foodPrice"));
                const category = data.get("foodCategory") as FoodItem["category"];
                const variety = data.get("foodVariety") as FoodItem["variety"];

                if (!name) return;

                const newFood: FoodItem = {
                  id: "food-" + Date.now(),
                  name,
                  price,
                  category,
                  variety,
                  available: true
                };

                const updated = [...menu, newFood];
                setMenu(updated);
                saveState("canteen_menu", updated);
                setShowAddMenuModal(false);
              }}
              className="space-y-4 font-sans text-xs text-gray-650"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Food Item Name *</label>
                <input
                  type="text"
                  required
                  name="foodName"
                  placeholder="e.g. Swaminarayan Khichdi"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Price (INR) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  defaultValue="100"
                  name="foodPrice"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Category *</label>
                  <select
                    name="foodCategory"
                    required
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold"
                  >
                    <option value="Mains">Mains</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Variety *</label>
                  <select
                    name="foodVariety"
                    required
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Jain">Jain</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Sweet">Sweet</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors cursor-pointer"
              >
                Create Food Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. LOG WASTE */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowWasteModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b pb-2.5 mb-4">
              Log Raw Material Waste
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const name = data.get("wasteName") as string;
                const qty = Number(data.get("wasteQty"));
                const cost = Number(data.get("wasteCost"));
                const reason = data.get("wasteReason") as string;

                if (!name) return;

                const newLog = {
                  id: "w-" + Date.now(),
                  name,
                  qty,
                  unit: "kg",
                  cost,
                  reason,
                  date: new Date().toISOString().split("T")[0]
                };

                const updatedLogs = [newLog, ...wasteLogs];
                setWasteLogs(updatedLogs);
                saveState("canteen_wastelogs", updatedLogs);

                const matchedInv = inventory.find(i=>i.name.toLowerCase() === name.toLowerCase());
                if (matchedInv) {
                  const updatedInv = inventory.map(item => item.id === matchedInv.id ? { ...item, stock: Math.max(0, item.stock - qty) } : item);
                  setInventory(updatedInv);
                  saveState("canteen_inventory", updatedInv);
                }

                setShowWasteModal(false);
                alert("Logged!");
              }}
              className="space-y-4 font-sans text-xs text-gray-655"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Item / Ingredient Name *</label>
                <select
                  name="wasteName"
                  required
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold"
                >
                  {inventory.map(item=> <option key={item.id} value={item.name}>{item.name} ({item.stock} {item.unit} left)</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Wasted Quantity *</label>
                  <input type="number" step="0.1" required name="wasteQty" placeholder="e.g. 2" className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Estimated Cost Loss *</label>
                  <input type="number" required name="wasteCost" placeholder="e.g. 100" className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Reason for Waste *</label>
                <input type="text" required name="wasteReason" placeholder="e.g. Spoilage" className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors cursor-pointer">
                Log Waste & Adjust Inventory
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
