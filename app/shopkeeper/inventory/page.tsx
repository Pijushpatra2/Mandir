"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  useShopProducts,
  useShopCategories,
  useUpdateShopProduct,
  ShopProduct
} from "@/lib/api/shop";
import {
  Boxes,
  Search,
  RefreshCw,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  X,
  Loader2,
  Tag,
  Store,
  DollarSign
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

export default function ShopkeeperInventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_STOCK">("ALL");

  const { data: products = [], isLoading: loadingProducts, refetch: refetchProducts } = useShopProducts();
  const { data: categories = [] } = useShopCategories();
  const updateProductMutation = useUpdateShopProduct();

  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);
  const [editPriceValue, setEditPriceValue] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || p.categoryId === selectedCategory;

    let matchesStock = true;
    if (stockFilter === "LOW_STOCK") matchesStock = p.stock > 0 && p.stock < 5;
    else if (stockFilter === "OUT_OF_STOCK") matchesStock = p.stock === 0;
    else if (stockFilter === "IN_STOCK") matchesStock = p.stock > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleQuickAdjust = async (product: ShopProduct, change: number) => {
    const newStock = Math.max(0, product.stock + change);
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        updates: { stock: newStock },
      });
      setToastMessage(`Updated stock for "${product.name}" to ${newStock} units`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to adjust stock");
    }
  };

  const handleOpenEdit = (product: ShopProduct) => {
    setSelectedProduct(product);
    setEditStockValue(product.stock);
    setEditPriceValue(product.price);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsUpdating(true);
      await updateProductMutation.mutateAsync({
        id: selectedProduct.id,
        updates: {
          stock: Number(editStockValue),
          price: Number(editPriceValue),
        },
      });
      setToastMessage(`Stock & price updated for "${selectedProduct.name}"!`);
      setSelectedProduct(null);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update product details");
    } finally {
      setIsUpdating(false);
    }
  };

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-8 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface">
            Store Inventory & Stock Management
          </h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Monitor product availability, adjust store counters, and restock temple books & devotional items.
          </p>
        </div>

        <button
          onClick={() => refetchProducts()}
          className="px-3.5 py-2 rounded-xl border border-primary-gold/25 bg-white hover:bg-bg-warm text-xs font-semibold text-secondary-bronze flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary-gold" />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Floating Success Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-success-green/15 border border-success-green/30 text-success-green text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white border border-primary-gold/15 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
            <input
              type="text"
              placeholder="Search products by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/30 focus:border-primary-gold focus:outline-none text-xs text-dark-surface"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/40 text-xs font-semibold text-secondary-bronze focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Level Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/40 text-xs font-semibold text-secondary-bronze focus:outline-none"
            >
              <option value="ALL">All Stock Levels ({products.length})</option>
              <option value="IN_STOCK">In Stock (&gt; 0)</option>
              <option value="LOW_STOCK">Low Stock (&lt; 5) - {lowStockCount} items</option>
              <option value="OUT_OF_STOCK">Out of Stock (0) - {outOfStockCount} items</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          {loadingProducts ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading inventory catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-secondary-bronze/60 text-xs space-y-3">
              <Boxes className="w-8 h-8 text-primary-gold/30 mx-auto" />
              <p>No products found matching your search filter.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price (UGX)</th>
                  <th className="pb-3 text-center">Stock Level</th>
                  <th className="pb-3 text-center">Quick Adjust</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {filteredProducts.map((product) => {
                  const isLow = product.stock > 0 && product.stock < 5;
                  const isOut = product.stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-bg-warm/25 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-xl bg-bg-warm border border-primary-gold/20 overflow-hidden flex items-center justify-center shrink-0">
                            {product.images && product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Store className="w-5 h-5 text-primary-gold/40" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-dark-surface text-sm">{product.name}</p>
                            <p className="text-[10px] text-secondary-bronze/70 font-mono">
                              SKU: {product.slug || product.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 text-secondary-bronze font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-bg-warm border border-primary-gold/15 text-[11px]">
                          {categories.find((c) => c.id === product.categoryId)?.name || "General Item"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 font-bold text-dark-surface">
                        {formatCurrency(Number(product.price))}
                      </td>

                      {/* Stock Level Badge */}
                      <td className="py-4 text-center">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1",
                            isOut
                              ? "bg-error-red/10 text-error-red border border-error-red/25"
                              : isLow
                              ? "bg-warning-amber/10 text-warning-amber border border-warning-amber/25"
                              : "bg-success-green/10 text-success-green border border-success-green/25"
                          )}
                        >
                          <span>
                            {product.stock} {product.stock === 1 ? "unit" : "units"}
                          </span>
                        </span>
                      </td>

                      {/* Quick Adjust Buttons */}
                      <td className="py-4 text-center">
                        <div className="inline-flex items-center space-x-1.5 bg-bg-warm/60 border border-primary-gold/20 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product, -1)}
                            disabled={product.stock <= 0}
                            title="Decrease Stock by 1"
                            className="w-6 h-6 rounded-lg bg-white hover:bg-error-red/10 text-secondary-bronze hover:text-error-red flex items-center justify-center font-bold transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 font-mono font-bold text-dark-surface text-center">
                            {product.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(product, +1)}
                            title="Increase Stock by 1"
                            className="w-6 h-6 rounded-lg bg-white hover:bg-success-green/10 text-secondary-bronze hover:text-success-green flex items-center justify-center font-bold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="px-3 py-1.5 rounded-xl border border-primary-gold/25 text-primary-gold hover:bg-primary-gold/10 font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Stock & Price</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================================================================
       * EDIT STOCK & PRICE MODAL
       * ========================================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-dark-surface">
                    Adjust Product Inventory
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">{selectedProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">In-Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStockValue}
                    onChange={(e) => setEditStockValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none text-xs"
                  />
                  <p className="text-[10px] text-secondary-bronze/60">
                    Set total available units at the temple counter.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Unit Price (UGX) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editPriceValue}
                    onChange={(e) => setEditPriceValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none text-xs"
                  />
                  <p className="text-[10px] text-secondary-bronze/60">
                    Current retail price for devotees.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Inventory Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
