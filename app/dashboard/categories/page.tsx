"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useShopCategories, useAddShopCategory, ShopCategory } from "@/lib/api/shop";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, inputs } from "@/lib/design-system";
import { Plus, Edit2, Trash2, X, Loader2, RefreshCw } from "lucide-react";

const DEFAULT_CAT_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600";

export default function DashboardCategoriesPage() {
  const { data: categories = [], isLoading, refetch } = useShopCategories();
  const addCategoryMutation = useAddShopCategory();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Category name is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await addCategoryMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description.trim(),
          imageUrl: formData.image.trim() || DEFAULT_CAT_IMAGE,
        });
        setShowAddModal(false);
        setFormData({ name: "", description: "", image: "" });
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to create category");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>Shop Categories</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Manage product classifications and categories stored directly in the database.
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
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
          <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
          <p className="text-xs">Loading categories from database...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-primary-gold/10 rounded-3xl p-12 text-center text-secondary-bronze/60 text-xs shadow-sm">
          No categories found in database. Click "Add New Category" above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className={`${cards.white} flex flex-col h-full relative overflow-hidden group`}>
              <div className="relative h-40 w-full overflow-hidden rounded-2xl mb-4 bg-primary-gold/5">
                <Image
                  src={cat.imageUrl || DEFAULT_CAT_IMAGE}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <h3 className="font-bold text-dark-surface text-base mb-1.5 flex justify-between items-center">
                <span>{cat.name}</span>
                <span className="text-[10px] bg-primary-gold/15 text-secondary-bronze px-2 py-0.5 rounded-full font-bold">
                  {cat.count ?? 0} items
                </span>
              </h3>
              <p className="text-secondary-bronze/70 text-xs leading-relaxed flex-grow">{cat.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-dark-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-primary-gold/10">
              <h3 className={`${typography.h4} text-dark-surface font-semibold`}>Add Category</h3>
              <button onClick={() => setShowAddModal(false)} className="text-secondary-bronze/60 hover:text-dark-surface cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className={inputs.label}>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Silver Puja Items"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputs.text}
                />
                {formErrors.name && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className={inputs.label}>Description</label>
                <textarea
                  placeholder="e.g. Handcrafted pure silver aarti thali, diyas, and samagri..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputs.text} h-20 resize-none`}
                />
                {formErrors.description && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label className={inputs.label}>Banner Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className={inputs.text}
                />
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
                  <span>{isSubmitting ? "Creating..." : "Save Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
