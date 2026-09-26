"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  getShopkeeperProfile,
  logoutShopkeeper,
  ShopkeeperItem
} from "@/lib/shopkeeperApi";
import { getShopkeeperAccessToken } from "@/lib/authStorage";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ClipboardList,
  User,
  LogOut,
  Menu,
  X,
  Store,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  ExternalLink,
  Loader2
} from "lucide-react";

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<ShopkeeperItem | null>(null);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<"LOADING" | "AUTHENTICATED" | "UNAUTHENTICATED">("LOADING");

  const isLoginPage = pathname === "/shopkeeper/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthStatus("UNAUTHENTICATED");
      return;
    }

    const token = getShopkeeperAccessToken() || (typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null);
    if (!token) {
      setAuthStatus("UNAUTHENTICATED");
      router.push("/shopkeeper/login");
      return;
    }

    // Load active shopkeeper profile
    getShopkeeperProfile()
      .then((data) => {
        setProfile(data);
        setAuthStatus("AUTHENTICATED");
      })
      .catch(() => {
        // If stored profile in local storage exists, fallback
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("shopkeeper_profile");
          if (cached) {
            try {
              setProfile(JSON.parse(cached));
              setAuthStatus("AUTHENTICATED");
              return;
            } catch (e) {}
          }
        }
        logoutShopkeeper();
        router.push("/shopkeeper/login");
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    logoutShopkeeper();
    router.push("/shopkeeper/login");
  };

  const menuItems = [
    {
      label: "Store Overview",
      href: "/shopkeeper/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Store Requisitions",
      href: "/shopkeeper/requisitions",
      icon: ClipboardList,
    },
    {
      label: "Inventory & Items",
      href: "/shopkeeper/inventory",
      icon: Boxes,
    },
    {
      label: "Profile & Password",
      href: "/shopkeeper/profile",
      icon: User,
    },
  ];

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authStatus === "LOADING") {
    return (
      <div className="min-h-screen bg-[#0E0A06] flex items-center justify-center font-jakarta">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-primary-gold/80 uppercase tracking-widest">
            Authenticating Shopkeeper Desk...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-warm flex font-jakarta">
      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={cn(
          "hidden lg:flex flex-col sticky top-0 h-screen max-h-screen border-r border-primary-gold/15 bg-[#140F0A] text-white shrink-0 transition-all duration-300 ease-in-out z-20",
          isDesktopSidebarOpen ? "w-64 opacity-100" : "w-0 border-r-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="w-64 flex flex-col h-full max-h-screen overflow-hidden">
          {/* Logo & Close Button */}
          <div className="h-16 border-b border-primary-gold/15 px-4 flex items-center justify-between shrink-0 bg-black/20">
            <Link href="/shopkeeper/dashboard" className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze flex items-center justify-center text-dark-surface font-bold text-xs shadow-md">
                <Store className="w-4 h-4 text-dark-surface" />
              </div>
              <div className="truncate">
                <span className="font-heading text-sm font-bold text-white tracking-wide block truncate">
                  SKSS Store Desk
                </span>
                <span className="text-[9px] text-primary-gold font-semibold uppercase tracking-wider block">
                  Shopkeeper Portal
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsDesktopSidebarOpen(false)}
              className="p-1.5 rounded-lg border border-primary-gold/20 text-white/70 hover:bg-primary-gold/10 hover:text-white transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Store Location Pill */}
          <div className="p-3 mx-3 my-2 rounded-2xl bg-primary-gold/10 border border-primary-gold/20">
            <p className="text-[9px] uppercase font-bold tracking-wider text-primary-gold">
              Counter Assigned
            </p>
            <p className="text-xs font-semibold text-white/90 truncate mt-0.5">
              {profile?.store_name || "Main Temple Gift & Book Store"}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 min-h-0 px-3 py-2 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary-gold to-secondary-bronze text-dark-surface font-bold shadow-md shadow-primary-gold/20"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-dark-surface" : "text-primary-gold")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer Shortcuts */}
          <div className="p-3 border-t border-primary-gold/15 space-y-1 shrink-0 bg-black/20">
            <Link
              href="/shop"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Store className="w-3.5 h-3.5 text-primary-gold" />
                <span>Live Public Shop</span>
              </span>
              <ExternalLink className="w-3 h-3 text-white/40" />
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-error-red/10 hover:text-error-red transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN APP CONTENT PANEL */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 h-16 border-b border-primary-gold/10 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                  setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
                } else {
                  setIsMobileSidebarOpen(!isMobileSidebarOpen);
                }
              }}
              className="p-2 rounded-xl border border-primary-gold/25 text-dark-surface hover:bg-primary-gold/10 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center bg-white"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5 text-secondary-bronze" />
            </button>

            <div>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-secondary-bronze/80 font-sans truncate">
                Shopkeeper Desk
              </h2>
              <p className="text-[10px] text-secondary-bronze/60 hidden sm:block">
                {profile?.store_name || "Main Temple Gift & Book Store"}
              </p>
            </div>
          </div>

          {/* Right Header User & Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Change Password Shortcut Button */}
            <Link
              href="/shopkeeper/profile"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-primary-gold/30 bg-primary-gold/10 hover:bg-primary-gold/20 text-xs font-semibold text-secondary-bronze transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-primary-gold" />
              <span>Change Password</span>
            </Link>

            {/* Shopkeeper Profile Badge */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-dark-surface leading-tight">
                  {profile?.name || "Shopkeeper"}
                </p>
                <p className="text-[10px] text-secondary-bronze/60 leading-none">
                  {profile?.email || "Staff"}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl border border-primary-gold/25 hover:bg-error-red/10 hover:border-error-red/30 hover:text-error-red transition-all cursor-pointer text-secondary-bronze"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* 3. MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 w-64 max-w-[80vw] h-full max-h-screen bg-[#140F0A] text-white z-50 lg:hidden border-r border-primary-gold/20 flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="h-16 border-b border-primary-gold/15 px-5 flex items-center justify-between shrink-0 bg-black/20">
                <Link
                  href="/shopkeeper/dashboard"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center space-x-2.5 truncate"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze flex items-center justify-center text-dark-surface font-bold text-xs shadow-md">
                    <Store className="w-4 h-4 text-dark-surface" />
                  </div>
                  <span className="font-heading text-sm font-bold text-white tracking-wide">
                    SKSS Store Desk
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg border border-primary-gold/20 text-white/70 hover:bg-primary-gold/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 mx-3 my-2 rounded-2xl bg-primary-gold/10 border border-primary-gold/20">
                <p className="text-[9px] uppercase font-bold tracking-wider text-primary-gold">
                  Counter Assigned
                </p>
                <p className="text-xs font-semibold text-white/90 truncate mt-0.5">
                  {profile?.store_name || "Main Temple Gift & Book Store"}
                </p>
              </div>

              <nav className="flex-1 min-h-0 px-3 py-2 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
                        isActive
                          ? "bg-gradient-to-r from-primary-gold to-secondary-bronze text-dark-surface font-bold shadow-md"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-dark-surface" : "text-primary-gold")} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-primary-gold/15 space-y-1 shrink-0 bg-black/20">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:bg-white/5"
                >
                  <Store className="w-4 h-4 text-primary-gold shrink-0" />
                  <span>Go to Public Shop</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-error-red/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
