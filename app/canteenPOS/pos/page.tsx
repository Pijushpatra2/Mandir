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
  Check,
  Coffee,
  Utensils,
  CheckCircle2
} from "lucide-react";
import { useCanteen } from "../context/CanteenContext";
import { useCategories } from "@/lib/api/canteen";

export default function POSPage() {
  const { data: apiCategories = [] } = useCategories();
  
  const {
    posSession,
    openPosSession,
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

  // Extract distinct categories from menu as fallback, merging with API list
  const menuCategories = Array.from(new Set(menu.map(m => m.category))).filter(Boolean);
  const categoriesList = Array.from(new Set([
    "All",
    ...apiCategories.map(c => c.name),
    ...menuCategories,
    "Mains",
    "Snacks",
    "Beverages",
    "Desserts",
    "Combos",
    "Add-ons"
  ]));

  // Filter Menu Items
  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(posSearch.toLowerCase());
    const matchesCategory = posCategory === "All" || item.category === posCategory;
    return matchesSearch && matchesCategory;
  });

  if (!posSession || !posSession.isOpen) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-170px)] bg-gray-50/50">
        <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">POS Session Closed</h2>
            <p className="text-xs text-gray-400">
              Open a new sales session and record the opening cash drawer balance to start billing.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = new FormData(e.currentTarget).get("openingCash");
              const cash = Number(val);
              if (isNaN(cash) || cash < 0) {
                alert("Please enter a valid amount");
                return;
              }
              openPosSession(cash);
            }}
            className="space-y-4 text-left"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 block">
                Opening Cash Drawer Balance (UGX)
              </label>
              <input
                name="openingCash"
                type="number"
                required
                defaultValue="0"
                min="0"
                placeholder="Enter opening cash drawer balance..."
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-none"
            >
              Open POS Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === "all") return <Utensils className="w-4 h-4" />;
    if (c.includes("breakfast") || c.includes("beverage") || c.includes("coffee") || c.includes("tea") || c.includes("drink")) {
      return <Coffee className="w-4 h-4" />;
    }
    return <Utensils className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col gap-8 w-full min-h-[calc(100vh-170px)]">
      {/* ROW 1: Canteen Menu */}
      <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm flex flex-col w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 flex-shrink-0">
          {/* Category tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2 select-none scrollbar-thin max-w-full md:max-w-[70%]">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setPosCategory(cat)}
                className={`px-6 py-3 rounded-full text-[15px] font-bold transition-all cursor-pointer border border-[#C21807] flex items-center gap-2.5 ${
                  posCategory === cat
                    ? "bg-[#C21807] text-white shadow-md shadow-red-100"
                    : "bg-white text-gray-700 hover:bg-red-50/50"
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              placeholder="Search for an item"
              className="w-full pl-5 pr-12 py-3 border border-gray-200 rounded-full text-[15px] outline-none bg-gray-100 focus:bg-white focus:border-gray-300 transition-colors shadow-inner text-gray-700 font-medium"
            />
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            {posSearch && (
              <button onClick={() => setPosSearch("")} className="absolute inset-y-0 right-10 flex items-center border-none bg-transparent cursor-pointer">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Menu Title */}
        <h3 className="text-[22px] font-extrabold text-gray-800 mb-6 text-left uppercase tracking-wide">
          {posCategory === "All" ? "Canteen Menu" : `${posCategory} Menu`}
        </h3>

        <div className="w-full">
          {filteredMenu.length === 0 ? (
            <div className="py-20 flex flex-col justify-center items-center text-gray-300">
              <BookOpen className="w-16 h-16 text-gray-200 mb-2" />
              <p className="text-[17px] font-sans">No food items found matching criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenu.map((item) => {
                const cartItem = cart.find(c => c.item.id === item.id);
                const qty = cartItem ? cartItem.qty : 0;

                return (
                  <div
                    key={item.id}
                    className="group border border-gray-150 rounded-[24px] p-5 flex gap-5 bg-white shadow-sm hover:shadow-md transition-all relative select-none"
                  >
                    {/* Left Side: Photo & Price */}
                    <div className="flex flex-col items-center shrink-0 w-28 sm:w-32">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center text-4xl">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>🍛</span>
                        )}
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[13px] font-extrabold uppercase rounded-2xl">
                            Out of stock
                          </div>
                        )}
                      </div>
                      <span className="text-[16px] font-bold text-gray-800 mt-2.5 pl-1 w-full text-center">
                        UGX {item.price}
                      </span>
                    </div>

                    {/* Right Side: Details & Action Controls */}
                    <div className="flex flex-col justify-between flex-grow text-left">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="font-extrabold text-gray-800 text-[16px] sm:text-[17px] tracking-wide leading-tight group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </h4>
                          <span className="shrink-0 mt-0.5">
                            {item.variety === "Spicy" ? (
                              <CheckCircle2 className="w-4 h-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                          </span>
                        </div>
                        
                        <p className="text-[13px] text-gray-400 mt-2 font-sans">
                          07:00 am - 09:00 pm
                        </p>
                        <p className="text-[13px] text-gray-500 font-bold mt-1 font-sans">
                          Available: {item.available ? 15 : 0}
                        </p>
                      </div>

                      {/* Direct Quantity & Add basket actions */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-55 flex-wrap">
                        {/* Qty Counter Pill */}
                        <div className="flex items-center gap-3.5 bg-[#2B132C] text-white px-4 py-1.5 rounded-full text-[13px] font-bold">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (qty > 0) handleUpdateCartQty(item.id, -1);
                            }}
                            className="text-white hover:text-red-300 font-black cursor-pointer border-none bg-transparent p-0 text-[14px]"
                          >
                            -
                          </button>
                          <span className="w-4 text-center">{qty}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateCartQty(item.id, 1);
                            }}
                            className="text-white hover:text-blue-300 font-black cursor-pointer border-none bg-transparent p-0 text-[14px]"
                          >
                            +
                          </button>
                        </div>

                        {/* Add to Cart capsule button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                          className="rounded-full border border-[#C21807] text-[#C21807] font-bold text-[13px] px-4.5 py-1.5 flex items-center gap-2 hover:bg-red-50 transition-colors border-none cursor-pointer bg-white"
                        >
                          <span>Add to cart</span>
                          <ShoppingCart className="w-3.5 h-3.5 text-[#C21807]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: Running Order Allocations */}
      <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm flex flex-col w-full">
        <h3 className="text-[20px] font-extrabold text-gray-800 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 text-left">
          Running Order Allocations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2 text-left">
            <label className="text-[14px] font-extrabold uppercase text-gray-500 block">Allocate Seating Table</label>
            <select
              value={posSelectedTable}
              onChange={(e) => setPosSelectedTable(e.target.value)}
              className="w-full p-3.5 border border-gray-150 rounded-xl text-[15px] outline-none bg-gray-50 text-gray-700 font-extrabold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
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

          <div className="space-y-2 text-left">
            <label className="text-[14px] font-extrabold uppercase text-gray-500 block">Customer Name</label>
            <input
              type="text"
              placeholder="Devotee name"
              value={posCustomerName}
              onChange={(e) => setPosCustomerName(e.target.value)}
              className="w-full p-3.5 border border-gray-150 rounded-xl text-[15px] bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-sans text-gray-700 font-semibold"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[14px] font-extrabold uppercase text-gray-500 block">Contact Phone</label>
            <input
              type="tel"
              placeholder="+256..."
              value={posCustomerPhone}
              onChange={(e) => {
                const val = e.target.value;
                setPosCustomerPhone(val);
                const match = customers.find((c) => c.phone === val || (c.phone.includes(val) && val.length > 5));
                if (match) {
                  setPosCustomerName(match.name);
                }
              }}
              className="w-full p-3.5 border border-gray-150 rounded-xl text-[15px] bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-sans text-gray-700 font-semibold"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 space-y-4 text-left">
          <label className="text-[15px] font-extrabold uppercase text-gray-500 block">Order Items</label>

          {cart.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-base">
              <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="font-sans">Cart is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cart.map((c) => (
                <div key={c.item.id} className="bg-gray-50/50 p-4.5 rounded-2xl border border-gray-150 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-base">
                    <div className="text-left max-w-[65%]">
                      <h4 className="font-extrabold text-gray-800 text-[15px] tracking-wide leading-snug">{c.item.name}</h4>
                      <span className="text-[12px] text-gray-450 mt-1 block">UGX {c.item.price} each</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateCartQty(c.item.id, -1)}
                        className="text-gray-400 hover:text-red-500 p-0.5 rounded cursor-pointer border-none bg-transparent"
                      >
                        <MinusCircle className="w-6 h-6" />
                      </button>
                      <span className="font-black text-gray-850 text-base w-6 text-center">{c.qty}</span>
                      <button
                        onClick={() => handleUpdateCartQty(c.item.id, 1)}
                        className="text-gray-400 hover:text-blue-500 p-0.5 rounded cursor-pointer border-none bg-transparent"
                      >
                        <PlusCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Add cooking notes..."
                    value={c.notes || ""}
                    onChange={(e) => handleUpdateItemNote(c.item.id, e.target.value)}
                    className="w-full text-[13px] p-2 bg-white border border-gray-150 rounded-lg outline-none text-gray-600 focus:border-blue-450"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROW 3: Cart Summary & Payments */}
      <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm flex flex-col w-full">
        <h3 className="text-[20px] font-extrabold text-gray-800 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 text-left">
          Cart Summary & Payments
        </h3>

        {(() => {
          const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
          const tax = 0;
          const serviceCharge = 0;
          const discount = Number(posDiscount) || 0;
          const total = Math.max(0, subtotal + tax + serviceCharge - discount);

          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Notes & Discount */}
              <div className="space-y-4 font-sans text-left flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <span className="text-[14px] font-extrabold uppercase text-gray-500 block">Order Notes</span>
                  <textarea
                    rows={3}
                    placeholder="Type comments..."
                    value={posOrderNote}
                    onChange={(e) => setPosOrderNote(e.target.value)}
                    className="w-full p-3.5 bg-gray-50 border border-gray-150 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-400 resize-none text-gray-700 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[14px] font-extrabold uppercase text-gray-500 block">Discount (UGX Amount)</span>
                  <div className="flex gap-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><Percent className="w-4 h-4" /></span>
                    <input
                      type="number"
                      placeholder="0"
                      value={posDiscount || ""}
                      onChange={(e) => setPosDiscount(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-150 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-400 text-gray-700 font-extrabold"
                    />
                  </div>
                </div>
              </div>

              {/* Net Total Breakdown */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4 text-sm font-sans text-gray-500 text-left h-full flex flex-col justify-center">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-650">Subtotal:</span>
                  <span className="font-black text-gray-800 text-[15px]">UGX {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-650">GST (5%):</span>
                  <span className="font-black text-gray-800 text-[15px]">UGX {tax}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-650">Service Charge (2.5%):</span>
                  <span className="font-black text-gray-800 text-[15px]">UGX {serviceCharge}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-650 font-black">
                    <span>Discount:</span>
                    <span className="text-[15px]">- UGX {discount}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between font-black text-base text-gray-850">
                  <span>Net Total:</span>
                  <span className="text-[#C21807] font-black text-[22px]">UGX {total}</span>
                </div>
              </div>

              {/* Payments & Checkout Actions */}
              <div className="space-y-6 h-full flex flex-col justify-between">
                <div className="space-y-3.5 text-left">
                  <label className="text-[14px] font-extrabold uppercase text-gray-500 block">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-3 text-sm font-extrabold">
                    {["UPI", "CASH", "CARD"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPosPaymentMethod(method as any)}
                        className={`py-3.5 rounded-2xl border text-center transition-all cursor-pointer font-extrabold ${
                          posPaymentMethod === method
                            ? "border-[#C21807] bg-[#C21807]/10 text-[#C21807] shadow-sm ring-2 ring-[#C21807]/10"
                            : "border-gray-250 hover:bg-gray-50 text-gray-600 bg-white"
                        }`}
                      >
                        {method === "UPI" ? "Mobile Money" : method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  {currentRole === "receptionist" && (
                    <button
                      onClick={() => handlePosCheckout(false)}
                      className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[15px] transition-colors flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
                    >
                      <Printer className="w-5 h-5" /> Generate Token (Pay Cashier)
                    </button>
                  )}

                  {currentRole === "cashier" && (
                    <button
                      onClick={() => handlePosCheckout(true)}
                      className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-[15px] transition-colors flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
                    >
                      <Check className="w-5 h-5" /> Collect & Save Bill
                    </button>
                  )}

                  {currentRole === "manager" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handlePosCheckout(false)}
                        className="py-3.5 rounded-2xl border border-amber-500 hover:bg-amber-50 text-amber-600 font-extrabold text-[13px] transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white"
                      >
                        <Printer className="w-4.5 h-4.5" /> Hold Token
                      </button>
                      <button
                        onClick={() => handlePosCheckout(true)}
                        className="py-3.5 rounded-2xl bg-[#C21807] hover:bg-[#A31405] text-white font-extrabold text-[13px] transition-colors flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
                      >
                        <Check className="w-4.5 h-4.5" /> Pay Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
