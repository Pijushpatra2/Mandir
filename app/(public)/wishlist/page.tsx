"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context";
import { mockProducts } from "@/data/products";
import { layout, cards, typography, buttons, badges } from "@/lib/design-system";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useApp();

  const wishlistedItems = mockProducts.filter((p) => wishlist.includes(p.id));

  if (wishlistedItems.length === 0) {
    return (
      <div className="bg-bg-warm min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-error-red/10 rounded-full mb-4">
          <Heart className="w-12 h-12 text-error-red" />
        </div>
        <h1 className={`${typography.h2} text-dark-surface mb-2`}>Your Wishlist is Empty</h1>
        <p className="text-secondary-bronze/70 mb-6 max-w-sm text-sm">
          Bookmark sacred idols, incense, and spiritual books to keep them close.
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
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-primary-gold/10">
          <h1 className={`${typography.h1} text-dark-surface`}>Your Wishlist</h1>
          <span className={badges.gold}>{wishlistedItems.length} items saved</span>
        </div>

        <div className={layout.gridCols4}>
          {wishlistedItems.map((product) => (
            <div
              key={product.id}
              className={`${cards.white} flex flex-col h-full overflow-hidden group hover:shadow-md hover:border-primary-gold/20 transition-all duration-300 relative`}
            >
              {/* Remove from wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm text-error-red hover:bg-white transition-all cursor-pointer"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Product Image */}
              <Link href={`/shop/${product.slug}`} className="relative h-44 w-full overflow-hidden rounded-2xl bg-primary-gold/5 mb-4 block">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </Link>

              {/* Product Info */}
              <div className="flex-grow flex flex-col">
                <div className="flex items-center text-xs text-warning-amber mb-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 font-semibold">{product.rating}</span>
                </div>

                <Link href={`/shop/${product.slug}`} className="hover:text-primary-gold transition-colors block">
                  <h3 className="font-semibold text-dark-surface line-clamp-1 mb-1.5 text-sm">
                    {product.name}
                  </h3>
                </Link>

                <p className={`${typography.bodySm} text-secondary-bronze/70 line-clamp-2 mb-4 flex-grow`}>
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-primary-gold/10">
                  <span className="text-sm font-bold text-dark-surface">
                    {formatCurrency(product.price)}
                  </span>
                  <button
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock === 0}
                    className={`${buttons.primary} px-3 py-1.5 text-xs flex items-center space-x-1 disabled:bg-neutral-gray`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>{product.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
