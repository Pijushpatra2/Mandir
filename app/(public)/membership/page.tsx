"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, ShieldCheck, Mail, Phone, Lock, Eye, EyeOff, AlertTriangle, KeyRound, ArrowLeft, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MembershipPage() {
  const router = useRouter();
  const { registerDevotee, sendDevoteeOtp, showToast } = useApp();
  
  // Step 1 Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kampala");
  
  // Step 2 OTP fields & states
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes countdown
  const [isOtpTimerActive, setIsOtpTimerActive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const benefits = [
    { title: "Digital Gate Pass Card", desc: "Access the temple facilities with a scannable QR card stored in your profile." },
    { title: "Pooja Booking History", desc: "Book and keep track of your family's pooja schedules and service history." },
    { title: "Donation Tracking", desc: "Track and download receipt logs for all your virtual and physical temple donations." },
    { title: "Community Updates", desc: "Receive updates about upcoming festivals, special darshan slots, and volunteer programs." }
  ];

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpTimerActive && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsOtpTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isOtpTimerActive, otpTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Step 1: Send OTP handler
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setErrorMsg("Please fill in all required fields.");
      showToast("Please fill in all fields", "error");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please ensure both password fields are identical.");
      showToast("Passwords do not match", "error");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await sendDevoteeOtp({ email, phone, first_name: firstName });
      setOtpCode(""); // Keep input empty so devotee types the received OTP
      setStep("otp");
      setOtpTimer(res.data?.expiresInSeconds || 600);
      setIsOtpTimerActive(true);
      showToast("Verification code dispatched to your email!", "success");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send verification code. Please check your details.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await sendDevoteeOtp({ email, phone, first_name: firstName });
      setOtpCode(""); // Reset input on resend
      setOtpTimer(res.data?.expiresInSeconds || 600);
      setIsOtpTimerActive(true);
      showToast("New verification code sent to your email!", "info");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to resend code.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Final Verify & Register submit
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMsg("Please enter the 6-digit verification code.");
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
        otp_code: otpCode,
        membership_type: "Annual",
        address,
        city,
        country: "Uganda",
      });
      showToast("Profile created successfully! Welcome to SKSS Kampala.", "success");
      router.push("/user-dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Verification failed. Please check the OTP code and try again.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-24 bg-bg-warm min-h-screen font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Portal Access"
          title="Create Devotee Profile"
          subtitle="Join our community portal to book services, view your digital gate pass, and track your donations."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mt-12">
          {/* Left Column: Benefits (Takes 5 columns on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-heading text-2xl sm:text-3xl font-medium text-dark-surface">
              Devotee Benefits & Access
            </h3>
            <p className="text-base sm:text-lg text-secondary-bronze/80 leading-relaxed font-normal font-poppins">
              By creating a free profile, you gain access to the temple's online services, secure donations, and booking history.
            </p>
            
            <div className="space-y-6 pt-4">
              {benefits.map((benefit, idx) => (
                <div className="flex items-start space-x-4" key={idx}>
                  <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg sm:text-xl font-medium text-dark-surface">
                      {benefit.title}
                    </h4>
                    <p className="text-sm sm:text-base text-secondary-bronze/85 font-poppins leading-relaxed mt-1">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* OTP Security Notice */}
            <div className="p-5 rounded-2xl bg-white border border-primary-gold/20 flex items-start gap-3 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-primary-gold shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-dark-surface text-sm sm:text-base">Secure OTP Verification</h5>
                <p className="text-xs sm:text-sm text-secondary-bronze/75 font-normal leading-relaxed mt-0.5">
                  Your identity is verified with a one-time passcode to ensure maximum profile protection and authenticated temple gate passes.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form & OTP Step (Takes 7 columns on desktop) */}
          <div className="lg:col-span-7">
            <GlassCard className="p-6 sm:p-10 bg-surface-white/95 border border-primary-gold/15 shadow-xl rounded-3xl">
              
              {/* Progress Stepper */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-primary-gold/10 font-poppins">
                <div className="flex items-center space-x-2.5">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                    step === "form" ? "bg-primary-gold text-white" : "bg-success-green text-white"
                  }`}>
                    {step === "form" ? "1" : "✓"}
                  </span>
                  <span className={`text-sm sm:text-base font-semibold ${step === "form" ? "text-dark-surface" : "text-secondary-bronze/70"}`}>
                    Devotee Details
                  </span>
                </div>
                <span className="text-secondary-bronze/30">➔</span>
                <div className="flex items-center space-x-2.5">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                    step === "otp" ? "bg-primary-gold text-white" : "bg-primary-gold/15 text-primary-gold"
                  }`}>
                    2
                  </span>
                  <span className={`text-sm sm:text-base font-semibold ${step === "otp" ? "text-dark-surface" : "text-secondary-bronze/70"}`}>
                    OTP Verification
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-error-red/10 border border-error-red/25 flex items-start gap-2.5 text-error-red text-sm sm:text-base font-poppins">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: REGISTRATION DETAILS FORM */}
              {step === "form" && (
                <form onSubmit={handleRequestOtp} className="space-y-5 text-left font-poppins">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Harish"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Mehta"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="harish.mehta@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +256 700 123456"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Residential Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Plot 12, Kampala Road"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        City / Town
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Kampala"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Choose Password *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-secondary-bronze/45 pointer-events-none">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm sm:text-base font-poppins focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-bronze/45 hover:text-dark-surface cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-secondary-bronze mb-1.5 font-poppins">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-secondary-bronze/45 pointer-events-none">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                            confirmPassword && password !== confirmPassword
                              ? "border-error-red focus:border-error-red"
                              : "border-primary-gold/25 focus:border-primary-gold"
                          } bg-transparent text-sm sm:text-base font-poppins focus:outline-none placeholder:text-secondary-bronze/30 text-dark-surface`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-bronze/45 hover:text-dark-surface cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-error-red mt-1 font-poppins">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-sm sm:text-base tracking-wide cursor-pointer disabled:opacity-50 font-poppins flex items-center justify-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>{isLoading ? "Sending OTP..." : "Send Verification Code"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION VIEW */}
              {step === "otp" && (
                <form onSubmit={handleVerifyAndRegister} className="space-y-6 text-left font-poppins">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-primary-gold/15 text-primary-gold mx-auto flex items-center justify-center">
                      <Mail className="w-7 h-7" />
                    </div>
                    <h4 className="font-heading text-xl sm:text-2xl font-bold text-dark-surface">
                      Enter Verification OTP
                    </h4>
                    <p className="text-sm sm:text-base text-secondary-bronze/80 max-w-md mx-auto">
                      A 6-digit one-time code was sent to <strong className="text-dark-surface">{email}</strong> via official temple email.
                    </p>
                  </div>

                  {/* 6-Digit OTP Code Input */}
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-secondary-bronze text-center font-poppins">
                      6-Digit Security Code
                    </label>
                    <div className="flex justify-center">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="• • • • • •"
                        className="w-64 text-center tracking-[0.6em] text-2xl sm:text-3xl font-mono font-bold py-3.5 px-4 rounded-2xl border-2 border-primary-gold focus:ring-4 focus:ring-primary-gold/20 outline-none bg-white shadow-inner"
                      />
                    </div>
                    <p className="text-xs text-center text-secondary-bronze/60">
                      Code valid for: <span className="font-bold text-primary-gold">{formatTimer(otpTimer)}</span>
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || otpCode.length < 4}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all text-sm sm:text-base tracking-wide cursor-pointer disabled:opacity-50 font-poppins flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{isLoading ? "Verifying..." : "Verify & Complete Registration"}</span>
                    </button>

                    <div className="flex justify-between items-center pt-2 text-xs sm:text-sm">
                      <button
                        type="button"
                        onClick={() => { setStep("form"); setErrorMsg(""); }}
                        className="text-secondary-bronze hover:text-primary-gold flex items-center space-x-1 font-semibold cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Edit Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isLoading || (isOtpTimerActive && otpTimer > 540)}
                        className="text-primary-gold hover:text-secondary-bronze flex items-center space-x-1 font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        <span>Resend OTP</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-primary-gold/10 text-center">
                <p className="text-sm sm:text-base text-secondary-bronze/80 font-normal font-poppins">
                  Already have an account?{" "}
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
