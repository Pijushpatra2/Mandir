"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function BookingsPage() {
  const {
    bookings,
    setShowBookingModal,
    handleSeatBooking,
    handleCancelBooking
  } = useCanteen();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[500px]">
      {/* Reservations Timeline Grid (8 cols) */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center border-b border-gray-55 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Reservations Coordinator</h3>
              <p className="text-[11px] text-gray-400">Scheduled calendar bookings log</p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 border-none cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Reservation
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans text-left">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 uppercase font-bold text-[9px] pb-2.5">
                  <th className="pb-2.5">Customer details</th>
                  <th className="pb-2.5">Table No</th>
                  <th className="pb-2.5">Date & Time</th>
                  <th className="pb-2.5">Party Size</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 font-semibold">
                      <p className="text-gray-800 font-bold">{b.customerName}</p>
                      <span className="text-[10px] text-gray-400">{b.customerPhone}</span>
                    </td>
                    <td className="py-3 font-bold text-gray-600">{b.tableName}</td>
                    <td className="py-3 text-gray-500 font-semibold">{b.date} • {b.time}</td>
                    <td className="py-3 font-bold text-gray-700">{b.partySize} guests</td>
                    <td className="py-3">
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        b.status === "SEATED" ? "bg-green-50 text-green-700" :
                        b.status === "CANCELLED" ? "bg-red-50 text-red-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {b.status === "CONFIRMED" && (
                        <>
                          <button
                            onClick={() => handleSeatBooking(b.id)}
                            className="px-2 py-1 text-[9px] font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors border-none cursor-pointer"
                          >
                            Seat
                          </button>
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-2 py-1 text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors border-none cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-gray-50 pt-4 mt-6 text-[10px] text-gray-400 italic">
          * Note: Reservations will hold tables automatically 30 minutes prior to booking slot.
        </div>
      </div>

      {/* Booking slot calendar list representation (4 cols) */}
      <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-50 pb-2">
          Schedule Overview
        </h3>

        <div className="space-y-3.5">
          {["11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"].map((tSlot) => {
            const matched = bookings.filter((b) => b.time.includes(tSlot.split(":")[0]) && b.status === "CONFIRMED");
            return (
              <div key={tSlot} className="flex justify-between items-center text-xs font-sans p-2 border border-gray-50 rounded-xl bg-gray-50/50">
                <span className="font-bold text-gray-600">{tSlot}</span>
                {matched.length > 0 ? (
                  <div className="text-right">
                    <span className="font-bold text-amber-600 block text-[10px]">{matched[0].customerName}</span>
                    <span className="text-[9px] text-gray-400">{matched[0].tableName} • {matched[0].partySize} guests</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-300 italic">No bookings</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
