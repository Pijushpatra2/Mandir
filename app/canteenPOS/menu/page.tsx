"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function MenuPage() {
  const {
    menu,
    setMenu,
    setShowAddMenuModal,
    saveState
  } = useCanteen();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Menu Items lists table (8 cols) */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Canteen Food Menu Catalog</h3>
            <p className="text-[11px] text-gray-400">Add, edit, or adjust pricing of canteen items</p>
          </div>
          <button
            onClick={() => setShowAddMenuModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Food Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans text-left">
            <thead>
              <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px] pb-2.5">
                <th className="pb-2.5">Item Name</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Variety</th>
                <th className="pb-2.5">Price</th>
                <th className="pb-2.5 text-center">Availability</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {menu.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 font-bold text-gray-800">{m.name}</td>
                  <td className="py-2.5 text-gray-500 font-semibold">{m.category}</td>
                  <td className="py-2.5">
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.variety === "Jain" ? "bg-green-50 text-green-700 border border-green-200" :
                      m.variety === "Spicy" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                      m.variety === "Sweet" ? "bg-pink-50 text-pink-700 border border-pink-200" :
                      "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}>
                      {m.variety}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-blue-600">UGX {m.price}</td>
                  <td className="py-2.5 text-center">
                    <button
                      onClick={() => {
                        const updated = menu.map(item => item.id === m.id ? { ...item, available: !item.available } : item);
                        setMenu(updated);
                        saveState("canteen_menu", updated);
                      }}
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-colors border cursor-pointer ${
                        m.available 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {m.available ? "In Stock" : "Out of Stock"}
                    </button>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${m.name} from menu?`)) {
                          const updated = menu.filter(item => item.id !== m.id);
                          setMenu(updated);
                          saveState("canteen_menu", updated);
                        }
                      }}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
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
            <span className="text-[8px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase font-bold">2 active</span>
          </h3>
          <div className="space-y-3">
            {menu.filter(m => m.category === "Combos").map(c => (
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
            <span className="text-[8px] bg-green-50 text-green-600 px-2 py-0.5 rounded uppercase font-bold">2 active</span>
          </h3>
          <div className="space-y-3">
            {menu.filter(m => m.category === "Add-ons").map(a => (
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
