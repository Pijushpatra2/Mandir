"use client";

import React from "react";
import { Search, Printer } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function OrdersPage() {
  const {
    orders,
    globalSearch,
    setGlobalSearch,
    setSelectedOrder,
    setReceiptOrder
  } = useCanteen();

  // Filter global orders search
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.tokenNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      o.customerPhone.includes(globalSearch) ||
      o.tableName.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 min-h-[500px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Order Ledger</h3>
          <p className="text-[11px] text-gray-400">Database of all token receipts issued today</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search orders..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full sm:w-60 pl-8 pr-4 py-1.5 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-xs text-left font-sans">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold text-[9px] pb-3">
              <th className="pb-3">Token No</th>
              <th className="pb-3">Date & Time</th>
              <th className="pb-3">Devotee Name</th>
              <th className="pb-3">Table No</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 italic">
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
                  <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-bold text-gray-800 font-mono">{o.tokenNumber}</td>
                    <td className="py-3 text-gray-400 text-[10px]">
                      {o.date} • {o.timestamp}
                    </td>
                    <td className="py-3">
                      <p className="font-semibold text-gray-700">{o.customerName}</p>
                      <span className="text-[10px] text-gray-400">{o.customerPhone}</span>
                    </td>
                    <td className="py-3 text-gray-600 font-semibold">{o.tableName}</td>
                    <td className="py-3 font-bold text-gray-800">₹{o.total}</td>
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
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-2.5 py-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border-none cursor-pointer"
                      >
                        Invoice
                      </button>
                      <button
                        onClick={() => setReceiptOrder(o)}
                        className="px-2 py-1 text-[10px] text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border-none cursor-pointer"
                        title="Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
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
