"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function TablesPage() {
  const {
    tables,
    setTables,
    setShowAddTableModal,
    handleUpdateTableStatus,
    saveState
  } = useCanteen();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Visual layouts & stats (8 cols) */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-50 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Tables Layout Coordinator</h3>
            <p className="text-[11px] text-gray-400">Total capacity: {tables.reduce((sum, t) => sum + t.capacity, 0)} devotees</p>
          </div>
          <button
            onClick={() => setShowAddTableModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {tables.map((t) => (
            <div key={t.id} className="border border-gray-100 p-4 rounded-2xl bg-white shadow-sm flex flex-col justify-between h-40">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800 text-xs">{t.name}</h4>
                  <p className="text-[10px] text-gray-400">{t.capacity} Seating Capacity</p>
                </div>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  t.status === "AVAILABLE" ? "bg-green-50 text-green-700" :
                  t.status === "OCCUPIED" ? "bg-red-50 text-red-700" :
                  t.status === "RESERVED" ? "bg-amber-50 text-amber-700" :
                  "bg-blue-50 text-blue-700"
                }`}>
                  {t.status}
                </span>
              </div>

              <div className="text-xs text-gray-600 font-semibold my-2">
                {t.status === "OCCUPIED" ? (
                  <div>
                    <p className="text-[10px] text-gray-400 font-normal">Current Bill: <b className="text-red-500 font-bold">₹{t.currentBill}</b></p>
                    <p className="text-[10px] text-gray-400 font-normal">Active Since: <b className="text-gray-800 font-bold">{t.occupiedDuration}</b></p>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-300 italic">No bill details</p>
                )}
              </div>

              <div className="flex justify-between items-center border-t border-gray-55 pt-2 text-[9px] font-bold">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleUpdateTableStatus(t.id, "AVAILABLE")}
                    className="text-green-600 hover:underline border-none bg-none p-0 cursor-pointer"
                  >
                    Free
                  </button>
                  <button
                    onClick={() => handleUpdateTableStatus(t.id, "OCCUPIED")}
                    className="text-red-600 hover:underline border-none bg-none p-0 cursor-pointer"
                  >
                    Occupy
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove ${t.name}?`)) {
                      const updated = tables.filter((item) => item.id !== t.id);
                      setTables(updated);
                      saveState("canteen_tables", updated);
                    }
                  }}
                  className="text-gray-300 hover:text-red-500 transition-colors border-none bg-none cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel Actions: Merge, Split, Analytics (4 cols) */}
      <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
          Operations & Analytics
        </h3>

        {/* Merge tables simulation */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Merge Seating Tables</span>
          <div className="grid grid-cols-2 gap-2 text-xs font-sans text-gray-600">
            <select className="p-2 border border-gray-100 rounded-xl bg-gray-50 outline-none cursor-pointer" id="merge-tbl-1">
              <option value="">Select Table A</option>
              {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="p-2 border border-gray-100 rounded-xl bg-gray-50 outline-none cursor-pointer" id="merge-tbl-2">
              <option value="">Select Table B</option>
              {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button
            onClick={() => {
              const el1 = document.getElementById("merge-tbl-1") as HTMLSelectElement;
              const el2 = document.getElementById("merge-tbl-2") as HTMLSelectElement;
              if (!el1.value || !el2.value || el1.value === el2.value) {
                alert("Please select two different tables to merge.");
                return;
              }
              const name1 = tables.find(t => t.id === el1.value)?.name;
              const name2 = tables.find(t => t.id === el2.value)?.name;
              alert(`Tables ${name1} and ${name2} merged successfully! Seating capacity updated to 10 guests.`);
            }}
            className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-xs hover:bg-blue-100 transition-colors border-none cursor-pointer"
          >
            Combine Tables
          </button>
        </div>

        {/* Analytics block */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Table Analytics</span>
          
          <div className="space-y-3 text-xs font-sans text-gray-500">
            <div className="flex justify-between">
              <span>Peak Occupancy Time:</span>
              <span className="font-bold text-gray-800">12:30 PM - 02:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Occupied Time:</span>
              <span className="font-bold text-gray-800">38 mins</span>
            </div>
            <div className="flex justify-between">
              <span>Table Turn Ratio:</span>
              <span className="font-bold text-gray-800">4.2 times/table today</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>CURRENT FLOOR UTILIZATION</span>
                <span className="text-blue-600">37.5%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "37.5%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
