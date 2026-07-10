"use client";

import React from "react";
import {
  TrendingUp,
  ClipboardList,
  Grid,
  Calendar,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight
} from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function DashboardPage() {
  const {
    bookings,
    orders,
    tables,
    currentRole,
    setActiveTab,
    getTodaySales,
    getTodayOrdersCount,
    getActiveTablesCount,
    getUpcomingBookingsCount,
    getAverageOrderValue,
    getInventoryAlertsCount,
    handleUpdateTableStatus,
    setShowBookingModal,
    handleSeatBooking,
    setSelectedOrder
  } = useCanteen();

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.date === today);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Today's Revenue</span>
            <span className="p-1 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mt-2">UGX {getTodaySales().toLocaleString("en-UG")}</h4>
          <p className="text-[10px] text-green-500 mt-1 font-semibold">12% from yesterday</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Orders</span>
            <span className="p-1 bg-blue-50 text-blue-600 rounded-lg">
              <ClipboardList className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mt-2">{getTodayOrdersCount().toLocaleString("en-UG")} Tickets</h4>
          <p className="text-[10px] text-gray-500 mt-1">Cashier speed avg: 2.1m</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Active Tables</span>
            <span className="p-1 bg-red-50 text-red-600 rounded-lg">
              <Grid className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mt-2">
            {getActiveTablesCount()} / {tables.length}
          </h4>
          <p className="text-[10px] text-red-500 mt-1 font-semibold">Peak load: 85%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Reservations</span>
            <span className="p-1 bg-amber-50 text-amber-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mt-2">{getUpcomingBookingsCount()} Booked</h4>
          <p className="text-[10px] text-amber-500 mt-1 font-semibold">
            {bookings.filter((b) => b.status === "CONFIRMED").length} total upcoming
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-400">Average Value</span>
            <span className="p-1 bg-purple-50 text-purple-600 rounded-lg">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mt-2">UGX {getAverageOrderValue().toLocaleString("en-UG")}</h4>
          <p className="text-[10px] text-gray-500 mt-1">Annadan sponsors active</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase font-bold tracking-wider text-red-500">Stock Alerts</span>
            <span className="p-1 bg-red-50 text-red-500 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mt-2">{getInventoryAlertsCount()} Low Items</h4>
          <p className="text-[10px] text-red-500 mt-1 font-semibold">Immediate reorder needed</p>
        </div>
      </div>

      {/* Section 1: Live Table Layout Floor Plan */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Live Table Floor Layout</h3>
            <p className="text-[11px] text-gray-400">Real-time table status updates. Click to configure status.</p>
          </div>
          <div className="flex gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Available
            </span>
            <span className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Occupied
            </span>
            <span className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved
            </span>
            <span className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Cleaning
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {tables.map((table) => {
            const cardBorder =
              table.status === "AVAILABLE" ? "border-green-100 hover:border-green-300" :
              table.status === "OCCUPIED" ? "border-red-100 hover:border-red-300" :
              table.status === "RESERVED" ? "border-amber-100 hover:border-amber-300" :
              "border-blue-100 hover:border-blue-300";

            const badgeColor =
              table.status === "AVAILABLE" ? "bg-green-50 text-green-700" :
              table.status === "OCCUPIED" ? "bg-red-50 text-red-700" :
              table.status === "RESERVED" ? "bg-amber-50 text-amber-700" :
              "bg-blue-50 text-blue-700";

            return (
              <div key={table.id} className={`bg-white border-2 rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between h-44 ${cardBorder}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800 text-base">{table.name}</h4>
                    <span className="text-xs text-gray-400 font-medium">{table.capacity} Seats</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeColor}`}>
                    {table.status}
                  </span>
                </div>

                <div className="my-2.5 text-xs font-semibold text-gray-600">
                  {table.status === "OCCUPIED" ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-normal">Active Bill:</span>
                        <span className="text-red-650 font-bold text-sm">UGX {(Number(table.currentBill) || 0).toLocaleString("en-UG")}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-normal">Duration:</span>
                        <span className="flex items-center gap-1.5 text-gray-700"><Clock className="w-3.5 h-3.5 text-gray-400" /> {table.occupiedDuration}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-xs italic">Table is currently empty</p>
                  )}
                </div>

                <div className="flex gap-2 justify-end border-t border-gray-55 pt-2 text-[10px] font-bold">
                  {table.status !== "AVAILABLE" && (
                    <button
                      onClick={() => handleUpdateTableStatus(table.id, "AVAILABLE")}
                      className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded transition-colors border-none cursor-pointer"
                    >
                      Free
                    </button>
                  )}
                  {table.status === "AVAILABLE" && (
                    <button
                      onClick={() => handleUpdateTableStatus(table.id, "OCCUPIED")}
                      className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors border-none cursor-pointer"
                    >
                      Occupy
                    </button>
                  )}
                  {table.status !== "CLEANING" && (
                    <button
                      onClick={() => handleUpdateTableStatus(table.id, "CLEANING")}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors border-none cursor-pointer"
                    >
                      Clean
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 2: Today's Bookings */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Today's Bookings</h3>
              <p className="text-[10px] text-gray-400">Total {todayBookings.length} bookings scheduled today</p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="p-1 bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100 rounded-lg text-[10px] font-bold px-2 py-1 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Book Table
            </button>
          </div>

          <div className="flex-grow overflow-y-auto pr-1">
            {todayBookings.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-gray-300">
                <Calendar className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-[11px]">No bookings scheduled for today.</p>
              </div>
            ) : (
              <table className="w-full text-xs font-sans text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-gray-400 font-bold uppercase text-[9px] pb-2">
                    <th className="pb-2">Devotee / Contact</th>
                    <th className="pb-2">Details</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {todayBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5">
                        <p className="font-bold text-gray-800">{b.customerName}</p>
                        <span className="text-[10px] text-gray-400">{b.customerPhone}</span>
                      </td>
                      <td className="py-2.5">
                        <p className="font-semibold text-gray-700">{b.tableName}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 font-bold text-gray-500">
                          {b.time} • {b.partySize} Pax
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {b.status === "CONFIRMED" ? (
                          <button
                            onClick={() => handleSeatBooking(b.id)}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-bold transition-all shadow-sm border-none cursor-pointer"
                          >
                            Seat Customer
                          </button>
                        ) : (
                          <span className="text-[9px] uppercase font-bold text-green-500 px-2 py-0.5 bg-green-50 rounded">
                            Seated
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Section 3: Recent Orders */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent Orders</h3>
              <p className="text-[10px] text-gray-400">Showing last 8 active order tickets</p>
            </div>
            <button
              onClick={() => {
                if (currentRole === "kitchen") {
                  setActiveTab("kitchen");
                } else {
                  setActiveTab("pos");
                }
              }}
              className="p-1 bg-blue-50 text-blue-700 border border-blue-200/50 hover:bg-blue-100 rounded-lg text-[10px] font-bold px-2 py-1 transition-all flex items-center gap-1 cursor-pointer"
            >
              Go to POS <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto">
            <table className="w-full text-xs font-sans text-left">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400 font-bold uppercase text-[9px] pb-2">
                  <th className="pb-2">Token / Cust</th>
                  <th className="pb-2">Table</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Pay Status</th>
                  <th className="pb-2">Order Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.slice(0, 8).map((o) => {
                  const payBadge =
                    o.paymentStatus === "PAID"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200";

                  const orderBadge =
                    o.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                    o.status === "READY_TO_SERVE" ? "bg-green-100 text-green-800" :
                    o.status === "PREPARING" ? "bg-blue-100 text-blue-800" :
                    "bg-amber-100 text-amber-800";

                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5">
                        <p className="font-bold text-gray-800 font-mono">{o.tokenNumber}</p>
                        <span className="text-[9px] text-gray-400">{o.customerName}</span>
                      </td>
                      <td className="py-2.5 font-semibold text-gray-700">{o.tableName}</td>
                      <td className="py-2.5 font-bold text-gray-800">UGX {o.total}</td>
                      <td className="py-2.5">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${payBadge}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${orderBadge}`}>
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="text-gray-400 hover:text-blue-600 font-bold hover:underline border-none bg-none p-0 cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
