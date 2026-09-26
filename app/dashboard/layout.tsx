"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, UserRole } from "@/lib/context";
import { cn } from "@/lib/utils";
import { clearAdminTokens } from "@/lib/authStorage";
import { OfflineProvider } from "@/lib/offline/OfflineContext";
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
  Coffee,
  ClipboardList,
  LogOut
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { userRole, setUserRole, notifications } = useApp();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsDesktopSidebarOpen((prev) => !prev);
    } else {
      setIsMobileSidebarOpen((prev) => !prev);
    }
  };

  const isLoginPage = pathname === "/dashboard/login";
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Guard: Redirect unauthenticated admins to the login route
  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(false);
      return;
    }

    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      router.push("/dashboard/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    clearAdminTokens();
    localStorage.removeItem("admin_user");
    setUserRole("DEVOTEE");
    router.push("/dashboard/login");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sidebar links based on role permission simulation
  const adminMenu = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "TRUSTEE", "ACCOUNTANT", "BOOKING_MANAGER", "CONTENT_MANAGER"] },
    { label: "Memberships", href: "/dashboard/members", icon: Users, roles: ["SUPER_ADMIN", "TRUSTEE"] },
    { label: "Donations", href: "/dashboard/donations", icon: Heart, roles: ["SUPER_ADMIN", "TRUSTEE", "ACCOUNTANT"] },
    { label: "Bookings", href: "/dashboard/bookings", icon: Calendar, roles: ["SUPER_ADMIN", "BOOKING_MANAGER"] },
    { label: "Canteen CRM", href: "/dashboard/canteen", icon: Coffee, roles: ["SUPER_ADMIN", "BOOKING_MANAGER"] },
    { label: "Store Requisitions", href: "/dashboard/requisitions", icon: ClipboardList, roles: ["SUPER_ADMIN", "TRUSTEE", "ACCOUNTANT", "BOOKING_MANAGER", "CONTENT_MANAGER"] },
    
    // E-Commerce Modules
    { label: "Shop Products", href: "/dashboard/products", icon: ShoppingBag, roles: ["SUPER_ADMIN", "BOOKING_MANAGER", "CONTENT_MANAGER"] },
    { label: "Shop Orders", href: "/dashboard/orders", icon: Package, roles: ["SUPER_ADMIN", "ACCOUNTANT", "BOOKING_MANAGER"] },
    { label: "Shop Customers", href: "/dashboard/customers", icon: Users, roles: ["SUPER_ADMIN", "TRUSTEE"] },
    { label: "Shopkeepers", href: "/dashboard/shopkeepers", icon: UserCheck, roles: ["SUPER_ADMIN", "TRUSTEE"] },
    { label: "Shop Coupons", href: "/dashboard/coupons", icon: Tag, roles: ["SUPER_ADMIN", "ACCOUNTANT"] },
    { label: "Shop Reviews", href: "/dashboard/reviews", icon: Star, roles: ["SUPER_ADMIN", "CONTENT_MANAGER"] },
    
    { label: "Inventory", href: "/dashboard/inventory", icon: Archive, roles: ["SUPER_ADMIN", "TRUSTEE", "BOOKING_MANAGER"] },
    { label: "Accounting", href: "/dashboard/accounting", icon: IndianRupee, roles: ["SUPER_ADMIN", "ACCOUNTANT"] },
    { label: "Reports", href: "/dashboard/reports", icon: FileSpreadsheet, roles: ["SUPER_ADMIN", "TRUSTEE", "ACCOUNTANT"] },
    { label: "Staff Roster", href: "/dashboard/admins", icon: Shield, roles: ["SUPER_ADMIN"] },
    { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
  ];

  // Devotee Menu
  const devoteeMenu = [
    { label: "My Profile", href: "/dashboard/members", icon: UserCheck },
    { label: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { label: "My Donations", href: "/dashboard/donations", icon: Heart },
  ];

  const currentMenu = userRole === "DEVOTEE" ? devoteeMenu : adminMenu;

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0A0704] flex items-center justify-center font-jakarta">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#A89F91] uppercase tracking-widest">
            Securing Connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <OfflineProvider>
      <div className="min-h-screen bg-bg-warm flex font-jakarta">
      
      {/* 1. SIDEBAR (Desktop) - Pinned, Non-stretching, Viewport-bounded */}
      <aside
        className={cn(
          "hidden lg:flex flex-col sticky top-0 h-screen max-h-screen border-r border-primary-gold/15 bg-white shrink-0 transition-all duration-300 ease-in-out z-20",
          isDesktopSidebarOpen ? "w-64 opacity-100" : "w-0 border-r-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="w-64 flex flex-col h-full max-h-screen overflow-hidden">
          {/* Brand Logo & Desktop Close Button */}
          <div className="h-16 border-b border-primary-gold/10 px-4 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 truncate">
              <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                <NextImage
                  src="/temple-logo.png"
                  alt="SKSS Kampala Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-heading text-sm font-semibold tracking-wide text-dark-surface truncate">
                SKSS Kampala ERP
              </span>
            </Link>
            <button
              onClick={() => setIsDesktopSidebarOpen(false)}
              className="p-1.5 rounded-lg border border-primary-gold/15 text-secondary-bronze hover:bg-primary-gold/10 transition-colors cursor-pointer"
              title="Close Sidebar"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu Navigation - Scrollable internally if tabs exceed screen height */}
          <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
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
                    "flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all",
                    isActive
                      ? "bg-primary-gold text-white shadow-md shadow-primary-gold/15"
                      : "text-secondary-bronze/75 hover:bg-primary-gold/10 hover:text-secondary-bronze"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Public view shortcut / footer */}
          <div className="p-3 border-t border-primary-gold/10 shrink-0 bg-white">
            <Link
              href="/"
              className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-primary-gold shrink-0" />
              <span>Go to Public Site</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APP CONTENT PANEL */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-10 h-16 border-b border-primary-gold/10 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs shrink-0">
          
          {/* Universal Sidebar Open/Close Toggle */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl border border-primary-gold/25 text-dark-surface hover:bg-primary-gold/10 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center bg-white"
              title={
                typeof window !== "undefined" && window.innerWidth >= 1024
                  ? (isDesktopSidebarOpen ? "Close Sidebar" : "Open Sidebar")
                  : (isMobileSidebarOpen ? "Close Menu" : "Open Menu")
              }
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5 text-secondary-bronze" />
            </button>
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-secondary-bronze/75 font-sans truncate">
              {userRole === "DEVOTEE" ? "Devotee Portal" : "Administrative Desk"}
            </h2>
          </div>

          {/* Quick controls right */}
          <div className="flex items-center space-x-3 sm:space-x-4 relative">
            
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                U
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl border border-primary-gold/25 hover:bg-error-red/5 hover:border-error-red/30 hover:text-error-red transition-all cursor-pointer text-secondary-bronze"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </header>

        {/* Inner Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>

      </div>

      {/* 3. MOBILE SIDEBAR DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-64 max-w-[80vw] h-full max-h-screen bg-white z-50 lg:hidden border-r border-primary-gold/15 flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="h-16 border-b border-primary-gold/10 px-5 flex items-center justify-between shrink-0">
                <Link href="/" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center space-x-2.5 truncate">
                  <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                    <NextImage
                      src="/temple-logo.png"
                      alt="SKSS Kampala Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-heading text-base font-semibold text-dark-surface truncate">
                    SKSS Kampala ERP
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg border border-primary-gold/15 text-secondary-bronze hover:bg-primary-gold/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                {currentMenu.map((item: any) => {
                  if (userRole !== "DEVOTEE" && item.roles && !item.roles.includes(userRole)) {
                    return null;
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
                        pathname === item.href
                          ? "bg-primary-gold text-white shadow-md"
                          : "text-secondary-bronze/75 hover:bg-primary-gold/10 hover:text-secondary-bronze"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-primary-gold/10 shrink-0 bg-white">
                <Link
                  href="/"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-gold shrink-0" />
                  <span>Go to Public Site</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
    </OfflineProvider>
  );
}
