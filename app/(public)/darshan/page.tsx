"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { templeConfig } from "@/data/temple";
import { useApp, DarshanBookingRecord } from "@/lib/context";
import { Clock, Info, CalendarCheck, X, CheckCircle2, Users, Calendar, Phone } from "lucide-react";

export default function DarshanPage() {
  const { setDarshanBookings, members, currentMemberNumber } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: success

  // Form State
  const activeMember = members.find(m => m.membershipNumber === currentMemberNumber) || members[0];
  const [devoteeName, setDevoteeName] = useState(activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : "");
  const [devoteePhone, setDevoteePhone] = useState(activeMember ? activeMember.phone : "");
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("Morning Aarti (6:00 AM - 7:00 AM)");
  const [visitorCount, setVisitorCount] = useState(1);

  const slots = [
    "Morning Aarti (6:00 AM - 7:00 AM)",
    "Morning Darshan (8:00 AM - 10:30 AM)",
    "Mid-Day Darshan (11:30 AM - 12:30 PM)",
    "Evening Aarti (6:30 PM - 8:00 PM)"
  ];

  const handleOpenBooking = () => {
    setStep(1);
    setBookingDate("");
    setVisitorCount(1);
    setShowModal(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName || !devoteePhone || !bookingDate) {
      alert("Please fill in devotee name, phone, and date.");
      return;
    }

    const newBooking: DarshanBookingRecord = {
      id: "db-new-" + Math.floor(1000 + Math.random() * 9000),
      devoteeName,
      devoteePhone,
      date: bookingDate,
      slot: `${timeSlot} (${visitorCount} visitors)`,
      status: "CONFIRMED", // Auto confirmed
      bookingDate: bookingDate
    };

    setDarshanBookings((prev) => [newBooking, ...prev]);
    setStep(2);
  };

  return (
    <div className="py-24 bg-bg-warm min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Worship timings"
          title="Darshan & Aarti Schedule"
          subtitle="Plan your visit to the main temple. We welcome you to join in the daily Aarti sessions."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Morning Sessions */}
          <GlassCard className="p-8 border-primary-gold/30">
            <div className="w-10 h-10 rounded-xl bg-primary-gold/15 flex items-center justify-center text-primary-gold mb-6">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-2xl font-medium text-dark-surface mb-2">
              Morning Darshan
            </h3>
            <p className="text-3xl font-bold text-primary-gold mb-4 font-mono">
              {templeConfig.darshanTimings.morning}
            </p>
            <p className="text-xs text-secondary-bronze/70 leading-relaxed font-light font-sans">
              Begins with Mangala Aarti at dawn, followed by Abhishek and Shringar decoration. Ideal time for silent meditation and reading in the courtyard.
            </p>
          </GlassCard>

          {/* Evening Sessions */}
          <GlassCard className="p-8 border-primary-gold/30">
            <div className="w-10 h-10 rounded-xl bg-primary-gold/15 flex items-center justify-center text-primary-gold mb-6">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-2xl font-medium text-dark-surface mb-2">
              Evening Darshan
            </h3>
            <p className="text-3xl font-bold text-primary-gold mb-4 font-mono">
              {templeConfig.darshanTimings.evening}
            </p>
            <p className="text-xs text-secondary-bronze/70 leading-relaxed font-light font-sans">
              Begins in the late afternoon. Features the evening Sandhya Aarti, congregational kirtans, and short spiritual discourses on Bhagavad Gita.
            </p>
          </GlassCard>

          {/* Special Aarti Timings */}
          <GlassCard className="p-8 bg-gradient-to-br from-dark-surface to-secondary-bronze/80 text-white border-white/10">
            <h3 className="font-heading text-2xl font-medium text-primary-gold mb-6">
              Daily Aarti Sessions
            </h3>
            <div className="space-y-4">
              {templeConfig.darshanTimings.aarti.map((aarti, idx) => (
                <div className="flex justify-between items-center border-b border-white/10 pb-3" key={idx}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/95">
                    {aarti.name}
                  </span>
                  <span className="text-sm font-bold text-primary-gold font-mono">{aarti.time}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/50 font-light mt-6 font-sans">
              * Aarti timings might slightly shift during major astronomical events (e.g. eclipses) or special festival days.
            </p>
          </GlassCard>
        </div>

        {/* Dynamic Booking CTA Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <GlassCard className="p-8 border border-primary-gold/20 bg-gradient-to-r from-primary-gold/10 to-secondary-bronze/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-heading text-2xl font-medium text-dark-surface flex items-center justify-center md:justify-start gap-2">
                <CalendarCheck className="w-6 h-6 text-primary-gold" />
                Schedule a Darshan Visit
              </h3>
              <p className="text-xs text-secondary-bronze leading-relaxed font-light font-sans max-w-xl">
                Skip general entry queues by scheduling your visit slot. Receive priority darshan passes for your family directly on your dashboard.
              </p>
            </div>
            <button
              onClick={handleOpenBooking}
              className="px-6 py-3.5 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold rounded-xl shadow-lg hover:brightness-105 transition-all uppercase tracking-wider whitespace-nowrap cursor-pointer"
            >
              Book Darshan Slot
            </button>
          </GlassCard>
        </div>

        {/* Guidelines / FAQ */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-primary-gold/15 shadow-sm max-w-4xl mx-auto">
          <h4 className="font-heading text-2xl font-medium text-dark-surface mb-6 flex items-center gap-3 justify-center">
            <Info className="w-5 h-5 text-primary-gold" />
            Visitor Guidelines
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-light text-secondary-bronze leading-relaxed font-sans">
            <div className="space-y-4">
              <p>
                <strong>Dress Code:</strong> Devotees are requested to wear decent, traditional clothing. Avoid shorts, beachwear, or inappropriate prints.
              </p>
              <p>
                <strong>Photography:</strong> Photography and videography are strictly prohibited inside the main altar/deity hall to maintain serenity.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                <strong>Footwear:</strong> All footwear must be left at the dedicated shoe stands located at the main gate entrance.
              </p>
              <p>
                <strong>Offerings:</strong> Fresh flowers, tulsi leaves, and fruits can be offered. Cooked outside food is not allowed inside the main shrine.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Booking Drawer/Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                    Darshan Scheduler
                  </span>
                  <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                    Book Darshan Visit Slot
                  </h3>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Visitor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={devoteeName}
                      onChange={(e) => setDevoteeName(e.target.value)}
                      placeholder="e.g. Harish Mehta"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={devoteePhone}
                        onChange={(e) => setDevoteePhone(e.target.value)}
                        placeholder="+91 99110 54321"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Number of Devotees
                      </label>
                      <select
                        value={visitorCount}
                        onChange={(e) => setVisitorCount(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                          <option key={n} value={n}>{n} Devotee{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Date of Visit *
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Select Time Slot *
                      </label>
                      <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      >
                        {slots.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 border border-primary-gold/15 bg-bg-warm/50 rounded-xl flex items-start gap-2.5 mt-2">
                    <Info className="w-4 h-4 text-primary-gold shrink-0 mt-0.5" />
                    <p className="text-[10px] text-secondary-bronze/70 leading-relaxed font-sans">
                      Standard slot booking has zero fee charges. Your pass code will be active instantly. Present the downloaded pass / QR code at the temple fast-track entryway.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Confirm Visit Pass
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-success-green/10 text-success-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="font-heading text-3xl font-medium text-dark-surface">
                    Darshan Booked!
                  </h3>
                  <p className="text-xs text-secondary-bronze/85 font-sans mt-2">
                    Your divine visit slot has been confirmed and registered.
                  </p>
                </div>

                <div className="p-5 border border-primary-gold/15 bg-bg-warm rounded-2xl text-left space-y-2 max-w-xs mx-auto">
                  <p className="text-xs text-secondary-bronze font-sans">
                    Visitor: <span className="font-bold text-dark-surface">{devoteeName}</span>
                  </p>
                  <p className="text-xs text-secondary-bronze font-sans">
                    Date: <span className="font-semibold text-dark-surface">{bookingDate}</span>
                  </p>
                  <p className="text-xs text-secondary-bronze font-sans">
                    Slot: <span className="font-bold text-primary-gold">{timeSlot}</span>
                  </p>
                  <p className="text-xs text-secondary-bronze font-sans">
                    Total Devotees: <span className="font-semibold text-dark-surface">{visitorCount}</span>
                  </p>
                </div>

                <p className="text-[10px] text-secondary-bronze/60 max-w-xs mx-auto leading-relaxed">
                  A digital pass receipt with a scannable entry barcode has been generated. You can download this from your devotee portal dashboard.
                </p>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 border border-primary-gold/30 hover:bg-bg-warm text-secondary-bronze text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <Link
                    href="/dashboard"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 bg-primary-gold hover:bg-secondary-bronze text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer"
                  >
                    Dashboard Passes
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
