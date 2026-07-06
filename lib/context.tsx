"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MemberRecord, mockMembers } from "@/data/members";
import { DonationTx, mockDonations } from "@/data/donations";
import { HallBookingRecord, mockHallBookings } from "@/data/hallBookings";
import { PoojaBookingRecord, mockPoojaBookings } from "@/data/poojaBookings";
import { SystemNotification, mockNotifications } from "@/data/notifications";
import { TempleEvent, templeEvents } from "@/data/events";
import { NewsArticle, mockNews } from "@/data/news";
import { ShopOrder, mockOrders, OrderItem } from "@/data/orders";
import { Coupon, mockCoupons } from "@/data/coupons";
import { Product } from "@/data/products";

export type UserRole = "DEVOTEE" | "SUPER_ADMIN" | "TRUSTEE" | "ACCOUNTANT" | "BOOKING_MANAGER" | "CONTENT_MANAGER";

export interface DarshanBookingRecord {
  id: string;
  devoteeName: string;
  devoteePhone: string;
  date: string;
  slot: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  bookingDate: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  members: MemberRecord[];
  setMembers: React.Dispatch<React.SetStateAction<MemberRecord[]>>;
  donations: DonationTx[];
  setDonations: React.Dispatch<React.SetStateAction<DonationTx[]>>;
  hallBookings: HallBookingRecord[];
  setHallBookings: React.Dispatch<React.SetStateAction<HallBookingRecord[]>>;
  poojaBookings: PoojaBookingRecord[];
  setPoojaBookings: React.Dispatch<React.SetStateAction<PoojaBookingRecord[]>>;
  notifications: SystemNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
  events: TempleEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TempleEvent[]>>;
  news: NewsArticle[];
  setNews: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  currentMemberNumber: string;
  setCurrentMemberNumber: (num: string) => void;
  darshanBookings: DarshanBookingRecord[];
  setDarshanBookings: React.Dispatch<React.SetStateAction<DarshanBookingRecord[]>>;
  
  // E-commerce states
  orders: ShopOrder[];
  setOrders: React.Dispatch<React.SetStateAction<ShopOrder[]>>;
  cart: CartItem[];
  wishlist: string[]; // Product IDs
  appliedCoupon: Coupon | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (order: ShopOrder) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to map DB roles and scopes to valid frontend UserRole identifiers
export const mapDbRoleToUserRole = (dbRole: string, scope?: string | null): UserRole => {
  const clean = (dbRole || "").toLowerCase().trim();
  if (clean === "super_admin" || clean === "superadmin") {
    return "SUPER_ADMIN";
  }
  if (clean === "module_admin" || clean === "moduleadmin") {
    return "SUPER_ADMIN"; // Or map to other specific roles if needed
  }
  if (clean === "trustee") return "TRUSTEE";
  if (clean === "accountant") return "ACCOUNTANT";
  if (clean === "booking_manager") return "BOOKING_MANAGER";
  if (clean === "content_manager") return "CONTENT_MANAGER";
  return "SUPER_ADMIN"; // default fallback for admin accounts
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("DEVOTEE");
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [donations, setDonations] = useState<DonationTx[]>([]);
  const [hallBookings, setHallBookings] = useState<HallBookingRecord[]>([]);
  const [poojaBookings, setPoojaBookings] = useState<PoojaBookingRecord[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  
  // New States
  const [currentMemberNumber, setCurrentMemberNumber] = useState<string>("MEM-2026-0002");
  const [darshanBookings, setDarshanBookings] = useState<DarshanBookingRecord[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  
  // Cart & Wishlist States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load initial mock data on mount
  useEffect(() => {
    // Restore admin user session from localStorage if present
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("admin_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.role) {
            setUserRole(mapDbRoleToUserRole(parsed.role, parsed.moduleScope));
          }
        } catch (e) {}
      }
    }

    setMembers(mockMembers);
    setDonations(mockDonations);
    setHallBookings(mockHallBookings);
    setPoojaBookings(mockPoojaBookings);
    setNotifications(mockNotifications);
    setEvents(templeEvents);
    setNews(mockNews);
    setOrders(mockOrders);
    
    // Add default initial mock darshan booking for Harish Mehta
    setDarshanBookings([
      {
        id: "db-1",
        devoteeName: "Harish Mehta",
        devoteePhone: "+91 99110 54321",
        date: "2026-06-25",
        slot: "Evening Aarti (6:30 PM - 8:00 PM)",
        status: "CONFIRMED",
        bookingDate: "2026-06-25"
      }
    ]);

    // Load Cart & Wishlist from localStorage if client-side
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("temple_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Error parsing cart data", e);
        }
      }
      
      const savedWishlist = localStorage.getItem("temple_wishlist");
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          console.error("Error parsing wishlist data", e);
        }
      }
    }
  }, []);

  // Save Cart to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("temple_cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Save Wishlist to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("temple_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  // E-commerce handlers
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images[0] || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=600",
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.includes(productId)) {
        return prevWishlist.filter((id) => id !== productId);
      }
      return [...prevWishlist, productId];
    });
  };

  const applyCouponCode = (code: string): boolean => {
    const coupon = mockCoupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.active
    );
    if (coupon) {
      setAppliedCoupon(coupon);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const placeOrder = (order: ShopOrder) => {
    setOrders((prevOrders) => [order, ...prevOrders]);
    clearCart();
    
    // Add system notification for order
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Order Placed Successfully",
        message: `Your order ${order.id} has been received. Total: ₹${order.total}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        category: "booking",
      },
      ...prev,
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        members,
        setMembers,
        donations,
        setDonations,
        hallBookings,
        setHallBookings,
        poojaBookings,
        setPoojaBookings,
        notifications,
        setNotifications,
        events,
        setEvents,
        news,
        setNews,
        currentMemberNumber,
        setCurrentMemberNumber,
        darshanBookings,
        setDarshanBookings,
        
        // E-commerce
        orders,
        setOrders,
        cart,
        wishlist,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        applyCouponCode,
        removeCoupon,
        placeOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
