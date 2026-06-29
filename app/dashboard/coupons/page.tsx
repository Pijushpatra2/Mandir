"use client";

import React, { useState } from "react";
import { mockCoupons, Coupon } from "@/data/coupons";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, inputs, badges } from "@/lib/design-system";
import { Plus, X, Tag } from "lucide-react";

export default function DashboardCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState(10);
  const [minSpend, setMinSpend] = useState(500);
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!code.trim()) errors.code = "Coupon code is required.";
    if (value <= 0) errors.value = "Value must be positive.";
    if (minSpend < 0) errors.minSpend = "Minimum spend cannot be negative.";
    if (!description.trim()) errors.description = "Description is required.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const newCoupon: Coupon = {
        code: code.toUpperCase().replace(/\s+/g, ""),
        discountType,
        value,
        minSpend,
        active: true,
        description,
      };

      setCoupons([newCoupon, ...coupons]);
      setShowAddModal(false);
      
      // Reset form
      setCode("");
      setValue(10);
      setMinSpend(500);
      setDescription("");
    }
  };

  const toggleCouponStatus = (couponCode: string) => {
    setCoupons(
      coupons.map((c) => (c.code === couponCode ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="space-y-8 font-jakarta">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>Shop Coupon Codes</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Create and toggle discount coupon codes for shoppers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`${buttons.primary} px-5 py-2.5 text-xs flex items-center space-x-1.5`}
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Grid of coupons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className={`${cards.white} flex flex-col justify-between border relative overflow-hidden ${
              coupon.active ? "border-primary-gold/15" : "border-neutral-gray bg-bg-warm/25"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2.5 rounded-xl ${coupon.active ? "bg-primary-gold/10 text-primary-gold" : "bg-neutral-gray/30 text-secondary-bronze/50"}`}>
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-dark-surface tracking-wider text-base">{coupon.code}</span>
                  <span className="text-[10px] text-secondary-bronze/50 block mt-0.5">
                    Min Spend: ₹{coupon.minSpend}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleCouponStatus(coupon.code)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                  coupon.active
                    ? "bg-success-green/10 text-success-green hover:bg-error-red/10 hover:text-error-red"
                    : "bg-neutral-gray/40 text-secondary-bronze/60 hover:bg-success-green/10 hover:text-success-green"
                }`}
              >
                {coupon.active ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-secondary-bronze/80 leading-relaxed font-semibold">
                {coupon.description}
              </p>
              <div className="text-xs font-bold text-primary-gold pt-2 border-t border-primary-gold/5 flex justify-between">
                <span>Value:</span>
                <span>{coupon.discountType === "PERCENT" ? `${coupon.value}% OFF` : `Flat ₹${coupon.value} OFF`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-dark-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-primary-gold/10">
              <h3 className={`${typography.h4} text-dark-surface font-semibold`}>Create Promo Code</h3>
              <button onClick={() => setShowAddModal(false)} className="text-secondary-bronze/60 hover:text-dark-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className={inputs.label}>Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. DIWALI30"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={inputs.text}
                />
                {formErrors.code && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.code}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={inputs.label}>Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className={inputs.select}
                  >
                    <option value="PERCENT">PERCENT (%)</option>
                    <option value="FIXED">FIXED (₹)</option>
                  </select>
                </div>

                <div>
                  <label className={inputs.label}>Discount Value</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className={inputs.text}
                  />
                  {formErrors.value && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.value}</p>}
                </div>
              </div>

              <div>
                <label className={inputs.label}>Minimum Purchase Spend (INR)</label>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                  className={inputs.text}
                />
                {formErrors.minSpend && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.minSpend}</p>}
              </div>

              <div>
                <label className={inputs.label}>Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% discount on checkout orders above ₹1000"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputs.text}
                />
                {formErrors.description && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.description}</p>}
              </div>

              <div className="pt-4 border-t border-primary-gold/10 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`${buttons.secondary} py-2 px-4 text-xs`}
                >
                  Cancel
                </button>
                <button type="submit" className={`${buttons.primary} py-2 px-6 text-xs`}>
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
