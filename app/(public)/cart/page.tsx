"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context";
import { layout, cards, typography, buttons, inputs, badges } from "@/lib/design-system";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Tag, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
  } = useApp();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Subtotals and pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Apply Coupon discounts
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

  // Tax calculation (5% GST for sacred products)
  const tax = Math.round((subtotal - discount) * 0.05);

  // Shipping calculation
  const shipping = subtotal > 0 && (subtotal - discount) < 999 ? 99 : 0; // Free shipping over 999

  // Total
  const total = subtotal - discount + tax + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess(false);

    if (!couponInput) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (subtotal < 100) {
      setCouponError("Minimum purchase amount to apply coupons is ₹100.");
      return;
    }

    const success = applyCouponCode(couponInput);
    if (success) {
      setCouponSuccess(true);
      setCouponInput("");
    } else {
      setCouponError("Invalid or inactive coupon code.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-bg-warm min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-primary-gold/10 rounded-full mb-4">
          <ShoppingBag className="w-12 h-12 text-primary-gold" />
        </div>
        <h1 className={`${typography.h2} text-dark-surface mb-2`}>Your Cart is Empty</h1>
        <p className="text-secondary-bronze/70 mb-6 max-w-sm text-sm">
          Bring auspicious temple items, incense, and spiritual books to your home temple space.
        </p>
        <Link href="/shop" className={buttons.primary}>
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className={`bg-bg-warm min-h-screen ${layout.sectionPadding}`}>
      <div className={layout.container}>
        <h1 className={`${typography.h1} text-dark-surface mb-8`}>Your Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-primary-gold/10 mb-6">
                <span className="text-xs font-bold text-secondary-bronze/70">
                  {cart.length} unique sacred item{cart.length > 1 ? "s" : ""}
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-error-red hover:text-red-700 font-bold transition-colors cursor-pointer"
                >
                  Clear Entire Cart
                </button>
              </div>

              <div className="space-y-6">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-primary-gold/5 rounded-2xl bg-bg-warm/15 hover:bg-bg-warm/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-primary-gold/10 p-1 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain rounded-lg"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-dark-surface line-clamp-1 text-sm">
                          {item.name}
                        </h4>
                        <span className="text-xs text-primary-gold font-semibold block mt-0.5">
                          {formatCurrency(item.price)} each
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-primary-gold/15 bg-white rounded-full px-2 py-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-2 text-secondary-bronze hover:text-primary-gold font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-dark-surface">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="px-2 text-secondary-bronze hover:text-primary-gold font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Total price for item */}
                      <span className="text-sm font-bold text-dark-surface min-w-[70px] text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-secondary-bronze/40 hover:text-error-red p-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back to Shop Link */}
            <Link
              href="/shop"
              className="inline-flex items-center text-xs font-semibold text-secondary-bronze hover:text-primary-gold transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Cart Summary Card (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Promo Coupon Box */}
            <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm">
              <h3 className={`${typography.h5} text-dark-surface font-semibold mb-3 flex items-center space-x-1.5`}>
                <Tag className="w-4 h-4 text-primary-gold" />
                <span>Apply Coupon</span>
              </h3>

              {appliedCoupon ? (
                <div className="bg-success-green/10 border border-success-green/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-success-green/15 rounded-xl text-success-green">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-success-green block">{appliedCoupon.code}</span>
                      <span className="text-[10px] text-secondary-bronze/70">{appliedCoupon.description}</span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-error-red hover:text-red-700 font-bold ml-4 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. WELCOME50)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className={`${inputs.text} py-2 px-3 text-xs`}
                  />
                  <button type="submit" className={`${buttons.primary} py-2 px-4 text-xs shrink-0`}>
                    Apply
                  </button>
                </form>
              )}

              {couponError && <p className="text-[11px] text-error-red font-semibold mt-2">{couponError}</p>}
              {couponSuccess && (
                <p className="text-[11px] text-success-green font-semibold mt-2">
                  Coupon applied successfully!
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className={`${typography.h5} text-dark-surface font-semibold pb-3 border-b border-primary-gold/10`}>
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-secondary-bronze/70">Cart Subtotal</span>
                  <span className="font-semibold text-dark-surface">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-success-green">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-secondary-bronze/70">Gst Tax (5%)</span>
                  <span className="font-semibold text-dark-surface">{formatCurrency(tax)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-secondary-bronze/70">Estimated Shipping</span>
                  <span className="font-semibold text-dark-surface">
                    {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[9px] text-primary-gold/80 italic text-right">
                    Add ₹{999 - (subtotal - discount)} more for FREE shipping
                  </p>
                )}
              </div>

              <div className="border-t border-primary-gold/10 pt-4 flex justify-between items-end">
                <span className="text-sm font-bold text-dark-surface">Total Amount</span>
                <span className="text-xl font-bold text-primary-gold">{formatCurrency(total)}</span>
              </div>

              <Link
                href="/checkout"
                className={`${buttons.primary} w-full py-3.5 mt-4 text-xs flex items-center justify-center space-x-2`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
