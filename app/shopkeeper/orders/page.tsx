"use client";

import React, { useState } from "react";
import { useShopOrders, useUpdateOrderStatus, ShopOrder } from "@/lib/api/shop";
import {
  Package,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  X,
  Loader2,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

export default function ShopkeeperOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: orders = [], isLoading, refetch } = useShopOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("PENDING");
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerPhone && o.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleOpenDetails = (order: ShopOrder) => {
    setSelectedOrder(order);
    setEditingStatus(order.status);
    setTrackingNumberInput(order.trackingNumber || "");
    setFeedbackMsg(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    setFeedbackMsg(null);
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        status: editingStatus,
        trackingNumber: trackingNumberInput.trim() || undefined,
      });
      setFeedbackMsg({ text: "Order status updated successfully!", type: "success" });
      refetch();
      setTimeout(() => {
        setSelectedOrder(null);
      }, 900);
    } catch (err: any) {
      setFeedbackMsg({
        text: err?.response?.data?.message || "Failed to update order status.",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface">
            Store Orders & Fulfillment
          </h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Process incoming orders, pack items, update shipment status, and dispatch goods to devotees.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3.5 py-2 rounded-xl border border-primary-gold/25 bg-white hover:bg-bg-warm text-xs font-semibold text-secondary-bronze flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-primary-gold" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-primary-gold/15 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
            <input
              type="text"
              placeholder="Search by Order ID, Devotee name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/30 focus:border-primary-gold focus:outline-none text-xs text-dark-surface placeholder:text-secondary-bronze/50"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-secondary-bronze/70">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-bg-warm/40 text-xs font-semibold text-secondary-bronze focus:outline-none"
            >
              <option value="ALL">All Orders ({orders.length})</option>
              <option value="PENDING">Pending Only</option>
              <option value="PROCESSING">Processing Only</option>
              <option value="SHIPPED">Shipped Only</option>
              <option value="DELIVERED">Delivered Only</option>
              <option value="CANCELLED">Cancelled Only</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading order ledger...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-secondary-bronze/60 text-xs space-y-3">
              <Package className="w-8 h-8 text-primary-gold/30 mx-auto" />
              <p>No store orders found matching your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Devotee / Customer</th>
                  <th className="pb-3">Items Purchased</th>
                  <th className="pb-3">Order Total</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg-warm/25 transition-colors">
                    <td className="py-4 font-mono font-bold text-dark-surface">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-dark-surface">{order.customerName}</p>
                      <p className="text-[11px] text-secondary-bronze/70">{order.customerPhone || order.customerEmail}</p>
                    </td>
                    <td className="py-4 text-secondary-bronze font-medium">
                      {order.items && order.items.length > 0 ? (
                        <span>
                          {order.items.length} item{order.items.length > 1 ? "s" : ""} (
                          {order.items[0]?.productName}
                          {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""})
                        </span>
                      ) : (
                        <span>Standard Store Order</span>
                      )}
                    </td>
                    <td className="py-4 font-bold text-dark-surface">
                      {formatCurrency(Number(order.total))}
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-bg-warm border border-primary-gold/20 text-secondary-bronze">
                        {order.paymentMethod || "COD"}
                      </span>
                    </td>
                    <td className="py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1",
                          order.status === "DELIVERED"
                            ? "bg-success-green/10 text-success-green border border-success-green/25"
                            : order.status === "SHIPPED"
                            ? "bg-primary-gold/10 text-primary-gold border border-primary-gold/25"
                            : order.status === "PROCESSING"
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : order.status === "CANCELLED"
                            ? "bg-error-red/10 text-error-red border border-error-red/25"
                            : "bg-warning-amber/10 text-warning-amber border border-warning-amber/25"
                        )}
                      >
                        <span>{order.status}</span>
                      </span>
                    </td>
                    <td className="py-4 text-secondary-bronze/70">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(order)}
                        className="px-3.5 py-1.5 rounded-xl border border-primary-gold/30 bg-primary-gold/10 hover:bg-primary-gold text-primary-gold hover:text-white font-semibold transition-all cursor-pointer inline-flex items-center space-x-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Fulfill & Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================================================================
       * FULFILLMENT & ORDER DETAILS MODAL
       * ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-dark-surface">
                    Order #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {feedbackMsg && (
                <div
                  className={cn(
                    "p-3 rounded-xl border flex items-center space-x-2 text-xs",
                    feedbackMsg.type === "success"
                      ? "bg-success-green/10 border-success-green/30 text-success-green"
                      : "bg-error-red/10 border-error-red/30 text-error-red"
                  )}
                >
                  {feedbackMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* Devotee Info & Delivery Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-bg-warm/30 border border-primary-gold/15 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/70 block">
                    Devotee Customer Details
                  </span>
                  <p className="font-bold text-dark-surface text-sm">{selectedOrder.customerName}</p>
                  <p className="text-secondary-bronze flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary-gold" />
                    <span>{selectedOrder.customerEmail}</span>
                  </p>
                  <p className="text-secondary-bronze flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary-gold" />
                    <span>{selectedOrder.customerPhone || "No phone provided"}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-bg-warm/30 border border-primary-gold/15 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-secondary-bronze/70 block">
                    Delivery / Shipping Destination
                  </span>
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p className="font-semibold text-dark-surface">{selectedOrder.shippingAddress.name}</p>
                      <p className="text-secondary-bronze flex items-start space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-gold shrink-0 mt-0.5" />
                        <span>
                          {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city},{" "}
                          {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                        </span>
                      </p>
                    </>
                  ) : (
                    <p className="text-secondary-bronze/70">Counter Pickup / Direct Counter Sale</p>
                  )}
                </div>
              </div>

              {/* Items Purchased List */}
              <div className="space-y-3">
                <h4 className="font-heading text-sm font-bold text-dark-surface">
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border border-primary-gold/15 rounded-2xl overflow-hidden divide-y divide-primary-gold/10">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-dark-surface">{item.productName}</p>
                            <p className="text-[11px] text-secondary-bronze/70">
                              Qty: <strong className="text-dark-surface">{item.quantity}</strong> ×{" "}
                              {formatCurrency(Number(item.price))}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-dark-surface">
                          {formatCurrency(Number(item.total))}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-secondary-bronze/60">
                      Standard store order details
                    </div>
                  )}
                </div>

                {/* Subtotal, Discount & Total Summary */}
                <div className="p-4 rounded-2xl bg-bg-warm/50 border border-primary-gold/15 space-y-1.5">
                  <div className="flex justify-between text-secondary-bronze">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(Number(selectedOrder.subtotal || selectedOrder.total))}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-success-green">
                      <span>Discount:</span>
                      <span>-{formatCurrency(Number(selectedOrder.discount))}</span>
                    </div>
                  )}
                  {selectedOrder.shippingFee > 0 && (
                    <div className="flex justify-between text-secondary-bronze">
                      <span>Shipping Fee:</span>
                      <span>{formatCurrency(Number(selectedOrder.shippingFee))}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-primary-gold/15 flex justify-between font-bold text-sm text-dark-surface">
                    <span>Grand Total:</span>
                    <span className="text-primary-gold">{formatCurrency(Number(selectedOrder.total))}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="p-4 rounded-2xl bg-primary-gold/5 border border-primary-gold/25 space-y-4">
                <h4 className="font-heading text-sm font-bold text-dark-surface flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-primary-gold" />
                  <span>Update Order Fulfillment Status</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">Fulfillment Status</label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="PENDING">PENDING (Awaiting action)</option>
                      <option value="PROCESSING">PROCESSING (Packing in progress)</option>
                      <option value="SHIPPED">SHIPPED (Handed to courier/ready)</option>
                      <option value="DELIVERED">DELIVERED (Fulfilled)</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze">Tracking Number / Note</label>
                    <input
                      type="text"
                      placeholder="e.g. TRK-98234 or Counter Pickup"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Update Status</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
