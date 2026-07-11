"use client";

import React, { useState } from "react";
import { TrendingUp, ShoppingCart, Users, Download, LogOut, ClipboardList, Calendar } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function ReportsPage() {
  const {
    orders,
    customers,
    getTodaySales,
    getTodayOrdersCount,
    getAverageOrderValue,
    posSession,
    closePosSession
  } = useCanteen();

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [actualCash, setActualCash] = useState("");

  const completedOrders = orders.filter(o => o.status === "COMPLETED" || o.paymentStatus === "PAID");
  const totalRevenue = orders.filter(o => o.paymentStatus === "PAID").reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingAmount = orders.filter(o => o.paymentStatus === "PENDING").reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Today's orders
  const todayStr = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter(o => {
    const oDate = o.date || todayStr;
    return oDate === todayStr;
  });

  // Calculate items sold today
  let todayItemsSold = 0;
  const todayItemsBreakdown: Record<string, { qty: number; revenue: number }> = {};
  todayOrders.forEach(o => {
    if (o.status !== "CANCELLED") {
      o.items.forEach(i => {
        todayItemsSold += i.qty;
        if (!todayItemsBreakdown[i.item.name]) {
          todayItemsBreakdown[i.item.name] = { qty: 0, revenue: 0 };
        }
        todayItemsBreakdown[i.item.name].qty += i.qty;
        todayItemsBreakdown[i.item.name].revenue += i.item.price * i.qty;
      });
    }
  });

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

  // Cash sales calculation
  const todayCashSales = todayOrders
    .filter(o => o.paymentMethod === "CASH" && o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const expectedCashInHand = (posSession?.openingCash || 0) + todayCashSales;

  const downloadClosingReport = (actualCashAmt?: number) => {
    const timeStr = new Date().toLocaleTimeString();
    
    let r = `=========================================\n`;
    r += `          DAILY CLOSING REPORT\n`;
    r += `=========================================\n`;
    r += `Date: ${todayStr}\n`;
    r += `Printed: ${todayStr} ${timeStr}\n`;
    if (posSession) {
      r += `Cashier: ${posSession.cashierName}\n`;
      r += `Session Opened: ${new Date(posSession.startTime).toLocaleTimeString()}\n`;
    }
    r += `-----------------------------------------\n\n`;
    
    r += `SUMMARY STATS:\n`;
    r += `-----------------------------------------\n`;
    r += `Total Orders Today : ${todayOrders.length}\n`;
    r += `Total Items Sold   : ${todayItemsSold}\n`;
    r += `Total Sales Value  : UGX ${getTodaySales().toLocaleString("en-UG")}\n`;
    r += `Average Order Value: UGX ${getAverageOrderValue().toLocaleString("en-UG")}\n\n`;
    
    r += `CASH DRAWER RECONCILIATION:\n`;
    r += `-----------------------------------------\n`;
    r += `Opening Cash       : UGX ${(posSession?.openingCash || 0).toLocaleString("en-UG")}\n`;
    r += `Cash Sales Today   : UGX ${todayCashSales.toLocaleString("en-UG")}\n`;
    r += `Expected Cash      : UGX ${expectedCashInHand.toLocaleString("en-UG")}\n`;
    if (actualCashAmt !== undefined) {
      const variance = actualCashAmt - expectedCashInHand;
      r += `Actual Cash In Hand: UGX ${actualCashAmt.toLocaleString("en-UG")}\n`;
      r += `Cash Variance      : UGX ${variance.toLocaleString("en-UG")} (${variance >= 0 ? "SURPLUS" : "SHORTAGE"})\n`;
    }
    r += `\n`;

    r += `PAYMENT METHOD BREAKDOWN:\n`;
    r += `-----------------------------------------\n`;
    ["CASH", "UPI", "CARD", "PENDING"].forEach(method => {
      const count = todayOrders.filter(o => o.paymentMethod === method).length;
      const revenue = todayOrders.filter(o => o.paymentMethod === method).reduce((s, o) => s + (Number(o.total) || 0), 0);
      const label = method === "UPI" ? "Mobile Money" : method;
      r += `${label.padEnd(20)}: UGX ${revenue.toLocaleString("en-UG").padEnd(12)} (${count} tx)\n`;
    });
    
    r += `\nITEMS SOLD BREAKDOWN:\n`;
    r += `-----------------------------------------\n`;
    Object.entries(todayItemsBreakdown).forEach(([name, data]) => {
      r += `${name.padEnd(25)} x ${data.qty.toString().padEnd(4)} UGX ${data.revenue.toLocaleString("en-UG")}\n`;
    });
    
    r += `=========================================\n`;
    
    const blob = new Blob([r], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `canteen_daily_closing_report_${todayStr}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmCloseSession = (e: React.FormEvent) => {
    e.preventDefault();
    const actualCashVal = Number(actualCash);
    if (isNaN(actualCashVal) || actualCashVal < 0) {
      alert("Please enter a valid cash amount");
      return;
    }

    // Download closing report with reconciliation
    downloadClosingReport(actualCashVal);
    
    // Reset/close POS session
    closePosSession();
    
    setShowCloseModal(false);
    setActualCash("");
    alert("Session successfully closed and report downloaded!");
  };

  return (
    <div className="space-y-6">
      {/* Session Controls & Download Buttons */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Daily closing report</h2>
          {posSession && posSession.isOpen ? (
            <p className="text-xs text-green-600 font-medium">
              POS Session Active • Cashier: <span className="font-bold">{posSession.cashierName}</span> • Opened: {new Date(posSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Opening Cash: UGX {posSession.openingCash.toLocaleString("en-UG")}
            </p>
          ) : (
            <p className="text-xs text-red-500 font-medium">
              POS Session is currently Closed.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => downloadClosingReport()}
            className="px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-none cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Daily Report
          </button>
          {posSession && posSession.isOpen && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-none cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Close POS Session
            </button>
          )}
        </div>
      </div>

      {/* Closing POS Session Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-2xl max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Close POS Session</h3>
                <p className="text-[10px] text-gray-400">Perform shift closing and cash reconciliation</p>
              </div>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-400">Opening Cash Drawer:</span>
                <span className="font-semibold text-gray-800">UGX {(posSession?.openingCash || 0).toLocaleString("en-UG")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cash Sales Today:</span>
                <span className="font-semibold text-gray-800">UGX {todayCashSales.toLocaleString("en-UG")}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200/50 pt-2 font-bold">
                <span className="text-gray-800">Expected Cash in Drawer:</span>
                <span className="text-blue-600">UGX {expectedCashInHand.toLocaleString("en-UG")}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmCloseSession} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 block">
                  Actual Cash In Hand (UGX)
                </label>
                <input
                  type="number"
                  required
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder="Enter physical cash amount in register..."
                  className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>

              {actualCash && (
                <div className="p-3 rounded-xl text-xs font-semibold flex justify-between items-center bg-gray-50">
                  <span className="text-gray-500">Drawer Discrepancy (Variance):</span>
                  <span className={`font-bold ${Number(actualCash) - expectedCashInHand >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    UGX {(Number(actualCash) - expectedCashInHand).toLocaleString("en-UG")}
                    {" "}({Number(actualCash) - expectedCashInHand >= 0 ? "Surplus" : "Shortage"})
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-none"
              >
                Confirm Closing & Download Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase text-gray-400">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <h4 className="text-xl font-black text-gray-900">UGX {totalRevenue.toLocaleString("en-UG")}</h4>
          <p className="text-[9px] text-green-600 font-bold mt-1">All settled payments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase text-gray-400">Today's Sales</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <h4 className="text-xl font-black text-gray-900">UGX {getTodaySales().toLocaleString("en-UG")}</h4>
          <p className="text-[9px] text-blue-600 font-bold mt-1">{getTodayOrdersCount()} orders today</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase text-gray-400">Avg Order Value</span>
            <ShoppingCart className="w-4 h-4 text-purple-500" />
          </div>
          <h4 className="text-xl font-black text-gray-900">UGX {getAverageOrderValue().toLocaleString("en-UG")}</h4>
          <p className="text-[9px] text-purple-600 font-bold mt-1">Per transaction</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-400">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase text-red-500">Pending Amount</span>
            <Users className="w-4 h-4 text-red-400" />
          </div>
          <h4 className="text-xl font-black text-gray-900">UGX {pendingAmount.toLocaleString("en-UG")}</h4>
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
