"use client";

import React, { useState } from "react";
import { useShopCustomers, ShopCustomer } from "@/lib/api/shop";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, inputs } from "@/lib/design-system";
import { Users, Search, ShoppingBag, Loader2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: customers = [], isLoading, refetch } = useShopCustomers(searchQuery);

  const totalSpentAll = customers.reduce((sum, c) => sum + Number(c.totalSpent || 0), 0);
  const avgValue = customers.length > 0 ? Math.round(totalSpentAll / customers.length) : 0;

  return (
    <div className="space-y-8 font-jakarta">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>Shop Customers Directory</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            View registered shoppers, order counts, addresses, and lifetime customer spending in database.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className={`${buttons.secondary} px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Grid count stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <GlassCard className="p-6" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Registered Shoppers
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                {customers.length} Devotees
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Average Shopper Value
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                {formatCurrency(avgValue)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
          <input
            type="text"
            placeholder="Search customers by name, email or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputs.text} pl-10 py-2 text-xs`}
          />
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading customers from database...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="py-12 text-center text-secondary-bronze/60 text-xs">
              No store customers logged in database yet. New shoppers will automatically appear here upon checkout.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Customer Name</th>
                  <th className="pb-3">Contact Email</th>
                  <th className="pb-3">Phone Number</th>
                  <th className="pb-3">Orders Placed</th>
                  <th className="pb-3">Total Amount Spent</th>
                  <th className="pb-3">Shipping Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-bg-warm/10">
                    <td className="py-3.5 font-bold text-dark-surface">{cust.name}</td>
                    <td className="py-3.5 text-secondary-bronze/85">{cust.email}</td>
                    <td className="py-3.5 text-secondary-bronze/80">{cust.phone || "—"}</td>
                    <td className="py-3.5 font-semibold text-dark-surface">{cust.ordersCount} orders</td>
                    <td className="py-3.5 font-bold text-primary-gold">{formatCurrency(cust.totalSpent)}</td>
                    <td className="py-3.5 text-secondary-bronze/65 max-w-[240px] truncate" title={cust.address || ""}>
                      {cust.address || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
