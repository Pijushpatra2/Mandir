"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Save, Bell, Shield, Tv, Sparkles } from "lucide-react";

export default function SettingsDashboardPage() {
  const [templeName, setTempleName] = useState("Shree Kutch Satsang Swaminarayan Temple, Kampala");
  const [liveUrl, setLiveUrl] = useState("https://www.youtube.com/embed/dQw4w9WgXcQ");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [morningTiming, setMorningTiming] = useState("5:30 AM - 11:00 AM");
  const [eveningTiming, setEveningTiming] = useState("4:00 PM - 8:30 PM");

  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            System Settings
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Configure global variables: live stream links, darshan hours, and WhatsApp webhooks.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8 max-w-3xl">
        
        {/* General settings */}
        <GlassCard className="p-8 space-y-6" hoverEffect={false}>
          <div className="flex items-center space-x-2 border-b border-primary-gold/10 pb-4">
            <Shield className="w-5 h-5 text-primary-gold" />
            <h3 className="font-heading text-xl font-medium text-dark-surface">
              General Identity Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                Temple Name *
              </label>
              <input
                type="text"
                required
                value={templeName}
                onChange={(e) => setTempleName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                YouTube Live Stream Embed URL *
              </label>
              <input
                type="text"
                required
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* Timings settings */}
        <GlassCard className="p-8 space-y-6" hoverEffect={false}>
          <div className="flex items-center space-x-2 border-b border-primary-gold/10 pb-4">
            <Sparkles className="w-5 h-5 text-primary-gold" />
            <h3 className="font-heading text-xl font-medium text-dark-surface">
              Darshan Sessions Configuration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                Morning Hours *
              </label>
              <input
                type="text"
                required
                value={morningTiming}
                onChange={(e) => setMorningTiming(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                Evening Hours *
              </label>
              <input
                type="text"
                required
                value={eveningTiming}
                onChange={(e) => setEveningTiming(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* Notification settings */}
        <GlassCard className="p-8 space-y-6" hoverEffect={false}>
          <div className="flex items-center space-x-2 border-b border-primary-gold/10 pb-4">
            <Bell className="w-5 h-5 text-primary-gold" />
            <h3 className="font-heading text-xl font-medium text-dark-surface">
              Notification & Webhooks
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 border border-primary-gold/10 bg-bg-warm/40 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-dark-surface">Simulated WhatsApp Notifications</p>
                <p className="text-[10px] text-secondary-bronze/70 mt-0.5">
                  Sends transaction and booking confirmation receipts over WhatsApp API.
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-5 h-5 text-primary-gold border-primary-gold/20 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 border border-primary-gold/10 bg-bg-warm/40 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-dark-surface">Simulated Email Notifications</p>
                <p className="text-[10px] text-secondary-bronze/70 mt-0.5">
                  Dispatches Sec 80G tax receipt PDF vouchers to donors and members.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-5 h-5 text-primary-gold border-primary-gold/20 rounded"
              />
            </div>
          </div>
        </GlassCard>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs uppercase tracking-wider shadow hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
          
          {saved && (
            <span className="text-xs font-bold text-success-green bg-success-green/10 border border-success-green px-3 py-1.5 rounded-xl animate-fade-in">
              Configuration Saved Successfully!
            </span>
          )}
        </div>

      </form>

    </div>
  );
}
