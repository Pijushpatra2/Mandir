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
  UserCheck
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

  // Create Form State
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [targetShopkeeperId, setTargetShopkeeperId] = useState("");
  const [targetShopkeeperName, setTargetShopkeeperName] = useState("");
  const [targetStoreName, setTargetStoreName] = useState("");
  const [requesterNotes, setRequesterNotes] = useState("");
  const [itemsList, setItemsList] = useState<CreateRequisitionItemDto[]>([
    { item_name: "Basmati Rice (25kg Bag)", category: "Grains & Rice", unit: "bags", requested_qty: 2 },
    { item_name: "Pure Cow Ghee (5L Tin)", category: "Dairy & Ghee", unit: "tins", requested_qty: 3 },
  ]);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

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

  useEffect(() => {
    adminListShopkeepers()
      .then((data) => {
        const active = data.filter((s) => s.status === "ACTIVE");
        setShopkeepers(active);
        if (active.length > 0 && !targetShopkeeperId) {
          setTargetShopkeeperId(active[0].id);
          setTargetShopkeeperName(active[0].name);
          setTargetStoreName(active[0].store_name || "Main Temple Store");
        }
      })
      .catch((err) => console.error("Failed to load shopkeepers", err));
  }, []);

  const handleShopkeeperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setTargetShopkeeperId(sId);
    const found = shopkeepers.find((s) => s.id === sId);
    if (found) {
      setTargetShopkeeperName(found.name);
      setTargetStoreName(found.store_name || "Main Temple Store");
    }
  };

  const handleAddItemRow = () => {
    setItemsList([
      ...itemsList,
      { item_name: "", category: "General Grocery", unit: "kg", requested_qty: 1 },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (itemsList.length <= 1) return;
    setItemsList(itemsList.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof CreateRequisitionItemDto, val: any) => {
    setItemsList(
      itemsList.map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const handleSelectQuickItem = (index: number, commonName: string) => {
    const found = COMMON_CANTEEN_ITEMS.find((c) => c.name === commonName);
    if (found) {
      setItemsList(
        itemsList.map((item, idx) => {
          if (idx === index) {
            return {
              ...item,
              item_name: found.name,
              category: found.category,
              unit: found.unit,
            };
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

    // Validate item names
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
        target_shopkeeper_id: targetShopkeeperId || undefined,
        target_shopkeeper_name: targetShopkeeperName || undefined,
        target_store_name: targetStoreName || undefined,
        requester_notes: requesterNotes.trim() || undefined,
        items: itemsList.map((it) => ({
          item_name: it.item_name.trim(),
          category: it.category || "General Grocery",
          unit: it.unit || "kg",
          requested_qty: Number(it.requested_qty),
        })),
      });

      setFeedbackToast("Requisition created and submitted to Admin for approval!");
      setShowCreateModal(false);
      setItemsList([
        { item_name: "Basmati Rice (25kg Bag)", category: "Grains & Rice", unit: "bags", requested_qty: 2 },
        { item_name: "Pure Cow Ghee (5L Tin)", category: "Dairy & Ghee", unit: "tins", requested_qty: 3 },
      ]);
      setPriority("NORMAL");
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
                      <button
                        onClick={() => handleOpenDetails(req)}
                        className="px-3.5 py-1.5 rounded-xl border border-primary-gold/25 text-primary-gold hover:bg-primary-gold/10 font-semibold transition-colors text-xs flex items-center space-x-1 cursor-pointer ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Quantities</span>
                      </button>
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
              {/* Target Shopkeeper / Store Selector & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">
                    Target Shopkeeper / Store Counter (Optional)
                  </label>
                  <select
                    value={targetShopkeeperId}
                    onChange={handleShopkeeperChange}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/30 text-xs font-semibold focus:outline-none"
                  >
                    <option value="">Let Admin Assign</option>
                    {shopkeepers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.store_name || "Main Store"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Requisition Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/30 text-xs font-semibold focus:outline-none"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">URGENT (Immediate Kitchen Need)</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Item Lines */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-heading text-sm font-bold text-dark-surface">
                    Required Items & Quantities ({itemsList.length})
                  </h4>
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

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* Preset Selector */}
                        <div className="sm:col-span-6 space-y-1">
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
                            <span className="text-[9px] text-secondary-bronze/60 shrink-0">Suggestions:</span>
                            {COMMON_CANTEEN_ITEMS.slice(0, 4).map((c) => (
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
                        <div className="sm:col-span-3 space-y-1">
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
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[11px] font-semibold text-secondary-bronze">
                            Quantity & Unit *
                          </label>
                          <div className="flex items-center space-x-1.5">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              required
                              value={item.requested_qty}
                              onChange={(e) => handleItemChange(idx, "requested_qty", e.target.value)}
                              className="w-16 px-2 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs font-bold text-right focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="kg / bags"
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                              className="w-16 px-2 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    Assigned Shopkeeper
                  </span>
                  <p className="font-bold text-dark-surface">{selectedReq.target_shopkeeper_name || "Pending Admin Selection"}</p>
                  <p className="text-secondary-bronze">{selectedReq.target_store_name || "Main Store"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Admin Approval
                  </span>
                  <p className="font-bold text-dark-surface">{selectedReq.admin_name || "Pending Review"}</p>
                  <p className="text-secondary-bronze">
                    {selectedReq.approved_at ? new Date(selectedReq.approved_at).toLocaleDateString() : "Pending"}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Dispatch Date
                  </span>
                  <p className="font-bold text-dark-surface">
                    {selectedReq.dispatched_at ? new Date(selectedReq.dispatched_at).toLocaleDateString() : "Pending Dispatch"}
                  </p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="space-y-3">
                <h4 className="font-heading text-sm font-bold text-dark-surface">
                  Item Quantities (Requested vs Approved vs Given vs Remaining)
                </h4>

                <div className="border border-primary-gold/15 rounded-2xl overflow-hidden divide-y divide-primary-gold/10">
                  <div className="p-3 bg-bg-warm/60 grid grid-cols-12 text-[10px] font-bold uppercase text-secondary-bronze tracking-wider">
                    <span className="col-span-4">Item Name</span>
                    <span className="col-span-2 text-center">Approved</span>
                    <span className="col-span-2 text-center text-success-green">Given by Store</span>
                    <span className="col-span-2 text-center text-error-red">Remaining</span>
                    <span className="col-span-2 text-right">Store Remarks</span>
                  </div>

                  {selectedReq.items?.map((it, idx) => (
                    <div key={it.id} className="p-3 grid grid-cols-12 items-center hover:bg-bg-warm/20 transition-colors">
                      <div className="col-span-4 flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-primary-gold/10 text-primary-gold font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-dark-surface">{it.item_name}</p>
                          <span className="text-[10px] text-secondary-bronze/60">{it.category}</span>
                        </div>
                      </div>

                      <div className="col-span-2 text-center font-bold text-dark-surface">
                        {it.approved_qty} {it.unit}
                      </div>

                      <div className="col-span-2 text-center font-bold text-success-green bg-success-green/5 py-1 rounded-lg">
                        {it.issued_qty} {it.unit}
                      </div>

                      <div className="col-span-2 text-center font-bold text-error-red bg-error-red/5 py-1 rounded-lg">
                        {it.remaining_qty} {it.unit}
                      </div>

                      <div className="col-span-2 text-right text-[11px] text-secondary-bronze italic truncate">
                        {it.shopkeeper_remarks || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Display */}
              {selectedReq.shopkeeper_notes && (
                <div className="p-3.5 rounded-2xl bg-primary-gold/5 border border-primary-gold/25 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary-gold block">
                    Shopkeeper Dispatch Remarks
                  </span>
                  <p className="text-xs text-dark-surface italic">&ldquo;{selectedReq.shopkeeper_notes}&rdquo;</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-primary-gold/10">
                <button
                  type="button"
                  onClick={() => exportSingleRequisitionToExcel(selectedReq)}
                  className="px-4 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Export this requisition voucher to Excel"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Voucher to Excel</span>
                </button>

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
    </div>
  );
}
