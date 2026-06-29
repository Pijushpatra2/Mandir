"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, badges } from "@/lib/design-system";
import { Calendar, Plus, Clock, ArrowRight, Sparkles } from "lucide-react";

export default function UserBookingsPage() {
  const {
    currentMemberNumber,
    members,
    hallBookings,
    poojaBookings,
    darshanBookings
  } = useApp();

  const [activeTab, setActiveTab] = useState<"hall" | "pooja" | "darshan">("hall");

  const activeMember = members.find((m) => m.membershipNumber === currentMemberNumber) || members[0];
  const memberName = activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : "";

  // Filter lists based on logged-in devotee name
  const filteredHall = hallBookings.filter(
    (h) => memberName && h.devoteeName.toLowerCase().includes(memberName.toLowerCase())
  );
  
  const filteredPooja = poojaBookings.filter(
    (p) => memberName && p.devoteeName.toLowerCase().includes(memberName.toLowerCase())
  );
  
  const filteredDarshan = darshanBookings.filter(
    (d) => memberName && d.devoteeName.toLowerCase().includes(memberName.toLowerCase())
  );

  return (
    <div className="space-y-8 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>My Bookings & Passes</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            View and manage your scheduled Darshan visits, Puja sponsorships, and Hall events.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "hall" && (
            <Link href="/hall-booking" className={`${buttons.primary} py-2.5 px-4 text-xs flex items-center space-x-1.5`}>
              <Plus className="w-4 h-4" />
              <span>Book Hall</span>
            </Link>
          )}
          {activeTab === "pooja" && (
            <Link href="/services" className={`${buttons.primary} py-2.5 px-4 text-xs flex items-center space-x-1.5`}>
              <Plus className="w-4 h-4" />
              <span>Sponsor Pooja</span>
            </Link>
          )}
          {activeTab === "darshan" && (
            <Link href="/darshan" className={`${buttons.primary} py-2.5 px-4 text-xs flex items-center space-x-1.5`}>
              <Plus className="w-4 h-4" />
              <span>Schedule Darshan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs list selector */}
      <div className="flex border-b border-primary-gold/15 pb-2 gap-6">
        <button
          onClick={() => setActiveTab("hall")}
          className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "hall"
              ? "border-primary-gold text-primary-gold"
              : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
          }`}
        >
          Hall Bookings ({filteredHall.length})
        </button>

        <button
          onClick={() => setActiveTab("pooja")}
          className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "pooja"
              ? "border-primary-gold text-primary-gold"
              : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
          }`}
        >
          Pooja Sponsorships ({filteredPooja.length})
        </button>

        <button
          onClick={() => setActiveTab("darshan")}
          className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "darshan"
              ? "border-primary-gold text-primary-gold"
              : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
          }`}
        >
          Darshan Passes ({filteredDarshan.length})
        </button>
      </div>

      {/* 1. HALL BOOKINGS LIST */}
      {activeTab === "hall" && (
        <div className="space-y-4">
          {filteredHall.length === 0 ? (
            <div className="text-center py-16 bg-white border border-primary-gold/10 rounded-3xl p-8">
              <Calendar className="w-12 h-12 text-primary-gold/30 mx-auto mb-4" />
              <h3 className="font-bold text-dark-surface mb-1 text-sm">No Hall Reservations</h3>
              <p className="text-secondary-bronze/70 text-xs mb-6">Reserve the temple hall for wedding ceremonies, kirtans, or community events.</p>
              <Link href="/hall-booking" className={buttons.primary}>
                Reserve Hall Now
              </Link>
            </div>
          ) : (
            filteredHall.map((hb) => (
              <div key={hb.id} className="bg-white border border-primary-gold/10 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-dark-surface text-sm">{hb.hallName}</span>
                    <span className={badges.gold}>Event: {hb.eventTitle}</span>
                  </div>
                  <div className="flex items-center text-xs text-secondary-bronze/70 space-x-4">
                    <span>Date: {hb.bookingDate}</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-primary-gold" />
                      Time: {hb.startTime || "09:00 AM"} - {hb.endTime || "06:00 PM"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-dark-surface">{formatCurrency(hb.totalPrice)}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      hb.status === "CONFIRMED"
                        ? "bg-success-green/10 text-success-green"
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
          {filteredPooja.length === 0 ? (
            <div className="text-center py-16 bg-white border border-primary-gold/10 rounded-3xl p-8">
              <Sparkles className="w-12 h-12 text-primary-gold/30 mx-auto mb-4" />
              <h3 className="font-bold text-dark-surface mb-1 text-sm">No Pooja Sponsorships</h3>
              <p className="text-secondary-bronze/70 text-xs mb-6">Sponsor a sacred archana, abhishek, or havan ritual in your family name.</p>
              <Link href="/services" className={buttons.primary}>
                Sponsor Pooja Now
              </Link>
            </div>
          ) : (
            filteredPooja.map((pb) => (
              <div key={pb.id} className="bg-white border border-primary-gold/10 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-dark-surface text-sm">{pb.poojaName}</span>
                    {pb.slot.includes("(With Puja Contents)") ? (
                      <span className="bg-success-green/10 text-success-green border border-success-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        With Samagri Box
                      </span>
                    ) : (
                      <span className="bg-secondary-bronze/10 text-secondary-bronze/60 border border-secondary-bronze/10 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Without Samagri
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-secondary-bronze/70">
                    Date: {pb.date} ({pb.slot}) | Gotra: {pb.gothra || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-dark-surface">{formatCurrency(pb.amount)}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      pb.status === "CONFIRMED"
                        ? "bg-success-green/10 text-success-green"
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
          {filteredDarshan.length === 0 ? (
            <div className="text-center py-16 bg-white border border-primary-gold/10 rounded-3xl p-8">
              <Calendar className="w-12 h-12 text-primary-gold/30 mx-auto mb-4" />
              <h3 className="font-bold text-dark-surface mb-1 text-sm">No Darshan Slots Booked</h3>
              <p className="text-secondary-bronze/70 text-xs mb-6">Schedule your temple visit timeslot to receive smooth queues and gate passes.</p>
              <Link href="/darshan" className={buttons.primary}>
                Schedule Visit Now
              </Link>
            </div>
          ) : (
            filteredDarshan.map((db) => (
              <div key={db.id} className="bg-white border border-primary-gold/10 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5">
                  <span className="font-bold text-dark-surface text-sm">{db.slot}</span>
                  <p className="text-xs text-secondary-bronze/70">
                    Visit Date: {db.date} | Booking Reference: {db.id}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    db.status === "CONFIRMED"
                      ? "bg-success-green/10 text-success-green"
                      : "bg-warning-amber/10 text-warning-amber"
                  }`}
                >
                  {db.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
