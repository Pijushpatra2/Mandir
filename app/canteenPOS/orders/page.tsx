"use client";

import React, { useState } from "react";
import { Search, Printer, Trash2, FileText } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";
import { printThermalReceipt, printA4Invoice } from "@/lib/printReceipt";

export default function OrdersPage() {
  const {
    orders,
    globalSearch,
    setGlobalSearch,
    setSelectedOrder,
    setReceiptOrder,
    currentRole,
    handleBulkDeleteOrders: contextBulkDelete
  } = useCanteen();

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [orderDateSort, setOrderDateSort] = useState<"asc" | "desc">("desc");
  const [orderDateFilter, setOrderDateFilter] = useState<string>("");

  // Helper helper to get active staff role from storage
  const getActiveStaffRole = () => {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem("canteen_active_staff");
    if (!session) return null;
    try {
      return JSON.parse(session).assignedRole;
    } catch (e) {
      return null;
    }
  };

  const activeStaffRole = getActiveStaffRole();

  const isAuthorizedToDelete =
    currentRole === "manager" ||
    activeStaffRole === "manager" ||
    activeStaffRole === "admin" ||
    (typeof window !== "undefined" && !!localStorage.getItem("admin_access_token"));

  const handleBulkDeleteOrders = async () => {
    if (!isAuthorizedToDelete) {
      alert("Only Canteen Managers and Admins are authorized to delete tokens.");
      return;
    }
    if (selectedOrderIds.length === 0) return;
    if (confirm(`Are you sure you want to delete the ${selectedOrderIds.length} selected orders?`)) {
      const success = await contextBulkDelete(selectedOrderIds);
      if (success) {
        setSelectedOrderIds([]);
      }
    }
  };

  // Filter global orders search
  const filteredOrders = orders
    .filter((o) => {
      const matchesSearch =
        o.tokenNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
        o.customerPhone.includes(globalSearch) ||
        o.tableName.toLowerCase().includes(globalSearch.toLowerCase());
      
      const matchesDate = !orderDateFilter || o.date === orderDateFilter;
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timestamp || "00:00:00"}`).getTime();
      const dateB = new Date(`${b.date}T${b.timestamp || "00:00:00"}`).getTime();
      return orderDateSort === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 min-h-[500px] flex flex-col text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Order Ledger</h3>
          <p className="text-[11px] text-gray-400">Database of all token receipts issued today</p>
        </div>
        <div className="flex items-center gap-3.5 flex-wrap w-full lg:w-auto justify-end">
          {/* Bulk Delete Button - only visible if authorized and rows selected */}
          {isAuthorizedToDelete && selectedOrderIds.length > 0 && (
            <button
              onClick={handleBulkDeleteOrders}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-750 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 border-none cursor-pointer shadow-md shadow-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedOrderIds.length})
            </button>
          )}

          {/* Date filter calendar picker */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-400 font-extrabold uppercase">Filter:</span>
            <input
              type="date"
              value={orderDateFilter}
              onChange={(e) => setOrderDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white text-gray-655 font-bold"
            />
            {orderDateFilter && (
              <button
                onClick={() => setOrderDateFilter("")}
                className="text-xs text-red-500 font-bold border-none bg-transparent cursor-pointer hover:underline px-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Date Toggle Button */}
          <button
            onClick={() => setOrderDateSort(orderDateSort === "desc" ? "asc" : "desc")}
            className="px-3.5 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50 hover:bg-gray-100 text-gray-655 font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Date {orderDateSort === "desc" ? "Sort ▼" : "Sort ▲"}</span>
          </button>

          {/* Search orders */}
          <div className="relative w-full sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search orders..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white text-gray-700 font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-xs text-left font-sans">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[9px] pb-3">
              {isAuthorizedToDelete && (
                <th className="pb-3 pl-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrderIds(filteredOrders.map(o => o.id));
                      } else {
                        setSelectedOrderIds([]);
                      }
                    }}
                    className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </th>
              )}
              <th className="pb-3 pl-2">Token No</th>
              <th className="pb-3">Date & Time</th>
              <th className="pb-3">Devotee Name</th>
              <th className="pb-3">Table No</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right pr-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={isAuthorizedToDelete ? 9 : 8} className="py-12 text-center text-gray-400 italic">
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const payBadge =
                  o.paymentStatus === "PAID"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200";

                const orderStatusBadge =
                  o.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                  o.status === "READY_TO_SERVE" ? "bg-green-50 text-green-700" :
                  o.status === "PREPARING" ? "bg-blue-50 text-blue-700" :
                  o.status === "CANCELLED" ? "bg-red-100 text-red-600" :
                  "bg-amber-50 text-amber-700";

                return (
                  <tr
                    key={o.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      isAuthorizedToDelete && selectedOrderIds.includes(o.id) ? "bg-blue-50/20" : ""
                    }`}
                  >
                    {isAuthorizedToDelete && (
                      <td className="py-3 pl-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(o.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderIds([...selectedOrderIds, o.id]);
                            } else {
                              setSelectedOrderIds(selectedOrderIds.filter(id => id !== o.id));
                            }
                          }}
                          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                      </td>
                    )}
                    <td className="py-3 font-bold text-gray-800 font-mono pl-2">{o.tokenNumber}</td>
                    <td className="py-3 text-gray-400 text-[10px]">
                      {o.date} • {o.timestamp}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-gray-700">{o.customerName}</p>
                      <span className="text-[10px] text-gray-400">{o.customerPhone}</span>
                    </td>
                    <td className="py-3 text-gray-600 font-semibold">{o.tableName}</td>
                    <td className="py-3 font-bold text-gray-800">UGX {o.total}</td>
                    <td className="py-3">
                      <span className={`text-[8px] font-bold px-2 py-0.5 border rounded uppercase ${payBadge}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${orderStatusBadge}`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-3 space-x-1.5">
                      <button
                        onClick={() => printA4Invoice(o)}
                        className="px-2.5 py-1 text-[10px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-none cursor-pointer"
                        title="Print A4 Invoice"
                      >
                        📄 A4 Invoice
                      </button>
                      <button
                        onClick={() => printThermalReceipt(o, { rollWidth: "80mm" })}
                        className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors border-none cursor-pointer inline-flex items-center gap-1 shadow-sm"
                        title="Print 80mm Thermal Receipt"
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
    </div>
  );
}
