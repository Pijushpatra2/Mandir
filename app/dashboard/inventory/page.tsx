"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Search, Plus, Archive, Coins, ShieldCheck, X, AlertTriangle, RefreshCw, ShoppingBag, Box } from "lucide-react";
import { mockProducts, Product } from "@/data/products";
import { mockCategories } from "@/data/categories";
import { layout, cards, typography, buttons, inputs } from "@/lib/design-system";

export default function InventoryDashboardPage() {
  const [activeTab, setActiveTab] = useState<"assets" | "store">("assets");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Physical Assets State
  const [inventory, setInventory] = useState([
    { id: "inv-1", name: "Gold Crown for Radhe Krishna Deities", category: "Gold", quantity: 2, value: 850000, location: "Main Shrine Vault", custodian: "Head Priest Shastri" },
    { id: "inv-2", name: "Silver Abhishek Plates & Kalash", category: "Silver", quantity: 12, value: 240000, location: "Pooja Altar Store", custodian: "Assistant Priest Shastri" },
    { id: "inv-3", name: "Temple Marriage Hall Furniture Set", category: "Furniture", quantity: 300, value: 450000, location: "Radhe Krishna Hall Store", custodian: "Booking Mgr Goel" },
    { id: "inv-4", name: "Sound System & Acoustics Set", category: "Electronics", quantity: 4, value: 180000, location: "Auditorium Control Room", custodian: "Content Mgr Sen" }
  ]);

  // E-Commerce Products State
  const [storeProducts, setStoreProducts] = useState<Product[]>(mockProducts);

  // Form State for Physical Asset
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Gold");
  const [quantity, setQuantity] = useState(1);
  const [value, setValue] = useState(10000);
  const [location, setLocation] = useState("Vault");
  const [custodian, setCustodian] = useState("Head Priest");

  // Filtering based on tab
  const filteredInv = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStoreProducts = storeProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total Gold/Silver values
  const totalValue = inventory.reduce((acc, curr) => acc + (curr.value * curr.quantity), 0);

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !value) return;

    const newAsset = {
      id: "inv-dash-" + Math.random().toString(36).substr(2, 9),
      name,
      category,
      quantity,
      value,
      location,
      custodian
    };

    setInventory((prev) => [...prev, newAsset]);
    setShowAddForm(false);
    setName("");
    setQuantity(1);
    setValue(10000);
  };

  // Restock e-commerce item simulation
  const handleRestockProduct = (productId: string) => {
    setStoreProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + 50 } : p))
    );
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Temple Inventory Center
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Audit gold/silver ornaments, physical assets, or monitor online e-commerce stock alert levels.
          </p>
        </div>

        {activeTab === "assets" && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Physical Asset</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-primary-gold/15 pb-2 gap-6">
        <button
          onClick={() => { setActiveTab("assets"); setSearchQuery(""); }}
          className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "assets"
              ? "border-primary-gold text-primary-gold"
              : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Physical Temple Assets ({inventory.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab("store"); setSearchQuery(""); }}
          className={`pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
            activeTab === "store"
              ? "border-primary-gold text-primary-gold"
              : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>E-Commerce Product Stock ({storeProducts.length})</span>
        </button>
      </div>

      {/* 1. PHYSICAL ASSETS TAB CONTENT */}
      {activeTab === "assets" && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                    Total Asset Audit Valuation
                  </p>
                  <h3 className="text-2xl font-bold text-dark-surface font-heading">
                    {formatCurrency(totalValue)}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                    Gold Reserves Value
                  </p>
                  <h3 className="text-2xl font-bold text-dark-surface font-heading">
                    {formatCurrency(
                      inventory
                        .filter((i) => i.category === "Gold")
                        .reduce((acc, curr) => acc + curr.value * curr.quantity, 0)
                    )}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
                  <Archive className="w-5 h-5" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                    Custodian Checks
                  </p>
                  <h3 className="text-2xl font-bold text-dark-surface font-heading">Secure</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Search bar */}
          <div className="flex gap-4 bg-white p-4 rounded-2xl border border-primary-gold/10">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets by description..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Assets Table */}
          <div className="overflow-x-auto bg-white rounded-3xl border border-primary-gold/15 shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Asset Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Vault Location</th>
                  <th className="px-6 py-4">Custodian</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4 text-right">Unit Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/10">
                {filteredInv.map((item) => (
                  <tr className="hover:bg-bg-warm/50 transition-colors" key={item.id}>
                    <td className="px-6 py-4 font-semibold text-dark-surface">{item.name}</td>
                    <td className="px-6 py-4 font-medium text-secondary-bronze">{item.category}</td>
                    <td className="px-6 py-4 text-secondary-bronze/70">{item.location}</td>
                    <td className="px-6 py-4 text-secondary-bronze/75">{item.custodian}</td>
                    <td className="px-6 py-4 text-right font-bold text-dark-surface">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary-gold">
                      {formatCurrency(item.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 2. E-COMMERCE PRODUCTS TAB CONTENT */}
      {activeTab === "store" && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                    Store Products Monitored
                  </p>
                  <h3 className="text-2xl font-bold text-dark-surface font-heading">
                    {storeProducts.length} items
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                    Critical Out of Stock
                  </p>
                  <h3 className="text-2xl font-bold text-error-red font-heading">
                    {storeProducts.filter((p) => p.stock === 0).length} items
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-error-red/10 flex items-center justify-center text-error-red">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                    Low Stock Warnings
                  </p>
                  <h3 className="text-2xl font-bold text-warning-amber font-heading">
                    {storeProducts.filter((p) => p.stock > 0 && p.stock <= 5).length} items
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-warning-amber/10 flex items-center justify-center text-warning-amber">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Search bar */}
          <div className="flex gap-4 bg-white p-4 rounded-2xl border border-primary-gold/10">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* E-Commerce Alerts Table */}
          <div className="overflow-x-auto bg-white rounded-3xl border border-primary-gold/15 shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Retail Price</th>
                  <th className="px-6 py-4 text-center">Current Stock</th>
                  <th className="px-6 py-4">Alert Level</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/10">
                {filteredStoreProducts.map((p) => {
                  const isLow = p.stock <= 5;
                  const isCritical = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isCritical ? "bg-red-500/5 hover:bg-red-500/10" : isLow ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-bg-warm/50"
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-dark-surface">{p.name}</td>
                      <td className="px-6 py-4 text-secondary-bronze/85">
                        {mockCategories.find((c) => c.id === p.categoryId)?.name || p.categoryId}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary-gold">{formatCurrency(p.price)}</td>
                      <td className="px-6 py-4 text-center font-bold text-dark-surface">{p.stock} units</td>
                      <td className="px-6 py-4">
                        {isCritical ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-error-red/10 text-error-red border border-error-red/20">
                            Critical Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-amber/10 text-warning-amber border border-warning-amber/20">
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-green/10 text-success-green border border-success-green/20">
                            Healthy Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleRestockProduct(p.id)}
                          className="px-3 py-1 rounded-lg border border-primary-gold/30 text-secondary-bronze hover:bg-primary-gold/10 text-[10px] font-bold flex items-center space-x-1 cursor-pointer ml-auto"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Simulate Restock (+50)</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Register Physical Asset Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative overflow-hidden">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                  Administrative Registers
                </span>
                <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                  Register Asset Audit
                </h3>
              </div>

              <form onSubmit={handleAddAsset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                    Asset Name / Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Silver Aarti plates"
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    >
                      <option>Gold</option>
                      <option>Silver</option>
                      <option>Property</option>
                      <option>Furniture</option>
                      <option>Electronics</option>
                      <option>Utensils</option>
                      <option>Document</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Audit Valuation (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Location Vault *
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Main Vault"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                    Custodian priest / manager *
                  </label>
                  <input
                    type="text"
                    required
                    value={custodian}
                    onChange={(e) => setCustodian(e.target.value)}
                    placeholder="e.g. Head Priest Shastri"
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Record Physical Asset
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
