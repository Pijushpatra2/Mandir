export type CanteenRole = "manager" | "receptionist" | "cashier" | "kitchen";

export interface CanteenStaffAccount {
  id: string;
  email: string;
  password?: string;
  name: string;
  assignedRole: CanteenRole;
  createdAt: string;
}

export interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
  currentBill?: number;
  occupiedDuration?: string; // e.g., "45 mins"
  mergedWith?: string[]; // IDs of tables merged with this one
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  category: string;
  variety: "Regular" | "Jain" | "Spicy" | "Sweet";
  available: boolean;
  image?: string;
  channel?: "canteen" | "e-com" | "both";
}

export interface CanteenOrder {
  id: string;
  tokenNumber: string;
  customerName: string;
  customerPhone: string;
  tableName: string;
  items: { item: FoodItem; qty: number; notes?: string }[];
  subtotal: number;
  tax: number; // e.g. 5% GST
  serviceCharge: number; // e.g. 2.5% Service Charge
  discount: number; // flat discount amount
  total: number;
  paymentMethod: "CASH" | "UPI" | "CARD" | "PENDING";
  paymentStatus: "PAID" | "PENDING";
  status: "NEW" | "PREPARING" | "READY_TO_SERVE" | "COMPLETED" | "CANCELLED";
  timestamp: string;
  date: string;
  notes?: string;
  note?: string;
}

export interface TableBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  tableId: string;
  tableName: string;
  time: string; // e.g., "12:30 PM"
  date: string; // YYYY-MM-DD
  partySize: number;
  status: "CONFIRMED" | "SEATED" | "CANCELLED";
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "Grains" | "Dairy" | "Spices" | "Beverages" | "Vegetables" | "Other";
  stock: number;
  unit: string; // kg, Litre, Packet, Bag
  minStock: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  itemsSupplied: string[];
}

export interface CanteenCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalVisits?: number;
  totalSpent: number;
  lastVisit: string;
  type?: "VIP" | "Regular" | "Guest";
}

// Initial Mock Tables
export const initialTables: SeatingTable[] = [
  { id: "tab-1", name: "Table 1 (Window)", capacity: 4, status: "AVAILABLE" },
  { id: "tab-2", name: "Table 2 (Corner)", capacity: 2, status: "CLEANING", occupiedDuration: "" },
  { id: "tab-3", name: "Table 3 (Center)", capacity: 6, status: "OCCUPIED", currentBill: 460, occupiedDuration: "42 mins" },
  { id: "tab-4", name: "Table 4 (Center)", capacity: 4, status: "AVAILABLE" },
  { id: "tab-5", name: "Table 5 (Satsang)", capacity: 8, status: "RESERVED", occupiedDuration: "" },
  { id: "tab-6", name: "Table 6 (Entrance)", capacity: 4, status: "AVAILABLE" },
  { id: "tab-7", name: "Table 7 (Veranda)", capacity: 4, status: "OCCUPIED", currentBill: 280, occupiedDuration: "18 mins" },
  { id: "tab-8", name: "Table 8 (Veranda)", capacity: 2, status: "AVAILABLE" }
];

// Initial Food Menu Items
export const initialMenu: FoodItem[] = [
  { id: "food-1", name: "Pure Veg Masala Dosa", price: 120, category: "Snacks", variety: "Regular", available: true, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=300" },
  { id: "food-2", name: "Jain Special Khichdi", price: 150, category: "Mains", variety: "Jain", available: true, image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=300" },
  { id: "food-3", name: "Butter Paneer Masala & Naan", price: 180, category: "Mains", variety: "Spicy", available: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=300" },
  { id: "food-4", name: "Saffron Kheer", price: 90, category: "Desserts", variety: "Sweet", available: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=300" },
  { id: "food-5", name: "Ginger Cardamom Tea", price: 30, category: "Beverages", variety: "Regular", available: true, image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=300" },
  { id: "food-6", name: "Mango Lassi Sweet", price: 70, category: "Beverages", variety: "Sweet", available: true, image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=300" },
  { id: "food-7", name: "Spicy Samosa Chaat Platter", price: 80, category: "Snacks", variety: "Spicy", available: true, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=300" },
  { id: "food-8", name: "Swaminarayan Special Thali", price: 250, category: "Mains", variety: "Regular", available: true, image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=300" },
  
  // Combos
  { id: "combo-1", name: "Dosa + Mango Lassi Combo", price: 170, category: "Combos", variety: "Regular", available: true, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=300" },
  { id: "combo-2", name: "Naan & Paneer + Soft Drink", price: 220, category: "Combos", variety: "Spicy", available: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=300" },
  
  // Add-ons
  { id: "addon-1", name: "Extra Butter Paneer Gravy", price: 60, category: "Add-ons", variety: "Regular", available: true },
  { id: "addon-2", name: "Extra Cheese Topping", price: 30, category: "Add-ons", variety: "Regular", available: true }
];

// Initial Canteen Orders
export const initialOrders: CanteenOrder[] = [
  {
    id: "ord-1",
    tokenNumber: "TK-2041",
    customerName: "Kamlesh Patel",
    customerPhone: "+256 701 234567",
    tableName: "Table 3 (Center)",
    items: [
      { item: initialMenu[1], qty: 2, notes: "Low spice" },
      { item: initialMenu[4], qty: 2 }
    ],
    subtotal: 360,
    tax: 18,
    serviceCharge: 9,
    discount: 0,
    total: 387,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    status: "PREPARING",
    timestamp: "01:15 PM",
    date: "2026-07-04"
  },
  {
    id: "ord-2",
    tokenNumber: "TK-2040",
    customerName: "Amit Vora",
    customerPhone: "+256 752 987654",
    tableName: "Table 7 (Veranda)",
    items: [
      { item: initialMenu[2], qty: 1 },
      { item: initialMenu[5], qty: 2 }
    ],
    subtotal: 320,
    tax: 16,
    serviceCharge: 8,
    discount: 20,
    total: 324,
    paymentMethod: "CASH",
    paymentStatus: "PAID",
    status: "READY_TO_SERVE",
    timestamp: "12:45 PM",
    date: "2026-07-04"
  },
  {
    id: "ord-3",
    tokenNumber: "TK-2042",
    customerName: "Sanjay Mehta",
    customerPhone: "+256 703 112233",
    tableName: "Counter Walk-in",
    items: [
      { item: initialMenu[0], qty: 1 },
      { item: initialMenu[6], qty: 1 }
    ],
    subtotal: 200,
    tax: 10,
    serviceCharge: 5,
    discount: 0,
    total: 215,
    paymentMethod: "PENDING",
    paymentStatus: "PENDING",
    status: "NEW",
    timestamp: "01:25 PM",
    date: "2026-07-04"
  },
  {
    id: "ord-4",
    tokenNumber: "TK-2039",
    customerName: "Radha Sharma",
    customerPhone: "+256 772 445566",
    tableName: "Table 1 (Window)",
    items: [
      { item: initialMenu[7], qty: 2 }
    ],
    subtotal: 500,
    tax: 25,
    serviceCharge: 12.5,
    discount: 50,
    total: 487.5,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    status: "COMPLETED",
    timestamp: "12:10 PM",
    date: "2026-07-04"
  }
];

// Initial Bookings
export const initialBookings: TableBooking[] = [
  {
    id: "book-1",
    customerName: "Pankaj Shah",
    customerPhone: "+256 754 112244",
    tableId: "tab-5",
    tableName: "Table 5 (Satsang)",
    time: "02:30 PM",
    date: "2026-07-04",
    partySize: 6,
    status: "CONFIRMED"
  },
  {
    id: "book-2",
    customerName: "Nitin Devji",
    customerPhone: "+256 702 556677",
    tableId: "tab-1",
    tableName: "Table 1 (Window)",
    time: "07:00 PM",
    date: "2026-07-04",
    partySize: 4,
    status: "CONFIRMED"
  },
  {
    id: "book-3",
    customerName: "Kishor Lal",
    customerPhone: "+256 781 889900",
    tableId: "tab-4",
    tableName: "Table 4 (Center)",
    time: "01:00 PM",
    date: "2026-07-04",
    partySize: 3,
    status: "SEATED"
  }
];

// Initial Suppliers
export const initialSuppliers: Supplier[] = [
  { id: "sup-1", name: "Bukoto Dairy Fresh", phone: "+256 771 990011", email: "orders@bukotodairy.com", itemsSupplied: ["Milk", "Paneer", "Ghee", "Curd"] },
  { id: "sup-2", name: "Swaminarayan Flour Mills", phone: "+256 701 445522", email: "sales@swamiflour.com", itemsSupplied: ["Wheat Flour", "Rice", "Sooji", "Urad Dal"] },
  { id: "sup-3", name: "Kampala Spice Wholesale", phone: "+256 752 334455", email: "spices@kampalawholesale.co.ug", itemsSupplied: ["Cardamom", "Saffron", "Turmeric", "Chilli Powder"] }
];

// Initial Inventory Items
export const initialInventory: InventoryItem[] = [
  { id: "inv-1", name: "Basmati Rice", category: "Grains", stock: 120, unit: "kg", minStock: 30, supplierId: "sup-2" },
  { id: "inv-2", name: "Premium Paneer", category: "Dairy", stock: 14, unit: "kg", minStock: 15, supplierId: "sup-1" },
  { id: "inv-3", name: "Fresh Milk", category: "Dairy", stock: 25, unit: "Litre", minStock: 10, supplierId: "sup-1" },
  { id: "inv-4", name: "Cardamom Pods", category: "Spices", stock: 2.5, unit: "kg", minStock: 1, supplierId: "sup-3" },
  { id: "inv-5", name: "Wheat Flour (Atta)", category: "Grains", stock: 85, unit: "kg", minStock: 25, supplierId: "sup-2" },
  { id: "inv-6", name: "Annapoorna Tea Dust", category: "Beverages", stock: 4, unit: "kg", minStock: 5, supplierId: "sup-3" },
  { id: "inv-7", name: "Refined Sugar", category: "Other", stock: 45, unit: "kg", minStock: 10, supplierId: "sup-3" }
];

// Initial Customers
export const initialCustomers: CanteenCustomer[] = [
  { id: "cust-1", name: "Kamlesh Patel", phone: "+256 701 234567", email: "kamlesh@gmail.com", totalOrders: 12, totalVisits: 12, totalSpent: 2840, lastVisit: "2026-07-04", type: "Regular" },
  { id: "cust-2", name: "Amit Vora", phone: "+256 752 987654", email: "amit@gmail.com", totalOrders: 8, totalVisits: 8, totalSpent: 1960, lastVisit: "2026-07-04", type: "Regular" },
  { id: "cust-3", name: "Sanjay Mehta", phone: "+256 703 112233", email: "sanjay@gmail.com", totalOrders: 4, totalVisits: 4, totalSpent: 910, lastVisit: "2026-07-04", type: "Guest" },
  { id: "cust-4", name: "Radha Sharma", phone: "+256 772 445566", email: "radha@gmail.com", totalOrders: 22, totalVisits: 22, totalSpent: 7420, lastVisit: "2026-07-04", type: "VIP" },
  { id: "cust-5", name: "Pankaj Shah", phone: "+256 754 112244", email: "pankaj@gmail.com", totalOrders: 3, totalVisits: 3, totalSpent: 750, lastVisit: "2026-07-03", type: "Guest" }
];

// Initial Staff Accounts
export const initialStaffAccounts: CanteenStaffAccount[] = [
  { id: "staff-1", email: "manager@swami.com", password: "manager123", name: "Mukesh Patel", assignedRole: "manager", createdAt: "2026-07-01" },
  { id: "staff-2", email: "receptionist@swami.com", password: "receptionist123", name: "Jatin Shah", assignedRole: "receptionist", createdAt: "2026-07-01" },
  { id: "staff-3", email: "cashier@swami.com", password: "cashier123", name: "Anil Vora", assignedRole: "cashier", createdAt: "2026-07-01" },
  { id: "staff-4", email: "kitchen@swami.com", password: "kitchen123", name: "Chef Ramesh", assignedRole: "kitchen", createdAt: "2026-07-01" }
];
