"use client";

import React from "react";
import { TrendingUp, ShoppingCart, Users, IndianRupee } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function ReportsPage() {
  const { orders, customers, getTodaySales, getTodayOrdersCount, getAverageOrderValue } = useCanteen();

  const completedOrders = orders.filter(o => o.status === "COMPLETED");
  const totalRevenue = orders.filter(o => o.paymentStatus === "PAID").reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingAmount = orders.filter(o => o.paymentStatus === "PENDING").reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Category-wise breakdown from all orders
  const itemSales: Record<string, { qty: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach(i => {
      if (!itemSales[i.item.name]) itemSales[i.item.name] = { qty: 0, revenue: 0 };
      itemSales[i.item.name].qty += i.qty;
      itemSales[i.item.name].revenue += i.item.price * i.qty;
    });
  });
  const topItems = Object.entries(itemSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase text-gray-400">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-green-500" />
          </div>
          <h4 className="text-xl font-black text-gray-900">UGX {totalRevenue.toLocaleString("en-IN")}</h4>
          <p className="text-[9px] text-green-600 font-bold mt-1">All settled payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase text-gray-400">Today's Sales</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <h4 className="text-xl font-black text-gray-900">UGX {getTodaySales().toLocaleString("en-IN")}</h4>
          <p className="text-[9px] text-blue-600 font-bold mt-1">{getTodayOrdersCount()} orders today</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase text-gray-400">Avg Order Value</span>
            <ShoppingCart className="w-4 h-4 text-purple-500" />
          </div>
          <h4 className="text-xl font-black text-gray-900">UGX {getAverageOrderValue()}</h4>
          <p className="text-[9px] text-purple-600 font-bold mt-1">Per transaction</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-400">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase text-red-500">Pending Amount</span>
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <h4 className="text-xl font-black text-gray-900">UGX {pendingAmount.toLocaleString("en-IN")}</h4>
          <p className="text-[9px] text-red-500 font-bold mt-1">Uncollected bills</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Items */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-3 mb-4">
            Top Selling Items
          </h3>
          <div className="space-y-3">
            {topItems.map(([name, data], idx) => {
              const maxRevenue = topItems[0]?.[1].revenue || 1;
              const pct = Math.round((data.revenue / maxRevenue) * 100);
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-black text-[9px] text-gray-500">{idx + 1}</span>
                      <span className="font-bold text-gray-800">{name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-blue-600">UGX {data.revenue}</span>
                      <span className="text-gray-400 text-[9px] ml-2">({data.qty} sold)</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Breakdown & Orders Summary */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
              Payment Method Breakdown
            </h3>
            {["CASH", "UPI", "CARD", "PENDING"].map(method => {
              const count = orders.filter(o => o.paymentMethod === method).length;
              const revenue = orders.filter(o => o.paymentMethod === method).reduce((s, o) => s + (Number(o.total) || 0), 0);
              const colors: Record<string, string> = { CASH: "bg-green-50 text-green-700", UPI: "bg-blue-50 text-blue-700", CARD: "bg-violet-50 text-violet-700", PENDING: "bg-red-50 text-red-700" };
              const label = method === "UPI" ? "Mobile Money" : method;
              return (
                <div key={method} className={`flex justify-between items-center p-2.5 rounded-xl ${colors[method]}`}>
                  <div>
                    <span className="text-[10px] font-black uppercase">{label}</span>
                    <p className="text-[9px] opacity-70">{count} transactions</p>
                  </div>
                  <span className="font-black text-sm">UGX {revenue.toLocaleString("en-UG")}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
              Order Status Overview
            </h3>
            {["NEW", "PREPARING", "READY_TO_SERVE", "COMPLETED", "CANCELLED"].map(status => {
              const count = orders.filter(o => o.status === status).length;
              return (
                <div key={status} className="flex justify-between items-center text-xs font-sans">
                  <span className="font-semibold text-gray-600">{status.replace(/_/g, " ")}</span>
                  <span className="font-black text-gray-800 bg-gray-100 px-2 py-0.5 rounded-lg">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
