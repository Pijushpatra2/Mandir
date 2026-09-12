"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { mockCategories } from "@/data/categories";
import { mockProducts } from "@/data/products";
import { useApp } from "@/lib/context";
import { useShopProducts, useShopCategories } from "@/lib/api/shop";
import { layout, cards, typography, buttons, inputs, badges } from "@/lib/design-system";
import { Search, SlidersHorizontal, Star, ShoppingCart, Heart, RefreshCw, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600";

export default function ShopPage() {
  const { addToCart, toggleWishlist, wishlist } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState(15000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch e-commerce visible products and categories from real database API
  const { data: dbProducts = [], isLoading } = useShopProducts();
  const { data: dbCategories = [] } = useShopCategories();

  // Map database items with fallback to mockProducts if DB is loading/empty
  const products = useMemo(() => {
    if (dbProducts && dbProducts.length > 0) {
      return dbProducts;
    }
    return mockProducts;
  }, [dbProducts]);

  // Dynamically construct combined categories list with correct product counts
  const categoriesList = useMemo(() => {
    const list: Array<{ id: string; name: string; slug: string; description?: string; image?: string; imageUrl?: string; count?: number }> =
      dbCategories.length > 0 ? [...dbCategories] : [...mockCategories];

    products.forEach((p) => {
      const exists = list.find((c) => c.id === p.categoryId || c.slug === p.categoryId);
      if (!exists && p.categoryId) {
        list.push({
          id: p.categoryId,
          name: p.categoryId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          slug: p.categoryId,
          description: `Sacred ${p.categoryId} offerings.`,
          image: p.images?.[0] || DEFAULT_PRODUCT_IMAGE,
          imageUrl: p.images?.[0] || DEFAULT_PRODUCT_IMAGE,
          count: 0,
        });
      }
    });

    return list.map((cat) => {
      const count = products.filter((p) => p.categoryId === cat.id || p.categoryId === cat.slug).length;
      return { ...cat, count, image: cat.image || cat.imageUrl || DEFAULT_PRODUCT_IMAGE };
    });
  }, [dbCategories, products]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange(15000);
    setMinRating(0);
    setSortBy("featured");
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
        const matchesPrice = product.price <= priceRange;
        const matchesRating = product.rating >= minRating;

        return matchesSearch && matchesCategory && matchesPrice && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "newest") return (("isNew" in b && b.isNew ? 1 : 0) - ("isNew" in a && a.isNew ? 1 : 0));
        return (("isFeatured" in b && b.isFeatured ? 1 : 0) - ("isFeatured" in a && a.isFeatured ? 1 : 0)); // Featured default
      });
  }, [products, searchQuery, selectedCategory, priceRange, minRating, sortBy]);

  return (
    <div className={`bg-bg-warm min-h-screen ${layout.sectionPadding} font-poppins`}>
      <div className={layout.container}>
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary-gold font-semibold tracking-widest text-xs sm:text-sm uppercase block mb-2 font-poppins">
            Shree Swaminarayan Temple Store
          </span>
          <h1 className={`${typography.h1} text-dark-surface`}>Divine Temple Shop</h1>
          <p className="text-secondary-bronze/80 mt-2 text-base sm:text-lg font-normal font-poppins">
            Adorn your home shrine and elevate your spiritual practice with authentic, high-quality temple offerings.
          </p>
        </div>

        {/* Search Bar & Mobile Filter Trigger */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
            <input
              type="text"
              placeholder="Search sacred idols, incense, books, or prasadam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputs.text} pl-11 text-sm sm:text-base font-poppins`}
            />
          </div>
          <div className="flex gap-3 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`${inputs.select} min-w-[170px] text-sm sm:text-base font-poppins`}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`${buttons.secondary} md:hidden flex items-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold font-poppins`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Filters (Desktop) */}
          <aside className={`w-full md:w-64 shrink-0 bg-white border border-primary-gold/15 rounded-3xl p-6 shadow-sm sticky top-24 ${showMobileFilters ? "block" : "hidden md:block"}`}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary-gold/10">
              <h3 className={`${typography.h5} text-dark-surface font-semibold flex items-center space-x-2 font-poppins`}>
                <SlidersHorizontal className="w-4.5 h-4.5 text-primary-gold" />
                <span>Filters</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs sm:text-sm font-semibold text-primary-gold hover:text-secondary-bronze transition-colors flex items-center space-x-1 font-poppins"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-xs sm:text-sm font-semibold text-secondary-bronze/80 mb-2 uppercase tracking-wider font-poppins">Category</label>
              <div className="space-y-1.5 mt-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all font-poppins ${
                    selectedCategory === "all"
                      ? "bg-primary-gold text-white"
                      : "text-secondary-bronze/70 hover:bg-primary-gold/5"
                  }`}
                >
                  All Categories
                </button>
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between font-poppins ${
                      selectedCategory === cat.id
                        ? "bg-primary-gold text-white"
                        : "text-secondary-bronze/70 hover:bg-primary-gold/5"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs sm:text-sm px-2 py-0.5 rounded-full font-poppins ${selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-primary-gold/10 text-secondary-bronze"}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs sm:text-sm font-semibold text-secondary-bronze/80 uppercase tracking-wider font-poppins">Max Price</label>
                <span className="text-sm sm:text-base font-bold text-primary-gold font-poppins">
                  {formatCurrency(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="15000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-primary-gold cursor-pointer"
              />
              <div className="flex justify-between text-xs sm:text-sm text-secondary-bronze/60 mt-1 font-poppins">
                <span>UGX 100</span>
                <span>UGX 15,000</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-secondary-bronze/80 mb-2 uppercase tracking-wider font-poppins">Minimum Rating</label>
              <div className="flex items-center space-x-1.5 mt-2">
                {[0, 3, 4, 4.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setMinRating(rate)}
                    className={`flex-grow text-center py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all font-poppins ${
                      minRating === rate
                        ? "border-primary-gold bg-primary-gold/10 text-primary-gold"
                        : "border-primary-gold/10 hover:border-primary-gold/30 text-secondary-bronze/60"
                    }`}
                  >
                    {rate === 0 ? "All" : `${rate}★`}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-grow w-full">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm sm:text-base text-secondary-bronze/80 font-poppins">
                Showing <span className="font-bold text-dark-surface">{filteredProducts.length}</span> of{" "}
                <span className="font-bold">{mockProducts.length}</span> products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white border border-primary-gold/10 rounded-3xl p-8">
                <SlidersHorizontal className="w-12 h-12 text-primary-gold/35 mx-auto mb-4" />
                <h3 className={`${typography.h3} text-dark-surface mb-1 font-heading`}>No Products Match</h3>
                <p className="text-secondary-bronze/75 text-base sm:text-lg mb-6 font-poppins">Try adjusting your filters or search keywords.</p>
                <button onClick={resetFilters} className={`${buttons.primary} text-sm sm:text-base font-semibold font-poppins`}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className={`${cards.white} flex flex-col h-full overflow-hidden group hover:shadow-md hover:border-primary-gold/20 transition-all duration-300 relative`}
                    >
                      {/* Badges */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                        {product.isFeatured && (
                          <span className="bg-primary-gold text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm font-poppins">
                            Featured
                          </span>
                        )}
                        {product.isNew && (
                          <span className="bg-accent-purple text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm font-poppins">
                            New
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/85 backdrop-blur-md shadow-sm text-secondary-bronze hover:text-error-red hover:bg-white transition-all cursor-pointer"
                      >
                        <Heart className={`w-4.5 h-4.5 ${isWishlisted ? "fill-error-red text-error-red" : ""}`} />
                      </button>

                      {/* Image container */}
                      <Link href={`/shop/${product.slug}`} className="relative h-52 w-full overflow-hidden rounded-2xl bg-primary-gold/5 mb-4 block">
                        <Image
                          src={product.images?.[0] || DEFAULT_PRODUCT_IMAGE}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 250px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-grow flex flex-col">
                        <div className="flex items-center text-xs sm:text-sm text-warning-amber mb-2 font-poppins">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="ml-1 font-semibold">{product.rating}</span>
                          <span className="text-secondary-bronze/60 ml-1">({product.reviewsCount})</span>
                        </div>

                        <Link href={`/shop/${product.slug}`} className="hover:text-primary-gold transition-colors block">
                          <h3 className="font-heading text-lg sm:text-xl font-semibold text-dark-surface line-clamp-1 mb-1.5">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-sm sm:text-base text-secondary-bronze/80 font-poppins line-clamp-2 mb-4 flex-grow">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-primary-gold/10">
                          <span className="text-lg sm:text-xl font-bold text-dark-surface font-poppins">
                            {formatCurrency(product.price)}
                          </span>
                          <button
                            onClick={() => addToCart(product, 1)}
                            disabled={product.stock === 0}
                            className={`${buttons.primary} px-4 py-2 text-sm sm:text-base font-semibold flex items-center space-x-1.5 disabled:bg-neutral-gray font-poppins`}
                          >
                            <ShoppingCart className="w-4 h-4" />
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
      </div>
    </div>
  );
}
