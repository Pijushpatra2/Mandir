"use client";

import React from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";
import { useDeleteMenuItem } from "@/lib/api/canteen";

export default function MenuPage() {
  const {
    menu,
    setMenu,
    setShowAddMenuModal,
    setShowAddCategoryModal,
    saveState
  } = useCanteen();

  const { mutate: deleteMenuItem, isPending: isDeleting } = useDeleteMenuItem();

  // Exclude any soft-deleted items (name starts with '[Deleted]') from display.
  // These exist only to preserve order-history FK integrity and should never
  // be visible in the management UI.
  const visibleMenu = menu.filter(
    (m) => !m.name.startsWith("[Deleted]")
  );

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}" from menu?`)) return;

    deleteMenuItem(id, {
      onSuccess: (result) => {
        // Remove from local context state immediately for instant UI feedback
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
                  {/* Item Name + Avatar */}
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[9px] font-black text-orange-500 shrink-0">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
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
                      {/* Edit (placeholder — can wire to edit modal) */}
                      <button
                        className="text-gray-300 hover:text-blue-500 transition-colors p-1 border-none bg-transparent cursor-pointer"
                        title="Edit item"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        disabled={isDeleting}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1 border-none bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                  <td colSpan={6} className="py-10 text-center text-gray-300 text-xs font-semibold">
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
    </div>
  );
}
