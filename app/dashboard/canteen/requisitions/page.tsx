"use client";

import React from "react";
import CanteenRequisitionsView from "@/components/canteen/CanteenRequisitionsView";
import Link from "next/link";
import { ArrowLeft, Coffee } from "lucide-react";

export default function DashboardCanteenRequisitionsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left font-poppins">
      {/* Top breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/dashboard/canteen" className="flex items-center gap-1 hover:text-[#B47F35] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Canteen CRM</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Store Requisitions</span>
        </div>
      </div>

      <CanteenRequisitionsView
        requesterName="Canteen Management"
        requesterRole="CANTEEN_MANAGER"
      />
    </div>
  );
}
