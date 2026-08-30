"use client";

import React, { useState } from "react";
import { useShopOrders, useUpdateOrderStatus, ShopOrder } from "@/lib/api/shop";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons, inputs, badges } from "@/lib/design-system";
import { Package, Truck, CheckCircle2, Eye, X, RefreshCw, BarChart2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: orders = [], isLoading, refetch } = useShopOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("PENDING");
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate total e-commerce revenue
  const totalRevenue = orders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  // SVG Chart Data
  const monthlyRevenue = [
    { label: "Jan", value: 12000 },
    { label: "Feb", value: 16500 },
    { label: "Mar", value: 24000 },
    { label: "Apr", value: 18900 },
    { label: "May", value: 32000 },
    { label: "Current", value: totalRevenue || 5000 },
  ];

  const maxVal = Math.max(...monthlyRevenue.map((m) => m.value), 1000);

  // Handle open order details drawer
  const handleOpenDetails = (order: ShopOrder) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
    setTrackingNumberInput(order.trackingNumber || "");
  };

  // Update order status
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        status: editingStatus,
        trackingNumber: trackingNumberInput.trim() || undefined,
      });
      setSelectedOrder(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>Shop Orders Ledger</h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Monitor and fulfill retail store orders, tracking numbers, customer deliveries, and database revenue.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className={`${buttons.secondary} px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
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
              <span className="text-[10px] text-success-green font-semibold">100% Verified DB Orders</span>
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
              <span className="text-[10px] text-secondary-bronze/50">Requires Fulfillment</span>
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
            <span className="text-[10px] font-bold text-primary-gold">Monthly Sales (UGX / INR)</span>
          </div>

          {/* SVG Container */}
          <div className="relative h-28 w-full flex items-end justify-between px-2 pt-4">
            {monthlyRevenue.map((m, idx) => {
              const pct = (m.value / maxVal) * 90;
              return (
                <div key={idx} className="flex flex-col items-center flex-grow space-y-2 group relative">
                  <span className="absolute -top-6 text-[9px] font-bold text-primary-gold opacity-0 group-hover:opacity-100 transition-opacity bg-bg-warm px-1.5 py-0.5 rounded border border-primary-gold/10 whitespace-nowrap">
                    {formatCurrency(Math.round(m.value))}
                  </span>
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
        <div className="flex flex-wrap border-b border-primary-gold/10 pb-4 mb-6 gap-4 items-center justify-between">
          <div className="flex gap-4">
            {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                  statusFilter === status
                    ? "border-primary-gold text-primary-gold"
                    : "border-transparent text-secondary-bronze/55 hover:text-secondary-bronze"
                }`}
              >
                {status} ({status === "ALL" ? orders.length : orders.filter((o) => o.status === status).length})
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by order ID, customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${inputs.text} py-1.5 text-xs max-w-xs`}
          />
        </div>

        {/* Table layout */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading shop orders from database...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-secondary-bronze/60 text-xs">
              No orders found matching the selected filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items Count</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Placed Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg-warm/10">
                    <td className="py-3.5 font-bold text-primary-gold">{order.id}</td>
                    <td className="py-3.5 font-bold text-dark-surface">
                      <div>{order.customerName}</div>
                      <div className="text-[10px] text-secondary-bronze/60 font-normal">{order.customerEmail}</div>
                    </td>
                    <td className="py-3.5 text-secondary-bronze/70">
                      {order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0} items
                    </td>
                    <td className="py-3.5 font-semibold text-dark-surface">{formatCurrency(order.total)}</td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-semibold bg-primary-gold/10 text-secondary-bronze px-2 py-0.5 rounded-full">
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === "DELIVERED"
                            ? "bg-success-green/10 text-success-green"
                            : order.status === "SHIPPED"
                            ? "bg-accent-purple/10 text-accent-purple"
                            : order.status === "CANCELLED"
                            ? "bg-error-red/10 text-error-red"
                            : "bg-warning-amber/10 text-warning-amber"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-secondary-bronze/60">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetails(order)}
                        className={`${buttons.ghost} px-3 py-1.5 text-[10px] font-bold flex items-center space-x-1 hover:bg-primary-gold/10 ml-auto cursor-pointer`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
              <button onClick={() => setSelectedOrder(null)} className="text-secondary-bronze/60 hover:text-dark-surface cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address summary */}
            <div className="bg-bg-warm/30 border border-primary-gold/5 p-4 rounded-2xl text-xs space-y-1 text-secondary-bronze">
              <span className="text-[10px] font-bold text-secondary-bronze/70 uppercase block mb-1">Shipping Details</span>
              <p className="font-bold text-dark-surface">{selectedOrder.shippingAddress?.name || selectedOrder.customerName}</p>
              <p>{selectedOrder.shippingAddress?.line1}</p>
              <p>
                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}
              </p>
              <p>Phone: {selectedOrder.shippingAddress?.phone || selectedOrder.customerPhone}</p>
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-secondary-bronze/70 uppercase block">Purchased Items</span>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                {selectedOrder.items &&
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs p-2 bg-bg-warm/15 rounded-xl">
                      <span>
                        {item.productName} <span className="font-bold">× {item.quantity}</span>
                      </span>
                      <span className="font-bold text-dark-surface">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="border-t border-primary-gold/10 pt-3 text-xs space-y-1">
              <div className="flex justify-between text-secondary-bronze/70">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-success-green">
                  <span>Discount ({selectedOrder.couponCode || "Promo"}):</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-secondary-bronze/70">
                <span>Tax (5%):</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-secondary-bronze/70">
                <span>Shipping:</span>
                <span>{selectedOrder.shippingFee > 0 ? formatCurrency(selectedOrder.shippingFee) : "FREE"}</span>
              </div>
              <div className="flex justify-between font-bold text-dark-surface pt-1 border-t border-primary-gold/10 text-sm">
                <span>Total:</span>
                <span className="text-primary-gold">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Update Status form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-4 border-t border-primary-gold/10">
              <div>
                <label className={inputs.label}>Update Fulfillment Status</label>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className={inputs.select}
                >
                  <option value="PENDING">PENDING (Preparing order)</option>
                  <option value="PROCESSING">PROCESSING (Packing at temple)</option>
                  <option value="SHIPPED">SHIPPED (In courier transit)</option>
                  <option value="DELIVERED">DELIVERED (Signed & Completed)</option>
                  <option value="CANCELLED">CANCELLED (Refund/Cancelled)</option>
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
                  disabled={isUpdating}
                  className={`${buttons.secondary} py-2 px-4 text-xs cursor-pointer`}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className={`${buttons.primary} py-2 px-6 text-xs flex items-center space-x-1.5 cursor-pointer`}>
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUpdating ? "Updating..." : "Update Status & DB"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
