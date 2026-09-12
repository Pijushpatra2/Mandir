"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { layout, buttons, inputs } from "@/lib/design-system";
import {
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Send,
  Sparkles,
  Banknote,
  Truck,
  Lock,
  AlertCircle,
  Clock,
  Info,
  UserCheck,
  LogIn,
  UserPlus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ShippingAddress } from "@/data/orders";
import { useCreateShopOrder } from "@/lib/api/shop";

export default function CheckoutPage() {
  const router = useRouter();
  const createOrderMutation = useCreateShopOrder();
  const {
    cart,
    appliedCoupon,
    clearCart,
    currentMemberNumber,
    members,
    devoteeProfile,
    isDevoteeLoggedIn,
    showToast
  } = useApp();

  const activeMember = members.find((m) => m.membershipNumber === currentMemberNumber);
  const isAuthenticated = Boolean(isDevoteeLoggedIn || devoteeProfile);

  // Steps state: 'shipping' | 'payment' | 'processing' | 'success'
  const [step, setStep] = useState<"shipping" | "payment" | "processing" | "success">("shipping");

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Shipping form fields with Uganda/Kampala friendly defaults
  const [shippingForm, setShippingForm] = useState<ShippingAddress>({
    name: devoteeProfile
      ? `${devoteeProfile.first_name} ${devoteeProfile.last_name}`
      : activeMember
      ? `${activeMember.firstName} ${activeMember.lastName}`
      : "",
    line1: devoteeProfile?.address || "",
    city: devoteeProfile?.city || "Kampala",
    state: "Central Region",
    postalCode: devoteeProfile?.postal_code || "",
    phone: devoteeProfile?.phone || activeMember?.phone || "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment form fields - Only COD is active
  const [paymentMethod, setPaymentMethod] = useState<"COD">("COD");

  // Created Order reference
  const [createdOrderId, setCreatedOrderId] = useState("");

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (subtotal >= appliedCoupon.minSpend) {
      if (appliedCoupon.discountType === "PERCENT") {
        discount = Math.round((subtotal * appliedCoupon.value) / 100);
      } else {
        discount = appliedCoupon.value;
      }
    }
  }

  const tax = Math.round((subtotal - discount) * 0.05);
  const shipping = subtotal > 0 && subtotal - discount < 50000 ? 5000 : 0;
  const total = subtotal - discount + tax + shipping;

  // Validate Shipping fields
  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingForm.name.trim()) errors.name = "Full name is required.";
    if (!shippingForm.line1.trim()) errors.line1 = "Street address / Delivery location is required.";
    if (!shippingForm.city.trim()) errors.city = "City / Town is required.";
    if (!shippingForm.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (shippingForm.phone.replace(/[\s-]/g, "").length < 7) {
      errors.phone = "Please enter a valid contact phone number.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "shipping") {
      if (validateShipping()) {
        setFormErrors({});
        setStep("payment");
      }
    }
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      if (showToast) showToast("Please sign in or register to place your order.", "info");
      return;
    }

    setFormErrors({});
    setStep("processing");

    try {
      const orderPayload = {
        customerName: shippingForm.name,
        customerEmail: devoteeProfile?.email || activeMember?.email || `${shippingForm.phone.replace(/[^0-9]/g, "")}@devotee.temple`,
        customerPhone: shippingForm.phone,
        devoteeId: devoteeProfile?.id || activeMember?.id || undefined,
        shippingAddress: shippingForm,
        subtotal,
        discount,
        tax,
        shippingFee: shipping,
        total,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        couponCode: appliedCoupon?.code || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.name,
          productImage: item.image,
          price: Number(item.price),
          quantity: Number(item.quantity),
          total: Number(item.price * item.quantity),
        })),
      };

      const result = await createOrderMutation.mutateAsync(orderPayload);
      setCreatedOrderId(result.id);
      clearCart();
      setStep("success");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to place order. Please try again.";
      if (showToast) showToast(errorMsg, "error");
      else alert(errorMsg);
      setStep("payment");
    }
  };

  if (cart.length === 0 && step !== "success") {
    return (
      <div className="bg-bg-warm min-h-screen flex flex-col items-center justify-center p-6 text-center font-poppins">
        <div className="w-16 h-16 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-medium text-dark-surface mb-2">Your Shopping Cart is Empty</h1>
        <p className="text-secondary-bronze/80 mb-6 text-sm sm:text-base font-poppins max-w-md">
          Explore our temple store for authentic Vedic puja samagri, sacred deities, spiritual books, and prasadam.
        </p>
        <Link href="/shop" className={`${buttons.primary} text-sm sm:text-base font-semibold font-poppins`}>
          Browse Temple Shop
        </Link>
      </div>
    );
  }

  return (
    <div className={`bg-bg-warm min-h-screen ${layout.sectionPadding} font-poppins pb-24`}>
      <div className={layout.container}>
        {step !== "success" && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl text-dark-surface font-bold">
                Temple Shop Checkout
              </h1>
              <p className="text-xs sm:text-sm text-secondary-bronze/75 mt-1 font-normal">
                Complete your delivery details and place your order safely with Cash on Delivery (COD).
              </p>
            </div>

            {/* Auth status indicator */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 p-2.5 px-4 rounded-2xl bg-white border border-success-green/30 text-xs shadow-2xs">
                <UserCheck className="w-4 h-4 text-success-green shrink-0" />
                <span className="text-secondary-bronze">
                  Devotee: <strong className="text-dark-surface">{devoteeProfile?.first_name || activeMember?.firstName}</strong>
                </span>
                <span className="font-mono text-[10px] text-primary-gold bg-primary-gold/10 px-2 py-0.5 rounded-md font-bold">
                  {devoteeProfile?.membership_number || activeMember?.membershipNumber}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary-gold/15 text-primary-gold hover:bg-primary-gold hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Your Devotee Account</span>
              </button>
            )}
          </div>
        )}

        {/* Non-authenticated Alert Banner */}
        {!isAuthenticated && step !== "success" && (
          <div className="mb-6 p-4 rounded-2xl bg-warning-amber/10 border border-warning-amber/30 text-dark-surface flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-warning-amber shrink-0 mt-0.5" />
            <div className="flex-grow text-xs sm:text-sm">
              <p className="font-bold text-dark-surface">
                Devotee Sign In Required for Order Placement
              </p>
              <p className="text-secondary-bronze/80 text-xs mt-0.5">
                To confirm your Cash on Delivery order and receive tracking updates in your personal dashboard, please sign in or register before finalizing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary-gold text-white text-xs font-bold hover:brightness-105 transition-all shadow-xs cursor-pointer shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* 1. SUCCESS STEP SCREEN */}
        {step === "success" && (
          <div className="max-w-lg mx-auto text-center bg-white border border-primary-gold/20 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
            <div className="w-16 h-16 bg-success-green/15 text-success-green rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-success-green/10 text-success-green text-xs font-bold uppercase tracking-wider">
                Order Placed Successfully
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface mt-3">
                Thank You for Your Order!
              </h2>
              <p className="text-secondary-bronze/80 text-xs sm:text-sm mt-2 font-mono">
                Order ID: <span className="font-bold text-dark-surface bg-bg-warm px-2 py-0.5 rounded-md border border-primary-gold/20">{createdOrderId}</span>
              </p>
            </div>

            {/* Cash on Delivery Payment Notice Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-bg-warm/50 to-primary-gold/10 border border-primary-gold/25 text-left space-y-2">
              <div className="flex items-center gap-2 text-primary-gold font-bold text-xs uppercase tracking-wider">
                <Banknote className="w-4 h-4" />
                <span>Payment Mode: Cash on Delivery (COD)</span>
              </div>
              <p className="text-xs text-secondary-bronze/85 leading-relaxed">
                Please keep exactly <strong className="text-dark-surface font-bold">{formatCurrency(total)}</strong> in cash ready upon delivery at your designated shipping address in {shippingForm.city || "Kampala"}.
              </p>
            </div>

            <div className="bg-bg-warm/40 border border-primary-gold/10 rounded-2xl p-4 flex items-center justify-center space-x-2 text-xs sm:text-sm font-medium text-secondary-bronze">
              <Sparkles className="w-5 h-5 text-primary-gold shrink-0" />
              <span>All sacred items receive temple sanctum blessings before dispatch.</span>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/user-dashboard/orders" className={`${buttons.primary} text-sm font-semibold font-poppins flex items-center justify-center gap-2`}>
                <ShoppingBag className="w-4 h-4" />
                <span>View My Orders in Dashboard</span>
              </Link>
              <Link href="/shop" className={`${buttons.secondary} border-primary-gold/15 hover:bg-primary-gold/5 text-sm font-semibold font-poppins`}>
                Return to Temple Shop
              </Link>
            </div>
          </div>
        )}

        {/* 2. PROCESSING LOADING SCREEN */}
        {step === "processing" && (
          <div className="max-w-md mx-auto text-center bg-white border border-primary-gold/20 rounded-3xl p-12 shadow-lg space-y-6">
            <div className="w-16 h-16 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="font-heading text-2xl font-bold text-dark-surface">Placing Your Order...</h3>
              <p className="text-secondary-bronze/80 text-xs sm:text-sm mt-2 font-poppins">
                Registering your Cash on Delivery order with the temple dispatch desk. Please do not refresh.
              </p>
            </div>
          </div>
        )}

        {/* 3. CHECKOUT FORM STEPS */}
        {(step === "shipping" || step === "payment") && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Forms (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Steps Progress Header */}
              <div className="bg-white border border-primary-gold/15 rounded-2xl p-4 flex items-center justify-around text-xs sm:text-sm font-bold text-secondary-bronze">
                <span className={`flex items-center space-x-2 ${step === "shipping" ? "text-primary-gold" : "text-success-green"}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "shipping" ? "bg-primary-gold text-white" : "bg-success-green/15 text-success-green border border-success-green/30"}`}>
                    1
                  </span>
                  <span>1. Delivery Address</span>
                </span>
                <span className="text-secondary-bronze/35">➔</span>
                <span className={`flex items-center space-x-2 ${step === "payment" ? "text-primary-gold" : "text-secondary-bronze/50"}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === "payment" ? "bg-primary-gold text-white" : "bg-secondary-bronze/10 text-secondary-bronze/50"}`}>
                    2
                  </span>
                  <span>2. Payment Option</span>
                </span>
              </div>

              {/* Step 1: Shipping Address Form */}
              {step === "shipping" && (
                <form onSubmit={handleNextStep} className="bg-white border border-primary-gold/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-primary-gold/10">
                    <h3 className="font-heading text-lg sm:text-xl text-dark-surface font-bold">
                      Delivery & Contact Information
                    </h3>
                    <span className="text-xs text-secondary-bronze/70">
                      Step 1 of 2
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-secondary-bronze mb-1.5 font-poppins">
                        Full Recipient Name <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Patel"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        className={`${inputs.text} text-xs sm:text-sm font-poppins`}
                      />
                      {formErrors.name && <p className="text-xs text-error-red font-medium mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-secondary-bronze mb-1.5 font-poppins">
                        Contact Phone Number <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="+256 700 000000"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        className={`${inputs.text} text-xs sm:text-sm font-poppins font-mono`}
                      />
                      {formErrors.phone && <p className="text-xs text-error-red font-medium mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-bronze mb-1.5 font-poppins">
                      Street Address / Location / Plot No. <span className="text-error-red">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Plot No., Building Name, Street / Area (e.g. Kololo / Nakasero)"
                      value={shippingForm.line1}
                      onChange={(e) => setShippingForm({ ...shippingForm, line1: e.target.value })}
                      className={`${inputs.text} text-xs sm:text-sm font-poppins`}
                    />
                    {formErrors.line1 && <p className="text-xs text-error-red font-medium mt-1">{formErrors.line1}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-secondary-bronze mb-1.5 font-poppins">
                        City / Town <span className="text-error-red">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Kampala"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className={`${inputs.text} text-xs sm:text-sm font-poppins`}
                      />
                      {formErrors.city && <p className="text-xs text-error-red font-medium mt-1">{formErrors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-secondary-bronze mb-1.5 font-poppins">
                        District / Region
                      </label>
                      <input
                        type="text"
                        placeholder="Central Region"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                        className={`${inputs.text} text-xs sm:text-sm font-poppins`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-secondary-bronze mb-1.5 font-poppins">
                        Landmark / Postal (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Near Temple / landmark"
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                        className={`${inputs.text} text-xs sm:text-sm font-poppins`}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-primary-gold/10">
                    <Link href="/cart" className="text-xs sm:text-sm font-semibold text-secondary-bronze hover:text-primary-gold transition-colors flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back to Cart
                    </Link>
                    <button type="submit" className={`${buttons.primary} text-xs sm:text-sm font-semibold font-poppins flex items-center gap-1.5 cursor-pointer`}>
                      <span>Continue to Payment</span>
                      <span>➔</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Payment Method (COD ACTIVE ONLY) */}
              {step === "payment" && (
                <form onSubmit={handleCompleteOrder} className="bg-white border border-primary-gold/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="pb-3 border-b border-primary-gold/10 flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-lg sm:text-xl text-dark-surface font-bold">
                        Select Payment Method
                      </h3>
                      <p className="text-xs text-secondary-bronze/75 mt-0.5">
                        Cash on Delivery is currently the active payment method.
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-success-green/10 text-success-green font-bold text-[11px] border border-success-green/20">
                      COD Enabled
                    </span>
                  </div>

                  {/* Payment Options Grid */}
                  <div className="space-y-3">
                    
                    {/* 1. Cash on Delivery (ACTIVE & HIGHLIGHTED) */}
                    <div
                      className="p-5 rounded-2xl border-2 border-primary-gold bg-gradient-to-br from-bg-warm/60 via-white to-primary-gold/10 shadow-xs relative cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-primary-gold text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-heading text-base font-bold text-dark-surface">
                                Cash on Delivery (COD)
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-success-green/15 text-success-green text-[10px] font-bold uppercase tracking-wider border border-success-green/25">
                                Active & Available
                              </span>
                            </div>
                            <p className="text-xs text-secondary-bronze/85 mt-1 leading-relaxed">
                              Pay in cash directly to our delivery courier when your ordered items arrive at your address.
                            </p>
                          </div>
                        </div>

                        {/* Selected Radio Indicator */}
                        <div className="w-5 h-5 rounded-full border-2 border-primary-gold bg-primary-gold flex items-center justify-center text-white shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* COD Breakdown Note */}
                      <div className="mt-4 pt-3 border-t border-primary-gold/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-secondary-bronze gap-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Truck className="w-3.5 h-3.5 text-primary-gold" />
                          Doorstep delivery across Kampala & Uganda
                        </span>
                        <span className="font-bold text-dark-surface">
                          Payable on Delivery: <span className="text-primary-gold">{formatCurrency(total)}</span>
                        </span>
                      </div>
                    </div>

                    {/* 2. Credit / Debit Card (DISABLED) */}
                    <div className="p-4 rounded-2xl border border-secondary-bronze/15 bg-black/5 opacity-50 relative cursor-not-allowed select-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-secondary-bronze/15 text-secondary-bronze/60 flex items-center justify-center shrink-0">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-semibold text-secondary-bronze/70">
                                Credit / Debit Card (Visa / Mastercard)
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-secondary-bronze/10 text-secondary-bronze/60 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Disabled
                              </span>
                            </div>
                            <p className="text-[11px] text-secondary-bronze/50 mt-0.5">
                              Online card processing is temporarily unavailable. Please use Cash on Delivery.
                            </p>
                          </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-secondary-bronze/30 bg-transparent shrink-0" />
                      </div>
                    </div>

                    {/* 3. Mobile Money / UPI (DISABLED) */}
                    <div className="p-4 rounded-2xl border border-secondary-bronze/15 bg-black/5 opacity-50 relative cursor-not-allowed select-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-secondary-bronze/15 text-secondary-bronze/60 flex items-center justify-center shrink-0">
                            <Send className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-semibold text-secondary-bronze/70">
                                Mobile Money / Online Transfer (MTN / Airtel / UPI)
                              </h4>
                              <span className="px-2 py-0.5 rounded-md bg-secondary-bronze/10 text-secondary-bronze/60 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Disabled
                              </span>
                            </div>
                            <p className="text-[11px] text-secondary-bronze/50 mt-0.5">
                              Mobile money gateway integration is temporarily offline.
                            </p>
                          </div>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-secondary-bronze/30 bg-transparent shrink-0" />
                      </div>
                    </div>

                  </div>

                  {/* Delivery instructions banner */}
                  <div className="p-4 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 flex items-start gap-2.5 text-xs text-secondary-bronze">
                    <Info className="w-4 h-4 text-primary-gold shrink-0 mt-0.5" />
                    <span>
                      Our temple dispatch team will prepare and sanctify your package. You will pay the courier handler in cash upon physical receipt of the package.
                    </span>
                  </div>

                  {/* Submit / Back Actions */}
                  <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-primary-gold/10">
                    <button
                      type="button"
                      onClick={() => { setFormErrors({}); setStep("shipping"); }}
                      className="text-xs sm:text-sm font-semibold text-secondary-bronze hover:text-primary-gold transition-colors flex items-center cursor-pointer order-2 sm:order-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back to Delivery Address
                    </button>

                    <button
                      type="submit"
                      disabled={createOrderMutation.isPending}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs sm:text-sm font-bold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Place Order with COD • {formatCurrency(total)}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Order Review (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-primary-gold/15 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="font-heading text-lg sm:text-xl text-dark-surface font-bold pb-3 border-b border-primary-gold/10">
                  Order Summary ({cart.reduce((a, c) => a + c.quantity, 0)} Items)
                </h3>

                {/* Items Summaries */}
                <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center text-xs sm:text-sm">
                      <div className="max-w-[70%]">
                        <span className="font-semibold text-dark-surface block line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-secondary-bronze/70 text-[11px] font-mono">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </span>
                      </div>
                      <span className="font-bold text-dark-surface font-mono">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-primary-gold/10 pt-4 space-y-2.5 text-xs sm:text-sm font-poppins">
                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/75">Subtotal</span>
                    <span className="font-semibold text-dark-surface font-mono">{formatCurrency(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-success-green font-semibold">
                      <span>Coupon Discount</span>
                      <span className="font-mono">-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/75">Temple Tax (5%)</span>
                    <span className="font-semibold text-dark-surface font-mono">{formatCurrency(tax)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/75">Delivery Fee</span>
                    <span className="font-semibold text-dark-surface font-mono">
                      {shipping === 0 ? <span className="text-success-green font-bold">FREE</span> : formatCurrency(shipping)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-primary-gold/15 pt-4 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-secondary-bronze block">
                      Total Payable (COD)
                    </span>
                    <span className="text-[10px] text-secondary-bronze/60">Pay cash upon receipt</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-primary-gold font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Secure Checkout Badges */}
              <div className="bg-white/70 border border-primary-gold/15 rounded-2xl p-4 flex items-center justify-center space-x-2 text-xs font-medium text-secondary-bronze/80">
                <ShieldCheck className="w-5 h-5 text-primary-gold shrink-0" />
                <span>Verified Temple Sanctuary Dispatch</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* AUTHENTICATION GUARD MODAL */}
      {/* ========================================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-primary-gold/15 text-primary-gold flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-heading text-2xl font-bold text-dark-surface">
                Devotee Sign In Required
              </h3>
              <p className="text-xs sm:text-sm text-secondary-bronze/80 mt-2 leading-relaxed">
                To complete your Cash on Delivery order and receive order updates in your personal dashboard, please sign in or create your devotee profile.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login?redirect=/checkout"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs sm:text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer font-poppins"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Existing Account</span>
              </Link>

              <Link
                href="/membership?redirect=/checkout"
                className="w-full py-3 rounded-xl border border-primary-gold/30 bg-white text-secondary-bronze hover:bg-bg-warm text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer font-poppins shadow-2xs"
              >
                <UserPlus className="w-4 h-4 text-primary-gold" />
                <span>Create Free Devotee Account (OTP)</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-primary-gold/10">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="text-xs text-secondary-bronze/70 hover:text-dark-surface font-medium cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
