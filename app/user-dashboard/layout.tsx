"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  UserCheck
} from "lucide-react";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentMemberNumber, members } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeMember = members.find((m) => m.membershipNumber === currentMemberNumber) || members[0];

  const menuItems = [
    { label: "Overview & ID Card", href: "/user-dashboard", icon: LayoutDashboard },
    { label: "My Bookings", href: "/user-dashboard/bookings", icon: Calendar },
    { label: "My Shopping", href: "/user-dashboard/orders", icon: ShoppingBag },
    { label: "My Donations", href: "/user-dashboard/donations", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex font-jakarta">
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-primary-gold/15 bg-white shrink-0">
        {/* Brand Logo */}
        <div className="h-20 border-b border-primary-gold/10 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <span className="text-2xl">🕉️</span>
            <span className="font-heading text-lg font-semibold tracking-wide text-dark-surface">
              Devotee Portal
            </span>
          </Link>
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

        {/* Public view shortcut */}
        <div className="p-4 border-t border-primary-gold/10">
          <Link
            href="/"
            className="flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-primary-gold" />
            <span>Back to Public Site</span>
          </Link>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-30 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-40 flex flex-col border-r border-primary-gold/15 lg:hidden"
            >
              <div className="h-20 border-b border-primary-gold/10 px-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🕉️</span>
                  <span className="font-heading text-base font-semibold text-dark-surface">
                    Devotee Portal
                  </span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
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
                      onClick={() => setIsSidebarOpen(false)}
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

              <div className="p-4 border-t border-primary-gold/10">
                <Link
                  href="/"
                  className="flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/5 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-gold" />
                  <span>Back to Public Site</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="h-20 bg-white border-b border-primary-gold/15 px-6 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl border border-primary-gold/10 text-secondary-bronze lg:hidden hover:bg-primary-gold/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/50 block">
                Session Devotee
              </span>
              <span className="text-xs font-bold text-dark-surface">
                {activeMember ? `${activeMember.firstName} ${activeMember.lastName}` : "Devotee User"} ({currentMemberNumber})
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
