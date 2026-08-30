"use client";

import React, { useState } from "react";
import {
  useShopCoupons,
  useAddShopCoupon,
  useToggleShopCoupon,
  useDeleteShopCoupon,
  ShopCoupon,
} from "@/lib/api/shop";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, inputs, badges } from "@/lib/design-system";
import { Plus, X, Tag, Trash2, Loader2, RefreshCw } from "lucide-react";

export default function DashboardCouponsPage() {
  const { data: coupons = [], isLoading, refetch } = useShopCoupons();
  const addCouponMutation = useAddShopCoupon();
  const toggleCouponMutation = useToggleShopCoupon();
  const deleteCouponMutation = useDeleteShopCoupon();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await addCouponMutation.mutateAsync({
          code: code.toUpperCase().replace(/\s+/g, ""),
          discountType,
          value: Number(value),
          minSpend: Number(minSpend || 0),
          description,
        });
        setShowAddModal(false);
        setCode("");
        setValue(10);
        setMinSpend(500);
        setDescription("");
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to create coupon code");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      await toggleCouponMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to toggle coupon status");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this coupon?")) {
      try {
        await deleteCouponMutation.mutateAsync(id);
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to delete coupon");
      }
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>Shop Coupon Codes</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Create and toggle discount promotional vouchers stored in database for devotees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className={`${buttons.secondary} px-4 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className={`${buttons.primary} px-5 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon Code</span>
          </button>
        </div>
      </div>

      {/* Grid of coupons */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
          <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
          <p className="text-xs">Loading coupons from database...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-primary-gold/10 rounded-3xl p-12 text-center text-secondary-bronze/60 text-xs shadow-sm">
          No coupon codes active in database. Click "Create Coupon Code" to add your first promotional voucher.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id || coupon.code}
              className={`${cards.white} flex flex-col justify-between border relative overflow-hidden ${
                coupon.active ? "border-primary-gold/15" : "border-neutral-gray bg-bg-warm/25"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        coupon.active ? "bg-primary-gold/10 text-primary-gold" : "bg-neutral-gray/30 text-secondary-bronze/50"
                      }`}
                    >
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-dark-surface tracking-wider text-base">{coupon.code}</span>
                      <span className="text-[10px] text-secondary-bronze/50 block mt-0.5">
                        Min Spend: UGX {coupon.minSpend}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      coupon.active ? "bg-success-green/10 text-success-green" : "bg-neutral-gray text-secondary-bronze/60"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="text-xl font-bold text-primary-gold font-heading">
                    {coupon.discountType === "PERCENT" ? `${coupon.value}% OFF` : `UGX ${coupon.value} OFF`}
                  </div>
                  <p className="text-xs text-secondary-bronze/70">{coupon.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-primary-gold/10 flex items-center justify-between">
                <button
                  onClick={() => handleToggleCoupon(coupon.id)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    coupon.active
                      ? "border-warning-amber/30 text-warning-amber hover:bg-warning-amber/10"
                      : "border-success-green/30 text-success-green hover:bg-success-green/10"
                  }`}
                >
                  {coupon.active ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="p-1.5 rounded-lg text-error-red/70 hover:text-error-red hover:bg-error-red/10 transition-colors cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-dark-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-primary-gold/10">
              <h3 className={`${typography.h4} text-dark-surface font-semibold`}>Create Promotional Coupon</h3>
              <button onClick={() => setShowAddModal(false)} className="text-secondary-bronze/60 hover:text-dark-surface cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className={inputs.label}>Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVAL20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
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
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FIXED">Flat (UGX / INR)</option>
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
                <label className={inputs.label}>Minimum Order Spend (UGX)</label>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                  className={inputs.text}
                />
              </div>

              <div>
                <label className={inputs.label}>Voucher Description</label>
                <textarea
                  placeholder="e.g. 20% discount on sacred festival offerings over UGX 2,000"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputs.text} h-20 resize-none`}
                />
                {formErrors.description && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.description}</p>}
              </div>

              <div className="pt-4 border-t border-primary-gold/10 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className={`${buttons.secondary} py-2 px-4 text-xs cursor-pointer`}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={`${buttons.primary} py-2 px-6 text-xs flex items-center space-x-1.5 cursor-pointer`}>
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? "Creating..." : "Save Coupon"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
