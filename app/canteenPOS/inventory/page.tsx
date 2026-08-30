"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Utensils,
  Search,
  RefreshCw,
  FileSpreadsheet,
  X,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import {
  useInventory,
  useLowStock,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useAddInventoryToMenu,
  useLogWaste,
  CanteenInventoryItem,
} from "@/lib/api/canteen/useInventory";
import { exportTableToExcel } from "@/lib/exportExcel";
import { formatCurrency } from "@/lib/utils";

export default function InventoryPage() {
  const { data: inventory = [], isLoading, refetch } = useInventory();
  const { data: lowStockAlerts = [] } = useLowStock();

  const createItemMutation = useCreateInventoryItem();
  const updateItemMutation = useUpdateInventoryItem();
  const deleteItemMutation = useDeleteInventoryItem();
  const addToMenuMutation = useAddInventoryToMenu();
  const logWasteMutation = useLogWaste();

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddToMenuModal, setShowAddToMenuModal] = useState(false);
  const [showWasteModal, setShowWasteModal] = useState(false);

  // Active Item
  const [selectedItem, setSelectedItem] = useState<CanteenInventoryItem | null>(null);

  // Add Item Form State
  const [addForm, setAddForm] = useState<{
    name: string;
    category: "Grains" | "Dairy" | "Spices" | "Beverages" | "Vegetables" | "Other" | "Prasad" | "Snacks";
    stock: number;
    unit: string;
    minStock: number;
    unitCost: number;
    addToMenu: boolean;
    menuPrice: number;
    menuCategory: string;
    menuVariety: "Regular" | "Jain" | "Spicy" | "Sweet";
  }>({
    name: "",
    category: "Grains",
    stock: 10,
    unit: "kg",
    minStock: 5,
    unitCost: 1500,
    addToMenu: false,
    menuPrice: 3000,
    menuCategory: "Prasad & Snacks",
    menuVariety: "Regular",
  });

  // Edit Item Form State
  const [editForm, setEditForm] = useState<{
    name: string;
    category: "Grains" | "Dairy" | "Spices" | "Beverages" | "Vegetables" | "Other" | "Prasad" | "Snacks";
    stock: number;
    unit: string;
    minStock: number;
    unitCost: number;
  }>({
    name: "",
    category: "Grains",
    stock: 0,
    unit: "kg",
    minStock: 5,
    unitCost: 0,
  });

  // Add to Menu Form State
  const [menuForm, setMenuForm] = useState<{
    price: number;
    category: string;
    variety: "Regular" | "Jain" | "Spicy" | "Sweet";
    description: string;
  }>({
    price: 3000,
    category: "Prasad & Snacks",
    variety: "Regular",
    description: "",
  });

  // Waste Log Form State
  const [wasteForm, setWasteForm] = useState<{
    itemName: string;
    quantity: number;
    unit: string;
    estimatedCost: number;
    reason: string;
  }>({
    itemName: "",
    quantity: 1,
    unit: "kg",
    estimatedCost: 2000,
    reason: "Spoilage / Expired batch",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered inventory list
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategoryFilter === "ALL" || item.category.toUpperCase() === selectedCategoryFilter.toUpperCase();
    return matchesSearch && matchesCat;
  });

  // Analytics totals
  const totalStockItems = inventory.length;
  const totalValuation = inventory.reduce(
    (sum, it) => sum + Number(it.stock || 0) * Number(it.unit_cost || 0),
    0
  );
  const lowStockCount = inventory.filter((it) => Number(it.stock) <= Number(it.min_stock)).length;

  // Handle Add Item Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      alert("Please enter item name.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createItemMutation.mutateAsync({
        name: addForm.name.trim(),
        category: addForm.category,
        stock: Number(addForm.stock || 0),
        unit: addForm.unit.trim() || "kg",
        minStock: Number(addForm.minStock || 0),
        unitCost: Number(addForm.unitCost || 0),
        addToMenu: addForm.addToMenu,
        menuPrice: Number(addForm.menuPrice || 0),
        menuCategory: addForm.menuCategory,
      });

      setShowAddModal(false);
      setAddForm({
        name: "",
        category: "Grains",
        stock: 10,
        unit: "kg",
        minStock: 5,
        unitCost: 1500,
        addToMenu: false,
        menuPrice: 3000,
        menuCategory: "Prasad & Snacks",
        menuVariety: "Regular",
      });
      alert("Stock item added successfully!" + (addForm.addToMenu ? " (Also published to Canteen Menu)" : ""));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create inventory item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item: CanteenInventoryItem) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name,
      category: item.category as any,
      stock: Number(item.stock),
      unit: item.unit,
      minStock: Number(item.min_stock),
      unitCost: Number(item.unit_cost || 0),
    });
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await updateItemMutation.mutateAsync({
        id: selectedItem.id,
        updates: {
          name: editForm.name.trim(),
          category: editForm.category,
          stock: Number(editForm.stock),
          unit: editForm.unit.trim(),
          minStock: Number(editForm.minStock),
          unitCost: Number(editForm.unitCost),
        },
      });

      setShowEditModal(false);
      setSelectedItem(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update inventory item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (item: CanteenInventoryItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}" from the stock ledger?`)) {
      try {
        await deleteItemMutation.mutateAsync(item.id);
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to delete item");
      }
    }
  };

  // Open Add to Menu Modal
  const handleOpenAddToMenu = (item: CanteenInventoryItem) => {
    setSelectedItem(item);
    setMenuForm({
      price: Math.max(1000, Number(item.unit_cost || 0) * 1.5 || 2500),
      category: item.category === "Beverages" ? "Beverages" : "Prasad & Snacks",
      variety: "Regular",
      description: `Freshly prepared ${item.name} from Canteen inventory.`,
    });
    setShowAddToMenuModal(true);
  };

  // Handle Add to Menu Submit
  const handleAddToMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await addToMenuMutation.mutateAsync({
        inventoryId: selectedItem.id,
        price: Number(menuForm.price),
        category: menuForm.category,
        variety: menuForm.variety,
        description: menuForm.description,
      });

      setShowAddToMenuModal(false);
      setSelectedItem(null);
      alert(`"${selectedItem.name}" has been published to Canteen Menu successfully!`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add item to canteen menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Log Waste Modal
  const handleOpenWasteModal = (item?: CanteenInventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setWasteForm({
        itemName: item.name,
        quantity: 1,
        unit: item.unit,
        estimatedCost: Number(item.unit_cost || 0),
        reason: "Spoilage / Batch Expired",
      });
    } else {
      setSelectedItem(null);
      setWasteForm({
        itemName: "",
        quantity: 1,
        unit: "kg",
        estimatedCost: 1500,
        reason: "Kitchen Spoilage",
      });
    }
    setShowWasteModal(true);
  };

  // Handle Waste Submit
  const handleWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteForm.itemName.trim() || wasteForm.quantity <= 0) {
      alert("Please enter valid item name and wastage quantity.");
      return;
    }

    setIsSubmitting(true);
    try {
      await logWasteMutation.mutateAsync({
        inventory_id: selectedItem ? selectedItem.id : null,
        itemName: wasteForm.itemName.trim(),
        quantity: Number(wasteForm.quantity),
        unit: wasteForm.unit,
        estimated_cost: Number(wasteForm.estimatedCost || 0),
        reason: wasteForm.reason.trim(),
      });

      setShowWasteModal(false);
      setSelectedItem(null);
      alert("Wastage loss logged and deducted from stock ledger.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to log waste loss");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Stock Ledger to Excel
  const handleExportStockExcel = () => {
    const exportData = inventory.map((it) => ({
      "Item ID": it.id,
      "Raw Item Name": it.name,
      "Category": it.category,
      "Current Stock Level": Number(it.stock),
      "Measurement Unit": it.unit,
      "Safety Alert Threshold": Number(it.min_stock),
      "Unit Cost (UGX)": Number(it.unit_cost || 0),
      "Total Inventory Value (UGX)": Number(it.stock) * Number(it.unit_cost || 0),
      "Status": Number(it.stock) <= Number(it.min_stock) ? "LOW STOCK WARNING" : "OPTIMAL",
    }));

    exportTableToExcel(exportData, "Canteen Stock Ledger", "Canteen_Stock_Ledger");
  };

  return (
    <div className="space-y-7 font-sans text-left max-w-[1600px] mx-auto pb-12">
      {/* ─── Top Main Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Package className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                Canteen Stock Ledger
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                Live raw materials inventory, dynamic stock thresholds, and canteen menu publishing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={() => refetch()}
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl flex items-center gap-2 border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-98"
            title="Refresh Stock Data"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportStockExcel}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center gap-2 border-none shadow-md shadow-emerald-100 transition-all cursor-pointer active:scale-98"
            title="Export to Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => handleOpenWasteModal()}
            className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm rounded-2xl flex items-center gap-2 border border-red-200 transition-all cursor-pointer active:scale-98"
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Log Waste</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl flex items-center gap-2 border-none shadow-lg shadow-blue-200 transition-all cursor-pointer hover:shadow-xl active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* ─── Metric KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Raw Material Items</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {totalStockItems}
            </h3>
            <p className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tracked in Canteen Storage</span>
            </p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
            <Layers className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Inventory Value</p>
            <h3 className="text-3xl font-bold text-emerald-600 tracking-tight font-mono">
              {formatCurrency(totalValuation)}
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Warehouse Valuation at Cost
            </p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Low Stock Alerts</p>
            <h3 className={`text-3xl font-bold tracking-tight font-mono ${lowStockCount > 0 ? "text-red-600" : "text-slate-900"}`}>
              {lowStockCount} Items
            </h3>
            <p className={`text-xs font-bold ${lowStockCount > 0 ? "text-red-500" : "text-slate-400"}`}>
              {lowStockCount > 0 ? "⚠️ Below safety threshold — Reorder required" : "All item stock levels optimal"}
            </p>
          </div>
          <div className={`p-4 rounded-3xl ${lowStockCount > 0 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* ─── Main Stock Ledger Table Section ────────────────────────────── */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Category Pills & Search Input */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 items-center">
            {["ALL", "Grains", "Dairy", "Spices", "Beverages", "Vegetables", "Prasad", "Snacks", "Other"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategoryFilter.toUpperCase() === cat.toUpperCase()
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {cat === "ALL" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search raw materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm bg-slate-50/70 outline-none focus:bg-white focus:border-blue-500 text-slate-800 font-medium transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-semibold">Loading stock ledger from database...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No inventory items found. Click <span className="font-bold text-blue-600">"Add Stock Item"</span> above to create your first item.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs tracking-wider pb-4">
                  <th className="pb-4 pl-3">Raw Material Item</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4">Current Stock</th>
                  <th className="pb-4">Min Safety Alert</th>
                  <th className="pb-4">Unit Cost (UGX)</th>
                  <th className="pb-4">Total Value</th>
                  <th className="pb-4 text-right pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isLow = Number(item.stock) <= Number(item.min_stock);
                  const itemValue = Number(item.stock || 0) * Number(item.unit_cost || 0);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isLow ? "bg-red-50/20" : ""
                      }`}
                    >
                      <td className="py-4 pl-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-base">{item.name}</p>
                          {isLow ? (
                            <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md uppercase inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-600" /> Low Stock Warning
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-semibold inline-block">
                              Optimal Balance
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-sm text-slate-600">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className={`py-4 font-bold text-base font-mono ${isLow ? "text-red-600" : "text-slate-900"}`}>
                        {item.stock} <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-500 font-mono">
                        {item.min_stock} <span className="text-xs text-slate-400">{item.unit}</span>
                      </td>
                      <td className="py-4 font-bold text-sm text-slate-800 font-mono">
                        {item.unit_cost ? `UGX ${Number(item.unit_cost).toLocaleString()}` : "—"}
                      </td>
                      <td className="py-4 font-bold text-sm text-slate-900 font-mono">
                        {formatCurrency(itemValue)}
                      </td>
                      <td className="py-4 text-right pr-3 space-x-2 whitespace-nowrap">
                        {/* Add to Canteen Menu Button */}
                        <button
                          onClick={() => handleOpenAddToMenu(item)}
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                          title="Add this item to Canteen Food Menu"
                        >
                          <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Add to Menu</span>
                        </button>

                        {/* Modify / Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition-all border border-blue-200 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                          title="Edit Stock Item"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Modify</span>
                        </button>

                        {/* Log Waste Button */}
                        <button
                          onClick={() => handleOpenWasteModal(item)}
                          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition-all border border-amber-200 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                          title="Log Spoilage Loss"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Waste</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-200 cursor-pointer shadow-xs"
                          title="Delete from Stock Ledger"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* ─── MODAL 1: ADD NEW STOCK ITEM ─────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl p-7 relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Add Raw Material / Stock Item
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Register new kitchen ingredient or packaged item in the stock ledger
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 border-none bg-transparent cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure Desi Cow Ghee / Basmati Rice / Samosa"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e: any) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  >
                    <option value="Grains">Grains & Pulses</option>
                    <option value="Dairy">Dairy & Milk</option>
                    <option value="Spices">Spices & Oils</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Prasad">Prasad & Sweets</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Other">Other Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Measurement Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kg, Litre, g, pcs, pack"
                    value={addForm.unit}
                    onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={addForm.stock}
                    onChange={(e) => setAddForm({ ...addForm, stock: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-sm font-mono outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Min Safety Alert
                  </label>
                  <input
                    type="number"
                    value={addForm.minStock}
                    onChange={(e) => setAddForm({ ...addForm, minStock: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-sm font-mono outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Unit Cost (UGX)
                  </label>
                  <input
                    type="number"
                    value={addForm.unitCost}
                    onChange={(e) => setAddForm({ ...addForm, unitCost: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-sm font-mono outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    min={0}
                  />
                </div>
              </div>

              {/* Option to also publish to Canteen Menu */}
              <div className="p-5 bg-emerald-50/70 rounded-3xl border border-emerald-200 space-y-3.5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.addToMenu}
                    onChange={(e) => setAddForm({ ...addForm, addToMenu: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded-md cursor-pointer focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-emerald-950 text-sm block">
                      Also publish directly to Canteen Food Menu
                    </span>
                    <span className="text-xs text-emerald-700 font-medium">
                      Item will be immediately available on POS counter screens
                    </span>
                  </div>
                </label>

                {addForm.addToMenu && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-emerald-200">
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                        Selling Menu Price (UGX)
                      </label>
                      <input
                        type="number"
                        value={addForm.menuPrice}
                        onChange={(e) => setAddForm({ ...addForm, menuPrice: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-emerald-300 rounded-xl bg-white text-slate-900 font-bold text-sm font-mono"
                        min={0}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                        Menu Category
                      </label>
                      <input
                        type="text"
                        value={addForm.menuCategory}
                        onChange={(e) => setAddForm({ ...addForm, menuCategory: e.target.value })}
                        className="w-full px-4 py-2.5 border border-emerald-300 rounded-xl bg-white text-slate-900 font-bold text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl border-none bg-transparent cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isSubmitting ? "Saving to Database..." : "Save Stock Item"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: EDIT STOCK ITEM ─────────────────────────────────────── */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl p-7 relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Modify Stock Item: {selectedItem.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Update inventory levels, measurement unit, or unit cost
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 border-none bg-transparent cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e: any) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  >
                    <option value="Grains">Grains & Pulses</option>
                    <option value="Dairy">Dairy & Milk</option>
                    <option value="Spices">Spices & Oils</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Prasad">Prasad & Sweets</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Other">Other Goods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Measurement Unit
                  </label>
                  <input
                    type="text"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-sm font-mono outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Min Safety Alert
                  </label>
                  <input
                    type="number"
                    value={editForm.minStock}
                    onChange={(e) => setEditForm({ ...editForm, minStock: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-sm font-mono outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    min={0}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Unit Cost (UGX)
                  </label>
                  <input
                    type="number"
                    value={editForm.unitCost}
                    onChange={(e) => setEditForm({ ...editForm, unitCost: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-sm font-mono outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    min={0}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl border-none bg-transparent cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isSubmitting ? "Updating Database..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: PUBLISH TO CANTEEN MENU ────────────────────────────── */}
      {showAddToMenuModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl p-7 relative space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Publish to Canteen Menu
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Add "{selectedItem.name}" directly to the POS Food Catalog
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddToMenuModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 border-none bg-transparent cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddToMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Selling Menu Price (UGX)
                </label>
                <input
                  type="number"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-base font-mono outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                  min={0}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Menu Category
                  </label>
                  <input
                    type="text"
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                    placeholder="e.g. Prasad & Snacks"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Dietary Variety
                  </label>
                  <select
                    value={menuForm.variety}
                    onChange={(e: any) => setMenuForm({ ...menuForm, variety: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                  >
                    <option value="Regular">Regular Sattvik</option>
                    <option value="Jain">Jain (No Root Veg)</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Sweet">Sweet Prasadam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Dish Description
                </label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-medium text-sm outline-none focus:bg-white focus:border-emerald-500 h-20 resize-none transition-colors"
                  placeholder="Optional item notes..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddToMenuModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl border-none bg-transparent cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-100 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isSubmitting ? "Publishing to Menu..." : "Publish to Canteen Menu"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: LOG WASTE LOSS ─────────────────────────────────────── */}
      {showWasteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl p-7 relative space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Log Spoilage & Food Waste
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Record damaged, expired, or spilled stock and deduct from ledger
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWasteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 border-none bg-transparent cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleWasteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  value={wasteForm.itemName}
                  onChange={(e) => setWasteForm({ ...wasteForm, itemName: e.target.value })}
                  placeholder="e.g. Spoiled Milk Batch / Burnt Khichdi"
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-red-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Wasted Quantity
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={wasteForm.quantity}
                    onChange={(e) => setWasteForm({ ...wasteForm, quantity: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-sm font-mono outline-none focus:bg-white focus:border-red-500 transition-colors"
                    min={0.1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Measurement Unit
                  </label>
                  <input
                    type="text"
                    value={wasteForm.unit}
                    onChange={(e) => setWasteForm({ ...wasteForm, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-red-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Estimated Cost Impact (UGX)
                </label>
                <input
                  type="number"
                  value={wasteForm.estimatedCost}
                  onChange={(e) => setWasteForm({ ...wasteForm, estimatedCost: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-bold text-sm font-mono outline-none focus:bg-white focus:border-red-500 transition-colors"
                  min={0}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Reason for Waste
                </label>
                <select
                  value={wasteForm.reason}
                  onChange={(e) => setWasteForm({ ...wasteForm, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-red-500 transition-colors"
                >
                  <option value="Spoilage / Expired batch">Spoilage / Expired batch</option>
                  <option value="Cooking / Burnt Loss">Cooking / Burnt Loss</option>
                  <option value="Spilled / Physical Damage">Spilled / Physical Damage</option>
                  <option value="Unsold End-of-Day Food">Unsold End-of-Day Food</option>
                  <option value="Quality Rejection">Quality Rejection</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWasteModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl border-none bg-transparent cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-100 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{isSubmitting ? "Logging Spoilage..." : "Record Waste Loss"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
