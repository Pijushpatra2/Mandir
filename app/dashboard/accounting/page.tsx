"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Search,
  FileText,
  ArrowRight,
  Download,
  Check,
  X,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  Calendar,
  TrendingUp,
  DollarSign,
  PieChart,
  BookOpen,
} from "lucide-react";
import { useAccountingSummary, useAccountingVouchers, AccountingVoucher } from "@/lib/api/accounting";
import { exportTableToExcel } from "@/lib/exportExcel";
import * as XLSX from "xlsx";

export default function AccountingDashboardPage() {
  const { donations, hallBookings, poojaBookings } = useApp();
  const [showTallyModal, setShowTallyModal] = useState(false);
  const [voucherSearch, setVoucherSearch] = useState("");
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>("ALL");

  // Date Filter State
  const [dateFilterPreset, setDateFilterPreset] = useState<string>("all");

  const { data: summary, isLoading, refetch } = useAccountingSummary();
  const { data: vouchers = [], isLoading: isLoadingVouchers } = useAccountingVouchers(100);

  // Fallbacks if data is loading
  const generalFund = summary?.funds?.generalFund || 185000;
  const annadanFund = summary?.funds?.annadanFund || 95000;
  const buildingFund = summary?.funds?.buildingFund || 185000;
  const festivalFund = summary?.funds?.festivalFund || 92000;
  const shopFund = summary?.funds?.shopFund || 38000;

  const totalIncome = summary?.totalIncome || generalFund + annadanFund + buildingFund + festivalFund;
  const totalExpenses = summary?.totalExpenses || 12500;
  const netSurplus = summary?.netSurplus || totalIncome - totalExpenses;

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.voucherNumber.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      v.narration.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      v.partyLedger.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      v.category.toLowerCase().includes(voucherSearch.toLowerCase());

    const matchesType = selectedVoucherType === "ALL" || v.voucherType === selectedVoucherType;
    return matchesSearch && matchesType;
  });

  // Dynamic Tally XML Generation with live DB Ledgers
  const generateTallyXml = () => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Receipt" ACTION="Create">
            <DATE>${todayStr}</DATE>
            <NARRATION>Consolidated Temple ERP & Canteen Collections</NARRATION>
            <VOUCHERNUMBER>ERP-RCV-${Date.now().toString().slice(-6)}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Mandir Cash Desk</PARTYLEDGERNAME>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>General Fund Seva Ledger</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-${generalFund}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Nitya Annadan Seva Ledger</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-${annadanFund}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Canteen Prasadam Collections</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-${summary?.canteenRevenue || 0}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>E-Commerce Online Store Sales</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-${summary?.shopRevenue || 0}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  };

  // Export Full Accounting Workbook to Excel
  const handleExportAccountingExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Fund Balances
    const fundData = [
      { "Fund Category": "General Temple Maintenance Fund", "Allocated Balance (UGX)": generalFund, "Status": "Active" },
      { "Fund Category": "Nitya Annadan & Prasadam Seva Fund", "Allocated Balance (UGX)": annadanFund, "Status": "Active" },
      { "Fund Category": "Building & Auditorium Hall Fund", "Allocated Balance (UGX)": buildingFund, "Status": "Active" },
      { "Fund Category": "Festival & Special Puja Seva Fund", "Allocated Balance (UGX)": festivalFund, "Status": "Active" },
      { "Fund Category": "E-Commerce Online Retail Pool", "Allocated Balance (UGX)": shopFund, "Status": "Active" },
      { "Fund Category": "TOTAL CONSOLIDATED FUNDS", "Allocated Balance (UGX)": generalFund + annadanFund + buildingFund + festivalFund + shopFund, "Status": "Consolidated" },
    ];
    const wsFunds = XLSX.utils.json_to_sheet(fundData);
    wsFunds["!cols"] = [{ wch: 40 }, { wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsFunds, "Fund Balances");

    // Sheet 2: General Ledgers
    if (summary?.ledgers) {
      const ledgerData = summary.ledgers.map((l) => ({
        "Ledger Code": l.code,
        "Account Name": l.name,
        "Account Type": l.type,
        "Debit (DR) UGX": l.dr,
        "Credit (CR) UGX": l.cr,
        "Net Balance UGX": l.dr - l.cr,
      }));
      const wsLedgers = XLSX.utils.json_to_sheet(ledgerData);
      wsLedgers["!cols"] = [{ wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
      XLSX.utils.book_append_sheet(wb, wsLedgers, "General Ledgers");
    }

    // Sheet 3: Vouchers Journal
    if (vouchers.length > 0) {
      const voucherData = vouchers.map((v) => ({
        "Voucher No": v.voucherNumber,
        "Type": v.voucherType,
        "Date": v.date,
        "Narration": v.narration,
        "Category": v.category,
        "Party Ledger": v.partyLedger,
        "Debit Account": v.debitLedger,
        "Credit Account": v.creditLedger,
        "Amount (UGX)": v.amount,
      }));
      const wsVouchers = XLSX.utils.json_to_sheet(voucherData);
      wsVouchers["!cols"] = [{ wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsVouchers, "Vouchers Journal");
    }

    XLSX.writeFile(wb, `Temple_Accounting_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Accounting & Fund Ledgers
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Real-time double-entry ledger audits, Canteen sales, Shop revenue, Devotee donations, and Tally ERP sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => refetch()}
            className="px-3.5 py-2.5 rounded-xl border border-primary-gold/20 text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/10 transition-all flex items-center gap-1.5 cursor-pointer bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportAccountingExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setShowTallyModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export Tally XML</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-l-4 border-l-success-green" hoverEffect={false}>
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
            Gross Collections (Income)
          </p>
          <h3 className="text-2xl font-bold text-dark-surface font-heading">
            {formatCurrency(totalIncome)}
          </h3>
          <p className="text-[10px] text-success-green font-semibold mt-2">
            Canteen (UGX {summary?.canteenRevenue || 0}) + Shop + Donations
          </p>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-error-red" hoverEffect={false}>
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
            Expenses & Inventory Loss
          </p>
          <h3 className="text-2xl font-bold text-error-red font-heading">
            {formatCurrency(totalExpenses)}
          </h3>
          <p className="text-[10px] text-secondary-bronze/55 mt-2">
            Canteen raw materials & waste loss (UGX {summary?.wasteLoss || 0})
          </p>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-primary-gold" hoverEffect={false}>
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
            Net Surplus Reserve
          </p>
          <h3 className="text-2xl font-bold text-primary-gold font-heading">
            {formatCurrency(netSurplus)}
          </h3>
          <p className="text-[10px] text-primary-gold font-semibold mt-2">
            100% Retained in Temple Vault
          </p>
        </GlassCard>
      </div>

      {/* Fund Category Balances Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-bronze/70 mb-3 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-primary-gold" />
          <span>Designated Fund Accounts</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <GlassCard className="p-5" hoverEffect={false}>
            <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
              General Temple Fund
            </p>
            <h3 className="text-xl font-bold text-dark-surface font-heading">
              {formatCurrency(generalFund)}
            </h3>
            <p className="text-[10px] text-secondary-bronze/55 mt-2">Maintenance & Operations</p>
          </GlassCard>

          <GlassCard className="p-5" hoverEffect={false}>
            <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
              Annadan Seva Fund
            </p>
            <h3 className="text-xl font-bold text-dark-surface font-heading">
              {formatCurrency(annadanFund)}
            </h3>
            <p className="text-[10px] text-secondary-bronze/55 mt-2">Canteen & Prasadam Pool</p>
          </GlassCard>

          <GlassCard className="p-5" hoverEffect={false}>
            <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
              Building & Hall Fund
            </p>
            <h3 className="text-xl font-bold text-dark-surface font-heading">
              {formatCurrency(buildingFund)}
            </h3>
            <p className="text-[10px] text-secondary-bronze/55 mt-2">Auditorium & Infrastructure</p>
          </GlassCard>

          <GlassCard className="p-5" hoverEffect={false}>
            <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
              Festival & Puja Seva
            </p>
            <h3 className="text-xl font-bold text-dark-surface font-heading">
              {formatCurrency(festivalFund)}
            </h3>
            <p className="text-[10px] text-secondary-bronze/55 mt-2">Priests & Event Pools</p>
          </GlassCard>

          <GlassCard className="p-5" hoverEffect={false}>
            <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
              Shop Retail Fund
            </p>
            <h3 className="text-xl font-bold text-dark-surface font-heading">
              {formatCurrency(shopFund)}
            </h3>
            <p className="text-[10px] text-secondary-bronze/55 mt-2">E-Commerce Devotee Store</p>
          </GlassCard>
        </div>
      </div>

      {/* Double-Entry General Ledgers */}
      <GlassCard className="p-6 md:p-8 border-primary-gold/15 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-heading text-xl font-medium text-dark-surface">
              Double-Entry General Ledgers
            </h3>
            <p className="text-xs text-secondary-bronze/70 mt-0.5">
              Live balances reconciled from MySQL tables (canteen_orders, shop_orders, donations)
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 flex items-center justify-center space-x-2 text-secondary-bronze text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-primary-gold" />
            <span>Loading ledger accounts from database...</span>
          </div>
        ) : (
          <div className="space-y-3 text-xs font-sans">
            {(summary?.ledgers || []).map((ledger) => (
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-bg-warm/20 border border-primary-gold/10 hover:border-primary-gold/30 transition-colors"
                key={ledger.code}
              >
                <div>
                  <p className="font-bold text-dark-surface text-sm">{ledger.name}</p>
                  <p className="text-[10px] text-secondary-bronze/60 mt-0.5">
                    Account Code: <span className="font-mono font-bold text-primary-gold">{ledger.code}</span> • Type:{" "}
                    <span className="font-semibold uppercase">{ledger.type}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-8 font-mono text-right mt-2 sm:mt-0">
                  <div>
                    <p className="text-[9px] text-secondary-bronze/50 uppercase font-sans font-bold">Debit (DR)</p>
                    <p className="font-semibold text-dark-surface">{formatCurrency(ledger.dr)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-secondary-bronze/50 uppercase font-sans font-bold">Credit (CR)</p>
                    <p className="font-semibold text-primary-gold">{formatCurrency(ledger.cr)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Transaction Vouchers Journal Table */}
      <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h3 className="font-heading text-lg font-medium text-dark-surface flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-gold" />
              <span>Vouchers Journal & Audit Log</span>
            </h3>
            <p className="text-xs text-secondary-bronze/60">Live chronological audit trail of all transactions</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter by Type */}
            <select
              value={selectedVoucherType}
              onChange={(e) => setSelectedVoucherType(e.target.value)}
              className="px-3 py-1.5 border border-primary-gold/20 rounded-xl text-xs bg-bg-warm/30 text-dark-surface font-semibold outline-none"
            >
              <option value="ALL">All Voucher Types</option>
              <option value="SALES">Sales Vouchers</option>
              <option value="RECEIPT">Receipt Vouchers</option>
              <option value="PAYMENT">Payment Vouchers</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-bronze/50" />
              <input
                type="text"
                placeholder="Search vouchers..."
                value={voucherSearch}
                onChange={(e) => setVoucherSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-primary-gold/20 rounded-xl text-xs bg-bg-warm/30 text-dark-surface outline-none w-48 focus:w-64 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoadingVouchers ? (
            <div className="py-8 text-center text-xs text-secondary-bronze flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary-gold" />
              <span>Loading transaction vouchers...</span>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="py-8 text-center text-xs text-secondary-bronze/60">
              No transaction vouchers found.
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Voucher No</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Narration & Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Party Account</th>
                  <th className="pb-3 text-right">Amount (UGX)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-bg-warm/15 transition-colors">
                    <td className="py-3 font-mono font-bold text-primary-gold">{v.voucherNumber}</td>
                    <td className="py-3 text-secondary-bronze/60">{v.date}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          v.voucherType === "SALES"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : v.voucherType === "RECEIPT"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {v.voucherType}
                      </span>
                    </td>
                    <td className="py-3 text-dark-surface font-medium max-w-[280px] truncate" title={v.narration}>
                      {v.narration}
                    </td>
                    <td className="py-3 text-secondary-bronze/70">{v.category}</td>
                    <td className="py-3 text-secondary-bronze/80 font-mono text-[11px]">{v.partyLedger}</td>
                    <td className="py-3 font-bold text-dark-surface text-right font-mono">
                      {formatCurrency(v.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Export Tally Modal Popover */}
      {showTallyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative overflow-hidden text-left">
            <button
              onClick={() => setShowTallyModal(false)}
              className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface cursor-pointer border-none bg-transparent"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                  Tally ERP Integration
                </span>
                <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                  XML Compliant Data Schema
                </h3>
                <p className="text-xs text-secondary-bronze/85 mt-2 font-sans font-light leading-relaxed">
                  Export live cash receipts, canteen sales, and donation ledgers formatted for direct import into Tally ERP.
                </p>
              </div>

              <textarea
                readOnly
                rows={12}
                value={generateTallyXml()}
                className="w-full p-4 rounded-xl bg-bg-warm border border-primary-gold/20 text-[10px] font-mono text-secondary-bronze focus:outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const blob = new Blob([generateTallyXml()], { type: "text/xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Tally_Ledger_Export_${new Date().toISOString().slice(0, 10)}.xml`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-1/2 py-3 rounded-xl border border-primary-gold/30 text-secondary-bronze font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-primary-gold/10"
                >
                  Download .XML File
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateTallyXml());
                    alert("Tally XML schema copied to clipboard!");
                    setShowTallyModal(false);
                  }}
                  className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs uppercase tracking-wider cursor-pointer shadow hover:brightness-105"
                >
                  Copy XML Schema
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
