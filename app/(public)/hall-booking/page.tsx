"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar as CalendarIcon, Info, Users, Clock, Flame, ShieldCheck, CheckCircle2, X } from "lucide-react";

export default function HallBookingPage() {
  const { hallBookings, setHallBookings, members, currentMemberNumber } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: success

  // Form State
  const activeMember = members.find(m => m.membershipNumber === currentMemberNumber) || members[0];
  const [devoteeName, setDevoteeName] = useState(activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : "");
  const [devoteeEmail, setDevoteeEmail] = useState(activeMember ? activeMember.email : "");
  const [devoteePhone, setDevoteePhone] = useState(activeMember ? activeMember.phone : "");
  const [eventTitle, setEventTitle] = useState("");
  const [durationDays, setDurationDays] = useState(1);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("06:00 PM");
  const [notes, setNotes] = useState("");

  const pricingPerDay = 75000;

  // Simple Month Calendar Generator for June/July 2026
  const currentYear = 2026;
  const currentMonth = 5; // 0-indexed (June)
  
  // Helper to format date YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  // Generate days in June 2026 (30 days) and July 2026 (31 days)
  const generateDays = () => {
    const days = [];
    // June 2026 days
    for (let d = 21; d <= 30; d++) {
      days.push({
        dateStr: formatDateString(2026, 5, d),
        dayNum: d,
        monthLabel: "June"
      });
    }
    // July 2026 days
    for (let d = 1; d <= 20; d++) {
      days.push({
        dateStr: formatDateString(2026, 6, d),
        dayNum: d,
        monthLabel: "July"
      });
    }
    return days;
  };

  const calendarDays = generateDays();

  // Check if date is booked in hallBookings state
  const getBookingStatus = (dateStr: string) => {
    const booking = hallBookings.find((b) => b.bookingDate === dateStr);
    if (!booking) return "available";
    return booking.status; // "CONFIRMED" or "PENDING" or "CANCELLED"
  };

  const handleSelectDate = (dateStr: string) => {
    const status = getBookingStatus(dateStr);
    if (status === "CONFIRMED" || status === "PENDING") {
      alert("This date is already reserved or pending approval.");
      return;
    }
    setSelectedDate(dateStr);
    setStep(1);
    setEventTitle("");
    setDurationDays(1);
    setStartTime("09:00 AM");
    setEndTime("06:00 PM");
    setNotes("");
    setShowFormModal(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName || !devoteeEmail || !devoteePhone || !eventTitle) {
      alert("Please fill in all required fields.");
      return;
    }

    const newBooking = {
      id: "hb-new-" + Math.random().toString(36).substr(2, 9),
      devoteeName,
      devoteeEmail,
      devoteePhone,
      eventTitle,
      bookingDate: selectedDate!,
      durationDays,
      totalPrice: pricingPerDay * durationDays,
      status: "PENDING" as const, // Sent to Admin Dashboard for approval
      paymentStatus: "PENDING" as const,
      notes,
      hallName: "Shree Swaminarayan Hall",
      startTime,
      endTime
    };

    // Update global state
    setHallBookings((prev) => [newBooking, ...prev]);
    setStep(2);
  };

  return (
    <div className="py-24 bg-bg-warm min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Facilities"
          title="Shree Swaminarayan Hall Booking"
          subtitle="A luxury air-conditioned auditorium with 1200 capacity. Check available dates and book online."
        />

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-5 relative h-[380px] rounded-3xl overflow-hidden border border-primary-gold/20 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
              alt="Shree Swaminarayan Hall Inside"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-heading text-3xl font-medium text-dark-surface">
              A Premium Venue for Sacred Functions
            </h3>
            <p className="text-secondary-bronze leading-relaxed text-sm font-light font-sans">
              Designed with luxury aesthetics, our marriage hall supports grand stages, pure vegetarian catering infrastructure, audio-visual acoustics, and standard power backup systems. Fits up to 1200 guests comfortably for marriages, thread ceremonies, and devotional concerts.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-primary-gold/15 text-xs text-secondary-bronze">
              <div className="flex items-center space-x-2">
                <Users className="w-4.5 h-4.5 text-primary-gold shrink-0" />
                <span>1200 Capacity</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flame className="w-4.5 h-4.5 text-primary-gold shrink-0" />
                <span>Homa Permitted</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4.5 h-4.5 text-primary-gold shrink-0" />
                <span>CCTV Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4.5 h-4.5 text-primary-gold shrink-0" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability calendar Grid */}
        <div className="bg-surface-white rounded-3xl p-8 border border-primary-gold/15 shadow-sm max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-primary-gold/10">
            <div>
              <h4 className="font-heading text-2xl font-medium text-dark-surface">
                Availability Calendar
              </h4>
              <p className="text-xs text-secondary-bronze/70 font-sans mt-0.5">
                Showing slots for June - July 2026. Select an available date to request booking.
              </p>
            </div>
            
            {/* Color Legend */}
            <div className="flex gap-4 text-xs font-semibold text-secondary-bronze font-sans">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-success-green/10 border border-success-green" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-error-red/10 border border-error-red" />
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-warning-amber/10 border border-warning-amber" />
                <span>Pending</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {calendarDays.map((day) => {
              const status = getBookingStatus(day.dateStr);
              
              let bgStyle = "bg-success-green/10 border-success-green text-success-green hover:bg-success-green/20";
              let badgeText = "Available";
              
              if (status === "CONFIRMED") {
                bgStyle = "bg-error-red/10 border-error-red text-error-red cursor-not-allowed";
                badgeText = "Reserved";
              } else if (status === "PENDING") {
                bgStyle = "bg-warning-amber/10 border-warning-amber text-warning-amber cursor-not-allowed";
                badgeText = "Pending Approval";
              }

              return (
                <button
                  key={day.dateStr}
                  onClick={() => handleSelectDate(day.dateStr)}
                  disabled={status === "CONFIRMED" || status === "PENDING"}
                  className={`p-4.5 border rounded-2xl flex flex-col items-center justify-between text-center min-h-[96px] transition-all cursor-pointer ${bgStyle}`}
                >
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                      {day.monthLabel}
                    </p>
                    <p className="text-2xl font-bold font-heading mt-0.5">{day.dayNum}</p>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-wider mt-2 px-2 py-0.5 rounded bg-white/50">
                    {badgeText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Form modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative max-h-[95vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                    Hall Reservation
                  </span>
                  <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                    Book Shree Swaminarayan Hall
                  </h3>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-4 text-left">
                  <div className="p-4 border border-primary-gold/15 bg-bg-warm rounded-xl text-xs space-y-1.5 font-sans">
                    <p>Selected Date: <span className="font-bold text-dark-surface">{selectedDate}</span></p>
                    <p>Pricing Rate: <span className="font-bold text-dark-surface">{formatCurrency(pricingPerDay)} / day</span></p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Devotee Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={devoteeName}
                      onChange={(e) => setDevoteeName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={devoteeEmail}
                        onChange={(e) => setDevoteeEmail(e.target.value)}
                        placeholder="vikram.m@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={devoteePhone}
                        onChange={(e) => setDevoteePhone(e.target.value)}
                        placeholder="+91 91234 56789"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Event Category / Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        placeholder="e.g. Vivah Ceremony"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Duration (Days) *
                      </label>
                      <select
                        value={durationDays}
                        onChange={(e) => setDurationDays(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      >
                        <option value={1}>1 Day</option>
                        <option value={2}>2 Days</option>
                        <option value={3}>3 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Start Time & End Time Selectors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Start Time *
                      </label>
                      <select
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      >
                        <option>06:00 AM</option>
                        <option>08:00 AM</option>
                        <option>09:00 AM</option>
                        <option>10:00 AM</option>
                        <option>12:00 PM</option>
                        <option>02:00 PM</option>
                        <option>04:00 PM</option>
                        <option>06:00 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        End Time *
                      </label>
                      <select
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      >
                        <option>12:00 PM</option>
                        <option>02:00 PM</option>
                        <option>04:00 PM</option>
                        <option>06:00 PM</option>
                        <option>08:00 PM</option>
                        <option>10:00 PM</option>
                        <option>11:59 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Notes / Special Arrangements
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify stage setup, catering or priest requirements..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Submit Reservation Request
                  </button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-success-green/10 text-success-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="font-heading text-3xl font-medium text-dark-surface">
                    Request Registered!
                  </h3>
                  <p className="text-xs text-secondary-bronze font-sans mt-2">
                    Your hall booking has been submitted for management review.
                  </p>
                </div>

                <div className="p-5 border border-primary-gold/15 bg-bg-warm rounded-2xl text-left space-y-2 max-w-xs mx-auto font-sans">
                  <p className="text-xs text-secondary-bronze">
                    Booking Status: <span className="font-bold text-warning-amber">PENDING APPROVAL</span>
                  </p>
                  <p className="text-xs text-secondary-bronze">
                    Date Selected: <span className="font-bold text-dark-surface">{selectedDate} ({durationDays} Days)</span>
                  </p>
                  <p className="text-xs text-secondary-bronze">
                    Event Time: <span className="font-semibold text-dark-surface">{startTime} to {endTime}</span>
                  </p>
                  <p className="text-xs text-secondary-bronze">
                    Price Estimated: <span className="font-bold text-primary-gold">{formatCurrency(pricingPerDay * durationDays)}</span>
                  </p>
                </div>

                <p className="text-[10px] font-light text-secondary-bronze/70 leading-relaxed max-w-xs mx-auto">
                  Simulated flow: A Booking Manager will approve this request in the dashboard availability sheets, automatically updating the status.
                </p>

                <button
                  onClick={() => setShowFormModal(false)}
                  className="px-8 py-3 rounded-xl bg-primary-gold hover:bg-secondary-bronze text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
