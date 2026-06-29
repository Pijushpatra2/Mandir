"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Heart, Plus, Download, ChevronRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DonationsDashboardPage() {
  const { donations, setDonations } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("All");
  
  // Offline entry form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [amount, setAmount] = useState<number>(5000);
  const [campaignTitle, setCampaignTitle] = useState("General Temple Seva");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card" | "NetBanking">("Cash");
  const [panNumber, setPanNumber] = useState("");

  const campaigns = [
    { title: "General Temple Seva", id: "camp-1" },
    { title: "Nitya Annadan Seva", id: "camp-2" },
    { title: "New Spiritual Education Wing", id: "camp-3" },
    { title: "Sri Krishna Janmashtami Spl Seva", id: "camp-4" }
  ];

  // Filter donations
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.donorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCampaign =
      campaignFilter === "All"
        ? true
        : d.campaignTitle === campaignFilter;

    return matchesSearch && matchesCampaign;
  });

  const handleAddOfflineDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorEmail || !amount) {
      alert("Please fill in required fields.");
      return;
    }

    const matchedCamp = campaigns.find(c => c.title === campaignTitle);

    const receiptNum = "REC-2026-" + Math.floor(1000 + Math.random() * 9000);
    const newTx = {
      id: "tx-off-" + Math.random().toString(36).substr(2, 9),
      donorName,
      donorEmail,
      amount: Number(amount),
      campaignId: matchedCamp?.id || "camp-1",
      campaignTitle,
      paymentMethod,
      date: new Date().toISOString(),
      receiptNumber: receiptNum,
      status: "PAID" as const,
      panNumber: panNumber || undefined
    };

    setDonations((prev) => [newTx, ...prev]);
    setShowAddForm(false);
    setDonorName("");
    setDonorEmail("");
    setPanNumber("");
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Donation Management
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Audit general ledgers, register offline cash/cheque contributions, and generate tax receipts.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Offline Donation</span>
        </button>
      </div>

      {/* Campaign Mini Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {campaigns.map((camp) => {
          const totalAmt = donations
            .filter((d) => d.campaignTitle === camp.title && d.status === "PAID")
            .reduce((acc, curr) => acc + curr.amount, 0);
          
          const count = donations.filter((d) => d.campaignTitle === camp.title && d.status === "PAID").length;

          return (
            <GlassCard className="p-5" key={camp.id} hoverEffect={false}>
              <p className="text-[9px] uppercase font-bold tracking-wider text-secondary-bronze/60">
                {camp.title}
              </p>
              <h4 className="text-xl font-bold text-dark-surface mt-2 font-heading">
                {formatCurrency(totalAmt)}
              </h4>
              <p className="text-[10px] text-secondary-bronze/70 font-sans mt-1">
                {count} transactions audited
              </p>
            </GlassCard>
          );
        })}
      </div>

      {/* Filters control bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-primary-gold/10">
        
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by donor name, email, or receipt ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
          />
        </div>

        {/* Campaign Filter Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-secondary-bronze font-sans shrink-0">
            Campaign:
          </span>
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
          >
            <option value="All">All Campaigns</option>
            {campaigns.map((c) => (
              <option value={c.title} key={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Directory transaction table */}
      <div className="overflow-x-auto bg-white rounded-3xl border border-primary-gold/15 shadow-sm">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Receipt #</th>
              <th className="px-6 py-4">Donor Details</th>
              <th className="px-6 py-4">Campaign Name</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-gold/10">
            {filteredDonations.map((tx) => (
              <tr className="hover:bg-bg-warm/50 transition-colors" key={tx.id}>
                <td className="px-6 py-4 font-mono font-semibold text-dark-surface">
                  {tx.receiptNumber}
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-dark-surface">{tx.donorName}</p>
                  <p className="text-[10px] text-secondary-bronze/65">{tx.donorEmail}</p>
                  {tx.panNumber && (
                    <span className="text-[9px] font-mono bg-primary-gold/10 text-primary-gold px-1 rounded">
                      PAN: {tx.panNumber}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-secondary-bronze">
                  {tx.campaignTitle}
                </td>
                <td className="px-6 py-4 text-secondary-bronze/70">{tx.paymentMethod}</td>
                <td className="px-6 py-4 text-secondary-bronze/75">{formatDate(tx.date)}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-bold rounded uppercase",
                      tx.status === "PAID" && "bg-success-green/10 text-success-green",
                      tx.status === "PENDING" && "bg-warning-amber/10 text-warning-amber",
                      tx.status === "FAILED" && "bg-error-red/10 text-error-red"
                    )}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-dark-surface">
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => alert(`Simulated receipt PDF download for receipt: ${tx.receiptNumber}`)}
                    className="p-1.5 rounded-lg border border-primary-gold/20 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredDonations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-secondary-bronze/50 font-light">
                  No transaction records matching filter query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Offline Donation Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                  Administrative Ledger
                </span>
                <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                  Record Offline Donation
                </h3>
              </div>

              <form onSubmit={handleAddOfflineDonation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                    Donor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="e.g. Sanjay Shah"
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="sanjay.shah@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Amount (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="Donation Amount"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Payment Mode *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    >
                      <option>Cash</option>
                      <option>UPI</option>
                      <option>Card</option>
                      <option>NetBanking</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Campaign Seva Category *
                    </label>
                    <select
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    >
                      {campaigns.map((c) => (
                        <option value={c.title} key={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      PAN Card Number (for Sec 80G)
                    </label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      maxLength={10}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Record Transaction
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
