// "use client";

// import React from "react";
// import {
//   Search,
//   X,
//   BookOpen,
//   Plus,
//   ShoppingCart,
//   MinusCircle,
//   PlusCircle,
//   Percent,
//   Printer,
//   Check,
//   Coffee,
//   Utensils,
//   CheckCircle2
// } from "lucide-react";
// import { useCanteen } from "../context/CanteenContext";
// import { useCategories } from "@/lib/api/canteen";

// export default function POSPage() {
//   const { data: apiCategories = [] } = useCategories();
  
//   const {
//     posSession,
//     openPosSession,
//     posSearch,
//     setPosSearch,
//     posCategory,
//     setPosCategory,
//     menu,
//     tables,
//     posSelectedTable,
//     setPosSelectedTable,
//     posCustomerName,
//     setPosCustomerName,
//     posCustomerPhone,
//     setPosCustomerPhone,
//     customers,
//     cart,
//     posDiscount,
//     setPosDiscount,
//     posOrderNote,
//     setPosOrderNote,
//     posPaymentMethod,
//     setPosPaymentMethod,
//     currentRole,
//     handleAddToCart,
//     handleUpdateCartQty,
//     handleUpdateItemNote,
//     handlePosCheckout
//   } = useCanteen();

//   // Extract distinct categories from menu as fallback, merging with API list
//   const menuCategories = Array.from(new Set(menu.map(m => m.category))).filter(Boolean);
//   const categoriesList = Array.from(new Set([
//     "All",
//     ...apiCategories.map(c => c.name),
//     ...menuCategories,
//     "Mains",
//     "Snacks",
//     "Beverages",
//     "Desserts",
//     "Combos",
//     "Add-ons"
//   ]));

//   // Filter Menu Items
//   const filteredMenu = menu.filter((item) => {
//     const matchesSearch = item.name.toLowerCase().includes(posSearch.toLowerCase());
//     const matchesCategory = posCategory === "All" || item.category === posCategory;
//     return matchesSearch && matchesCategory;
//   });

//   if (!posSession || !posSession.isOpen) {
//     return (
//       <div className="flex items-center justify-center min-h-[calc(100vh-170px)] bg-gray-50/50">
//         <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-xl max-w-md w-full text-center space-y-6">
//           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
//             <ShoppingCart className="w-8 h-8" />
//           </div>
//           <div className="space-y-2">
//             <h2 className="text-xl font-bold text-gray-800">POS Session Closed</h2>
//             <p className="text-xs text-gray-400">
//               Open a new sales session and record the opening cash drawer balance to start billing.
//             </p>
//           </div>

//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               const val = new FormData(e.currentTarget).get("openingCash");
//               const cash = Number(val);
//               if (isNaN(cash) || cash < 0) {
//                 alert("Please enter a valid amount");
//                 return;
//               }
//               openPosSession(cash);
//             }}
//             className="space-y-4 text-left"
//           >
//             <div className="space-y-1.5">
//               <label className="text-[10px] font-bold uppercase text-gray-400 block">
//                 Opening Cash Drawer Balance (UGX)
//               </label>
//               <input
//                 name="openingCash"
//                 type="number"
//                 required
//                 defaultValue="0"
//                 min="0"
//                 placeholder="Enter opening cash drawer balance..."
//                 className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-colors"
//               />
//             </div>

//             <button
//               type="submit"
//               className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-none"
//             >
//               Open POS Session
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   const getCategoryIcon = (cat: string) => {
//     const c = cat.toLowerCase();
//     if (c === "all") return <Utensils className="w-4 h-4" />;
//     if (c.includes("breakfast") || c.includes("beverage") || c.includes("coffee") || c.includes("tea") || c.includes("drink")) {
//       return <Coffee className="w-4 h-4" />;
//     }
//     return <Utensils className="w-4 h-4" />;
//   };

//   return (
//     <div className="flex flex-col gap-8 w-full min-h-[calc(100vh-170px)]">
//       {/* ROW 1: Canteen Menu */}
//       <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm flex flex-col w-full">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6 flex-shrink-0">
//           {/* Category tabs */}
//           <div className="flex gap-3 overflow-x-auto pb-2 select-none scrollbar-thin max-w-full md:max-w-[70%]">
//             {categoriesList.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setPosCategory(cat)}
//                 className={`px-6 py-3 rounded-full text-[15px] font-bold transition-all cursor-pointer border border-[#C21807] flex items-center gap-2.5 ${
//                   posCategory === cat
//                     ? "bg-[#C21807] text-white shadow-md shadow-red-100"
//                     : "bg-white text-gray-700 hover:bg-red-50/50"
//                 }`}
//               >
//                 {getCategoryIcon(cat)}
//                 <span>{cat}</span>
//               </button>
//             ))}
//           </div>

//           {/* Search bar */}
//           <div className="relative w-full md:w-80">
//             <input
//               type="text"
//               value={posSearch}
//               onChange={(e) => setPosSearch(e.target.value)}
//               placeholder="Search for an item"
//               className="w-full pl-5 pr-12 py-3 border border-gray-200 rounded-full text-[15px] outline-none bg-gray-100 focus:bg-white focus:border-gray-300 transition-colors shadow-inner text-gray-700 font-medium"
//             />
//             <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
//               <Search className="w-5 h-5" />
//             </span>
//             {posSearch && (
//               <button onClick={() => setPosSearch("")} className="absolute inset-y-0 right-10 flex items-center border-none bg-transparent cursor-pointer">
//                 <X className="w-4 h-4 text-gray-400" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Menu Title */}
//         <h3 className="text-[22px] font-extrabold text-gray-800 mb-6 text-left uppercase tracking-wide">
//           {posCategory === "All" ? "Canteen Menu" : `${posCategory} Menu`}
//         </h3>

//         <div className="w-full">
//           {filteredMenu.length === 0 ? (
//             <div className="py-20 flex flex-col justify-center items-center text-gray-300">
//               <BookOpen className="w-16 h-16 text-gray-200 mb-2" />
//               <p className="text-[17px] font-sans">No food items found matching criteria.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredMenu.map((item) => {
//                 const cartItem = cart.find(c => c.item.id === item.id);
//                 const qty = cartItem ? cartItem.qty : 0;

//                 return (
//                   <div
//                     key={item.id}
//                     className="group border border-gray-150 rounded-[24px] p-5 flex gap-5 bg-white shadow-sm hover:shadow-md transition-all relative select-none"
//                   >
//                     {/* Left Side: Photo & Price */}
//                     <div className="flex flex-col items-center shrink-0 w-28 sm:w-32">
//                       <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center text-4xl">
//                         {item.image ? (
//                           <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
//                         ) : (
//                           <span>🍛</span>
//                         )}
//                         {!item.available && (
//                           <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[13px] font-extrabold uppercase rounded-2xl">
//                             Out of stock
//                           </div>
//                         )}
//                       </div>
//                       <span className="text-[16px] font-bold text-gray-800 mt-2.5 pl-1 w-full text-center">
//                         UGX {item.price}
//                       </span>
//                     </div>

//                     {/* Right Side: Details & Action Controls */}
//                     <div className="flex flex-col justify-between flex-grow text-left">
//                       <div>
//                         <div className="flex items-start justify-between gap-1.5">
//                           <h4 className="font-extrabold text-gray-800 text-[16px] sm:text-[17px] tracking-wide leading-tight group-hover:text-blue-600 transition-colors">
//                             {item.name}
//                           </h4>
//                           <span className="shrink-0 mt-0.5">
//                             {item.variety === "Spicy" ? (
//                               <CheckCircle2 className="w-4 h-4 text-red-500" />
//                             ) : (
//                               <CheckCircle2 className="w-4 h-4 text-green-600" />
//                             )}
//                           </span>
//                         </div>
                        
//                         <p className="text-[13px] text-gray-400 mt-2 font-sans">
//                           07:00 am - 09:00 pm
//                         </p>
//                         <p className="text-[13px] text-gray-500 font-bold mt-1 font-sans">
//                           Available: {item.available ? 15 : 0}
//                         </p>
//                       </div>

//                       {/* Direct Quantity & Add basket actions */}
//                       <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-55 flex-wrap">
//                         {/* Qty Counter Pill */}
//                         <div className="flex items-center gap-3.5 bg-[#2B132C] text-white px-4 py-1.5 rounded-full text-[13px] font-bold">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               if (qty > 0) handleUpdateCartQty(item.id, -1);
//                             }}
//                             className="text-white hover:text-red-300 font-black cursor-pointer border-none bg-transparent p-0 text-[14px]"
//                           >
//                             -
//                           </button>
//                           <span className="w-4 text-center">{qty}</span>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleUpdateCartQty(item.id, 1);
//                             }}
//                             className="text-white hover:text-blue-300 font-black cursor-pointer border-none bg-transparent p-0 text-[14px]"
//                           >
//                             +
//                           </button>
//                         </div>

//                         {/* Add to Cart capsule button */}
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleAddToCart(item);
//                           }}
//                           className="rounded-full border border-[#C21807] text-[#C21807] font-bold text-[13px] px-4.5 py-1.5 flex items-center gap-2 hover:bg-red-50 transition-colors border-none cursor-pointer bg-white"
//                         >
//                           <span>Add to cart</span>
//                           <ShoppingCart className="w-3.5 h-3.5 text-[#C21807]" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ROW 2: Running Order Allocations */}
//       <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm flex flex-col w-full">
//         <h3 className="text-[20px] font-extrabold text-gray-800 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 text-left">
//           Running Order Allocations
//         </h3>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div className="space-y-2 text-left">
//             <label className="text-[14px] font-extrabold uppercase text-gray-500 block">Allocate Seating Table</label>
//             <select
//               value={posSelectedTable}
//               onChange={(e) => setPosSelectedTable(e.target.value)}
//               className="w-full p-3.5 border border-gray-150 rounded-xl text-[15px] outline-none bg-gray-50 text-gray-700 font-extrabold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
//             >
//               <option value="">Counter Walk-in (No Table)</option>
//               <optgroup label="Available Tables">
//                 {tables
//                   .filter((t) => t.status === "AVAILABLE" || t.status === "CLEANING")
//                   .map((t) => (
//                     <option key={t.id} value={t.id}>
//                       {t.name} ({t.capacity} Seats) - {t.status}
//                     </option>
//                   ))}
//               </optgroup>
//               <optgroup label="Occupied/Reserved Tables">
//                 {tables
//                   .filter((t) => t.status === "OCCUPIED" || t.status === "RESERVED")
//                   .map((t) => (
//                     <option key={t.id} value={t.id}>
//                       {t.name} ({t.capacity} Seats) - {t.status}
//                     </option>
//                   ))}
//               </optgroup>
//             </select>
//           </div>

//           <div className="space-y-2 text-left">
//             <label className="text-[14px] font-extrabold uppercase text-gray-500 block">Customer Name</label>
//             <input
//               type="text"
//               placeholder="Devotee name"
//               value={posCustomerName}
//               onChange={(e) => setPosCustomerName(e.target.value)}
//               className="w-full p-3.5 border border-gray-150 rounded-xl text-[15px] bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-sans text-gray-700 font-semibold"
//             />
//           </div>

//           <div className="space-y-2 text-left">
//             <label className="text-[14px] font-extrabold uppercase text-gray-500 block">Contact Phone</label>
//             <input
//               type="tel"
//               placeholder="+256..."
//               value={posCustomerPhone}
//               onChange={(e) => {
//                 const val = e.target.value;
//                 setPosCustomerPhone(val);
//                 const match = customers.find((c) => c.phone === val || (c.phone.includes(val) && val.length > 5));
//                 if (match) {
//                   setPosCustomerName(match.name);
//                 }
//               }}
//               className="w-full p-3.5 border border-gray-150 rounded-xl text-[15px] bg-gray-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-sans text-gray-700 font-semibold"
//             />
//           </div>
//         </div>

//         <div className="border-t border-gray-100 pt-6 space-y-4 text-left">
//           <label className="text-[15px] font-extrabold uppercase text-gray-500 block">Order Items</label>

//           {cart.length === 0 ? (
//             <div className="py-16 text-center text-gray-400 text-base">
//               <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-3" />
//               <p className="font-sans">Cart is currently empty.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//               {cart.map((c) => (
//                 <div key={c.item.id} className="bg-gray-50/50 p-4.5 rounded-2xl border border-gray-150 flex flex-col gap-3">
//                   <div className="flex justify-between items-center text-base">
//                     <div className="text-left max-w-[65%]">
//                       <h4 className="font-extrabold text-gray-800 text-[15px] tracking-wide leading-snug">{c.item.name}</h4>
//                       <span className="text-[12px] text-gray-450 mt-1 block">UGX {c.item.price} each</span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <button
//                         onClick={() => handleUpdateCartQty(c.item.id, -1)}
//                         className="text-gray-400 hover:text-red-500 p-0.5 rounded cursor-pointer border-none bg-transparent"
//                       >
//                         <MinusCircle className="w-6 h-6" />
//                       </button>
//                       <span className="font-black text-gray-850 text-base w-6 text-center">{c.qty}</span>
//                       <button
//                         onClick={() => handleUpdateCartQty(c.item.id, 1)}
//                         className="text-gray-400 hover:text-blue-500 p-0.5 rounded cursor-pointer border-none bg-transparent"
//                       >
//                         <PlusCircle className="w-6 h-6" />
//                       </button>
//                     </div>
//                   </div>

//                   <input
//                     type="text"
//                     placeholder="Add cooking notes..."
//                     value={c.notes || ""}
//                     onChange={(e) => handleUpdateItemNote(c.item.id, e.target.value)}
//                     className="w-full text-[13px] p-2 bg-white border border-gray-150 rounded-lg outline-none text-gray-600 focus:border-blue-450"
//                   />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ROW 3: Cart Summary & Payments */}
//       <div className="bg-white p-8 rounded-3xl border border-gray-150 shadow-sm flex flex-col w-full">
//         <h3 className="text-[20px] font-extrabold text-gray-800 uppercase tracking-wider mb-6 border-b border-gray-100 pb-3 text-left">
//           Cart Summary & Payments
//         </h3>

//         {(() => {
//           const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
//           const tax = 0;
//           const serviceCharge = 0;
//           const discount = Number(posDiscount) || 0;
//           const total = Math.max(0, subtotal + tax + serviceCharge - discount);

//           return (
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
//               {/* Notes & Discount */}
//               <div className="space-y-4 font-sans text-left flex flex-col justify-between h-full">
//                 <div className="space-y-2">
//                   <span className="text-[14px] font-extrabold uppercase text-gray-500 block">Order Notes</span>
//                   <textarea
//                     rows={3}
//                     placeholder="Type comments..."
//                     value={posOrderNote}
//                     onChange={(e) => setPosOrderNote(e.target.value)}
//                     className="w-full p-3.5 bg-gray-50 border border-gray-150 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-400 resize-none text-gray-700 font-semibold"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <span className="text-[14px] font-extrabold uppercase text-gray-500 block">Discount (UGX Amount)</span>
//                   <div className="flex gap-1 relative">
//                     <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400"><Percent className="w-4 h-4" /></span>
//                     <input
//                       type="number"
//                       placeholder="0"
//                       value={posDiscount || ""}
//                       onChange={(e) => setPosDiscount(Math.max(0, Number(e.target.value)))}
//                       className="w-full pl-10 p-3.5 bg-gray-50 border border-gray-150 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-400 text-gray-700 font-extrabold"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Net Total Breakdown */}
//               <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4 text-sm font-sans text-gray-500 text-left h-full flex flex-col justify-center">
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-650">Subtotal:</span>
//                   <span className="font-black text-gray-800 text-[15px]">UGX {subtotal}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-650">GST (5%):</span>
//                   <span className="font-black text-gray-800 text-[15px]">UGX {tax}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="font-semibold text-gray-650">Service Charge (2.5%):</span>
//                   <span className="font-black text-gray-800 text-[15px]">UGX {serviceCharge}</span>
//                 </div>
//                 {discount > 0 && (
//                   <div className="flex justify-between text-red-650 font-black">
//                     <span>Discount:</span>
//                     <span className="text-[15px]">- UGX {discount}</span>
//                   </div>
//                 )}
//                 <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between font-black text-base text-gray-850">
//                   <span>Net Total:</span>
//                   <span className="text-[#C21807] font-black text-[22px]">UGX {total}</span>
//                 </div>
//               </div>

//               {/* Payments & Checkout Actions */}
//               <div className="space-y-6 h-full flex flex-col justify-between">
//                 <div className="space-y-3.5 text-left">
//                   <label className="text-[14px] font-extrabold uppercase text-gray-500 block">Select Payment Method</label>
//                   <div className="grid grid-cols-3 gap-3 text-sm font-extrabold">
//                     {["UPI", "CASH", "CARD"].map((method) => (
//                       <button
//                         key={method}
//                         onClick={() => setPosPaymentMethod(method as any)}
//                         className={`py-3.5 rounded-2xl border text-center transition-all cursor-pointer font-extrabold ${
//                           posPaymentMethod === method
//                             ? "border-[#C21807] bg-[#C21807]/10 text-[#C21807] shadow-sm ring-2 ring-[#C21807]/10"
//                             : "border-gray-250 hover:bg-gray-50 text-gray-600 bg-white"
//                         }`}
//                       >
//                         {method === "UPI" ? "Mobile Money" : method}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="space-y-3.5 pt-2">
//                   {currentRole === "receptionist" && (
//                     <button
//                       onClick={() => handlePosCheckout(false)}
//                       className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[15px] transition-colors flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
//                     >
//                       <Printer className="w-5 h-5" /> Generate Token (Pay Cashier)
//                     </button>
//                   )}

//                   {currentRole === "cashier" && (
//                     <button
//                       onClick={() => handlePosCheckout(true)}
//                       className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-[15px] transition-colors flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
//                     >
//                       <Check className="w-5 h-5" /> Collect & Save Bill
//                     </button>
//                   )}

//                   {currentRole === "manager" && (
//                     <div className="grid grid-cols-2 gap-3">
//                       <button
//                         onClick={() => handlePosCheckout(false)}
//                         className="py-3.5 rounded-2xl border border-amber-500 hover:bg-amber-50 text-amber-600 font-extrabold text-[13px] transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white"
//                       >
//                         <Printer className="w-4.5 h-4.5" /> Hold Token
//                       </button>
//                       <button
//                         onClick={() => handlePosCheckout(true)}
//                         className="py-3.5 rounded-2xl bg-[#C21807] hover:bg-[#A31405] text-white font-extrabold text-[13px] transition-colors flex items-center justify-center gap-2 shadow-md border-none cursor-pointer"
//                       >
//                         <Check className="w-4.5 h-4.5" /> Pay Now
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })()}
//       </div>
//     </div>
//   );
// }




//====================================================================================================================



"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  Menu,
  Table2,
  CreditCard,
  User,
  Phone,
  Tag,
  StickyNote,
  Receipt,
  LayoutGrid,
  List,
  Grid3x3,
  Clock,
  Users,
  Wallet,
  Landmark,
  Smartphone,
  CreditCard as CardIcon
} from "lucide-react";
import { useCanteen } from "../context/CanteenContext";
import { useCategories } from "@/lib/api/canteen";

// Skeleton Loading Component
const SkeletonLoader = () => {
  return (
    <div className="w-full min-h-[calc(100vh-170px)] bg-bg-warm p-2.5 sm:p-3.5 md:p-5">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 md:gap-5 items-stretch">
        {/* Menu Skeleton */}
        <div className="xl:col-span-5 glass-card overflow-hidden flex flex-col">
          <div className="p-3.5 sm:p-4 md:p-6 border-b border-neutral-gray bg-surface-white/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5">
              <div className="flex items-center gap-2.5 md:gap-3.5">
                <div className="w-10 h-10 md:w-11 md:h-11 bg-neutral-gray rounded-xl animate-pulse"></div>
                <div className="w-20 md:w-24 h-7 md:h-8 bg-neutral-gray rounded animate-pulse"></div>
                <div className="w-16 md:w-20 h-5 md:h-6 bg-neutral-gray rounded-full animate-pulse"></div>
              </div>
              <div className="w-full sm:w-64 md:w-72 lg:w-80 h-10 md:h-12 bg-neutral-gray rounded-xl animate-pulse"></div>
            </div>
          </div>

          <div className="px-3.5 sm:px-4 md:px-6 pt-3.5 sm:pt-4 md:pt-5 pb-2.5 md:pb-3.5">
            <div className="flex gap-1.5 sm:gap-2.5 md:gap-3 overflow-x-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-20 sm:w-24 h-10 md:h-12 bg-neutral-gray rounded-xl animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          </div>

          <div className="flex-1 min-h-0 p-3.5 sm:p-4 md:p-6">
            <div className="grid gap-2.5 md:gap-3.5 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border-2 border-neutral-gray p-3.5 md:p-4 bg-surface-white rounded-xl md:rounded-2xl">
                  <div className="flex gap-2.5 md:gap-3.5">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-gray rounded-xl animate-pulse flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="w-3/4 h-4 md:h-5 bg-neutral-gray rounded animate-pulse mb-2"></div>
                      <div className="w-1/2 h-3 md:h-4 bg-neutral-gray rounded animate-pulse mb-3"></div>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div className="w-20 md:w-24 h-7 md:h-8 bg-neutral-gray rounded-full animate-pulse"></div>
                        <div className="flex-1 h-7 md:h-8 bg-neutral-gray rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details Skeleton */}
        <div className="xl:col-span-4 glass-card overflow-hidden flex flex-col">
          <div className="p-3.5 sm:p-4 md:p-6 border-b border-neutral-gray bg-surface-white/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-neutral-gray rounded-xl animate-pulse"></div>
              <div className="w-28 md:w-32 h-7 md:h-8 bg-neutral-gray rounded animate-pulse"></div>
            </div>
          </div>
          <div className="p-3.5 sm:p-4 md:p-6 flex-1 min-h-0">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-1.5 md:space-y-2.5">
                <div className="w-24 md:w-32 h-3 md:h-4 bg-neutral-gray rounded animate-pulse"></div>
                <div className="w-full h-10 md:h-12 bg-neutral-gray rounded-xl animate-pulse"></div>
              </div>
              <div className="space-y-1.5 md:space-y-2.5">
                <div className="w-24 md:w-32 h-3 md:h-4 bg-neutral-gray rounded animate-pulse"></div>
                <div className="w-full h-10 md:h-12 bg-neutral-gray rounded-xl animate-pulse"></div>
                <div className="w-full h-10 md:h-12 bg-neutral-gray rounded-xl animate-pulse"></div>
              </div>
              <div className="space-y-1.5 md:space-y-2.5">
                <div className="w-24 md:w-32 h-3 md:h-4 bg-neutral-gray rounded animate-pulse"></div>
                {[1, 2].map((i) => (
                  <div key={i} className="w-full h-16 md:h-20 bg-neutral-gray rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Skeleton */}
        <div className="xl:col-span-3 glass-card overflow-hidden flex flex-col">
          <div className="p-3.5 sm:p-4 md:p-6 border-b border-neutral-gray bg-surface-white/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-neutral-gray rounded-xl animate-pulse"></div>
              <div className="w-28 md:w-32 h-7 md:h-8 bg-neutral-gray rounded animate-pulse"></div>
            </div>
          </div>
          <div className="p-3.5 sm:p-4 md:p-6 flex-1 min-h-0">
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-3.5 md:space-y-4">
                <div className="space-y-1.5 md:space-y-2.5">
                  <div className="w-24 md:w-32 h-3 md:h-4 bg-neutral-gray rounded animate-pulse"></div>
                  <div className="w-full h-16 md:h-20 bg-neutral-gray rounded-xl animate-pulse"></div>
                </div>
                <div className="space-y-1.5 md:space-y-2.5">
                  <div className="w-24 md:w-32 h-3 md:h-4 bg-neutral-gray rounded animate-pulse"></div>
                  <div className="w-full h-10 md:h-12 bg-neutral-gray rounded-xl animate-pulse"></div>
                </div>
              </div>
              <div className="w-full h-40 md:h-48 bg-neutral-gray rounded-xl animate-pulse"></div>
              <div className="space-y-1.5 md:space-y-2.5">
                <div className="w-24 md:w-32 h-3 md:h-4 bg-neutral-gray rounded animate-pulse"></div>
                <div className="grid grid-cols-3 gap-1.5 md:gap-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-14 md:h-16 bg-neutral-gray rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="w-full h-10 md:h-12 bg-neutral-gray rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function POSPage() {
  const { data: apiCategories = [], isLoading: categoriesLoading } = useCategories();
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(posSearch.toLowerCase());
    const matchesCategory = posCategory === "All" || item.category === posCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading || categoriesLoading) {
    return <SkeletonLoader />;
  }

  if (!posSession || !posSession.isOpen) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-170px)] bg-bg-warm p-3.5">
        <div className="glass-card max-w-md w-full text-center space-y-5 sm:space-y-7 p-5 sm:p-7 md:p-11">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-primary-gold text-surface-white flex items-center justify-center mx-auto rounded-2xl">
            <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" />
          </div>
          <div className="space-y-2.5 sm:space-y-3.5">
            <h2 className="text-h4 sm:text-h3 text-dark-surface">Start Your Session</h2>
            <p className="text-body-sm sm:text-body text-dark-surface/60 leading-relaxed">
              Open a new POS session to begin taking orders. Enter the opening cash drawer balance below.
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
            className="space-y-4 sm:space-y-5 text-left"
          >
            <div className="space-y-1.5 sm:space-y-2.5">
              <label className="text-[10px] text-dark-surface/60 block font-semibold">
                Opening Cash Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-dark-surface/40 font-bold text-body-sm sm:text-body">
                  UGX
                </span>
                <input
                  name="openingCash"
                  type="number"
                  required
                  defaultValue="0"
                  min="0"
                  placeholder="0"
                  className="input-standard pl-16 sm:pl-20 text-body-sm sm:text-body py-3.5 sm:py-4 w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-body-sm sm:text-body font-semibold py-3.5 sm:py-4"
            >
              Launch POS Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c === "all") return <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />;
    if (c.includes("breakfast") || c.includes("beverage") || c.includes("coffee") || c.includes("tea") || c.includes("drink")) {
      return <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
    return <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />;
  };

  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const serviceCharge = Math.round(subtotal * 0.025);
  const discount = Number(posDiscount) || 0;
  const total = Math.max(0, subtotal + tax + serviceCharge - discount);

  return (
    <div className="w-full min-h-[calc(100vh-170px)] bg-bg-warm p-2.5 sm:p-3.5 md:p-5">

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 md:gap-5 items-stretch xl:h-[calc(100vh-210px)] xl:min-h-[560px]">

        {/* Column 1: Canteen Menu - Takes 5 columns */}
        <div className="xl:col-span-5 glass-card overflow-hidden flex flex-col min-h-0">
          {/* Header */}
          <div className="p-3.5 sm:p-4 md:p-6 border-b border-neutral-gray bg-surface-white/50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-3.5">
              <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5 flex-wrap">
                <div className="p-1.5 md:p-2 bg-primary-gold text-surface-white rounded-xl flex-shrink-0">
                  <Menu className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h2 className="text-body-lg sm:text-h5 md:text-h4 text-dark-surface">Menu</h2>
                <span className="text-[10px] bg-primary-gold/10 text-secondary-bronze px-2 sm:px-2.5 py-0.5 md:px-3.5 md:py-1 rounded-full font-semibold text-[9px] sm:text-[10px] tracking-wide whitespace-nowrap">
                  {filteredMenu.length} ITEMS
                </span>
              </div>
              <div className="relative w-full sm:w-56 md:w-72 lg:w-80">
                <input
                  type="text"
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="input-standard pl-9 sm:pl-11 md:pl-14 pr-9 md:pr-12 py-2 sm:py-2.5 md:py-3 text-xs sm:text-body-sm w-full"
                />
                <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-3 sm:left-3.5 md:left-4.5 top-1/2 -translate-y-1/2 text-dark-surface/40" />
                {posSearch && (
                  <button onClick={() => setPosSearch("")} className="absolute right-2.5 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 text-dark-surface/40 hover:text-dark-surface/60 border-none bg-transparent cursor-pointer">
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Tabs - Horizontal Scroll with visible themed scrollbar */}
          <div
            className="px-3.5 sm:px-4 md:px-6 pt-3.5 sm:pt-4 md:pt-5 pb-2 sm:pb-2.5 md:pb-3.5 overflow-x-auto overflow-y-hidden flex-shrink-0 min-w-0 [&::-webkit-scrollbar]:h-1.5 sm:[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-neutral-gray/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary-gold/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary-gold"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--tw-color-primary-gold, #c8973f) transparent' }}
          >
            <div className="flex gap-1.5 sm:gap-2.5 md:gap-3 min-w-max">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPosCategory(cat)}
                  className={`px-2.5 sm:px-4 md:px-5 py-1.5 md:py-2.5 text-[10px] sm:text-xs md:text-body-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1 sm:gap-1.5 md:gap-2.5 border-2 rounded-[10px] sm:rounded-xl md:rounded-2xl flex-shrink-0 ${
                    posCategory === cat
                      ? "bg-primary-gold text-surface-white border-primary-gold"
                      : "bg-surface-white text-dark-surface/70 border-neutral-gray hover:border-primary-gold hover:text-primary-gold"
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span className="text-[10px] sm:text-xs md:text-sm">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid - Vertical Scroll Only */}
          <div className="flex-1 min-h-0 p-3.5 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
            {filteredMenu.length === 0 ? (
              <div className="py-14 md:py-16 flex flex-col items-center text-dark-surface/40">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 text-neutral-gray" />
                <p className="text-xs sm:text-body-sm md:text-body">No items found</p>
              </div>
            ) : (
              <div className="grid gap-2.5 md:gap-3.5 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                {filteredMenu.map((item) => {
                  const cartItem = cart.find(c => c.item.id === item.id);
                  const qty = cartItem ? cartItem.qty : 0;

                  return (
                    <div
                      key={item.id}
                      className="border-2 border-neutral-gray p-3 sm:p-3.5 md:p-4 hover:border-primary-gold transition-colors bg-surface-white rounded-[10px] sm:rounded-xl md:rounded-2xl"
                    >
                      <div className="flex gap-2.5 md:gap-3.5">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-bg-warm overflow-hidden flex-shrink-0 flex items-center justify-center text-lg sm:text-xl md:text-2xl border border-neutral-gray rounded-lg sm:rounded-[10px] md:rounded-xl">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                                const parent = (e.currentTarget as HTMLElement).parentElement;
                                const fallback = parent?.querySelector('.fallback-emoji');
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={`fallback-emoji ${item.image ? 'hidden' : ''}`}>🍽️</span>
                          {!item.available && (
                            <div className="absolute inset-0 bg-dark-surface/60 flex items-center justify-center text-surface-white text-[7px] sm:text-[9px] md:text-[10px] font-bold uppercase rounded-lg sm:rounded-[10px] md:rounded-xl">
                              Unavailable
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-0.5">
                            <h4 className="font-semibold text-xs sm:text-body-sm md:text-body text-dark-surface truncate">
                              {item.name}
                            </h4>
                            {item.variety === "Spicy" ? (
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-warning-amber flex-shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-success-green flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs md:text-body-sm font-bold text-primary-gold mt-0.5 md:mt-1">
                            UGX {item.price.toLocaleString()}
                          </p>

                          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mt-2 md:mt-3 flex-wrap 2xl:flex-col">
                            <div className="flex items-center gap-px sm:gap-0.5 md:gap-1 bg-bg-warm px-1 sm:px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (qty > 0) handleUpdateCartQty(item.id, -1);
                                }}
                                className="text-dark-surface/50 hover:text-primary-gold font-bold cursor-pointer border-none bg-transparent p-0 text-xs sm:text-body-sm md:text-body w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-4 sm:w-5 md:w-7 text-center text-[10px] sm:text-xs md:text-body-sm font-bold text-dark-surface">{qty}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCartQty(item.id, 1);
                                }}
                                className="text-dark-surface/50 hover:text-primary-gold font-bold cursor-pointer border-none bg-transparent p-0 text-xs sm:text-body-sm md:text-body w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item);
                              }}
                              className="flex-1 min-w-[44px] bg-success-green hover:bg-success-green/85 text-surface-white text-[9px] sm:text-[10px] md:text-xs font-semibold px-1.5 sm:px-2.5 md:px-3.5 py-1 sm:py-1 md:py-1.5 transition-colors border-none cursor-pointer flex items-center justify-center gap-0.5 md:gap-1.5 rounded-full"
                            >
                              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
                              <span className="hidden sm:inline">Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Running Order Allocations - Takes 4 columns */}
        <div className="xl:col-span-4 glass-card overflow-hidden flex flex-col min-h-0">
          <div className="p-3.5 sm:p-4 md:p-6 border-b border-neutral-gray bg-surface-white/50 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 md:p-2 bg-primary-gold text-surface-white rounded-xl">
                <Table2 className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-body-lg sm:text-h5 md:text-h4 text-dark-surface">Order Details</h2>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 md:p-6 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="space-y-3.5 md:space-y-5">
              {/* Table Selection */}
              <div className="space-y-1.5 md:space-y-2.5">
                <label className="text-[9px] sm:text-[10px] md:text-[10px] text-dark-surface/60 flex items-center gap-1 sm:gap-1.5 font-semibold tracking-wider">
                  <Table2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  ALLOCATE TABLE
                </label>
                <select
                  value={posSelectedTable}
                  onChange={(e) => setPosSelectedTable(e.target.value)}
                  className="input-standard text-xs sm:text-body-sm py-2 sm:py-2.5 md:py-3.5 cursor-pointer font-medium w-full"
                >
                  <option value="">Counter Walk-in</option>
                  <optgroup label="Available Tables">
                    {tables
                      .filter((t) => t.status === "AVAILABLE" || t.status === "CLEANING")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.capacity} seats)
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Occupied Tables">
                    {tables
                      .filter((t) => t.status === "OCCUPIED" || t.status === "RESERVED")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.capacity} seats)
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Customer Details */}
              <div className="space-y-1.5 md:space-y-2.5">
                <label className="text-[9px] sm:text-[10px] md:text-[10px] text-dark-surface/60 flex items-center gap-1 sm:gap-1.5 font-semibold tracking-wider">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  CUSTOMER INFO
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 absolute left-3 sm:left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-dark-surface/40" />
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    className="input-standard pl-8 sm:pl-9 md:pl-12 text-xs sm:text-body-sm py-2 sm:py-2.5 md:py-3.5 w-full"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 absolute left-3 sm:left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-dark-surface/40" />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={posCustomerPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPosCustomerPhone(val);
                      const match = customers.find((c) => c.phone === val || (c.phone.includes(val) && val.length > 5));
                      if (match) {
                        setPosCustomerName(match.name);
                      }
                    }}
                    className="input-standard pl-8 sm:pl-9 md:pl-12 text-xs sm:text-body-sm py-2 sm:py-2.5 md:py-3.5 w-full"
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-1.5 md:space-y-2.5">
                <label className="text-[9px] sm:text-[10px] md:text-[10px] text-dark-surface/60 flex items-center gap-1 sm:gap-1.5 font-semibold tracking-wider">
                  <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  ORDER ITEMS ({cart.length})
                </label>

                {cart.length === 0 ? (
                  <div className="py-9 sm:py-11 md:py-14 text-center border-2 border-dashed border-neutral-gray text-dark-surface/40 rounded-[10px] sm:rounded-xl md:rounded-2xl">
                    <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-neutral-gray mx-auto mb-2 md:mb-3" />
                    <p className="text-[10px] sm:text-xs md:text-body">Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3 overflow-y-auto overflow-x-hidden max-h-[180px] sm:max-h-[220px] md:max-h-[260px]">
                    {cart.map((c) => (
                      <div key={c.item.id} className="bg-bg-warm p-2.5 md:p-3.5 border border-neutral-gray rounded-lg sm:rounded-[10px] md:rounded-xl">
                        <div className="flex justify-between items-start gap-1.5">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-body-sm md:text-body text-dark-surface truncate">
                              {c.item.name}
                            </h4>
                            <p className="text-[9px] sm:text-[10px] md:text-caption text-dark-surface/60 mt-0.5">
                              UGX {c.item.price.toLocaleString()} each
                            </p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2.5 flex-shrink-0">
                            <button
                              onClick={() => handleUpdateCartQty(c.item.id, -1)}
                              className="text-dark-surface/40 hover:text-primary-gold cursor-pointer border-none bg-transparent p-0"
                            >
                              <MinusCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            </button>
                            <span className="font-bold text-xs sm:text-body-sm md:text-body w-5 sm:w-6 md:w-8 text-center text-dark-surface">{c.qty}</span>
                            <button
                              onClick={() => handleUpdateCartQty(c.item.id, 1)}
                              className="text-dark-surface/40 hover:text-primary-gold cursor-pointer border-none bg-transparent p-0"
                            >
                              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Add note..."
                          value={c.notes || ""}
                          onChange={(e) => handleUpdateItemNote(c.item.id, e.target.value)}
                          className="w-full mt-2 md:mt-3 text-[9px] sm:text-[10px] md:text-caption p-1.5 md:p-2.5 bg-surface-white border border-neutral-gray outline-none focus:border-primary-gold transition-colors text-dark-surface/60 rounded-md sm:rounded-lg md:rounded-xl"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Cart Summary & Payments - Takes 3 columns */}
        <div className="xl:col-span-3 glass-card overflow-hidden flex flex-col min-h-0">
          <div className="p-3.5 sm:p-4 md:p-6 border-b border-neutral-gray bg-surface-white/50 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 md:p-2 bg-primary-gold text-surface-white rounded-xl">
                <Receipt className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h2 className="text-body-lg sm:text-h5 md:text-h4 text-dark-surface">Summary</h2>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 md:p-6 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="space-y-3.5 md:space-y-5">
              {/* Notes & Discount */}
              <div className="space-y-2.5 md:space-y-3.5">
                <div className="space-y-1.5 md:space-y-2.5">
                  <label className="text-[9px] sm:text-[10px] md:text-[10px] text-dark-surface/60 flex items-center gap-1 sm:gap-1.5 font-semibold tracking-wider">
                    <StickyNote className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                    ORDER NOTES
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Special instructions..."
                    value={posOrderNote}
                    onChange={(e) => setPosOrderNote(e.target.value)}
                    className="input-standard text-xs sm:text-body-sm py-2 sm:py-2.5 md:py-3.5 resize-none w-full"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2.5">
                  <label className="text-[9px] sm:text-[10px] md:text-[10px] text-dark-surface/60 flex items-center gap-1 sm:gap-1.5 font-semibold tracking-wider">
                    <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                    DISCOUNT
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-dark-surface/40 font-bold text-[10px] sm:text-xs md:text-body-sm">
                      UGX
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={posDiscount || ""}
                      onChange={(e) => setPosDiscount(Math.max(0, Number(e.target.value)))}
                      className="input-standard pl-10 sm:pl-12 md:pl-16 text-xs sm:text-body-sm font-semibold py-2 sm:py-2.5 md:py-3.5 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="bg-bg-warm p-3 sm:p-3.5 md:p-5 border border-neutral-gray rounded-[10px] sm:rounded-xl md:rounded-2xl">
                <div className="space-y-1.5 md:space-y-3">
                  <div className="flex justify-between text-[10px] sm:text-xs md:text-body-sm">
                    <span className="text-dark-surface/60">Subtotal</span>
                    <span className="font-semibold text-dark-surface text-[10px] sm:text-xs md:text-body-sm">
                      UGX {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs md:text-body-sm">
                    <span className="text-dark-surface/60">GST (5%)</span>
                    <span className="font-semibold text-dark-surface text-[10px] sm:text-xs md:text-body-sm">
                      UGX {tax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-xs md:text-body-sm">
                    <span className="text-dark-surface/60">Service (2.5%)</span>
                    <span className="font-semibold text-dark-surface text-[10px] sm:text-xs md:text-body-sm">
                      UGX {serviceCharge.toLocaleString()}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[10px] sm:text-xs md:text-body-sm text-error-red">
                      <span>Discount</span>
                      <span className="font-semibold">
                        - UGX {discount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-neutral-gray pt-2 sm:pt-2.5 md:pt-3.5 mt-2 md:mt-3 flex justify-between items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm md:text-body-lg text-dark-surface">Total</span>
                    <span className="font-bold text-sm sm:text-base md:text-h5 text-primary-gold text-right">
                      UGX {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5 md:space-y-2.5">
                <label className="text-[9px] sm:text-[10px] md:text-[10px] text-dark-surface/60 flex items-center gap-1 sm:gap-1.5 font-semibold tracking-wider">
                  <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                  PAYMENT METHOD
                </label>
                <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2.5">
                  {[
                    { id: "UPI", icon: <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />, label: "Mobile" },
                    { id: "CASH", icon: <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />, label: "Cash" },
                    { id: "CARD", icon: <CardIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />, label: "Card" }
                  ].map(({ id, icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setPosPaymentMethod(id as any)}
                      className={`flex-1 min-w-[84px] basis-[84px] py-2 sm:py-2.5 md:py-3.5 border-2 text-center transition-colors flex flex-col items-center gap-0.5 md:gap-1.5 rounded-lg sm:rounded-[10px] md:rounded-xl ${
                        posPaymentMethod === id
                          ? "border-primary-gold bg-primary-gold/10 text-primary-gold"
                          : "border-neutral-gray hover:border-primary-gold text-dark-surface/60 bg-surface-white hover:text-primary-gold"
                      }`}
                    >
                      {icon}
                      <span className="text-[9px] sm:text-[10px] md:text-body-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 md:space-y-2.5 pt-0.5 md:pt-1.5">
                {currentRole === "receptionist" && (
                  <button
                    onClick={() => handlePosCheckout(false)}
                    className="btn-primary w-full text-[10px] sm:text-xs md:text-body-sm font-semibold py-2.5 sm:py-3 md:py-3.5"
                  >
                    <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    Generate Token
                  </button>
                )}

                {currentRole === "cashier" && (
                  <button
                    onClick={() => handlePosCheckout(true)}
                    className="btn-primary w-full text-[10px] sm:text-xs md:text-body-sm font-semibold py-2.5 sm:py-3 md:py-3.5"
                  >
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    Complete Sale
                  </button>
                )}

                {currentRole === "manager" && (
                  <div className="flex flex-wrap gap-1.5 md:gap-2.5">
                    <button
                      onClick={() => handlePosCheckout(false)}
                      className="btn-secondary flex-1 min-w-[120px] text-[10px] sm:text-xs md:text-body-sm font-semibold py-2.5 sm:py-3 md:py-3.5"
                    >
                      <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      Token
                    </button>
                    <button
                      onClick={() => handlePosCheckout(true)}
                      className="btn-primary flex-1 min-w-[120px] text-[10px] sm:text-xs md:text-body-sm font-semibold py-2.5 sm:py-3 md:py-3.5"
                    >
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}