"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Calendar, Check, X, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BookingsDashboardPage() {
  const { 
    hallBookings, 
    setHallBookings, 
    poojaBookings, 
    setPoojaBookings, 
    darshanBookings, 
    setDarshanBookings 
  } = useApp();
  const [activeTab, setActiveTab] = useState<"pooja" | "hall" | "darshan">("pooja");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Filters
  const filteredPoojaBookings = poojaBookings.filter((pb) => {
    return (
      pb.devoteeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.poojaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pb.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredHallBookings = hallBookings.filter((hb) => {
    return (
      hb.devoteeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hb.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredDarshanBookings = darshanBookings.filter((db) => {
    return (
      db.devoteeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      db.slot.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Action Handlers
  const handleApproveHallBooking = (id: string) => {
    setHallBookings((prev) =>
      prev.map((hb) => {
        if (hb.id === id) {
          return { ...hb, status: "CONFIRMED", paymentStatus: "PAID" };
        }
        return hb;
      })
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev: any) => ({ ...prev, status: "CONFIRMED", paymentStatus: "PAID" }));
    }
  };

  const handleCancelHallBooking = (id: string) => {
    setHallBookings((prev) =>
      prev.map((hb) => {
        if (hb.id === id) {
          return { ...hb, status: "CANCELLED" };
        }
        return hb;
      })
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev: any) => ({ ...prev, status: "CANCELLED" }));
    }
  };

  const handleApprovePoojaBooking = (id: string) => {
    setPoojaBookings((prev) =>
      prev.map((pb) => {
        if (pb.id === id) {
          return { ...pb, status: "CONFIRMED", paymentStatus: "PAID" };
        }
        return pb;
      })
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev: any) => ({ ...prev, status: "CONFIRMED", paymentStatus: "PAID" }));
    }
  };

  const handleApproveDarshanBooking = (id: string) => {
    setDarshanBookings((prev) =>
      prev.map((db) => {
        if (db.id === id) {
          return { ...db, status: "CONFIRMED" };
        }
        return db;
      })
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev: any) => ({ ...prev, status: "CONFIRMED" }));
    }
  };

  const handleCancelDarshanBooking = (id: string) => {
    setDarshanBookings((prev) =>
      prev.map((db) => {
        if (db.id === id) {
          return { ...db, status: "CANCELLED" };
        }
        return db;
      })
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking((prev: any) => ({ ...prev, status: "CANCELLED" }));
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-medium text-dark-surface">
          Booking Management
        </h1>
        <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
          Review and approve Radhe Krishna Hall events, Darshan slot visit passes, and daily Pooja priest assignments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary-gold/15 gap-4">
        <button
          onClick={() => {
            setActiveTab("pooja");
            setSelectedBooking(null);
          }}
          className={cn(
            "pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 px-1 cursor-pointer",
            activeTab === "pooja"
              ? "border-primary-gold text-primary-gold font-bold"
              : "border-transparent text-secondary-bronze/70 hover:text-secondary-bronze"
          )}
        >
          Pooja Services ({poojaBookings.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("hall");
            setSelectedBooking(null);
          }}
          className={cn(
            "pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 px-1 cursor-pointer",
            activeTab === "hall"
              ? "border-primary-gold text-primary-gold font-bold"
              : "border-transparent text-secondary-bronze/70 hover:text-secondary-bronze"
          )}
        >
          Hall Reservations ({hallBookings.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("darshan");
            setSelectedBooking(null);
          }}
          className={cn(
            "pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 px-1 cursor-pointer",
            activeTab === "darshan"
              ? "border-primary-gold text-primary-gold font-bold"
              : "border-transparent text-secondary-bronze/70 hover:text-secondary-bronze"
          )}
        >
          Darshan Visits ({darshanBookings.length})
        </button>
      </div>

      {/* Control Search Bar */}
      <div className="flex gap-4 bg-surface-white p-4 rounded-2xl border border-primary-gold/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "pooja"
                ? "Search Pooja bookings by devotee name, service, or receipt..."
                : activeTab === "hall"
                ? "Search Hall bookings by devotee name, event title..."
                : "Search Darshan bookings by devotee name or time slot..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Table List */}
        <div className="lg:col-span-8 overflow-x-auto bg-surface-white rounded-3xl border border-primary-gold/15 shadow-sm">
          {activeTab === "pooja" && (
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Receipt</th>
                  <th className="px-6 py-4">Devotee Name</th>
                  <th className="px-6 py-4">Pooja Service</th>
                  <th className="px-6 py-4">Date / Slot</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/10">
                {filteredPoojaBookings.map((pb) => (
                  <tr className="hover:bg-bg-warm/50 transition-colors" key={pb.id}>
                    <td className="px-6 py-4 font-mono font-semibold text-dark-surface">
                      {pb.receiptNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-dark-surface">{pb.devoteeName}</p>
                      <p className="text-[10px] text-secondary-bronze/65">
                        Gothra: {pb.gothra} • Nakshatra: {pb.nakshatra}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-secondary-bronze">
                      {pb.poojaName}
                      {pb.slot.includes("With Puja Contents") && (
                        <span className="ml-2 px-1.5 py-0.5 text-[8px] font-bold text-primary-gold bg-primary-gold/10 border border-primary-gold/25 rounded uppercase">
                          With Samagri
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-dark-surface">{pb.date}</p>
                      <p className="text-[10px] text-secondary-bronze/65">{pb.slot.split(" (")[0]}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[9px] font-bold rounded uppercase",
                          pb.status === "CONFIRMED" && "bg-success-green/10 text-success-green",
                          pb.status === "PENDING" && "bg-warning-amber/10 text-warning-amber",
                          pb.status === "COMPLETED" && "bg-primary-gold/10 text-primary-gold",
                          pb.status === "CANCELLED" && "bg-error-red/10 text-error-red"
                        )}
                      >
                        {pb.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedBooking({ ...pb, type: "pooja" })}
                        className="p-1.5 rounded-lg border border-primary-gold/20 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "hall" && (
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Hall Event</th>
                  <th className="px-6 py-4">Devotee Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Duration & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/10">
                {filteredHallBookings.map((hb) => (
                  <tr className="hover:bg-bg-warm/50 transition-colors" key={hb.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-dark-surface">{hb.eventTitle}</p>
                      <p className="text-[10px] text-secondary-bronze/65">{hb.hallName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-dark-surface">{hb.devoteeName}</p>
                      <p className="text-[10px] text-secondary-bronze/65">{hb.devoteePhone}</p>
                    </td>
                    <td className="px-6 py-4 text-secondary-bronze/80 font-semibold">
                      {hb.bookingDate}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-dark-surface">{hb.durationDays} Day{hb.durationDays > 1 ? "s" : ""}</p>
                      {hb.startTime && hb.endTime ? (
                        <p className="text-[10px] text-secondary-bronze/65">{hb.startTime} - {hb.endTime}</p>
                      ) : (
                        <p className="text-[10px] text-secondary-bronze/50 font-light">Full Day Access</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[9px] font-bold rounded uppercase",
                          hb.status === "CONFIRMED" && "bg-success-green/10 text-success-green",
                          hb.status === "PENDING" && "bg-warning-amber/10 text-warning-amber",
                          hb.status === "CANCELLED" && "bg-error-red/10 text-error-red"
                        )}
                      >
                        {hb.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedBooking({ ...hb, type: "hall" })}
                        className="p-1.5 rounded-lg border border-primary-gold/20 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "darshan" && (
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Devotee Name</th>
                  <th className="px-6 py-4">Contact Phone</th>
                  <th className="px-6 py-4">Visit Date</th>
                  <th className="px-6 py-4">Time Slot Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/10">
                {filteredDarshanBookings.map((db) => (
                  <tr className="hover:bg-bg-warm/50 transition-colors" key={db.id}>
                    <td className="px-6 py-4 font-semibold text-dark-surface">
                      {db.devoteeName}
                    </td>
                    <td className="px-6 py-4 text-secondary-bronze">
                      {db.devoteePhone}
                    </td>
                    <td className="px-6 py-4 text-secondary-bronze/80 font-semibold">
                      {db.date}
                    </td>
                    <td className="px-6 py-4 font-medium text-dark-surface">
                      {db.slot}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[9px] font-bold rounded uppercase",
                          db.status === "CONFIRMED" && "bg-success-green/10 text-success-green",
                          db.status === "PENDING" && "bg-warning-amber/10 text-warning-amber",
                          db.status === "CANCELLED" && "bg-error-red/10 text-error-red"
                        )}
                      >
                        {db.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedBooking({ ...db, type: "darshan" })}
                        className="p-1.5 rounded-lg border border-primary-gold/20 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Side Details Panel */}
        <div className="lg:col-span-4">
          {selectedBooking ? (
            <GlassCard className="p-8 border-primary-gold/25 shadow-md space-y-6 relative overflow-hidden bg-surface-white">
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 p-1.5 text-secondary-bronze hover:text-dark-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-primary-gold">
                  {selectedBooking.type === "pooja" 
                    ? "Pooja Seva Detail" 
                    : selectedBooking.type === "hall" 
                    ? "Hall Reservation Detail" 
                    : "Darshan Pass Detail"}
                </span>
                <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1 leading-tight">
                  {selectedBooking.type === "pooja" 
                    ? selectedBooking.poojaName 
                    : selectedBooking.type === "hall" 
                    ? selectedBooking.eventTitle 
                    : "Darshan Scheduled Visit"}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs font-sans border-y border-primary-gold/10 py-5">
                <div className="flex justify-between">
                  <span className="text-secondary-bronze/65">Applicant Name:</span>
                  <span className="font-semibold text-dark-surface">{selectedBooking.devoteeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-bronze/65">Contact Phone:</span>
                  <span className="font-semibold text-dark-surface">{selectedBooking.devoteePhone || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-bronze/65">Date Scheduled:</span>
                  <span className="font-semibold text-dark-surface">
                    {selectedBooking.type === "pooja" ? selectedBooking.date : selectedBooking.date || selectedBooking.bookingDate}
                  </span>
                </div>
                {selectedBooking.type === "pooja" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-secondary-bronze/65">Aarti Slot:</span>
                      <span className="font-semibold text-dark-surface">{selectedBooking.slot.split(" (")[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-bronze/65">Puja Ingredients:</span>
                      <span className="font-bold text-primary-gold">
                        {selectedBooking.slot.includes("With Puja Contents") ? "Samagri Box Provided (+₹500)" : "No Contents (Devotee Brings)"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-bronze/65">Resident Priest:</span>
                      <span className="font-semibold text-dark-surface">{selectedBooking.priestName}</span>
                    </div>
                  </>
                )}
                {selectedBooking.type === "hall" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-secondary-bronze/65">Event Duration:</span>
                      <span className="font-semibold text-dark-surface">{selectedBooking.durationDays} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-bronze/65">Timings:</span>
                      <span className="font-semibold text-dark-surface">
                        {selectedBooking.startTime && selectedBooking.endTime 
                          ? `${selectedBooking.startTime} - ${selectedBooking.endTime}` 
                          : "Full Day Access"}
                      </span>
                    </div>
                  </>
                )}
                {selectedBooking.type === "darshan" && (
                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/65">Selected Slot:</span>
                    <span className="font-semibold text-dark-surface">{selectedBooking.slot}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-primary-gold/5">
                  <span className="text-secondary-bronze/65">Booking Price:</span>
                  <span className="font-bold text-primary-gold">
                    {selectedBooking.type === "pooja" 
                      ? formatCurrency(selectedBooking.amount) 
                      : selectedBooking.type === "hall" 
                      ? formatCurrency(selectedBooking.totalPrice) 
                      : "Free Admission"}
                  </span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="p-3.5 bg-bg-warm rounded-xl border border-primary-gold/10 text-xs">
                  <p className="font-semibold text-secondary-bronze">Special Notes:</p>
                  <p className="text-secondary-bronze/80 font-light mt-1 font-sans leading-relaxed">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Status Actions */}
              {selectedBooking.status === "PENDING" && (
                <div className="pt-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (selectedBooking.type === "hall") {
                        handleCancelHallBooking(selectedBooking.id);
                      } else if (selectedBooking.type === "darshan") {
                        handleCancelDarshanBooking(selectedBooking.id);
                      }
                    }}
                    className="w-1/3 py-2.5 rounded-xl border border-error-red/30 text-error-red text-xs font-semibold hover:bg-error-red/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedBooking.type === "hall") {
                        handleApproveHallBooking(selectedBooking.id);
                      } else if (selectedBooking.type === "darshan") {
                        handleApproveDarshanBooking(selectedBooking.id);
                      } else {
                        handleApprovePoojaBooking(selectedBooking.id);
                      }
                    }}
                    className="flex-grow py-2.5 rounded-xl bg-success-green text-white text-xs font-semibold shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Pass</span>
                  </button>
                </div>
              )}

            </GlassCard>
          ) : (
            <GlassCard hoverEffect={false} className="p-8 border-primary-gold/15 bg-surface-white text-center py-20">
              <Calendar className="w-10 h-10 text-primary-gold/45 mx-auto mb-4" />
              <h4 className="font-heading text-lg font-medium text-dark-surface">
                No Booking Selected
              </h4>
              <p className="text-[11px] text-secondary-bronze/65 leading-relaxed font-sans max-w-[200px] mx-auto mt-2">
                Select a booking row by clicking the eye icon to audit detail metrics and prioritize assignments.
              </p>
            </GlassCard>
          )}
        </div>

      </div>

    </div>
  );
}
