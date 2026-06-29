"use client";

import React, { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockCategories } from "@/data/categories";
import { mockProducts } from "@/data/products";
import { useApp } from "@/lib/context";
import { layout, cards, typography, buttons, badges } from "@/lib/design-system";
import { ArrowLeft, ShoppingCart, Heart, Star, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { addToCart, toggleWishlist, wishlist } = useApp();

  const category = mockCategories.find((c) => c.slug === slug);
  const products = mockProducts.filter((p) => p.categoryId === category?.id);

  if (!category) {
    return (
      <div className="bg-bg-warm min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className={`${typography.h2} text-dark-surface mb-2`}>Category Not Found</h1>
        <p className="text-secondary-bronze/70 mb-6">The category you are looking for does not exist.</p>
        <Link href="/categories" className={buttons.primary}>
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className={`bg-bg-warm min-h-screen ${layout.sectionPadding}`}>
      <div className={layout.container}>
        {/* Breadcrumbs / Back button */}
        <Link
          href="/categories"
          className="inline-flex items-center text-xs font-semibold text-secondary-bronze hover:text-primary-gold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Categories</span>
        </Link>

        {/* Category Header */}
        <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 md:p-8 mb-12 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between">
          <div className="relative z-10 max-w-2xl">
            <span className="text-primary-gold font-semibold tracking-widest text-xs uppercase block mb-1">
              Devotional Collection
            </span>
            <h1 className={`${typography.h1} text-dark-surface mb-2`}>{category.name}</h1>
            <p className="text-secondary-bronze/70 text-sm leading-relaxed">{category.description}</p>
          </div>
          <div className="mt-6 md:mt-0 relative z-10 shrink-0">
            <span className={badges.gold}>{products.length} products found</span>
          </div>
          {/* Subtle design element */}
          <div className="absolute right-0 bottom-0 text-primary-gold/5 translate-y-6 translate-x-6 select-none pointer-events-none text-9xl">
            🕉️
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white border border-primary-gold/5 rounded-3xl p-8">
            <Sparkles className="w-12 h-12 text-primary-gold/30 mx-auto mb-4" />
            <h3 className={`${typography.h3} text-dark-surface mb-1`}>No Products Yet</h3>
            <p className="text-secondary-bronze/70 mb-6 text-sm">We are currently sourcing fresh items for this collection.</p>
            <Link href="/shop" className={buttons.primary}>
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className={layout.gridCols4}>
            {products.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              return (
                <div
                  key={product.id}
                  className={`${cards.white} flex flex-col h-full overflow-hidden group hover:shadow-md hover:border-primary-gold/20 transition-all duration-300 relative`}
                >
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                    {product.isFeatured && (
                      <span className="bg-primary-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Featured
                      </span>
                    )}
                    {product.isNew && (
                      <span className="bg-accent-purple text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        New
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm text-secondary-bronze hover:text-error-red hover:bg-white transition-all cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-error-red text-error-red" : ""}`} />
                  </button>

                  {/* Image container */}
                  <Link href={`/shop/${product.slug}`} className="relative h-48 w-full overflow-hidden rounded-2xl bg-primary-gold/5 mb-4 block">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 250px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-grow flex flex-col">
                    <div className="flex items-center text-xs text-warning-amber mb-2">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="ml-1 font-semibold">{product.rating}</span>
                      <span className="text-secondary-bronze/50 ml-1">({product.reviewsCount})</span>
                    </div>

                    <Link href={`/shop/${product.slug}`} className="hover:text-primary-gold transition-colors block">
                      <h3 className={`${typography.h5} font-semibold text-dark-surface line-clamp-1 mb-1.5`}>
                        {product.name}
                      </h3>
                    </Link>

                    <p className={`${typography.bodySm} text-secondary-bronze/70 line-clamp-2 mb-4 flex-grow`}>
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-primary-gold/10">
                      <span className="text-lg font-bold text-dark-surface">
                        {formatCurrency(product.price)}
                      </span>
                      <button
                        onClick={() => addToCart(product, 1)}
                        disabled={product.stock === 0}
                        className={`${buttons.primary} px-3.5 py-2 text-xs flex items-center space-x-1.5 disabled:bg-neutral-gray`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{product.stock === 0 ? "Out of Stock" : "Add"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
