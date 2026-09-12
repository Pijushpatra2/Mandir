"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { 
  Heart, ShieldCheck, FileText, Users, Calendar, Sparkles, Building, 
  Coins, User, Smartphone, CreditCard, Landmark, Wallet, Check, 
  Lock, ArrowRight, HelpCircle, Flame, HeartHandshake, FileCheck, CheckCircle2,
  ChevronRight
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const FAQ_LIST = [
  {
    question: "Is my donation tax deductible?",
    answer: "Yes, all donations made to Shree Swaminarayan Temple Kampala are tax-deductible under regional tax codes. An official donation receipt will be emailed immediately."
  },
  {
    question: "How will I receive the donation receipt?",
    answer: "Once payment is verified, a high-resolution digital receipt is generated on screen and sent to your registered email address. You can also view it in your dashboard."
  },
  {
    question: "Can I donate anonymously?",
    answer: "Absolutely. Simply check the 'Donate Anonymously' box in the form. Your contribution will be processed, but your name will be hidden from the public lists."
  },
  {
    question: "Which payment methods are accepted?",
    answer: "We support Mobile Money UPI, Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking from leading banks, and digital wallets."
  },
  {
    question: "Is my payment information secure?",
    answer: "All transactions are encrypted using bank-level 256-bit SSL encryption. We do not store any card data or bank credentials on our servers."
  }
];

export default function DonationsPage() {
  const { donations, setDonations } = useApp();
  
  // Form States
  const [donationType, setDonationType] = useState<"maintenance" | "annadanam" | "festival" | "gau" | "general">("maintenance");
  const [amount, setAmount] = useState<number>(1101);
  const [customAmountText, setCustomAmountText] = useState("");
  const [showCustomAmountInput, setShowCustomAmountInput] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorAddress, setDonorAddress] = useState("");
  
  // Preferences
  const [receiveReceipt, setReceiveReceipt] = useState(true);
  const [displayMyName, setDisplayMyName] = useState(true);
  const [donateAnonymously, setDonateAnonymously] = useState(false);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "banking" | "wallet">("upi");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  // Seva simulator state
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [liveDonorsCount, setLiveDonorsCount] = useState(24578450);

  // Live count simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveDonorsCount(prev => prev + Math.floor(Math.random() * 500) + 150);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setShowCustomAmountInput(false);
  };

  const handleSelectCustom = () => {
    setShowCustomAmountInput(true);
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmountText(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    }
  };

  // Maps form select keys to Campaign Titles in data structure
  const getCampaignTitle = () => {
    switch (donationType) {
      case "maintenance": return "General Temple Seva";
      case "annadanam": return "Nitya Annadan Seva";
      case "festival": return "Sri Krishna Janmashtami Spl Seva";
      case "gau": return "Gau Seva & Cow Care Seva";
      default: return "General Temple Seva";
    }
  };

  const getCampaignId = () => {
    switch (donationType) {
      case "maintenance": return "camp-1";
      case "annadanam": return "camp-2";
      case "festival": return "camp-4";
      case "gau": return "camp-2";
      default: return "camp-1";
    }
  };

  // Submit Donation Handler
  const handleOpenPaymentSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorEmail) {
      alert("Please fill in your Name and Email address.");
      return;
    }

    const receiptNum = "REC-2026-" + Math.floor(1000 + Math.random() * 9000);
    const finalName = donateAnonymously ? "Anonymous" : donorName;

    const newDonation = {
      id: "tx-new-" + Math.random().toString(36).substr(2, 9),
      donorName: finalName,
      donorEmail,
      amount: Number(amount),
      campaignId: getCampaignId(),
      campaignTitle: getCampaignTitle(),
      paymentMethod: "UPI" as const,
      date: new Date().toISOString(),
      receiptNumber: receiptNum,
      status: "PAID" as const
    };

    setDonations((prev) => [newDonation, ...prev]);
    setSuccessReceipt(newDonation);
    
    // Smooth scroll to success card
    setTimeout(() => {
      window.scrollTo({ top: 400, behavior: "smooth" });
    }, 100);
  };

  // Auto Scroll & Autofill from Impact Cards
  const handleSelectImpactCard = (type: any, val: number) => {
    setDonationType(type);
    setAmount(val);
    setShowCustomAmountInput(false);
    window.scrollTo({ top: 450, behavior: "smooth" });
  };

  return (
    <div className="bg-[#FAF7F2] font-poppins overflow-hidden pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[75vh] lg:min-h-[70vh] flex flex-col justify-center pt-32 pb-12 overflow-hidden border-b border-[#B47F35]/15">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 -z-20 w-full h-full bg-[#FAF7F2]">
          <div className="absolute right-0 top-0 w-full lg:w-[60%] h-full">
            <img 
              src="/temple_hero_bg.png" 
              className="w-full h-full object-cover object-[70%_center] lg:object-[68%_center]" 
              alt="Swaminarayan Temple Background" 
            />
            {/* Blends */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/90 lg:via-[#FAF7F2]/65 to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/90 to-transparent lg:hidden" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT SIDE: TEXT DETAILS */}
            <div className="lg:col-span-6 space-y-6 text-left font-poppins">
              
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 text-[#B47F35] text-xs sm:text-sm font-bold uppercase tracking-widest font-poppins">
                <span>DONATE WITH FAITH</span>
                <span>⚜️</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-[#2B132C] leading-tight">
                Your Donation,<br />
                Their <span className="text-[#B47F35] font-normal italic pr-2">Blessing</span>
              </h1>

              {/* Lotus Divider */}
              <div className="flex items-center space-x-2">
                <div className="h-[1.5px] bg-[#B47F35]/30 w-12" />
                <span className="text-[#B47F35] text-xs">⚜️</span>
                <div className="h-[1.5px] bg-[#B47F35]/30 w-12" />
              </div>

              {/* Description */}
              <p className="text-secondary-bronze leading-relaxed font-normal text-base sm:text-lg lg:text-xl max-w-xl font-poppins">
                Your contribution helps us maintain the temple, support daily rituals, fund annadanam, celebrate festivals and preserve our ancient traditions.
              </p>

              {/* Trust labels row */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-[#B47F35]/15 max-w-xl text-[#2B132C] font-poppins">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#B47F35]" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider font-poppins">100% Secure</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-[#B47F35]" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider font-poppins">Instant Tax Receipt</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Users className="w-5 h-5 text-[#B47F35]" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider font-poppins">Trusted by 50K+</span>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: FLOATING ACTIVITY CARDS */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row gap-6 justify-end items-stretch font-poppins">
              
              {/* Live activity feed card */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-2xl w-full max-w-[300px] flex flex-col justify-between text-left space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs sm:text-sm font-bold uppercase text-[#2B132C] tracking-wider flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-[#B47F35]" />
                    <span>Donation Activity</span>
                  </h4>
                  <span className="text-xs sm:text-sm font-bold bg-error-red text-white px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse font-poppins">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    <span>LIVE</span>
                  </span>
                </div>
                
                {/* Scroll stack list */}
                <div className="space-y-3.5">
                  <div className="text-xs sm:text-sm flex justify-between items-center font-poppins">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-[#B47F35]" />
                      <span className="font-bold text-dark-surface">Rajesh Sharma</span>
                    </div>
                    <span className="text-secondary-bronze/80 font-medium">UGX 1,101</span>
                  </div>
                  <div className="h-[1px] bg-[#B47F35]/15" />
                  <div className="text-xs sm:text-sm flex justify-between items-center font-poppins">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-[#B47F35]" />
                      <span className="font-bold text-dark-surface">Priya Patel</span>
                    </div>
                    <span className="text-secondary-bronze/80 font-medium">UGX 501</span>
                  </div>
                  <div className="h-[1px] bg-[#B47F35]/15" />
                  <div className="text-xs sm:text-sm flex justify-between items-center font-poppins">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-[#B47F35]" />
                      <span className="font-bold text-dark-surface">Anonymous</span>
                    </div>
                    <span className="text-secondary-bronze/80 font-medium">UGX 5,101</span>
                  </div>
                </div>
              </div>

              {/* Total funds card */}
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-2xl w-full max-w-[300px] flex flex-col justify-between text-left space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold uppercase text-[#2B132C]/70 tracking-wider font-poppins">
                    Total Donations
                  </h4>
                  <p className="text-2xl sm:text-3xl font-heading font-bold text-[#2B132C]">
                    UGX {liveDonorsCount.toLocaleString("en-IN")}
                  </p>
                </div>
                
                <div className="border-t border-[#B47F35]/15 pt-3">
                  <p className="text-xs sm:text-sm text-[#2B132C]/60 uppercase tracking-wider font-bold font-poppins">This Month</p>
                  <p className="text-xs sm:text-sm font-bold text-[#B47F35] flex items-center mt-1 font-poppins">
                    <span>▲ 19.8% from last month</span>
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. SUCCESS RECEIPT OVERLAY PANEL */}
      <AnimatePresence>
        {successReceipt && (
          <div className="max-w-3xl mx-auto px-4 mt-12 font-poppins">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-[#B47F35] rounded-[32px] p-8 sm:p-10 shadow-2xl text-left relative"
            >
              {/* Close badge */}
              <button 
                onClick={() => setSuccessReceipt(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#B47F35]/25 flex items-center justify-center text-[#B47F35] cursor-pointer hover:bg-bg-warm/40"
              >
                ✕
              </button>

              <div className="flex flex-col items-center text-center space-y-3 mb-6 font-poppins">
                <CheckCircle2 className="w-14 h-14 text-[#B47F35]" />
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#2B132C]">Donation Receipt Confirmation</h3>
                <p className="text-sm sm:text-base text-secondary-bronze leading-relaxed font-normal font-poppins">
                  Thank you for your selfless contribution. Your receipt details are processed below.
                </p>
              </div>

              {/* Receipt Canvas details */}
              <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-6 space-y-3 font-poppins">
                <div className="flex justify-between text-sm sm:text-base text-secondary-bronze/80">
                  <span>Receipt Number:</span>
                  <span className="font-bold text-[#2B132C] font-mono">{successReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-secondary-bronze/80">
                  <span>Donor Name:</span>
                  <span className="font-bold text-[#2B132C]">{successReceipt.donorName}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-secondary-bronze/80">
                  <span>Donation Fund:</span>
                  <span className="font-bold text-[#2B132C]">{successReceipt.campaignTitle}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-secondary-bronze/80">
                  <span>Payment Gateway:</span>
                  <span className="font-bold text-[#2B132C]">{successReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-secondary-bronze/80">
                  <span>Transaction Date:</span>
                  <span className="font-bold text-[#2B132C]">{new Date(successReceipt.date).toLocaleDateString()}</span>
                </div>
                <div className="h-[1px] bg-[#B47F35]/15 my-2.5" />
                <div className="flex justify-between text-base sm:text-lg font-bold text-[#2B132C]">
                  <span>Total Amount Paid:</span>
                  <span className="text-[#B47F35] font-heading font-bold text-xl">${successReceipt.amount}</span>
                </div>
              </div>

              {/* print button mock */}
              <div className="mt-6 flex justify-end font-poppins">
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-3 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                  Print Official Receipt (80G tax deductions)
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. CORE DONATION FORM & PAYMENT DETAILS PANELS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-poppins">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: DONATION FORM PANEL */}
          <div className="lg:col-span-7">
            <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-6 lg:p-8 space-y-6 text-left h-full font-poppins">
              
              <div className="flex items-center space-x-3 text-[#2B132C]">
                <Building className="w-6 h-6 text-[#B47F35]" />
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold">Donation Form</h3>
                  <p className="text-xs sm:text-sm text-secondary-bronze/80 mt-0.5 font-poppins">
                    Fill in the details below to make a donation
                  </p>
                </div>
              </div>

              {/* Form elements */}
              <form onSubmit={handleOpenPaymentSimulate} className="space-y-6 font-poppins">
                
                {/* 1. Donation Type selection */}
                <div className="space-y-2.5">
                  <label className="text-xs sm:text-sm font-bold text-[#B47F35] uppercase tracking-wider block font-poppins">
                    1. Donation Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { id: "maintenance", title: "Temple Maintenance", icon: Building },
                      { id: "annadanam", title: "Annadanam", icon: HeartHandshake },
                      { id: "festival", title: "Festival Fund", icon: Sparkles },
                      { id: "gau", title: "Gau Seva", icon: Coins },
                      { id: "general", title: "General Donation", icon: Heart }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDonationType(item.id as any)}
                          className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all font-poppins ${
                            donationType === item.id 
                              ? "border-[#B47F35] bg-[#B47F35]/10 text-[#B47F35] font-bold" 
                              : "border-primary-gold/15 bg-[#FAF7F2]/40 text-secondary-bronze/80 hover:bg-bg-warm/30"
                          }`}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span className="text-xs sm:text-sm leading-snug block font-poppins font-medium">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Select Amount */}
                <div className="space-y-3 font-poppins">
                  <label className="text-xs sm:text-sm font-bold text-[#B47F35] uppercase tracking-wider block font-poppins">
                    2. Select Amount
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {[501, 1101, 2101, 5101, 11001].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectAmount(val)}
                        className={`py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer font-poppins ${
                          amount === val && !showCustomAmountInput
                            ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                            : "border-primary-gold/15 bg-white text-secondary-bronze"
                        }`}
                      >
                        UGX {val.toLocaleString()}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleSelectCustom}
                      className={`py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center cursor-pointer font-poppins ${
                        showCustomAmountInput
                          ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                          : "border-primary-gold/15 bg-white text-secondary-bronze"
                      }`}
                    >
                      Custom Amount
                    </button>
                  </div>

                  {/* Custom input or summary */}
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-secondary-bronze font-poppins">
                      UGX
                    </span>
                    <input
                      type="number"
                      value={showCustomAmountInput ? customAmountText : amount}
                      onChange={showCustomAmountInput ? handleCustomTextChange : undefined}
                      disabled={!showCustomAmountInput}
                      placeholder="Enter amount"
                      className="w-full pl-12 pr-4 py-3 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-xl text-sm sm:text-base font-bold text-dark-surface focus:outline-none focus:border-[#B47F35] disabled:opacity-75 font-poppins"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-[#B47F35]/80 italic font-poppins">* You can enter any amount above UGX 100</p>
                </div>

                {/* 3. Personal Information */}
                <div className="space-y-4 pt-2 border-t border-[#B47F35]/10 font-poppins">
                  <label className="text-xs sm:text-sm font-bold text-[#B47F35] uppercase tracking-wider block font-poppins">
                    3. Personal Information
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs sm:text-sm font-semibold uppercase text-[#2B132C]/75 block mb-1.5 font-poppins">Full Name *</span>
                      <input
                        type="text"
                        required
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-xl text-sm sm:text-base text-dark-surface focus:outline-none focus:border-[#B47F35] font-poppins"
                      />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold uppercase text-[#2B132C]/75 block mb-1.5 font-poppins">Mobile Number *</span>
                      <input
                        type="tel"
                        required
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="Enter mobile number"
                        className="w-full px-4 py-3 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-xl text-sm sm:text-base text-dark-surface focus:outline-none focus:border-[#B47F35] font-poppins"
                      />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold uppercase text-[#2B132C]/75 block mb-1.5 font-poppins">Email Address *</span>
                      <input
                        type="email"
                        required
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-xl text-sm sm:text-base text-dark-surface focus:outline-none focus:border-[#B47F35] font-poppins"
                      />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-semibold uppercase text-[#2B132C]/75 block mb-1.5 font-poppins">Address (Optional)</span>
                      <input
                        type="text"
                        value={donorAddress}
                        onChange={(e) => setDonorAddress(e.target.value)}
                        placeholder="Enter your address"
                        className="w-full px-4 py-3 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-xl text-sm sm:text-base text-dark-surface focus:outline-none focus:border-[#B47F35] font-poppins"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Donation Preferences */}
                <div className="space-y-3 pt-2 border-t border-[#B47F35]/10 font-poppins">
                  <label className="text-xs sm:text-sm font-bold text-[#B47F35] uppercase tracking-wider block font-poppins">
                    4. Donation Preferences
                  </label>
                  
                  <div className="flex flex-wrap gap-6 items-center text-sm font-poppins">
                    <label className="flex items-center space-x-2 text-xs sm:text-sm font-semibold uppercase text-[#2B132C] cursor-pointer font-poppins">
                      <input 
                        type="checkbox"
                        checked={receiveReceipt}
                        onChange={(e) => setReceiveReceipt(e.target.checked)}
                        className="w-4 h-4 accent-[#B47F35]"
                      />
                      <span>Receive Tax Receipt</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs sm:text-sm font-semibold uppercase text-[#2B132C] cursor-pointer font-poppins">
                      <input 
                        type="checkbox"
                        checked={displayMyName}
                        onChange={(e) => setDisplayMyName(e.target.checked)}
                        className="w-4 h-4 accent-[#B47F35]"
                      />
                      <span>Display My Name</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs sm:text-sm font-semibold uppercase text-[#2B132C] cursor-pointer font-poppins">
                      <input 
                        type="checkbox"
                        checked={donateAnonymously}
                        onChange={(e) => setDonateAnonymously(e.target.checked)}
                        className="w-4 h-4 accent-[#B47F35]"
                      />
                      <span>Donate Anonymously</span>
                    </label>
                  </div>
                </div>

              </form>

            </GlassCard>
          </div>

          {/* RIGHT: PAYMENT PANEL */}
          <div className="lg:col-span-5">
            <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-6 lg:p-8 space-y-6 text-left h-full flex flex-col justify-between font-poppins">
              
              <div className="space-y-6 font-poppins">
                <div className="flex items-center space-x-3 text-[#2B132C]">
                  <Lock className="w-6 h-6 text-[#B47F35]" />
                  <div>
                    <h3 className="font-heading text-xl sm:text-2xl font-bold">Payment Details</h3>
                    <p className="text-xs sm:text-sm text-secondary-bronze/80 mt-0.5">
                      Choose a payment method and complete your donation
                    </p>
                  </div>
                </div>

                {/* 1. Choose Payment Method */}
                <div className="space-y-3 font-poppins">
                  <label className="text-xs sm:text-sm font-bold text-[#B47F35] uppercase tracking-wider block font-poppins">
                    1. Choose Payment Method
                  </label>
                  
                  <div className="space-y-2.5">
                    {/* UPI */}
                    <label className="flex items-center justify-between p-4 bg-[#FAF7F2]/50 rounded-xl border border-primary-gold/15 cursor-pointer hover:bg-bg-warm/30 transition-colors">
                      <div className="flex items-center space-x-3 text-sm sm:text-base text-dark-surface font-semibold font-poppins">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "upi"}
                          onChange={() => setPaymentMethod("upi")}
                          className="w-4 h-4 accent-[#B47F35]"
                        />
                        <span>UPI Mobile Money</span>
                      </div>
                      <Smartphone className="w-5 h-5 text-[#B47F35]/75" />
                    </label>

                    {/* Card */}
                    <label className="flex items-center justify-between p-4 bg-[#FAF7F2]/50 rounded-xl border border-primary-gold/15 cursor-pointer hover:bg-bg-warm/30 transition-colors">
                      <div className="flex items-center space-x-3 text-sm sm:text-base text-dark-surface font-semibold font-poppins">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="w-4 h-4 accent-[#B47F35]"
                        />
                        <span>Credit / Debit Card</span>
                      </div>
                      <CreditCard className="w-5 h-5 text-[#B47F35]/75" />
                    </label>

                    {/* Net Banking */}
                    <label className="flex items-center justify-between p-4 bg-[#FAF7F2]/50 rounded-xl border border-primary-gold/15 cursor-pointer hover:bg-bg-warm/30 transition-colors">
                      <div className="flex items-center space-x-3 text-sm sm:text-base text-dark-surface font-semibold font-poppins">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "banking"}
                          onChange={() => setPaymentMethod("banking")}
                          className="w-4 h-4 accent-[#B47F35]"
                        />
                        <span>Net Banking</span>
                      </div>
                      <Landmark className="w-5 h-5 text-[#B47F35]/75" />
                    </label>
                  </div>
                </div>

                {/* 2. Interactive pay boxes */}
                <div className="space-y-3 pt-2 border-t border-[#B47F35]/10 font-poppins">
                  <label className="text-xs sm:text-sm font-bold text-[#B47F35] uppercase tracking-wider block font-poppins">
                    2. Pay Securely
                  </label>

                  {paymentMethod === "upi" && (
                    <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-4 flex items-center justify-between gap-4 font-poppins select-none">
                      {/* Mini vector QR */}
                      <div className="bg-white p-2 rounded-xl border border-[#B47F35]/15">
                        <svg className="w-16 h-16 text-[#2B132C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 3h4v4H3zm14 0h4v4h-4zm0 14h4v4h-4zM3 17h4v4H3zM10 3h4v4h-4zm0 14h4v4h-4zM3 10h4v4H3zm14 0h4v4h-4zm-7 0h4v4h-4z" />
                        </svg>
                      </div>
                      <div className="text-left space-y-1 font-poppins">
                        <span className="text-xs sm:text-sm font-bold uppercase text-[#2B132C]/70 block font-poppins">UPI Mobile Pay ID</span>
                        <p className="text-sm sm:text-base font-bold text-[#B47F35]">donate@mondir</p>
                        <p className="text-xs sm:text-sm text-[#2B132C]/60 font-poppins">Scan QR Code or pay using ID</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-4 space-y-3 font-poppins">
                      <div>
                        <span className="text-xs sm:text-sm font-semibold uppercase text-[#2B132C]/70 block mb-1 font-poppins">Card Number</span>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          className="w-full px-3.5 py-2 bg-white border border-[#B47F35]/15 rounded-lg text-sm sm:text-base font-poppins"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs sm:text-sm font-semibold uppercase text-[#2B132C]/70 block mb-1 font-poppins">Expiry Date</span>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-3.5 py-2 bg-white border border-[#B47F35]/15 rounded-lg text-sm sm:text-base font-poppins"
                          />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold uppercase text-[#2B132C]/70 block mb-1 font-poppins">CVV Code</span>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="***"
                            className="w-full px-3.5 py-2 bg-white border border-[#B47F35]/15 rounded-lg text-sm sm:text-base font-poppins"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "banking" && (
                    <div className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-4 font-poppins text-sm font-semibold text-secondary-bronze/85">
                      <span className="text-xs sm:text-sm font-semibold uppercase text-[#2B132C]/70 block mb-1.5 font-poppins">Choose Bank</span>
                      <select className="w-full p-2.5 bg-white border border-[#B47F35]/15 rounded-lg text-sm sm:text-base outline-none font-poppins">
                        <option>Stanbic Bank Uganda</option>
                        <option>Centenary Bank Kampala</option>
                        <option>Standard Chartered Kampala</option>
                        <option>ABSA Bank Uganda</option>
                      </select>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="flex justify-between items-center text-sm sm:text-base font-bold pt-3 text-[#2B132C] font-poppins">
                    <span>Amount Payable:</span>
                    <span className="text-[#B47F35] font-heading text-lg sm:text-xl font-bold">UGX {amount.toLocaleString("en-IN")}</span>
                  </div>

                </div>
              </div>

              {/* Pay CTA */}
              <div className="space-y-4 font-poppins">
                <button
                  type="submit"
                  onClick={handleOpenPaymentSimulate}
                  className="w-full py-4 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-sm sm:text-base font-semibold shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer font-poppins"
                >
                  <Lock className="w-5 h-5" />
                  <span>Pay UGX {amount.toLocaleString("en-IN")} Securely</span>
                </button>
                <p className="text-xs sm:text-sm text-[#2B132C]/70 text-center uppercase tracking-wider font-semibold block w-full font-poppins">
                  You will be redirected to complete the payment
                </p>

                {/* Security badges list */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs sm:text-sm font-semibold text-secondary-bronze/75 uppercase tracking-wider select-none border-t border-[#B47F35]/15 pt-4 mt-2 font-poppins">
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-5 h-5 text-[#B47F35] mb-1" />
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <FileCheck className="w-5 h-5 text-[#B47F35] mb-1" />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Lock className="w-5 h-5 text-[#B47F35] mb-1" />
                    <span>256-bit Enc</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-5 h-5 text-[#B47F35] mb-1" />
                    <span>Secure Pay</span>
                  </div>
                </div>
              </div>

            </GlassCard>
          </div>

        </div>
      </section>

      {/* 4. "YOUR DONATION CREATES IMPACT" */}
      <section className="py-16 bg-[#FAF7F2] border-t border-[#B47F35]/10 font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-[#2B132C]">
              Your Donation Creates Impact
            </h3>
            <div className="flex items-center justify-center space-x-1.5 py-0.5">
              <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
              <span className="text-[#B47F35] text-xs">✦</span>
              <div className="h-[1.5px] bg-[#B47F35]/30 w-8" />
            </div>
          </div>

          {/* 5 Impact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto font-poppins">
            {[
              { type: "general", title: "Daily Pujas", desc: "Support daily pujas and rituals for divine blessings.", rateText: "UGX 501 / Day", rate: 501, img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=180&h=130&q=80" },
              { type: "annadanam", title: "Annadanam", desc: "Provide meals to devotees and those in need.", rateText: "UGX 1,101 / Meal Service", rate: 1101, img: "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=180&h=130&q=80" },
              { type: "festival", title: "Festival Celebrations", desc: "Support grand celebrations and cultural traditions.", rateText: "UGX 2,101 / Festival", rate: 2101, img: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=180&h=130&q=80" },
              { type: "gau", title: "Gau Seva", desc: "Care and protection of cows.", rateText: "UGX 1,101 / Month", rate: 1101, img: "https://images.unsplash.com/photo-1583373834249-137a86892a50?auto=format&fit=crop&w=180&h=130&q=80" },
              { type: "maintenance", title: "Temple Maintenance", desc: "Preserve and maintain our sacred temple.", rateText: "UGX 5,101 / Support", rate: 5101, img: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=180&h=130&q=80" }
            ].map((item, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelectImpactCard(item.type, item.rate)}
                className="bg-white border border-[#B47F35]/15 rounded-2xl overflow-hidden flex flex-col justify-between text-left cursor-pointer group shadow-sm hover:shadow-md hover:border-[#B47F35] transition-all font-poppins"
              >
                <div className="relative h-32 w-full shrink-0">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500 select-none" />
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-secondary-bronze/85 leading-snug font-poppins font-normal line-clamp-2">{item.desc}</p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#B47F35] block border-t border-[#B47F35]/10 pt-2.5 font-poppins">
                    {item.rateText}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. RECENT DONORS & FAQS COLLATERAL PANEL */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-poppins">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch max-w-6xl mx-auto">
          
          {/* LEFT: RECENT DONORS LIST */}
          <div className="lg:col-span-5">
            <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between h-full space-y-4 font-poppins">
              
              <div className="space-y-4">
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#2B132C] tracking-wide text-left">
                  Recent Donors
                </h3>
                
                <div className="space-y-3.5">
                  {donations.slice(0, 5).map((donor, idx) => (
                    <div key={donor.id || idx} className="flex justify-between items-center text-sm sm:text-base font-poppins">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 border border-[#B47F35]/15">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm sm:text-base font-bold text-[#2B132C]">{donor.donorName}</h4>
                          <span className="text-xs sm:text-sm text-secondary-bronze/70 uppercase tracking-wider font-medium font-poppins">
                            {new Date(donor.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-bold text-[#B47F35] text-sm sm:text-base">UGX {donor.amount.toLocaleString("en-IN")}</span>
                        <p className="text-xs sm:text-sm text-secondary-bronze/70 font-poppins mt-0.5 leading-none">Paid</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* View all trigger */}
              <div className="pt-4 border-t border-[#B47F35]/10 mt-auto">
                <Link
                  href="/membership"
                  className="w-full py-3 rounded-xl bg-[#FAF7F2] border border-[#B47F35]/25 text-secondary-bronze hover:text-[#B47F35] text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer font-poppins"
                >
                  <span>View All Donors</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </GlassCard>
          </div>

          {/* RIGHT: FAQS & BRASS DIYA BANNER */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-6 font-poppins">
            
            {/* Accordions */}
            <div className="w-full sm:w-2/3 space-y-3 text-left">
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#2B132C] tracking-wide mb-4">
                Frequently Asked Questions
              </h3>

              {FAQ_LIST.map((faq, idx) => (
                <div key={idx} className="border border-primary-gold/15 rounded-xl bg-white overflow-hidden shadow-sm font-poppins">
                  <button
                    onClick={() => setActiveFaqIndex(activeFaqIndex === idx ? null : idx)}
                    className="w-full px-5 py-4 flex justify-between items-center text-sm sm:text-base font-bold text-[#2B132C] hover:bg-bg-warm/30 transition-colors text-left cursor-pointer font-poppins"
                  >
                    <span>{faq.question}</span>
                    <span className="text-[#B47F35] text-base font-poppins font-bold">
                      {activeFaqIndex === idx ? "−" : "+"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {activeFaqIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 pt-1 border-t border-[#B47F35]/10 text-xs sm:text-sm text-secondary-bronze leading-relaxed font-poppins font-normal"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Brass Diya vertical picture banner */}
            <div className="w-full sm:w-1/3 relative rounded-3xl overflow-hidden border border-[#B47F35]/15 shadow-md flex flex-col justify-end bg-gradient-to-b from-[#2B132C] to-black min-h-[250px] p-5 text-white font-poppins">
              <img 
                src="/donation_diya.png" 
                className="absolute inset-0 w-full h-full object-cover opacity-65 select-none" 
                alt="Donation oil Diya" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />
              
              <div className="relative z-10 text-left space-y-2">
                <span className="text-xl text-primary-gold leading-none">“</span>
                <p className="text-xs sm:text-sm font-poppins font-bold leading-normal italic text-white/90">
                  Every act of charity is a step towards divine blessings.
                </p>
                <div className="w-8 h-[1px] bg-primary-gold/40" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CALL-TO-ACTION FOOTER BANNER */}
      <section className="py-12 bg-white font-poppins">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#4E3629] rounded-[32px] p-8 lg:p-12 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 text-left shadow-lg border border-[#B47F35]/25">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#B47F35]/10 filter blur-3xl pointer-events-none" />
            
            <div className="space-y-3 z-10 max-w-xl">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold">
                Be a Part of Something Divine
              </h3>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed font-poppins font-normal">
                Your small contribution can make a big difference. Join thousands of devotees in this noble cause.
              </p>
            </div>

            <div className="z-10 shrink-0">
              <button
                onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
                className="px-8 py-4 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white font-semibold shadow-md transition-colors text-sm sm:text-base inline-flex items-center space-x-2 cursor-pointer font-poppins"
              >
                <span>Donate Now</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
