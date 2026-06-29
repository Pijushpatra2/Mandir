"use client";

import React, { useState } from "react";
import { mockCustomers, Customer } from "@/data/customers";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, inputs } from "@/lib/design-system";
import { Users, Search, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardCustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-jakarta">
      <div>
        <h1 className={`${typography.h2} text-dark-surface font-medium`}>Shop Customers Directory</h1>
        <p className="text-xs text-secondary-bronze/75 mt-0.5">
          View register accounts and customer spending levels inside the online store.
        </p>
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
                {formatCurrency(
                  Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)
                )}
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
            placeholder="Search customers by name or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputs.text} pl-10 py-2 text-xs`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Contact Email</th>
                <th className="pb-3">Phone Number</th>
                <th className="pb-3">Orders placed</th>
                <th className="pb-3">Total Amount Spent</th>
                <th className="pb-3">Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-gold/5">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-bg-warm/10">
                  <td className="py-3.5 font-bold text-dark-surface">{cust.name}</td>
                  <td className="py-3.5 text-secondary-bronze/85">{cust.email}</td>
                  <td className="py-3.5 text-secondary-bronze/80">{cust.phone}</td>
                  <td className="py-3.5 font-semibold text-dark-surface">{cust.ordersCount} orders</td>
                  <td className="py-3.5 font-bold text-primary-gold">{formatCurrency(cust.totalSpent)}</td>
                  <td className="py-3.5 text-secondary-bronze/65 max-w-[200px] truncate" title={cust.address}>
                    {cust.address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
