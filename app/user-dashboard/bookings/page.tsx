"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, badges } from "@/lib/design-system";
import {
  Calendar,
  Plus,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  CalendarCheck,
  Flame,
  QrCode,
  Download,
  X,
  RefreshCw,
  Receipt
} from "lucide-react";
import {
  fetchMyHallBookings,
  fetchMyDarshanBookings,
  fetchMyPujaBookings,
  TempleHallBookingItem,
  TempleDarshanBookingItem,
  TemplePujaBookingItem
} from "@/lib/bookingApi";

export default function UserBookingsPage() {
  const {
    devoteeProfile,
    currentMemberNumber,
    members,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<"hall" | "pooja" | "darshan">("hall");
  const [loading, setLoading] = useState(true);

  // Personal bookings state
  const [myHalls, setMyHalls] = useState<TempleHallBookingItem[]>([]);
  const [myDarshans, setMyDarshans] = useState<TempleDarshanBookingItem[]>([]);
  const [myPujas, setMyPujas] = useState<TemplePujaBookingItem[]>([]);

  // QR Modal preview
  const [qrModalPass, setQrModalPass] = useState<TempleDarshanBookingItem | null>(null);

  // Format date helper
  const formatDate = (dateVal: string | Date | null | undefined): string => {
    if (!dateVal) return "N/A";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return String(dateVal);
    }
  };

  const loadPersonalBookings = async () => {
    try {
      setLoading(true);

      // Attempt to retrieve profile from context or localStorage
      let profile = devoteeProfile;
      if (!profile && typeof window !== "undefined") {
        const saved = localStorage.getItem("devotee_profile");
        if (saved) {
          try {
            profile = JSON.parse(saved);
          } catch (_) {}
        }
      }

      // Fallback to current member from members list if needed
      const fallbackMember = members.find((m) => m.membershipNumber === currentMemberNumber);

      const filterParams = {
        devotee_id: profile?.id || undefined,
        email: profile?.email || fallbackMember?.email || undefined,
        phone: profile?.phone || fallbackMember?.phone || undefined,
      };

      // If absolutely no devotee profile is set, fallback to member number
      const queryParam = (filterParams.devotee_id || filterParams.email || filterParams.phone)
        ? filterParams
        : (currentMemberNumber || "devotee");

      const [hallsRes, darshansRes, pujasRes] = await Promise.all([
        fetchMyHallBookings(queryParam).catch(() => []),
        fetchMyDarshanBookings(queryParam).catch(() => []),
        fetchMyPujaBookings(queryParam).catch(() => []),
      ]);

      setMyHalls(hallsRes);
      setMyDarshans(darshansRes);
      setMyPujas(pujasRes);
    } catch (err) {
      console.error("Error loading personal bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonalBookings();
  }, [devoteeProfile?.id, devoteeProfile?.email, devoteeProfile?.phone, currentMemberNumber]);

  return (
    <div className="space-y-8 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>My Bookings & Passes</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            View and manage your scheduled Darshan passes, Puja sponsorships, and Temple Hall events in real time.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadPersonalBookings}
            className="px-3 py-2 bg-white border border-primary-gold/25 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/10 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          {activeTab === "hall" && (
            <Link href="/booking?type=hall" className={`${buttons.primary} py-2.5 px-4 text-xs flex items-center space-x-1.5`}>
              <Plus className="w-4 h-4" />
              <span>Book Hall</span>
            </Link>
          )}
          {activeTab === "pooja" && (
            <Link href="/booking?type=puja" className={`${buttons.primary} py-2.5 px-4 text-xs flex items-center space-x-1.5`}>
              <Plus className="w-4 h-4" />
              <span>Sponsor Pooja</span>
            </Link>
          )}
          {activeTab === "darshan" && (
            <Link href="/booking?type=darshan" className={`${buttons.primary} py-2.5 px-4 text-xs flex items-center space-x-1.5`}>
              <Plus className="w-4 h-4" />
              <span>Schedule Darshan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs list selector */}
      <div className="flex border-b border-primary-gold/15 pb-2 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("hall")}
          className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "hall"
              ? "border-primary-gold text-primary-gold"
              : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hall Bookings ({myHalls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pooja")}
          className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "pooja"
              ? "border-primary-gold text-primary-gold"
              : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Pooja Sponsorships ({myPujas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("darshan")}
          className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "darshan"
              ? "border-primary-gold text-primary-gold"
              : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Darshan Passes ({myDarshans.length})</span>
        </button>
      </div>

      {/* 1. HALL BOOKINGS LIST */}
      {activeTab === "hall" && (
        <div className="space-y-4">
          {myHalls.length === 0 && !loading ? (
            <div className="text-center py-16 bg-white border border-primary-gold/10 rounded-3xl p-8">
              <Building2 className="w-12 h-12 text-primary-gold/30 mx-auto mb-4" />
              <h3 className="font-bold text-dark-surface mb-1 text-sm">No Hall Reservations Found</h3>
              <p className="text-secondary-bronze/70 text-xs mb-6">Reserve temple auditoriums for weddings, satsangs, or community ceremonies.</p>
              <Link href="/booking?type=hall" className={buttons.primary}>
                Reserve Hall Now
              </Link>
            </div>
          ) : (
            myHalls.map((hb) => (
              <div key={hb.id} className="bg-white border border-primary-gold/15 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-1">
                    <span className="font-bold text-dark-surface text-sm">{hb.event_title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-gold/10 text-primary-gold border border-primary-gold/25 font-mono">
                      {hb.hall_name}
                    </span>
                    <span className="text-[10px] text-secondary-bronze/60 font-mono">
                      Ref: {hb.id}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-secondary-bronze/70 space-x-4 flex-wrap gap-1">
                    <span>Date: <strong className="text-dark-surface">{formatDate(hb.booking_date)}</strong></span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-primary-gold" />
                      Time: {hb.start_time || "09:00 AM"} - {hb.end_time || "06:00 PM"}
                    </span>
                    <span>Guests: {hb.expected_guests}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-dark-surface font-mono">{formatCurrency(Number(hb.total_price))}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      hb.status === "CONFIRMED"
                        ? "bg-success-green/10 text-success-green"
                        : hb.status === "REJECTED"
                        ? "bg-error-red/10 text-error-red"
                        : "bg-warning-amber/10 text-warning-amber"
                    }`}
                  >
                    {hb.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. POOJA SPONSORSHIPS LIST */}
      {activeTab === "pooja" && (
        <div className="space-y-4">
          {myPujas.length === 0 && !loading ? (
            <div className="text-center py-16 bg-white border border-primary-gold/10 rounded-3xl p-8">
              <Flame className="w-12 h-12 text-primary-gold/30 mx-auto mb-4" />
              <h3 className="font-bold text-dark-surface mb-1 text-sm">No Pooja Sponsorships Found</h3>
              <p className="text-secondary-bronze/70 text-xs mb-6">Sponsor sacred Vedic archana, maha abhishek, or havans in your family name.</p>
              <Link href="/booking?type=puja" className={buttons.primary}>
                Sponsor Pooja Now
              </Link>
            </div>
          ) : (
            myPujas.map((pb) => (
              <div key={pb.id} className="bg-white border border-primary-gold/15 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-1">
                    <span className="font-bold text-dark-surface text-sm">{pb.puja_name}</span>
                    {Number(pb.has_samagri) === 1 ? (
                      <span className="bg-success-green/10 text-success-green border border-success-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        ✓ With Samagri Kit
                      </span>
                    ) : (
                      <span className="bg-secondary-bronze/10 text-secondary-bronze/60 border border-secondary-bronze/10 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Self Samagri
                      </span>
                    )}
                    <span className="text-[10px] text-secondary-bronze/60 font-mono">
                      Receipt: {pb.receipt_number || pb.id}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-bronze/70">
                    Date: <strong className="text-dark-surface">{formatDate(pb.booking_date)}</strong> ({pb.time_slot}) | Gotra: {pb.gothra || "Kashyap"} • Nakshatra: {pb.nakshatra || "General"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-dark-surface font-mono">{formatCurrency(Number(pb.total_amount))}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      pb.status === "CONFIRMED"
                        ? "bg-success-green/10 text-success-green"
                        : pb.status === "COMPLETED"
                        ? "bg-primary-gold/15 text-primary-gold"
                        : "bg-warning-amber/10 text-warning-amber"
                    }`}
                  >
                    {pb.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. DARSHAN PASSES LIST */}
      {activeTab === "darshan" && (
        <div className="space-y-4">
          {myDarshans.length === 0 && !loading ? (
            <div className="text-center py-16 bg-white border border-primary-gold/10 rounded-3xl p-8">
              <CalendarCheck className="w-12 h-12 text-primary-gold/30 mx-auto mb-4" />
              <h3 className="font-bold text-dark-surface mb-1 text-sm">No Darshan Passes Scheduled</h3>
              <p className="text-secondary-bronze/70 text-xs mb-6">Schedule your temple visit timeslot to receive priority entry gate passes.</p>
              <Link href="/booking?type=darshan" className={buttons.primary}>
                Schedule Visit Now
              </Link>
            </div>
          ) : (
            myDarshans.map((db) => (
              <div key={db.id} className="bg-white border border-primary-gold/15 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-dark-surface text-sm">{db.slot_name}</span>
                    <span className="text-[10px] font-mono text-primary-gold bg-primary-gold/10 px-2 py-0.5 rounded-md font-bold">
                      {db.visitor_count} Devotee{db.visitor_count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-bronze/70">
                    Visit Date: <strong className="text-dark-surface">{formatDate(db.visit_date)}</strong> | Pass ID: <span className="font-mono font-semibold">{db.id}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQrModalPass(db)}
                    className="px-3 py-1.5 rounded-xl border border-primary-gold/30 bg-primary-gold/10 text-secondary-bronze text-xs font-semibold hover:bg-primary-gold/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-primary-gold" />
                    <span>View QR Pass</span>
                  </button>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      db.status === "CONFIRMED"
                        ? "bg-success-green/10 text-success-green"
                        : db.status === "CHECKED_IN"
                        ? "bg-primary-gold/15 text-primary-gold"
                        : "bg-error-red/10 text-error-red"
                    }`}
                  >
                    {db.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QR Code Pass Modal */}
      {qrModalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-primary-gold/15 pb-2">
              <h3 className="font-heading text-lg font-medium text-dark-surface">
                Darshan Gate Scan Pass
              </h3>
              <button onClick={() => setQrModalPass(null)} className="text-secondary-bronze cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-bg-warm/40 border border-primary-gold/20 rounded-2xl mx-auto inline-block">
              {qrModalPass.qr_code_url ? (
                <img src={qrModalPass.qr_code_url} alt="QR Pass" className="w-44 h-44 object-contain" />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center font-mono text-xs text-secondary-bronze/50">
                  QR Pass: {qrModalPass.id}
                </div>
              )}
            </div>

            <div className="text-xs text-secondary-bronze space-y-1">
              <p className="font-semibold text-dark-surface">{qrModalPass.devotee_name}</p>
              <p className="font-mono text-primary-gold font-bold">{qrModalPass.slot_name}</p>
              <p>Date: <strong>{formatDate(qrModalPass.visit_date)}</strong> ({qrModalPass.visitor_count} Visitors)</p>
            </div>

            <button
              type="button"
              onClick={() => setQrModalPass(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
