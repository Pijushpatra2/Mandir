"use client";

import React from "react";
import { CheckCircle, Clock, Loader2, ChefHat } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function KitchenPage() {
  const { orders, handleUpdateOrderStatus } = useCanteen();

  const activeOrders = orders.filter(o =>
    o.status === "NEW" || o.status === "PREPARING" || o.status === "READY_TO_SERVE"
  );

  return (
    <div className="space-y-5">
      {/* KDS Header */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">Kitchen Display System</h2>
            <p className="text-[10px] text-slate-400">Live order queue — update status as food is prepared</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-amber-400">{activeOrders.length}</span>
          <p className="text-[10px] text-slate-400">Active tickets</p>
        </div>
      </div>

      {/* Order Ticket Grid */}
      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <ChefHat className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-300">All caught up! No active orders in queue.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-3xl border-2 p-5 shadow-sm space-y-4 ${
                order.status === "NEW" ? "border-amber-300 bg-amber-50/20" :
                order.status === "PREPARING" ? "border-blue-300 bg-blue-50/20" :
                "border-green-300 bg-green-50/20"
              }`}
            >
              {/* Token & Table */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Token</span>
                  <h3 className="text-xl font-black text-slate-900 font-mono">{order.tokenNumber}</h3>
                  <p className="text-[10px] text-gray-500 font-semibold">{order.tableName} • {order.customerName}</p>
                </div>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${
                  order.status === "NEW" ? "bg-amber-100 text-amber-700" :
                  order.status === "PREPARING" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {order.status === "READY_TO_SERVE" ? "Ready" : order.status}
                </span>
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 pt-3 space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-sans">
                    <span className="font-semibold text-gray-700">{item.item.name}</span>
                    <span className="font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded-lg">×{item.qty}</span>
                  </div>
                ))}
                {order.note && (
                  <p className="text-[9px] text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-lg mt-1">
                    📝 {order.note}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 border-t border-gray-100 pt-3">
                {order.status === "NEW" && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black transition-colors border-none cursor-pointer shadow-sm"
                  >
                    <Loader2 className="w-3.5 h-3.5" /> Start Cooking
                  </button>
                )}
                {order.status === "PREPARING" && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, "READY_TO_SERVE")}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-black transition-colors border-none cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
                  </button>
                )}
                {order.status === "READY_TO_SERVE" && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, "COMPLETED")}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl text-[10px] font-black transition-colors border-none cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Served & Done
                  </button>
                )}
              </div>

              <p className="text-[9px] text-gray-300 text-right font-mono">{order.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
