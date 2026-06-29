"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";

export default function MembershipPage() {
  const { members, setMembers: setGlobalMembers, setCurrentMemberNumber, setUserRole } = useApp();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [step, setStep] = useState(1); // 1: form, 2: success
  
  // Form values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [membershipType, setMembershipType] = useState<"Annual" | "Life" | "Patron">("Annual");
  const [familyCount, setFamilyCount] = useState(0);

  const benefits = [
    { title: "Digital Membership Card", desc: "Access the temple facilities with an instant-generated QR card stored in your profile." },
    { title: "Family Profile Linkages", desc: "Link family details to register joint bookings and secure priority festival entry." },
    { title: "Special Darshan Priority", desc: "Receive fast-track priority queues during major festivals like Janmashtami and Diwali." },
    { title: "Annual Blessings Prasad", desc: "Sponsor-exclusive packages containing temple prasadam, dry-fruits, and mementos delivered home." }
  ];

  const plans = [
    { type: "Annual", price: "₹1,200 / yr", desc: "Standard community access, monthly newsletters, and digital card status." },
    { type: "Life", price: "₹25,000 / one-time", desc: "Lifetime devotee portal access, name inscribed on donor boards, and VIP event seating." },
    { type: "Patron", price: "₹1,00,000 / one-time", desc: "Core trustee-advisory circle invitations, permanent VIP seating, and lifetime priority puja bookings." }
  ];

  const handleOpenRegister = (type: any) => {
    setMembershipType(type);
    setStep(1);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setFamilyCount(0);
    setShowApplyModal(true);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    const memberIdNum = "MEM-2026-" + Math.floor(1000 + Math.random() * 9000);
    const newMember = {
      id: "mem-new-" + Math.random().toString(36).substr(2, 9),
      membershipNumber: memberIdNum,
      firstName,
      lastName,
      email,
      phone,
      status: "ACTIVE" as const, // Automatically active for mockup sandbox to let them download ID Card immediately!
      joinedDate: new Date().toISOString().split("T")[0],
      validUntil: membershipType === "Annual" ? "2027-06-21" : "2099-12-31",
      membershipType,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${memberIdNum}`,
      familyMembers: []
    };

    // Update global context
    setGlobalMembers((prev) => [newMember, ...prev]);
    setCurrentMemberNumber(memberIdNum); // Log in as new devotee
    setUserRole("DEVOTEE"); // Switch to devotee role
    setStep(2);
  };

  return (
    <div className="py-24 bg-bg-warm min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Join us"
          title="Devotee Membership Circle"
          subtitle="Become an active partner in our temple's growth and operations. Gain priority services and community access."
        />

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {benefits.map((benefit, idx) => (
            <GlassCard hoverEffect className="p-8 flex items-start space-x-5 bg-surface-white" key={idx}>
              <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-xl font-medium text-dark-surface mb-2">
                  {benefit.title}
                </h4>
                <p className="text-xs text-secondary-bronze/80 font-light leading-relaxed font-sans">
                  {benefit.desc}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <GlassCard
              hoverEffect
              className={`p-10 flex flex-col justify-between bg-surface-white ${
                plan.type === "Life" ? "border-primary-gold border-2 shadow-md relative" : ""
              }`}
              key={plan.type}
            >
              {plan.type === "Life" && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-gold text-white font-bold text-[9px] uppercase tracking-wider rounded-full shadow-sm">
                  Recommended
                </span>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze">
                  {plan.type} Level
                </span>
                <h3 className="font-heading text-3xl font-medium text-dark-surface mt-2 mb-4">
                  {plan.price}
                </h3>
                <p className="text-xs text-secondary-bronze/70 leading-relaxed font-sans font-light mb-6">
                  {plan.desc}
                </p>
              </div>
              <button
                onClick={() => handleOpenRegister(plan.type as any)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer text-center"
              >
                Apply for {plan.type}
              </button>
            </GlassCard>
          ))}
        </div>

        {/* Register Modal dialog */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative overflow-hidden max-h-[95vh] overflow-y-auto">
              
              {/* Close button */}
              <button
                onClick={() => setShowApplyModal(false)}
                className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                      Membership Application
                    </span>
                    <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                      Register as {membershipType} Member
                    </h3>
                  </div>

                  <form onSubmit={handleApplySubmit} className="space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Harish"
                          className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Mehta"
                          className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="harish.mehta@example.com"
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 99110 54321"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Family Members to Add (Optional)
                      </label>
                      <select
                        value={familyCount}
                        onChange={(e) => setFamilyCount(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      >
                        <option value={0}>Just Myself</option>
                        <option value={1}>Myself + 1 Member</option>
                        <option value={2}>Myself + 2 Members</option>
                        <option value={3}>Myself + 3 Members</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Submit Registration
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
                    <h3 className="font-heading text-3xl font-medium text-dark-surface">
                      Registration Complete!
                    </h3>
                    <p className="text-xs text-secondary-bronze font-sans mt-2">
                      Your devotee membership profile is active. You can now download your digital ID card.
                    </p>
                  </div>

                  <div className="p-5 border border-primary-gold/15 bg-bg-warm rounded-2xl text-left space-y-2 max-w-xs mx-auto">
                    <p className="text-xs text-secondary-bronze font-sans">
                      Membership Status: <span className="font-bold text-success-green">ACTIVE</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans">
                      Devotee Name: <span className="font-bold text-dark-surface">{firstName} {lastName}</span>
                    </p>
                    <p className="text-xs text-secondary-bronze font-sans">
                      Level: <span className="font-bold text-primary-gold">{membershipType}</span>
                    </p>
                  </div>

                  <p className="text-[10px] font-light text-secondary-bronze/70 leading-relaxed max-w-xs mx-auto">
                    Your digital ID card has been issued with a scannable entrance QR pass. Redirect to your dashboard to view and download.
                  </p>

                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowApplyModal(false)}
                      className="w-full py-3.5 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer text-center block"
                    >
                      Go to Dashboard & Download ID Card
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
