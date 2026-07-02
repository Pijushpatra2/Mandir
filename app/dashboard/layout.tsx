"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, UserRole } from "@/lib/context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  Image as ImageIcon,
  Archive,
  IndianRupee,
  FileSpreadsheet,
  Settings,
  ArrowLeft,
  Bell,
  Menu,
  X,
  UserCheck,
  Shield,
  Clock,
  ShoppingBag,
  Package,
  Tag,
  Star,
  Coffee
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { userRole, setUserRole, notifications } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sidebar links based on role permission simulation
  const adminMenu = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "TRUSTEE", "ACCOUNTANT", "BOOKING_MANAGER", "CONTENT_MANAGER"] },
    { label: "Memberships", href: "/dashboard/members", icon: Users, roles: ["SUPER_ADMIN", "TRUSTEE"] },
    { label: "Donations", href: "/dashboard/donations", icon: Heart, roles: ["SUPER_ADMIN", "TRUSTEE", "ACCOUNTANT"] },
    { label: "Bookings", href: "/dashboard/bookings", icon: Calendar, roles: ["SUPER_ADMIN", "BOOKING_MANAGER"] },
    { label: "Canteen CRM", href: "/dashboard/canteen", icon: Coffee, roles: ["SUPER_ADMIN", "BOOKING_MANAGER"] },
    
    // E-Commerce Modules
    { label: "Shop Products", href: "/dashboard/products", icon: ShoppingBag, roles: ["SUPER_ADMIN", "BOOKING_MANAGER", "CONTENT_MANAGER"] },
    { label: "Shop Orders", href: "/dashboard/orders", icon: Package, roles: ["SUPER_ADMIN", "ACCOUNTANT", "BOOKING_MANAGER"] },
    { label: "Shop Customers", href: "/dashboard/customers", icon: Users, roles: ["SUPER_ADMIN", "TRUSTEE"] },
    { label: "Shop Coupons", href: "/dashboard/coupons", icon: Tag, roles: ["SUPER_ADMIN", "ACCOUNTANT"] },
    { label: "Shop Reviews", href: "/dashboard/reviews", icon: Star, roles: ["SUPER_ADMIN", "CONTENT_MANAGER"] },
    
    { label: "Inventory", href: "/dashboard/inventory", icon: Archive, roles: ["SUPER_ADMIN", "TRUSTEE", "BOOKING_MANAGER"] },
    { label: "Accounting", href: "/dashboard/accounting", icon: IndianRupee, roles: ["SUPER_ADMIN", "ACCOUNTANT"] },
    { label: "Reports", href: "/dashboard/reports", icon: FileSpreadsheet, roles: ["SUPER_ADMIN", "TRUSTEE", "ACCOUNTANT"] },
    { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
  ];

  // Devotee Menu
  const devoteeMenu = [
    { label: "My Profile", href: "/dashboard/members", icon: UserCheck },
    { label: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { label: "My Donations", href: "/dashboard/donations", icon: Heart },
  ];

  const currentMenu = userRole === "DEVOTEE" ? devoteeMenu : adminMenu;

  return (
    <div className="min-h-screen bg-bg-warm flex font-jakarta">
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-primary-gold/15 bg-white shrink-0">
        {/* Brand Logo */}
        <div className="h-20 border-b border-primary-gold/10 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <span className="text-2xl">🕉️</span>
            <span className="font-heading text-lg font-semibold tracking-wide text-dark-surface">
              SKSS Kampala ERP
            </span>
          </Link>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {currentMenu.map((item: any) => {
            // Check roles access if not devotee
            if (userRole !== "DEVOTEE" && item.roles && !item.roles.includes(userRole)) {
              return null;
            }
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all",
                  isActive
                    ? "bg-primary-gold text-white shadow-md shadow-primary-gold/15"
                    : "text-secondary-bronze/75 hover:bg-primary-gold/10 hover:text-secondary-bronze"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Public view shortcut */}
        <div className="p-4 border-t border-primary-gold/10">
          <Link
            href="/"
            className="flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-primary-gold" />
            <span>Go to Public Site</span>
          </Link>
        </div>
      </aside>

      {/* 2. MAIN APP CONTENT PANEL */}
      <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Navbar Header */}
        <header className="h-20 border-b border-primary-gold/10 bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
          
          {/* Mobile menu toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 lg:hidden rounded-xl border border-primary-gold/25 text-dark-surface hover:bg-primary-gold/10"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-bold uppercase tracking-widest text-secondary-bronze/75 font-sans">
              {userRole === "DEVOTEE" ? "Devotee Portal" : "Administrative Desk"}
            </h2>
          </div>

          {/* Quick controls right */}
          <div className="flex items-center space-x-4 relative">
            
            {/* Quick role display badge */}
            <span className="hidden sm:inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-primary-gold/30 rounded-xl bg-bg-warm text-secondary-bronze">
              Role: {userRole.replace("_", " ")}
            </span>

            {/* Notification Center Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl border border-primary-gold/25 hover:bg-bg-warm transition-colors relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5 text-secondary-bronze" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-error-red text-white flex items-center justify-center text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Popover */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-primary-gold/15 shadow-xl z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-primary-gold/10 bg-bg-warm flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary-bronze">
                          System Notifications
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-primary-gold/10 text-primary-gold rounded">
                          {unreadCount} New
                        </span>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto divide-y divide-primary-gold/10">
                        {notifications.map((not) => (
                          <div className="p-4 hover:bg-bg-warm transition-colors" key={not.id}>
                            <p className="text-xs font-semibold text-dark-surface leading-snug">
                              {not.title}
                            </p>
                            <p className="text-[11px] text-secondary-bronze/75 mt-1 leading-normal font-sans font-light">
                              {not.message}
                            </p>
                            <span className="text-[9px] text-secondary-bronze/50 font-sans block mt-1.5">
                              {new Date(not.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar / Settings Shortcut */}
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze flex items-center justify-center text-white font-bold text-sm shadow-md">
                U
              </div>
            </div>

          </div>

        </header>

        {/* Inner Content Area */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* 3. MOBILE SIDEBAR DRAWER OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-64 bg-white z-40 lg:hidden border-r border-primary-gold/15 flex flex-col"
            >
              <div className="h-20 border-b border-primary-gold/10 px-6 flex items-center justify-between">
                <span className="font-heading text-lg font-semibold text-dark-surface">
                  SKSS Kampala ERP
                </span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg border border-primary-gold/15"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
                {currentMenu.map((item: any) => {
                  if (userRole !== "DEVOTEE" && item.roles && !item.roles.includes(userRole)) {
                    return null;
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all",
                        pathname === item.href
                          ? "bg-primary-gold text-white shadow-md"
                          : "text-secondary-bronze/75 hover:bg-primary-gold/10 hover:text-secondary-bronze"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-primary-gold/10">
                <Link
                  href="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-gold" />
                  <span>Go to Public Site</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
