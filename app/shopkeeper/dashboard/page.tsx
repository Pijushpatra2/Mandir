"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { useRequisitions, useRequisitionStats } from "@/lib/api/requisitions";
import { getShopkeeperProfile, ShopkeeperItem } from "@/lib/shopkeeperApi";
import {
  ClipboardList,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PackageCheck,
  ArrowUpRight,
  RefreshCw,
  Store,
  KeyRound,
  Loader2,
  ChevronRight,
  Sparkles,
  Send,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShopkeeperDashboardPage() {
  const [profile, setProfile] = useState<ShopkeeperItem | null>(null);

  useEffect(() => {
    getShopkeeperProfile()
      .then((p) => setProfile(p))
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  const { data: allRequisitions = [], isLoading: loadingReqs, refetch: refetchReqs } = useRequisitions();
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useRequisitionStats(profile?.id);

  const requisitions = allRequisitions.filter((req) => {
    if (!profile) return true;
    return !req.target_shopkeeper_id || req.target_shopkeeper_id === profile.id;
  });

  const pendingRequisitions = requisitions.filter(
    (r) => r.status === "APPROVED_BY_ADMIN" || r.status === "PARTIALLY_FULFILLED"
  );
  const recentRequisitions = requisitions.slice(0, 6);

  const handleRefresh = () => {
    refetchReqs();
    refetchStats();
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface">
              Storekeeper Fulfillment Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-gold/15 text-primary-gold font-bold text-[10px] uppercase tracking-wider">
              {profile?.store_name || "Main Temple Store"}
            </span>
          </div>
          <p className="text-xs text-secondary-bronze/75 mt-1">
            Fulfill departmental store requisitions, disburse groceries & raw materials, and track remaining balances.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl border border-primary-gold/25 bg-white hover:bg-bg-warm/60 text-xs font-semibold text-secondary-bronze flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary-gold" />
            <span>Refresh Desk</span>
          </button>

          <Link
            href="/shopkeeper/requisitions"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-bold shadow-md hover:brightness-105 transition-all flex items-center space-x-1.5"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Active Requests ({pendingRequisitions.length})</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Ready to Issue */}
        <div className="bg-white border border-primary-gold/20 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary-gold/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-warning-amber">
              Ready to Issue / Fulfill
            </span>
            <div className="w-9 h-9 rounded-xl bg-warning-amber/10 text-warning-amber flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-dark-surface">
              {loadingStats ? "..." : stats?.approvedPendingShopkeeper ?? requisitions.filter((r) => r.status === "APPROVED_BY_ADMIN").length}
            </h3>
            <p className="text-[11px] text-secondary-bronze/60 mt-1">
              Approved by Admin, awaiting store dispatch
            </p>
          </div>
        </div>

        {/* Metric 2: Partially Fulfilled (Balance Pending) */}
        <div className="bg-white border border-primary-gold/20 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary-gold/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary-gold">
              Partially Disbursed
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary-gold/10 text-primary-gold flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-primary-gold">
              {loadingStats ? "..." : stats?.partiallyFulfilled ?? requisitions.filter((r) => r.status === "PARTIALLY_FULFILLED").length}
            </h3>
            <p className="text-[11px] text-secondary-bronze/60 mt-1">
              Remaining items balance to supply
            </p>
          </div>
        </div>

        {/* Metric 3: Total Completed */}
        <div className="bg-white border border-primary-gold/20 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary-gold/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-success-green">
              Completed Requisitions
            </span>
            <div className="w-9 h-9 rounded-xl bg-success-green/10 text-success-green flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-success-green">
              {loadingStats ? "..." : stats?.completed ?? requisitions.filter((r) => r.status === "COMPLETED").length}
            </h3>
            <p className="text-[11px] text-secondary-bronze/60 mt-1">
              100% fulfilled & received
            </p>
          </div>
        </div>

        {/* Metric 4: Total Assigned Requisitions */}
        <div className="bg-white border border-primary-gold/20 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary-gold/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/70">
              Total Assigned Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-secondary-bronze/10 text-secondary-bronze flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-heading text-dark-surface">
              {loadingStats ? "..." : stats?.totalRequisitions ?? requisitions.length}
            </h3>
            <p className="text-[11px] text-secondary-bronze/60 mt-1">
              All time store requests
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/shopkeeper/requisitions"
          className="p-5 rounded-2xl bg-gradient-to-br from-white to-primary-gold/5 border border-primary-gold/25 hover:border-primary-gold transition-all shadow-xs group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-primary-gold/60 group-hover:text-primary-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h4 className="font-heading text-base font-bold text-dark-surface">
            Fulfill Store Requests
          </h4>
          <p className="text-xs text-secondary-bronze/70 mt-1">
            Input quantities given to canteen staff with automatic remaining balance tracking.
          </p>
        </Link>

        <Link
          href="/shopkeeper/inventory"
          className="p-5 rounded-2xl bg-gradient-to-br from-white to-primary-gold/5 border border-primary-gold/25 hover:border-primary-gold transition-all shadow-xs group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-primary-gold/60 group-hover:text-primary-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h4 className="font-heading text-base font-bold text-dark-surface">
            Store Inventory Stock
          </h4>
          <p className="text-xs text-secondary-bronze/70 mt-1">
            Quickly monitor in-store stock levels and adjust available quantities.
          </p>
        </Link>

        <Link
          href="/shopkeeper/profile"
          className="p-5 rounded-2xl bg-gradient-to-br from-white to-primary-gold/5 border border-primary-gold/25 hover:border-primary-gold transition-all shadow-xs group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center group-hover:scale-110 transition-transform">
              <KeyRound className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-primary-gold/60 group-hover:text-primary-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h4 className="font-heading text-base font-bold text-dark-surface">
            Security & Password
          </h4>
          <p className="text-xs text-secondary-bronze/70 mt-1">
            Update personal shopkeeper password and counter details.
          </p>
        </Link>
      </div>

      {/* Recent Assigned Requisitions Feed */}
      <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-dark-surface">
              Recent Store Requisitions Queue
            </h3>
            <p className="text-xs text-secondary-bronze/70">
              Latest material requests approved by Admin assigned to your store counter.
            </p>
          </div>
          <Link
            href="/shopkeeper/requisitions"
            className="text-xs font-semibold text-primary-gold hover:underline flex items-center space-x-1"
          >
            <span>View All ({requisitions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingReqs ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
            <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
            <p className="text-xs">Loading requisitions...</p>
          </div>
        ) : recentRequisitions.length === 0 ? (
          <div className="py-10 text-center text-xs text-secondary-bronze/60 space-y-2">
            <ClipboardList className="w-8 h-8 text-primary-gold/30 mx-auto" />
            <p>No store requisitions assigned yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Requisition No.</th>
                  <th className="pb-3">Department & Requester</th>
                  <th className="pb-3">Items Count</th>
                  <th className="pb-3">Disbursed</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {recentRequisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-bg-warm/30 transition-colors">
                    <td className="py-3.5 font-bold font-mono text-dark-surface">
                      {req.requisition_number}
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-dark-surface">{req.department}</p>
                      <p className="text-[11px] text-secondary-bronze/70">{req.requested_by_name}</p>
                    </td>
                    <td className="py-3.5 font-semibold text-secondary-bronze">
                      {req.total_items_count} item{req.total_items_count !== 1 ? "s" : ""}
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-dark-surface">
                        {Number(req.fulfillment_progress_pct || 0)}%
                      </span>
                    </td>
                    <td className="py-3.5">
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
                    <td className="py-3.5 text-secondary-bronze/70">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href="/shopkeeper/requisitions"
                        className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs shadow-2xs hover:brightness-105 transition-all inline-block"
                      >
                        Fulfill
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
