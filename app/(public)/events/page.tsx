"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Calendar, Clock, MapPin, Users, CheckCircle2, X } from "lucide-react";

export default function EventsPage() {
  const { events, setEvents } = useApp();
  const [filter, setFilter] = useState<string>("All");
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [step, setStep] = useState(1); // 1: form, 2: success
  
  // Form state
  const [devoteeName, setDevoteeName] = useState("");
  const [devoteeEmail, setDevoteeEmail] = useState("");
  const [tickets, setTickets] = useState(1);

  const categories = ["All", "Festival", "Satsang", "Seva", "Cultural"];

  const filteredEvents = events.filter((e) => {
    if (filter === "All") return true;
    return e.category === filter;
  });

  const handleOpenRegister = (event: any) => {
    setSelectedEvent(event);
    setStep(1);
    setDevoteeName("");
    setDevoteeEmail("");
    setTickets(1);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName || !devoteeEmail) {
      alert("Please fill in all fields.");
      return;
    }

    // Simulate increasing the registeredCount in state
    setEvents((prevEvents) =>
      prevEvents.map((evt) => {
        if (evt.id === selectedEvent.id) {
          return {
            ...evt,
            registeredCount: evt.registeredCount + tickets,
          };
        }
        return evt;
      })
    );

    setStep(2);
  };

  return (
    <div className="py-24 bg-bg-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Mandir calendar"
          title="Upcoming Festivals & Events"
          subtitle="Participate in our vibrant congregational assemblies, holy discources, and community sevas."
        />

        {/* Filter categories tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 text-sm sm:text-base font-semibold rounded-xl border transition-all cursor-pointer font-poppins ${
                filter === cat
                  ? "bg-primary-gold text-white border-primary-gold shadow-sm"
                  : "border-primary-gold/20 text-secondary-bronze bg-white hover:bg-primary-gold/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => (
            <GlassCard hoverEffect className="overflow-hidden p-0 flex flex-col h-full" key={evt.id}>
              <div className="relative h-56 w-full">
                <img
                  src={evt.bannerImage}
                  alt={evt.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider text-secondary-bronze font-poppins">
                  {evt.category}
                </div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-grow">
                <div className="space-y-4">
                  <span className="text-xs sm:text-sm font-semibold text-secondary-bronze/70 uppercase font-poppins">
                    Status: {evt.status}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-heading font-medium text-dark-surface leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-sm sm:text-base text-secondary-bronze/85 leading-relaxed font-poppins line-clamp-3">
                    {evt.description}
                  </p>
                  
                  {/* Event details list */}
                  <div className="space-y-2.5 text-sm sm:text-base text-secondary-bronze pt-3 border-t border-primary-gold/10 font-poppins">
                    <p className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-primary-gold shrink-0" />
                      <span>{evt.date}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-primary-gold shrink-0" />
                      <span>{evt.time}</span>
                    </p>
                    <p className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-primary-gold shrink-0" />
                      <span>
                        Registered: {evt.registeredCount} / {evt.capacityLimit}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-primary-gold/15 mt-6 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-secondary-bronze/70 font-poppins">Free Entry</span>
                  {evt.status === "Upcoming" ? (
                    <button
                      onClick={() => handleOpenRegister(evt)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-sm sm:text-base font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer font-poppins"
                    >
                      Register Now
                    </button>
                  ) : (
                    <span className="text-sm sm:text-base font-bold text-secondary-bronze/50 font-poppins">Registration Closed</span>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Registration Modal Dialog */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-6 sm:p-8 relative overflow-hidden max-h-[95vh] overflow-y-auto">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-gold font-poppins">
                      Event Entrance Registration
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-medium text-dark-surface mt-1">
                      Register for {selectedEvent.title}
                    </h3>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Devotee Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={devoteeName}
                        onChange={(e) => setDevoteeName(e.target.value)}
                        placeholder="e.g. Anand Patel"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={devoteeEmail}
                        onChange={(e) => setDevoteeEmail(e.target.value)}
                        placeholder="anand.patel@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Number of Passes / Entry slots *
                      </label>
                      <select
                        value={tickets}
                        onChange={(e) => setTickets(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none"
                      >
                        <option value={1}>1 Person</option>
                        <option value={2}>2 Persons</option>
                        <option value={3}>3 Persons</option>
                        <option value={4}>4 Persons</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-sm sm:text-base tracking-wide cursor-pointer font-poppins"
                    >
                      Confirm Free Reservation
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-success-green/10 text-success-green flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-medium text-dark-surface">
                      Registration Confirmed!
                    </h3>
                    <p className="text-sm sm:text-base text-secondary-bronze font-poppins mt-2">
                      Your entry passes have been simulated successfully.
                    </p>
                  </div>

                  <div className="p-5 border border-primary-gold/15 bg-bg-warm rounded-2xl text-left space-y-2 max-w-sm mx-auto">
                    <p className="text-sm sm:text-base text-secondary-bronze font-poppins">
                      Pass ID: <span className="font-mono font-bold text-dark-surface">EVT-PASS-{Math.floor(10000 + Math.random()*90000)}</span>
                    </p>
                    <p className="text-sm sm:text-base text-secondary-bronze font-poppins">
                      Event: <span className="font-bold text-dark-surface">{selectedEvent.title}</span>
                    </p>
                    <p className="text-sm sm:text-base text-secondary-bronze font-poppins">
                      Attendees: <span className="font-bold text-dark-surface">{tickets} Devotees</span>
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-secondary-bronze/70 leading-relaxed max-w-sm mx-auto font-poppins">
                    A digital barcode pass has been generated. Use it at the temple gate entrance on the event day.
                  </p>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-8 py-3 rounded-xl bg-primary-gold hover:bg-secondary-bronze text-white text-sm sm:text-base font-semibold shadow-md transition-colors cursor-pointer font-poppins"
                  >
                    Done
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
