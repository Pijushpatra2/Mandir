"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Sparkles, CheckCircle2, X, Info } from "lucide-react";

export default function ServicesPage() {
  const { poojaBookings, setPoojaBookings, members, currentMemberNumber } = useApp();
  const [selectedPooja, setSelectedPooja] = useState<any | null>(null);
  const [step, setStep] = useState(1); // Steps: 1 (form), 2 (payment), 3 (success)
  
  // Form State
  const activeMember = members.find(m => m.membershipNumber === currentMemberNumber) || members[0];
  const [devoteeName, setDevoteeName] = useState(activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : "");
  const [gothra, setGothra] = useState("");
  const [nakshatra, setNakshatra] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [slot, setSlot] = useState("Morning (8:30 AM)");
  const [withContents, setWithContents] = useState(false); // Toggle Puja Samagri box
  
  const poojas = [
    { id: "ps-1", name: "Satyanarayan Pooja", desc: "Performed to seek prosperity, health, and peace of mind.", price: 2100, duration: 120 },
    { id: "ps-2", name: "Maha Abhishek Seva", desc: "Ceremonial bathing of deities with milk, honey, yogurt, and ghee.", price: 5100, duration: 90 },
    { id: "ps-3", name: "Archana Seva", desc: "Chanting of 108 holy names on behalf of devotee's family.", price: 251, duration: 15 },
    { id: "ps-4", name: "Shringar Seva", desc: "Sponsor deity daily dressing and obtain special Aarti seating.", price: 3100, duration: 60 },
    { id: "ps-5", name: "Sudarshana Homa", desc: "A powerful fire ritual to eliminate negative energies.", price: 11000, duration: 180 }
  ];

  const handleOpenBooking = (pooja: any) => {
    setSelectedPooja(pooja);
    setStep(1);
    setGothra("");
    setNakshatra("");
    setBookingDate("");
    setWithContents(false);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName || !bookingDate) {
      alert("Please fill in devotee name and date.");
      return;
    }
    setStep(2); // Go to payment step
  };

  const handleSimulatePayment = () => {
    const finalAmount = selectedPooja.price + (withContents ? 500 : 0);
    const receiptNum = "PUJ-2026-" + Math.floor(1000 + Math.random() * 9000);
    
    const newBooking = {
      id: "pb-new-" + Math.random().toString(36).substr(2, 9),
      poojaId: selectedPooja.id,
      poojaName: selectedPooja.name,
      devoteeName,
      gothra: gothra || "General",
      nakshatra: nakshatra || "General",
      date: bookingDate,
      slot: slot + (withContents ? " (With Puja Contents)" : " (Without Contents)"),
      priestName: "Pandit Ramachandra Shastri",
      status: "CONFIRMED" as const,
      paymentStatus: "PAID" as const,
      amount: finalAmount,
      receiptNumber: receiptNum
    };

    // Update global state
    setPoojaBookings((prev) => [newBooking, ...prev]);
    setStep(3); // Success Screen
  };

  const getPoojaTotal = () => {
    if (!selectedPooja) return 0;
    return selectedPooja.price + (withContents ? 500 : 0);
  };

  return (
    <div className="py-24 bg-bg-warm min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Priest services"
          title="Pooja & Seva Bookings"
          subtitle="Select from our range of traditional Vedic poojas. Register for individual or family services."
        />

        {/* Pooja Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {poojas.map((pooja) => (
            <GlassCard hoverEffect className="p-8 flex flex-col justify-between h-full bg-surface-white" key={pooja.id}>
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold mb-6">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-2xl font-medium text-dark-surface mb-3">
                  {pooja.name}
                </h3>
                <p className="text-xs text-secondary-bronze/85 font-light leading-relaxed font-sans mb-6">
                  {pooja.desc}
                </p>
                <div className="space-y-2 text-xs text-secondary-bronze mb-6 font-light font-sans">
                  <p>Duration: <span className="font-semibold text-dark-surface">{pooja.duration} mins</span></p>
                  <p>Priest: <span className="font-semibold text-dark-surface">Provided by Mandir</span></p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-primary-gold/15 pt-4">
                <span className="text-lg font-bold text-primary-gold">
                  {formatCurrency(pooja.price)}
                </span>
                <button
                  onClick={() => handleOpenBooking(pooja)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Booking Dialog Modal */}
        {selectedPooja && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedPooja(null)}
                className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Step 1: Form Inputs */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                      Step 1 of 3
                    </span>
                    <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                      Book {selectedPooja.name}
                    </h3>
                  </div>

                  <form onSubmit={handleSubmitBooking} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Devotee Full Name *
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                          Gothra (Optional)
                        </label>
                        <input
                          type="text"
                          value={gothra}
                          onChange={(e) => setGothra(e.target.value)}
                          placeholder="e.g. Kashyap"
                          className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                          Nakshatra (Optional)
                        </label>
                        <input
                          type="text"
                          value={nakshatra}
                          onChange={(e) => setNakshatra(e.target.value)}
                          placeholder="e.g. Rohini"
                          className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                          Date *
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
                          Time Slot *
                        </label>
                        <select
                          value={slot}
                          onChange={(e) => setSlot(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                        >
                          <option>Morning (6:30 AM)</option>
                          <option>Morning (8:30 AM)</option>
                          <option>Evening (5:30 PM)</option>
                        </select>
                      </div>
                    </div>

                    {/* Puja Contents Checkbox */}
                    <div className="flex items-start gap-3 p-3.5 border border-primary-gold/15 bg-bg-warm/30 rounded-xl mt-2">
                      <input
                        type="checkbox"
                        id="pujaContents"
                        checked={withContents}
                        onChange={(e) => setWithContents(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-primary-gold border-primary-gold/25 focus:ring-primary-gold cursor-pointer mt-0.5"
                      />
                      <label htmlFor="pujaContents" className="text-xs font-semibold text-secondary-bronze cursor-pointer select-none">
                        Include Puja Samagri (Contents) Box (+UGX 500)
                        <span className="block text-[10px] font-normal text-secondary-bronze/70 mt-0.5 leading-normal">
                          Includes fresh flowers, holy leaves, coconut, honey, camphor, dhoop, thread, and all Vedic ritual samagri ingredients.
                        </span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer mt-2"
                    >
                      Proceed to Payment
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Payment Simulator */}
              {step === 2 && (
                <div className="space-y-6 text-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                      Step 2 of 3
                    </span>
                    <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                      Simulate Payment
                    </h3>
                  </div>

                  <div className="p-5 border border-primary-gold/15 bg-bg-warm rounded-2xl text-left space-y-2">
                    <p className="text-xs text-secondary-bronze font-sans">
                      Service: <span className="font-bold text-dark-surface">{selectedPooja.name}</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans">
                      Date: <span className="font-bold text-dark-surface">{bookingDate} ({slot})</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans">
                      Devotee: <span className="font-bold text-dark-surface">{devoteeName}</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans">
                      Puja Contents: <span className="font-bold text-dark-surface">{withContents ? "With Puja Samagri (+UGX 500)" : "Without Samagri (Devotee Brings)"}</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans pt-2 border-t border-primary-gold/10">
                      Total Amount: <span className="font-bold text-lg text-primary-gold">{formatCurrency(getPoojaTotal())}</span>
                    </p>
                  </div>

                  <p className="text-xs font-light text-secondary-bronze/70 leading-relaxed font-sans max-w-sm mx-auto">
                    This is a frontend simulator. Clicking checkout will bypass Stripe/Razorpay and issue a successful booking confirmation.
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 rounded-xl border border-primary-gold/25 hover:bg-bg-warm text-secondary-bronze text-xs font-semibold transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSimulatePayment}
                      className="flex-grow py-3 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer"
                    >
                      Complete Checkout
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Success Screen */}
              {step === 3 && (
                <div className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-success-green/10 text-success-green flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h3 className="font-heading text-3xl font-medium text-dark-surface">
                      Booking Confirmed!
                    </h3>
                    <p className="text-xs text-secondary-bronze font-sans mt-2">
                      Your devotional slot has been successfully registered.
                    </p>
                  </div>

                  <div className="p-5 border border-primary-gold/15 bg-bg-warm rounded-2xl text-left space-y-2 max-w-xs mx-auto">
                    <p className="text-xs text-secondary-bronze font-sans">
                      Receipt #: <span className="font-mono font-bold text-dark-surface">PUJ-2026-CONF</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans">
                      Devotee: <span className="font-bold text-dark-surface">{devoteeName}</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans">
                      Contents: <span className="font-bold text-dark-surface">{withContents ? "With Puja Samagri Box" : "Without Contents"}</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans">
                      Priest: <span className="font-bold text-dark-surface">Pandit Ramachandra Shastri</span>
                    </p>
                  </div>

                  <p className="text-[10px] font-light text-secondary-bronze/70 leading-relaxed max-w-xs mx-auto">
                    A confirmation email and SMS receipt have been simulated. You can review this transaction inside the Devotee Portal.
                  </p>

                  <button
                    onClick={() => setSelectedPooja(null)}
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
    </div>
  );
}
