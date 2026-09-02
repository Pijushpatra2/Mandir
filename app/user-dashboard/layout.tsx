"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  Heart,
  ArrowLeft,
  Menu,
  X,
  UserCheck,
  LogOut
} from "lucide-react";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { devoteeProfile, logoutDevotee } = useApp();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsDesktopSidebarOpen((prev) => !prev);
    } else {
      setIsMobileSidebarOpen((prev) => !prev);
    }
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const devoteeToken = localStorage.getItem("devotee_access_token");
      if (!devoteeToken) {
        router.push("/login");
      }
    }
  }, [devoteeProfile, router]);

  const activeMember = devoteeProfile ? {
    firstName: devoteeProfile.first_name,
    lastName: devoteeProfile.last_name,
    membershipNumber: devoteeProfile.membership_number,
  } : {
    firstName: "Devotee",
    lastName: "User",
    membershipNumber: "",
  };

  const menuItems = [
    { label: "Overview & ID Card", href: "/user-dashboard", icon: LayoutDashboard },
    { label: "My Bookings", href: "/user-dashboard/bookings", icon: Calendar },
    { label: "My Shopping", href: "/user-dashboard/orders", icon: ShoppingBag },
    { label: "My Donations", href: "/user-dashboard/donations", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex font-jakarta">
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-primary-gold/15 bg-white shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-20",
          isDesktopSidebarOpen ? "w-64 opacity-100" : "w-0 border-r-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="w-64 flex flex-col h-full">
          {/* Brand Logo & Desktop Close Button */}
          <div className="h-20 border-b border-primary-gold/10 px-5 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center space-x-2.5 truncate">
              <span className="text-2xl">🕉️</span>
              <span className="font-heading text-base font-semibold tracking-wide text-dark-surface truncate">
                Devotee Portal
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

          {/* Menu Navigation */}
          <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
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

          {/* Public view shortcut & Logout */}
          <div className="p-4 border-t border-primary-gold/10 space-y-1 shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-primary-gold" />
              <span>Back to Public Site</span>
            </Link>
            <button
              onClick={() => {
                logoutDevotee();
                router.push("/");
              }}
              className="w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col border-r border-primary-gold/15 lg:hidden shadow-2xl"
            >
              <div className="h-20 border-b border-primary-gold/10 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🕉️</span>
                  <span className="font-heading text-base font-semibold text-dark-surface">
                    Devotee Portal
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg border border-primary-gold/10 text-secondary-bronze"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
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

              <div className="p-4 border-t border-primary-gold/10 space-y-1 shrink-0">
                <Link
                  href="/"
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-gold" />
                  <span>Back to Public Site</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    logoutDevotee();
                    router.push("/");
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="h-20 bg-white border-b border-primary-gold/15 px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl border border-primary-gold/25 text-dark-surface hover:bg-primary-gold/10 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center bg-white"
              title={
                typeof window !== "undefined" && window.innerWidth >= 1024
                  ? (isDesktopSidebarOpen ? "Close Sidebar" : "Open Sidebar")
                  : (isMobileSidebarOpen ? "Close Menu" : "Open Menu")
              }
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5 text-secondary-bronze" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/50 block">
                Session Devotee
              </span>
              <span className="text-xs font-bold text-dark-surface">
                {activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : "Devotee User"} ({activeMember?.membershipNumber})
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-primary-gold/10 text-secondary-bronze border border-primary-gold/20 px-3 py-1.5 rounded-xl text-xs font-bold">
              <UserCheck className="w-4 h-4 text-primary-gold" />
              <span>Devotee Account</span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
