"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { layout, cards, typography, buttons, inputs, badges } from "@/lib/design-system";
import { ShoppingBag, ArrowLeft, ShieldCheck, CheckCircle2, CreditCard, Send, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ShopOrder, ShippingAddress, OrderItem } from "@/data/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, appliedCoupon, placeOrder, currentMemberNumber, members } = useApp();

  const activeMember = members.find(m => m.membershipNumber === currentMemberNumber);

  // Steps state: 'shipping' | 'payment' | 'processing' | 'success'
  const [step, setStep] = useState<"shipping" | "payment" | "processing" | "success">("shipping");

  // Shipping form fields
  const [shippingForm, setShippingForm] = useState<ShippingAddress>({
    name: activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
    phone: activeMember?.phone || "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment form fields
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI" | "COD">("UPI");
  
  // Card details state
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // UPI details state
  const [upiId, setUpiId] = useState("");

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
  const shipping = subtotal > 0 && (subtotal - discount) < 999 ? 99 : 0;
  const total = subtotal - discount + tax + shipping;

  // Validate Shipping fields
  const validateShipping = () => {
    const errors: Record<string, string> = {};
    if (!shippingForm.name.trim()) errors.name = "Full name is required.";
    if (!shippingForm.line1.trim()) errors.line1 = "Address line 1 is required.";
    if (!shippingForm.city.trim()) errors.city = "City is required.";
    if (!shippingForm.state.trim()) errors.state = "State is required.";
    if (!/^\d{6}$/.test(shippingForm.postalCode)) errors.postalCode = "Enter a valid 6-digit PIN code.";
    if (!/^\+?\d{10,12}$/.test(shippingForm.phone.replace(/[\s-]/g, ""))) {
      errors.phone = "Enter a valid 10-digit phone number.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate Payment fields
  const validatePayment = () => {
    const errors: Record<string, string> = {};
    if (paymentMethod === "CARD") {
      if (!cardHolder.trim()) errors.cardHolder = "Name on card is required.";
      if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) errors.cardNumber = "Enter a valid 16-digit card number.";
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) errors.cardExpiry = "Expiry date must be in MM/YY format.";
      if (!/^\d{3}$/.test(cardCvv)) errors.cardCvv = "CVV must be 3 digits.";
    } else if (paymentMethod === "UPI") {
      if (!/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.-]+$/.test(upiId)) {
        errors.upiId = "Enter a valid UPI address (e.g., name@okaxis).";
      }
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

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePayment()) {
      setFormErrors({});
      setStep("processing");

      // Simulate network request delays
      setTimeout(() => {
        const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        setCreatedOrderId(orderId);

        const newOrder: ShopOrder = {
          id: orderId,
          customerId: activeMember?.id || "cust-guest",
          customerName: shippingForm.name,
          items: cart as OrderItem[],
          subtotal,
          discount,
          tax,
          total,
          shippingAddress: shippingForm,
          paymentMethod,
          status: "PENDING",
          date: new Date().toISOString().split("T")[0],
          trackingNumber: `TRK${Math.floor(100000000 + Math.random() * 900000000)}`,
          timeline: [
            {
              status: "PENDING",
              timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              title: "Order Placed",
              description: `Payment via ${paymentMethod} verified. Order is queued for altar blessing pack.`
            }
          ]
        };

        placeOrder(newOrder);
        setStep("success");
      }, 2500);
    }
  };

  if (cart.length === 0 && step !== "success") {
    return (
      <div className="bg-bg-warm min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className={`${typography.h2} text-dark-surface mb-2`}>No Checkout Items</h1>
        <p className="text-secondary-bronze/70 mb-6">Your cart is currently empty.</p>
        <Link href="/shop" className={buttons.primary}>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className={`bg-bg-warm min-h-screen ${layout.sectionPadding}`}>
      <div className={layout.container}>
        {step !== "success" && (
          <h1 className={`${typography.h1} text-dark-surface mb-8`}>Checkout Securely</h1>
        )}

        {/* 1. SUCCESS STEP SCREEN */}
        {step === "success" && (
          <div className="max-w-md mx-auto text-center bg-white border border-primary-gold/10 rounded-3xl p-8 shadow-md space-y-6">
            <div className="w-16 h-16 bg-success-green/10 rounded-full flex items-center justify-center mx-auto text-success-green animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className={`${typography.h2} text-dark-surface`}>Order Confirmed!</h2>
              <p className="text-secondary-bronze/70 text-xs mt-2 uppercase tracking-wide">
                Order ID: <span className="font-bold text-primary-gold">{createdOrderId}</span>
              </p>
              <p className="text-secondary-bronze/70 text-xs mt-1">
                A confirmation email & invoice copy have been logged to your dashboard account.
              </p>
            </div>
            <div className="bg-bg-warm/40 border border-primary-gold/5 rounded-2xl p-4 flex items-center justify-center space-x-2 text-xs font-semibold text-secondary-bronze">
              <Sparkles className="w-4 h-4 text-primary-gold" />
              <span>Your items will receive a temple altar blessing before dispatch!</span>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/orders" className={buttons.primary}>
                Track Order Shipping
              </Link>
              <Link href="/shop" className={`${buttons.secondary} border-primary-gold/10 hover:bg-primary-gold/5`}>
                Back to Shop Catalog
              </Link>
            </div>
          </div>
        )}

        {/* 2. PROCESSING LOADING SCREEN */}
        {step === "processing" && (
          <div className="max-w-md mx-auto text-center bg-white border border-primary-gold/10 rounded-3xl p-12 shadow-md space-y-6">
            <div className="w-16 h-16 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className={`${typography.h3} text-dark-surface`}>Processing Payment</h3>
              <p className="text-secondary-bronze/70 text-sm mt-2">
                Simulating banking gateway transactions. Please do not close or refresh this tab.
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
              <div className="bg-white border border-primary-gold/10 rounded-2xl p-4 flex items-center justify-around text-xs font-bold text-secondary-bronze">
                <span className={`flex items-center space-x-1.5 ${step === "shipping" ? "text-primary-gold" : "text-success-green"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === "shipping" ? "bg-primary-gold text-white" : "bg-success-green/10 text-success-green border border-success-green/20"}`}>
                    1
                  </span>
                  <span>Shipping Address</span>
                </span>
                <span className="text-secondary-bronze/35">➔</span>
                <span className={`flex items-center space-x-1.5 ${step === "payment" ? "text-primary-gold" : "text-secondary-bronze/40"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === "payment" ? "bg-primary-gold text-white" : "bg-secondary-bronze/10 text-secondary-bronze/40 border border-secondary-bronze/10"}`}>
                    2
                  </span>
                  <span>Secure Payment</span>
                </span>
              </div>

              {/* Step 1: Shipping Form */}
              {step === "shipping" && (
                <form onSubmit={handleNextStep} className="bg-white border border-primary-gold/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                  <h3 className={`${typography.h4} text-dark-surface font-semibold pb-3 border-b border-primary-gold/10 mb-4`}>
                    Shipping Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={inputs.label}>Full Name</label>
                      <input
                        type="text"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        className={inputs.text}
                      />
                      {formErrors.name && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className={inputs.label}>Phone Number</label>
                      <input
                        type="text"
                        placeholder="+91 XXXXX XXXXX"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        className={inputs.text}
                      />
                      {formErrors.phone && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={inputs.label}>Street Address (Line 1)</label>
                    <input
                      type="text"
                      placeholder="House No, Apartment, Street name"
                      value={shippingForm.line1}
                      onChange={(e) => setShippingForm({ ...shippingForm, line1: e.target.value })}
                      className={inputs.text}
                    />
                    {formErrors.line1 && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.line1}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={inputs.label}>City</label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className={inputs.text}
                      />
                      {formErrors.city && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.city}</p>}
                    </div>

                    <div>
                      <label className={inputs.label}>State</label>
                      <input
                        type="text"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                        className={inputs.text}
                      />
                      {formErrors.state && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.state}</p>}
                    </div>

                    <div>
                      <label className={inputs.label}>PIN Code</label>
                      <input
                        type="text"
                        placeholder="6-digit code"
                        maxLength={6}
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                        className={inputs.text}
                      />
                      {formErrors.postalCode && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.postalCode}</p>}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-primary-gold/10">
                    <Link href="/cart" className="text-xs font-semibold text-secondary-bronze hover:text-primary-gold transition-colors flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back to Cart
                    </Link>
                    <button type="submit" className={buttons.primary}>
                      Proceed to Payment
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Payment Form */}
              {step === "payment" && (
                <form onSubmit={handleCompleteOrder} className="bg-white border border-primary-gold/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <h3 className={`${typography.h4} text-dark-surface font-semibold pb-3 border-b border-primary-gold/10 mb-4`}>
                    Choose Payment Option
                  </h3>

                  {/* Payment Tabs */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("UPI"); setFormErrors({}); }}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethod === "UPI"
                          ? "border-primary-gold bg-primary-gold/10 text-primary-gold"
                          : "border-primary-gold/10 text-secondary-bronze/70 hover:border-primary-gold/25"
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>BHIM UPI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("CARD"); setFormErrors({}); }}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethod === "CARD"
                          ? "border-primary-gold bg-primary-gold/10 text-primary-gold"
                          : "border-primary-gold/10 text-secondary-bronze/70 hover:border-primary-gold/25"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Credit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("COD"); setFormErrors({}); }}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        paymentMethod === "COD"
                          ? "border-primary-gold bg-primary-gold/10 text-primary-gold"
                          : "border-primary-gold/10 text-secondary-bronze/70 hover:border-primary-gold/25"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Cash on Delivery</span>
                    </button>
                  </div>

                  {/* UPI Inputs Form */}
                  {paymentMethod === "UPI" && (
                    <div className="space-y-4 p-4 border border-primary-gold/10 rounded-2xl bg-bg-warm/20">
                      <div>
                        <label className={inputs.label}>Virtual Payment Address (VPA)</label>
                        <input
                          type="text"
                          placeholder="e.g. name@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className={inputs.text}
                        />
                        {formErrors.upiId && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.upiId}</p>}
                      </div>
                      <p className="text-[10px] text-secondary-bronze/50">
                        An instant authorization request will be triggered to your UPI mobile app.
                      </p>
                    </div>
                  )}

                  {/* Card Inputs Form */}
                  {paymentMethod === "CARD" && (
                    <div className="space-y-4 p-4 border border-primary-gold/10 rounded-2xl bg-bg-warm/20">
                      <div>
                        <label className={inputs.label}>Name on Card</label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className={inputs.text}
                        />
                        {formErrors.cardHolder && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.cardHolder}</p>}
                      </div>

                      <div>
                        <label className={inputs.label}>Card Number</label>
                        <input
                          type="text"
                          placeholder="XXXX XXXX XXXX XXXX"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim())}
                          className={inputs.text}
                        />
                        {formErrors.cardNumber && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={inputs.label}>Expiration Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className={inputs.text}
                          />
                          {formErrors.cardExpiry && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.cardExpiry}</p>}
                        </div>

                        <div>
                          <label className={inputs.label}>CVV</label>
                          <input
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/[^\d]/g, ""))}
                            className={inputs.text}
                          />
                          {formErrors.cardCvv && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.cardCvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Details */}
                  {paymentMethod === "COD" && (
                    <div className="p-4 border border-primary-gold/10 rounded-2xl bg-bg-warm/20 text-xs text-secondary-bronze/70 leading-relaxed">
                      Please keep exactly <span className="font-bold text-dark-surface">{formatCurrency(total)}</span> in cash ready for delivery handlers. Digital payments can also be made at the door during delivery.
                    </div>
                  )}

                  {/* Submit / Back */}
                  <div className="pt-4 flex justify-between items-center border-t border-primary-gold/10">
                    <button
                      type="button"
                      onClick={() => { setFormErrors({}); setStep("shipping"); }}
                      className="text-xs font-semibold text-secondary-bronze hover:text-primary-gold transition-colors flex items-center cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back to Shipping
                    </button>
                    <button type="submit" className={buttons.primary}>
                      Authorize & Pay {formatCurrency(total)}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Order Review (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className={`${typography.h5} text-dark-surface font-semibold pb-3 border-b border-primary-gold/10`}>
                  Order Review
                </h3>

                {/* Items Summaries */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center text-xs">
                      <div className="max-w-[70%]">
                        <span className="font-bold text-dark-surface block line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-secondary-bronze/60">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </span>
                      </div>
                      <span className="font-semibold text-dark-surface">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-primary-gold/10 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/70">Subtotal</span>
                    <span className="font-semibold text-dark-surface">{formatCurrency(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-success-green">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/70">Tax (5% GST)</span>
                    <span className="font-semibold text-dark-surface">{formatCurrency(tax)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/70">Shipping</span>
                    <span className="font-semibold text-dark-surface">
                      {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-primary-gold/10 pt-4 flex justify-between items-end">
                  <span className="text-xs font-bold text-dark-surface">Total</span>
                  <span className="text-lg font-bold text-primary-gold">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Secure Checkout Badges */}
              <div className="bg-white/40 border border-primary-gold/5 rounded-2xl p-4 flex items-center justify-center space-x-2 text-[10px] font-bold text-secondary-bronze/70">
                <ShieldCheck className="w-5 h-5 text-primary-gold shrink-0" />
                <span>SSL Encrypted Checkout Processing</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
