"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Users,
  Plus,
  Trash2,
  Check,
  ClipboardList,
  Utensils,
  DollarSign,
  Clock,
  CheckCircle2,
  Ticket,
  Printer,
  X,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  UserCheck,
  TrendingUp,
  BarChart3,
  Settings,
  AlertTriangle,
  Pencil,
  Search,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpDown,
  Download,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FoodItem, CanteenOrder, CanteenStaffAccount } from "@/data/canteen";
import {
  useOrders,
  useUpdateOrderStatus,
  useCustomers,
  useAddCustomer,
  useStaffList,
  useAddStaff,
  useUpdateStaff,
  useDeleteStaff,
  useMenu,
  useAddMenuItem,
  useEditMenuItem,
  useDeleteMenuItem,
  useBulkDeleteMenuItems,
  useCategories,
  useAddCategory,
  useDeleteCategory,
  useUpdateCategory,
  useCanteenSalesReport,
} from "@/lib/api/canteen";
import { exportTableToExcel, exportCanteenOrdersToExcel } from "@/lib/exportExcel";
import { printThermalReceipt, printA4Invoice } from "@/lib/printReceipt";
import { formatCurrency } from "@/lib/utils";
import * as XLSX from "xlsx";

type AdminCanteenTab = "overview" | "sales" | "orders" | "menu" | "categories" | "customers" | "staff";

export default function CanteenCRMPage() {
  const [activeTab, setActiveTab] = useState<AdminCanteenTab>("overview");

  // Admin auth check state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_access_token");
      setIsAdminLoggedIn(!!token);
    }
  }, []);

  // ─── API Query Hooks ────────────────────────────────────────────────────────
  const { data: apiMenu = [], refetch: refetchMenu } = useMenu(undefined, { enabled: isAdminLoggedIn });
  const { data: apiCategories = [], refetch: refetchCategories } = useCategories({ enabled: isAdminLoggedIn });
  const { data: apiOrders = [], isLoading: isOrdersLoading, refetch: refetchOrders } = useOrders(undefined, { enabled: isAdminLoggedIn });
  const { data: apiCustomers, refetch: refetchCustomers } = useCustomers(undefined, { enabled: isAdminLoggedIn });
  const { data: apiStaffList = [], isLoading: isStaffLoading, refetch: refetchStaff } = useStaffList({ enabled: isAdminLoggedIn });

  // ─── API Mutations ──────────────────────────────────────────────────────────
  const { mutate: apiUpdateOrderStatus } = useUpdateOrderStatus();
  const { mutateAsync: apiAddStaffAsync } = useAddStaff();
  const { mutateAsync: apiUpdateStaffAsync } = useUpdateStaff();
  const { mutateAsync: apiDeleteStaffAsync } = useDeleteStaff();
  const { mutate: apiAddMenuItem } = useAddMenuItem();
  const { mutate: apiEditMenuItem } = useEditMenuItem();
  const { mutate: apiDeleteMenuItem } = useDeleteMenuItem();
  const { mutate: apiBulkDeleteMenuItems } = useBulkDeleteMenuItems();
  const { mutate: apiAddCategory } = useAddCategory();
  const { mutate: apiDeleteCategory } = useDeleteCategory();
  const { mutate: apiUpdateCategory } = useUpdateCategory();

  // ─── Sales Report Date Presets & State ──────────────────────────────────────
  const [salesDatePreset, setSalesDatePreset] = useState<"today" | "yesterday" | "week" | "month" | "custom" | "all">("today");
  const [salesCustomStart, setSalesCustomStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [salesCustomEnd, setSalesCustomEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startOfMonthStr = startOfMonth.toISOString().slice(0, 10);

  let queryStartDate: string | undefined = todayStr;
  let queryEndDate: string | undefined = todayStr;

  if (salesDatePreset === "today") {
    queryStartDate = todayStr;
    queryEndDate = todayStr;
  } else if (salesDatePreset === "yesterday") {
    queryStartDate = yesterdayStr;
    queryEndDate = yesterdayStr;
  } else if (salesDatePreset === "week") {
    queryStartDate = sevenDaysAgoStr;
    queryEndDate = todayStr;
  } else if (salesDatePreset === "month") {
    queryStartDate = startOfMonthStr;
    queryEndDate = todayStr;
  } else if (salesDatePreset === "custom") {
    queryStartDate = salesCustomStart;
    queryEndDate = salesCustomEnd;
  } else {
    queryStartDate = undefined;
    queryEndDate = undefined;
  }

  const { data: salesReport, isLoading: isSalesLoading, refetch: refetchSalesReport } = useCanteenSalesReport(queryStartDate, queryEndDate);

  const salesSummary = salesReport?.summary || {
    totalOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
    grossRevenue: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    serviceCharge: 0,
    averageOrderValue: 0,
    totalItemsSold: 0,
    uniqueCustomers: 0,
  };

  const paymentMethods = salesReport?.paymentMethods || {
    CASH: { count: 0, revenue: 0 },
    CARD: { count: 0, revenue: 0 },
    UPI: { count: 0, revenue: 0 },
  };

  const [salesItemSort, setSalesItemSort] = useState<"revenue" | "qty">("revenue");
  const sortedItemSales = [...(salesReport?.itemSales || [])].sort((a, b) =>
    salesItemSort === "revenue" ? b.revenue - a.revenue : b.quantity - a.quantity
  );

  // ─── Orders Report State ───────────────────────────────────────────────────
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersDateFilter, setOrdersDateFilter] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>("ALL");
  const [ordersSortOrder, setOrdersSortOrder] = useState<"desc" | "asc">("desc");

  const mappedOrders: CanteenOrder[] = apiOrders.map((o) => ({
    id: o.id,
    tokenNumber: o.token_number,
    customerName: o.customer_name,
    customerPhone: o.customer_phone ?? "N/A",
    tableName: o.table_name || "Counter",
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
    paymentMethod: o.payment_method === "PENDING" ? "UPI" : (o.payment_method as any),
    paymentStatus: o.payment_status === "PAID" ? "PAID" : "PENDING",
    status: o.order_status as any,
    timestamp: o.ordered_at
      ? new Date(o.ordered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "—",
    date: o.ordered_at ? new Date(o.ordered_at).toISOString().split("T")[0] : "—",
    createdAtMs: o.ordered_at ? new Date(o.ordered_at).getTime() : 0,
  }));

  const filteredOrders = mappedOrders
    .filter((o) => {
      const matchSearch =
        o.tokenNumber.toLowerCase().includes(ordersSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(ordersSearch.toLowerCase()) ||
        o.customerPhone.includes(ordersSearch) ||
        o.tableName.toLowerCase().includes(ordersSearch.toLowerCase());
      const matchDate = !ordersDateFilter || o.date === ordersDateFilter;
      const matchStatus = ordersStatusFilter === "ALL" || o.status === ordersStatusFilter;
      return matchSearch && matchDate && matchStatus;
    })
    .sort((a, b) => {
      const timeA = a.createdAtMs ?? 0;
      const timeB = b.createdAtMs ?? 0;
      return ordersSortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  // ─── Staff Terminal Roles State & Modals ────────────────────────────────────
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    assignedRole: "receptionist" as "manager" | "receptionist" | "cashier" | "kitchen",
  });

  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);

  const handleOpenAddStaff = () => {
    setStaffForm({
      name: "",
      email: "",
      password: "",
      assignedRole: "receptionist",
    });
    setShowAddStaffModal(true);
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.password) {
      alert("Please fill out staff name, email, and password.");
      return;
    }

    setIsStaffSubmitting(true);
    try {
      await apiAddStaffAsync({
        name: staffForm.name.trim(),
        email: staffForm.email.trim(),
        password: staffForm.password,
        assignedRole: staffForm.assignedRole,
      });
      setShowAddStaffModal(false);
      alert(`Staff member "${staffForm.name}" created and assigned ${staffForm.assignedRole.toUpperCase()} role.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to create staff account");
    } finally {
      setIsStaffSubmitting(false);
    }
  };

  const handleOpenEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setStaffForm({
      name: staff.name,
      email: staff.email,
      password: "",
      assignedRole: staff.assigned_role || "receptionist",
    });
    setShowEditStaffModal(true);
  };

  const handleEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setIsStaffSubmitting(true);
    try {
      const updates: any = {
        name: staffForm.name.trim(),
        assignedRole: staffForm.assignedRole,
      };
      if (staffForm.password && staffForm.password.trim().length >= 6) {
        updates.password = staffForm.password.trim();
      }

      await apiUpdateStaffAsync({
        id: Number(editingStaff.id),
        updates,
      });

      setShowEditStaffModal(false);
      setEditingStaff(null);
      alert(`Staff account "${staffForm.name}" updated successfully.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to update staff account");
    } finally {
      setIsStaffSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staff: any) => {
    if (confirm(`Are you sure you want to delete staff terminal access for "${staff.name}" (${staff.email})?`)) {
      try {
        await apiDeleteStaffAsync(Number(staff.id));
        alert(`Staff account "${staff.name}" deleted.`);
      } catch (err: any) {
        alert(err?.response?.data?.message || err?.message || "Failed to delete staff account");
      }
    }
  };

  // ─── Menu Items Form State ─────────────────────────────────────────────────
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodPrice, setNewFoodPrice] = useState<number>(100);
  const [newFoodCategory, setNewFoodCategory] = useState<string>("Mains");
  const [newFoodVariety, setNewFoodVariety] = useState<"Regular" | "Jain" | "Spicy" | "Sweet">("Regular");
  const [newFoodChannel, setNewFoodChannel] = useState<"canteen" | "e-com" | "both">("canteen");
  const [newFoodImage, setNewFoodImage] = useState<string>("");

  const [editingFood, setEditingFood] = useState<any | null>(null);
  const [editFoodName, setEditFoodName] = useState("");
  const [editFoodPrice, setEditFoodPrice] = useState<number>(100);
  const [editFoodCategory, setEditFoodCategory] = useState("");
  const [editFoodVariety, setEditFoodVariety] = useState<"Regular" | "Jain" | "Spicy" | "Sweet">("Regular");
  const [editFoodChannel, setEditFoodChannel] = useState<"canteen" | "e-com" | "both">("canteen");
  const [editFoodImage, setEditFoodImage] = useState<string>("");

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
    if (confirm("Are you sure you want to delete this menu item?")) {
      apiDeleteMenuItem(id);
    }
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
      },
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

  // ─── Categories Management State ───────────────────────────────────────────
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string } | null>(null);

  // ─── Export Sales Report Functions ─────────────────────────────────────────
  const handleExportSalesExcel = () => {
    if (!salesReport) {
      alert("No report data loaded to export.");
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Financial Summary
    const summaryRows = [
      { Metric: "Period Preset", Value: salesDatePreset.toUpperCase() },
      { Metric: "Date Range", Value: `${queryStartDate || "All Time"} to ${queryEndDate || "All Time"}` },
      { Metric: "Gross Sales Revenue (UGX)", Value: salesSummary.grossRevenue },
      { Metric: "Total Net Subtotal (UGX)", Value: salesSummary.subtotal },
      { Metric: "Total Discounts Given (UGX)", Value: salesSummary.discount },
      { Metric: "Total Tax Collected (UGX)", Value: salesSummary.tax },
      { Metric: "Total Orders Count", Value: salesSummary.totalOrders },
      { Metric: "Total Paid Orders", Value: salesSummary.paidOrders },
      { Metric: "Total Cancelled Orders", Value: salesSummary.cancelledOrders },
      { Metric: "Total Dishes Sold", Value: salesSummary.totalItemsSold },
      { Metric: "Average Order Ticket (UGX)", Value: Math.round(salesSummary.averageOrderValue) },
      { Metric: "Cash Collections (UGX)", Value: paymentMethods.CASH?.revenue || 0 },
      { Metric: "Card Collections (UGX)", Value: paymentMethods.CARD?.revenue || 0 },
      { Metric: "UPI / Digital Collections (UGX)", Value: paymentMethods.UPI?.revenue || 0 },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary["!cols"] = [{ wch: 32 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Financial Summary");

    // Sheet 2: Item Sales
    if (salesReport.itemSales?.length > 0) {
      const itemRows = salesReport.itemSales.map((it, idx) => ({
        Rank: idx + 1,
        "Dish Name": it.name,
        "Portions Sold": it.quantity,
        "Unit Price (UGX)": it.unitPrice,
        "Total Revenue (UGX)": it.revenue,
      }));
      const wsItems = XLSX.utils.json_to_sheet(itemRows);
      wsItems["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, wsItems, "Top Selling Dishes");
    }

    // Sheet 3: Orders Ledger
    if (salesReport.orders?.length > 0) {
      const orderRows = salesReport.orders.map((o) => ({
        "Token No": o.tokenNumber,
        "Order ID": o.id,
        Date: o.date,
        Time: o.time,
        "Devotee Name": o.customerName,
        Phone: o.customerPhone,
        Table: o.tableName,
        "Total Amount (UGX)": o.total,
        "Payment Method": o.paymentMethod,
        "Payment Status": o.paymentStatus,
        "Order Status": o.orderStatus,
      }));
      const wsOrders = XLSX.utils.json_to_sheet(orderRows);
      wsOrders["!cols"] = [
        { wch: 12 },
        { wch: 14 },
        { wch: 12 },
        { wch: 12 },
        { wch: 25 },
        { wch: 16 },
        { wch: 15 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, wsOrders, "Orders Ledger");
    }

    XLSX.writeFile(wb, `Canteen_Sales_Report_${salesDatePreset}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportSalesText = () => {
    const timestamp = new Date().toLocaleString();
    const periodLabel =
      salesDatePreset === "today"
        ? `Today (${todayStr})`
        : salesDatePreset === "yesterday"
        ? `Yesterday (${yesterdayStr})`
        : salesDatePreset === "week"
        ? `Last 7 Days (${sevenDaysAgoStr} to ${todayStr})`
        : salesDatePreset === "month"
        ? `This Month (${startOfMonthStr} to ${todayStr})`
        : salesDatePreset === "custom"
        ? `Custom (${salesCustomStart} to ${salesCustomEnd})`
        : "All Time";

    let t = `=================================================\n`;
    t += `      TEMPLE CANTEEN ADMIN SALES AUDIT REPORT     \n`;
    t += `=================================================\n`;
    t += `Period       : ${periodLabel}\n`;
    t += `Generated At : ${timestamp}\n`;
    t += `-------------------------------------------------\n\n`;

    t += `1. FINANCIAL & SALES METRICS:\n`;
    t += `-------------------------------------------------\n`;
    t += `Gross Sales Revenue : ${formatCurrency(salesSummary.grossRevenue)}\n`;
    t += `Total Net Subtotal  : ${formatCurrency(salesSummary.subtotal)}\n`;
    t += `Total Discounts     : ${formatCurrency(salesSummary.discount)}\n`;
    t += `Total Tax Collected : ${formatCurrency(salesSummary.tax)}\n`;
    t += `Total Orders Count  : ${salesSummary.totalOrders} (${salesSummary.paidOrders} Paid, ${salesSummary.cancelledOrders} Cancelled)\n`;
    t += `Total Items Sold    : ${salesSummary.totalItemsSold} dishes\n`;
    t += `Average Order Value : ${formatCurrency(Math.round(salesSummary.averageOrderValue))}\n\n`;

    t += `2. PAYMENT METHOD RECONCILIATION:\n`;
    t += `-------------------------------------------------\n`;
    t += `Cash Collections    : ${formatCurrency(paymentMethods.CASH?.revenue || 0)} (${paymentMethods.CASH?.count || 0} receipts)\n`;
    t += `Card Collections    : ${formatCurrency(paymentMethods.CARD?.revenue || 0)} (${paymentMethods.CARD?.count || 0} receipts)\n`;
    t += `UPI / Digital       : ${formatCurrency(paymentMethods.UPI?.revenue || 0)} (${paymentMethods.UPI?.count || 0} receipts)\n\n`;

    t += `3. TOP SELLING DISHES:\n`;
    t += `-------------------------------------------------\n`;
    sortedItemSales.slice(0, 10).forEach((it, idx) => {
      t += `${(idx + 1).toString().padStart(2, " ")}. ${it.name.padEnd(25, " ")} | ${it.quantity.toString().padStart(4, " ")} sold | ${formatCurrency(it.revenue)}\n`;
    });
    t += `\n=================================================\n`;
    t += `             END OF AUDIT REPORT                 \n`;
    t += `=================================================\n`;

    const blob = new Blob([t], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Canteen_Admin_Sales_${salesDatePreset}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCanteenSales = mappedOrders
    .filter((o) => o.paymentStatus === "PAID" && o.status !== "CANCELLED")
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left font-poppins">
      {/* ─── Top Standalone Canteen POS Link Banner ───────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg shadow-blue-200 mb-2">
        <div className="space-y-1 text-left">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Launch Standalone Canteen POS Terminal (SaaS Desktop View)</span>
          </h2>
          <p className="text-xs text-blue-100 font-medium">
            Launch the live cashier checkout desk, bookings calendar, live table floor plan, KDS terminal, and stock ledger.
          </p>
        </div>
        <a
          href="/canteenPOS"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-white hover:bg-gray-50 text-blue-600 text-xs font-bold uppercase rounded-2xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-98"
        >
          <span>Launch POS Terminal</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* ─── Header Section & Clean Navigation Tabs ───────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Coffee className="w-6 h-6 text-[#B47F35]" />
            <span>Temple Canteen Admin Monitoring</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor real-time sales reports, order tickets ledger, menu catalog, and manage staff terminal roles.
          </p>
        </div>

        {/* Clean Admin Tab Toggles (Removed POS billing, seating layout, and kitchen queue) */}
        <div className="flex flex-wrap bg-white border border-slate-200 p-1 rounded-2xl shadow-xs gap-1">
          {[
            { id: "overview", label: "Overview Metrics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
            { id: "sales", label: "Sales Report", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: "orders", label: "Orders Report", icon: <ClipboardList className="w-3.5 h-3.5" /> },
            { id: "menu", label: "Menu Catalog", icon: <Coffee className="w-3.5 h-3.5" /> },
            { id: "categories", label: "Menu Categories", icon: <Ticket className="w-3.5 h-3.5" /> },
            { id: "customers", label: "Customer Users", icon: <Users className="w-3.5 h-3.5" /> },
            { id: "staff", label: "Staff Terminal Roles", icon: <UserCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminCanteenTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-[#B47F35] text-white shadow-sm"
                  : "text-slate-600 hover:text-[#B47F35] hover:bg-amber-50/50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Metric KPI Badges Card Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Gross Sales Revenue</p>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
              {formatCurrency(totalCanteenSales)}
            </h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Orders Registered</p>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
              {mappedOrders.length} Tickets
            </h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Staff Terminal Accounts</p>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
              {apiStaffList.length} Active Roles
            </h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center space-x-4 shadow-xs">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Menu Dishes Catalog</p>
            <h4 className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
              {apiMenu.length} Food Items
            </h4>
          </div>
        </div>
      </div>

      {/* ─── RENDER ACTIVE TABS ───────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Growth Chart */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-left">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#B47F35]" />
                    <span>Canteen Monthly Sales Growth</span>
                  </h4>
                  <p className="text-xs text-slate-400">Total monthly revenue progress (UGX)</p>
                </div>

                <div className="h-56 relative w-full pt-4">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    <line x1="40" y1="10" x2="480" y2="10" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="60" x2="480" y2="60" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="110" x2="480" y2="110" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="160" x2="480" y2="160" stroke="#E5E3DF" strokeWidth="1.5" />

                    <text x="5" y="15" fill="#B47F35" fontSize="10" fontWeight="bold">UGX 600k</text>
                    <text x="5" y="65" fill="#B47F35" fontSize="10" fontWeight="bold">UGX 400k</text>
                    <text x="5" y="115" fill="#B47F35" fontSize="10" fontWeight="bold">UGX 200k</text>

                    <path
                      d="M 50 150 Q 150 110 250 80 T 470 30"
                      fill="none"
                      stroke="#B47F35"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="150" r="5" fill="#2B132C" />
                    <circle cx="250" cy="80" r="5" fill="#2B132C" />
                    <circle cx="470" cy="30" r="5" fill="#2B132C" />
                  </svg>
                </div>
              </div>

              {/* Category Breakdown Chart */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-left">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-[#B47F35]" />
                    <span>Popular Food Category Performance</span>
                  </h4>
                  <p className="text-xs text-slate-400">Items distribution units sold</p>
                </div>

                <div className="h-56 relative w-full pt-4">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    <line x1="40" y1="10" x2="480" y2="10" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="85" x2="480" y2="85" stroke="#FAF7F2" strokeWidth="1" />
                    <line x1="40" y1="160" x2="480" y2="160" stroke="#E5E3DF" strokeWidth="1.5" />

                    <rect x="70" y="50" width="35" height="110" fill="#C59D5F" rx="4" />
                    <text x="75" y="42" fill="#B47F35" fontSize="10" fontWeight="bold">280 units</text>
                    <text x="72" y="180" fill="#8B5E34" fontSize="10" fontWeight="bold">Mains</text>

                    <rect x="160" y="70" width="35" height="90" fill="#8B5E34" rx="4" />
                    <text x="165" y="62" fill="#8B5E34" fontSize="10" fontWeight="bold">190 units</text>
                    <text x="162" y="180" fill="#8B5E34" fontSize="10" fontWeight="bold">Snacks</text>

                    <rect x="250" y="90" width="35" height="70" fill="#C59D5F" rx="4" />
                    <text x="255" y="82" fill="#B47F35" fontSize="10" fontWeight="bold">110 units</text>
                    <text x="245" y="180" fill="#8B5E34" fontSize="10" fontWeight="bold">Beverages</text>

                    <rect x="340" y="120" width="35" height="40" fill="#8B5E34" rx="4" />
                    <text x="348" y="112" fill="#8B5E34" fontSize="10" fontWeight="bold">60 units</text>
                    <text x="336" y="180" fill="#8B5E34" fontSize="10" fontWeight="bold">Desserts</text>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SALES & REVENUE REPORT (NEW LIVE REAL-TIME) */}
        {activeTab === "sales" && (
          <motion.div
            key="sales-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="space-y-6"
          >
            {/* Sales Header Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Canteen Sales & Revenue Report</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Live real-time aggregation from canteen_orders and items database
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => refetchSalesReport()}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSalesLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleExportSalesExcel}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel (.xlsx)</span>
                </button>

                <button
                  onClick={handleExportSalesText}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export Text (.txt)</span>
                </button>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 items-center">
                {[
                  { id: "today", label: "Today" },
                  { id: "yesterday", label: "Yesterday" },
                  { id: "week", label: "Last 7 Days" },
                  { id: "month", label: "This Month" },
                  { id: "custom", label: "Custom Range" },
                  { id: "all", label: "All Time" },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSalesDatePreset(preset.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      salesDatePreset === preset.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {salesDatePreset === "custom" && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>From:</span>
                    <input
                      type="date"
                      value={salesCustomStart}
                      onChange={(e) => setSalesCustomStart(e.target.value)}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <span>To:</span>
                    <input
                      type="date"
                      value={salesCustomEnd}
                      onChange={(e) => setSalesCustomEnd(e.target.value)}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sales KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Gross Sales Revenue</p>
                  <h4 className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                    {formatCurrency(salesSummary.grossRevenue)}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    Net: {formatCurrency(salesSummary.subtotal)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Orders Processed</p>
                  <h4 className="text-2xl font-bold text-slate-900 font-mono mt-1">
                    {salesSummary.totalOrders} Tickets
                  </h4>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">
                    {salesSummary.paidOrders} Paid • {salesSummary.cancelledOrders} Cancelled
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <ClipboardList className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Dishes / Items Sold</p>
                  <h4 className="text-2xl font-bold text-slate-900 font-mono mt-1">
                    {salesSummary.totalItemsSold} Portions
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Kitchen Volume Prepared</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Utensils className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Average Order Value</p>
                  <h4 className="text-2xl font-bold text-slate-900 font-mono mt-1">
                    {formatCurrency(Math.round(salesSummary.averageOrderValue))}
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Per Devotee Ticket</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Payment Methods Breakdown & Top Selling Items */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Payment Methods (4 cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Breakdown</h4>
                  <p className="text-xs text-slate-500 font-medium">Collections by tender type</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-emerald-950 text-xs">Cash Desk</h5>
                        <p className="text-xs text-emerald-700 font-semibold font-mono">
                          {paymentMethods.CASH?.count || 0} receipts
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-900 text-sm font-mono">
                      {formatCurrency(paymentMethods.CASH?.revenue || 0)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-blue-950 text-xs">Credit / Debit Card</h5>
                        <p className="text-xs text-blue-700 font-semibold font-mono">
                          {paymentMethods.CARD?.count || 0} receipts
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-900 text-sm font-mono">
                      {formatCurrency(paymentMethods.CARD?.revenue || 0)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-violet-100 text-violet-800 rounded-xl">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-violet-950 text-xs">UPI / Digital QR</h5>
                        <p className="text-xs text-violet-700 font-semibold font-mono">
                          {paymentMethods.UPI?.count || 0} receipts
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-violet-900 text-sm font-mono">
                      {formatCurrency(paymentMethods.UPI?.revenue || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Selling Items (8 cols) */}
              <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Selling Dishes</h4>
                    <p className="text-xs text-slate-500 font-medium">Ranked by revenue contribution</p>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSalesItemSort("revenue")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                        salesItemSort === "revenue" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      By Revenue
                    </button>
                    <button
                      onClick={() => setSalesItemSort("qty")}
                      className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                        salesItemSort === "qty" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      By Quantity
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  {sortedItemSales.length === 0 ? (
                    <p className="py-12 text-center text-slate-400 text-xs">No item sales recorded in this period.</p>
                  ) : (
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-xs pb-2">
                          <th className="pb-2 pl-2">#</th>
                          <th className="pb-2">Dish Name</th>
                          <th className="pb-2 text-center">Portions Sold</th>
                          <th className="pb-2">Unit Price</th>
                          <th className="pb-2 text-right pr-2">Revenue Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sortedItemSales.map((it, idx) => (
                          <tr key={it.name} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 pl-2 font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 font-bold text-slate-900">{it.name}</td>
                            <td className="py-2.5 text-center font-bold text-slate-800 font-mono">
                              {it.quantity} sold
                            </td>
                            <td className="py-2.5 font-semibold text-slate-600 font-mono">
                              UGX {Number(it.unitPrice).toLocaleString()}
                            </td>
                            <td className="py-2.5 text-right pr-2 font-bold text-emerald-600 font-mono">
                              {formatCurrency(it.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ORDERS REPORT (NEW LIVE REAL-TIME) */}
        {activeTab === "orders" && (
          <motion.div
            key="orders-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6"
          >
            {/* Orders Header & Search/Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <span>Real-Time Canteen Orders Register</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Live order tickets, invoice printing, status tracking, and multi-field filtering
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
                <button
                  onClick={() => refetchOrders()}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isOrdersLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => exportCanteenOrdersToExcel(filteredOrders, ordersDateFilter || "All_Dates")}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {["ALL", "NEW", "PREPARING", "READY_TO_SERVE", "COMPLETED", "CANCELLED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrdersStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ordersStatusFilter === status
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {status.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search token, name, phone..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none focus:bg-white font-medium text-slate-800"
                  />
                </div>

                <input
                  type="date"
                  value={ordersDateFilter}
                  onChange={(e) => setOrdersDateFilter(e.target.value)}
                  className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none text-slate-800 font-bold"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs pb-3">
                    <th className="pb-3 pl-2">Token No</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Devotee Customer</th>
                    <th className="pb-3">Table / Seat</th>
                    <th className="pb-3">Amount (UGX)</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                        No orders found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => {
                      const payBadge =
                        o.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200";

                      const orderStatusBadge =
                        o.status === "COMPLETED"
                          ? "bg-slate-100 text-slate-700"
                          : o.status === "READY_TO_SERVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : o.status === "PREPARING"
                          ? "bg-blue-50 text-blue-700"
                          : o.status === "CANCELLED"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-50 text-amber-700";

                      return (
                        <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 pl-2 font-bold text-slate-900 font-mono">{o.tokenNumber}</td>
                          <td className="py-3.5 text-slate-500 font-mono text-xs">
                            {o.date} • {o.timestamp}
                          </td>
                          <td className="py-3.5">
                            <p className="font-bold text-slate-900">{o.customerName}</p>
                            <span className="text-xs text-slate-400">{o.customerPhone}</span>
                          </td>
                          <td className="py-3.5 text-slate-600 font-semibold">{o.tableName}</td>
                          <td className="py-3.5 font-bold text-slate-900 font-mono">
                            UGX {Number(o.total).toLocaleString()}
                          </td>
                          <td className="py-3.5">
                            <span className={`text-xs font-bold px-2 py-0.5 border rounded-lg uppercase ${payBadge}`}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg uppercase ${orderStatusBadge}`}>
                              {o.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3.5 text-right pr-2 space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => printA4Invoice(o)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border-none cursor-pointer"
                              title="Print A4 Invoice"
                            >
                              📄 Invoice
                            </button>
                            <button
                              onClick={() => printThermalReceipt(o)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors border-none cursor-pointer inline-flex items-center gap-1 shadow-xs"
                              title="Print Thermal Slip"
                            >
                              <Printer className="w-3 h-3" /> Slip
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 4: FOOD MENU MANAGEMENT */}
        {activeTab === "menu" && (
          <motion.div
            key="menu-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Coffee className="w-4 h-4" />
                  <span>Canteen Food Menu Customization</span>
                </h3>
                {selectedMenuIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteMenu}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-none flex items-center gap-1 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedMenuIds.length})</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs pb-3">
                      <th className="pb-3 w-8">
                        <input
                          type="checkbox"
                          checked={apiMenu.length > 0 && selectedMenuIds.length === apiMenu.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMenuIds(apiMenu.map((f) => f.id));
                            } else {
                              setSelectedMenuIds([]);
                            }
                          }}
                          className="cursor-pointer rounded border-slate-300 text-blue-600"
                        />
                      </th>
                      <th className="pb-3">Item Details</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Variety</th>
                      <th className="pb-3">Channel</th>
                      <th className="pb-3">Price (UGX)</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apiMenu.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
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
                            className="cursor-pointer rounded border-slate-300 text-blue-600"
                          />
                        </td>
                        <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-700 uppercase">
                              {item.name.substring(0, 2)}
                            </div>
                          )}
                          <span>{item.name}</span>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-600">{item.category}</td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase ${
                              item.variety === "Jain"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.variety === "Spicy"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {item.variety || "Regular"}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold uppercase bg-slate-100 text-slate-700">
                            {item.channel || "canteen"}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-slate-900 font-mono">
                          UGX {Number(item.price).toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingFood(item);
                              setEditFoodName(item.name);
                              setEditFoodPrice(item.price);
                              setEditFoodCategory(item.category);
                              setEditFoodVariety((item.variety as any) || "Regular");
                              setEditFoodChannel((item.channel as any) || "canteen");
                              setEditFoodImage(item.image_url || "");
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit Menu Item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(item.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg cursor-pointer"
                            title="Delete Menu Item"
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

            {/* Add Food Form (4 cols) */}
            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Food Item</span>
                </h4>

                <form onSubmit={handleAddFood} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                      Food Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFoodName}
                      onChange={(e) => setNewFoodName(e.target.value)}
                      placeholder="e.g. Idli Sambar Platter"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                      Price (UGX) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={newFoodPrice}
                      onChange={(e) => setNewFoodPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Category</label>
                      <select
                        value={newFoodCategory}
                        onChange={(e) => setNewFoodCategory(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        {apiCategories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Variety</label>
                      <select
                        value={newFoodVariety}
                        onChange={(e: any) => setNewFoodVariety(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Jain">Jain</option>
                        <option value="Spicy">Spicy</option>
                        <option value="Sweet">Sweet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Image Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, false)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Food Item</span>
                  </button>
                </form>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* TAB 5: CANTEEN FOOD CATEGORIES */}
        {activeTab === "categories" && (
          <motion.div
            key="categories-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 text-left">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                <Ticket className="w-4 h-4" />
                <span>Manage Food Categories</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs pb-3">
                      <th className="pb-3">Category Name</th>
                      <th className="pb-3">Date Added</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apiCategories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-slate-400">
                          No custom categories found.
                        </td>
                      </tr>
                    ) : (
                      apiCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 font-bold text-slate-900">{cat.name}</td>
                          <td className="py-3.5 text-slate-500 font-mono">{new Date(cat.created_at).toLocaleDateString()}</td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => setEditingCategory({ id: cat.id, name: cat.name })}
                              className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg cursor-pointer"
                              title="Rename Category"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                  apiDeleteCategory(cat.id);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 rounded-lg cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Category Form (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <GlassCard className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B47F35]">
                  Add Food Category
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
                      }
                    );
                  }}
                  className="space-y-3.5"
                >
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                      Category Name
                    </label>
                    <input
                      name="categoryName"
                      type="text"
                      required
                      placeholder="e.g. Cold Drinks, Platters..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Category</span>
                  </button>
                </form>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* TAB 6: CUSTOMER CRM DIRECTORY */}
        {activeTab === "customers" && (
          <motion.div
            key="customers-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Canteen Customer Users CRM Directory</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Devotees who dining records and counter token purchases
                </p>
              </div>

              <button
                onClick={() => {
                  const exportData = (apiCustomers?.data || []).map((c) => ({
                    "Customer Name": c.name,
                    Phone: c.phone,
                    Email: c.email || "—",
                    "Customer Type": c.customer_type,
                    "Total Orders": c.total_orders,
                    "Lifetime Spend (UGX)": c.total_spent,
                    "Last Visit": c.last_visit ? new Date(c.last_visit).toLocaleDateString() : "Never",
                  }));
                  exportTableToExcel(exportData, "Devotee Customer Directory", "Canteen_Devotees");
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs pb-3">
                    <th className="pb-3 pl-2">Devotee Name</th>
                    <th className="pb-3">Contact Phone</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Customer Tier</th>
                    <th className="pb-3">Visits & Check-ins</th>
                    <th className="pb-3">Lifetime Spent (UGX)</th>
                    <th className="pb-3">Last Visit Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(apiCustomers?.data || []).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pl-2 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3.5 font-mono text-slate-700">{c.phone}</td>
                      <td className="py-3.5 font-mono text-slate-400">{c.email || "—"}</td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase ${
                            c.customer_type === "VIP"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {c.customer_type}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">{c.total_orders || 0} visits</td>
                      <td className="py-3.5 font-bold text-emerald-600 font-mono">
                        {formatCurrency(Number(c.total_spent || 0))}
                      </td>
                      <td className="py-3.5 text-slate-500 font-mono">
                        {c.last_visit ? new Date(c.last_visit).toLocaleDateString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 7: STAFF TERMINAL ROLES (FULLY DYNAMIC MYSQL CRUD) */}
        {activeTab === "staff" && (
          <motion.div
            key="staff-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Staff Accounts Table (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Authorized Staff Terminal Access Roles</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Live dynamic MySQL accounts with role-based POS terminal access
                  </p>
                </div>

                <button
                  onClick={handleOpenAddStaff}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border-none shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Staff Account</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs pb-3">
                      <th className="pb-3 pl-2">Staff Name</th>
                      <th className="pb-3">Email Username</th>
                      <th className="pb-3">Assigned Role</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Last Login</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apiStaffList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          No staff accounts found. Click "Add Staff Account" to create one.
                        </td>
                      </tr>
                    ) : (
                      apiStaffList.map((account) => {
                        const role = account.assigned_role || "receptionist";
                        const roleBadge =
                          role === "manager"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : role === "cashier"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : role === "kitchen"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200";

                        return (
                          <tr key={account.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 pl-2 font-bold text-slate-900">{account.name}</td>
                            <td className="py-3.5 font-mono text-slate-700">{account.email}</td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase ${roleBadge}`}>
                                {role.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                                Active
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-400 font-mono text-xs">
                              {account.last_login_at
                                ? new Date(account.last_login_at).toLocaleString()
                                : "Never"}
                            </td>
                            <td className="py-3.5 text-right pr-2 space-x-2">
                              <button
                                onClick={() => handleOpenEditStaff(account)}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-blue-200 inline-flex items-center gap-1"
                                title="Edit Staff Role or Password"
                              >
                                <Pencil className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(account)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer border border-red-200"
                                title="Delete Staff Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Add Role Card (4 cols) */}
            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-left">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Assign Staff Role</span>
                </h4>

                <form onSubmit={handleAddStaffSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                      Staff Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      placeholder="e.g. Mukesh Patel"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                      Email Username *
                    </label>
                    <input
                      type="email"
                      required
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      placeholder="staff@swami.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                      Login Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showStaffPassword ? "text" : "password"}
                        required
                        value={staffForm.password}
                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                        placeholder="Min 6 characters..."
                        className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
                        aria-label={showStaffPassword ? "Hide password" : "Show password"}
                        title={showStaffPassword ? "Hide password" : "Show password"}
                      >
                        {showStaffPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                      Select Terminal Role *
                    </label>
                    <select
                      value={staffForm.assignedRole}
                      onChange={(e: any) => setStaffForm({ ...staffForm, assignedRole: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="receptionist">Canteen Receptionist</option>
                      <option value="cashier">Cashier Desk</option>
                      <option value="kitchen">Kitchen Staff</option>
                      <option value="manager">Canteen Manager</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isStaffSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isStaffSubmitting ? "Creating..." : "Assign Role & Create"}</span>
                  </button>
                </form>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MODAL 1: ADD STAFF ACCOUNT OVERLAY ───────────────────────────── */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Create Staff Terminal Account</span>
              </h3>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Login Email *</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="staff@swami.com"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Password *</label>
                <div className="relative">
                  <input
                    type={showStaffPassword ? "text" : "password"}
                    required
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Min 6 characters..."
                    className="w-full p-2.5 pr-9 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
                    aria-label={showStaffPassword ? "Hide password" : "Show password"}
                    title={showStaffPassword ? "Hide password" : "Show password"}
                  >
                    {showStaffPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Terminal Role *</label>
                <select
                  value={staffForm.assignedRole}
                  onChange={(e: any) => setStaffForm({ ...staffForm, assignedRole: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold"
                >
                  <option value="receptionist">Canteen Receptionist</option>
                  <option value="cashier">Cashier Desk</option>
                  <option value="kitchen">Kitchen Staff</option>
                  <option value="manager">Canteen Manager</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isStaffSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isStaffSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: EDIT STAFF ACCOUNT OVERLAY ──────────────────────────── */}
      {showEditStaffModal && editingStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-blue-600" />
                <span>Edit Staff Member: {editingStaff.name}</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditStaffModal(false);
                  setEditingStaff(null);
                }}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditStaffSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 block mb-1">Login Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={staffForm.email}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-xs font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                  Reset Password (No old password needed — leave blank to keep unchanged)
                </label>
                <div className="relative">
                  <input
                    type={showStaffPassword ? "text" : "password"}
                    value={staffForm.password}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Enter new password (min 6 chars)..."
                    className="w-full p-2.5 pr-9 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
                    aria-label={showStaffPassword ? "Hide password" : "Show password"}
                    title={showStaffPassword ? "Hide password" : "Show password"}
                  >
                    {showStaffPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Assigned Terminal Role *</label>
                <select
                  value={staffForm.assignedRole}
                  onChange={(e: any) => setStaffForm({ ...staffForm, assignedRole: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold"
                >
                  <option value="receptionist">Canteen Receptionist</option>
                  <option value="cashier">Cashier Desk</option>
                  <option value="kitchen">Kitchen Staff</option>
                  <option value="manager">Canteen Manager</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditStaffModal(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isStaffSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isStaffSubmitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: EDIT FOOD MENU ITEM OVERLAY ─────────────────────────── */}
      {editingFood && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#B47F35]" />
                <span>Edit Food Item</span>
              </h3>
              <button
                onClick={() => setEditingFood(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditFoodSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={editFoodName}
                  onChange={(e) => setEditFoodName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Price (UGX) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={editFoodPrice}
                  onChange={(e) => setEditFoodPrice(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Category</label>
                  <select
                    value={editFoodCategory}
                    onChange={(e) => setEditFoodCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
                  >
                    {apiCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Variety</label>
                  <select
                    value={editFoodVariety}
                    onChange={(e: any) => setEditFoodVariety(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Jain">Jain</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Sweet">Sweet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">Replace Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e, true)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                {editFoodImage && (
                  <img src={editFoodImage} alt="Preview" className="w-12 h-12 rounded-xl object-cover border mt-2" />
                )}
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFood(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B47F35] hover:bg-[#8B5E34] text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: EDIT CATEGORY OVERLAY ───────────────────────────────── */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#B47F35]">
                Rename Food Category
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
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
                  }
                );
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-xs font-bold uppercase text-slate-600 block mb-1">
                  Category Name
                </label>
                <input
                  name="newName"
                  type="text"
                  required
                  defaultValue={editingCategory.name}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B47F35] hover:bg-[#8B5E34] text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
