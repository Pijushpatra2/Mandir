"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, inputs, badges } from "@/lib/design-system";
import { Package, Truck, CheckCircle2, Eye, X, RefreshCw, BarChart2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ShopOrder } from "@/data/orders";

export default function DashboardOrdersPage() {
  const { orders, setOrders, setNotifications } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit status states
  const [editingStatus, setEditingStatus] = useState<"PENDING" | "SHIPPED" | "DELIVERED">("PENDING");
  const [trackingNumberInput, setTrackingNumberInput] = useState("");

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "ALL") return true;
    return o.status === statusFilter;
  });

  // Calculate total e-commerce revenue
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);

  // SVG Chart Mock Data (Jan - Jun Revenue)
  const monthlyRevenue = [
    { label: "Jan", value: 12000 },
    { label: "Feb", value: 16500 },
    { label: "Mar", value: 24000 },
    { label: "Apr", value: 18900 },
    { label: "May", value: 32000 },
    { label: "Jun", value: totalRevenue }
  ];

  const maxVal = Math.max(...monthlyRevenue.map(m => m.value), 1000);

  // Handle open order details drawer
  const handleOpenDetails = (order: ShopOrder) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
    setTrackingNumberInput(order.trackingNumber);
  };

  // Update order status and append to tracking timeline
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const timestampStr = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let stepTitle = "";
    let stepDesc = "";
    if (editingStatus === "SHIPPED") {
      stepTitle = "Dispatched from Hub";
      stepDesc = `Package forwarded via BlueDart courier. Waybill Tracking ID: ${trackingNumberInput}.`;
    } else if (editingStatus === "DELIVERED") {
      stepTitle = "Delivered";
      stepDesc = "Courier confirmed package receipt and signed by customer.";
    } else {
      stepTitle = "Processing";
      stepDesc = "Order details verified. Preparing items for packaging.";
    }

    const updatedOrders = orders.map((o) => {
      if (o.id === selectedOrder.id) {
        // Only append to timeline if status changes
        const statusChanged = o.status !== editingStatus;
        const newTimeline = statusChanged 
          ? [...o.timeline, { status: editingStatus, timestamp: timestampStr, title: stepTitle, description: stepDesc }]
          : o.timeline;

        return {
          ...o,
          status: editingStatus,
          trackingNumber: trackingNumberInput,
          timeline: newTimeline
        };
      }
      return o;
    });

    setOrders(updatedOrders);

    // Notify customer simulation
    setNotifications((prev) => [
      {
        id: `notif-status-${Date.now()}`,
        title: `Order status: ${editingStatus}`,
        message: `Your order ${selectedOrder.id} status has been updated to ${editingStatus}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        category: "booking"
      },
      ...prev
    ]);

    setSelectedOrder(null);
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>Shop Orders ledger</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Monitor and fulfill retail item transactions, payments, and courier dispatch logs.
          </p>
        </div>
      </div>

      {/* SVG Chart & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Statistics cards */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`${cards.glass} p-5 flex flex-col justify-between`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60">
              Gross Shop Revenue
            </span>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-dark-surface font-heading">{formatCurrency(totalRevenue)}</h3>
              <span className="text-[10px] text-success-green font-semibold">100% Secure Sales</span>
            </div>
          </div>

          <div className={`${cards.glass} p-5 flex flex-col justify-between`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60">
              Orders Pending Pack
            </span>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-warning-amber font-heading">
                {orders.filter((o) => o.status === "PENDING").length}
              </h3>
              <span className="text-[10px] text-secondary-bronze/50">Needs Altar Blessings</span>
            </div>
          </div>
        </div>

        {/* Custom SVG Revenue Line Chart */}
        <div className="lg:col-span-8 bg-white border border-primary-gold/10 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-secondary-bronze/70 uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-primary-gold" />
              <span>Revenue Growth Timeline (H1 2026)</span>
            </h3>
            <span className="text-[10px] font-bold text-primary-gold">Monthly Sales (INR)</span>
          </div>

          {/* SVG Container */}
          <div className="relative h-28 w-full flex items-end justify-between px-2 pt-4">
            {monthlyRevenue.map((m, idx) => {
              const pct = (m.value / maxVal) * 90; // Limit to 90% height
              return (
                <div key={idx} className="flex flex-col items-center flex-grow space-y-2 group relative">
                  {/* Tooltip bar value */}
                  <span className="absolute -top-6 text-[9px] font-bold text-primary-gold opacity-0 group-hover:opacity-100 transition-opacity bg-bg-warm px-1.5 py-0.5 rounded border border-primary-gold/10">
                    ₹{Math.round(m.value)}
                  </span>
                  {/* Bar */}
                  <div
                    className="w-8 bg-gradient-to-t from-primary-gold to-secondary-bronze rounded-t-lg transition-all duration-500 hover:brightness-105"
                    style={{ height: `${pct}px` }}
                  />
                  <span className="text-[9px] font-bold text-secondary-bronze/60">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Orders Catalog Table */}
      <div className="bg-white border border-primary-gold/10 rounded-3xl p-6 shadow-sm">
        {/* Status filters */}
        <div className="flex border-b border-primary-gold/10 pb-4 mb-6 gap-4">
          {["ALL", "PENDING", "SHIPPED", "DELIVERED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                statusFilter === status
                  ? "border-primary-gold text-primary-gold"
                  : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
              }`}
            >
              {status} ({status === "ALL" ? orders.length : orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items Count</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Placed Date</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-gold/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-bg-warm/10">
                  <td className="py-3.5 font-bold text-primary-gold">{order.id}</td>
                  <td className="py-3.5 font-bold text-dark-surface">{order.customerName}</td>
                  <td className="py-3.5 text-secondary-bronze/70">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="py-3.5 font-semibold text-dark-surface">{formatCurrency(order.total)}</td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === "DELIVERED"
                          ? "bg-success-green/10 text-success-green"
                          : order.status === "SHIPPED"
                          ? "bg-accent-purple/10 text-accent-purple"
                          : "bg-warning-amber/10 text-warning-amber"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-secondary-bronze/60">{order.date}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleOpenDetails(order)}
                      className={`${buttons.ghost} px-3 py-1.5 text-[10px] font-bold flex items-center space-x-1 hover:bg-primary-gold/10 ml-auto`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Status updater Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-dark-surface/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-primary-gold/10">
              <div>
                <h3 className={`${typography.h4} text-dark-surface font-semibold`}>Fulfill Order {selectedOrder.id}</h3>
                <span className="text-[10px] text-secondary-bronze/55 block">Customer: {selectedOrder.customerName}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-secondary-bronze/60 hover:text-dark-surface">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address summary */}
            <div className="bg-bg-warm/30 border border-primary-gold/5 p-4 rounded-2xl text-xs space-y-1 text-secondary-bronze">
              <span className="text-[10px] font-bold text-secondary-bronze/70 uppercase block mb-1">Shipping Details</span>
              <p className="font-bold text-dark-surface">{selectedOrder.shippingAddress.name}</p>
              <p>{selectedOrder.shippingAddress.line1}</p>
              <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
              <p>Phone: {selectedOrder.shippingAddress.phone}</p>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-secondary-bronze/70 uppercase block">Purchased Items</span>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs p-2 bg-bg-warm/15 rounded-xl">
                    <span>{item.name} <span className="font-bold">× {item.quantity}</span></span>
                    <span className="font-bold text-dark-surface">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Update Status form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-4 border-t border-primary-gold/10">
              <div>
                <label className={inputs.label}>Update Fulfillment Status</label>
                <select
                  value={editingStatus}
                  onChange={(e: any) => setEditingStatus(e.target.value)}
                  className={inputs.select}
                >
                  <option value="PENDING">PENDING (Preparing at temple)</option>
                  <option value="SHIPPED">SHIPPED (Courier transit)</option>
                  <option value="DELIVERED">DELIVERED (Signed & Completed)</option>
                </select>
              </div>

              <div>
                <label className={inputs.label}>Courier Tracking Code</label>
                <input
                  type="text"
                  placeholder="e.g. TRK1293049182"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className={inputs.text}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className={`${buttons.secondary} py-2 px-4 text-xs`}
                >
                  Cancel
                </button>
                <button type="submit" className={`${buttons.primary} py-2 px-6 text-xs`}>
                  Update & Notify Devotee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
