"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coffee, Users, Plus, Trash2, Check, ClipboardList, 
  Utensils, DollarSign, Clock, CheckCircle2, Ticket, ShoppingCart, 
  Printer, CheckCircle, X, Sparkles, ArrowRight, Lock, Mail, 
  UserCheck, TrendingUp, BarChart3, Settings, AlertTriangle, Pencil
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  SeatingTable, 
  FoodItem, 
  CanteenOrder, 
  TableBooking,
  CanteenCustomer,
  CanteenStaffAccount,
  initialSuppliers,
  initialInventory
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
  useStaffList,
  useAddStaff,
  useDeleteStaff,
  useAddMenuItem,
  useEditMenuItem,
  useDeleteMenuItem,
  useAddTable,
  useCategories,
  useAddCategory,
  useDeleteCategory,
  useUpdateCategory,
  useBulkDeleteMenuItems,
  useBulkDeleteTables,
} from "@/lib/api/canteen";

export default function CanteenCRMPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "pos" | "tables" | "menu" | "categories" | "orders" | "staff" | "customers">("overview");

  // State loaded dynamically on mount
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [foodMenu, setFoodMenu] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<CanteenOrder[]>([]);
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [customers, setCustomers] = useState<CanteenCustomer[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<CanteenStaffAccount[]>([]);

  // POS CART STATE
  const [cart, setCart] = useState<{ item: FoodItem; qty: number }[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [activeTicket, setActiveTicket] = useState<CanteenOrder | null>(null);

  // Bulk Delete selection states
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

  // Configure Add Table Form State
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);

  // Configure Add Food Form State
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodPrice, setNewFoodPrice] = useState<number>(100);
  const [newFoodCategory, setNewFoodCategory] = useState<string>("Mains");
  const [newFoodVariety, setNewFoodVariety] = useState<"Regular" | "Jain" | "Spicy" | "Sweet">("Regular");
  const [newFoodChannel, setNewFoodChannel] = useState<"canteen" | "e-com" | "both">("canteen");
  const [newFoodImage, setNewFoodImage] = useState<string>("");

  // Configure Edit Food Form State
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [editFoodName, setEditFoodName] = useState("");
  const [editFoodPrice, setEditFoodPrice] = useState<number>(100);
  const [editFoodCategory, setEditFoodCategory] = useState("");
  const [editFoodVariety, setEditFoodVariety] = useState<"Regular" | "Jain" | "Spicy" | "Sweet">("Regular");
  const [editFoodChannel, setEditFoodChannel] = useState<"canteen" | "e-com" | "both">("canteen");
  const [editFoodImage, setEditFoodImage] = useState<string>("");

  // Helper for image upload scaling
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
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
        if (isEdit) {
          setEditFoodImage(dataUrl);
        } else {
          setNewFoodImage(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Configure Add Staff Form State
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<CanteenStaffAccount["assignedRole"]>("receptionist");

  // Admin auth check state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_access_token");
      setIsAdminLoggedIn(!!token);
    }
  }, []);

  // ─── API Query & Offline Hooks ──────────────────────────────────────────────
  const { data: apiMenu } = useOfflineMenu(undefined, { enabled: isAdminLoggedIn });
  const { data: apiTables } = useOfflineTables(undefined, { enabled: isAdminLoggedIn });
  const { data: apiCategories = [] } = useCategories({ enabled: isAdminLoggedIn });
  const { data: apiOrders } = useOrders(undefined, { enabled: isAdminLoggedIn });
  const { data: apiBookings } = useBookings(undefined, { enabled: isAdminLoggedIn });
  const { data: apiCustomers } = useCustomers(undefined, { enabled: isAdminLoggedIn });
  const { data: apiStaffList } = useStaffList({ enabled: isAdminLoggedIn });

  // ─── API Mutations ──────────────────────────────────────────────────────────
  const { placeOrder: apiPlaceOrder } = useOfflineOrder();
  const { mutate: apiUpdateOrderStatus } = useUpdateOrderStatus();
  const { mutate: apiUpdateTable } = useUpdateTable();
  const { mutate: apiAddBooking } = useAddBooking();
  const { mutate: apiUpdateBooking } = useUpdateBooking();
  const { mutate: apiAddCustomer } = useAddCustomer();
  const { mutate: apiAddStaff } = useAddStaff();
  const { mutate: apiDeleteStaff } = useDeleteStaff();
  const { mutate: apiAddMenuItem } = useAddMenuItem();
  const { mutate: apiEditMenuItem } = useEditMenuItem();
  const { mutate: apiDeleteMenuItem } = useDeleteMenuItem();
  const { mutate: apiBulkDeleteMenuItems } = useBulkDeleteMenuItems();
  const { mutate: apiBulkDeleteTables } = useBulkDeleteTables();
  const { mutate: apiAddCategory } = useAddCategory();
  const { mutate: apiDeleteCategory } = useDeleteCategory();
  const { mutate: apiUpdateCategory } = useUpdateCategory();
  const { mutate: apiAddTable } = useAddTable();

  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);

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
        image: m.image_url || undefined,
        channel: m.channel,
      }));
      setFoodMenu(mappedMenu);
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
            }))
          : [],
        subtotal: o.subtotal,
        tax: o.tax_amount,
        serviceCharge: o.service_charge,
        discount: o.discount_amount,
        total: o.total_amount,
        paymentMethod: o.payment_method === "PENDING" ? "UPI" : o.payment_method, // Fallback for enum
        paymentStatus: o.payment_status === "PAID" ? "PAID" : "PENDING",
        status: o.order_status,
        timestamp: new Date(o.ordered_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(o.ordered_at).toISOString().split("T")[0],
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

  // Map API Canteen Staff Accounts
  useEffect(() => {
    if (apiStaffList) {
      const mappedStaff: CanteenStaffAccount[] = apiStaffList.map((s) => ({
        id: s.id.toString(),
        email: s.email,
        name: s.name,
        assignedRole: s.assigned_role === "kitchen" ? "kitchen" : s.assigned_role === "receptionist" ? "receptionist" : s.assigned_role === "cashier" ? "cashier" : "manager",
        createdAt: new Date(s.created_at).toISOString().split("T")[0],
      }));
      setStaffAccounts(mappedStaff);
    }
  }, [apiStaffList]);

  // Sync helpers
  const saveTables = (updated: SeatingTable[]) => {
    setTables(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("canteen_tables", JSON.stringify(updated));
    }
  };

  const saveMenu = (updated: FoodItem[]) => {
    setFoodMenu(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("canteen_menu", JSON.stringify(updated));
    }
  };

  const saveOrders = (updated: CanteenOrder[]) => {
    setOrders(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("canteen_orders", JSON.stringify(updated));
    }
  };

  const saveStaffAccounts = (updated: CanteenStaffAccount[]) => {
    setStaffAccounts(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("canteen_staff_accounts", JSON.stringify(updated));
    }
  };

  // --- ACTIONS ---

  // Seating table creation
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;

    apiAddTable({
      name: newTableName,
      capacity: newTableCapacity,
      location_zone: "Main Zone",
    });

    setNewTableName("");
  };

  const handleDeleteTable = (id: string) => {
    // Soft-delete/deactivate table by updating its active status to false
    apiUpdateTable({
      id,
      updates: { status: "AVAILABLE" },
    });
  };

  const toggleTableStatus = (id: string, nextStatus: SeatingTable["status"]) => {
    apiUpdateTable({
      id,
      updates: { status: nextStatus },
    });
  };

  // Food Menu creation
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName) return;

    apiAddMenuItem({
      name: newFoodName,
      price: Number(newFoodPrice),
      category: newFoodCategory,
      variety: newFoodVariety,
      available: true,
      image_url: newFoodImage || undefined,
      channel: newFoodChannel,
    });

    setNewFoodName("");
    setNewFoodImage("");
    setNewFoodChannel("canteen");
  };

  const handleDeleteFood = (id: string) => {
    apiDeleteMenuItem(id);
  };

  const handleBulkDeleteMenu = () => {
    if (selectedMenuIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedMenuIds.length} selected menu items?`)) return;

    apiBulkDeleteMenuItems(selectedMenuIds, {
      onSuccess: () => {
        setSelectedMenuIds([]);
      },
      onError: () => {
        alert("Failed to delete selected menu items.");
      }
    });
  };

  const handleBulkDeleteTables = () => {
    if (selectedTableIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete/deactivate the ${selectedTableIds.length} selected seating tables?`)) return;

    apiBulkDeleteTables(selectedTableIds, {
      onSuccess: () => {
        setSelectedTableIds([]);
      },
      onError: () => {
        alert("Failed to delete selected tables.");
      }
    });
  };

  const handleEditFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFood) return;

    apiEditMenuItem({
      id: editingFood.id,
      updates: {
        name: editFoodName,
        price: Number(editFoodPrice),
        category: editFoodCategory,
        variety: editFoodVariety,
        channel: editFoodChannel,
        image_url: editFoodImage || undefined,
      },
    });

    setEditingFood(null);
  };

  // Cart operations
  const addToCart = (item: FoodItem) => {
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      setCart(cart.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { item, qty: 1 }]);
    }
  };

  const updateCartQty = (itemId: string, delta: number) => {
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

  // Ticket checkout
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Please add at least one food item.");
      return;
    }

    const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);
    const tax = 0; // 0% VAT (Removed automatic addition)
    const serviceCharge = 0; // 0% Service Charge (Removed automatic addition)
    const total = subtotal + tax + serviceCharge;

    const matchedTable = tables.find((t) => t.id === selectedTable);
    const tableNameText = matchedTable ? matchedTable.name : "Walk-in Counter";

    const tokenNum = "TK-" + Math.floor(2000 + Math.random() * 8000);
    const dateToday = new Date().toISOString().split("T")[0];

    const apiOrderItems = cart.map((c) => ({
      menu_item_id: c.item.id,
      item_name: c.item.name,
      item_price: c.item.price,
      quantity: c.qty,
      line_total: c.item.price * c.qty,
    }));

    apiPlaceOrder({
      customer_name: customerName.trim() || "Guest Devotee",
      customer_phone: customerPhone.trim() || null,
      table_id: selectedTable || null,
      table_name: tableNameText,
      items: apiOrderItems,
      subtotal,
      tax_amount: tax,
      service_charge: serviceCharge,
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: "PAID",
      order_status: "NEW",
    })
      .then(({ id }) => {
        const newOrder: CanteenOrder = {
          id,
          tokenNumber: tokenNum,
          customerName: customerName || "Guest Devotee",
          customerPhone: customerPhone || "N/A",
          tableName: tableNameText,
          items: cart.map((c) => ({ item: c.item, qty: c.qty })),
          subtotal,
          tax,
          serviceCharge,
          discount: 0,
          total,
          paymentMethod,
          paymentStatus: "PAID",
          status: "NEW",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: dateToday,
        };

        setActiveTicket(newOrder);

        // Update customer list locally if new customer is registered
        if (customerPhone) {
          const exist = customers.find((c) => c.phone === customerPhone);
          if (!exist) {
            apiAddCustomer({
              name: customerName || "Guest Devotee",
              phone: customerPhone,
              customer_type: "Regular",
            });
          }
        }
      })
      .catch((err) => {
        console.error("POS Checkout failed:", err);
      });

    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setSelectedTable("");
  };

  const updateOrderStatus = (id: string, nextStatus: CanteenOrder["status"]) => {
    apiUpdateOrderStatus({ id, status: nextStatus });
  };

  // Staff Account Creation (Role Assigner)
  const handleAddStaffAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail || !newStaffPassword || !newStaffName) {
      alert("Please fill out all staff fields.");
      return;
    }

    const exist = staffAccounts.find((s) => s.email.toLowerCase() === newStaffEmail.toLowerCase().trim());
    if (exist) {
      alert("A staff account with this email address already exists.");
      return;
    }

    apiAddStaff({
      name: newStaffName,
      email: newStaffEmail.trim(),
      password: newStaffPassword,
      assigned_role: newStaffRole === "kitchen" ? "kitchen" : newStaffRole === "receptionist" ? "receptionist" : newStaffRole === "cashier" ? "cashier" : "manager",
    });

    // Reset Form
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPassword("");
    setNewStaffRole("receptionist");

    alert(`Successfully assigned ${newStaffName} as Swaminarayan Canteen staff member!`);
  };

  const handleRevokeStaff = (id: string) => {
    if (confirm("Are you sure you want to revoke access for this staff member?")) {
      apiDeleteStaff(Number(id));
    }
  };

  // Stats Calculations
  const occupiedTablesCount = tables.filter((t) => t.status === "OCCUPIED").length;
  const pendingOrdersCount = orders.filter((o) => o.status === "NEW" || o.status === "PREPARING").length;
  const totalCanteenSales = orders
    .filter((o) => o.paymentStatus === "PAID" && o.status !== "CANCELLED")
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const adminCategories = apiCategories.length > 0
    ? apiCategories.map(c => c.name)
    : ["Mains", "Snacks", "Beverages", "Desserts", "Combos", "Add-ons"];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
      
      {/* Standalone Canteen POS Promotional launch banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg shadow-blue-200 mb-2">
        <div className="space-y-1 text-left">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Launch Standalone Canteen POS Terminal (SaaS Desktop View)</span>
          </h2>
          <p className="text-[11px] text-blue-100 font-sans">
            Launch the high-performance desktop cashier desk, bookings calendar, live table floor plan, KDS terminal, and reports.
          </p>
        </div>
        <a
          href="/canteenPOS"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 bg-white hover:bg-gray-50 text-blue-600 text-[11px] font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>Launch POS Terminal</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#2B132C] flex items-center gap-2">
            <Coffee className="w-6 h-6 text-[#B47F35]" />
            <span>Temple Canteen Admin Monitoring</span>
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Monitor sales growth, devotee customer details, table layouts, and assign staff terminal roles.
          </p>
        </div>

        {/* Tab toggles */}
        <div className="flex flex-wrap bg-white border border-[#B47F35]/15 p-1 rounded-xl shadow-sm">
          {[
            { id: "overview", label: "Overview Metrics" },
            { id: "staff", label: "Staff Terminal Roles" },
            { id: "customers", label: "Customer Users" },
            { id: "pos", label: "POS Billing" },
            { id: "tables", label: "Seating Layout" },
            { id: "menu", label: "Menu Catalog" },
            { id: "categories", label: "Menu Categories" },
            { id: "orders", label: "Kitchen Queue" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === tab.id ? "bg-[#B47F35] text-white shadow-sm" : "text-secondary-bronze hover:text-[#B47F35]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC BADGES CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary-bronze/70 tracking-wider">Canteen Sales Revenue</p>
            <h4 className="text-lg font-bold text-[#2B132C] mt-0.5">
              UGX {totalCanteenSales.toLocaleString("en-IN")}
            </h4>
          </div>
        </div>

        <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35]">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary-bronze/70 tracking-wider">Active Occupancy</p>
            <h4 className="text-lg font-bold text-[#2B132C] mt-0.5">
              {occupiedTablesCount} / {tables.length} Tables
            </h4>
          </div>
        </div>

        <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#2B132C]/10 flex items-center justify-center text-[#2B132C]">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary-bronze/70 tracking-wider">Staff Accounts</p>
            <h4 className="text-lg font-bold text-[#2B132C] mt-0.5">
              {staffAccounts.length} Active Roles
            </h4>
          </div>
        </div>

        <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary-bronze/70 tracking-wider">Customer Users</p>
            <h4 className="text-lg font-bold text-[#2B132C] mt-0.5">
              {customers.length} Devotees
            </h4>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE TABS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sales Growth Chart */}
              <div className="bg-white p-6 rounded-3xl border border-[#B47F35]/15 shadow-sm space-y-4 text-left">
                <div>
                  <h4 className="text-sm font-bold text-[#2B132C] uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#B47F35]" />
                    <span>Canteen Monthly Sales Growth</span>
                  </h4>
                  <p className="text-[11px] text-gray-400">Total monthly revenue progress (INR)</p>
                </div>
                
                {/* SVG growth graph */}
                <div className="h-56 relative w-full pt-4">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    <line x1="40" y1="10" x2="480" y2="10" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="60" x2="480" y2="60" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="160" x2="480" y2="160" stroke="#E5E3DF" strokeWidth="1.5" />
                    
                    <text x="5" y="15" fill="#B47F35" fontSize="9" fontWeight="bold">UGX 60,000</text>
                    <text x="5" y="65" fill="#B47F35" fontSize="9" fontWeight="bold">UGX 40,000</text>
                    <text x="5" y="115" fill="#B47F35" fontSize="9" fontWeight="bold">UGX 20,000</text>
                    <text x="15" y="165" fill="#B47F35" fontSize="9" fontWeight="bold">UGX 0</text>

                    {/* Gradient area */}
                    <path
                      d="M 50,160 L 120,130 L 190,115 L 260,80 L 330,75 L 400,50 L 470,35 L 470,160 Z"
                      fill="url(#goldGrad)"
                      opacity="0.15"
                    />

                    {/* Line path */}
                    <path
                      d="M 50,160 L 120,130 L 190,115 L 260,80 L 330,75 L 400,50 L 470,35"
                      fill="none"
                      stroke="#B47F35"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    <defs>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#C59D5F" />
                        <stop offset="100%" stopColor="#FAF7F2" />
                      </linearGradient>
                    </defs>

                    <circle cx="50" cy="160" r="5" fill="#B47F35" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="120" cy="130" r="5" fill="#B47F35" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="190" cy="115" r="5" fill="#B47F35" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="260" cy="80" r="5" fill="#B47F35" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="330" cy="75" r="5" fill="#B47F35" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="400" cy="50" r="5" fill="#B47F35" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="470" cy="35" r="5" fill="#B47F35" stroke="#ffffff" strokeWidth="1.5" />

                    <text x="40" y="185" fill="#8B5E34" fontSize="9" fontWeight="bold">Jan</text>
                    <text x="110" y="185" fill="#8B5E34" fontSize="9" fontWeight="bold">Feb</text>
                    <text x="180" y="185" fill="#8B5E34" fontSize="9" fontWeight="bold">Mar</text>
                    <text x="250" y="185" fill="#8B5E34" fontSize="9" fontWeight="bold">Apr</text>
                    <text x="320" y="185" fill="#8B5E34" fontSize="9" fontWeight="bold">May</text>
                    <text x="390" y="185" fill="#8B5E34" fontSize="9" fontWeight="bold">Jun</text>
                    <text x="460" y="185" fill="#8B5E34" fontSize="9" fontWeight="bold">Jul</text>
                  </svg>
                </div>
              </div>

              {/* Popular item distributions */}
              <div className="bg-white p-6 rounded-3xl border border-[#B47F35]/15 shadow-sm space-y-4 text-left">
                <div>
                  <h4 className="text-sm font-bold text-[#2B132C] uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-[#B47F35]" />
                    <span>Popular Food Category Performance</span>
                  </h4>
                  <p className="text-[11px] text-gray-400">Items distribution units sold</p>
                </div>
                
                {/* SVG bar chart */}
                <div className="h-56 relative w-full pt-4">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    <line x1="40" y1="10" x2="480" y2="10" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="85" x2="480" y2="85" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="160" x2="480" y2="160" stroke="#E5E3DF" strokeWidth="1.5" />
                    
                    {/* Mains bar */}
                    <rect x="70" y="50" width="35" height="110" fill="#C59D5F" rx="4" />
                    <text x="75" y="42" fill="#B47F35" fontSize="9" fontWeight="bold">280 unit</text>
                    <text x="72" y="180" fill="#8B5E34" fontSize="9" fontWeight="bold">Mains</text>

                    {/* Snacks bar */}
                    <rect x="160" y="70" width="35" height="90" fill="#8B5E34" rx="4" />
                    <text x="165" y="62" fill="#8B5E34" fontSize="9" fontWeight="bold">190 unit</text>
                    <text x="162" y="180" fill="#8B5E34" fontSize="9" fontWeight="bold">Snacks</text>

                    {/* Beverages bar */}
                    <rect x="250" y="90" width="35" height="70" fill="#C59D5F" rx="4" />
                    <text x="255" y="82" fill="#B47F35" fontSize="9" fontWeight="bold">110 unit</text>
                    <text x="245" y="180" fill="#8B5E34" fontSize="9" fontWeight="bold">Beverages</text>

                    {/* Desserts bar */}
                    <rect x="340" y="120" width="35" height="40" fill="#8B5E34" rx="4" />
                    <text x="348" y="112" fill="#8B5E34" fontSize="9" fontWeight="bold">60 unit</text>
                    <text x="336" y="180" fill="#8B5E34" fontSize="9" fontWeight="bold">Desserts</text>
                  </svg>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: STAFF TERMINAL ROLES (ROLE ASSIGNER) */}
        {activeTab === "staff" && (
          <motion.div
            key="staff-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Staff Accounts Table (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Authorized Staff Terminal Access</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full font-sans text-xs">
                  <thead>
                    <tr className="border-b border-[#B47F35]/15 text-left text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-3">Staff Name</th>
                      <th className="pb-3">Email Username</th>
                      <th className="pb-3">Plain Password</th>
                      <th className="pb-3">Terminal Role</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B47F35]/10">
                    {staffAccounts.map((account) => (
                      <tr key={account.id} className="text-left text-[#2B132C]">
                        <td className="py-3.5 font-semibold">{account.name}</td>
                        <td className="py-3.5 font-mono">{account.email}</td>
                        <td className="py-3.5 font-mono">{account.password}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            account.assignedRole === "manager" ? "bg-purple-100 text-purple-700" :
                            account.assignedRole === "receptionist" ? "bg-blue-100 text-blue-700" :
                            account.assignedRole === "cashier" ? "bg-green-100 text-green-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {account.assignedRole.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-bold">
                          {account.email !== "manager@swami.com" ? (
                            <button
                              onClick={() => handleRevokeStaff(account.id)}
                              className="text-[#B47F35] hover:text-red-500 transition-colors cursor-pointer"
                              title="Revoke Role Access"
                            >
                              Revoke Access
                            </button>
                          ) : (
                            <span className="text-gray-400 italic text-[10px]">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Role Assigner Form (4 cols) */}
            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-5 space-y-6 text-left h-full">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Assign Staff Role</span>
                </h3>

                <form onSubmit={handleAddStaffAccount} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Staff Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="e.g. Mukesh Patel"
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Email Username *
                    </label>
                    <input
                      type="email"
                      required
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="staff@swami.com"
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Login Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      placeholder="e.g. password123"
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Select Terminal Role *
                    </label>
                    <select
                      value={newStaffRole}
                      onChange={(e: any) => setNewStaffRole(e.target.value)}
                      className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs outline-none"
                    >
                      <option value="manager">Canteen Manager</option>
                      <option value="receptionist">Canteen Receptionist</option>
                      <option value="cashier">Cashier Desk</option>
                      <option value="kitchen">Kitchen Staff</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Role & Create</span>
                  </button>
                </form>

              </GlassCard>
            </div>

          </motion.div>
        )}

        {/* TAB 3: CUSTOMER USERS (DEVOTEES) */}
        {activeTab === "customers" && (
          <motion.div
            key="customers-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6"
          >
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Canteen Customer Users Directory</span>
              </h3>
              <p className="text-[10px] text-gray-400">Devotees who book food tables or purchase counter tokens</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full font-sans text-xs text-left">
                <thead>
                  <tr className="border-b border-[#B47F35]/15 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold pb-3">
                    <th className="pb-3">Devotee Name</th>
                    <th className="pb-3">Contact Phone</th>
                    <th className="pb-3">Visits & Check-ins</th>
                    <th className="pb-3">Lifetime Spent</th>
                    <th className="pb-3">Last Visit Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B47F35]/10">
                  {customers.map((c) => (
                    <tr key={c.id} className="text-[#2B132C]">
                      <td className="py-3.5 font-semibold">{c.name}</td>
                      <td className="py-3.5 font-mono">{c.phone}</td>
                      <td className="py-3.5 font-semibold">{c.totalOrders} visits</td>
                      <td className="py-3.5 font-bold text-[#B47F35]">UGX {c.totalSpent.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 text-secondary-bronze/80">{c.lastVisit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 4: COUNTER POS TICKET BOOKING */}
        {activeTab === "pos" && (
          <motion.div
            key="pos-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* POS FOOD PICKER (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4" />
                  <span>Select Food Items</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {foodMenu.filter(m=>m.category !== "Combos" && m.category !== "Add-ons").map((food) => (
                    <div 
                      key={food.id}
                      onClick={() => addToCart(food)}
                      className="bg-[#FAF7F2]/50 border border-primary-gold/15 p-4 rounded-xl flex flex-col justify-between text-left cursor-pointer hover:border-[#B47F35] hover:bg-[#B47F35]/5 transition-all shadow-sm select-none"
                    >
                      <div className="space-y-1">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase bg-[#B47F35]/10 text-[#B47F35]">
                          {food.variety} • {food.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#2B132C] mt-1.5">{food.name}</h4>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-primary-gold/10">
                        <span className="text-xs font-bold text-[#B47F35]">UGX {food.price}</span>
                        <span className="text-[10px] font-bold text-[#B47F35] hover:text-[#8B5E34]">
                          + Add to Cart
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeTicket && (
                <div className="bg-white border-2 border-green-500 rounded-3xl p-6 text-left relative shadow-xl">
                  <button 
                    onClick={() => setActiveTicket(null)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#B47F35]/15 flex items-center justify-center text-secondary-bronze cursor-pointer"
                  >
                    ✕
                  </button>
                  
                  <div className="flex items-center space-x-3 text-green-600 mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider">Offline Ticket Booked</h4>
                      <p className="text-[10px] text-secondary-bronze/70 font-sans">Payment processed and seat table allocated.</p>
                    </div>
                  </div>

                  <div id="canteen-receipt" className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-5 space-y-3 font-mono text-xs text-dark-surface/90">
                    <div className="text-center border-b border-[#B47F35]/15 pb-3">
                      <h3 className="font-bold text-sm tracking-wider uppercase">SKSS Kampala Canteen</h3>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>TOKEN NUMBER:</span>
                        <span className="font-bold text-base text-[#B47F35]">{activeTicket.tokenNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allocated Seating:</span>
                        <span className="font-bold">{activeTicket.tableName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Devotee Name:</span>
                        <span>{activeTicket.customerName}</span>
                      </div>
                    </div>

                    <div className="h-[1px] bg-[#B47F35]/15 my-2" />

                    <div className="space-y-1 text-[10px]">
                      {activeTicket.items.map((c, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{c.item.name} x {c.qty}</span>
                          <span>UGX {c.item.price * c.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div className="h-[1px] bg-[#B47F35]/15 my-2" />

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL AMOUNT:</span>
                        <span className="text-[#B47F35]">UGX {activeTicket.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Ticket Token</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* POS CRM CHECKOUT SIDEBAR (4 cols) */}
            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-5 space-y-6 text-left h-full flex flex-col justify-between">
                
                <div className="space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4" />
                    <span>POS Billing Order</span>
                  </h3>

                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-secondary-bronze/60 text-xs font-sans">
                      <Coffee className="w-8 h-8 text-[#B47F35]/30 mx-auto mb-2" />
                      <p>Cart is empty. Select food items to build an order.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                      {cart.map((c) => (
                        <div key={c.item.id} className="flex justify-between items-center text-xs font-sans">
                          <div className="text-left space-y-0.5">
                            <h4 className="font-bold text-[#2B132C]">{c.item.name}</h4>
                            <span className="text-[10px] text-secondary-bronze/65">UGX {c.item.price} each</span>
                          </div>
                          
                          <div className="flex items-center space-x-2.5">
                            <button 
                              onClick={() => updateCartQty(c.item.id, -1)}
                              className="w-5 h-5 rounded bg-[#FAF7F2] flex items-center justify-center font-bold text-secondary-bronze hover:bg-[#B47F35]/10 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-bold text-dark-surface w-4 text-center">{c.qty}</span>
                            <button 
                              onClick={() => updateCartQty(c.item.id, 1)}
                              className="w-5 h-5 rounded bg-[#FAF7F2] flex items-center justify-center font-bold text-secondary-bronze hover:bg-[#B47F35]/10 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 pt-3 border-t border-[#B47F35]/10">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">Cust Name</span>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Devotee name"
                          className="w-full px-2.5 py-1.5 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">Mobile</span>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+256..."
                          className="w-full px-2.5 py-1.5 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">Allocate Seating Table</span>
                      <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs outline-none font-semibold text-secondary-bronze"
                      >
                        <option value="">Counter Walk-in (No Table)</option>
                        {tables.map((t) => (
                          <option 
                            key={t.id} 
                            value={t.id} 
                            disabled={t.status !== "AVAILABLE"}
                          >
                            {t.name} ({t.capacity} Seats) - {t.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1.5">Payment Method</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["UPI", "CASH", "CARD"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethod(m as any)}
                            className={`py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                              paymentMethod === m 
                                ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                                : "border-primary-gold/15 bg-white text-secondary-bronze"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                <div className="pt-4 border-t border-[#B47F35]/10 mt-6 space-y-4">
                  <div className="space-y-1.5 text-xs text-secondary-bronze">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>UGX {cart.reduce((acc, c) => acc + c.item.price * c.qty, 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#2B132C] text-sm">
                      <span>Total Amount:</span>
                      <span className="text-[#B47F35] font-heading">
                        UGX {(cart.reduce((acc, c) => acc + c.item.price * c.qty, 0) + Math.round(cart.reduce((acc, c) => acc + c.item.price * c.qty, 0) * 0.075)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Generate Canteen Ticket</span>
                  </button>
                </div>

              </GlassCard>
            </div>

          </motion.div>
        )}

        {/* TAB 5: SEATING TABLES MANAGEMENT */}
        {activeTab === "tables" && (
          <motion.div
            key="tables-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            <div className="lg:col-span-8 bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4" />
                  <span>Canteen Table Layout Configuration</span>
                </h3>
                <div className="flex items-center gap-3">
                  {selectedTableIds.length > 0 && (
                    <button
                      onClick={handleBulkDeleteTables}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-bold transition-colors cursor-pointer border-none flex items-center gap-1 shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete Selected ({selectedTableIds.length})</span>
                    </button>
                  )}
                  <span className="text-[10px] text-secondary-bronze/70 font-sans">
                    Total Capacity: {tables.reduce((acc, t) => acc + t.capacity, 0)} Seats
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {tables.map((table) => (
                  <div 
                    key={table.id}
                    onClick={() => {
                      if (selectedTableIds.includes(table.id)) {
                        setSelectedTableIds((prev) => prev.filter((id) => id !== table.id));
                      } else {
                        setSelectedTableIds((prev) => [...prev, table.id]);
                      }
                    }}
                    className={`border rounded-2xl p-5 text-left flex flex-col justify-between space-y-4 shadow-sm transition-colors cursor-pointer relative ${
                      selectedTableIds.includes(table.id) ? "border-[#B47F35] ring-2 ring-[#B47F35]/30 bg-[#B47F35]/5 text-[#2B132C]" :
                      table.status === "AVAILABLE" ? "border-green-500/25 bg-green-500/5 text-green-700" :
                      table.status === "OCCUPIED" ? "border-red-500/25 bg-red-500/5 text-[#2B132C]" :
                      "border-[#B47F35]/30 bg-[#B47F35]/5 text-[#B47F35]"
                    }`}
                  >
                    <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedTableIds.includes(table.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTableIds((prev) => [...prev, table.id]);
                          } else {
                            setSelectedTableIds((prev) => prev.filter((id) => id !== table.id));
                          }
                        }}
                        className="cursor-pointer rounded border-[#B47F35]/35 text-[#B47F35] focus:ring-[#B47F35]"
                      />
                    </div>

                    <div className="flex justify-between items-start pr-6">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B132C]">{table.name}</h4>
                        <span className="text-[9px] text-secondary-bronze/80 font-sans mt-0.5 block">
                          Capacity: {table.capacity} Devotees
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(table.id);
                        }}
                        className="text-secondary-bronze/50 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-primary-gold/10">
                      <span className="text-[8px] font-bold uppercase block text-secondary-bronze/65">
                        Current Status
                      </span>
                      
                      <div className="grid grid-cols-3 gap-1">
                        {["AVAILABLE", "OCCUPIED", "RESERVED"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTableStatus(table.id, status as any);
                            }}
                            className={`py-1 rounded text-[7px] font-bold text-center cursor-pointer uppercase ${
                              table.status === status 
                                ? "bg-white shadow-sm border border-primary-gold/30 font-bold" 
                                : "opacity-60 hover:opacity-100"
                            }`}
                          >
                            {status.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-5 space-y-6 text-left h-full">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Seating Table</span>
                </h3>

                <form onSubmit={handleAddTable} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Table Label / Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      placeholder="e.g. Table 7 (Window Area)"
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Seating Capacity (Devotees) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newTableCapacity}
                      onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 4)}
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Table</span>
                  </button>
                </form>

              </GlassCard>
            </div>

          </motion.div>
        )}

        {/* TAB 6: FOOD MENU MANAGEMENT */}
        {activeTab === "menu" && (
          <motion.div
            key="menu-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            <div className="lg:col-span-8 bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" />
                  <span>Canteen Food Menu Customization</span>
                </h3>
                {selectedMenuIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteMenu}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-bold transition-colors cursor-pointer border-none flex items-center gap-1 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Selected ({selectedMenuIds.length})</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full font-sans text-xs">
                  <thead>
                    <tr className="border-b border-[#B47F35]/15 text-left text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-3 w-8">
                        <input
                          type="checkbox"
                          checked={foodMenu.length > 0 && selectedMenuIds.length === foodMenu.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMenuIds(foodMenu.map((f) => f.id));
                            } else {
                              setSelectedMenuIds([]);
                            }
                          }}
                          className="cursor-pointer rounded border-[#B47F35]/35 text-[#B47F35] focus:ring-[#B47F35]"
                        />
                      </th>
                      <th className="pb-3">Item Details</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Variety</th>
                      <th className="pb-3">Channel</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B47F35]/10">
                    {foodMenu.map((item) => (
                      <tr key={item.id} className="text-left text-[#2B132C]">
                        <td className="py-3.5 w-8">
                          <input
                            type="checkbox"
                            checked={selectedMenuIds.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMenuIds((prev) => [...prev, item.id]);
                              } else {
                                setSelectedMenuIds((prev) => prev.filter((id) => id !== item.id));
                              }
                            }}
                            className="cursor-pointer rounded border-[#B47F35]/35 text-[#B47F35] focus:ring-[#B47F35]"
                          />
                        </td>
                        <td className="py-3.5 font-semibold flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-primary-gold/10" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#B47F35]/10 flex items-center justify-center text-[9px] font-bold text-[#B47F35] uppercase">
                              {item.name.substring(0, 2)}
                            </div>
                          )}
                          <span>{item.name}</span>
                        </td>
                        <td className="py-3.5">{item.category}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            item.variety === "Jain" ? "bg-green-500/10 text-green-700" :
                            item.variety === "Spicy" ? "bg-red-500/10 text-red-650" :
                            "bg-[#B47F35]/10 text-[#B47F35]"
                          }`}>
                            {item.variety}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            item.channel === "both" ? "bg-purple-500/10 text-purple-700" :
                            item.channel === "e-com" ? "bg-blue-500/10 text-blue-700" :
                            "bg-amber-500/10 text-amber-700"
                          }`}>
                            {item.channel || "canteen"}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-[#B47F35]">UGX {item.price}</td>
                        <td className="py-3.5 text-right flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => {
                              setEditingFood(item);
                              setEditFoodName(item.name);
                              setEditFoodPrice(item.price);
                              setEditFoodCategory(item.category);
                              setEditFoodVariety(item.variety);
                              setEditFoodChannel(item.channel || "canteen");
                              setEditFoodImage(item.image || "");
                            }}
                            className="text-secondary-bronze/50 hover:text-[#B47F35] transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(item.id)}
                            className="text-secondary-bronze/50 hover:text-red-500 transition-colors cursor-pointer"
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

            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-5 space-y-6 text-left h-full">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Food Item</span>
                </h3>

                <form onSubmit={handleAddFood} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Food Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFoodName}
                      onChange={(e) => setNewFoodName(e.target.value)}
                      placeholder="e.g. Idli Sambar Platter"
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Price (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={newFoodPrice}
                      onChange={(e) => setNewFoodPrice(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                        Category
                      </label>
                      <select
                        value={newFoodCategory}
                        onChange={(e: any) => setNewFoodCategory(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                      >
                        {adminCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                        Variety
                      </label>
                      <select
                        value={newFoodVariety}
                        onChange={(e: any) => setNewFoodVariety(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Jain">Jain</option>
                        <option value="Spicy">Spicy</option>
                        <option value="Sweet">Sweet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Sales Channel
                    </label>
                    <select
                      value={newFoodChannel}
                      onChange={(e: any) => setNewFoodChannel(e.target.value)}
                      className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    >
                      <option value="canteen">Canteen Only</option>
                      <option value="e-com">E-Commerce Only</option>
                      <option value="both">Both (Canteen & E-Com)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Food Item Image
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e, false)}
                        className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                      />
                      {newFoodImage && (
                        <img src={newFoodImage} alt="Preview" className="w-8 h-8 rounded-lg object-cover border" />
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Food Item</span>
                  </button>
                </form>

              </GlassCard>
            </div>

            {/* Edit Food Item Modal Overlay */}
            {editingFood && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <GlassCard className="p-6 max-w-sm w-full space-y-4 shadow-2xl border border-primary-gold/20 animate-in fade-in zoom-in-95 duration-150 text-left">
                  <div className="flex justify-between items-start border-b border-[#B47F35]/15 pb-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#B47F35]">
                        Edit Food Item
                      </h4>
                      <p className="text-[10px] text-secondary-bronze/70 mt-0.5">
                        Modify menu item properties and sales channels.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingFood(null)}
                      className="text-secondary-bronze hover:text-black border-none bg-transparent cursor-pointer font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleEditFoodSubmit} className="space-y-4 font-sans text-xs">
                    <div>
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                        Food Item Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFoodName}
                        onChange={(e) => setEditFoodName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs font-sans text-[#2B132C] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                        Price (INR) *
                      </label>
                      <input
                        type="number"
                        required
                        min={10}
                        value={editFoodPrice}
                        onChange={(e) => setEditFoodPrice(parseInt(e.target.value) || 100)}
                        className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs font-sans text-[#2B132C] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                          Category
                        </label>
                        <select
                          value={editFoodCategory}
                          onChange={(e: any) => setEditFoodCategory(e.target.value)}
                          className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs font-sans text-[#2B132C] outline-none"
                        >
                          {adminCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                          Variety
                        </label>
                        <select
                          value={editFoodVariety}
                          onChange={(e: any) => setEditFoodVariety(e.target.value)}
                          className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs font-sans text-[#2B132C] outline-none"
                        >
                          <option value="Regular">Regular</option>
                          <option value="Jain">Jain</option>
                          <option value="Spicy">Spicy</option>
                          <option value="Sweet">Sweet</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                        Sales Channel
                      </label>
                      <select
                        value={editFoodChannel}
                        onChange={(e: any) => setEditFoodChannel(e.target.value as any)}
                        className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs font-sans text-[#2B132C] outline-none"
                      >
                        <option value="canteen">Canteen Only</option>
                        <option value="e-com">E-Commerce Only</option>
                        <option value="both">Both (Canteen & E-Com)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                        Food Item Image
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileChange(e, true)}
                          className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                        />
                        {editFoodImage && (
                          <img src={editFoodImage} alt="Preview" className="w-8 h-8 rounded-lg object-cover border" />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingFood(null)}
                        className="px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-gray-500 bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B47F35] hover:bg-[#8B5E34] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-none"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB: CANTEEN FOOD CATEGORIES */}
        {activeTab === "categories" && (
          <motion.div
            key="categories-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-8 bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                <span>Manage Food Categories</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full font-sans text-xs">
                  <thead>
                    <tr className="border-b border-[#B47F35]/15 text-left text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-3">Category Name</th>
                      <th className="pb-3">Date Added</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B47F35]/10">
                    {apiCategories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-secondary-bronze/65">
                          No custom categories found. Seed defaults are loaded in forms.
                        </td>
                      </tr>
                    ) : (
                      apiCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                          <td className="py-3.5 font-bold text-[#2B132C]">{cat.name}</td>
                          <td className="py-3.5 text-secondary-bronze">{new Date(cat.created_at).toLocaleDateString()}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => setEditingCategory({ id: cat.id, name: cat.name })}
                              className="p-1.5 text-blue-500 hover:text-blue-700 bg-transparent border-none cursor-pointer hover:bg-blue-50 rounded-lg transition-colors mr-1"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                  apiDeleteCategory(cat.id, {
                                    onError: (err: any) => {
                                      alert(err.response?.data?.message || err.message || "Failed to delete category");
                                    }
                                  });
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <GlassCard className="p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B47F35]">
                  Add Category
                </h4>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const data = new FormData(form);
                    const name = data.get("categoryName") as string;
                    if (!name?.trim()) return;

                    apiAddCategory(
                      { name: name.trim() },
                      {
                        onSuccess: () => {
                          form.reset();
                        },
                        onError: (err: any) => {
                          alert(err.response?.data?.message || err.message || "Failed to add category");
                        }
                      }
                    );
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block">
                      Category Name
                    </label>
                    <input
                      name="categoryName"
                      type="text"
                      required
                      placeholder="e.g. Cold Drinks, Platters..."
                      className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs outline-none focus:border-[#B47F35] focus:bg-white transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                </form>
              </GlassCard>
            </div>

            {/* Edit Category Modal Overlay */}
            {editingCategory && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <GlassCard className="p-6 max-w-sm w-full space-y-4 shadow-2xl border border-primary-gold/20 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-start border-b border-[#B47F35]/15 pb-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#B47F35]">
                        Rename Category
                      </h4>
                      <p className="text-[10px] text-secondary-bronze/70 mt-0.5">
                        Products under this category will update automatically.
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-secondary-bronze hover:text-black border-none bg-transparent cursor-pointer font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = new FormData(e.currentTarget).get("newName") as string;
                      if (!val?.trim()) return;
                      
                      apiUpdateCategory(
                        { id: editingCategory.id, name: val.trim() },
                        {
                          onSuccess: () => {
                            setEditingCategory(null);
                          },
                          onError: (err: any) => {
                            alert(err.response?.data?.message || err.message || "Failed to update category");
                          }
                        }
                      );
                    }}
                    className="space-y-4 text-left"
                  >
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block">
                        Category Name
                      </label>
                      <input
                        name="newName"
                        type="text"
                        required
                        defaultValue={editingCategory.name}
                        placeholder="Enter new category name..."
                        className="w-full p-2.5 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs outline-none focus:border-[#B47F35] focus:bg-white transition-all"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-3 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-gray-500 bg-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#B47F35] hover:bg-[#8B5E34] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-none"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 7: ACTIVE KITCHEN ORDERS & TOKENS QUEUE */}
        {activeTab === "orders" && (
          <motion.div
            key="orders-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4" />
              <span>Real-Time Kitchen Tokens & Food Dispatch</span>
            </h3>

            <div className="space-y-4 font-sans text-xs">
              {orders.length === 0 ? (
                <p className="py-12 text-center text-secondary-bronze/65">No tickets found in the queue.</p>
              ) : (
                orders.map((o) => (
                  <div 
                    key={o.id}
                    className={`border rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-6 items-stretch text-left transition-colors ${
                      o.status === "NEW" || o.status === "PREPARING" ? "border-[#B47F35]/25 bg-[#B47F35]/5" :
                      o.status === "COMPLETED" || o.status === "READY_TO_SERVE" ? "border-green-500/25 bg-green-500/5 opacity-80" :
                      "border-secondary-bronze/10 bg-[#FAF7F2] opacity-60"
                    }`}
                  >
                    <div className="space-y-3 md:w-1/3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-[#B47F35] font-mono">{o.tokenNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          o.status === "NEW" || o.status === "PREPARING" ? "bg-[#B47F35]/15 text-[#B47F35]" :
                          o.status === "COMPLETED" || o.status === "READY_TO_SERVE" ? "bg-green-500/10 text-green-700" :
                          "bg-secondary-bronze/20 text-secondary-bronze"
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-secondary-bronze">
                        <p className="font-bold text-[#2B132C]">{o.customerName}</p>
                        <p className="text-[10px]">Phone: {o.customerPhone}</p>
                        <p className="text-[10px]">Seat: {o.tableName}</p>
                      </div>
                    </div>

                    <div className="md:w-1/3 flex flex-col justify-center border-y md:border-y-0 md:border-x border-[#B47F35]/10 py-3 md:py-0 md:px-6">
                      <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-2">Items Ordered</span>
                      <ul className="space-y-1">
                        {o.items.map((i, idx) => (
                          <li key={idx} className="flex justify-between font-semibold">
                            <span>{i.item.name}</span>
                            <span>x {i.qty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="md:w-1/3 flex flex-col justify-between items-end">
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider block">Total paid</span>
                        <span className="text-base font-heading font-bold text-[#B47F35]">
                          UGX {o.total.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {(o.status === "NEW" || o.status === "PREPARING") && (
                        <div className="flex gap-2 w-full justify-end mt-4">
                          <button
                            onClick={() => updateOrderStatus(o.id, "CANCELLED")}
                            className="px-3.5 py-1.5 rounded-lg border border-red-500/35 text-red-650 hover:bg-red-50 text-[10px] font-bold uppercase cursor-pointer"
                          >
                            Cancel Token
                          </button>
                          <button
                            onClick={() => updateOrderStatus(o.id, "COMPLETED")}
                            className="px-3.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Served</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
