"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginShopkeeper } from "@/lib/shopkeeperApi";
import { resetStaffSession } from "@/lib/apiClient";
import {
  Store,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ShopkeeperLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginShopkeeper({ email: email.trim(), password });
      resetStaffSession();
      router.push("/shopkeeper/dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid credentials or shopkeeper account is disabled.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("shopkeeper@sksstkampala.org");
    setPassword("Shop@123456");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#0E0A06] text-white flex flex-col justify-between font-jakarta selection:bg-primary-gold selection:text-white relative overflow-hidden">
      {/* Background Ambience / Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[400px] bg-gradient-to-b from-primary-gold/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-secondary-bronze/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-primary-gold/15 bg-black/30 backdrop-blur-md relative z-10">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-gold to-secondary-bronze p-0.5 shadow-lg shadow-primary-gold/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#16110B] rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-gold group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="font-heading text-base font-bold text-white tracking-wide block">
              SKSS Temple Store
            </span>
            <span className="text-[10px] text-primary-gold font-semibold tracking-wider uppercase">
              Shopkeeper Portal
            </span>
          </div>
        </Link>

        <Link
          href="/shop"
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-primary-gold/30 bg-primary-gold/10 hover:bg-primary-gold/20 text-xs font-semibold text-primary-gold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View Public Shop</span>
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-8">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-[#18130C]/90 border border-primary-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-gold to-transparent" />

            {/* Title & Badge */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-gold/15 border border-primary-gold/30 text-primary-gold text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Store Clerk Authentication</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                Shopkeeper Desk
              </h1>
              <p className="text-xs text-white/60">
                Log in to fulfill devotee orders, update inventory & manage counter sales.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-error-red/15 border border-error-red/30 flex items-start space-x-2.5 text-xs text-red-200 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-error-red shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 block">
                  Shopkeeper Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold/70" />
                  <input
                    type="email"
                    required
                    placeholder="shopkeeper@sksstkampala.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-primary-gold/25 focus:border-primary-gold text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary-gold transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-white/80 block">
                    Password
                  </label>
                  <span className="text-[10px] text-primary-gold/80">
                    Contact Admin if forgotten
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-gold/70" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your store clerk password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-black/40 border border-primary-gold/25 focus:border-primary-gold text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary-gold transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-gold via-[#e5c158] to-secondary-bronze text-dark-surface font-bold text-xs tracking-wider uppercase shadow-lg shadow-primary-gold/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-dark-surface" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Shopkeeper Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credential Helper */}
            <div className="pt-4 border-t border-primary-gold/15">
              <button
                type="button"
                onClick={handleDemoFill}
                className="w-full py-2.5 px-3 rounded-xl border border-primary-gold/20 bg-primary-gold/5 hover:bg-primary-gold/10 text-[11px] text-primary-gold font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-gold" />
                <span>Fill Default Credentials (shopkeeper@sksstkampala.org)</span>
              </button>
            </div>
          </div>

          {/* Admin link reminder */}
          <div className="mt-6 text-center text-xs text-white/50">
            Are you a Super Admin?{" "}
            <Link
              href="/dashboard/login"
              className="text-primary-gold hover:underline font-semibold"
            >
              Go to Admin Panel
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-white/40 border-t border-primary-gold/10 relative z-10">
        © {new Date().getFullYear()} Shri Swaminarayan Mandir (SKSS Temple Kampala). All Rights Reserved.
      </footer>
    </div>
  );
}
