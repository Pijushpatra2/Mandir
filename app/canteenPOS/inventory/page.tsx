"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function InventoryPage() {
  const {
    inventory,
    setInventory,
    suppliers,
    wasteLogs,
    setWasteLogs,
    setShowWasteModal,
    saveState
  } = useCanteen();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Stock Ledger list (8 cols) */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Stock Ledger</h3>
            <p className="text-[11px] text-gray-400">Raw materials inventory management</p>
          </div>
          <button
            onClick={() => setShowWasteModal(true)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 border-none cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Log Waste Loss
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px] pb-2.5">
                <th className="pb-2.5">Raw Item Name</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Stock Level</th>
                <th className="pb-2.5">Safety Level</th>
                <th className="pb-2.5">Supplier</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventory.map((invItem) => {
                const isLow = invItem.stock <= invItem.minStock;
                const supName = suppliers.find(s => s.id === invItem.supplierId)?.name || "Local purchase";
                return (
                  <tr key={invItem.id} className={`hover:bg-gray-50/50 transition-colors ${isLow ? "bg-red-50/20" : ""}`}>
                    <td className="py-2.5">
                      <p className="font-bold text-gray-800">{invItem.name}</p>
                      {isLow && <span className="text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">Low stock warning</span>}
                    </td>
                    <td className="py-2.5 text-gray-500 font-semibold">{invItem.category}</td>
                    <td className={`py-2.5 font-bold ${isLow ? "text-red-500" : "text-gray-800"}`}>
                      {invItem.stock} {invItem.unit}
                    </td>
                    <td className="py-2.5 text-gray-400 font-semibold">{invItem.minStock} {invItem.unit}</td>
                    <td className="py-2.5 text-gray-600">{supName}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => {
                          const newStock = prompt(`Update stock level of ${invItem.name}:`, String(invItem.stock));
                          if (newStock !== null) {
                            const updated = inventory.map(item => item.id === invItem.id ? { ...item, stock: Number(newStock) || 0 } : item);
                            setInventory(updated);
                            saveState("canteen_inventory", updated);
                          }
                        }}
                        className="px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded text-[9px] font-bold text-gray-700 transition-colors border border-gray-100 cursor-pointer"
                      >
                        Modify Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suppliers & Waste Logs (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Supplier Directory */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            Food Distributors
          </h3>
          <div className="space-y-3 text-xs font-sans">
            {suppliers.map(sup => (
              <div key={sup.id} className="p-3 border border-gray-50 rounded-2xl bg-gray-50/50 space-y-1">
                <h5 className="font-bold text-gray-700">{sup.name}</h5>
                <p className="text-[10px] text-gray-400">Phone: {sup.phone}</p>
                <p className="text-[10px] text-gray-400 truncate">Email: {sup.email}</p>
                <div className="flex gap-1.5 flex-wrap pt-1.5">
                  {sup.itemsSupplied.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waste register list */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            Recent Waste Log Losses
          </h3>
          <div className="space-y-3">
            {wasteLogs.map((log: any) => (
              <div key={log.id} className="flex justify-between items-center text-xs font-sans p-2.5 border border-gray-50 rounded-xl bg-gray-50/50">
                <div>
                  <h5 className="font-bold text-gray-700">{log.name}</h5>
                  <span className="text-[9px] text-red-500 font-bold">{log.qty} {log.unit} • {log.reason}</span>
                </div>
                <span className="font-bold text-red-600">UGX {log.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
