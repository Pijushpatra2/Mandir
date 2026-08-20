"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, User, Mail, Phone, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function MembershipPage() {
  const router = useRouter();
  const { registerDevotee, showToast } = useApp();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const benefits = [
    { title: "Digital Gate Pass Card", desc: "Access the temple facilities with a scannable QR card stored in your profile." },
    { title: "Pooja Booking History", desc: "Book and keep track of your family's pooja schedules and service history." },
    { title: "Donation Tracking", desc: "Track and download receipt logs for all your virtual and physical temple donations." },
    { title: "Community Updates", desc: "Receive updates about upcoming festivals, special darshan slots, and volunteer programs." }
  ];

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password) {
      setErrorMsg("Please fill in all required fields.");
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await registerDevotee({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
        membership_type: "Annual" // Default level
      });
      // Success: redirect to dashboard
      router.push("/user-dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registration failed. Please check details and try again.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-24 bg-bg-warm min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Portal Access"
          title="Create Devotee Profile"
          subtitle="Join our community portal to book services, view your digital gate pass, and track your donations."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mt-12">
          {/* Left Column: Benefits (Takes 5 columns on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-heading text-2xl font-medium text-dark-surface">
              Devotee Benefits & Access
            </h3>
            <p className="text-xs text-secondary-bronze/70 leading-relaxed font-light">
              By creating a free profile, you gain access to the temple's online services and booking history.
            </p>
            
            <div className="space-y-5 pt-4">
              {benefits.map((benefit, idx) => (
                <div className="flex items-start space-x-4" key={idx}>
                  <div className="w-8 h-8 rounded-lg bg-primary-gold/10 flex items-center justify-center text-primary-gold shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading text-base font-medium text-dark-surface">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-secondary-bronze/75 font-sans font-light mt-1">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Registration Form (Takes 7 columns on desktop) */}
          <div className="lg:col-span-7">
            <GlassCard className="p-8 md:p-10 bg-surface-white/95 border border-primary-gold/15 shadow-xl rounded-3xl">
              <div className="mb-6">
                <h3 className="font-heading text-2xl font-medium text-dark-surface">
                  Devotee Registration Form
                </h3>
                <p className="text-xs text-secondary-bronze/60 mt-1 font-sans font-light">
                  Please fill in your details. All fields are required.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-error-red/10 border border-error-red/25 flex items-start gap-2.5 text-error-red text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Harish"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Mehta"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="harish.mehta@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +256 700 123456"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                    Choose Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? "Creating Profile..." : "Create Devotee Profile"}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-primary-gold/10 text-center">
                <p className="text-xs text-secondary-bronze/70 font-light font-sans">
                  Already have a profile?{" "}
                  <Link href="/login" className="text-primary-gold font-semibold hover:underline">
                    Sign In Here
                  </Link>
                </p>
              </div>
            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
}
