"use client";

import React, { useState } from "react";
import Link from "next/link";
import { mockReviews, ProductReview } from "@/data/reviews";
import { mockProducts } from "@/data/products";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, inputs } from "@/lib/design-system";
import { Star, Trash2, CheckCircle2, MessageSquare } from "lucide-react";

export default function DashboardReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>(mockReviews);

  const handleDeleteReview = (id: string) => {
    if (confirm("Are you sure you want to delete/hide this review?")) {
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      <div>
        <h1 className={`${typography.h2} text-dark-surface font-medium`}>Product Reviews Moderator</h1>
        <p className="text-xs text-secondary-bronze/75 mt-0.5">
          Moderate review ratings and comments submitted by devotees for store products.
        </p>
      </div>

      <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm">
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-secondary-bronze/50 text-xs">
              No product reviews logged in database.
            </div>
          ) : (
            reviews.map((rev) => {
              const product = mockProducts.find((p) => p.id === rev.productId);
              return (
                <div
                  key={rev.id}
                  className="p-5 border border-primary-gold/10 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 bg-bg-warm/5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-bold text-dark-surface text-sm">{rev.customerName}</span>
                      {rev.verifiedPurchase && (
                        <span className="bg-success-green/10 text-success-green border border-success-green/20 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    <div className="flex text-warning-amber">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? "fill-current" : "text-neutral-gray"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-secondary-bronze/80 leading-relaxed italic">
                      "{rev.comment}"
                    </p>

                    {product && (
                      <p className="text-[10px] text-secondary-bronze/55 flex items-center">
                        <MessageSquare className="w-3 h-3 mr-1 text-primary-gold" />
                        <span>Product: </span>
                        <Link href={`/shop/${product.slug}`} className="font-semibold text-primary-gold hover:underline ml-1">
                          {product.name}
                        </Link>
                      </p>
                    )}
                  </div>

                  <div className="flex items-start justify-end shrink-0">
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-2 rounded-lg border border-error-red/10 text-error-red hover:bg-error-red/10 transition-colors cursor-pointer"
                      title="Hide or Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
