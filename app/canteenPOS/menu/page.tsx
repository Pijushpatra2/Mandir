"use client";

import React, { useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";
import { useDeleteMenuItem, useBulkDeleteMenuItems } from "@/lib/api/canteen";
import { FoodItem } from "@/data/canteen";

export default function MenuPage() {
  const {
    menu,
    setMenu,
    setShowAddMenuModal,
    setShowAddCategoryModal,
    categories,
    handleUpdateMenuItem,
    saveState
  } = useCanteen();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [editImage, setEditImage] = useState<string>("");

  const { mutate: deleteMenuItem, isPending: isDeleting } = useDeleteMenuItem();
  const { mutate: bulkDeleteMenuItems } = useBulkDeleteMenuItems();

  // Exclude any soft-deleted items (name starts with '[Deleted]') from display.
  const visibleMenu = menu.filter(
    (m) => !m.name.startsWith("[Deleted]")
  );

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from menu?`)) return;

    deleteMenuItem(id, {
      onSuccess: (result) => {
        const updated = menu.filter((item) => item.id !== id);
        setMenu(updated);
        saveState("canteen_menu", updated);

        if (result?.mode === "soft") {
          alert(
            `"${name}" has been hidden from the POS (it has historical orders and cannot be permanently deleted).`
          );
        }
      },
      onError: () => {
        alert(`Failed to delete "${name}". Please try again.`);
      },
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected menu items?`)) return;

    bulkDeleteMenuItems(selectedIds, {
      onSuccess: () => {
        const updated = menu.filter((item) => !selectedIds.includes(item.id));
        setMenu(updated);
        saveState("canteen_menu", updated);
        setSelectedIds([]);
      },
      onError: () => {
        alert("Failed to delete selected menu items.");
      }
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setEditImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setEditImage(item.image || "");
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    const data = new FormData(e.currentTarget);
    const name = data.get("foodName") as string;
    const price = Number(data.get("foodPrice"));
    const category = data.get("foodCategory") as FoodItem["category"];
    const variety = data.get("foodVariety") as FoodItem["variety"];
    const channel = data.get("foodChannel") as 'canteen' | 'e-com' | 'both';

    if (!name) return;

    handleUpdateMenuItem(editingItem.id, {
      name,
      price,
      category,
      variety,
      channel,
      image_url: editImage || undefined,
    });

    setEditingItem(null);
    setEditImage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Menu Items lists table (8 cols) */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🍽</span> Canteen Food Menu Customization
            </h3>
            <p className="text-[11px] text-gray-400">Add, edit, or adjust pricing of canteen items</p>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 border-none cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 border-none cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
            <button
              onClick={() => setShowAddMenuModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 border-none cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Food Item
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px]">
                <th className="pb-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={visibleMenu.length > 0 && selectedIds.length === visibleMenu.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(visibleMenu.map((f) => f.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="cursor-pointer rounded border-gray-250 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="pb-2.5">Item Details</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Variety</th>
                <th className="pb-2.5">Channel</th>
                <th className="pb-2.5">Price</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleMenu.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(m.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds((prev) => [...prev, m.id]);
                        } else {
                          setSelectedIds((prev) => prev.filter((id) => id !== m.id));
                        }
                      }}
                      className="cursor-pointer rounded border-gray-250 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {/* Item Name + Avatar */}
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      {m.image ? (
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-8 h-8 rounded-lg object-cover border border-gray-100 shadow-sm shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[9px] font-black text-orange-500 shrink-0">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-gray-800">{m.name}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2.5 text-gray-500 font-semibold">{m.category}</td>

                  {/* Variety */}
                  <td className="py-2.5">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.variety === "Jain"  ? "bg-green-50 text-green-700 border border-green-200" :
                      m.variety === "Spicy" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                      m.variety === "Sweet" ? "bg-pink-50 text-pink-700 border border-pink-200" :
                      "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}>
                      {m.variety}
                    </span>
                  </td>

                  {/* Channel */}
                  <td className="py-2.5">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.channel === "e-com" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                      m.channel === "both"  ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {m.channel ?? "Canteen"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 font-bold text-blue-600">
                    UGX {Number(m.price).toFixed(2)}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(m)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50 border-none bg-transparent cursor-pointer"
                        title="Edit item"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 border-none bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleMenu.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-300 text-xs font-semibold">
                    No menu items found. Click &quot;Add Food Item&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Menu Combos & Add-ons configuration (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Combos list card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2 flex justify-between items-center">
            <span>Combo Offers</span>
            <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase font-bold">
              {visibleMenu.filter(m => m.category === "Combos").length} active
            </span>
          </h3>
          <div className="space-y-3">
            {visibleMenu.filter(m => m.category === "Combos").map(c => (
              <div key={c.id} className="flex justify-between items-center text-xs font-sans p-2.5 border border-gray-50 rounded-xl bg-gray-50/50">
                <div>
                  <h5 className="font-bold text-gray-700">{c.name}</h5>
                  <span className="text-[9px] text-gray-400">Regular bundle pricing</span>
                </div>
                <span className="font-bold text-blue-600">UGX {c.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons list card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2 flex justify-between items-center">
            <span>Add-on Toppings</span>
            <span className="text-[8px] bg-green-50 text-green-600 px-2 py-0.5 rounded uppercase font-bold">
              {visibleMenu.filter(m => m.category === "Add-ons").length} active
            </span>
          </h3>
          <div className="space-y-3">
            {visibleMenu.filter(m => m.category === "Add-ons").map(a => (
              <div key={a.id} className="flex justify-between items-center text-xs font-sans p-2.5 border border-gray-50 rounded-xl bg-gray-50/50">
                <div>
                  <h5 className="font-bold text-gray-700">{a.name}</h5>
                  <span className="text-[9px] text-gray-400">Excludes standard GST</span>
                </div>
                <span className="font-bold text-blue-600">+ UGX {a.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT FOOD ITEM MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-100 shadow-2xl relative text-left">
            <button
              onClick={() => {
                setEditingItem(null);
                setEditImage("");
              }}
              className="absolute top-4 right-4 w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-2.5 mb-4">
              Edit Food Item
            </h4>

            <form onSubmit={handleEditSubmit} className="space-y-4 font-sans text-xs text-gray-600">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Food Item Name *</label>
                <input
                  type="text"
                  required
                  name="foodName"
                  defaultValue={editingItem.name}
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Price (UGX) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  defaultValue={editingItem.price}
                  name="foodPrice"
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Category *</label>
                  <select
                    name="foodCategory"
                    required
                    defaultValue={editingItem.category}
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Variety *</label>
                  <select
                    name="foodVariety"
                    required
                    defaultValue={editingItem.variety}
                    className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Jain">Jain</option>
                    <option value="Spicy">Spicy</option>
                    <option value="Sweet">Sweet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Sales Channel *</label>
                <select
                  name="foodChannel"
                  defaultValue={editingItem.channel || "canteen"}
                  className="w-full p-2.5 border border-gray-100 rounded-xl bg-gray-50 outline-none text-gray-700 font-semibold cursor-pointer focus:border-blue-400 focus:bg-white"
                >
                  <option value="canteen">Canteen Only</option>
                  <option value="e-com">E-Commerce Only</option>
                  <option value="both">Both (Canteen & E-Com)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Food Item Photo (S3 Upload)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                  {editImage && (
                    <img src={editImage} alt="Preview" className="w-9 h-9 rounded-lg object-cover border shadow-sm" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setEditImage("");
                  }}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors border-none cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
