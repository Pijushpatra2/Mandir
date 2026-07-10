"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function SettingsPage() {
  const { currentRole, logout } = useCanteen();

  const [canteenName, setCanteenName] = useState("SKSS Kampala Canteen");
  const [gstRate, setGstRate] = useState("5");
  const [serviceCharge, setServiceCharge] = useState("2.5");
  const [currency, setCurrency] = useState("INR");
  const [autoKDS, setAutoKDS] = useState(true);
  const [printReceipt, setPrintReceipt] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real system, save to localStorage / API
    localStorage.setItem("canteen_settings", JSON.stringify({ canteenName, gstRate, serviceCharge, currency, autoKDS, printReceipt }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* General Settings (8 cols) */}
      <div className="lg:col-span-8 space-y-5">
        {/* Business Info */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-3">
            Business Configuration
          </h3>
          <div className="grid grid-cols-1 gap-4 text-xs font-sans">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Canteen / Outlet Name</label>
              <input
                type="text"
                value={canteenName}
                onChange={e => setCanteenName(e.target.value)}
                className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">GST Rate (%)</label>
                <input
                  type="number"
                  value={gstRate}
                  onChange={e => setGstRate(e.target.value)}
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold focus:border-blue-400 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Service Charge (%)</label>
                <input
                  type="number"
                  value={serviceCharge}
                  onChange={e => setServiceCharge(e.target.value)}
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold focus:border-blue-400 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer"
                >
                  <option value="INR">UGX INR</option>
                  <option value="USD">$ USD</option>
                  <option value="UGX">UGX Shillings</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* POS Behavior */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-3">
            POS Behaviour
          </h3>
          <div className="space-y-3 text-xs font-sans">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-700">Auto-send to Kitchen Display</p>
                <p className="text-[10px] text-gray-400">New orders instantly appear in KDS without manual dispatch</p>
              </div>
              <button
                onClick={() => setAutoKDS(!autoKDS)}
                className={`w-10 h-5 rounded-full transition-all cursor-pointer border-none relative ${autoKDS ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${autoKDS ? "left-5" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-gray-700">Print Receipt on Checkout</p>
                <p className="text-[10px] text-gray-400">Automatically trigger print dialog after each sale</p>
              </div>
              <button
                onClick={() => setPrintReceipt(!printReceipt)}
                className={`w-10 h-5 rounded-full transition-all cursor-pointer border-none relative ${printReceipt ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${printReceipt ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-2xl text-white font-black text-xs flex items-center justify-center gap-2 transition-all border-none cursor-pointer shadow-md ${
            saved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? "Settings Saved Successfully!" : "Save All Settings"}
        </button>
      </div>

      {/* Account & Session Info (4 cols) */}
      <div className="lg:col-span-4 space-y-5">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
            Current Session
          </h3>
          <div className="space-y-2 text-xs font-sans">
            <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-semibold">Logged in as</span>
              <span className="font-black text-gray-800 uppercase">{currentRole}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-semibold">Terminal</span>
              <span className="font-bold text-gray-700">Desk #1</span>
            </div>
            <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-semibold">System Version</span>
              <span className="font-bold text-gray-700">POS v2.4.1</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-black text-xs rounded-xl transition-all border border-red-200 cursor-pointer"
          >
            🚪 Sign Out Terminal
          </button>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">About Swami POS</h3>
          <p className="text-sm font-black">Canteen Management System</p>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Built for Swaminarayan temples and community canteens. Featuring real-time KDS, inventory tracking, table management, and role-based access control.
          </p>
          <p className="text-[9px] text-slate-500 pt-2 border-t border-slate-800">Version 2.4.1 • Built with Next.js 15</p>
        </div>
      </div>
    </div>
  );
}
