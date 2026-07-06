"use client";

import React from "react";
import { useCanteen } from "../context/CanteenContext";

export default function CustomersPage() {
  const { customers, setCustomers, saveState } = useCanteen();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Customer List (8 cols) */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="border-b border-gray-50 pb-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Customer CRM Directory</h3>
          <p className="text-[11px] text-gray-400">Devotee visit records and purchase history</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px]">
                <th className="pb-2.5">Customer Name</th>
                <th className="pb-2.5">Phone</th>
                <th className="pb-2.5">Total Visits</th>
                <th className="pb-2.5">Total Spent</th>
                <th className="pb-2.5">Last Visit</th>
                <th className="pb-2.5 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5">
                    <p className="font-bold text-gray-800">{c.name}</p>
                    <span className="text-[10px] text-gray-400">{c.email}</span>
                  </td>
                  <td className="py-2.5 text-gray-500 font-semibold">{c.phone}</td>
                  <td className="py-2.5 font-bold text-gray-700">{c.totalVisits}</td>
                  <td className="py-2.5 font-bold text-blue-600">₹{c.totalSpent?.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 text-gray-400">{c.lastVisit}</td>
                  <td className="py-2.5 text-center">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.type === "VIP" ? "bg-violet-50 text-violet-700" :
                      c.type === "Regular" ? "bg-blue-50 text-blue-700" :
                      "bg-gray-50 text-gray-500"
                    }`}>
                      {c.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Stats (4 cols) */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            CRM Summary
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-violet-50 rounded-xl">
              <span className="font-bold text-violet-700">VIP Members</span>
              <span className="font-black text-violet-700">{customers.filter(c => c.type === "VIP").length}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-blue-50 rounded-xl">
              <span className="font-bold text-blue-700">Regular Customers</span>
              <span className="font-black text-blue-700">{customers.filter(c => c.type === "Regular").length}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
              <span className="font-bold text-gray-600">Walk-in Guests</span>
              <span className="font-black text-gray-700">{customers.filter(c => c.type === "Guest").length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            Top Spenders
          </h3>
          <div className="space-y-2">
            {[...customers]
              .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
              .slice(0, 5)
              .map((c, idx) => (
                <div key={c.id} className="flex items-center gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[9px] text-gray-500">
                    {idx + 1}
                  </span>
                  <div className="flex-grow">
                    <p className="font-bold text-gray-800 truncate">{c.name}</p>
                    <p className="text-[9px] text-gray-400">{c.totalVisits} visits</p>
                  </div>
                  <span className="font-bold text-blue-600 text-[10px]">₹{c.totalSpent?.toLocaleString("en-IN")}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
