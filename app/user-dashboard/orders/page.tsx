"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { layout, cards, typography, buttons, badges } from "@/lib/design-system";
import { Package, Truck, CheckCircle2, Download, Clock, MapPin, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ShopOrder } from "@/data/orders";

export default function UserOrdersPage() {
  const { orders } = useApp();
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);

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
    ctx.font = "bold 26px serif";
    ctx.fillText("SHREE KUTCH SATSANG SWAMINARAYAN TEMPLE", 50, 80);
    ctx.font = "italic 16px serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("Sacred Temple Goods & Devotional Store", 50, 105);

    ctx.fillStyle = "#8B5E34";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("RETAIL INVOICE", 550, 80);

    // Invoice details
    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`Invoice ID: ${order.id}`, 550, 110);
    ctx.fillText(`Date: ${order.date}`, 550, 130);
    ctx.fillText(`Tracking: ${order.trackingNumber}`, 550, 150);

    // Divider
    ctx.strokeStyle = "#E5E3DF";
    ctx.beginPath();
    ctx.moveTo(50, 175);
    ctx.lineTo(750, 175);
    ctx.stroke();

    // Billing & Shipping Info
    ctx.fillStyle = "#8B5E34";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Billed & Shipped To:", 50, 210);

    ctx.fillStyle = "#111111";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(order.shippingAddress.name, 50, 235);
    ctx.font = "normal 13px sans-serif";
    ctx.fillText(order.shippingAddress.line1, 50, 255);
    ctx.fillText(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 50, 275);
    ctx.fillText(`Phone: ${order.shippingAddress.phone}`, 50, 295);

    // Payment details
    ctx.fillStyle = "#8B5E34";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Payment Information:", 450, 210);
    ctx.fillStyle = "#111111";
    ctx.font = "normal 13px sans-serif";
    ctx.fillText(`Method: ${order.paymentMethod}`, 450, 235);
    ctx.fillText(`Payment Status: SUCCESS`, 450, 255);

    // Divider
    ctx.beginPath();
    ctx.moveTo(50, 325);
    ctx.lineTo(750, 325);
    ctx.stroke();

    // Table Header
    ctx.fillStyle = "#8B5E34";
    ctx.fillRect(50, 345, 700, 35);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("S.No", 70, 367);
    ctx.fillText("Item Description", 130, 367);
    ctx.fillText("Price", 450, 367);
    ctx.fillText("Qty", 550, 367);
    ctx.fillText("Total", 650, 367);

    // Table Items
    let currentY = 410;
    ctx.fillStyle = "#111111";
    ctx.font = "normal 12px sans-serif";

    order.items.forEach((item, index) => {
      ctx.fillText((index + 1).toString(), 70, currentY);
      ctx.fillText(item.name, 130, currentY);
      ctx.fillText(`₹${item.price}`, 450, currentY);
      ctx.fillText(item.quantity.toString(), 550, currentY);
      ctx.fillText(`₹${item.price * item.quantity}`, 650, currentY);

      ctx.strokeStyle = "#FAF0E6";
      ctx.beginPath();
      ctx.moveTo(50, currentY + 12);
      ctx.lineTo(750, currentY + 12);
      ctx.stroke();

      currentY += 40;
    });

    // Calculations Block
    currentY += 10;
    ctx.fillStyle = "#111111";
    ctx.font = "normal 13px sans-serif";
    ctx.fillText("Subtotal:", 500, currentY);
    ctx.fillText(`₹${order.subtotal}`, 650, currentY);

    if (order.discount > 0) {
      currentY += 25;
      ctx.fillStyle = "green";
      ctx.fillText("Discount:", 500, currentY);
      ctx.fillText(`-₹${order.discount}`, 650, currentY);
      ctx.fillStyle = "#111111";
    }

    currentY += 25;
    ctx.fillText("GST Tax (5%):", 500, currentY);
    ctx.fillText(`₹${order.tax}`, 650, currentY);

    currentY += 25;
    ctx.fillText("Shipping Charges:", 500, currentY);
    ctx.fillText(order.subtotal - order.discount >= 999 ? "FREE" : "₹99", 650, currentY);

    currentY += 35;
    ctx.strokeStyle = "#C59D5F";
    ctx.beginPath();
    ctx.moveTo(500, currentY - 20);
    ctx.lineTo(750, currentY - 20);
    ctx.stroke();

    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("Total Amount Paid:", 500, currentY);
    ctx.fillText(`₹${order.total}`, 650, currentY);

    // Signature & Footnote
    ctx.fillStyle = "#111111";
    ctx.font = "italic 11px serif";
    ctx.fillText("Thank you for supporting Shree Kutch Satsang Swaminarayan Temple, Kampala. May you receive divine blessings.", 50, 910);
    ctx.fillText("This is a system generated e-invoice. No signature required.", 50, 930);

    // Trigger download
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `invoice-${order.id}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="space-y-8 font-jakarta">
      <div>
        <h1 className={`${typography.h2} text-dark-surface font-medium`}>My Store Purchases</h1>
        <p className="text-xs text-secondary-bronze/75 mt-0.5">
          Browse your past item receipts, check delivery updates, and download invoices.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-primary-gold/10 rounded-3xl p-8 shadow-sm">
          <Package className="w-12 h-12 text-primary-gold/30 mx-auto mb-4" />
          <h3 className="font-bold text-dark-surface mb-1 text-sm">No Orders Found</h3>
          <p className="text-secondary-bronze/70 text-xs mb-6">You have not bought any items from the temple store yet.</p>
          <Link href="/shop" className={buttons.primary}>
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Cards List (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-4">
            {orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  className={`border rounded-2xl p-5 bg-white transition-all shadow-sm ${
                    isSelected ? "border-primary-gold ring-1 ring-primary-gold/30" : "border-primary-gold/10 hover:border-primary-gold/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs text-primary-gold font-bold">{order.id}</span>
                      <span className="text-[10px] text-secondary-bronze/50 block mt-0.5">{order.date}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === "DELIVERED"
                          ? "bg-success-green/10 text-success-green"
                          : order.status === "SHIPPED"
                          ? "bg-accent-purple/10 text-accent-purple"
                          : "bg-warning-amber/10 text-warning-amber"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pb-3 border-b border-primary-gold/5 mb-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-secondary-bronze/80">
                        <span className="line-clamp-1 max-w-[80%]">
                          {item.name} <span className="font-bold text-dark-surface">× {item.quantity}</span>
                        </span>
                        <span className="font-semibold text-dark-surface">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-dark-surface">
                      Total: <span className="text-primary-gold">{formatCurrency(order.total)}</span>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-[11px] font-bold border border-primary-gold/30 text-secondary-bronze hover:bg-primary-gold/10 rounded-xl flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="p-1.5 rounded-full text-secondary-bronze hover:text-primary-gold hover:bg-primary-gold/5 transition-all cursor-pointer"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline and Details Column (lg:col-span-6) */}
          <div className="lg:col-span-6">
            {selectedOrder ? (
              <div className="bg-white border border-primary-gold/15 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex justify-between items-start pb-4 border-b border-primary-gold/10">
                  <div>
                    <h4 className="font-bold text-dark-surface text-sm">Tracking Order {selectedOrder.id}</h4>
                    <p className="text-[10px] text-secondary-bronze/55 mt-1">
                      Tracking ID: <span className="font-bold text-primary-gold">{selectedOrder.trackingNumber}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadInvoice(selectedOrder)}
                    className={`${buttons.primary} py-2 px-4 text-[10px] flex items-center space-x-1.5`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Invoice</span>
                  </button>
                </div>

                {/* Delivery Address summary */}
                <div className="text-xs space-y-1 bg-[#FAF7F2]/50 border border-primary-gold/10 p-4 rounded-xl">
                  <div className="flex items-center text-[10px] font-bold text-secondary-bronze/70 uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-gold mr-1" />
                    <span>Delivery Address</span>
                  </div>
                  <p className="font-bold text-dark-surface">{selectedOrder.shippingAddress.name}</p>
                  <p className="text-secondary-bronze/80">{selectedOrder.shippingAddress.line1}</p>
                  <p className="text-secondary-bronze/80">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>

                {/* Timeline nodes */}
                <div className="space-y-6 pl-4 border-l border-primary-gold/25 relative ml-2">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[22px] top-0.5 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${
                          step.status === "DELIVERED"
                            ? "border-success-green bg-success-green"
                            : step.status === "SHIPPED"
                            ? "border-accent-purple bg-accent-purple"
                            : "border-warning-amber bg-warning-amber"
                        }`}
                      />
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-dark-surface">{step.title}</span>
                          <span className="text-[10px] text-secondary-bronze/55 flex items-center">
                            <Clock className="w-3 h-3 mr-0.5" />
                            {step.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary-bronze/75 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/40 border border-primary-gold/5 rounded-3xl p-12 text-center text-secondary-bronze/60 text-xs shadow-sm">
                Select an order and click "Track" to inspect delivery timeline progress.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
