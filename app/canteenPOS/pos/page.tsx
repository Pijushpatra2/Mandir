"use client";

import React from "react";
import {
  Search,
  X,
  BookOpen,
  Plus,
  ShoppingCart,
  MinusCircle,
  PlusCircle,
  Percent,
  Printer,
  Check
} from "lucide-react";
import { useCanteen } from "../context/CanteenContext";

export default function POSPage() {
  const {
    posSearch,
    setPosSearch,
    posCategory,
    setPosCategory,
    menu,
    tables,
    posSelectedTable,
    setPosSelectedTable,
    posCustomerName,
    setPosCustomerName,
    posCustomerPhone,
    setPosCustomerPhone,
    customers,
    cart,
    posDiscount,
    setPosDiscount,
    posOrderNote,
    setPosOrderNote,
    posPaymentMethod,
    setPosPaymentMethod,
    currentRole,
    handleAddToCart,
    handleUpdateCartQty,
    handleUpdateItemNote,
    handlePosCheckout
  } = useCanteen();

  // Filter Menu Items
  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(posSearch.toLowerCase());
    const matchesCategory = posCategory === "All" || item.category === posCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[calc(100vh-170px)]">
      {/* Left Panel: Category tabs & Food item grid */}
      <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[650px]">
        <div className="space-y-4 mb-4 flex-shrink-0">
          <div className="flex gap-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              placeholder="Search food items (e.g. Masala Dosa)..."
              className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl text-xs outline-none bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors shadow-inner"
            />
            {posSearch && (
              <button onClick={() => setPosSearch("")} className="absolute inset-y-0 right-0 pr-3 flex items-center border-none bg-transparent cursor-pointer">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1.5 select-none scrollbar-thin">
            {["All", "Mains", "Snacks", "Beverages", "Desserts", "Combos", "Add-ons"].map((cat) => (
              <button
                key={cat}
                onClick={() => setPosCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase whitespace-nowrap transition-all cursor-pointer border-none ${
                  posCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items grid */}
        <div className="flex-grow overflow-y-auto pr-1">
          {filteredMenu.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-gray-300">
              <BookOpen className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-[11px]">No food items found matching criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className="group border border-gray-100 rounded-2xl p-3 flex flex-col justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all bg-white relative overflow-hidden select-none"
                >
                  {/* Item Variety badge */}
                  <span className={`absolute top-2 left-2 text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase z-10 shadow-sm ${
                    item.variety === "Jain" ? "bg-green-50 text-green-700 border border-green-200" :
                    item.variety === "Spicy" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                    item.variety === "Sweet" ? "bg-pink-50 text-pink-700 border border-pink-200" :
                    "bg-gray-50 text-gray-700 border border-gray-200"
                  }`}>
                    {item.variety}
                  </span>

                  {/* Food Photo representation */}
                  <div className="w-full h-24 rounded-xl bg-gray-50 mb-2 flex items-center justify-center text-2xl overflow-hidden relative">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span>🍛</span>
                    )}
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[9px] font-bold uppercase">
                        Out of stock
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-gray-800 text-xs truncate group-hover:text-blue-600 transition-colors">{item.name}</h4>
                  
                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gray-55 flex-shrink-0">
                    <span className="text-xs font-bold text-blue-600">₹{item.price}</span>
                    <button className="p-1 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg text-blue-600 transition-all border-none cursor-pointer">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Panel: Table Allocations & Customer info & Running Order list */}
      <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[650px]">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
          Running Order Allocations
        </h3>

        <div className="space-y-4 flex-grow overflow-y-auto pr-1">
          {/* Table Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-400">Allocate Seating Table</label>
            <select
              value={posSelectedTable}
              onChange={(e) => setPosSelectedTable(e.target.value)}
              className="w-full p-2 border border-gray-100 rounded-xl text-xs outline-none bg-gray-50 text-gray-600 font-semibold focus:bg-white cursor-pointer"
            >
              <option value="">Counter Walk-in (No Table)</option>
              <optgroup label="Available Tables">
                {tables
                  .filter((t) => t.status === "AVAILABLE" || t.status === "CLEANING")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.capacity} Seats) - {t.status}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Occupied/Reserved Tables">
                {tables
                  .filter((t) => t.status === "OCCUPIED" || t.status === "RESERVED")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.capacity} Seats) - {t.status}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 block">Customer Name</label>
              <input
                type="text"
                placeholder="Devotee name"
                value={posCustomerName}
                onChange={(e) => setPosCustomerName(e.target.value)}
                className="w-full p-2 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 block">Contact Phone</label>
              <input
                type="tel"
                placeholder="+256..."
                value={posCustomerPhone}
                onChange={(e) => {
                  const val = e.target.value;
                  setPosCustomerPhone(val);
                  // Autocomplete helper from customers list
                  const match = customers.find((c) => c.phone === val || (c.phone.includes(val) && val.length > 5));
                  if (match) {
                    setPosCustomerName(match.name);
                  }
                }}
                className="w-full p-2 border border-gray-100 rounded-xl text-xs bg-gray-50 outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Running Cart items list */}
          <div className="border-t border-gray-50 pt-4 space-y-3">
            <label className="text-[10px] font-bold uppercase text-gray-400 block">Order Items</label>

            {cart.length === 0 ? (
              <div className="py-16 text-center text-gray-300 text-xs">
                <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p>Cart is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((c) => (
                  <div key={c.item.id} className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="text-left">
                        <h4 className="font-bold text-gray-800">{c.item.name}</h4>
                        <span className="text-[9px] text-gray-400">₹{c.item.price} each</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateCartQty(c.item.id, -1)}
                          className="text-gray-400 hover:text-red-500 p-0.5 rounded border-none bg-transparent cursor-pointer"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-800 w-4 text-center">{c.qty}</span>
                        <button
                          onClick={() => handleUpdateCartQty(c.item.id, 1)}
                          className="text-gray-400 hover:text-blue-500 p-0.5 rounded border-none bg-transparent cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Add cooking notes (e.g. Less ghee, Spicy)..."
                      value={c.notes || ""}
                      onChange={(e) => handleUpdateItemNote(c.item.id, e.target.value)}
                      className="w-full text-[9px] p-1 bg-white border border-gray-100 rounded outline-none text-gray-500 focus:border-blue-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Checkout, discount, taxes, billing buttons */}
      <div className="lg:col-span-3 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-[650px]">
        <div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
            Cart Summary & Payments
          </h3>

          {(() => {
            const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
            const tax = Math.round(subtotal * 0.05);
            const serviceCharge = Math.round(subtotal * 0.025);
            const discount = Number(posDiscount) || 0;
            const total = Math.max(0, subtotal + tax + serviceCharge - discount);

            return (
              <div className="space-y-4">
                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-gray-400">Order Notes / Kitchen Instructions</span>
                    <textarea
                      rows={2}
                      placeholder="Type general order comments..."
                      value={posOrderNote}
                      onChange={(e) => setPosOrderNote(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-400 resize-none text-gray-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-gray-400">Add Discount (₹ Amount)</span>
                    <div className="flex gap-1 relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Percent className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="number"
                        placeholder="0"
                        value={posDiscount || ""}
                        onChange={(e) => setPosDiscount(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-9 p-2 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs font-sans text-gray-500">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-800">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT / GST (5%):</span>
                    <span className="font-semibold text-gray-800">₹{tax}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge (2.5%):</span>
                    <span className="font-semibold text-gray-800">₹{serviceCharge}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-500 font-semibold">
                      <span>Discount:</span>
                      <span>- ₹{discount}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200/50 my-2 pt-2 flex justify-between font-bold text-sm text-gray-800">
                    <span>Net Total:</span>
                    <span className="text-blue-600">₹{total}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-gray-400 block">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
              {["UPI", "CASH", "CARD"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPosPaymentMethod(method as any)}
                  className={`py-2 rounded-xl border text-center transition-all cursor-pointer ${
                    posPaymentMethod === method
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-100 hover:bg-gray-55 text-gray-500 bg-white"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {currentRole === "receptionist" && (
              <button
                onClick={() => handlePosCheckout(false)}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-100 border-none cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Generate Token (Pay Cashier)
              </button>
            )}

            {currentRole === "cashier" && (
              <button
                onClick={() => handlePosCheckout(true)}
                className="w-full py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-green-100 border-none cursor-pointer"
              >
                <Check className="w-4 h-4" /> Collect & Save Bill
              </button>
            )}

            {currentRole === "manager" && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handlePosCheckout(false)}
                  className="py-2.5 rounded-xl border border-amber-500 hover:bg-amber-50 text-amber-600 font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Hold Token
                </button>
                <button
                  onClick={() => handlePosCheckout(true)}
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-md shadow-blue-100 border-none cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Pay Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
