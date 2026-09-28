"use client";

import React, { useState, useEffect } from "react";
import {
  useRequisitions,
  useCreateRequisition,
} from "@/lib/api/requisitions";
import { adminListShopkeepers, ShopkeeperItem } from "@/lib/shopkeeperApi";
import { StoreRequisition, StoreRequisitionItem, CreateRequisitionItemDto } from "@/types/requisition.types";
import { GlassCard } from "@/components/ui/GlassCard";
import { exportRequisitionsToExcel, exportSingleRequisitionToExcel } from "@/lib/exportExcel";
import { exportRequisitionToBWPDF } from "@/lib/requisitionPdf";
import RequisitionReceiptModal from "@/components/requisition/RequisitionReceiptModal";
import axios from "axios";
import { setStaffTokens } from "@/lib/authStorage";
import { resetStaffSession } from "@/lib/apiClient";
import {
  ClipboardList,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Store,
  X,
  Loader2,
  Send,
  Boxes,
  Sparkles,
  AlertCircle,
  FileText,
  Building2,
  ArrowRight,
  FileSpreadsheet,
  Download,
  Lock,
  ShieldAlert,
  KeyRound,
  UserCheck,
  Printer,
  Receipt,
  Edit3,
  FileCheck,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";

const COMMON_CANTEEN_ITEMS = [
  { name: "Basmati Rice (25kg Bag)", category: "Grains & Rice", unit: "bags" },
  { name: "Wheat Flour / Atta (25kg Bag)", category: "Flour & Grains", unit: "bags" },
  { name: "Pure Cow Ghee (5L Tin)", category: "Dairy & Ghee", unit: "tins" },
  { name: "Refined White Sugar (50kg Bag)", category: "Sugar & Sweeteners", unit: "bags" },
  { name: "Toor Dal (25kg Bag)", category: "Pulses & Dal", unit: "bags" },
  { name: "Moong Dal (25kg Bag)", category: "Pulses & Dal", unit: "bags" },
  { name: "Sunflower Cooking Oil (20L Jerrycan)", category: "Cooking Oils", unit: "jerrycans" },
  { name: "Fresh Cow Milk (Liters)", category: "Dairy & Ghee", unit: "liters" },
  { name: "Fresh Paneer (kg)", category: "Dairy & Ghee", unit: "kg" },
  { name: "Green Cardamom / Elaichi (1kg Pack)", category: "Spices", unit: "packets" },
  { name: "Cloves / Lavang (500g Pack)", category: "Spices", unit: "packets" },
  { name: "Cumin Seeds / Jeera (2kg Pack)", category: "Spices", unit: "packets" },
  { name: "Black Pepper Whole (1kg Pack)", category: "Spices", unit: "packets" },
  { name: "Turmeric Powder (2kg Pack)", category: "Spices", unit: "packets" },
  { name: "Red Chili Powder (2kg Pack)", category: "Spices", unit: "packets" },
  { name: "Potatoes (50kg Sack)", category: "Vegetables", unit: "sacks" },
  { name: "Onions (50kg Sack)", category: "Vegetables", unit: "sacks" },
  { name: "Paper Meal Plates (100 pcs pack)", category: "Packaging & Disposables", unit: "packets" },
  { name: "Hot Drink Paper Cups (100 pcs pack)", category: "Packaging & Disposables", unit: "packets" },
  { name: "Heavy Duty Kitchen Cleaning Liquid (5L)", category: "Cleaning & Hygiene", unit: "cans" },
];

export default function CanteenRequisitionsView({
  requesterName = "Canteen Manager",
  requesterId,
  requesterRole = "CANTEEN_MANAGER",
  isAdminMode = false,
  onSwitchToManager,
}: {
  requesterName?: string;
  requesterId?: string;
  requesterRole?: string;
  isAdminMode?: boolean;
  onSwitchToManager?: () => void;
}) {
  const [localAdminMode, setLocalAdminMode] = useState(isAdminMode);
  const [currentRequesterName, setCurrentRequesterName] = useState(requesterName);

  // Sync prop changes
  useEffect(() => {
    setLocalAdminMode(isAdminMode);
  }, [isAdminMode]);

  useEffect(() => {
    setCurrentRequesterName(requesterName);
  }, [requesterName]);

  // Quick Manager Login Modal State
  const [showManagerRequiredModal, setShowManagerRequiredModal] = useState(false);
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [managerLoginError, setManagerLoginError] = useState("");
  const [isLoggingInManager, setIsLoggingInManager] = useState(false);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: requisitions = [], isLoading, refetch } = useRequisitions({
    department: "CANTEEN",
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  const createMutation = useCreateRequisition();
  const [shopkeepers, setShopkeepers] = useState<ShopkeeperItem[]>([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState<StoreRequisition | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptReq, setReceiptReq] = useState<StoreRequisition | null>(null);

  // Create Form State
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [targetShopkeeperType, setTargetShopkeeperType] = useState<"MANUAL" | "REGISTERED">("MANUAL");
  const [targetShopkeeperId, setTargetShopkeeperId] = useState("");
  const [targetShopkeeperName, setTargetShopkeeperName] = useState("");
  const [targetShopkeeperEmail, setTargetShopkeeperEmail] = useState("");
  const [targetShopkeeperPhone, setTargetShopkeeperPhone] = useState("");
  const [targetStoreName, setTargetStoreName] = useState("Main Temple Provisions & Grocery Store");
  const [requesterNotes, setRequesterNotes] = useState("");
  const [itemsList, setItemsList] = useState<CreateRequisitionItemDto[]>([
    { item_name: "Basmati Rice (25kg Bag)", category: "Grains & Rice", unit: "bags", requested_qty: 2, unit_price: 120000, total_price: 240000 },
    { item_name: "Pure Cow Ghee (5L Tin)", category: "Dairy & Ghee", unit: "tins", requested_qty: 3, unit_price: 95000, total_price: 285000 },
  ]);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Grand Total calculation
  const grandTotal = itemsList.reduce((acc, item) => {
    const q = Number(item.requested_qty) || 0;
    const p = Number(item.unit_price) || 0;
    const line = item.total_price !== undefined ? Number(item.total_price) : q * p;
    return acc + line;
  }, 0);

  const handleManagerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManagerLoginError("");
    if (!managerEmail || !managerPassword) {
      setManagerLoginError("Please enter manager email and password.");
      return;
    }

    try {
      setIsLoggingInManager(true);
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";
      const response = await axios.post(`${BASE_URL}/canteen/auth/login`, {
        email: managerEmail.trim().toLowerCase(),
        password: managerPassword,
      });

      if (response.data && response.data.data) {
        const { accessToken, refreshToken, staff } = response.data.data;
        setStaffTokens(accessToken, refreshToken);
        resetStaffSession();

        if (typeof window !== "undefined") {
          localStorage.setItem("canteen_is_logged_in", "true");
          localStorage.setItem("canteen_role", staff.assignedRole);
          localStorage.setItem("canteen_user_name", staff.name);
          localStorage.setItem("canteen_user_email", staff.email);
          localStorage.setItem(
            "canteen_active_staff",
            JSON.stringify({
              id: `staff-${staff.id}`,
              name: staff.name,
              email: staff.email,
              assignedRole: staff.assignedRole,
              isAdmin: false,
              createdAt: new Date().toISOString().split("T")[0],
            })
          );
        }

        setLocalAdminMode(false);
        setCurrentRequesterName(staff.name);
        setShowManagerRequiredModal(false);
        setManagerEmail("");
        setManagerPassword("");
        setFeedbackToast(`👨‍💼 Authenticated as ${staff.name} (Canteen Manager). Requisition form unlocked!`);
        setShowCreateModal(true);
        if (onSwitchToManager) onSwitchToManager();
        refetch();
        setTimeout(() => setFeedbackToast(null), 5000);
      } else {
        setManagerLoginError("Invalid Canteen Manager credentials.");
      }
    } catch (err: any) {
      setManagerLoginError(err?.response?.data?.message || "Manager authentication failed.");
    } finally {
      setIsLoggingInManager(false);
    }
  };

  const handleNewRequestClick = () => {
    if (localAdminMode) {
      setShowManagerRequiredModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  // Load registered shopkeepers for dropdown
  useEffect(() => {
    adminListShopkeepers()
      .then((data) => {
        const active = data.filter((s) => s.status === "ACTIVE");
        setShopkeepers(active);
        // By default, manual storekeeper is selected (do not overwrite with registered storekeeper)
      })
      .catch((err) => console.error("Failed to load shopkeepers", err));
  }, []);

  const handleShopkeeperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "MANUAL") {
      setTargetShopkeeperType("MANUAL");
      setTargetShopkeeperId("");
    } else {
      setTargetShopkeeperType("REGISTERED");
      setTargetShopkeeperId(val);
      const found = shopkeepers.find((s) => s.id === val);
      if (found) {
        setTargetShopkeeperName(found.name);
        setTargetShopkeeperEmail(found.email);
        setTargetShopkeeperPhone(found.phone || "");
        setTargetStoreName(found.store_name || "Main Temple Provisions Store");
      }
    }
  };

  const handleAddItemRow = () => {
    setItemsList([
      ...itemsList,
      { item_name: "", category: "General Grocery", unit: "kg", requested_qty: 1, unit_price: 0, total_price: 0 },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (itemsList.length <= 1) return;
    setItemsList(itemsList.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateRequisitionItemDto, val: any) => {
    setItemsList((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const updated = { ...item, [field]: val };
          const qty = field === "requested_qty" ? (Number(val) || 0) : (Number(updated.requested_qty) || 0);
          const price = field === "unit_price" ? (Number(val) || 0) : (Number(updated.unit_price) || 0);
          updated.total_price = Math.round(qty * price * 100) / 100;
          return updated;
        }
        return item;
      })
    );
  };

  const handleSelectQuickItem = (index: number, commonName: string) => {
    const found = COMMON_CANTEEN_ITEMS.find((c) => c.name === commonName);
    if (found) {
      setItemsList((prev) =>
        prev.map((item, idx) => {
          if (idx === index) {
            const updated = {
              ...item,
              item_name: found.name,
              category: found.category,
              unit: found.unit,
            };
            const qty = Number(updated.requested_qty) || 0;
            const price = Number(updated.unit_price) || 0;
            updated.total_price = Math.round(qty * price * 100) / 100;
            return updated;
          }
          return item;
        })
      );
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsList.length === 0) {
      alert("Please add at least one item to request.");
      return;
    }

    // Validate manual storekeeper mandatory fields
    if (targetShopkeeperType === "MANUAL") {
      if (!targetShopkeeperName.trim()) {
        alert("Please enter Storekeeper Name (Mandatory for manual storekeeper).");
        return;
      }
      if (!targetShopkeeperEmail.trim()) {
        alert("Please enter Storekeeper Email (Mandatory for manual storekeeper).");
        return;
      }
      if (!targetShopkeeperPhone.trim()) {
        alert("Please enter Storekeeper Phone Number (Mandatory for manual storekeeper).");
        return;
      }
    }

    // Validate item names & quantities
    for (const item of itemsList) {
      if (!item.item_name.trim()) {
        alert("Please specify a name for all requested items.");
        return;
      }
      if (Number(item.requested_qty) <= 0) {
        alert("Quantity must be greater than 0 for all items.");
        return;
      }
    }

    try {
      setIsSubmittingCreate(true);
      await createMutation.mutateAsync({
        department: "CANTEEN",
        requested_by_name: requesterName,
        requested_by_id: requesterId,
        requested_by_role: requesterRole,
        priority,
        target_shopkeeper_type: targetShopkeeperType,
        target_shopkeeper_id: targetShopkeeperType === "REGISTERED" ? targetShopkeeperId : undefined,
        target_shopkeeper_name: targetShopkeeperName.trim() || undefined,
        target_shopkeeper_email: targetShopkeeperEmail.trim() || undefined,
        target_shopkeeper_phone: targetShopkeeperPhone.trim() || undefined,
        target_store_name: targetStoreName.trim() || undefined,
        total_amount: grandTotal,
        requester_notes: requesterNotes.trim() || undefined,
        items: itemsList.map((it) => {
          const reqQty = Number(it.requested_qty);
          const uPrice = Number(it.unit_price) || 0;
          const totPrice = it.total_price !== undefined ? Number(it.total_price) : Math.round(reqQty * uPrice * 100) / 100;
          return {
            item_name: it.item_name.trim(),
            category: it.category || "General Grocery",
            unit: it.unit || "kg",
            requested_qty: reqQty,
            unit_price: uPrice,
            total_price: totPrice,
          };
        }),
      });

      setFeedbackToast("Requisition created and submitted to Admin for approval!");
      setShowCreateModal(false);
      setItemsList([
        { item_name: "Basmati Rice (25kg Bag)", category: "Grains & Rice", unit: "bags", requested_qty: 2, unit_price: 120000, total_price: 240000 },
        { item_name: "Pure Cow Ghee (5L Tin)", category: "Dairy & Ghee", unit: "tins", requested_qty: 3, unit_price: 95000, total_price: 285000 },
      ]);
      setPriority("NORMAL");
      setTargetShopkeeperType("MANUAL");
      setTargetShopkeeperName("");
      setTargetShopkeeperEmail("");
      setTargetShopkeeperPhone("");
      setRequesterNotes("");
      refetch();
      setTimeout(() => setFeedbackToast(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to submit requisition");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleOpenDetails = (req: StoreRequisition) => {
    setSelectedReq(req);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-dark-surface">
            Canteen Store Requisitions & Raw Materials
          </h2>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Request kitchen provisions and raw materials from temple stores. Admin approves and shopkeepers disburse items with live remaining tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportRequisitionsToExcel(requisitions, "Canteen_Store_Requisitions")}
            className="px-3.5 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            title="Export all store requisitions and item ledger to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Excel</span>
          </button>

          <button
            onClick={() => refetch()}
            className="px-3.5 py-2 rounded-xl border border-primary-gold/25 bg-white hover:bg-bg-warm text-xs font-semibold text-secondary-bronze flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary-gold" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleNewRequestClick}
            className={cn(
              "px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer",
              localAdminMode
                ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-105"
                : "bg-gradient-to-r from-primary-gold to-secondary-bronze hover:brightness-105"
            )}
            title={localAdminMode ? "Requisition creation is restricted to Canteen Managers. Click to log in as Manager." : "Create New Store Requisition"}
          >
            {localAdminMode ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
            <span>{localAdminMode ? "New Store Request (Manager Only)" : "New Store Request"}</span>
          </button>
        </div>
      </div>

      {/* Administrator Terminal Mode Alert Banner */}
      {localAdminMode && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-primary-gold/10 to-blue-500/10 border border-amber-400/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-900 font-bold flex items-center justify-center shrink-0 text-base">
              👑
            </div>
            <div>
              <p className="font-bold text-amber-950 text-xs sm:text-sm">Administrator Terminal View (Read-Only Requisitions)</p>
              <p className="text-amber-900/80 text-[11px] mt-0.5 leading-relaxed">
                Store Requisitions must originate from the <strong>Canteen Manager</strong>. You are currently viewing this desk in Administrator mode. To approve, reject, or assign shopkeepers, use the Admin Approval Portal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
            <a
              href="/dashboard/requisitions"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center space-x-1 shadow-xs"
            >
              <span>Admin Approval Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setShowManagerRequiredModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white border border-amber-400/60 hover:bg-amber-50 text-amber-900 font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center space-x-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Log in as Canteen Manager</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Feedback Alert */}
      {feedbackToast && (
        <div className="p-3.5 rounded-2xl bg-success-green/15 border border-success-green/30 text-success-green text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="p-5" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Total Requests
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                {requisitions.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-warning-amber mb-1">
                Awaiting Admin Approval
              </p>
              <h3 className="text-2xl font-bold text-warning-amber font-heading">
                {requisitions.filter((r) => r.status === "SUBMITTED_TO_ADMIN").length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-warning-amber/10 flex items-center justify-center text-warning-amber">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-primary-gold mb-1">
                Approved (With Storekeeper)
              </p>
              <h3 className="text-2xl font-bold text-primary-gold font-heading">
                {requisitions.filter((r) => r.status === "APPROVED_BY_ADMIN" || r.status === "PARTIALLY_FULFILLED").length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <Store className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-success-green mb-1">
                Fully Received
              </p>
              <h3 className="text-2xl font-bold text-success-green font-heading">
                {requisitions.filter((r) => r.status === "COMPLETED").length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center text-success-green">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Table & Filter */}
      <div className="bg-white border border-primary-gold/15 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
            <input
              type="text"
              placeholder="Search by REQ Number, storekeeper, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/30 focus:border-primary-gold focus:outline-none text-xs text-dark-surface"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-secondary-bronze/70">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/40 text-xs font-semibold text-secondary-bronze focus:outline-none"
            >
              <option value="ALL">All Requisitions ({requisitions.length})</option>
              <option value="SUBMITTED_TO_ADMIN">Waiting Admin Approval</option>
              <option value="APPROVED_BY_ADMIN">Approved (With Shopkeeper)</option>
              <option value="PARTIALLY_FULFILLED">Partially Received</option>
              <option value="COMPLETED">Fully Completed</option>
              <option value="REJECTED_BY_ADMIN">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requisitions Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading store requests...</p>
            </div>
          ) : requisitions.length === 0 ? (
            <div className="py-16 text-center text-secondary-bronze/60 text-xs space-y-3">
              <ClipboardList className="w-8 h-8 text-primary-gold/30 mx-auto" />
              <p>No store requisitions recorded yet.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Requisition No.</th>
                  <th className="pb-3">Assigned Storekeeper</th>
                  <th className="pb-3">Items Count</th>
                  <th className="pb-3">Fulfillment Progress</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-bg-warm/25 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-dark-surface text-sm">
                          {req.requisition_number}
                        </span>
                        {req.priority === "URGENT" && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-error-red/10 text-error-red border border-error-red/30">
                            Urgent
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 font-semibold text-secondary-bronze">
                      {req.target_shopkeeper_name ? (
                        <div className="flex items-center space-x-1.5">
                          <Store className="w-3.5 h-3.5 text-primary-gold" />
                          <span>{req.target_shopkeeper_name}</span>
                        </div>
                      ) : (
                        <span className="text-secondary-bronze/50 italic">Unassigned (Pending Admin)</span>
                      )}
                    </td>

                    <td className="py-4 text-dark-surface font-semibold">
                      {req.total_items_count} item{req.total_items_count !== 1 ? "s" : ""}
                    </td>

                    <td className="py-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] text-secondary-bronze font-semibold">
                          <span>Progress</span>
                          <span>{Number(req.fulfillment_progress_pct || 0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-warm rounded-full overflow-hidden border border-primary-gold/15">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              req.status === "COMPLETED"
                                ? "bg-success-green"
                                : req.fulfillment_progress_pct > 0
                                ? "bg-primary-gold"
                                : "bg-secondary-bronze/30"
                            )}
                            style={{ width: `${Math.min(100, req.fulfillment_progress_pct || 0)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1",
                          req.status === "COMPLETED"
                            ? "bg-success-green/10 text-success-green border border-success-green/25"
                            : req.status === "PARTIALLY_FULFILLED"
                            ? "bg-primary-gold/10 text-primary-gold border border-primary-gold/25"
                            : req.status === "APPROVED_BY_ADMIN"
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : req.status === "REJECTED_BY_ADMIN"
                            ? "bg-error-red/10 text-error-red border border-error-red/25"
                            : "bg-warning-amber/10 text-warning-amber border border-warning-amber/25"
                        )}
                      >
                        <span>{req.status.replace(/_/g, " ")}</span>
                      </span>
                    </td>

                    <td className="py-4 text-secondary-bronze/70">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptReq(req);
                            setShowReceiptModal(true);
                          }}
                          className={cn(
                            "px-2.5 py-1.5 rounded-xl font-semibold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs",
                            req.receipt_url
                              ? "border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold"
                              : "border border-dashed border-primary-gold/40 hover:bg-primary-gold/10 text-secondary-bronze"
                          )}
                          title={req.receipt_url ? "View or update attached receipt" : "Upload receipt / bill"}
                        >
                          <Receipt className={cn("w-3.5 h-3.5", req.receipt_url ? "text-emerald-600" : "text-primary-gold")} />
                          <span>{req.receipt_url ? "Receipt" : "+ Receipt"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => exportRequisitionToBWPDF(req)}
                          className="px-2.5 py-1.5 rounded-xl border border-black/25 hover:bg-black/5 text-dark-surface font-semibold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                          title="Export & Print Black & White PDF Slip"
                        >
                          <Printer className="w-3.5 h-3.5 text-black" />
                          <span>B&W PDF</span>
                        </button>
                        <button
                          onClick={() => handleOpenDetails(req)}
                          className="px-3 py-1.5 rounded-xl border border-primary-gold/25 text-primary-gold hover:bg-primary-gold/10 font-semibold transition-colors text-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Quantities</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================================================================
       * MODAL 1: CREATE STORE REQUISITION
       * ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-dark-surface">
                    Create New Store Requisition
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Submit raw materials and provision requests to Admin for temple store dispatch.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Target Shopkeeper Selection & Priority */}
              <div className="p-4 rounded-2xl bg-bg-warm/40 border border-primary-gold/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-dark-surface flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-primary-gold" />
                    <span>Target Storekeeper & Assignment</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-gold/10 text-primary-gold border border-primary-gold/20">
                    {targetShopkeeperType === "MANUAL" ? "Manual Storekeeper" : "Registered Staff"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">
                      Select Target Storekeeper *
                    </label>
                    <select
                      value={targetShopkeeperType === "MANUAL" ? "MANUAL" : targetShopkeeperId}
                      onChange={handleShopkeeperChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="MANUAL">Manual Storekeeper (Default - No Dashboard Account)</option>
                      {shopkeepers.length > 0 && (
                        <optgroup label="Registered System Storekeepers">
                          {shopkeepers.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.store_name || "Main Store"})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">Requisition Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="NORMAL">Normal Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">URGENT (Immediate Kitchen Need)</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>

                {/* If Manual Storekeeper: Mandatory Name, Email, Phone */}
                {targetShopkeeperType === "MANUAL" ? (
                  <div className="p-3.5 rounded-xl bg-white border border-primary-gold/25 space-y-3">
                    <div className="flex items-center gap-1.5 text-secondary-bronze text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-primary-gold shrink-0" />
                      <span>
                        <strong>Manual Storekeeper:</strong> No user dashboard account will be created. The Name, Email, and Phone Number below are mandatory for this requisition.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-secondary-bronze">
                          Storekeeper Name <span className="text-error-red">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patel"
                          value={targetShopkeeperName}
                          onChange={(e) => setTargetShopkeeperName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-bg-warm/20 text-xs focus:outline-none focus:border-primary-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-secondary-bronze">
                          Email Address <span className="text-error-red">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="ramesh.store@gmail.com"
                          value={targetShopkeeperEmail}
                          onChange={(e) => setTargetShopkeeperEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-bg-warm/20 text-xs focus:outline-none focus:border-primary-gold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-secondary-bronze">
                          Phone Number <span className="text-error-red">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+256 700 123456"
                          value={targetShopkeeperPhone}
                          onChange={(e) => setTargetShopkeeperPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-bg-warm/20 text-xs focus:outline-none focus:border-primary-gold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-secondary-bronze">
                        Target Store Counter / Provisions Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Main Temple Provisions & Grocery Store"
                        value={targetStoreName}
                        onChange={(e) => setTargetStoreName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-bg-warm/20 text-xs focus:outline-none focus:border-primary-gold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white border border-success-green/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-dark-surface">{targetShopkeeperName}</span>
                      <p className="text-[11px] text-secondary-bronze/70">
                        {targetShopkeeperEmail} • {targetShopkeeperPhone || "No phone registered"} • {targetStoreName}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-success-green/10 text-success-green border border-success-green/20 self-start sm:self-auto">
                      Registered Staff Account
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic Item Lines & Pricing */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-dark-surface">
                      Required Items, Quantities & Prices ({itemsList.length})
                    </h4>
                    <p className="text-[11px] text-secondary-bronze/70">
                      Enter single item price to auto-calculate line total and grand total.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1.5 rounded-xl border border-primary-gold/30 bg-primary-gold/10 hover:bg-primary-gold text-primary-gold hover:text-white font-semibold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Row</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {itemsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-bg-warm/30 border border-primary-gold/20 space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-primary-gold">
                          Item #{idx + 1}
                        </span>
                        {itemsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1 text-error-red hover:bg-error-red/10 rounded-lg cursor-pointer transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        {/* Item Name */}
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-[11px] font-semibold text-secondary-bronze">
                            Item Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Basmati Rice (25kg Bag)"
                            value={item.item_name}
                            onChange={(e) => handleItemChange(idx, "item_name", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                          />
                          {/* Quick pick suggestion */}
                          <div className="flex items-center space-x-1 mt-1 overflow-x-auto pb-0.5">
                            <span className="text-[9px] text-secondary-bronze/60 shrink-0">Quick:</span>
                            {COMMON_CANTEEN_ITEMS.slice(0, 3).map((c) => (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => handleSelectQuickItem(idx, c.name)}
                                className="px-1.5 py-0.5 rounded bg-bg-warm hover:bg-primary-gold/20 text-[9px] text-secondary-bronze shrink-0 border border-primary-gold/15 cursor-pointer"
                              >
                                {c.name.split(" ")[0]}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Category */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-secondary-bronze">Category</label>
                          <input
                            type="text"
                            placeholder="e.g. Grocery"
                            value={item.category}
                            onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                          />
                        </div>

                        {/* Qty & Unit */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-secondary-bronze">
                            Qty & Unit *
                          </label>
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              required
                              value={item.requested_qty}
                              onChange={(e) => handleItemChange(idx, "requested_qty", e.target.value)}
                              className="w-14 px-2 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs font-bold text-right focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="kg"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                              className="w-12 px-1.5 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none text-center"
                            />
                          </div>
                        </div>

                        {/* Single Item Price */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-secondary-bronze">
                            Item Price (UGX)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            placeholder="0"
                            value={item.unit_price ?? 0}
                            onChange={(e) => handleItemChange(idx, "unit_price", e.target.value)}
                            className="w-full px-2.5 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs font-bold text-right focus:outline-none"
                          />
                        </div>

                        {/* Line Total Auto Calculated */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-secondary-bronze">
                            Line Total
                          </label>
                          <div className="px-2 py-2 rounded-xl bg-bg-warm/70 border border-primary-gold/20 text-xs font-bold font-mono text-dark-surface text-right truncate">
                            UGX {(Number(item.total_price) || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto Calculated Grand Total Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-bg-warm/80 via-primary-gold/10 to-bg-warm/80 border border-primary-gold/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-secondary-bronze/70 block">
                      Total Items: {itemsList.length}
                    </span>
                    <span className="font-heading text-sm font-bold text-dark-surface">
                      Grand Total Estimated Amount:
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base sm:text-xl font-bold font-mono text-dark-surface">
                      UGX {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Purpose Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">
                  Purpose / Notes for Admin & Storekeeper (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. For upcoming Sunday Satsang prasad and canteen stock replenishment."
                  value={requesterNotes}
                  onChange={(e) => setRequesterNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/20 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-primary-gold/15">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-bold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2 text-xs"
                >
                  {isSubmittingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Submit Request to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 2: VIEW ITEM QUANTITIES & LIVE REMAINING BALANCES
       * ========================================================================= */}
      {showDetailModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-dark-surface">
                    Requisition Status: {selectedReq.requisition_number}
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Status: <strong className="text-primary-gold">{selectedReq.status.replace(/_/g, " ")}</strong> (
                    {selectedReq.fulfillment_progress_pct}% Received)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Overview Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Assigned Storekeeper
                  </span>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-dark-surface">{selectedReq.target_shopkeeper_name || "Pending Admin Selection"}</p>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary-gold/10 text-primary-gold border border-primary-gold/20">
                      {selectedReq.target_shopkeeper_type === "MANUAL" || !selectedReq.target_shopkeeper_id ? "Manual" : "Registered"}
                    </span>
                  </div>
                  {selectedReq.target_shopkeeper_email && (
                    <p className="text-[11px] text-secondary-bronze font-mono">{selectedReq.target_shopkeeper_email}</p>
                  )}
                  {selectedReq.target_shopkeeper_phone && (
                    <p className="text-[11px] text-secondary-bronze">{selectedReq.target_shopkeeper_phone}</p>
                  )}
                  <p className="text-[11px] text-secondary-bronze/70">{selectedReq.target_store_name || "Main Store"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Admin Approval
                  </span>
                  <p className="font-bold text-dark-surface">{selectedReq.admin_name || "Pending Review"}</p>
                  <p className="text-secondary-bronze">
                    {selectedReq.approved_at ? new Date(selectedReq.approved_at).toLocaleDateString() : "Pending"}
                  </p>
                  <span className="text-[10px] uppercase font-bold text-primary-gold block mt-1">
                    Grand Total: UGX {(Number(selectedReq.total_amount) || 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Dispatch Date & Progress
                  </span>
                  <p className="font-bold text-dark-surface">
                    {selectedReq.dispatched_at ? new Date(selectedReq.dispatched_at).toLocaleDateString() : "Pending Dispatch"}
                  </p>
                  <p className="text-secondary-bronze font-semibold">
                    {selectedReq.fulfillment_progress_pct}% Completed
                  </p>
                </div>
              </div>

              {/* Items Breakdown Table with Prices */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-heading text-sm font-bold text-dark-surface">
                    Item Quantities & Prices ({selectedReq.items?.length || 0})
                  </h4>
                  <span className="text-xs font-mono font-bold text-dark-surface">
                    Total: UGX {(Number(selectedReq.total_amount) || 0).toLocaleString()}
                  </span>
                </div>

                <div className="border border-primary-gold/15 rounded-2xl overflow-hidden divide-y divide-primary-gold/10">
                  <div className="p-3 bg-bg-warm/60 grid grid-cols-12 text-[10px] font-bold uppercase text-secondary-bronze tracking-wider">
                    <span className="col-span-3">Item Description</span>
                    <span className="col-span-2 text-center">Approved</span>
                    <span className="col-span-2 text-center text-success-green">Given</span>
                    <span className="col-span-1 text-center text-error-red">Rem</span>
                    <span className="col-span-2 text-right">Unit Price</span>
                    <span className="col-span-2 text-right">Line Total</span>
                  </div>

                  {selectedReq.items?.map((it, idx) => {
                    const appQ = Number(it.approved_qty ?? it.requested_qty) || 0;
                    const uPrice = Number(it.unit_price) || 0;
                    const lineTot = Number(it.total_price) || (appQ * uPrice);

                    return (
                      <div key={it.id} className="p-3 grid grid-cols-12 items-center hover:bg-bg-warm/20 transition-colors">
                        <div className="col-span-3 flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-primary-gold/10 text-primary-gold font-bold text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-dark-surface truncate">{it.item_name}</p>
                            <span className="text-[10px] text-secondary-bronze/60">{it.category}</span>
                          </div>
                        </div>

                        <div className="col-span-2 text-center font-bold text-dark-surface">
                          {appQ} {it.unit}
                        </div>

                        <div className="col-span-2 text-center font-bold text-success-green bg-success-green/5 py-1 rounded-lg">
                          {it.issued_qty} {it.unit}
                        </div>

                        <div className="col-span-1 text-center font-bold text-error-red bg-error-red/5 py-1 rounded-lg">
                          {it.remaining_qty}
                        </div>

                        <div className="col-span-2 text-right font-mono text-secondary-bronze">
                          UGX {uPrice.toLocaleString()}
                        </div>

                        <div className="col-span-2 text-right font-mono font-bold text-dark-surface">
                          UGX {lineTot.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes Display */}
              {selectedReq.shopkeeper_notes && (
                <div className="p-3.5 rounded-2xl bg-primary-gold/5 border border-primary-gold/25 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary-gold block">
                    Storekeeper Dispatch Remarks
                  </span>
                  <p className="text-xs text-dark-surface italic">&ldquo;{selectedReq.shopkeeper_notes}&rdquo;</p>
                </div>
              )}

              {/* Receipt Attachment Section */}
              <div className="p-4 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-primary-gold" />
                    <span className="font-heading text-sm font-bold text-dark-surface">
                      Attached Receipt & Vendor Invoice
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptReq(selectedReq);
                      setShowReceiptModal(true);
                    }}
                    className="px-3 py-1 rounded-xl border border-primary-gold/30 bg-white hover:bg-primary-gold/10 text-xs font-semibold text-secondary-bronze flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Edit3 className="w-3 h-3 text-primary-gold" />
                    <span>{selectedReq.receipt_url ? "View / Edit Receipt" : "Upload Receipt"}</span>
                  </button>
                </div>

                {selectedReq.receipt_url ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-primary-gold/15">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-dark-surface text-xs truncate max-w-xs">
                          {selectedReq.receipt_filename || "Receipt attached"}
                        </p>
                        <p className="text-[10px] text-secondary-bronze/70">
                          {selectedReq.receipt_uploaded_by ? `By ${selectedReq.receipt_uploaded_by} • ` : ""}
                          {selectedReq.receipt_uploaded_at ? new Date(selectedReq.receipt_uploaded_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptReq(selectedReq);
                        setShowReceiptModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary-gold text-white font-semibold text-xs flex items-center space-x-1 hover:brightness-105 cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-secondary-bronze/70 italic">
                    No receipt uploaded for this requisition yet. You can upload delivery notes, vendor receipts, or invoices anytime.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-primary-gold/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptReq(selectedReq);
                      setShowReceiptModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-primary-gold/30 bg-primary-gold/10 hover:bg-primary-gold/20 text-xs font-bold text-secondary-bronze flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-primary-gold" />
                    <span>{selectedReq.receipt_url ? "View Receipt" : "Upload Receipt"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportRequisitionToBWPDF(selectedReq)}
                    className="px-4 py-2 rounded-xl border border-black/30 bg-black/5 hover:bg-black/10 text-xs font-bold text-dark-surface flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Export and print Black & White PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-black" />
                    <span>Print / Save B&W PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportSingleRequisitionToExcel(selectedReq)}
                    className="px-4 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title="Export this requisition voucher to Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export to Excel</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 3: CANTEEN MANAGER LOGIN & ROLE SWITCH MODAL
       * ========================================================================= */}
      {showManagerRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-amber-400/30 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-gradient-to-r from-amber-500/10 via-primary-gold/10 to-transparent">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold text-lg">
                  🔒
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-dark-surface">
                    Canteen Manager Access Required
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Store grocery requisitions can only be initiated by the Canteen Manager.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManagerRequiredModal(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Separation of Duties Policy</span>
                </p>
                <span>
                  Administrators cannot create store grocery requests directly from the POS. Requests must be created by the Canteen Manager and sent to Admin for approval.
                </span>
              </div>

              {managerLoginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{managerLoginError}</span>
                </div>
              )}

              <form onSubmit={handleManagerLoginSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze text-xs">
                    Canteen Manager Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    placeholder="manager@swami.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/30 focus:border-primary-gold focus:outline-none text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze text-xs">
                    Manager Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={managerPassword}
                    onChange={(e) => setManagerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/30 focus:border-primary-gold focus:outline-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingInManager}
                  className="w-full py-3 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-bold rounded-xl text-xs shadow-md hover:brightness-105 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingInManager ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>Authenticate as Manager & Create Request</span>
                </button>
              </form>

              <div className="pt-3 border-t border-primary-gold/15 flex items-center justify-between">
                <a
                  href="/dashboard/requisitions"
                  className="text-blue-600 hover:underline font-bold text-xs flex items-center gap-1"
                >
                  <span>Go to Admin Approval Desk</span>
                  <ArrowRight className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowManagerRequiredModal(false)}
                  className="px-4 py-2 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 4: REQUISITION RECEIPT UPLOAD, EDIT & FULL PREVIEW MODAL
       * ========================================================================= */}
      {showReceiptModal && receiptReq && (
        <RequisitionReceiptModal
          requisition={receiptReq}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          currentUserRole="CANTEEN_MANAGER"
          currentUserName={currentRequesterName || "Canteen Manager"}
          onSuccess={() => {
            refetch();
            if (selectedReq && selectedReq.id === receiptReq.id) {
              const found = requisitions.find((r) => r.id === receiptReq.id);
              if (found) setSelectedReq(found);
            }
          }}
        />
      )}
    </div>
  );
}
