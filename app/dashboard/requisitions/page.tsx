"use client";

import React, { useState, useEffect } from "react";
import {
  useRequisitions,
  useRequisitionStats,
  useAdminApproveRequisition,
  useAdminRejectRequisition,
} from "@/lib/api/requisitions";
import { adminListShopkeepers, ShopkeeperItem } from "@/lib/shopkeeperApi";
import { StoreRequisition, StoreRequisitionItem } from "@/types/requisition.types";
import { GlassCard } from "@/components/ui/GlassCard";
import { exportRequisitionsToExcel, exportSingleRequisitionToExcel } from "@/lib/exportExcel";
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
  Download
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
  const rejectMutation = useAdminRejectRequisition();

  // Modals state
  const [selectedReq, setSelectedReq] = useState<StoreRequisition | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Approval Form State
  const [selectedShopkeeperId, setSelectedShopkeeperId] = useState("");
  const [selectedShopkeeperName, setSelectedShopkeeperName] = useState("");
  const [selectedStoreName, setSelectedStoreName] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [itemApprovalList, setItemApprovalList] = useState<
    Array<{ id: string; name: string; requested_qty: number; approved_qty: number; unit: string }>
  >([]);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

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
    setSelectedShopkeeperId(req.target_shopkeeper_id || (shopkeepers[0]?.id ?? ""));
    const foundShop = shopkeepers.find((s) => s.id === (req.target_shopkeeper_id || shopkeepers[0]?.id));
    setSelectedShopkeeperName(foundShop?.name || req.target_shopkeeper_name || "Main Storekeeper");
    setSelectedStoreName(foundShop?.store_name || req.target_store_name || "Main Temple Provisions Store");
    setAdminNotes(req.admin_notes || "");
    setShowRejectForm(false);
    setRejectReason("");

    if (req.items) {
      setItemApprovalList(
        req.items.map((it) => ({
          id: it.id,
          name: it.item_name,
          requested_qty: Number(it.requested_qty),
          approved_qty: Number(it.approved_qty || it.requested_qty),
          unit: it.unit,
        }))
      );
    }
    setShowApproveModal(true);
  };

  const handleOpenDetails = (req: StoreRequisition) => {
    setSelectedReq(req);
    setShowDetailModal(true);
  };

  const handleShopkeeperChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = e.target.value;
    setSelectedShopkeeperId(sId);
    const found = shopkeepers.find((s) => s.id === sId);
    if (found) {
      setSelectedShopkeeperName(found.name);
      setSelectedStoreName(found.store_name || "Main Temple Store");
    }
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      setIsSubmittingApproval(true);
      await approveMutation.mutateAsync({
        id: selectedReq.id,
        data: {
          admin_name: "Super Admin",
          admin_notes: adminNotes,
          target_shopkeeper_id: selectedShopkeeperId || undefined,
          target_shopkeeper_name: selectedShopkeeperName || undefined,
          target_store_name: selectedStoreName || undefined,
          items: itemApprovalList.map((it) => ({
            id: it.id,
            approved_qty: Number(it.approved_qty),
            item_status: "APPROVED",
          })),
        },
      });

      setShowApproveModal(false);
      refetch();
      refetchStats();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to approve requisition");
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
                  <th className="pb-3">Items Count</th>
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
                        <div className="flex items-center space-x-1.5">
                          <Store className="w-3.5 h-3.5 text-primary-gold" />
                          <span>{req.target_shopkeeper_name}</span>
                        </div>
                      ) : (
                        <span className="text-secondary-bronze/50 italic">Unassigned (Pending Admin)</span>
                      )}
                    </td>

                    {/* Items count */}
                    <td className="py-4 text-dark-surface font-semibold">
                      {req.total_items_count} item{req.total_items_count !== 1 ? "s" : ""}
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
                      <div className="flex items-center justify-end space-x-2">
                        {req.status === "SUBMITTED_TO_ADMIN" ? (
                          <button
                            onClick={() => handleOpenApprove(req)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs shadow-xs hover:brightness-105 transition-all flex items-center space-x-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Review & Assign</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDetails(req)}
                            className="px-3 py-1.5 rounded-xl border border-primary-gold/25 text-primary-gold hover:bg-primary-gold/10 font-semibold transition-colors text-xs flex items-center space-x-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Live Ledger</span>
                          </button>
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
       * MODAL 1: ADMIN REVIEW, QUANTITY ADJUSTMENT & SHOPKEEPER ASSIGNMENT
       * ========================================================================= */}
      {showApproveModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-dark-surface">
                    Admin Approval: {selectedReq.requisition_number}
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Requested by <strong>{selectedReq.requested_by_name}</strong> for <strong>{selectedReq.department}</strong>
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

              {/* Shopkeeper Assignment Selector */}
              <div className="p-4 rounded-2xl bg-primary-gold/5 border border-primary-gold/25 space-y-3">
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4 text-primary-gold" />
                  <span className="font-heading text-sm font-bold text-dark-surface">
                    Select & Assign Target Shopkeeper / Store
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">Assigned Shopkeeper *</label>
                    <select
                      value={selectedShopkeeperId}
                      onChange={handleShopkeeperChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-xs font-semibold focus:outline-none"
                    >
                      {shopkeepers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.store_name || "Main Store"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">Target Store Counter</label>
                    <input
                      type="text"
                      value={selectedStoreName}
                      onChange={(e) => setSelectedStoreName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Item-by-item Approval Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-heading text-sm font-bold text-dark-surface">
                    Requested Items & Approved Quantities ({itemApprovalList.length})
                  </h4>
                  <span className="text-[11px] text-secondary-bronze/70">
                    You can adjust approved quantities before sending to shopkeeper
                  </span>
                </div>

                <div className="border border-primary-gold/15 rounded-2xl overflow-hidden divide-y divide-primary-gold/10">
                  <div className="p-3 bg-bg-warm/50 grid grid-cols-12 text-[10px] font-bold uppercase text-secondary-bronze tracking-wider">
                    <span className="col-span-6">Item Name</span>
                    <span className="col-span-3 text-center">Requested Qty</span>
                    <span className="col-span-3 text-right">Approved Qty</span>
                  </div>

                  {itemApprovalList.map((it, idx) => (
                    <div key={it.id} className="p-3 grid grid-cols-12 items-center hover:bg-bg-warm/20 transition-colors">
                      <div className="col-span-6 flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-primary-gold/10 text-primary-gold font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-dark-surface">{it.name}</span>
                      </div>

                      <div className="col-span-3 text-center font-semibold text-secondary-bronze">
                        {it.requested_qty} {it.unit}
                      </div>

                      <div className="col-span-3 flex justify-end items-center space-x-1">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={it.approved_qty}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setItemApprovalList((prev) =>
                              prev.map((p) => (p.id === it.id ? { ...p, approved_qty: val } : p))
                            );
                          }}
                          className="w-20 px-2 py-1 rounded-lg border border-primary-gold/30 bg-white font-bold text-right text-xs focus:border-primary-gold focus:outline-none"
                        />
                        <span className="text-secondary-bronze/70 font-semibold">{it.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">
                  Admin Approval Notes / Instructions for Shopkeeper (Optional)
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
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="px-4 py-2.5 rounded-xl border border-error-red/25 text-error-red hover:bg-error-red/10 font-semibold cursor-pointer transition-colors"
                  >
                    Reject Requisition
                  </button>

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
                      <span>Approve & Dispatch to Shopkeeper</span>
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
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
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
                  <p className="text-secondary-bronze">{selectedReq.requested_by_name}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Assigned Shopkeeper
                  </span>
                  <p className="font-bold text-dark-surface">{selectedReq.target_shopkeeper_name || "Unassigned"}</p>
                  <p className="text-secondary-bronze">{selectedReq.target_store_name || "Main Store"}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/60 block">
                    Admin Approval
                  </span>
                  <p className="font-bold text-dark-surface">{selectedReq.admin_name || "Pending"}</p>
                  <p className="text-secondary-bronze">
                    {selectedReq.approved_at ? new Date(selectedReq.approved_at).toLocaleDateString() : "Pending review"}
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
                    <span className="col-span-2 text-center text-success-green">Given</span>
                    <span className="col-span-2 text-center text-error-red">Remaining</span>
                    <span className="col-span-2 text-right">Remarks</span>
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
    </div>
  );
}
