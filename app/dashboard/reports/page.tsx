"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FileSpreadsheet, Download, FileText, BarChart3 } from "lucide-react";

export default function ReportsDashboardPage() {
  const handleExport = (reportName: string, format: "CSV" | "Excel" | "PDF") => {
    alert(`Simulated file export initialized!\nReport: ${reportName}\nFormat: ${format}\nDownloading package...`);
  };

  const reportCards = [
    { title: "Membership Directory Audit", desc: "Detailed records of active, pending, expired members, family counts, and joined dates.", name: "Membership_Report" },
    { title: "Donation Ledger Receipts", desc: "List of all single & recurring online/offline transactions, donor PAN numbers, and tax audit codes.", name: "Donations_Report" },
    { title: "Hall booking calendar Log", desc: "Marriage Hall schedule, event titles, total revenue pricing, and pending approvals log.", name: "Hall_Bookings_Report" },
    { title: "Pooja Seva Pujari Logs", desc: "Daily Pooja bookings list, slot distribution, priest assignments, and altar logs.", name: "Pooja_Bookings_Report" }
  ];

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="font-heading text-3xl font-medium text-dark-surface">
          Reports Builder
        </h1>
        <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
          Generate Tally-compatible ledgers, donor tax forms, and auditorium availability spreadsheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reportCards.map((rep) => (
          <GlassCard className="p-8 flex flex-col justify-between h-full" hoverEffect={false} key={rep.name}>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold mb-2">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-xl font-medium text-dark-surface leading-tight">
                {rep.title}
              </h3>
              <p className="text-xs text-secondary-bronze/85 leading-relaxed font-sans font-light">
                {rep.desc}
              </p>
            </div>

            <div className="pt-6 border-t border-primary-gold/10 mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => handleExport(rep.name, "CSV")}
                className="px-4 py-2 border border-primary-gold/25 text-secondary-bronze hover:bg-primary-gold/5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport(rep.name, "Excel")}
                className="px-4 py-2 border border-primary-gold/25 text-secondary-bronze hover:bg-primary-gold/5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => handleExport(rep.name, "PDF")}
                className="px-4 py-2 rounded-xl bg-primary-gold text-white text-xs font-semibold shadow hover:bg-secondary-bronze transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate PDF</span>
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

    </div>
  );
}
