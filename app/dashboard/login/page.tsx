"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, mapDbRoleToUserRole } from "@/lib/context";
import { setAdminTokens } from "@/lib/authStorage";
import { GlassCard } from "@/components/ui/GlassCard";
import { Lock, Mail, AlertTriangle, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setUserRole } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Guard: If admin token is already present, auto-redirect to dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_access_token");
      if (token) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: email.trim(),
        password,
      });

      const { accessToken, refreshToken, admin } = response.data.data;

      // 1. Set tokens in secure authStorage helpers
      setAdminTokens(accessToken, refreshToken);

      // 2. Save session details
      localStorage.setItem("admin_user", JSON.stringify(admin));

      // 3. Update global application role context
      setUserRole(mapDbRoleToUserRole(admin.role, admin.moduleScope));

      setSuccessMessage("Authentication successful! Welcome to SKSS Administrative Desk.");

      // Delay redirect slightly to show the beautiful success alert
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        err.message ??
        "Invalid credentials or connection issue.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0704]">
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-primary-gold/15 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-secondary-bronze/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Floating Sanskrit Shloka Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#D4AF37] to-[#8C6D3B] text-white text-3xl shadow-lg shadow-primary-gold/10 mb-4"
          >
            🕉️
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-2xl font-bold tracking-wide text-[#F3EFE0]"
          >
            SKSS Temple Kampala
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xs text-[#A89F91] tracking-wider uppercase mt-1 font-semibold"
          >
            Administrative Console
          </motion.p>
        </div>

        {/* Card Component */}
        <GlassCard variant="dark" hoverEffect={false} className="border border-white/5 bg-[#14100D]/90 p-8 shadow-2xl rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#D4AF37] tracking-wider uppercase mb-2">
                Administrative Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/45">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sksstemple.org"
                  disabled={isLoading}
                  className="w-full bg-[#1F1914] border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-sm text-[#F3EFE0] placeholder-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-[#D4AF37] tracking-wider uppercase">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/45">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-[#1F1914] border border-[#D4AF37]/20 rounded-xl py-3 pl-10 pr-4 text-sm text-[#F3EFE0] placeholder-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Error Alert Box */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start space-x-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs leading-relaxed"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Alert Box */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start space-x-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs leading-relaxed"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8C6D3B] hover:brightness-110 active:brightness-95 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-primary-gold/15 transition-all flex items-center justify-center space-x-2 group cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Footer */}
        <p className="text-center text-[10px] text-[#A89F91]/40 mt-8 font-sans font-light tracking-wide uppercase">
          Shree Kutch Satsang Swaminarayan Temple Kampala © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
