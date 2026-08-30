"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockProducts } from "@/data/products";
import { mockCategories } from "@/data/categories";
import { useApp } from "@/lib/context";
import { useShopProducts, useProductReviews, useCreateReview, ShopProduct } from "@/lib/api/shop";
import { layout, cards, typography, buttons, badges, inputs } from "@/lib/design-system";
import { ArrowLeft, ShoppingCart, Heart, Star, ShieldCheck, CheckCircle2, ChevronRight, Loader2, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { addToCart, toggleWishlist, wishlist, devoteeProfile } = useApp();

  const { data: dbProducts = [], isLoading } = useShopProducts();

  const allProducts = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts;
    }
    return mockProducts;
  }, [dbProducts]);

  const product = allProducts.find((p) => p.slug === slug || p.id === slug);
  const category = mockCategories.find((c) => c.id === product?.categoryId || c.slug === product?.categoryId) || {
    name: product?.categoryId ? product.categoryId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : "Sacred Item",
    slug: product?.categoryId || "all",
  };

  // Active States
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");

  // Real Database Reviews
  const { data: dbReviews = [], isLoading: isLoadingReviews } = useProductReviews(product?.id || "");
  const createReviewMutation = useCreateReview();

  // Review Form States
  const [reviewerName, setReviewerName] = useState(
    devoteeProfile ? `${devoteeProfile.first_name} ${devoteeProfile.last_name}` : ""
  );
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewerName.trim() || !reviewComment.trim()) {
      alert("Please enter your name and review comments.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await createReviewMutation.mutateAsync({
        productId: product.id,
        customerName: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
        verifiedPurchase: Boolean(devoteeProfile),
      });
      setReviewComment("");
      alert("Thank you! Your sacred review has been submitted.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Retrieve related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => (p.categoryId === product.categoryId || (p.categoryId && product.categoryId && p.categoryId.toLowerCase() === product.categoryId.toLowerCase())) && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  if (isLoading) {
    return (
      <div className="bg-bg-warm min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-gold mb-3" />
        <p className="text-secondary-bronze/70 text-sm">Loading divine product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-bg-warm min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className={`${typography.h2} text-dark-surface mb-2`}>Product Not Found</h1>
        <p className="text-secondary-bronze/70 mb-6">The sacred product you are looking for does not exist.</p>
        <Link href="/shop" className={buttons.primary}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const validImages = (product.images || []).filter(Boolean);
  const mainDisplayImage = activeImage || validImages[0] || DEFAULT_PRODUCT_IMAGE;
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className={`bg-bg-warm min-h-screen ${layout.sectionPadding}`}>
      <div className={layout.container}>
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-secondary-bronze/65 mb-8">
          <Link href="/shop" className="hover:text-primary-gold transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {category && (
            <>
              <Link href={`/categories/${category.slug}`} className="hover:text-primary-gold transition-colors">
                {category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-secondary-bronze font-bold line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
          {/* 1. Gallery Column (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative h-[400px] w-full overflow-hidden bg-white border border-primary-gold/10 rounded-3xl shadow-sm">
              <Image
                src={mainDisplayImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain p-4"
                unoptimized
              />
              {/* Featured Badge */}
              {product.isFeatured && (
                <span className="absolute top-6 left-6 bg-primary-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Featured
                </span>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {validImages.length > 1 && (
              <div className="flex gap-3">
                {validImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border transition-all cursor-pointer p-1 ${
                      mainDisplayImage === img ? "border-primary-gold ring-2 ring-primary-gold/25" : "border-primary-gold/10 hover:border-primary-gold/30"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover rounded-lg"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Details Column (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-warning-amber mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.rating || 5) ? "fill-current text-warning-amber" : "text-neutral-gray"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-dark-surface">{product.rating || 5.0}</span>
                <span className="text-xs text-secondary-bronze/50">({dbReviews.length || product.reviewsCount || 0} reviews)</span>
              </div>

              <h1 className={`${typography.h1} text-dark-surface font-semibold mb-3`}>{product.name}</h1>
              <div className="text-2xl font-bold text-dark-surface font-heading">
                {formatCurrency(product.price)}
              </div>
            </div>

            <p className={`${typography.body} text-secondary-bronze/80 leading-relaxed`}>
              {product.description}
            </p>

            {/* Stock status indicator */}
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${(product.stock || 0) > 0 ? "bg-success-green" : "bg-error-red"}`} />
              <span className="text-xs font-semibold text-secondary-bronze">
                {(product.stock || 0) > 0 ? `In Stock (${product.stock} available)` : "Currently Out of Stock"}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-primary-gold/10">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-primary-gold/20 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-secondary-bronze hover:bg-primary-gold/10 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-bold text-xs text-dark-surface">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 50, quantity + 1))}
                    className="px-3.5 py-2 text-secondary-bronze hover:bg-primary-gold/10 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.stock === 0}
                  className={`${buttons.primary} flex-grow py-3 px-6 text-sm flex items-center justify-center space-x-2`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{product.stock === 0 ? "Out of Stock" : "Add to Sacred Cart"}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isWishlisted
                      ? "border-error-red bg-error-red/10 text-error-red"
                      : "border-primary-gold/20 hover:border-primary-gold/40 text-secondary-bronze bg-white"
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>

            {/* Quality Assurance Guarantees */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-gold/10">
              <div className="flex items-center space-x-3 text-xs text-secondary-bronze">
                <ShieldCheck className="w-5 h-5 text-primary-gold shrink-0" />
                <span>100% Authentic & Blessed Pooja Items</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-secondary-bronze">
                <CheckCircle2 className="w-5 h-5 text-primary-gold shrink-0" />
                <span>Secure Courier Packing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="bg-white border border-primary-gold/10 rounded-3xl p-8 shadow-sm mb-16">
          <div className="flex border-b border-primary-gold/10 pb-4 mb-6 gap-6">
            <button
              onClick={() => setActiveTab("specs")}
              className={`text-sm font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "specs"
                  ? "border-primary-gold text-primary-gold"
                  : "border-transparent text-secondary-bronze/60 hover:text-secondary-bronze"
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`text-sm font-semibold pb-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "border-primary-gold text-primary-gold"
                  : "border-transparent text-secondary-bronze/60 hover:text-secondary-bronze"
              }`}
            >
              Devotee Reviews ({dbReviews.length})
            </button>
          </div>

          {/* Specs Content */}
          {activeTab === "specs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specs &&
                Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-3 border-b border-primary-gold/5 text-sm">
                    <span className="text-secondary-bronze/60 font-semibold">{key}</span>
                    <span className="text-dark-surface font-bold">{val}</span>
                  </div>
                ))}
            </div>
          )}

          {/* Reviews Content */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Add Review Form */}
              <div className="bg-bg-warm/30 border border-primary-gold/10 rounded-2xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-dark-surface">Write a Devotional Review</h4>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={inputs.label}>Your Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Patel"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        className={inputs.text}
                      />
                    </div>
                    <div>
                      <label className={inputs.label}>Star Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className={inputs.select}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Divine)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars - Great)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars - Good)</option>
                        <option value={2}>⭐⭐ (2 Stars - Fair)</option>
                        <option value={1}>⭐ (1 Star - Poor)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={inputs.label}>Your Experience / Feedback</label>
                    <textarea
                      placeholder="Share your spiritual experience with this blessed item..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className={`${inputs.text} h-20 resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className={`${buttons.primary} px-5 py-2 text-xs flex items-center space-x-1.5 cursor-pointer`}
                  >
                    {isSubmittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{isSubmittingReview ? "Submitting..." : "Post Review"}</span>
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {isLoadingReviews ? (
                  <div className="py-6 text-center text-xs text-secondary-bronze">Loading reviews...</div>
                ) : dbReviews.length === 0 ? (
                  <div className="text-center py-6 text-secondary-bronze/60 text-xs">
                    No reviews submitted yet for this product. Be the first to leave a review!
                  </div>
                ) : (
                  dbReviews.map((rev) => (
                    <div key={rev.id} className="p-4 border-b border-primary-gold/5 last:border-none space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-dark-surface">{rev.customerName}</span>
                          {rev.verifiedPurchase && (
                            <span className="bg-success-green/10 text-success-green border border-success-green/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center">
                              <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-secondary-bronze/50">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                        </span>
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
                      <p className="text-sm text-secondary-bronze/80 italic leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Products Recommendations */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className={`${typography.h3} text-dark-surface mb-8`}>Recommended Sacred Items</h3>
            <div className={layout.gridCols4}>
              {relatedProducts.map((p) => {
                const isPWishlisted = wishlist.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`${cards.white} flex flex-col h-full overflow-hidden group hover:shadow-md hover:border-primary-gold/20 transition-all duration-300 relative`}
                  >
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm text-secondary-bronze hover:text-error-red transition-all cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isPWishlisted ? "fill-error-red text-error-red" : ""}`} />
                    </button>

                    <Link href={`/shop/${p.slug}`} className="relative h-40 w-full overflow-hidden rounded-xl bg-primary-gold/5 mb-4 block">
                      <Image
                        src={p.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                        alt={p.name}
                        fill
                        sizes="200px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    </Link>

                    <div className="flex-grow flex flex-col">
                      <Link href={`/shop/${p.slug}`} className="hover:text-primary-gold transition-colors block">
                        <h4 className="font-semibold text-dark-surface line-clamp-1 mb-1 text-sm">
                          {p.name}
                        </h4>
                      </Link>
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-primary-gold/10">
                        <span className="text-sm font-bold text-dark-surface">
                          {formatCurrency(p.price)}
                        </span>
                        <span className="text-[10px] text-primary-gold font-bold">View Detail →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
