"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coffee, Users, Plus, Trash2, Edit, Check, ClipboardList, 
  Utensils, DollarSign, Clock, CheckCircle2, Ticket, ShoppingCart, 
  Printer, User, Phone, CheckCircle, RefreshCw, X
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED";
}

interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: "Mains" | "Snacks" | "Beverages" | "Desserts";
  variety: "Regular" | "Jain" | "Spicy" | "Sweet";
}

interface CanteenOrder {
  id: string;
  tokenNumber: string;
  customerName: string;
  customerPhone: string;
  tableName: string;
  items: { item: FoodItem; qty: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "CASH" | "UPI" | "CARD";
  status: "PENDING" | "SERVED" | "CANCELLED";
  timestamp: string;
}

export default function CanteenCRMPage() {
  const [activeTab, setActiveTab] = useState<"pos" | "tables" | "menu" | "orders">("pos");

  // 1. Initial Tables State
  const [tables, setTables] = useState<SeatingTable[]>([
    { id: "tab-1", name: "Table 1 (Window)", capacity: 4, status: "AVAILABLE" },
    { id: "tab-2", name: "Table 2 (Corner)", capacity: 2, status: "AVAILABLE" },
    { id: "tab-3", name: "Table 3 (Center)", capacity: 6, status: "OCCUPIED" },
    { id: "tab-4", name: "Table 4 (Center)", capacity: 4, status: "AVAILABLE" },
    { id: "tab-5", name: "Table 5 (Satsang Area)", capacity: 8, status: "RESERVED" },
    { id: "tab-6", name: "Table 6 (Entrance)", capacity: 4, status: "AVAILABLE" },
  ]);

  // 2. Initial Food Menu State
  const [foodMenu, setFoodMenu] = useState<FoodItem[]>([
    { id: "food-1", name: "Pure Veg Masala Dosa", price: 120, category: "Snacks", variety: "Regular" },
    { id: "food-2", name: "Jain Special Khichdi", price: 150, category: "Mains", variety: "Jain" },
    { id: "food-3", name: "Butter Paneer Masala", price: 180, category: "Mains", variety: "Spicy" },
    { id: "food-4", name: "Saffron Kheer", price: 90, category: "Desserts", variety: "Sweet" },
    { id: "food-5", name: "Kampala Ginger Chai", price: 30, category: "Beverages", variety: "Regular" },
    { id: "food-6", name: "Mango Lassi", price: 70, category: "Beverages", variety: "Sweet" },
    { id: "food-7", name: "Spicy Samosa Chat", price: 80, category: "Snacks", variety: "Spicy" },
  ]);

  // 3. Initial Orders State
  const [orders, setOrders] = useState<CanteenOrder[]>([
    {
      id: "ord-1",
      tokenNumber: "TK-2041",
      customerName: "Kamlesh Patel",
      customerPhone: "+256 701 234567",
      tableName: "Table 3 (Center)",
      items: [
        { item: { id: "food-2", name: "Jain Special Khichdi", price: 150, category: "Mains", variety: "Jain" }, qty: 2 },
        { item: { id: "food-5", name: "Kampala Ginger Chai", price: 30, category: "Beverages", variety: "Regular" }, qty: 2 }
      ],
      subtotal: 360,
      tax: 18,
      total: 378,
      paymentMethod: "UPI",
      status: "PENDING",
      timestamp: "10:15 AM"
    },
    {
      id: "ord-2",
      tokenNumber: "TK-2040",
      customerName: "Amit Vora",
      customerPhone: "+256 752 987654",
      tableName: "Table 5 (Satsang Area)",
      items: [
        { item: { id: "food-3", name: "Butter Paneer Masala", price: 180, category: "Mains", variety: "Spicy" }, qty: 1 },
        { item: { id: "food-6", name: "Mango Lassi", price: 70, category: "Beverages", variety: "Sweet" }, qty: 2 }
      ],
      subtotal: 320,
      tax: 16,
      total: 336,
      paymentMethod: "CASH",
      status: "SERVED",
      timestamp: "09:45 AM"
    }
  ]);

  // POS CART STATE
  const [cart, setCart] = useState<{ item: FoodItem; qty: number }[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [activeTicket, setActiveTicket] = useState<CanteenOrder | null>(null);

  // Configure Add Table Form State
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);

  // Configure Add Food Form State
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodPrice, setNewFoodPrice] = useState<number>(100);
  const [newFoodCategory, setNewFoodCategory] = useState<"Mains" | "Snacks" | "Beverages" | "Desserts">("Mains");
  const [newFoodVariety, setNewFoodVariety] = useState<"Regular" | "Jain" | "Spicy" | "Sweet">("Regular");

  // --- ACTIONS ---

  // Seating layout modification
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;
    const newTab: SeatingTable = {
      id: "tab-" + Date.now(),
      name: newTableName,
      capacity: newTableCapacity,
      status: "AVAILABLE"
    };
    setTables([...tables, newTab]);
    setNewTableName("");
  };

  const handleDeleteTable = (id: string) => {
    setTables(tables.filter((t) => t.id !== id));
  };

  const toggleTableStatus = (id: string, nextStatus: "AVAILABLE" | "OCCUPIED" | "RESERVED") => {
    setTables(tables.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
  };

  // Food Menu modification
  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName) return;
    const newFood: FoodItem = {
      id: "food-" + Date.now(),
      name: newFoodName,
      price: newFoodPrice,
      category: newFoodCategory,
      variety: newFoodVariety
    };
    setFoodMenu([...foodMenu, newFood]);
    setNewFoodName("");
  };

  const handleDeleteFood = (id: string) => {
    setFoodMenu(foodMenu.filter((f) => f.id !== id));
  };

  // Cart operations
  const addToCart = (item: FoodItem) => {
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      setCart(cart.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { item, qty: 1 }]);
    }
  };

  const updateCartQty = (itemId: string, delta: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.item.id === itemId) {
            const nextQty = c.qty + delta;
            return { ...c, qty: nextQty };
          }
          return c;
        })
        .filter((c) => c.qty > 0)
    );
  };

  // Ticket checkout POS CRM
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Please add at least one food item to check out.");
      return;
    }

    const subtotal = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);
    const tax = Math.round(subtotal * 0.05); // 5% VAT
    const total = subtotal + tax;

    const matchedTable = tables.find((t) => t.id === selectedTable);
    const tableNameText = matchedTable ? matchedTable.name : "Walk-in Counter";

    const tokenNum = "TK-" + Math.floor(2000 + Math.random() * 8000);

    const newOrder: CanteenOrder = {
      id: "ord-" + Date.now(),
      tokenNumber: tokenNum,
      customerName: customerName || "Guest Devotee",
      customerPhone: customerPhone || "N/A",
      tableName: tableNameText,
      items: [...cart],
      subtotal,
      tax,
      total,
      paymentMethod,
      status: "PENDING",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save order
    setOrders([newOrder, ...orders]);

    // Set table as occupied if table is allocated
    if (selectedTable) {
      setTables(tables.map((t) => (t.id === selectedTable ? { ...t, status: "OCCUPIED" } : t)));
    }

    // Set token receipt display
    setActiveTicket(newOrder);

    // Reset POS cart state
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setSelectedTable("");
  };

  // Update real-time order status
  const updateOrderStatus = (id: string, nextStatus: "PENDING" | "SERVED" | "CANCELLED") => {
    setOrders(
      orders.map((o) => {
        if (o.id === id) {
          // If table was occupied, return it to available when order is served
          if (nextStatus === "SERVED") {
            const tableToFree = tables.find((t) => t.name === o.tableName);
            if (tableToFree) {
              setTables(tables.map((t) => (t.id === tableToFree.id ? { ...t, status: "AVAILABLE" } : t)));
            }
          }
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
  };

  // Statistics
  const occupiedTablesCount = tables.filter((t) => t.status === "OCCUPIED").length;
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const totalCanteenSales = orders
    .filter((o) => o.status === "SERVED")
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#2B132C] flex items-center gap-2">
            <Coffee className="w-6 h-6 text-[#B47F35]" />
            <span>Temple Canteen CRM & POS</span>
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Offline counter ticketing, seating allocations, food menu edits, and real-time kitchen order dispatch.
          </p>
        </div>

        {/* Tab toggles */}
        <div className="flex bg-white border border-[#B47F35]/15 p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("pos")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "pos" ? "bg-[#B47F35] text-white shadow-sm" : "text-secondary-bronze hover:text-[#B47F35]"
            }`}
          >
            Counter POS
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "tables" ? "bg-[#B47F35] text-white shadow-sm" : "text-secondary-bronze hover:text-[#B47F35]"
            }`}
          >
            Seating Layout
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "menu" ? "bg-[#B47F35] text-white shadow-sm" : "text-secondary-bronze hover:text-[#B47F35]"
            }`}
          >
            Food Menu Customization
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === "orders" ? "bg-[#B47F35] text-white shadow-sm" : "text-secondary-bronze hover:text-[#B47F35]"
            }`}
          >
            Kitchen orders ({pendingOrdersCount})
          </button>
        </div>
      </div>

      {/* METRIC BADGES CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35]">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary-bronze/70 tracking-wider">Active Tables</p>
            <h4 className="text-lg font-bold text-[#2B132C] mt-0.5">
              {occupiedTablesCount} / {tables.length} Occupied
            </h4>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary-bronze/70 tracking-wider">Today Canteen Sales</p>
            <h4 className="text-lg font-bold text-[#2B132C] mt-0.5">
              ₹{totalCanteenSales.toLocaleString("en-IN")}
            </h4>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#2B132C]/10 flex items-center justify-center text-[#2B132C]">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary-bronze/70 tracking-wider">Pending Kitchen Tokens</p>
            <h4 className="text-lg font-bold text-[#2B132C] mt-0.5">
              {pendingOrdersCount} Food Queues
            </h4>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-secondary-bronze/70 tracking-wider">Average Prep Time</p>
            <h4 className="text-lg font-bold text-[#2B132C] mt-0.5">12 mins</h4>
          </div>
        </div>

      </div>

      {/* RENDER ACTIVE TABS */}
      <AnimatePresence mode="wait">
        
        {/* A. COUNTER POS TICKET BOOKING */}
        {activeTab === "pos" && (
          <motion.div
            key="pos-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* POS FOOD PICKER (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Category picker filter */}
              <div className="bg-white border border-[#B47F35]/15 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4" />
                  <span>Select Food Items</span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {foodMenu.map((food) => (
                    <div 
                      key={food.id}
                      onClick={() => addToCart(food)}
                      className="bg-[#FAF7F2]/50 border border-primary-gold/15 p-4 rounded-xl flex flex-col justify-between text-left cursor-pointer hover:border-[#B47F35] hover:bg-[#B47F35]/5 transition-all shadow-sm select-none"
                    >
                      <div className="space-y-1">
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase bg-[#B47F35]/10 text-[#B47F35]">
                          {food.variety} • {food.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#2B132C] mt-1.5">{food.name}</h4>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-primary-gold/10">
                        <span className="text-xs font-bold text-[#B47F35]">₹{food.price}</span>
                        <span className="text-[10px] font-bold text-[#B47F35] hover:text-[#8B5E34]">
                          + Add to Cart
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TICKET TOKEN SUCCESS DIALOG DISPLAY */}
              {activeTicket && (
                <div className="bg-white border-2 border-green-500 rounded-3xl p-6 text-left relative shadow-xl">
                  <button 
                    onClick={() => setActiveTicket(null)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#B47F35]/15 flex items-center justify-center text-secondary-bronze cursor-pointer"
                  >
                    ✕
                  </button>
                  
                  <div className="flex items-center space-x-3 text-green-600 mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider">Offline Ticket Booked successfully</h4>
                      <p className="text-[10px] text-secondary-bronze/70 font-sans">Payment processed and seat table allocated.</p>
                    </div>
                  </div>

                  {/* Printable receipt card */}
                  <div id="canteen-receipt" className="bg-[#FAF7F2] border border-[#B47F35]/15 rounded-2xl p-5 space-y-3 font-mono text-xs text-dark-surface/90">
                    <div className="text-center border-b border-[#B47F35]/15 pb-3">
                      <h3 className="font-bold text-sm tracking-wider uppercase">SKSS Kampala Canteen</h3>
                      <p className="text-[9px] font-sans text-secondary-bronze mt-0.5">Shree Swaminarayan Complex, Bukoto</p>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>TOKEN NUMBER:</span>
                        <span className="font-bold text-base text-[#B47F35]">{activeTicket.tokenNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Allocated Seating:</span>
                        <span className="font-bold">{activeTicket.tableName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Name:</span>
                        <span>{activeTicket.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Booked:</span>
                        <span>{activeTicket.timestamp}</span>
                      </div>
                    </div>

                    <div className="h-[1px] bg-[#B47F35]/15 my-2" />

                    {/* Items table */}
                    <div className="space-y-1 text-[10px]">
                      {activeTicket.items.map((c, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{c.item.name} x {c.qty}</span>
                          <span>₹{c.item.price * c.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div className="h-[1px] bg-[#B47F35]/15 my-2" />

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{activeTicket.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (5%):</span>
                        <span>₹{activeTicket.tax}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL AMOUNT:</span>
                        <span className="text-[#B47F35]">₹{activeTicket.total}</span>
                      </div>
                    </div>

                    <div className="border-t border-[#B47F35]/15 pt-3 text-center text-[9px] font-sans text-secondary-bronze">
                      <p>Scan token at pickup counter when served.</p>
                      <p className="mt-1 font-bold">PAID VIA {activeTicket.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Ticket Token</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* POS CRM CHECKOUT SIDEBAR (4 cols) */}
            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-5 space-y-6 text-left h-full flex flex-col justify-between">
                
                <div className="space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4" />
                    <span>POS Billing Order</span>
                  </h3>

                  {/* Cart items list */}
                  {cart.length === 0 ? (
                    <div className="py-12 text-center text-secondary-bronze/60 text-xs font-sans">
                      <Coffee className="w-8 h-8 text-[#B47F35]/30 mx-auto mb-2" />
                      <p>Cart is empty. Select food items to build an order.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                      {cart.map((c) => (
                        <div key={c.item.id} className="flex justify-between items-center text-xs font-sans">
                          <div className="text-left space-y-0.5">
                            <h4 className="font-bold text-[#2B132C]">{c.item.name}</h4>
                            <span className="text-[10px] text-secondary-bronze/65">₹{c.item.price} each</span>
                          </div>
                          
                          <div className="flex items-center space-x-2.5">
                            <button 
                              onClick={() => updateCartQty(c.item.id, -1)}
                              className="w-5 h-5 rounded bg-bg-warm flex items-center justify-center font-bold text-secondary-bronze hover:bg-[#B47F35]/10 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-bold text-dark-surface w-4 text-center">{c.qty}</span>
                            <button 
                              onClick={() => updateCartQty(c.item.id, 1)}
                              className="w-5 h-5 rounded bg-bg-warm flex items-center justify-center font-bold text-secondary-bronze hover:bg-[#B47F35]/10 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Customer details */}
                  <div className="space-y-3 pt-3 border-t border-[#B47F35]/10">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">Cust Name</span>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Devotee name"
                          className="w-full px-2.5 py-1.5 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">Mobile</span>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+256..."
                          className="w-full px-2.5 py-1.5 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Seat allocation */}
                    <div>
                      <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">Allocate Seating Table</span>
                      <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs outline-none font-semibold text-secondary-bronze"
                      >
                        <option value="">Counter Walk-in (No Table)</option>
                        {tables.map((t) => (
                          <option 
                            key={t.id} 
                            value={t.id} 
                            disabled={t.status !== "AVAILABLE"}
                          >
                            {t.name} ({t.capacity} Seats) - {t.status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment methods */}
                    <div>
                      <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1.5">Payment Method</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {["UPI", "CASH", "CARD"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethod(m as any)}
                            className={`py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center ${
                              paymentMethod === m 
                                ? "border-[#B47F35] bg-[#B47F35]/15 text-[#B47F35]" 
                                : "border-primary-gold/15 bg-white text-secondary-bronze"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Totals & Submit */}
                <div className="pt-4 border-t border-[#B47F35]/10 mt-6 space-y-4">
                  <div className="space-y-1.5 text-xs text-secondary-bronze">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{cart.reduce((acc, c) => acc + c.item.price * c.qty, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%):</span>
                      <span>₹{Math.round(cart.reduce((acc, c) => acc + c.item.price * c.qty, 0) * 0.05)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#2B132C] text-sm">
                      <span>Total Amount:</span>
                      <span className="text-[#B47F35] font-heading">
                        ₹{(cart.reduce((acc, c) => acc + c.item.price * c.qty, 0) + Math.round(cart.reduce((acc, c) => acc + c.item.price * c.qty, 0) * 0.05)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Generate Canteen Ticket</span>
                  </button>
                </div>

              </GlassCard>
            </div>

          </motion.div>
        )}

        {/* B. SEATING TABLES MANAGEMENT */}
        {activeTab === "tables" && (
          <motion.div
            key="tables-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Tables Grid Layout (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Utensils className="w-4 h-4" />
                  <span>Canteen Table Layout Configuration</span>
                </h3>
                <span className="text-[10px] text-secondary-bronze/70 font-sans">
                  Total Seating Capacity: {tables.reduce((acc, t) => acc + t.capacity, 0)} Seats
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {tables.map((table) => (
                  <div 
                    key={table.id}
                    className={`border rounded-2xl p-5 text-left flex flex-col justify-between space-y-4 shadow-sm transition-colors ${
                      table.status === "AVAILABLE" ? "border-green-500/25 bg-green-500/5 text-green-700" :
                      table.status === "OCCUPIED" ? "border-error-red/25 bg-error-red/5 text-[#2B132C]" :
                      "border-[#B47F35]/30 bg-[#B47F35]/5 text-[#B47F35]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-[#2B132C]">{table.name}</h4>
                        <span className="text-[9px] text-secondary-bronze/80 font-sans mt-0.5 block">
                          Capacity: {table.capacity} Devotees
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="text-secondary-bronze/50 hover:text-error-red transition-colors cursor-pointer"
                        title="Delete Table"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-primary-gold/10">
                      <span className="text-[8px] font-bold uppercase block text-secondary-bronze/65">
                        Current Status
                      </span>
                      
                      <div className="grid grid-cols-3 gap-1">
                        {["AVAILABLE", "OCCUPIED", "RESERVED"].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => toggleTableStatus(table.id, status as any)}
                            className={`py-1 rounded text-[7px] font-bold text-center cursor-pointer uppercase ${
                              table.status === status 
                                ? "bg-white shadow-sm border border-primary-gold/30 font-bold" 
                                : "opacity-60 hover:opacity-100"
                            }`}
                          >
                            {status.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Add Table Form Sidebar (4 cols) */}
            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-5 space-y-6 text-left h-full">
                
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Seating Table</span>
                </h3>

                <form onSubmit={handleAddTable} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Table Label / Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTableName}
                      onChange={(e) => setNewTableName(e.target.value)}
                      placeholder="e.g. Table 7 (Window Area)"
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Seating Capacity (Devotees) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newTableCapacity}
                      onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 4)}
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Table</span>
                  </button>
                </form>

              </GlassCard>
            </div>

          </motion.div>
        )}

        {/* C. FOOD MENU MANAGEMENT */}
        {activeTab === "menu" && (
          <motion.div
            key="menu-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            
            {/* Menu List Table (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6">
              
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                <Coffee className="w-4 h-4" />
                <span>Canteen Food Menu Customization</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full font-sans text-xs">
                  <thead>
                    <tr className="border-b border-[#B47F35]/15 text-left text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                      <th className="pb-3">Item Details</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Variety</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B47F35]/10">
                    {foodMenu.map((item) => (
                      <tr key={item.id} className="text-left text-[#2B132C]">
                        <td className="py-3.5 font-semibold">{item.name}</td>
                        <td className="py-3.5">{item.category}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            item.variety === "Jain" ? "bg-green-500/10 text-green-700" :
                            item.variety === "Spicy" ? "bg-red-500/10 text-red-600" :
                            "bg-[#B47F35]/10 text-[#B47F35]"
                          }`}>
                            {item.variety}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-[#B47F35]">₹{item.price}</td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteFood(item.id)}
                            className="text-secondary-bronze/50 hover:text-error-red transition-colors cursor-pointer"
                            title="Remove Food Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Add Food Form (4 cols) */}
            <div className="lg:col-span-4">
              <GlassCard hoverEffect={false} className="bg-white border border-[#B47F35]/15 rounded-[32px] p-5 space-y-6 text-left h-full">
                
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>Add Food Item</span>
                </h3>

                <form onSubmit={handleAddFood} className="space-y-4 font-sans text-xs">
                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Food Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFoodName}
                      onChange={(e) => setNewFoodName(e.target.value)}
                      placeholder="e.g. Idli Sambar Platter"
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                      Price (INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={newFoodPrice}
                      onChange={(e) => setNewFoodPrice(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                        Category
                      </label>
                      <select
                        value={newFoodCategory}
                        onChange={(e: any) => setNewFoodCategory(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                      >
                        <option value="Mains">Mains</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Desserts">Desserts</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-1">
                        Variety
                      </label>
                      <select
                        value={newFoodVariety}
                        onChange={(e: any) => setNewFoodVariety(e.target.value)}
                        className="w-full p-2 bg-[#FAF7F2]/50 border border-primary-gold/15 rounded-lg text-xs"
                      >
                        <option value="Regular">Regular</option>
                        <option value="Jain">Jain</option>
                        <option value="Spicy">Spicy</option>
                        <option value="Sweet">Sweet</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#B47F35] hover:bg-[#8B5E34] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Food Item</span>
                  </button>
                </form>

              </GlassCard>
            </div>

          </motion.div>
        )}

        {/* D. ACTIVE KITCHEN ORDERS & TOKENS QUEUE */}
        {activeTab === "orders" && (
          <motion.div
            key="orders-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="bg-white border border-[#B47F35]/15 rounded-3xl p-6 shadow-sm space-y-6"
          >
            
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B47F35] flex items-center gap-1.5">
              <ClipboardList className="w-4 h-4" />
              <span>Real-Time Kitchen Tokens & Food Dispatch</span>
            </h3>

            <div className="space-y-4 font-sans text-xs">
              {orders.length === 0 ? (
                <p className="py-12 text-center text-secondary-bronze/65">No tickets found in the queue.</p>
              ) : (
                orders.map((o) => (
                  <div 
                    key={o.id}
                    className={`border rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-6 items-stretch text-left transition-colors ${
                      o.status === "PENDING" ? "border-[#B47F35]/25 bg-[#B47F35]/5" :
                      o.status === "SERVED" ? "border-green-500/25 bg-green-500/5 opacity-80" :
                      "border-secondary-bronze/10 bg-[#FAF7F2] opacity-60"
                    }`}
                  >
                    
                    {/* Ticket details left */}
                    <div className="space-y-3 md:w-1/3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-[#B47F35] font-mono">{o.tokenNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          o.status === "PENDING" ? "bg-[#B47F35]/15 text-[#B47F35]" :
                          o.status === "SERVED" ? "bg-green-500/10 text-green-700" :
                          "bg-secondary-bronze/20 text-secondary-bronze"
                        }`}>
                          {o.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-secondary-bronze">
                        <p className="font-bold text-[#2B132C]">{o.customerName}</p>
                        <p className="text-[10px]">Phone: {o.customerPhone}</p>
                        <p className="text-[10px]">Seat Allocation: {o.tableName}</p>
                        <p className="text-[9px] italic">Booked: {o.timestamp} • Paid via {o.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Ordered Items middle */}
                    <div className="md:w-1/3 flex flex-col justify-center border-y md:border-y-0 md:border-x border-[#B47F35]/10 py-3 md:py-0 md:px-6">
                      <span className="text-[8px] font-bold uppercase text-[#2B132C]/65 block mb-2">Items Ordered</span>
                      <ul className="space-y-1">
                        {o.items.map((i, idx) => (
                          <li key={idx} className="flex justify-between font-semibold">
                            <span>{i.item.name}</span>
                            <span>x {i.qty}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions right */}
                    <div className="md:w-1/3 flex flex-col justify-between items-end">
                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider block">Total paid</span>
                        <span className="text-base font-heading font-bold text-[#B47F35]">
                          ₹{o.total.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {o.status === "PENDING" && (
                        <div className="flex gap-2 w-full justify-end mt-4">
                          <button
                            onClick={() => updateOrderStatus(o.id, "CANCELLED")}
                            className="px-3.5 py-1.5 rounded-lg border border-error-red/35 text-error-red hover:bg-error-red/10 text-[10px] font-bold uppercase cursor-pointer"
                          >
                            Cancel Token
                          </button>
                          <button
                            onClick={() => updateOrderStatus(o.id, "SERVED")}
                            className="px-3.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Served</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
