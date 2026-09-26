"use client";

import React from "react";
import CanteenRequisitionsView from "@/components/canteen/CanteenRequisitionsView";
import { useCanteen } from "../context/CanteenContext";

export default function CanteenPOSRequisitionsPage() {
  const { currentRole, isAdminMode } = useCanteen();

  // Try to get active staff from storage if available
  let staffName = "Canteen Manager";
  let staffId: string | undefined = undefined;

  if (typeof window !== "undefined") {
    try {
      const savedStaff = localStorage.getItem("canteen_active_staff");
      if (savedStaff) {
        const parsed = JSON.parse(savedStaff);
        if (parsed?.name) staffName = parsed.name;
        if (parsed?.id) staffId = String(parsed.id);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <CanteenRequisitionsView
        requesterName={staffName}
        requesterId={staffId}
        requesterRole={isAdminMode ? "ADMIN" : (currentRole ? currentRole.toUpperCase() : "CANTEEN_MANAGER")}
        isAdminMode={isAdminMode}
      />
    </div>
  );
}
