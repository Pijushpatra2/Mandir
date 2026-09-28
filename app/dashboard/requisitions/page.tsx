"use client";

import React, { useState, useEffect } from "react";
import {
  useRequisitions,
  useRequisitionStats,
  useAdminApproveRequisition,
  useAdminUpdateRequisition,
  useAdminRejectRequisition,
} from "@/lib/api/requisitions";
import { adminListShopkeepers, ShopkeeperItem } from "@/lib/shopkeeperApi";
import { StoreRequisition, StoreRequisitionItem } from "@/types/requisition.types";
import { GlassCard } from "@/components/ui/GlassCard";
import { exportRequisitionsToExcel, exportSingleRequisitionToExcel } from "@/lib/exportExcel";
import { exportRequisitionToBWPDF } from "@/lib/requisitionPdf";
import RequisitionReceiptModal from "@/components/requisition/RequisitionReceiptModal";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  UserCheck,
  Store,
  ArrowRight,
  X,
  Loader2,
  Check,
  XCircle,
  TrendingUp,
  Boxes,
  FileText,
  Building2,
  Send,
  FileSpreadsheet,
  Download,
  Printer,
  Edit3,
  AlertCircle,
  Receipt,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardRequisitionsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: requisitions = [], isLoading, refetch } = useRequisitions({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    department: departmentFilter === "ALL" ? undefined : departmentFilter,
    search: searchQuery || undefined,
  });

  const { data: stats, refetch: refetchStats } = useRequisitionStats();
  const [shopkeepers, setShopkeepers] = useState<ShopkeeperItem[]>([]);

  const approveMutation = useAdminApproveRequisition();
  const updateMutation = useAdminUpdateRequisition();
  const rejectMutation = useAdminRejectRequisition();

  // Modals state
  const [selectedReq, setSelectedReq] = useState<StoreRequisition | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptReq, setReceiptReq] = useState<StoreRequisition | null>(null);

  // Approval / Edit Form State
  const [targetShopkeeperType, setTargetShopkeeperType] = useState<"MANUAL" | "REGISTERED">("MANUAL");
  const [selectedShopkeeperId, setSelectedShopkeeperId] = useState("");
  const [selectedShopkeeperName, setSelectedShopkeeperName] = useState("");
  const [selectedShopkeeperEmail, setSelectedShopkeeperEmail] = useState("");
  const [selectedShopkeeperPhone, setSelectedShopkeeperPhone] = useState("");
  const [selectedStoreName, setSelectedStoreName] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [itemApprovalList, setItemApprovalList] = useState<
    Array<{
      id: string;
      name: string;
      requested_qty: number;
      approved_qty: number;
      unit_price: number;
      total_price: number;
      unit: string;
    }>
  >([]);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Grand Total calculation for modal
  const modalGrandTotal = itemApprovalList.reduce((acc, it) => {
    const appQ = Number(it.approved_qty) >= 0 ? Number(it.approved_qty) : Number(it.requested_qty || 0);
    const uPrice = Number(it.unit_price) >= 0 ? Number(it.unit_price) : 0;
    const line = it.total_price !== undefined ? Number(it.total_price) : appQ * uPrice;
    return acc + line;
  }, 0);

  // Load shopkeepers for assignment dropdown
  useEffect(() => {
    adminListShopkeepers()
      .then((data) => {
        setShopkeepers(data.filter((s) => s.status === "ACTIVE"));
      })
      .catch((err) => console.error("Failed to load shopkeepers", err));
  }, []);

  const handleOpenApprove = (req: StoreRequisition) => {
    setSelectedReq(req);
    const isMan = req.target_shopkeeper_type === "MANUAL" || (!req.target_shopkeeper_id && !req.target_shopkeeper_name);
    setTargetShopkeeperType(isMan ? "MANUAL" : "REGISTERED");
    setSelectedShopkeeperId(req.target_shopkeeper_id || "");
    setSelectedShopkeeperName(req.target_shopkeeper_name || (isMan ? "Manual Storekeeper" : "Main Storekeeper"));
    setSelectedShopkeeperEmail(req.target_shopkeeper_email || "");
    setSelectedShopkeeperPhone(req.target_shopkeeper_phone || "");
    setSelectedStoreName(req.target_store_name || "Main Temple Provisions & Grocery Store");
    setAdminNotes(req.admin_notes || "");
    setShowRejectForm(false);
    setRejectReason("");

    if (req.items) {
      setItemApprovalList(
        req.items.map((it) => {
          const reqQ = Number(it.requested_qty) || 1;
          const appQ = Number(it.approved_qty ?? reqQ);
          const uPrice = Number(it.unit_price) || 0;
          const totPrice = Number(it.total_price) || (appQ * uPrice);
          return {
            id: it.id,
            name: it.item_name,
            requested_qty: reqQ,
            approved_qty: appQ,
            unit_price: uPrice,
            total_price: totPrice,
            unit: it.unit,
          };
        })
      );
    }
    setShowApproveModal(true);
  };

  const handleOpenDetails = (req: StoreRequisition) => {
    setSelectedReq(req);
    setShowDetailModal(true);
  };

  const handleShopkeeperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "MANUAL") {
      setTargetShopkeeperType("MANUAL");
      setSelectedShopkeeperId("");
    } else {
      setTargetShopkeeperType("REGISTERED");
      setSelectedShopkeeperId(val);
      const found = shopkeepers.find((s) => s.id === val);
      if (found) {
        setSelectedShopkeeperName(found.name);
        setSelectedShopkeeperEmail(found.email);
        setSelectedShopkeeperPhone(found.phone || "");
        setSelectedStoreName(found.store_name || "Main Temple Provisions Store");
      }
    }
  };

  const handleItemQtyOrPriceChange = (
    id: string,
    field: "approved_qty" | "unit_price",
    val: number
  ) => {
    setItemApprovalList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          const qty = field === "approved_qty" ? val : Number(updated.approved_qty);
          const price = field === "unit_price" ? val : Number(updated.unit_price);
          updated.total_price = Math.round(qty * price * 100) / 100;
          return updated;
        }
        return item;
      })
    );
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    if (targetShopkeeperType === "MANUAL") {
      if (!selectedShopkeeperName.trim()) {
        alert("Please enter the storekeeper name.");
        return;
      }
      if (!selectedShopkeeperEmail.trim()) {
        alert("Please enter the storekeeper email.");
        return;
      }
      if (!selectedShopkeeperPhone.trim()) {
        alert("Please enter the storekeeper phone number.");
        return;
      }
    }

    try {
      setIsSubmittingApproval(true);

      const itemsPayload = itemApprovalList.map((it) => {
        const appQ = Number(it.approved_qty);
        const uPrice = Number(it.unit_price) || 0;
        const totPrice = it.total_price !== undefined ? Number(it.total_price) : Math.round(appQ * uPrice * 100) / 100;
        return {
          id: it.id,
          approved_qty: appQ,
          unit_price: uPrice,
          total_price: totPrice,
          item_status: "APPROVED" as const,
        };
      });

      if (selectedReq.status === "SUBMITTED_TO_ADMIN") {
        await approveMutation.mutateAsync({
          id: selectedReq.id,
          data: {
            admin_name: "Super Admin",
            admin_notes: adminNotes,
            target_shopkeeper_type: targetShopkeeperType,
            target_shopkeeper_id: targetShopkeeperType === "REGISTERED" ? selectedShopkeeperId : undefined,
            target_shopkeeper_name: selectedShopkeeperName.trim() || undefined,
            target_shopkeeper_email: selectedShopkeeperEmail.trim() || undefined,
            target_shopkeeper_phone: selectedShopkeeperPhone.trim() || undefined,
            target_store_name: selectedStoreName.trim() || undefined,
            total_amount: modalGrandTotal,
            items: itemsPayload,
          },
        });
      } else {
        await updateMutation.mutateAsync({
          id: selectedReq.id,
          data: {
            admin_notes: adminNotes,
            target_shopkeeper_type: targetShopkeeperType,
            target_shopkeeper_id: targetShopkeeperType === "REGISTERED" ? selectedShopkeeperId : undefined,
            target_shopkeeper_name: selectedShopkeeperName.trim() || undefined,
            target_shopkeeper_email: selectedShopkeeperEmail.trim() || undefined,
            target_shopkeeper_phone: selectedShopkeeperPhone.trim() || undefined,
            target_store_name: selectedStoreName.trim() || undefined,
            total_amount: modalGrandTotal,
            items: itemsPayload,
          },
        });
      }

      setShowApproveModal(false);
      refetch();
      refetchStats();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save requisition");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      setIsSubmittingApproval(true);
      await rejectMutation.mutateAsync({
        id: selectedReq.id,
        reason: rejectReason.trim(),
        adminName: "Super Admin",
      });

      setShowApproveModal(false);
      refetch();
      refetchStats();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to reject requisition");
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface">
            Store Requisitions & Procurement Desk
          </h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Review departmental material requisitions from Canteen & Temple, approve quantities, and dispatch to Shopkeepers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportRequisitionsToExcel(requisitions, "Admin_Store_Requisitions")}
            className="px-3.5 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            title="Export all store requisitions and item ledger to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Excel</span>
          </button>

          <button
            onClick={() => {
              refetch();
              refetchStats();
            }}
            className="px-3.5 py-2 rounded-xl border border-primary-gold/25 bg-white hover:bg-bg-warm text-xs font-semibold text-secondary-bronze flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary-gold" />
            <span>Refresh Requisitions</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="p-5" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Total Requisitions
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                {stats?.totalRequisitions ?? requisitions.length} Requests
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
                Pending Admin Approval
              </p>
              <h3 className="text-2xl font-bold text-warning-amber font-heading">
                {stats?.pendingAdminApproval ?? requisitions.filter((r) => r.status === "SUBMITTED_TO_ADMIN").length} Needs Action
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
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                In Shopkeeper Fulfillment
              </p>
              <h3 className="text-2xl font-bold text-primary-gold font-heading">
                {(stats?.approvedPendingShopkeeper ?? 0) + (stats?.partiallyFulfilled ?? 0)} Active
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
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Fully Fulfilled
              </p>
              <h3 className="text-2xl font-bold text-success-green font-heading">
                {stats?.completed ?? requisitions.filter((r) => r.status === "COMPLETED").length} Completed
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center text-success-green">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Filter and Table */}
      <div className="bg-white border border-primary-gold/15 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
            <input
              type="text"
              placeholder="Search by REQ code, requester, shopkeeper..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/30 focus:border-primary-gold focus:outline-none text-xs text-dark-surface"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/40 text-xs font-semibold text-secondary-bronze focus:outline-none"
            >
              <option value="ALL">All Statuses ({requisitions.length})</option>
              <option value="SUBMITTED_TO_ADMIN">Pending Admin Approval</option>
              <option value="APPROVED_BY_ADMIN">Approved (Sent to Shopkeeper)</option>
              <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
              <option value="COMPLETED">Fully Completed</option>
              <option value="REJECTED_BY_ADMIN">Rejected</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/40 text-xs font-semibold text-secondary-bronze focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="CANTEEN">Canteen & Kitchen</option>
              <option value="TEMPLE_KITCHEN">Temple Maha Prasad Kitchen</option>
              <option value="PUJA_DEPT">Puja & Seva Department</option>
              <option value="MAINTENANCE">Facilities & Maintenance</option>
            </select>
          </div>
        </div>

        {/* Requisitions Ledger Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading store requisitions...</p>
            </div>
          ) : requisitions.length === 0 ? (
            <div className="py-16 text-center text-secondary-bronze/60 text-xs space-y-3">
              <ClipboardList className="w-8 h-8 text-primary-gold/30 mx-auto" />
              <p>No store requisitions found matching your filter criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Requisition Number</th>
                  <th className="pb-3">Department & Requester</th>
                  <th className="pb-3">Assigned Shopkeeper</th>
                  <th className="pb-3">Items & Total</th>
                  <th className="pb-3">Fulfillment Progress</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-bg-warm/25 transition-colors">
                    {/* Requisition Number & Priority */}
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

                    {/* Department & Requester */}
                    <td className="py-4">
                      <p className="font-bold text-dark-surface">{req.department.replace("_", " ")}</p>
                      <p className="text-[11px] text-secondary-bronze/70">
                        By: <strong className="text-dark-surface">{req.requested_by_name}</strong> ({req.requested_by_role})
                      </p>
                    </td>

                    {/* Assigned Shopkeeper */}
                    <td className="py-4 font-semibold text-secondary-bronze">
                      {req.target_shopkeeper_name ? (
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <Store className="w-3.5 h-3.5 text-primary-gold" />
                            <span className="font-bold text-dark-surface">{req.target_shopkeeper_name}</span>
                            {req.target_shopkeeper_type === "MANUAL" && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                Manual
                              </span>
                            )}
                          </div>
                          {req.target_shopkeeper_phone && (
                            <p className="text-[10px] text-secondary-bronze/70">{req.target_shopkeeper_phone}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-secondary-bronze/50 italic">Unassigned (Pending Admin)</span>
                      )}
                    </td>

                    {/* Items count & Total Amount */}
                    <td className="py-4 text-dark-surface font-semibold">
                      <div>{req.total_items_count} item{req.total_items_count !== 1 ? "s" : ""}</div>
                      {req.total_amount ? (
                        <div className="text-[11px] font-bold text-primary-gold">
                          UGX {Number(req.total_amount).toLocaleString()}
                        </div>
                      ) : null}
                    </td>

                    {/* Progress */}
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

                    {/* Status badge */}
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

                    {/* Date */}
                    <td className="py-4 text-secondary-bronze/70">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptReq(req);
                            setShowReceiptModal(true);
                          }}
                          className={cn(
                            "px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-xs",
                            req.receipt_url
                              ? "border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                              : "border border-dashed border-primary-gold/40 hover:bg-primary-gold/10 text-secondary-bronze"
                          )}
                          title={req.receipt_url ? "View or edit attached receipt" : "Upload receipt / invoice"}
                        >
                          <Receipt className={cn("w-3.5 h-3.5", req.receipt_url ? "text-emerald-600" : "text-primary-gold")} />
                          <span className="hidden xl:inline">{req.receipt_url ? "Receipt" : "+ Receipt"}</span>
                        </button>

                        <button
                          onClick={() => exportRequisitionToBWPDF(req)}
                          className="px-2.5 py-1.5 rounded-xl border border-gray-400/40 bg-white hover:bg-gray-100 text-gray-800 font-bold text-xs shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Download & Print Black & White PDF Requisition"
                        >
                          <Printer className="w-3.5 h-3.5 text-gray-700" />
                          <span className="hidden xl:inline">B&W PDF</span>
                        </button>

                        {req.status === "SUBMITTED_TO_ADMIN" ? (
                          <button
                            onClick={() => handleOpenApprove(req)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs shadow-xs hover:brightness-105 transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Review & Assign</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenApprove(req)}
                              className="px-2.5 py-1.5 rounded-xl border border-primary-gold/40 text-secondary-bronze hover:bg-primary-gold/10 font-semibold transition-colors text-xs flex items-center space-x-1 cursor-pointer"
                              title="Update storekeeper details, quantities, and pricing"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-primary-gold" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleOpenDetails(req)}
                              className="px-2.5 py-1.5 rounded-xl border border-primary-gold/25 text-primary-gold hover:bg-primary-gold/10 font-semibold transition-colors text-xs flex items-center space-x-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Ledger</span>
                            </button>
                          </>
                        )}
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
       * MODAL 1: ADMIN REVIEW, QUANTITY ADJUSTMENT, PRICING & SHOPKEEPER ASSIGNMENT
       * ========================================================================= */}
      {showApproveModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-dark-surface">
                    {selectedReq.status === "SUBMITTED_TO_ADMIN"
                      ? "Admin Review & Approval"
                      : "Edit Requisition & Pricing"}
                    : {selectedReq.requisition_number}
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Requested by <strong>{selectedReq.requested_by_name}</strong> for{" "}
                    <strong>{selectedReq.department}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Requester Notes if any */}
              {selectedReq.requester_notes && (
                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 text-secondary-bronze space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Canteen Manager's Requisition Notes
                  </span>
                  <p className="text-xs italic">&ldquo;{selectedReq.requester_notes}&rdquo;</p>
                </div>
              )}

              {/* Shopkeeper Assignment Selector & Manual Storekeeper Info */}
              <div className="p-4 rounded-2xl bg-primary-gold/5 border border-primary-gold/25 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-primary-gold" />
                    <span className="font-heading text-sm font-bold text-dark-surface">
                      Storekeeper Assignment & Contact Details
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-gold/15 text-secondary-bronze">
                    {targetShopkeeperType === "MANUAL" ? "Manual Storekeeper (No Dashboard)" : "Registered Storekeeper"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">Storekeeper Mode *</label>
                    <select
                      value={targetShopkeeperType === "MANUAL" ? "MANUAL" : selectedShopkeeperId}
                      onChange={handleShopkeeperChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="MANUAL">-- Manual Storekeeper (No Login Dashboard) --</option>
                      <optgroup label="Registered Storekeepers">
                        {shopkeepers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.store_name || "Main Store"})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">Target Store Counter / Location</label>
                    <input
                      type="text"
                      value={selectedStoreName}
                      onChange={(e) => setSelectedStoreName(e.target.value)}
                      placeholder="e.g. Main Temple Provisions Store"
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Contact fields for Manual Storekeeper (Mandatory) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-primary-gold/10">
                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">
                      Storekeeper Name {targetShopkeeperType === "MANUAL" && <span className="text-error-red">*</span>}
                    </label>
                    <input
                      type="text"
                      required={targetShopkeeperType === "MANUAL"}
                      placeholder="e.g. Rajesh Kumar"
                      value={selectedShopkeeperName}
                      onChange={(e) => setSelectedShopkeeperName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">
                      Storekeeper Email {targetShopkeeperType === "MANUAL" && <span className="text-error-red">*</span>}
                    </label>
                    <input
                      type="email"
                      required={targetShopkeeperType === "MANUAL"}
                      placeholder="e.g. storekeeper@temple.org"
                      value={selectedShopkeeperEmail}
                      onChange={(e) => setSelectedShopkeeperEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">
                      Phone Number {targetShopkeeperType === "MANUAL" && <span className="text-error-red">*</span>}
                    </label>
                    <input
                      type="tel"
                      required={targetShopkeeperType === "MANUAL"}
                      placeholder="e.g. +256 700 123456"
                      value={selectedShopkeeperPhone}
                      onChange={(e) => setSelectedShopkeeperPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {targetShopkeeperType === "MANUAL" && (
                  <p className="text-[11px] text-secondary-bronze/80 italic bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                    ℹ️ <strong>Manual Storekeeper Mode:</strong> No login or dashboard account will be created. The requisition voucher will be exported / printed as a Black & White PDF or sent directly to their phone/email.
                  </p>
                )}
              </div>

              {/* Item-by-item Approval & Pricing Table */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="font-heading text-sm font-bold text-dark-surface">
                    Items, Approved Quantities & Pricing ({itemApprovalList.length})
                  </h4>
                  <span className="text-[11px] text-secondary-bronze/70">
                    Adjust approved quantities and unit prices; line totals auto-calculate.
                  </span>
                </div>

                <div className="border border-primary-gold/15 rounded-2xl overflow-hidden divide-y divide-primary-gold/10">
                  <div className="p-3 bg-bg-warm/60 grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-secondary-bronze tracking-wider">
                    <span className="col-span-4">Item Name</span>
                    <span className="col-span-2 text-center">Requested</span>
                    <span className="col-span-2 text-right">Approved Qty</span>
                    <span className="col-span-2 text-right">Unit Price (UGX)</span>
                    <span className="col-span-2 text-right">Line Total</span>
                  </div>

                  {itemApprovalList.map((it, idx) => (
                    <div key={it.id} className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-bg-warm/20 transition-colors">
                      {/* Name */}
                      <div className="col-span-4 flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-primary-gold/10 text-primary-gold font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-dark-surface truncate">{it.name}</span>
                      </div>

                      {/* Requested */}
                      <div className="col-span-2 text-center font-semibold text-secondary-bronze">
                        {it.requested_qty} {it.unit}
                      </div>

                      {/* Approved Qty Input */}
                      <div className="col-span-2 flex justify-end items-center space-x-1">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={it.approved_qty}
                          onChange={(e) =>
                            handleItemQtyOrPriceChange(it.id, "approved_qty", parseFloat(e.target.value) || 0)
                          }
                          className="w-16 px-2 py-1 rounded-lg border border-primary-gold/30 bg-white font-bold text-right text-xs focus:border-primary-gold focus:outline-none"
                        />
                        <span className="text-secondary-bronze/70 font-semibold text-[10px]">{it.unit}</span>
                      </div>

                      {/* Unit Price Input */}
                      <div className="col-span-2 flex justify-end items-center">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="Price"
                          value={it.unit_price}
                          onChange={(e) =>
                            handleItemQtyOrPriceChange(it.id, "unit_price", parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-2 py-1 rounded-lg border border-primary-gold/30 bg-white font-bold text-right text-xs focus:border-primary-gold focus:outline-none"
                        />
                      </div>

                      {/* Line Total */}
                      <div className="col-span-2 text-right font-mono font-bold text-dark-surface">
                        UGX {Number(it.total_price || (it.approved_qty * it.unit_price)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Total Auto-Calculation Banner */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary-gold/10 via-primary-gold/5 to-transparent border border-primary-gold/30 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-primary-gold" />
                    <span className="font-bold text-dark-surface text-xs uppercase tracking-wider">
                      Requisition Grand Total (Auto-Calculated)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-secondary-bronze font-semibold mr-1.5">UGX</span>
                    <span className="font-mono text-base font-extrabold text-primary-gold">
                      {modalGrandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">
                  Admin Approval Notes / Instructions for Storekeeper (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please issue pure ghee from the fresh batch in Store 2."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/20 focus:outline-none"
                />
              </div>

              {/* Reject Form Dropdown */}
              {showRejectForm ? (
                <div className="p-4 rounded-2xl bg-error-red/5 border border-error-red/25 space-y-3">
                  <label className="font-bold text-error-red block">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide reason for rejecting this requisition..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-error-red/30 focus:border-error-red bg-white text-xs focus:outline-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-secondary-bronze/25 text-secondary-bronze font-semibold"
                    >
                      Cancel Reject
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectSubmit}
                      disabled={isSubmittingApproval || !rejectReason.trim()}
                      className="px-4 py-1.5 rounded-lg bg-error-red text-white font-semibold shadow-sm hover:brightness-105 disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-4 border-t border-primary-gold/15">
                  {selectedReq.status === "SUBMITTED_TO_ADMIN" ? (
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="px-4 py-2.5 rounded-xl border border-error-red/25 text-error-red hover:bg-error-red/10 font-semibold cursor-pointer transition-colors"
                    >
                      Reject Requisition
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowApproveModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveSubmit}
                      disabled={isSubmittingApproval}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSubmittingApproval ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>
                        {selectedReq.status === "SUBMITTED_TO_ADMIN"
                          ? "Approve & Dispatch to Storekeeper"
                          : "Save Updated Requisition Details"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 2: LIVE REQUISITION LEDGER & DISBURSED QUANTITIES
       * ========================================================================= */}
      {showDetailModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-dark-surface">
                    Live Disbursement Ledger: {selectedReq.requisition_number}
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Status: <strong className="text-primary-gold">{selectedReq.status.replace(/_/g, " ")}</strong> (
                    {selectedReq.fulfillment_progress_pct}% Fulfilled)
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
              {/* Header Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Department & Requester
                  </span>
                  <p className="font-bold text-dark-surface">{selectedReq.department}</p>
                  <p className="text-secondary-bronze">{selectedReq.requested_by_name} ({selectedReq.requested_by_role})</p>
                  <p className="text-[10px] text-secondary-bronze/60">
                    Created: {new Date(selectedReq.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                      Assigned Storekeeper
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      {selectedReq.target_shopkeeper_type === "MANUAL" ? "Manual" : "Registered"}
                    </span>
                  </div>
                  <p className="font-bold text-dark-surface">{selectedReq.target_shopkeeper_name || "Unassigned"}</p>
                  {selectedReq.target_shopkeeper_email && (
                    <p className="text-secondary-bronze/80">{selectedReq.target_shopkeeper_email}</p>
                  )}
                  {selectedReq.target_shopkeeper_phone && (
                    <p className="text-secondary-bronze/80 font-mono">{selectedReq.target_shopkeeper_phone}</p>
                  )}
                  <p className="text-[10px] text-secondary-bronze/60">{selectedReq.target_store_name || "Main Store"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Admin Approval & Total
                  </span>
                  <p className="font-bold text-dark-surface">{selectedReq.admin_name || "Pending"}</p>
                  <p className="text-secondary-bronze">
                    {selectedReq.approved_at ? new Date(selectedReq.approved_at).toLocaleDateString() : "Pending review"}
                  </p>
                  <p className="font-bold text-primary-gold text-xs pt-1">
                    Grand Total: UGX {Number(selectedReq.total_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items Breakdown Table with Pricing */}
              <div className="space-y-3">
                <h4 className="font-heading text-sm font-bold text-dark-surface">
                  Item Quantities, Pricing & Disbursement Status
                </h4>

                <div className="border border-primary-gold/15 rounded-2xl overflow-hidden divide-y divide-primary-gold/10">
                  <div className="p-3 bg-bg-warm/60 grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-secondary-bronze tracking-wider">
                    <span className="col-span-3">Item Name</span>
                    <span className="col-span-1 text-center">Req</span>
                    <span className="col-span-1 text-center">Appr</span>
                    <span className="col-span-2 text-right">Unit Price</span>
                    <span className="col-span-2 text-right">Total Price</span>
                    <span className="col-span-1 text-center text-success-green">Given</span>
                    <span className="col-span-1 text-center text-error-red">Rem</span>
                    <span className="col-span-1 text-right">Remarks</span>
                  </div>

                  {selectedReq.items?.map((it, idx) => (
                    <div key={it.id} className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-bg-warm/20 transition-colors">
                      <div className="col-span-3 flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-primary-gold/10 text-primary-gold font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-dark-surface truncate">{it.item_name}</p>
                          <span className="text-[10px] text-secondary-bronze/60">{it.category}</span>
                        </div>
                      </div>

                      <div className="col-span-1 text-center text-secondary-bronze">
                        {it.requested_qty} {it.unit}
                      </div>

                      <div className="col-span-1 text-center font-bold text-dark-surface">
                        {it.approved_qty} {it.unit}
                      </div>

                      <div className="col-span-2 text-right font-mono text-secondary-bronze">
                        {it.unit_price ? `UGX ${Number(it.unit_price).toLocaleString()}` : "—"}
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-dark-surface">
                        {it.total_price ? `UGX ${Number(it.total_price).toLocaleString()}` : "—"}
                      </div>

                      <div className="col-span-1 text-center font-bold text-success-green bg-success-green/5 py-0.5 rounded">
                        {it.issued_qty}
                      </div>

                      <div className="col-span-1 text-center font-bold text-error-red bg-error-red/5 py-0.5 rounded">
                        {it.remaining_qty}
                      </div>

                      <div className="col-span-1 text-right text-[10px] text-secondary-bronze italic truncate">
                        {it.shopkeeper_remarks || "—"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Total Row */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary-gold/10 border border-primary-gold/30 shadow-xs">
                  <span className="font-bold text-dark-surface text-xs uppercase tracking-wider">
                    Total Requisition Amount
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-secondary-bronze font-semibold mr-1.5">UGX</span>
                    <span className="font-mono text-base font-extrabold text-primary-gold">
                      {Number(
                        selectedReq.total_amount ||
                          selectedReq.items?.reduce(
                            (acc, it) =>
                              acc +
                              (Number(it.total_price) ||
                                Number(it.approved_qty || it.requested_qty) * Number(it.unit_price || 0)),
                            0
                          ) ||
                          0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedReq.shopkeeper_notes && (
                <div className="p-3.5 rounded-2xl bg-primary-gold/5 border border-primary-gold/25 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary-gold block">
                    Shopkeeper Dispatch Remarks
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
                    No receipt uploaded for this requisition yet. You can upload delivery slips, vendor invoices, or payment proofs anytime.
                  </p>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-primary-gold/15">
                <div className="flex flex-wrap items-center gap-2">
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
                    className="px-4 py-2 rounded-xl border border-gray-900 bg-gray-900 hover:bg-black text-xs font-bold text-white flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Download and print clean Black & White PDF requisition voucher"
                  >
                    <Printer className="w-3.5 h-3.5 text-white" />
                    <span>Print / Download B&W PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportSingleRequisitionToExcel(selectedReq)}
                    className="px-3.5 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title="Export this requisition voucher to Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenApprove(selectedReq);
                    }}
                    className="px-3.5 py-2 rounded-xl border border-primary-gold/30 bg-primary-gold/10 hover:bg-primary-gold/20 text-xs font-bold text-secondary-bronze flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title="Edit storekeeper details, quantities, and pricing"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-primary-gold" />
                    <span>Edit Details & Prices</span>
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
       * MODAL 3: REQUISITION RECEIPT UPLOAD, EDIT & FULL PREVIEW MODAL
       * ========================================================================= */}
      {showReceiptModal && receiptReq && (
        <RequisitionReceiptModal
          requisition={receiptReq}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          currentUserRole="ADMIN"
          currentUserName="Super Admin"
          onSuccess={() => {
            refetch();
            refetchStats();
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
