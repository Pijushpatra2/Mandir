"use client";

import React, { useState } from "react";
import { Search, Printer, Trash2, FileSpreadsheet, Download, X, Calendar, CheckCircle2 } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";
import { printThermalReceipt, printA4Invoice } from "@/lib/printReceipt";
import { exportCanteenOrdersToExcel } from "@/lib/exportExcel";

export default function OrdersPage() {
  const {
    orders,
    globalSearch,
    setGlobalSearch,
    setSelectedOrder,
    setReceiptOrder,
    currentRole,
    handleBulkDeleteOrders: contextBulkDelete,
  } = useCanteen();

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [orderDateSort, setOrderDateSort] = useState<"asc" | "desc">("desc");
  const [orderDateFilter, setOrderDateFilter] = useState<string>("");

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportPreset, setExportPreset] = useState<"current" | "today" | "yesterday" | "week" | "month" | "custom" | "all" | "selected">("current");
  const [customStartDate, setCustomStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Helper to get active staff role from storage
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
      const timeA = a.createdAtMs ?? (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.createdAtMs ?? (b.date ? new Date(b.date).getTime() : 0);
      return orderDateSort === "desc" ? timeB - timeA : timeA - timeB;
    });

  // Handle Excel Export based on selected preset/range
  const handlePerformExport = () => {
    let ordersToExport: any[] = [];
    let label = "Orders";

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

    if (exportPreset === "current") {
      ordersToExport = filteredOrders;
      label = orderDateFilter ? `Date_${orderDateFilter}` : "Current_View";
    } else if (exportPreset === "today") {
      ordersToExport = orders.filter((o) => o.date === todayStr);
      label = `Today_${todayStr}`;
    } else if (exportPreset === "yesterday") {
      ordersToExport = orders.filter((o) => o.date === yesterdayStr);
      label = `Yesterday_${yesterdayStr}`;
    } else if (exportPreset === "week") {
      ordersToExport = orders.filter((o) => o.date >= sevenDaysAgoStr && o.date <= todayStr);
      label = `Last_7_Days`;
    } else if (exportPreset === "month") {
      ordersToExport = orders.filter((o) => o.date >= startOfMonthStr && o.date <= todayStr);
      label = `This_Month`;
    } else if (exportPreset === "custom") {
      ordersToExport = orders.filter((o) => o.date >= customStartDate && o.date <= customEndDate);
      label = `From_${customStartDate}_To_${customEndDate}`;
    } else if (exportPreset === "selected") {
      ordersToExport = orders.filter((o) => selectedOrderIds.includes(o.id));
      label = `Selected_${selectedOrderIds.length}_Orders`;
    } else {
      ordersToExport = orders;
      label = "All_Time";
    }

    if (ordersToExport.length === 0) {
      alert("No canteen orders found for the selected date range.");
      return;
    }

    exportCanteenOrdersToExcel(ordersToExport, label);
    setShowExportModal(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 min-h-[500px] flex flex-col text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Order Ledger</h3>
          <p className="text-[11px] text-gray-400">Database of all token receipts, POS sales, and items</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-end">
          {/* Export to Excel Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 border-none cursor-pointer shadow-md shadow-emerald-100 transition-all hover:scale-102"
            title="Export Orders to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          {/* Bulk Delete Button */}
          {isAuthorizedToDelete && selectedOrderIds.length > 0 && (
            <button
              onClick={handleBulkDeleteOrders}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 border-none cursor-pointer shadow-md shadow-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selectedOrderIds.length})
            </button>
          )}

          {/* Date filter calendar picker */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-400 font-extrabold uppercase">Filter:</span>
            <input
              type="date"
              value={orderDateFilter}
              onChange={(e) => setOrderDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white text-gray-650 font-bold"
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
            className="px-3.5 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50 hover:bg-gray-100 text-gray-650 font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Date {orderDateSort === "desc" ? "Sort ▼" : "Sort ▲"}</span>
          </button>

          {/* Search orders */}
          <div className="relative w-full sm:w-56">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search token, devotee, table..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white text-gray-700 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-xs text-left font-poppins">
          <thead>
            <tr className="border-b border-gray-100 text-slate-400 uppercase font-bold text-xs pb-3">
              {isAuthorizedToDelete && (
                <th className="pb-3 pl-3 w-8">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedOrderIds(filteredOrders.map((o) => o.id));
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
                  o.status === "COMPLETED"
                    ? "bg-gray-100 text-gray-700"
                    : o.status === "READY_TO_SERVE"
                    ? "bg-green-50 text-green-700"
                    : o.status === "PREPARING"
                    ? "bg-blue-50 text-blue-700"
                    : o.status === "CANCELLED"
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-50 text-amber-700";

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
                              setSelectedOrderIds(selectedOrderIds.filter((id) => id !== o.id));
                            }
                          }}
                          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                        />
                      </td>
                    )}
                    <td className="py-3 font-bold text-gray-800 font-mono pl-2">{o.tokenNumber}</td>
                    <td className="py-3 text-slate-500 text-xs font-mono">
                      {o.date} • {o.timestamp}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-gray-700">{o.customerName}</p>
                      <span className="text-xs text-slate-400">{o.customerPhone}</span>
                    </td>
                    <td className="py-3 text-gray-600 font-semibold">{o.tableName}</td>
                    <td className="py-3 font-bold text-gray-800 font-mono">UGX {o.total}</td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 border rounded uppercase ${payBadge}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${orderStatusBadge}`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-3 space-x-1.5">
                      <button
                        onClick={() => printA4Invoice(o)}
                        className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-none cursor-pointer"
                        title="Print A4 Invoice"
                      >
                        📄 A4 Invoice
                      </button>
                      <button
                        onClick={() => printThermalReceipt(o)}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors border-none cursor-pointer inline-flex items-center gap-1 shadow-sm"
                        title="Print Thermal Receipt Slip"
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

      {/* Date-wise Excel Export Modal Popover */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md border border-gray-200 shadow-2xl p-6 relative text-left space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Export Canteen Orders</h4>
                  <p className="text-[11px] text-gray-400">Download formatted Excel workbook (.xlsx)</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">
                Select Date Range / Filter
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "current", label: `Current Filtered (${filteredOrders.length})` },
                  { id: "today", label: "Today's Orders" },
                  { id: "yesterday", label: "Yesterday" },
                  { id: "week", label: "Last 7 Days" },
                  { id: "month", label: "This Month" },
                  { id: "all", label: `All Orders (${orders.length})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExportPreset(item.id as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      exportPreset === item.id
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    {exportPreset === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                ))}
              </div>

              {selectedOrderIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setExportPreset("selected")}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    exportPreset === "selected"
                      ? "border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
                  }`}
                >
                  <span>Selected Checkbox Rows Only ({selectedOrderIds.length} orders)</span>
                  {exportPreset === "selected" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </button>
              )}

              {/* Custom Date Range Option */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button
                  type="button"
                  onClick={() => setExportPreset("custom")}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                    exportPreset === "custom"
                      ? "border-emerald-500 bg-emerald-50/70 text-emerald-800"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" /> Custom Date Range
                  </span>
                  {exportPreset === "custom" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>

                {exportPreset === "custom" && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">From Date:</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">To Date:</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePerformExport}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border-none cursor-pointer shadow-md shadow-emerald-100 transition-all hover:scale-102"
              >
                <Download className="w-4 h-4" />
                <span>Download Excel Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
