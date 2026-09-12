"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { useMyDevoteeOrders, ShopOrder } from "@/lib/api/shop";
import {
  Package,
  Truck,
  CheckCircle2,
  Download,
  Clock,
  MapPin,
  Eye,
  ShoppingBag,
  Banknote,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Phone,
  User,
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function UserOrdersPage() {
  const { devoteeProfile, currentMemberNumber, members } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const activeMember = members.find((m) => m.membershipNumber === currentMemberNumber);

  // Fetch real-time orders from backend API
  const {
    data: liveOrders,
    isLoading,
    isRefetching,
    refetch
  } = useMyDevoteeOrders(
    {
      devoteeId: devoteeProfile?.id || activeMember?.id,
      email: devoteeProfile?.email || activeMember?.email,
      phone: devoteeProfile?.phone || activeMember?.phone,
    },
    {
      enabled: Boolean(devoteeProfile || activeMember),
    }
  );

  const ordersList: ShopOrder[] = liveOrders || [];

  // Filter orders by status
  const filteredOrders = ordersList.filter((order) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "ACTIVE") return order.status === "PENDING" || order.status === "PROCESSING" || order.status === "SHIPPED";
    if (statusFilter === "DELIVERED") return order.status === "DELIVERED";
    if (statusFilter === "CANCELLED") return order.status === "CANCELLED";
    return true;
  });

  // Calculations for overview stats
  const totalOrdersCount = ordersList.length;
  const activeOrdersCount = ordersList.filter((o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "SHIPPED").length;
  const deliveredOrdersCount = ordersList.filter((o) => o.status === "DELIVERED").length;
  const totalSpentUGX = ordersList
    .filter((o) => o.status !== "CANCELLED")
    .reduce((acc, o) => acc + Number(o.total || 0), 0);

  // Download Invoice as PNG using Canvas
  const handleDownloadInvoice = (order: ShopOrder) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Warm Color
    ctx.fillStyle = "#FAF7F2";
    ctx.fillRect(0, 0, 800, 1000);

    // Decorative Gold border
    ctx.strokeStyle = "#C59D5F";
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, 770, 970);
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, 756, 956);

    // Header
    ctx.fillStyle = "#111111";
    ctx.font = "bold 24px serif";
    ctx.fillText("SHREE KUTCH SATSANG SWAMINARAYAN TEMPLE", 50, 75);
    ctx.font = "italic 15px serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("Temple Devotional Goods & Sacred Store • Kampala, Uganda", 50, 100);

    ctx.fillStyle = "#8B5E34";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText("STORE INVOICE", 550, 75);

    // Invoice details
    ctx.fillStyle = "#111111";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`Invoice ID: ${order.id}`, 550, 105);
    const orderDateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order as any).date || "2026-09-12";
    ctx.fillText(`Date: ${orderDateStr}`, 550, 125);
    ctx.fillText(`Payment: Cash on Delivery (COD)`, 550, 145);

    // Divider
    ctx.strokeStyle = "#E5E3DF";
    ctx.beginPath();
    ctx.moveTo(50, 170);
    ctx.lineTo(750, 170);
    ctx.stroke();

    // Billing & Shipping Info
    ctx.fillStyle = "#8B5E34";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Shipped To:", 50, 205);

    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(order.shippingAddress?.name || order.customerName, 50, 230);
    ctx.font = "normal 13px sans-serif";
    ctx.fillText(order.shippingAddress?.line1 || "Kampala Delivery", 50, 250);
    ctx.fillText(`${order.shippingAddress?.city || "Kampala"}, Uganda`, 50, 270);
    ctx.fillText(`Phone: ${order.shippingAddress?.phone || order.customerPhone}`, 50, 290);

    // Payment details
    ctx.fillStyle = "#8B5E34";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Order Fulfillment:", 450, 205);
    ctx.fillStyle = "#111111";
    ctx.font = "normal 13px sans-serif";
    ctx.fillText(`Method: Cash on Delivery (COD)`, 450, 230);
    ctx.fillText(`Status: ${order.status}`, 450, 250);
    if (order.trackingNumber) {
      ctx.fillText(`Tracking: ${order.trackingNumber}`, 450, 270);
    }

    // Divider
    ctx.beginPath();
    ctx.moveTo(50, 315);
    ctx.lineTo(750, 315);
    ctx.stroke();

    // Table Header
    ctx.fillStyle = "#8B5E34";
    ctx.fillRect(50, 335, 700, 32);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("S.No", 70, 355);
    ctx.fillText("Sacred Item Description", 130, 355);
    ctx.fillText("Price", 450, 355);
    ctx.fillText("Qty", 550, 355);
    ctx.fillText("Total (UGX)", 640, 355);

    // Table Items
    let currentY = 395;
    ctx.fillStyle = "#111111";
    ctx.font = "normal 12px sans-serif";

    (order.items || []).forEach((item: any, index: number) => {
      ctx.fillText((index + 1).toString(), 70, currentY);
      ctx.fillText(item.name || item.productName || "Sacred Item", 130, currentY);
      ctx.fillText(`UGX ${item.price}`, 450, currentY);
      ctx.fillText(item.quantity.toString(), 550, currentY);
      ctx.fillText(`UGX ${item.price * item.quantity}`, 640, currentY);

      ctx.strokeStyle = "#FAF0E6";
      ctx.beginPath();
      ctx.moveTo(50, currentY + 12);
      ctx.lineTo(750, currentY + 12);
      ctx.stroke();

      currentY += 35;
    });

    // Calculations Block
    currentY += 15;
    ctx.fillStyle = "#111111";
    ctx.font = "normal 13px sans-serif";
    ctx.fillText("Subtotal:", 500, currentY);
    ctx.fillText(`UGX ${order.subtotal}`, 640, currentY);

    if (order.discount && order.discount > 0) {
      currentY += 22;
      ctx.fillStyle = "green";
      ctx.fillText("Discount:", 500, currentY);
      ctx.fillText(`-UGX ${order.discount}`, 640, currentY);
      ctx.fillStyle = "#111111";
    }

    currentY += 22;
    ctx.fillText("Temple Tax (5%):", 500, currentY);
    ctx.fillText(`UGX ${order.tax || 0}`, 640, currentY);

    currentY += 22;
    ctx.fillText("Delivery Fee:", 500, currentY);
    ctx.fillText(order.shippingFee && order.shippingFee > 0 ? `UGX ${order.shippingFee}` : "FREE", 640, currentY);

    currentY += 30;
    ctx.strokeStyle = "#C59D5F";
    ctx.beginPath();
    ctx.moveTo(500, currentY - 15);
    ctx.lineTo(750, currentY - 15);
    ctx.stroke();

    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("Payable on Delivery:", 480, currentY + 5);
    ctx.fillText(`UGX ${order.total}`, 640, currentY + 5);

    // Signature & Footnote
    ctx.fillStyle = "#111111";
    ctx.font = "italic 11px serif";
    ctx.fillText("Thank you for supporting Shree Kutch Satsang Swaminarayan Temple, Kampala. May you receive divine blessings.", 50, 910);
    ctx.fillText("This is a system generated Cash on Delivery store invoice. Please pay the courier in cash upon receipt.", 50, 930);

    // Trigger download
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `SKSS-Invoice-${order.id}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="space-y-8 font-poppins pb-16">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface">
              My Sacred Store Purchases
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-gold/15 text-primary-gold font-bold text-xs">
              Live Orders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-secondary-bronze/75 mt-1">
            Track your temple orders, view delivery progress, and download official Cash on Delivery receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-4 py-2 rounded-xl border border-primary-gold/25 bg-white text-secondary-bronze hover:text-dark-surface text-xs font-semibold shadow-2xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary-gold ${isRefetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/shop"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Visit Temple Shop</span>
          </Link>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-primary-gold/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-gold/15 text-primary-gold flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary-bronze font-medium">Total Orders</p>
            <h3 className="font-heading text-2xl font-bold text-dark-surface mt-0.5">
              {totalOrdersCount}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-primary-gold/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-purple/15 text-accent-purple flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary-bronze font-medium">In Transit / Active</p>
            <h3 className="font-heading text-2xl font-bold text-dark-surface mt-0.5">
              {activeOrdersCount}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-primary-gold/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success-green/15 text-success-green flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary-bronze font-medium">Delivered</p>
            <h3 className="font-heading text-2xl font-bold text-dark-surface mt-0.5">
              {deliveredOrdersCount}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-primary-gold/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-bronze/15 text-secondary-bronze flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary-bronze font-medium">Total Purchases</p>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-dark-surface mt-0.5">
              {formatCurrency(totalSpentUGX)}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-primary-gold/15 text-xs font-semibold shadow-2xs">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-primary-gold text-white shadow-xs font-bold"
              : "text-secondary-bronze/70 hover:text-dark-surface hover:bg-bg-warm"
          }`}
        >
          All Orders ({totalOrdersCount})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("ACTIVE")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            statusFilter === "ACTIVE"
              ? "bg-primary-gold text-white shadow-xs font-bold"
              : "text-secondary-bronze/70 hover:text-dark-surface hover:bg-bg-warm"
          }`}
        >
          Active / In Progress ({activeOrdersCount})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter("DELIVERED")}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            statusFilter === "DELIVERED"
              ? "bg-primary-gold text-white shadow-xs font-bold"
              : "text-secondary-bronze/70 hover:text-dark-surface hover:bg-bg-warm"
          }`}
        >
          Delivered ({deliveredOrdersCount})
        </button>
      </div>

      {/* Main Orders Display */}
      {isLoading ? (
        <div className="text-center py-20 bg-white border border-primary-gold/15 rounded-3xl p-8 shadow-xs">
          <RefreshCw className="w-10 h-10 text-primary-gold animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-dark-surface text-base">Loading Your Temple Purchases...</h3>
          <p className="text-secondary-bronze/70 text-xs mt-1">Retrieving order timeline and receipts.</p>
        </div>
      ) : ordersList.length === 0 ? (
        <div className="text-center py-16 bg-white border border-primary-gold/15 rounded-3xl p-8 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-dark-surface">No Orders Placed Yet</h3>
            <p className="text-secondary-bronze/75 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
              Explore our collection of authentic Vedic havan kits, deities, devotional books, and sanctified items with Cash on Delivery across Uganda.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Temple Shop</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Order Cards List (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            {filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : (order as any).date || "2026-09-12";
              
              return (
                <div
                  key={order.id}
                  className={`border rounded-3xl p-5 sm:p-6 bg-white transition-all shadow-xs space-y-4 ${
                    isSelected
                      ? "border-primary-gold ring-2 ring-primary-gold/20 shadow-md"
                      : "border-primary-gold/15 hover:border-primary-gold/30"
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-primary-gold/10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-primary-gold/15 text-primary-gold">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-dark-surface block">
                          {order.id}
                        </span>
                        <span className="text-[10px] text-secondary-bronze/70 font-mono">
                          Ordered on {orderDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Cash on Delivery Badge */}
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-gold/10 text-primary-gold font-semibold text-[10px] border border-primary-gold/20 flex items-center gap-1">
                        <Banknote className="w-3 h-3" />
                        <span>COD</span>
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          order.status === "DELIVERED"
                            ? "bg-success-green/10 text-success-green border border-success-green/30"
                            : order.status === "SHIPPED"
                            ? "bg-accent-purple/10 text-accent-purple border border-accent-purple/30"
                            : order.status === "PROCESSING"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                            : order.status === "CANCELLED"
                            ? "bg-error-red/10 text-error-red border border-error-red/30"
                            : "bg-warning-amber/10 text-warning-amber border border-warning-amber/30"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2.5 py-1">
                    {(order.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2.5 max-w-[75%]">
                          {item.productImage || item.image ? (
                            <img
                              src={item.productImage || item.image}
                              alt={item.name || item.productName}
                              className="w-10 h-10 rounded-xl object-cover border border-primary-gold/15 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-bg-warm flex items-center justify-center text-primary-gold shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-dark-surface line-clamp-1">
                              {item.name || item.productName}
                            </p>
                            <p className="text-[11px] text-secondary-bronze/70 font-mono">
                              Qty: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>

                        <span className="font-bold text-dark-surface font-mono">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location Preview */}
                  {order.shippingAddress && (
                    <div className="p-3 rounded-2xl bg-bg-warm/40 border border-primary-gold/10 flex items-start gap-2 text-[11px] text-secondary-bronze">
                      <MapPin className="w-3.5 h-3.5 text-primary-gold shrink-0 mt-0.5" />
                      <span className="truncate">
                        Delivery to: <strong>{order.shippingAddress.name}</strong> • {order.shippingAddress.line1}, {order.shippingAddress.city}
                      </span>
                    </div>
                  )}

                  {/* Bottom Bar: Total & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-primary-gold/10">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-secondary-bronze block">
                        Total Payable (COD)
                      </span>
                      <span className="font-heading text-base font-bold text-primary-gold font-mono">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary-gold text-white shadow-xs"
                            : "border border-primary-gold/30 bg-white text-secondary-bronze hover:bg-bg-warm"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track Order</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order)}
                        className="p-2 rounded-xl border border-primary-gold/25 bg-white text-secondary-bronze hover:text-primary-gold hover:bg-bg-warm transition-all cursor-pointer shadow-2xs"
                        title="Download Invoice"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side: Order Tracking & Live Timeline Inspector (lg:col-span-5) */}
          <div className="lg:col-span-5 sticky top-24">
            {selectedOrder ? (
              <div className="bg-white border border-primary-gold/25 rounded-3xl p-6 shadow-md space-y-6 animate-in fade-in duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-primary-gold/15">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary-gold/15 text-primary-gold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-dark-surface">
                        Shipment & Tracking
                      </h3>
                      <p className="text-[11px] font-mono text-secondary-bronze">
                        Order #{selectedOrder.id}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg hover:bg-black/5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Callout */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-bg-warm/50 to-primary-gold/10 border border-primary-gold/25 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-gold">
                      Current Fulfillment Stage
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-dark-surface text-[10px] font-bold shadow-2xs">
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-secondary-bronze/85 leading-relaxed">
                    {selectedOrder.status === "DELIVERED"
                      ? "Package has been successfully handed over to you with cash payment received."
                      : selectedOrder.status === "SHIPPED"
                      ? "Your sacred items are in transit via courier delivery handlers."
                      : "Order received and being prepared with Vedic altar blessings before dispatch."}
                  </p>
                </div>

                {/* Tracking Steps Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-bronze">
                    Fulfillment Milestones
                  </h4>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary-gold/25">
                    {/* Step 1: Order Placed */}
                    <div className="relative">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-success-green text-white flex items-center justify-center text-[10px] ring-4 ring-white">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-dark-surface">Order Registered (COD)</p>
                        <p className="text-[11px] text-secondary-bronze/75 mt-0.5 leading-relaxed">
                          Cash on Delivery request confirmed with temple dispatch.
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Processing & Packing */}
                    <div className="relative">
                      <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white ${
                        selectedOrder.status !== "PENDING"
                          ? "bg-success-green text-white"
                          : "bg-warning-amber text-white"
                      }`}>
                        {selectedOrder.status !== "PENDING" ? "✓" : "•"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-dark-surface">Sanctification & Packing</p>
                        <p className="text-[11px] text-secondary-bronze/75 mt-0.5 leading-relaxed">
                          Items packed securely with temple altar blessings.
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Out for Delivery */}
                    <div className="relative">
                      <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white ${
                        selectedOrder.status === "SHIPPED" || selectedOrder.status === "DELIVERED"
                          ? "bg-success-green text-white"
                          : "bg-secondary-bronze/20 text-secondary-bronze"
                      }`}>
                        {selectedOrder.status === "SHIPPED" || selectedOrder.status === "DELIVERED" ? "✓" : "•"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-dark-surface">Courier Dispatch</p>
                        <p className="text-[11px] text-secondary-bronze/75 mt-0.5 leading-relaxed">
                          {selectedOrder.trackingNumber ? `Dispatched with Tracking: ${selectedOrder.trackingNumber}` : "Assigned to local delivery handler"}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="relative">
                      <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white ${
                        selectedOrder.status === "DELIVERED"
                          ? "bg-success-green text-white"
                          : "bg-secondary-bronze/20 text-secondary-bronze"
                      }`}>
                        {selectedOrder.status === "DELIVERED" ? "✓" : "•"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-dark-surface">Doorstep Delivery & Cash Collection</p>
                        <p className="text-[11px] text-secondary-bronze/75 mt-0.5 leading-relaxed">
                          Courier collects <strong className="text-dark-surface">{formatCurrency(selectedOrder.total)}</strong> in cash upon delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Box */}
                {selectedOrder.shippingAddress && (
                  <div className="p-4 rounded-2xl bg-bg-warm/40 border border-primary-gold/15 space-y-1.5 text-xs font-poppins">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze block">
                      Delivery Address
                    </span>
                    <p className="font-semibold text-dark-surface">{selectedOrder.shippingAddress.name}</p>
                    <p className="text-secondary-bronze/80">{selectedOrder.shippingAddress.line1}</p>
                    <p className="text-secondary-bronze/80">{selectedOrder.shippingAddress.city}, Uganda</p>
                    <p className="text-secondary-bronze/80 font-mono">Contact: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                )}

                {/* Download invoice button */}
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Retail Invoice (PNG)</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-primary-gold/15 rounded-3xl p-8 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-primary-gold/15 text-primary-gold flex items-center justify-center mx-auto">
                  <Eye className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-base font-bold text-dark-surface">
                  Track Delivery Progress
                </h4>
                <p className="text-xs text-secondary-bronze/70 leading-relaxed max-w-[240px] mx-auto">
                  Click <strong>"Track Order"</strong> on any purchase card to inspect live milestones and delivery updates.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
