"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, badges } from "@/lib/design-system";
import { Heart, Plus, FileText, CheckCircle2 } from "lucide-react";

export default function UserDonationsPage() {
  const { donations, currentMemberNumber, members } = useApp();

  const activeMember = members.find((m) => m.membershipNumber === currentMemberNumber) || members[0];
  const memberName = activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : "";

  // Filter list by logged-in devotee name
  const filteredDonations = donations.filter(
    (d) => memberName && d.donorName.toLowerCase().includes(memberName.toLowerCase())
  );

  const totalDonated = filteredDonations
    .filter((d) => d.status === "PAID")
    .reduce((sum, d) => sum + d.amount, 0);

  // Download Receipt simulation
  const handlePrintReceipt = (donation: any) => {
    alert(`Generating print receipt for Donation ${donation.id}...\nDonor: ${donation.donorName}\nAmount: ₹${donation.amount}\nCampaign: ${donation.campaignTitle}\nStatus: ${donation.status}`);
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>My Donations Ledger</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Track your charitable donations, sponsorships, and download Section 80G tax certificates.
          </p>
        </div>
        <Link href="/donations" className={`${buttons.primary} py-2.5 px-4 text-xs flex items-center space-x-1.5`}>
          <Plus className="w-4 h-4" />
          <span>New Donation</span>
        </Link>
      </div>

      {/* Donation Stats card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <GlassCard className="p-6" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Total Devotional Contributions
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                {formatCurrency(totalDonated)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <Heart className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Receipts Logged
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                {filteredDonations.length} records
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-secondary-bronze/70 uppercase tracking-widest mb-4">
          Donations Log
        </h3>

        {filteredDonations.length === 0 ? (
          <div className="text-center py-12 text-secondary-bronze/50 text-xs">
            No donation records logged under this devotee account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Fund Category</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-bg-warm/10">
                    <td className="py-3.5 font-bold text-primary-gold">{d.id}</td>
                    <td className="py-3.5 text-secondary-bronze/85 font-semibold">{d.campaignTitle}</td>
                    <td className="py-3.5 font-bold text-dark-surface">{formatCurrency(d.amount)}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === "PAID"
                            ? "bg-success-green/10 text-success-green"
                            : "bg-warning-amber/10 text-warning-amber"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-secondary-bronze/60">{d.date}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handlePrintReceipt(d)}
                        className="px-2.5 py-1.5 text-[10px] font-bold border border-primary-gold/30 text-secondary-bronze hover:bg-primary-gold/10 rounded-xl cursor-pointer"
                      >
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
