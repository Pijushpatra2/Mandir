"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, IndianRupee, FileText, ArrowRight, Download, Check, X } from "lucide-react";

export default function AccountingDashboardPage() {
  const { donations, hallBookings, poojaBookings } = useApp();
  const [showTallyModal, setShowTallyModal] = useState(false);

  // Fund category balances
  const generalFund = donations.filter(d => d.campaignTitle === "General Temple Seva" && d.status === "PAID").reduce((a,c)=>a+c.amount,0) + 150000;
  const annadanFund = donations.filter(d => d.campaignTitle === "Nitya Annadan Seva" && d.status === "PAID").reduce((a,c)=>a+c.amount,0);
  const buildingFund = donations.filter(d => d.campaignTitle === "New Spiritual Education Wing" && d.status === "PAID").reduce((a,c)=>a+c.amount,0) + hallBookings.filter(h => h.status === "CONFIRMED").reduce((a,c)=>a+c.totalPrice,0);
  const festivalFund = donations.filter(d => d.campaignTitle === "Sri Krishna Janmashtami Spl Seva" && d.status === "PAID").reduce((a,c)=>a+c.amount,0) + poojaBookings.filter(p => p.status === "CONFIRMED").reduce((a,c)=>a+c.amount,0);

  // Generate Tally-Compatible XML
  const generateTallyXml = () => {
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
            <DATE>20260621</DATE>
            <NARRATION>Donation collections consolidated for Temple ERP</NARRATION>
            <VOUCHERNUMBER>ERP-RCV-0029</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Cash</PARTYLEDGERNAME>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>General Fund Seva Ledger</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-${generalFund}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Nitya Annadan Ledger</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>-${annadanFund}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Accounting & Funds
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Audit general fund ledger categories and export Tally XML compliant sheets.
          </p>
        </div>
        
        <button
          onClick={() => setShowTallyModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Export Tally XML</span>
        </button>
      </div>

      {/* Fund category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <GlassCard className="p-6" hoverEffect={false}>
          <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
            General Fund
          </p>
          <h3 className="text-2xl font-bold text-dark-surface font-heading">
            {formatCurrency(generalFund)}
          </h3>
          <p className="text-[10px] text-secondary-bronze/55 mt-3">
            Core maintenance balances
          </p>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect={false}>
          <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
            Annadan Seva Fund
          </p>
          <h3 className="text-2xl font-bold text-dark-surface font-heading">
            {formatCurrency(annadanFund)}
          </h3>
          <p className="text-[10px] text-secondary-bronze/55 mt-3">
            Charitable food allocations
          </p>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect={false}>
          <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
            Building & Hall Fund
          </p>
          <h3 className="text-2xl font-bold text-dark-surface font-heading">
            {formatCurrency(buildingFund)}
          </h3>
          <p className="text-[10px] text-secondary-bronze/55 mt-3">
            Auditorium & expansion assets
          </p>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect={false}>
          <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/65 mb-1">
            Festival & Puja Seva
          </p>
          <h3 className="text-2xl font-bold text-dark-surface font-heading">
            {formatCurrency(festivalFund)}
          </h3>
          <p className="text-[10px] text-secondary-bronze/55 mt-3">
            Event & special priest pools
          </p>
        </GlassCard>

      </div>

      {/* Ledger Accounts Summary */}
      <GlassCard className="p-8 border-primary-gold/15 shadow-sm">
        <h3 className="font-heading text-xl font-medium text-dark-surface mb-6">
          Double-Entry General Ledgers
        </h3>

        <div className="space-y-4 text-xs font-sans">
          {[
            { code: "1010-CASH", name: "Mandir Cash Desk", type: "ASSET", dr: generalFund + annadanFund, cr: 0 },
            { code: "1020-BANK-SBI", name: "SBI Main Trust Account", type: "ASSET", dr: buildingFund + festivalFund, cr: 0 },
            { code: "2010-DONATION-GEN", name: "Donations Received Ledger", type: "REVENUE", dr: 0, cr: generalFund + annadanFund },
            { code: "2020-HALL-RENTAL", name: "Auditorium Rental Receivables", type: "REVENUE", dr: 0, cr: buildingFund }
          ].map((ledger) => (
            <div className="flex justify-between items-center p-3 border-b border-primary-gold/10 last:border-b-0 pb-3" key={ledger.code}>
              <div>
                <p className="font-semibold text-dark-surface">{ledger.name}</p>
                <p className="text-[10px] text-secondary-bronze/60 mt-0.5">
                  Code: {ledger.code} • Category: {ledger.type}
                </p>
              </div>
              <div className="flex items-center space-x-8 font-mono text-right">
                <div>
                  <p className="text-[9px] text-secondary-bronze/50 uppercase">Debit (DR)</p>
                  <p className="font-semibold text-dark-surface">{formatCurrency(ledger.dr)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-secondary-bronze/50 uppercase">Credit (CR)</p>
                  <p className="font-semibold text-primary-gold">{formatCurrency(ledger.cr)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Export Tally Modal Popover */}
      {showTallyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative overflow-hidden">
            <button
              onClick={() => setShowTallyModal(false)}
              className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface cursor-pointer"
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
                  Copy-paste this simulated XML directly into Tally to sync cash receipts and donation ledgers.
                </p>
              </div>

              <textarea
                readOnly
                rows={12}
                value={generateTallyXml()}
                className="w-full p-4 rounded-xl bg-bg-warm border border-primary-gold/20 text-[10px] font-mono text-secondary-bronze focus:outline-none"
              />

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateTallyXml());
                  alert("Tally XML copied to clipboard!");
                  setShowTallyModal(false);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs uppercase tracking-wider cursor-pointer"
              >
                Copy XML Schema
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
