"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";
import { useDeleteTable, useBulkDeleteTables } from "@/lib/api/canteen";

export default function TablesPage() {
  const {
    tables,
    setTables,
    setShowAddTableModal,
    handleUpdateTableStatus,
    saveState
  } = useCanteen();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { mutate: deleteTable } = useDeleteTable();
  const { mutate: bulkDeleteTables } = useBulkDeleteTables();

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    deleteTable(id, {
      onSuccess: () => {
        const updated = tables.filter((item) => item.id !== id);
        setTables(updated);
        saveState("canteen_tables", updated);
      },
      onError: () => {
        alert("Failed to delete table.");
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected seating tables?`)) return;

    bulkDeleteTables(selectedIds, {
      onSuccess: () => {
        const updated = tables.filter((t) => !selectedIds.includes(t.id));
        setTables(updated);
        saveState("canteen_tables", updated);
        setSelectedIds([]);
      },
      onError: () => {
        alert("Failed to delete selected tables.");
      }
    });
  };

  return (
    <div className="w-full bg-white p-7 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-gray-50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">Tables Layout Coordinator</h3>
          <p className="text-[13px] text-gray-550">
            Total capacity: <span className="font-bold text-gray-800">{tables.reduce((sum, t) => sum + t.capacity, 0)}</span> devotees
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2.5 bg-red-655 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-100 flex items-center gap-1.5 border-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => setShowAddTableModal(true)}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-100 flex items-center gap-1.5 border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((t) => (
          <div 
            key={t.id} 
            onClick={() => {
              if (selectedIds.includes(t.id)) {
                setSelectedIds((prev) => prev.filter((id) => id !== t.id));
              } else {
                setSelectedIds((prev) => [...prev, t.id]);
              }
            }}
            className={`border p-5 rounded-2xl bg-white shadow-sm flex flex-col justify-between h-48 relative cursor-pointer transition-all ${
              selectedIds.includes(t.id) 
                ? "border-blue-500 ring-2 ring-blue-500/20" 
                : "border-gray-100 hover:border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selectedIds.includes(t.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds((prev) => [...prev, t.id]);
                  } else {
                    setSelectedIds((prev) => prev.filter((id) => id !== t.id));
                  }
                }}
                className="cursor-pointer rounded border-gray-305 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
            </div>

            <div className="flex justify-between items-start pr-6">
              <div>
                <h4 className="font-extrabold text-gray-800 text-[16px]">{t.name}</h4>
                <p className="text-[13px] text-gray-550 font-medium">{t.capacity} Seating Capacity</p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                t.status === "AVAILABLE" ? "bg-green-50 text-green-700 border-green-200" :
                t.status === "OCCUPIED" ? "bg-red-50 text-red-700 border-red-200" :
                t.status === "RESERVED" ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                {t.status}
              </span>
            </div>

            <div className="text-[13px] text-gray-650 font-semibold my-2 space-y-1">
              {t.status === "OCCUPIED" ? (
                <div>
                  <p className="text-[13px] text-gray-500 font-normal">
                    Current Bill: <span className="text-red-650 font-bold">UGX {t.currentBill}</span>
                  </p>
                  <p className="text-[12px] text-gray-400 font-normal">
                    Active Since: <span className="text-gray-800 font-bold">{t.occupiedDuration || "Just now"}</span>
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-gray-450 italic font-medium">No active bill details</p>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-gray-50 pt-3">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateTableStatus(t.id, "AVAILABLE");
                  }}
                  className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold border border-green-200 rounded-xl text-[11px] transition-colors cursor-pointer"
                >
                  Free
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateTableStatus(t.id, "OCCUPIED");
                  }}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 rounded-xl text-[11px] transition-colors cursor-pointer"
                >
                  Occupy
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(t.id, t.name);
                }}
                className="p-1.5 text-gray-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                title="Remove Table"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
