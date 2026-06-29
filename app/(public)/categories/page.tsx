"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { mockCategories } from "@/data/categories";
import { layout, cards, typography, buttons } from "@/lib/design-system";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className={`bg-bg-warm min-h-screen ${layout.sectionPadding}`}>
      <div className={layout.container}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-primary-gold font-semibold tracking-widest text-xs uppercase block mb-2">
              Browse Collections
            </span>
            <h1 className={`${typography.h1} text-dark-surface`}>
              Sacred Categories
            </h1>
            <p className="text-secondary-bronze/70 mt-2 max-w-xl text-sm">
              Discover authentic deities, pure puja kits, spiritual literature, and sacred items curated for your daily devotion.
            </p>
          </div>
          <Link href="/shop" className={`${buttons.primary} mt-4 md:mt-0 flex items-center space-x-2 text-xs`}>
            <ShoppingBag className="w-4 h-4" />
            <span>View All Products</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`${cards.whiteHover} flex flex-col h-full overflow-hidden group`}
            >
              <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-4 bg-primary-gold/5">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex-grow flex flex-col">
                <h3 className={`${typography.h4} text-dark-surface mb-2 flex items-center justify-between`}>
                  <span>{category.name}</span>
                  <span className="text-xs text-primary-gold bg-primary-gold/10 px-2 py-0.5 rounded-full">
                    {category.count} items
                  </span>
                </h3>
                <p className={`${typography.bodySm} text-secondary-bronze/70 flex-grow mb-4`}>
                  {category.description}
                </p>
                <div className="flex items-center text-xs font-semibold text-primary-gold mt-auto group-hover:text-secondary-bronze transition-colors">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
