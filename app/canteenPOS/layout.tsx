"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { OfflineProvider } from "@/lib/offline/OfflineContext";
import { useDbSeed } from "@/lib/offline/useDbSeed";
import { useSyncQueue } from "@/lib/offline/useSyncQueue";
import { usePathname, useRouter } from "next/navigation";
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
  X,
  Plus,
  Printer,
  ArrowRight,
  Clock,
  Trash2
} from "lucide-react";
import { CanteenProvider, useCanteen, POSRole, POSTab } from "./context/CanteenContext";
import { SeatingTable, FoodItem } from "@/data/canteen";

const sidebarLinks = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["manager"], path: "/canteenPOS/dashboard" },
  { id: "pos", label: "Counter POS", icon: ShoppingCart, roles: ["manager", "receptionist", "cashier"], path: "/canteenPOS/pos" },
  { id: "orders", label: "Orders Register", icon: ClipboardList, roles: ["manager", "receptionist", "cashier"], path: "/canteenPOS/orders" },
  { id: "tables", label: "Table Layout", icon: Grid, roles: ["manager"], path: "/canteenPOS/tables" },
  { id: "bookings", label: "Table Bookings", icon: Calendar, roles: ["manager", "receptionist"], path: "/canteenPOS/bookings" },
  { id: "menu", label: "Menu Catalog", icon: BookOpen, roles: ["manager"], path: "/canteenPOS/menu" },
  { id: "inventory", label: "Inventory Stock", icon: Archive, roles: ["manager"], path: "/canteenPOS/inventory" },
  { id: "customers", label: "Customer CRM", icon: Users, roles: ["manager", "receptionist"], path: "/canteenPOS/customers" },
  { id: "kitchen", label: "Kitchen Display", icon: Tv, roles: ["manager", "kitchen"], path: "/canteenPOS/kitchen" },
  { id: "reports", label: "Sales Reports", icon: BarChart3, roles: ["manager"], path: "/canteenPOS/reports" },
  { id: "settings", label: "System Settings", icon: Settings, roles: ["manager"], path: "/canteenPOS/settings" }
];

function CanteenLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const {
    isLoggedIn,
    currentRole,
    logout,
    activeTab,
    setActiveTab,
    dateTime,
    globalSearch,
    setGlobalSearch,
    showNotifications,
    setShowNotifications,
    notifications,
    setNotifications,
    selectedOrder,
    setSelectedOrder,
    receiptOrder,
    setReceiptOrder,
    showBookingModal,
    setShowBookingModal,
    showAddTableModal,
    setShowAddTableModal,
    showAddMenuModal,
    setShowAddMenuModal,
    showWasteModal,
    setShowWasteModal,
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
    wasteLogs,
    setWasteLogs,
    handleRoleChange,
    handleUpdateOrderStatus,
    handleCreateBooking,
    handleSeatBooking,
    handleCancelBooking,
    getActiveTablesCount,
    getInventoryAlertsCount,
    saveState,
    handleCreateMenuItem,
    categories,
    showAddCategoryModal,
    setShowAddCategoryModal,
    handleCreateCategory
  } = useCanteen();

  const [newFoodImage, setNewFoodImage] = useState("");
  const [newFoodChannel, setNewFoodChannel] = useState<'canteen' | 'e-com' | 'both'>("canteen");

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setNewFoodImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync tab activeTab state with route path
  useEffect(() => {
    if (mounted) {
      const tabName = pathname.split("/").pop() || "dashboard";
      if (tabName !== "canteenPOS" && tabName !== "") {
        setActiveTab(tabName as POSTab);
      }
    }
  }, [pathname, mounted, setActiveTab]);

  // Auth Router Guard Redirects
  // NOTE: isLoggedIn is now synchronously initialised from localStorage inside
  // CanteenContext (lazy useState), so we can safely guard on first mount
  // without waiting for an async useEffect to populate it.
  useEffect(() => {
    if (!mounted) return;

    if (!isLoggedIn && pathname !== "/canteenPOS") {
      // Not authenticated — send to canteen login
      router.replace("/canteenPOS");
    } else if (isLoggedIn) {
      if (pathname === "/canteenPOS") {
        // Already logged in but on the login page — redirect to correct home
        let target = "/canteenPOS/dashboard";
        if (currentRole === "kitchen") target = "/canteenPOS/kitchen";
        else if (currentRole === "receptionist" || currentRole === "cashier") target = "/canteenPOS/pos";
        router.replace(target);
      } else {
        // Enforce per-tab role restrictions
        const tabName = pathname.split("/").pop() || "dashboard";
        const currentLink = sidebarLinks.find((l) => l.id === tabName);
        if (currentLink && currentRole && !currentLink.roles.includes(currentRole)) {
          let target = "/canteenPOS/dashboard";
          if (currentRole === "kitchen") target = "/canteenPOS/kitchen";
          else if (currentRole === "receptionist" || currentRole === "cashier") target = "/canteenPOS/pos";
          router.replace(target);
        }
      }
    }
  }, [mounted, isLoggedIn, pathname, currentRole, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Login screen directly without the sidebars and headers
  if (pathname === "/canteenPOS") {
    return <>{children}</>;
  }

  // Fallback loading while redirecting non-auth users
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Authenticating Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex text-gray-800">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-gray-100 shrink-0 flex flex-col justify-between hidden lg:flex">
        <div>
          {/* Logo brand */}
          <div className="h-16 px-6 border-b border-gray-50 flex items-center gap-2">
            <span className="text-2xl">🕉️</span>
            <div className="text-left">
              <h1 className="text-xs font-bold uppercase tracking-wider text-gray-800 font-sans">Swami POS</h1>
              <p className="text-[9px] text-gray-400 font-semibold">Canteen SaaS Desk</p>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="p-4 space-y-1">
            {sidebarLinks.map((link) => {
              // Restrict tab visibility if role doesn't have permissions
              if (currentRole && !link.roles.includes(currentRole)) return null;

              const isActive = activeTab === link.id;

              return (
                <Link
                  key={link.id}
                  href={link.path}
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

                  {/* Add visual badge counts */}
                  {link.id === "kitchen" && (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-blue-600" : "bg-blue-50 text-blue-600"}`}>
                      {orders.filter(o => o.status === "NEW" || o.status === "PREPARING").length}
                    </span>
                  )}
                  {link.id === "inventory" && getInventoryAlertsCount() > 0 && (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white text-red-600" : "bg-red-50 text-red-600"}`}>
                      {getInventoryAlertsCount()}
                    </span>
                  )}
                  {link.id === "tables" && (
                    <span className="text-[9px] text-gray-400 font-normal lowercase">
                      {getActiveTablesCount()} active
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back Link to admin dashboard */}
        <div className="p-4 border-t border-gray-50 space-y-2">
          <a
            href="/dashboard/canteen"
            className="w-full flex items-center justify-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-xl transition-all border border-gray-100"
          >
            ↩️ Exit to ERP Admin
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center py-2 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-xl transition-all border border-red-100 cursor-pointer"
          >
            🚪 Sign Out Terminal
          </button>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        {/* Header toolbar panel */}
        <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          {/* Left profile name & clock */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-[11px] font-bold text-gray-400 font-mono">
              🕒 {dateTime}
            </span>
          </div>

          {/* Center search bar */}
          <div className="relative w-64 max-w-xs hidden sm:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search POS globally..."
              value={globalSearch}
              onChange={(e) => {
                const val = e.target.value;
                setGlobalSearch(val);
                if (val && activeTab !== "orders" && activeTab !== "dashboard") {
                  router.push("/canteenPOS/orders");
                }
              }}
              className="w-full pl-8 pr-4 py-1.5 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white"
            />
          </div>

          {/* Right quick role switcher & notifications */}
          <div className="flex items-center gap-4 relative">
            {/* Static role display of logged in member */}
            {currentRole && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl">
                <span className="text-[9px] font-bold uppercase text-gray-400">Terminal Role:</span>
                <span className="text-[10px] font-bold uppercase text-gray-700">
                  {currentRole === "manager" && "Canteen Manager"}
                  {currentRole === "receptionist" && "Receptionist"}
                  {currentRole === "cashier" && "Cashier Desk"}
                  {currentRole === "kitchen" && "Kitchen Staff"}
                </span>
              </div>
            )}

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 border border-gray-100 hover:bg-gray-50 rounded-xl transition-all relative cursor-pointer"
              >
                <Bell className="w-4 h-4 text-gray-500" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white font-bold text-[8px] flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
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
                          onClick={() => {
                            setNotifications(notifications.map(n => ({ ...n, read: true })));
                          }}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          Clear all
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

            {/* Profile avatar representation */}
            {currentRole && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                {currentRole.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Outer scrollable viewport */}
        <main className="flex-grow p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* --- POPUP MODALS IN OVERLAYS --- */}

      {/* 1. ORDER DETAILS / INVOICE PREVIEW MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-150 pb-2.5 mb-4">
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

              {/* Items ordered list */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <span className="text-[9px] font-bold uppercase text-gray-400 block">Ordered Items</span>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between font-semibold">
                      <span>{i.item.name} x {i.qty}</span>
                      <span>UGX {i.item.price * i.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals math calculations */}
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
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>Discount:</span>
                    <span>- UGX {selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-gray-800 pt-1.5 border-t border-gray-50">
                  <span>NET TOTAL AMOUNT:</span>
                  <span className="text-blue-600 font-bold">UGX {selectedOrder.total}</span>
                </div>
              </div>

              {/* Payment status badge */}
              <div className="bg-gray-50 p-3 rounded-2xl flex justify-between items-center mt-3 border border-gray-100 text-[10px] font-bold">
                <span className="text-gray-500">PAYMENT STATUS</span>
                <span className={`px-2 py-0.5 rounded uppercase ${
                  selectedOrder.paymentStatus === "PAID" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})
                </span>
              </div>
            </div>

            {/* Actions: advance states or refund */}
            <div className="flex gap-2.5 mt-5 border-t border-gray-50 pt-4">
              {selectedOrder.paymentStatus === "PENDING" && currentRole !== "kitchen" && (
                <button
                  onClick={() => {
                    const updated = orders.map(o => o.id === selectedOrder.id ? { ...o, paymentStatus: "PAID" as const, paymentMethod: "UPI" as const } : o);
                    setOrders(updated);
                    saveState("canteen_orders", updated);
                    setSelectedOrder(null);
                    alert("Bill payment settled successfully!");
                  }}
                  className="flex-grow py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-md border-none cursor-pointer"
                >
                  Collect Cashier Payment
                </button>
              )}
              {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "COMPLETED" && (
                <button
                  onClick={() => {
                    handleUpdateOrderStatus(selectedOrder.id, "CANCELLED");
                    setSelectedOrder(null);
                    alert("Order token cancelled.");
                  }}
                  className="py-2 px-3 border border-red-500 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PRINT RECEIPT DIALOG MODAL */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl relative text-left">
            <button
              onClick={() => setReceiptOrder(null)}
              className="absolute top-3 right-3 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thermal Print Receipt Simulation layout */}
            <div id="thermal-receipt-content" className="border border-gray-150 p-4 rounded-xl bg-gray-50 text-xs font-mono text-gray-800 space-y-3.5 leading-normal shadow-inner max-h-[480px] overflow-y-auto">
              <div className="text-center border-b border-gray-200 pb-3">
                <h4 className="font-bold text-sm tracking-wider uppercase">SKSS Kampala Canteen</h4>
                <p className="text-[10px] text-gray-400 font-sans mt-0.5">Bukoto Complex, Kampala</p>
                <p className="text-[9px] text-gray-400 font-sans">Swaminarayan Annakoot Seva</p>
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
                <div className="flex justify-between font-bold text-sm border-t border-gray-200/60 pt-1.5 mt-1.5">
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
                  const printContent = document.getElementById("thermal-receipt-content");
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100 flex items-center gap-1.5 border-none cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Thermal Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEW RESERVATION MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2.5 mb-4">
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
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  name="customerPhone"
                  placeholder="+256..."
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
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
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Allocate Table *</label>
                  <select
                    name="tableId"
                    required
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                  >
                    {tables.map(t => <option key={t.id} value={t.id}>{t.name} ({t.capacity} Seats)</option>)}
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
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold focus:border-blue-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Booking Time *</label>
                  <select
                    name="time"
                    required
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                  >
                    <option>12:00 PM</option>
                    <option>12:30 PM</option>
                    <option>01:00 PM</option>
                    <option>01:30 PM</option>
                    <option>02:00 PM</option>
                    <option>02:30 PM</option>
                    <option>07:00 PM</option>
                    <option>07:30 PM</option>
                    <option>08:00 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors border-none cursor-pointer"
              >
                Schedule Table Reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD TABLE MODAL */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowAddTableModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2.5 mb-4">
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
              className="space-y-4 font-sans text-xs text-gray-600"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Table Label / Name *</label>
                <input
                  type="text"
                  required
                  name="tableName"
                  placeholder="e.g. Table 9 (Window)"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
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
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors border-none cursor-pointer"
              >
                Create Seating Table
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD MENU ITEM MODAL */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowAddMenuModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2.5 mb-4">
              Add Food Item to Menu
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

                handleCreateMenuItem({
                  name,
                  price,
                  category,
                  variety,
                  image_url: newFoodImage || undefined,
                  channel: newFoodChannel
                });

                setNewFoodImage("");
                setNewFoodChannel("canteen");
                setShowAddMenuModal(false);
              }}
              className="space-y-4 font-sans text-xs text-gray-600"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Food Item Name *</label>
                <input
                  type="text"
                  required
                  name="foodName"
                  placeholder="e.g. Garlic Naan Platter"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
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
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Category *</label>
                  <select
                    name="foodCategory"
                    required
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Variety *</label>
                  <select
                    name="foodVariety"
                    required
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Jain">Jain</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Sweet">Sweet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Sales Channel *</label>
                <select
                  value={newFoodChannel}
                  onChange={(e: any) => setNewFoodChannel(e.target.value)}
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                >
                  <option value="canteen">Canteen Only</option>
                  <option value="e-com">E-Commerce Only</option>
                  <option value="both">Both (Canteen & E-Com)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Food Item Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                  {newFoodImage && (
                    <img src={newFoodImage} alt="Preview" className="w-8 h-8 rounded-lg object-cover border" />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors border-none cursor-pointer"
              >
                Create Food Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5.5 ADD CATEGORY MODAL */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowAddCategoryModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2.5 mb-4">
              Add Menu Category
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const name = data.get("categoryName") as string;
                if (!name?.trim()) return;

                handleCreateCategory({ name: name.trim() });
                setShowAddCategoryModal(false);
              }}
              className="space-y-4 font-sans text-xs text-gray-600"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  name="categoryName"
                  placeholder="e.g. Desserts"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors border-none cursor-pointer"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. LOG WASTE LOSS MODAL */}
      {showWasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => setShowWasteModal(false)}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2.5 mb-4">
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

                const matchedInv = inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
                if (matchedInv) {
                  const updatedInv = inventory.map(item => item.id === matchedInv.id ? { ...item, stock: Math.max(0, item.stock - qty) } : item);
                  setInventory(updatedInv);
                  saveState("canteen_inventory", updatedInv);
                }

                setShowWasteModal(false);
                alert("Waste loss logged successfully.");
              }}
              className="space-y-4 font-sans text-xs text-gray-600"
            >
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Item / Ingredient Name *</label>
                <select
                  name="wasteName"
                  required
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                >
                  {inventory.map(item => <option key={item.id} value={item.name}>{item.name} ({item.stock} {item.unit} left)</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Wasted Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    name="wasteQty"
                    placeholder="e.g. 2.5"
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold focus:border-blue-400 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Estimated Cost Loss *</label>
                  <input
                    type="number"
                    required
                    name="wasteCost"
                    placeholder="e.g. 150"
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold focus:border-blue-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Reason for Waste *</label>
                <input
                  type="text"
                  required
                  name="wasteReason"
                  placeholder="e.g. Spoilage, Spillage"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md mt-2 transition-colors border-none cursor-pointer"
              >
                Log Waste & Adjust Inventory
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CanteenBootstrap
 *
 * Mounts inside OfflineProvider so it can read online status.
 * Seeds Dexie IndexedDB silently on first online boot.
 * Registers the service worker and starts the sync queue watcher.
 * This is a headless component — renders nothing visible.
 */
function CanteenBootstrap() {
  useDbSeed();       // Seed menu/tables/customers into IndexedDB on boot
  useSyncQueue();    // Register SW + fire bulk sync when device reconnects
  return null;
}

export default function CanteenLayout({ children }: { children: React.ReactNode }) {
  return (
    <OfflineProvider>
      <CanteenProvider>
        {/* Seeds IndexedDB in the background on first boot */}
        <CanteenBootstrap />
        <CanteenLayoutShell>{children}</CanteenLayoutShell>
      </CanteenProvider>
    </OfflineProvider>
  );
}
