"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Calendar,
  RefreshCw,
  Printer,
  X,
  Loader2,
  DollarSign,
  ShoppingCart,
  Utensils,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
} from "lucide-react";
import { useCanteen } from "../context/CanteenContext";
import { useCanteenSalesReport } from "@/lib/api/canteen/useReports";
import { formatCurrency } from "@/lib/utils";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { posSession, closePosSession } = useCanteen();

  // Date Filter Presets
  const [datePreset, setDatePreset] = useState<"today" | "yesterday" | "week" | "month" | "custom" | "all">("today");
  const [customStartDate, setCustomStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Compute actual date strings passed to API
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

  let queryStartDate: string | undefined = todayStr;
  let queryEndDate: string | undefined = todayStr;

  if (datePreset === "today") {
    queryStartDate = todayStr;
    queryEndDate = todayStr;
  } else if (datePreset === "yesterday") {
    queryStartDate = yesterdayStr;
    queryEndDate = yesterdayStr;
  } else if (datePreset === "week") {
    queryStartDate = sevenDaysAgoStr;
    queryEndDate = todayStr;
  } else if (datePreset === "month") {
    queryStartDate = startOfMonthStr;
    queryEndDate = todayStr;
  } else if (datePreset === "custom") {
    queryStartDate = customStartDate;
    queryEndDate = customEndDate;
  } else {
    queryStartDate = undefined;
    queryEndDate = undefined;
  }

  // Fetch Live Sales Report from Backend
  const { data: reportData, isLoading, refetch } = useCanteenSalesReport(queryStartDate, queryEndDate);

  // Sorting for Orders Ledger table
  const [orderSortBy, setOrderSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [itemSortBy, setItemSortBy] = useState<"revenue_desc" | "qty_desc">("revenue_desc");

  // Cash drawer session closing modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState("");

  const summary = reportData?.summary || {
    totalOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
    grossRevenue: 0,
    subtotal: 0,
    discount: 0,
    tax: 0,
    serviceCharge: 0,
    averageOrderValue: 0,
    totalItemsSold: 0,
    uniqueCustomers: 0,
  };

  const paymentMethods = reportData?.paymentMethods || {
    CASH: { count: 0, revenue: 0 },
    UPI: { count: 0, revenue: 0 },
    CARD: { count: 0, revenue: 0 },
  };

  const itemSales = reportData?.itemSales || [];
  const orders = reportData?.orders || [];

  // Sort item sales
  const sortedItemSales = [...itemSales].sort((a, b) => {
    if (itemSortBy === "revenue_desc") return b.revenue - a.revenue;
    return b.quantity - a.quantity;
  });

  // Sort orders ledger
  const sortedOrders = [...orders].sort((a, b) => {
    if (orderSortBy === "date_desc") {
      return new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime();
    }
    if (orderSortBy === "date_asc") {
      return new Date(a.orderedAt).getTime() - new Date(b.orderedAt).getTime();
    }
    if (orderSortBy === "amount_desc") {
      return b.total - a.total;
    }
    return a.total - b.total;
  });

  // Cash Drawer Calculations
  const totalCashSales = paymentMethods.CASH?.revenue || 0;
  const openingCash = posSession?.openingCash || 0;
  const expectedCashInHand = openingCash + totalCashSales;

  // ─── EXPORT TO EXCEL (.xlsx) ──────────────────────────────────────────────
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Sales Summary KPI
    const periodLabel =
      datePreset === "today"
        ? `Today (${todayStr})`
        : datePreset === "yesterday"
        ? `Yesterday (${yesterdayStr})`
        : datePreset === "week"
        ? `Last 7 Days (${sevenDaysAgoStr} to ${todayStr})`
        : datePreset === "month"
        ? `This Month (${startOfMonthStr} to ${todayStr})`
        : datePreset === "custom"
        ? `Custom Range (${customStartDate} to ${customEndDate})`
        : "All Time Historical";

    const summaryRows = [
      { Metric: "Reporting Period", Value: periodLabel },
      { Metric: "Total Orders Count", Value: summary.totalOrders },
      { Metric: "Paid & Fulfilled Orders", Value: summary.paidOrders },
      { Metric: "Cancelled Orders", Value: summary.cancelledOrders },
      { Metric: "Total Items Sold", Value: summary.totalItemsSold },
      { Metric: "Gross Sales Revenue (UGX)", Value: summary.grossRevenue },
      { Metric: "Total Net Subtotal (UGX)", Value: summary.subtotal },
      { Metric: "Total Discounts Given (UGX)", Value: summary.discount },
      { Metric: "Total Tax Collected (UGX)", Value: summary.tax },
      { Metric: "Average Order Value (UGX)", Value: Math.round(summary.averageOrderValue) },
      { Metric: "Cash Collections (UGX)", Value: paymentMethods.CASH?.revenue || 0 },
      { Metric: "Card Collections (UGX)", Value: paymentMethods.CARD?.revenue || 0 },
      { Metric: "UPI / Digital Collections (UGX)", Value: paymentMethods.UPI?.revenue || 0 },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary["!cols"] = [{ wch: 35 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Sales Summary");

    // Sheet 2: Item-Wise Sales Breakdown
    if (sortedItemSales.length > 0) {
      const itemRows = sortedItemSales.map((it, idx) => ({
        Rank: idx + 1,
        "Dish / Item Name": it.name,
        "Quantity Sold": it.quantity,
        "Average Price (UGX)": Math.round(it.unitPrice),
        "Total Revenue (UGX)": it.revenue,
      }));
      const wsItems = XLSX.utils.json_to_sheet(itemRows);
      wsItems["!cols"] = [{ wch: 8 }, { wch: 35 }, { wch: 18 }, { wch: 22 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(wb, wsItems, "Item-Wise Sales");
    }

    // Sheet 3: Orders Detailed Register
    if (sortedOrders.length > 0) {
      const orderRows = sortedOrders.map((o) => ({
        "Token No": o.tokenNumber,
        Date: o.date,
        Time: o.time,
        "Customer / Devotee": o.customerName,
        Phone: o.customerPhone,
        Table: o.tableName,
        "Subtotal (UGX)": o.subtotal,
        "Discount (UGX)": o.discount,
        "Tax (UGX)": o.tax,
        "Grand Total (UGX)": o.total,
        "Payment Method": o.paymentMethod,
        "Payment Status": o.paymentStatus,
        "Order Status": o.orderStatus,
      }));
      const wsOrders = XLSX.utils.json_to_sheet(orderRows);
      wsOrders["!cols"] = [
        { wch: 12 },
        { wch: 14 },
        { wch: 12 },
        { wch: 25 },
        { wch: 16 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, wsOrders, "Orders Ledger");
    }

    XLSX.writeFile(wb, `Canteen_Sales_Report_${datePreset}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ─── EXPORT TO TEXT / THERMAL SUMMARY (.txt) ──────────────────────────────
  const generateTextSummary = (actualCashAmt?: number) => {
    const timestamp = new Date().toLocaleString();
    const periodLabel =
      datePreset === "today"
        ? `Today (${todayStr})`
        : datePreset === "yesterday"
        ? `Yesterday (${yesterdayStr})`
        : datePreset === "week"
        ? `Last 7 Days (${sevenDaysAgoStr} to ${todayStr})`
        : datePreset === "month"
        ? `This Month (${startOfMonthStr} to ${todayStr})`
        : datePreset === "custom"
        ? `Custom (${customStartDate} to ${customEndDate})`
        : "All Time";

    let t = `=================================================\n`;
    t += `           CANTEEN SALES AUDIT REPORT             \n`;
    t += `=================================================\n`;
    t += `Period       : ${periodLabel}\n`;
    t += `Generated At : ${timestamp}\n`;
    if (posSession) {
      t += `Cashier / Mgr: ${posSession.cashierName}\n`;
      t += `Session Start: ${new Date(posSession.startTime).toLocaleTimeString()}\n`;
    }
    t += `-------------------------------------------------\n\n`;

    t += `1. FINANCIAL & SALES METRICS:\n`;
    t += `-------------------------------------------------\n`;
    t += `Gross Sales Revenue : ${formatCurrency(summary.grossRevenue)}\n`;
    t += `Total Net Subtotal  : ${formatCurrency(summary.subtotal)}\n`;
    t += `Total Discounts     : ${formatCurrency(summary.discount)}\n`;
    t += `Total Tax Collected : ${formatCurrency(summary.tax)}\n`;
    t += `Total Orders Count  : ${summary.totalOrders} (${summary.paidOrders} Paid, ${summary.cancelledOrders} Cancelled)\n`;
    t += `Total Items Sold    : ${summary.totalItemsSold} dishes\n`;
    t += `Average Order Value : ${formatCurrency(Math.round(summary.averageOrderValue))}\n\n`;

    t += `2. PAYMENT METHOD RECONCILIATION:\n`;
    t += `-------------------------------------------------\n`;
    t += `Cash Collections    : ${formatCurrency(paymentMethods.CASH?.revenue || 0)} (${paymentMethods.CASH?.count || 0} orders)\n`;
    t += `Card Collections    : ${formatCurrency(paymentMethods.CARD?.revenue || 0)} (${paymentMethods.CARD?.count || 0} orders)\n`;
    t += `UPI / Digital       : ${formatCurrency(paymentMethods.UPI?.revenue || 0)} (${paymentMethods.UPI?.count || 0} orders)\n\n`;

    if (posSession || actualCashAmt !== undefined) {
      t += `3. CASH DRAWER AUDIT:\n`;
      t += `-------------------------------------------------\n`;
      t += `Opening Float Cash  : ${formatCurrency(openingCash)}\n`;
      t += `Cash Sales Made     : ${formatCurrency(totalCashSales)}\n`;
      t += `Expected In Drawer  : ${formatCurrency(expectedCashInHand)}\n`;
      if (actualCashAmt !== undefined) {
        const diff = actualCashAmt - expectedCashInHand;
        t += `Actual Cash Counted : ${formatCurrency(actualCashAmt)}\n`;
        t += `Variance / Balance  : ${diff >= 0 ? "+" : ""}${formatCurrency(diff)} (${diff === 0 ? "BALANCED" : diff > 0 ? "SURPLUS" : "SHORTAGE"})\n`;
      }
      t += `\n`;
    }

    t += `4. TOP SELLING DISHES & ITEMS:\n`;
    t += `-------------------------------------------------\n`;
    sortedItemSales.slice(0, 10).forEach((it, idx) => {
      t += `${(idx + 1).toString().padStart(2, " ")}. ${it.name.padEnd(25, " ")} | ${it.quantity.toString().padStart(4, " ")} sold | ${formatCurrency(it.revenue)}\n`;
    });
    t += `\n=================================================\n`;
    t += `             END OF AUDIT REPORT                 \n`;
    t += `=================================================\n`;

    return t;
  };

  const handleDownloadTextReport = (actualCashAmt?: number) => {
    const textContent = generateTextSummary(actualCashAmt);
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Canteen_Sales_Report_${datePreset}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-7 font-sans text-left max-w-[1600px] mx-auto pb-12">
      {/* ─── Top Main Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Canteen Sales & Revenue Report
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Accurate sales audits, payment reconciliations, top selling items, and export formats
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={() => refetch()}
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl flex items-center gap-2 border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-98"
            title="Refresh Sales Metrics"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center gap-2 border-none shadow-md shadow-emerald-100 transition-all cursor-pointer active:scale-98"
            title="Export Multi-Sheet Excel Workbook"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleDownloadTextReport()}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-2xl flex items-center gap-2 border-none shadow-md transition-all cursor-pointer active:scale-98"
            title="Export Plain Text / Thermal Summary"
          >
            <FileText className="w-4 h-4" />
            <span>Export Text (.txt)</span>
          </button>

          {posSession && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl flex items-center gap-2 border-none shadow-md shadow-red-100 transition-all cursor-pointer active:scale-98"
            >
              <Receipt className="w-4 h-4" />
              <span>Close Cash Drawer</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Date Range Presets & Filter Bar (Matching Order Register) ──── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mr-1">
              Date Filter:
            </span>
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "week", label: "Last 7 Days" },
              { id: "month", label: "This Month" },
              { id: "custom", label: "Custom Range" },
              { id: "all", label: "All Time" },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDatePreset(preset.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  datePreset === preset.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {datePreset === "custom" && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <span>To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Metric KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Gross Sales Revenue</p>
            <h3 className="text-3xl font-bold text-emerald-600 tracking-tight font-mono">
              {formatCurrency(summary.grossRevenue)}
            </h3>
            <p className="text-xs font-semibold text-emerald-700">
              Net Subtotal: {formatCurrency(summary.subtotal)}
            </p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Orders</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {summary.totalOrders}
            </h3>
            <p className="text-xs font-semibold text-blue-600">
              {summary.paidOrders} Paid • {summary.cancelledOrders} Cancelled
            </p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
            <ShoppingCart className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Dishes / Items Sold</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {summary.totalItemsSold}
            </h3>
            <p className="text-xs font-medium text-slate-500">Total Portions Prepared</p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl">
            <Utensils className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Average Order Value</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {formatCurrency(Math.round(summary.averageOrderValue))}
            </h3>
            <p className="text-xs font-medium text-slate-500">Per Customer Ticket</p>
          </div>
          <div className="p-4 bg-violet-50 text-violet-600 rounded-3xl">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* ─── Payment Methods Breakdown & Top Selling Items (2 Cols) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Payment Methods Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Payment Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-medium">Collections by tender type</p>
          </div>

          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">Cash Desk</h4>
                  <p className="text-xs text-emerald-700 font-semibold font-mono">
                    {paymentMethods.CASH?.count || 0} receipts
                  </p>
                </div>
              </div>
              <p className="font-bold text-emerald-900 text-base font-mono">
                {formatCurrency(paymentMethods.CASH?.revenue || 0)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-950 text-sm">Credit / Debit Card</h4>
                  <p className="text-xs text-blue-700 font-semibold font-mono">
                    {paymentMethods.CARD?.count || 0} receipts
                  </p>
                </div>
              </div>
              <p className="font-bold text-blue-900 text-base font-mono">
                {formatCurrency(paymentMethods.CARD?.revenue || 0)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-violet-50/70 border border-violet-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-100 text-violet-800 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-violet-950 text-sm">UPI / QR Digital</h4>
                  <p className="text-xs text-violet-700 font-semibold font-mono">
                    {paymentMethods.UPI?.count || 0} receipts
                  </p>
                </div>
              </div>
              <p className="font-bold text-violet-900 text-base font-mono">
                {formatCurrency(paymentMethods.UPI?.revenue || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Top Selling Items (8 cols) */}
        <div className="lg:col-span-8 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Top Selling Menu Dishes
              </h3>
              <p className="text-xs text-slate-500 font-medium">Ranked by revenue contribution</p>
            </div>

            {/* Sorting toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setItemSortBy(itemSortBy === "revenue_desc" ? "qty_desc" : "revenue_desc")}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 border-none cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort by: {itemSortBy === "revenue_desc" ? "Revenue ▼" : "Quantity Sold ▼"}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {sortedItemSales.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No item sales recorded for the selected date period.
              </div>
            ) : (
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs tracking-wider pb-3">
                    <th className="pb-3 pl-2"># Rank</th>
                    <th className="pb-3">Dish / Item Name</th>
                    <th className="pb-3 text-center">Quantity Sold</th>
                    <th className="pb-3">Avg Unit Price</th>
                    <th className="pb-3 text-right pr-2">Total Revenue (UGX)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedItemSales.slice(0, 10).map((it, idx) => (
                    <tr key={it.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-slate-400 text-sm">{idx + 1}</td>
                      <td className="py-3 font-bold text-slate-900 text-sm">{it.name}</td>
                      <td className="py-3 text-center font-bold text-slate-800 font-mono text-sm">
                        {it.quantity} sold
                      </td>
                      <td className="py-3 font-semibold text-slate-600 font-mono text-sm">
                        UGX {Math.round(it.unitPrice).toLocaleString()}
                      </td>
                      <td className="py-3 text-right pr-2 font-bold text-emerald-600 font-mono text-sm">
                        {formatCurrency(it.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ─── Detailed Orders Ledger Table with Sorting ─────────────────── */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Detailed Orders Audit Ledger
            </h3>
            <p className="text-xs text-slate-500 font-medium">Individual token receipts and payment statuses</p>
          </div>

          {/* Sort order options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase">Sort Order:</span>
            <select
              value={orderSortBy}
              onChange={(e: any) => setOrderSortBy(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
            >
              <option value="date_desc">Date & Time (Newest First)</option>
              <option value="date_asc">Date & Time (Oldest First)</option>
              <option value="amount_desc">Amount (Highest First)</option>
              <option value="amount_asc">Amount (Lowest First)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Loading sales ledger...</span>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No orders found for the selected date period.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs tracking-wider pb-3">
                  <th className="pb-3 pl-2">Token No</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Customer / Devotee</th>
                  <th className="pb-3">Table</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Total Amount (UGX)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 pl-2 font-mono font-bold text-slate-900 text-sm">{o.tokenNumber}</td>
                    <td className="py-3 text-xs text-slate-500 font-mono">
                      {o.date} • {o.time}
                    </td>
                    <td className="py-3 font-semibold text-slate-800 text-sm">{o.customerName}</td>
                    <td className="py-3 text-xs font-medium text-slate-600">{o.tableName}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-slate-100 text-slate-700">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase ${
                          o.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2 font-extrabold text-slate-900 font-mono text-sm">
                      {formatCurrency(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── CASH DRAWER CLOSING MODAL ───────────────────────────────────── */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl p-7 relative space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Daily Cash Drawer Closing
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Reconcile physical cash drawer and end POS session
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCloseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 border-none bg-transparent cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Opening Float Cash:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(openingCash)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Today's Cash Sales:</span>
                  <span className="font-mono font-bold text-emerald-600">+{formatCurrency(totalCashSales)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Expected Cash In Drawer:</span>
                  <span className="font-mono text-blue-600">{formatCurrency(expectedCashInHand)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Actual Physical Cash Counted (UGX) *
                </label>
                <input
                  type="number"
                  placeholder="Enter physical cash amount counted in drawer..."
                  value={actualCashInput}
                  onChange={(e) => setActualCashInput(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-900 font-extrabold text-base font-mono outline-none focus:border-blue-500 transition-colors"
                  min={0}
                  required
                />
              </div>

              {actualCashInput !== "" && (
                <div
                  className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
                    Number(actualCashInput) === expectedCashInHand
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : Number(actualCashInput) > expectedCashInHand
                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <span>Cash Difference / Variance:</span>
                  <span className="font-mono text-sm">
                    {Number(actualCashInput) - expectedCashInHand >= 0 ? "+" : ""}
                    {formatCurrency(Number(actualCashInput) - expectedCashInHand)} (
                    {Number(actualCashInput) === expectedCashInHand
                      ? "BALANCED"
                      : Number(actualCashInput) > expectedCashInHand
                      ? "SURPLUS"
                      : "SHORTAGE"}
                    )
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl border-none bg-transparent cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const amt = actualCashInput !== "" ? Number(actualCashInput) : expectedCashInHand;
                  handleDownloadTextReport(amt);
                  closePosSession();
                  setShowCloseModal(false);
                  alert("Cash drawer reconciled and closed. Daily audit text report downloaded.");
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-100 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Close Session & Download Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
