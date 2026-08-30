"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  useShopProducts,
  useShopCategories,
  useAddShopProduct,
  useUpdateShopProduct,
  useDeleteShopProduct,
  ShopProduct,
} from "@/lib/api/shop";
import { layout, cards, typography, buttons, inputs, badges } from "@/lib/design-system";
import { Search, Plus, Edit2, Trash2, X, Star, AlertTriangle, CheckCircle, BarChart2, Upload, Loader2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Helper to convert File to base64 data url for preview and server upload
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600";

export default function DashboardProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Fetch real products & categories from backend database
  const { data: products = [], isLoading, refetch } = useShopProducts();
  const { data: categories = [] } = useShopCategories();
  const addProductMutation = useAddShopProduct();
  const updateProductMutation = useUpdateShopProduct();
  const deleteProductMutation = useDeleteShopProduct();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ShopProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
    description: string;
  }>({
    name: "",
    price: 0,
    stock: 50,
    categoryId: "cat-idols",
    images: [],
    description: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const base64List = await Promise.all(filesArray.map(fileToBase64));
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...base64List] }));
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    const updatedImages = [...formData.images];
    const [selected] = updatedImages.splice(index, 1);
    updatedImages.unshift(selected);
    setFormData({ ...formData, images: updatedImages });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Filtered Products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat =
      selectedCategoryFilter === "all" ||
      prod.categoryId === selectedCategoryFilter ||
      (prod.categoryId && prod.categoryId.toLowerCase() === selectedCategoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  // Calculate stats for charts
  const categoryCounts = categories.map((cat) => {
    const count = products.filter((p) => p.categoryId === cat.id || p.categoryId === cat.slug).length;
    return { name: cat.name, count };
  });

  const maxCount = Math.max(...categoryCounts.map((c) => c.count), 1);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Product name is required.";
    if (formData.price <= 0) errors.price = "Price must be greater than zero.";
    if (formData.stock < 0) errors.stock = "Stock cannot be negative.";
    if (formData.images.length === 0) errors.images = "At least one image is required.";
    if (!formData.description.trim()) errors.description = "Description is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      price: 0,
      stock: 50,
      categoryId: categories[0]?.id || "cat-idols",
      images: [],
      description: "",
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleOpenEdit = (product: ShopProduct) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      images: product.images || [],
      description: product.description || "",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await addProductMutation.mutateAsync({
          name: formData.name.trim(),
          price: Number(formData.price),
          stock: Number(formData.stock),
          categoryId: formData.categoryId,
          description: formData.description.trim(),
          images: formData.images,
        });
        setShowAddModal(false);
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to add product to database");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct && validateForm()) {
      setIsSubmitting(true);
      try {
        await updateProductMutation.mutateAsync({
          id: currentProduct.id,
          updates: {
            name: formData.name.trim(),
            price: Number(formData.price),
            stock: Number(formData.stock),
            categoryId: formData.categoryId,
            description: formData.description.trim(),
            images: formData.images,
          },
        });
        setShowEditModal(false);
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to update product in database");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProductMutation.mutateAsync(productId);
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to delete product");
      }
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>Shop Products Manager</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Manage the temple e-commerce catalog, upload multi-images, set primary thumbnails, and sync directly with database.
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
            onClick={handleOpenAdd}
            className={`${buttons.primary} px-5 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Statistics Widgets */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${cards.glass} p-5 flex flex-col justify-between`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60">
              Total Products Listed
            </span>
            <div className="flex items-baseline space-x-2 mt-4">
              <span className="text-3xl font-bold text-dark-surface font-heading">{products.length}</span>
              <span className="text-xs text-success-green font-semibold">Active Database</span>
            </div>
          </div>

          <div className={`${cards.glass} p-5 flex flex-col justify-between`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60">
              Low Stock Warnings
            </span>
            <div className="flex items-baseline space-x-2 mt-4">
              <span className="text-3xl font-bold text-error-red font-heading">
                {products.filter((p) => (p.stock || 0) <= 5).length}
              </span>
              <span className="text-xs text-secondary-bronze/50">(&lt; 5 units left)</span>
            </div>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-primary-gold/10 rounded-3xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-secondary-bronze/70 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-primary-gold" />
            <span>Product Distribution by Category</span>
          </h3>

          <div className="space-y-2">
            {categoryCounts.slice(0, 4).map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-secondary-bronze">
                  <span>{c.name}</span>
                  <span>{c.count} items</span>
                </div>
                <div className="w-full bg-neutral-gray/30 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary-gold h-2 rounded-full"
                    style={{ width: `${(c.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm">
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
            <input
              type="text"
              placeholder="Search database catalog by name or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputs.text} pl-10 py-2 text-xs`}
            />
          </div>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className={`${inputs.select} min-w-[180px] py-2 text-xs`}
          >
            <option value="all">All Categories Filter</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading database products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-secondary-bronze/60 text-xs">
              No products found in catalog. Add a new product above.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Image</th>
                  <th className="pb-3 pr-4">Product Name</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Stock</th>
                  <th className="pb-3 pr-4">Rating</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {filteredProducts.map((prod) => {
                  const catObj = categories.find((c) => c.id === prod.categoryId || c.slug === prod.categoryId);
                  const displayImg = (prod.images && prod.images.length > 0 && prod.images[0]) ? prod.images[0] : DEFAULT_PRODUCT_IMAGE;
                  return (
                    <tr key={prod.id} className="hover:bg-bg-warm/10 group">
                      <td className="py-3.5 pr-4">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-primary-gold/15 p-0.5 bg-bg-warm/20 shrink-0">
                          <img
                            src={displayImg}
                            alt={prod.name}
                            className="object-cover w-full h-full rounded-md"
                          />
                          {prod.images && prod.images.length > 1 && (
                            <span className="absolute bottom-0 right-0 bg-dark-surface/80 text-white text-[7px] px-1 rounded-tl">
                              +{prod.images.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-bold text-dark-surface">
                        <span className="line-clamp-1">{prod.name}</span>
                      </td>
                      <td className="py-3.5 pr-4 text-secondary-bronze/85">
                        {catObj?.name || prod.categoryId}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-dark-surface">
                        {formatCurrency(prod.price)}
                      </td>
                      <td className="py-3.5 pr-4">
                        {prod.stock <= 5 ? (
                          <span className="inline-flex items-center text-error-red font-semibold space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{prod.stock} left (Low)</span>
                          </span>
                        ) : (
                          <span className="text-secondary-bronze/70 font-semibold">{prod.stock} units</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center text-warning-amber">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="ml-1 font-semibold text-dark-surface">{prod.rating || 5.0}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1.5 rounded-lg border border-primary-gold/10 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold transition-colors cursor-pointer"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg border border-error-red/10 text-error-red hover:bg-error-red/15 transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Product Modal Drawer */}
      {showAddModal && (
        <div className="fixed inset-0 bg-dark-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-primary-gold/10">
              <h3 className={`${typography.h4} text-dark-surface font-semibold`}>Add New Catalog Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-secondary-bronze/60 hover:text-dark-surface cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className={inputs.label}>Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputs.text}
                  placeholder="e.g. Handcrafted Brass Pooja Bell"
                />
                {formErrors.name && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={inputs.label}>Price (INR / UGX)</label>
                  <input
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className={inputs.text}
                    placeholder="0"
                  />
                  {formErrors.price && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.price}</p>}
                </div>

                <div>
                  <label className={inputs.label}>Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className={inputs.text}
                    placeholder="50"
                  />
                  {formErrors.stock && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.stock}</p>}
                </div>
              </div>

              <div>
                <label className={inputs.label}>Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className={inputs.select}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={inputs.label}>Upload Product Images</label>
                <div className="flex items-center space-x-2 mt-1">
                  <label className={`${buttons.secondary} py-2 px-4 text-xs cursor-pointer flex items-center gap-1.5`}>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Images</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className={`relative w-16 h-16 rounded-lg border overflow-hidden group ${idx === 0 ? "border-primary-gold ring-2 ring-primary-gold/20" : "border-neutral-gray"}`}>
                        <img src={img} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1">
                          {idx !== 0 && (
                            <button type="button" onClick={() => handleSetPrimaryImage(idx)} className="text-[8px] bg-white text-dark-surface px-1.5 rounded uppercase font-bold cursor-pointer" title="Set Primary">
                              Primary
                            </button>
                          )}
                          <button type="button" onClick={() => handleRemoveImage(idx)} className="text-white hover:text-error-red p-0.5 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-0 left-0 bg-primary-gold text-white text-[8px] px-1 font-bold rounded-br">1st</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {formErrors.images && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.images}</p>}
              </div>

              <div>
                <label className={inputs.label}>Product Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputs.text} h-24 resize-none`}
                  placeholder="Enter detailed description of the devotional item..."
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
                  <span>{isSubmitting ? "Saving to DB..." : "Save Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal Drawer */}
      {showEditModal && (
        <div className="fixed inset-0 bg-dark-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-primary-gold/10">
              <h3 className={`${typography.h4} text-dark-surface font-semibold`}>Edit Product Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-secondary-bronze/60 hover:text-dark-surface cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className={inputs.label}>Product Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputs.text}
                />
                {formErrors.name && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={inputs.label}>Price (INR / UGX)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className={inputs.text}
                  />
                  {formErrors.price && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.price}</p>}
                </div>

                <div>
                  <label className={inputs.label}>Current Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className={inputs.text}
                  />
                  {formErrors.stock && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.stock}</p>}
                </div>
              </div>

              <div>
                <label className={inputs.label}>Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className={inputs.select}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={inputs.label}>Upload Product Images</label>
                <div className="flex items-center space-x-2 mt-1">
                  <label className={`${buttons.secondary} py-2 px-4 text-xs cursor-pointer flex items-center gap-1.5`}>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Images</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className={`relative w-16 h-16 rounded-lg border overflow-hidden group ${idx === 0 ? "border-primary-gold ring-2 ring-primary-gold/20" : "border-neutral-gray"}`}>
                        <img src={img} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1">
                          {idx !== 0 && (
                            <button type="button" onClick={() => handleSetPrimaryImage(idx)} className="text-[8px] bg-white text-dark-surface px-1.5 rounded uppercase font-bold cursor-pointer" title="Set Primary">
                              Primary
                            </button>
                          )}
                          <button type="button" onClick={() => handleRemoveImage(idx)} className="text-white hover:text-error-red p-0.5 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-0 left-0 bg-primary-gold text-white text-[8px] px-1 font-bold rounded-br">1st</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {formErrors.images && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.images}</p>}
              </div>

              <div>
                <label className={inputs.label}>Product Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${inputs.text} h-24 resize-none`}
                />
                {formErrors.description && <p className="text-[10px] text-error-red font-semibold mt-1">{formErrors.description}</p>}
              </div>

              <div className="pt-4 border-t border-primary-gold/10 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className={`${buttons.secondary} py-2 px-4 text-xs cursor-pointer`}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className={`${buttons.primary} py-2 px-6 text-xs flex items-center space-x-1.5 cursor-pointer`}>
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? "Updating DB..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
