"use client";

import React, { useState, useEffect } from "react";
import {
  useRequisitions,
  useShopkeeperFulfillRequisition,
} from "@/lib/api/requisitions";
import { getShopkeeperProfile, ShopkeeperItem } from "@/lib/shopkeeperApi";
import { StoreRequisition, StoreRequisitionItem } from "@/types/requisition.types";
import { exportRequisitionsToExcel, exportSingleRequisitionToExcel } from "@/lib/exportExcel";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Store,
  X,
  Loader2,
  Check,
  XCircle,
  TrendingUp,
  Boxes,
  Send,
  Sparkles,
  PackageCheck,
  AlertCircle,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemFulfillState {
  id: string;
  name: string;
  category: string;
  unit: string;
  approved_qty: number;
  issued_qty: number;
  remaining_qty: number;
  shopkeeper_remarks: string;
}

export default function ShopkeeperRequisitionsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<ShopkeeperItem | null>(null);

  useEffect(() => {
    getShopkeeperProfile()
      .then((p) => setProfile(p))
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  const { data: allRequisitions = [], isLoading, refetch } = useRequisitions({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    search: searchQuery || undefined,
  });

  // Filter requisitions: either assigned to this shopkeeper or unassigned/general
  const requisitions = allRequisitions.filter((req) => {
    if (!profile) return true;
    return !req.target_shopkeeper_id || req.target_shopkeeper_id === profile.id;
  });

  const fulfillMutation = useShopkeeperFulfillRequisition();

  const [selectedReq, setSelectedReq] = useState<StoreRequisition | null>(null);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [itemsFulfillList, setItemsFulfillList] = useState<ItemFulfillState[]>([]);
  const [shopkeeperNotes, setShopkeeperNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleOpenFulfill = (req: StoreRequisition) => {
    setSelectedReq(req);
    setShopkeeperNotes(req.shopkeeper_notes || "");

    if (req.items) {
      setItemsFulfillList(
        req.items.map((it) => {
          const appQty = Number(it.approved_qty || it.requested_qty);
          const issQty = Number(it.issued_qty || 0);
          const remQty = Math.max(0, appQty - issQty);
          return {
            id: it.id,
            name: it.item_name,
            category: it.category,
            unit: it.unit,
            approved_qty: appQty,
            issued_qty: issQty,
            remaining_qty: remQty,
            shopkeeper_remarks: it.shopkeeper_remarks || "",
          };
        })
      );
    }
    setShowFulfillModal(true);
  };

  const handleIssuedChange = (itemId: string, newIssued: number) => {
    setItemsFulfillList((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const clampedIssued = Math.max(0, newIssued);
          const calculatedRemaining = Math.max(0, item.approved_qty - clampedIssued);
          return {
            ...item,
            issued_qty: clampedIssued,
            remaining_qty: calculatedRemaining,
          };
        }
        return item;
      })
    );
  };

  const handleQuickGiveAll = (itemId: string) => {
    setItemsFulfillList((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            issued_qty: item.approved_qty,
            remaining_qty: 0,
          };
        }
        return item;
      })
    );
  };

  const handleQuickOutOfStock = (itemId: string) => {
    setItemsFulfillList((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            issued_qty: 0,
            remaining_qty: item.approved_qty,
            shopkeeper_remarks: item.shopkeeper_remarks || "Out of stock in store today",
          };
        }
        return item;
      })
    );
  };

  const handleRemarksChange = (itemId: string, remarks: string) => {
    setItemsFulfillList((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, shopkeeper_remarks: remarks } : item))
    );
  };

  const handleFulfillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      setIsSubmitting(true);
      await fulfillMutation.mutateAsync({
        id: selectedReq.id,
        data: {
          shopkeeper_id: profile?.id,
          shopkeeper_name: profile?.name || "Shopkeeper",
          shopkeeper_notes: shopkeeperNotes,
          items: itemsFulfillList.map((it) => ({
            id: it.id,
            issued_qty: Number(it.issued_qty),
            shopkeeper_remarks: it.shopkeeper_remarks,
          })),
        },
      });

      setSuccessToast(`Disbursement saved for ${selectedReq.requisition_number}! Updated across all dashboards.`);
      setShowFulfillModal(false);
      refetch();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update fulfillment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingDisbursement = requisitions.filter(
    (r) => r.status === "APPROVED_BY_ADMIN" || r.status === "PARTIALLY_FULFILLED"
  ).length;

  return (
    <div className="space-y-8 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface">
            Store Requisitions & Material Fulfillment
          </h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Check store inventory, enter quantities given to the canteen, and track remaining balances automatically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportRequisitionsToExcel(requisitions, "Shopkeeper_Store_Requisitions")}
            className="px-3.5 py-2 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            title="Export store requisitions and fulfillment ledger to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Excel</span>
          </button>

          <button
            onClick={() => refetch()}
            className="px-3.5 py-2 rounded-xl border border-primary-gold/25 bg-white hover:bg-bg-warm text-xs font-semibold text-secondary-bronze flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary-gold" />
            <span>Refresh Desk</span>
          </button>
        </div>
      </div>

      {/* Floating Success Alert */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-success-green/15 border border-success-green/30 text-success-green text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white border border-primary-gold/15 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
            <input
              type="text"
              placeholder="Search by REQ Number, department, requester..."
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
              <option value="ALL">All Store Requests ({requisitions.length})</option>
              <option value="APPROVED_BY_ADMIN">Ready to Fulfill ({pendingDisbursement})</option>
              <option value="PARTIALLY_FULFILLED">Partially Fulfilled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Requisition Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading store requisitions...</p>
            </div>
          ) : requisitions.length === 0 ? (
            <div className="py-16 text-center text-secondary-bronze/60 text-xs space-y-3">
              <ClipboardList className="w-8 h-8 text-primary-gold/30 mx-auto" />
              <p>No requisitions found matching your search filter.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Requisition No.</th>
                  <th className="pb-3">Department & Requester</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Items Requested</th>
                  <th className="pb-3">Disbursement Progress</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-bg-warm/25 transition-colors">
                    <td className="py-4">
                      <span className="font-mono font-bold text-dark-surface text-sm">
                        {req.requisition_number}
                      </span>
                    </td>

                    <td className="py-4">
                      <p className="font-bold text-dark-surface">{req.department}</p>
                      <p className="text-[11px] text-secondary-bronze/70">
                        Requested by: <strong>{req.requested_by_name}</strong>
                      </p>
                    </td>

                    <td className="py-4">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                          req.priority === "URGENT"
                            ? "bg-error-red/15 text-error-red border border-error-red/30"
                            : req.priority === "HIGH"
                            ? "bg-warning-amber/15 text-warning-amber border border-warning-amber/30"
                            : "bg-bg-warm text-secondary-bronze border border-primary-gold/20"
                        )}
                      >
                        {req.priority}
                      </span>
                    </td>

                    <td className="py-4 font-semibold text-secondary-bronze">
                      {req.total_items_count} item{req.total_items_count !== 1 ? "s" : ""}
                    </td>

                    <td className="py-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] text-secondary-bronze font-semibold">
                          <span>Disbursed</span>
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
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          req.status === "COMPLETED"
                            ? "bg-success-green/10 text-success-green border border-success-green/25"
                            : req.status === "PARTIALLY_FULFILLED"
                            ? "bg-primary-gold/10 text-primary-gold border border-primary-gold/25"
                            : req.status === "APPROVED_BY_ADMIN"
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "bg-warning-amber/10 text-warning-amber border border-warning-amber/25"
                        )}
                      >
                        {req.status === "APPROVED_BY_ADMIN" ? "Ready to Issue" : req.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleOpenFulfill(req)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs shadow-xs hover:brightness-105 transition-all flex items-center space-x-1.5 cursor-pointer ml-auto"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Fulfill & Issue</span>
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
       * FULFILLMENT & AUTOMATIC REMAINING QUANTITY MODAL
       * ========================================================================= */}
      {showFulfillModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-dark-surface">
                    Store Disbursement: {selectedReq.requisition_number}
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Requested by <strong>{selectedReq.requested_by_name}</strong> ({selectedReq.department})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFulfillModal(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFulfillSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Admin Notes if any */}
              {selectedReq.admin_notes && (
                <div className="p-3.5 rounded-2xl bg-primary-gold/10 border border-primary-gold/25 flex items-start space-x-2 text-secondary-bronze">
                  <Sparkles className="w-4 h-4 text-primary-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-dark-surface block">Admin Instructions:</span>
                    <p className="text-xs italic">&ldquo;{selectedReq.admin_notes}&rdquo;</p>
                  </div>
                </div>
              )}

              {/* Instructions banner */}
              <div className="p-3.5 rounded-2xl bg-bg-warm/50 border border-primary-gold/20 flex items-start space-x-2.5 text-secondary-bronze">
                <AlertCircle className="w-4 h-4 text-primary-gold shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Instructions for Storekeeper:</strong> Check your store stock. Enter the quantity you are giving today under <strong>&ldquo;Quantity Given / Issued&rdquo;</strong>. The system will <strong>automatically calculate the remaining balance</strong>. If an item is out of stock, enter <strong>0</strong> and add remarks.
                </p>
              </div>

              {/* Interactive Item Fulfillment Table */}
              <div className="space-y-3">
                <h4 className="font-heading text-sm font-bold text-dark-surface">
                  Items to Disburse ({itemsFulfillList.length})
                </h4>

                <div className="border border-primary-gold/15 rounded-2xl overflow-hidden divide-y divide-primary-gold/10">
                  <div className="p-3 bg-bg-warm/70 grid grid-cols-12 text-[10px] font-bold uppercase text-secondary-bronze tracking-wider items-center">
                    <span className="col-span-3">Item Name</span>
                    <span className="col-span-2 text-center">Approved Qty</span>
                    <span className="col-span-3 text-center">Quantity Given / Issued</span>
                    <span className="col-span-2 text-center">Auto-Remaining</span>
                    <span className="col-span-2 text-right">Remarks / Notes</span>
                  </div>

                  {itemsFulfillList.map((it, idx) => (
                    <div key={it.id} className="p-3 grid grid-cols-12 items-center hover:bg-bg-warm/20 transition-colors gap-2">
                      {/* Name */}
                      <div className="col-span-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-primary-gold/15 text-primary-gold font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-dark-surface">{it.name}</p>
                            <span className="text-[10px] text-secondary-bronze/60">{it.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Approved Qty */}
                      <div className="col-span-2 text-center font-bold text-dark-surface">
                        {it.approved_qty} {it.unit}
                      </div>

                      {/* Given Input & Quick Buttons */}
                      <div className="col-span-3 flex flex-col items-center space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            max={it.approved_qty * 2}
                            value={it.issued_qty}
                            onChange={(e) => handleIssuedChange(it.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2.5 py-1.5 rounded-xl border border-primary-gold/30 bg-white font-bold text-right text-xs focus:border-primary-gold focus:outline-none shadow-2xs"
                          />
                          <span className="text-secondary-bronze font-semibold">{it.unit}</span>
                        </div>

                        {/* Quick helper buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleQuickGiveAll(it.id)}
                            className="px-2 py-0.5 rounded-md bg-success-green/10 text-success-green hover:bg-success-green/20 text-[9px] font-bold cursor-pointer transition-colors"
                          >
                            Give All
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickOutOfStock(it.id)}
                            className="px-2 py-0.5 rounded-md bg-error-red/10 text-error-red hover:bg-error-red/20 text-[9px] font-bold cursor-pointer transition-colors"
                          >
                            Out of Stock (0)
                          </button>
                        </div>
                      </div>

                      {/* Auto Calculated Remaining */}
                      <div className="col-span-2 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold inline-block font-mono",
                            it.remaining_qty === 0
                              ? "bg-success-green/15 text-success-green border border-success-green/30"
                              : "bg-error-red/10 text-error-red border border-error-red/25"
                          )}
                        >
                          {it.remaining_qty} {it.unit}
                        </span>
                        <p className="text-[9px] text-secondary-bronze/60 mt-0.5">
                          {it.remaining_qty === 0 ? "100% Fulfilled" : "Pending Balance"}
                        </p>
                      </div>

                      {/* Remarks Input */}
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="e.g. 5kg next week"
                          value={it.shopkeeper_remarks}
                          onChange={(e) => handleRemarksChange(it.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-primary-gold/25 bg-bg-warm/20 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Dispatch Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">
                  Store Dispatch Summary Note for Canteen & Admin (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Delivered 2 items fully, 1 item partially. Restocked delivery scheduled for Tuesday morning."
                  value={shopkeeperNotes}
                  onChange={(e) => setShopkeeperNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/20 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-primary-gold/15">
                <button
                  type="button"
                  onClick={() => selectedReq && exportSingleRequisitionToExcel(selectedReq)}
                  className="px-4 py-2.5 rounded-xl border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
                  title="Export this requisition voucher to Excel"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Voucher to Excel</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowFulfillModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-bold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2 text-xs"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PackageCheck className="w-4 h-4" />
                    )}
                    <span>Confirm Dispatch & Update Dashboards</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
