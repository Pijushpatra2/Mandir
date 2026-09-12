"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
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
    { label: "My Profile", href: "/user-dashboard/profile", icon: User },
    { label: "My Bookings", href: "/user-dashboard/bookings", icon: Calendar },
    { label: "My Shopping", href: "/user-dashboard/orders", icon: ShoppingBag },
    { label: "My Donations", href: "/user-dashboard/donations", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex font-jakarta">
      
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
                <Image
                  src="/temple-logo.png"
                  alt="SKSS Kampala Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-heading text-sm font-semibold tracking-wide text-dark-surface truncate">
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

          {/* Menu Navigation - Scrolls internally only when tabs exceed viewport */}
          <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all",
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

          {/* Public view shortcut & Logout */}
          <div className="p-3 border-t border-primary-gold/10 space-y-1 shrink-0 bg-white">
            <Link
              href="/"
              className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-primary-gold shrink-0" />
              <span>Back to Public Site</span>
            </Link>
            <button
              onClick={() => {
                logoutDevotee();
                router.push("/");
              }}
              className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
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
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 max-w-[80vw] h-full max-h-screen bg-white z-50 flex flex-col border-r border-primary-gold/15 lg:hidden shadow-2xl overflow-hidden"
            >
              <div className="h-16 border-b border-primary-gold/10 px-5 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5 truncate">
                  <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                    <Image
                      src="/temple-logo.png"
                      alt="SKSS Kampala Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-heading text-sm font-semibold text-dark-surface truncate">
                    Devotee Portal
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg border border-primary-gold/10 text-secondary-bronze cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
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

              <div className="p-3 border-t border-primary-gold/10 space-y-1 shrink-0 bg-white">
                <Link
                  href="/"
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-gold shrink-0" />
                  <span>Back to Public Site</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    logoutDevotee();
                    router.push("/");
                  }}
                  className="w-full flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-10 h-16 bg-white/95 backdrop-blur-md border-b border-primary-gold/15 px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl border border-primary-gold/25 text-dark-surface hover:bg-primary-gold/10 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center bg-white"
              title="Toggle Sidebar"
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
        <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
          {children}
        </main>
      </div>

    </div>
  );
}
