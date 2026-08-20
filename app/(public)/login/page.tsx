"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Mail, Phone, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DevoteeLoginPage() {
  const router = useRouter();
  const { loginDevotee, showToast } = useApp();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      setErrorMsg("Please enter email/phone and password.");
      showToast("Please fill in all fields", "error");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await loginDevotee(emailOrPhone, password);
      // Success: Redirect to devotee portal dashboard
      router.push("/user-dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-24 bg-bg-warm min-h-screen flex items-center justify-center font-sans">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-gold bg-primary-gold/10 px-3 py-1 rounded-full">
            Devotee Portal
          </span>
          <h2 className="font-heading text-3xl font-medium text-dark-surface mt-3">
            Sign In to Swaminarayan Temple
          </h2>
          <p className="text-xs text-secondary-bronze/70 mt-2 font-sans font-light">
            Manage your pooja bookings, donations, and digital membership card.
          </p>
        </div>

        <GlassCard className="p-8 bg-surface-white/95 border border-primary-gold/15 shadow-xl rounded-3xl relative overflow-hidden">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-error-red/10 border border-error-red/25 flex items-start gap-2.5 text-error-red text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-secondary-bronze/45">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. harish.mehta@example.com or +91..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-secondary-bronze/45">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-bronze/45 hover:text-dark-surface"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center text-secondary-bronze/80 font-light select-none">
                <input
                  type="checkbox"
                  className="mr-1.5 accent-primary-gold border-primary-gold/20 rounded cursor-pointer"
                />
                Remember Me
              </label>
              <a href="#" className="text-primary-gold hover:underline font-medium">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-primary-gold/10 text-center">
            <p className="text-xs text-secondary-bronze/70 font-light font-sans">
              Don't have a devotee profile yet?{" "}
              <Link href="/membership" className="text-primary-gold font-semibold hover:underline">
                Create Devotee Membership
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
