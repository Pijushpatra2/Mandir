"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockProducts } from "@/data/products";
import { mockCategories } from "@/data/categories";
import { mockReviews } from "@/data/reviews";
import { useApp } from "@/lib/context";
import { layout, cards, typography, buttons, badges, inputs } from "@/lib/design-system";
import { ArrowLeft, ShoppingCart, Heart, Star, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { addToCart, toggleWishlist, wishlist } = useApp();

  const product = mockProducts.find((p) => p.slug === slug);
  const category = mockCategories.find((c) => c.id === product?.categoryId);

  // Active States
  const [activeImage, setActiveImage] = useState(product?.images[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("specs"); // 'specs' | 'reviews'

  // Retrieve reviews for this specific product
  const productReviews = useMemo(() => {
    if (!product) return [];
    return mockReviews.filter((r) => r.productId === product.id);
  }, [product]);

  // Retrieve related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return mockProducts
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="bg-bg-warm min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className={`${typography.h2} text-dark-surface mb-2`}>Product Not Found</h1>
        <p className="text-secondary-bronze/70 mb-6">The product you are looking for does not exist.</p>
        <Link href="/shop" className={buttons.primary}>
          Back to Shop
        </Link>
      </div>
    );
  }

  // Ensure activeImage is set when product loads
  if (!activeImage && product.images.length > 0) {
    setActiveImage(product.images[0]);
  }

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
                src={activeImage || product.images[0]}
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
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border transition-all cursor-pointer p-1 ${
                      activeImage === img ? "border-primary-gold ring-2 ring-primary-gold/25" : "border-primary-gold/10 hover:border-primary-gold/30"
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
              <span className="text-primary-gold font-semibold tracking-wider text-xs uppercase">
                {category?.name || "Devotional item"}
              </span>
              <h1 className={`${typography.h1} text-dark-surface mt-1`}>{product.name}</h1>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center text-xs text-warning-amber">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? "fill-current" : "text-neutral-gray"
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 font-bold text-dark-surface">{product.rating}</span>
                </div>
                <span className="text-secondary-bronze/35">|</span>
                <span className="text-xs text-secondary-bronze/70">
                  {product.reviewsCount} customer reviews
                </span>
              </div>
            </div>

            <div className="text-3xl font-bold text-dark-surface bg-white/50 border border-primary-gold/5 rounded-2xl p-4 inline-block">
              {formatCurrency(product.price)}
            </div>

            <p className={`${typography.body} text-secondary-bronze/80 leading-relaxed`}>
              {product.description}
            </p>

            {/* In-Stock Indicator */}
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <span className="text-secondary-bronze/65">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-success-green flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 fill-success-green/10" />
                  In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="text-error-red">Out of Stock</span>
              )}
            </div>

            {/* Actions Panel */}
            {product.stock > 0 && (
              <div className="pt-6 border-t border-primary-gold/10 flex flex-col sm:flex-row gap-4 items-center">
                {/* Quantity Incrementor */}
                <div className="flex items-center border border-primary-gold/15 bg-white rounded-full px-2 py-1 shrink-0">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-secondary-bronze hover:text-primary-gold text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-dark-surface">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 text-secondary-bronze hover:text-primary-gold text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => addToCart(product, quantity)}
                  className={`${buttons.primary} w-full sm:w-auto py-3 px-8 text-sm flex items-center justify-center space-x-2`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`${buttons.secondary} p-3 rounded-full shrink-0 border-primary-gold/15 text-secondary-bronze hover:text-error-red`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-error-red text-error-red border-none" : ""}`} />
                </button>
              </div>
            )}

            {/* Safe Shop Badges */}
            <div className="bg-white/40 border border-primary-gold/5 rounded-2xl p-4 flex justify-around text-center text-[10px] font-semibold text-secondary-bronze/70">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-primary-gold mb-1" />
                <span>100% Authentic</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-5 h-5 text-primary-gold mb-1" />
                <span>Altar Offered</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-5 h-5 text-primary-gold mb-1" />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab System: Specs & Reviews */}
        <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 md:p-8 mb-16 shadow-sm">
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
              Devotee Reviews ({productReviews.length})
            </button>
          </div>

          {/* Specs Content */}
          {activeTab === "specs" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex justify-between p-3 border-b border-primary-gold/5 text-sm">
                  <span className="text-secondary-bronze/60 font-semibold">{key}</span>
                  <span className="text-dark-surface font-bold">{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reviews Content */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {productReviews.length === 0 ? (
                <div className="text-center py-6 text-secondary-bronze/60 text-xs">
                  No reviews submitted yet for this product. Be the first to leave a review!
                </div>
              ) : (
                productReviews.map((rev) => (
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
                      <span className="text-xs text-secondary-bronze/50">{rev.date}</span>
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
                        src={p.images[0]}
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
