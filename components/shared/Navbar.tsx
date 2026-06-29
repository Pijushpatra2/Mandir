"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, UserRole } from "@/lib/context";
import { Menu, X, ChevronDown, User, Shield, Compass, ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Donation", href: "/donations" },
  { label: "Hall Booking", href: "/hall-booking" },
  { label: "Gallery", href: "/gallery" },
  { label: "Shop", href: "/shop" },
  { label: "Contact", href: "/contact" },
];

const ROLES: { value: UserRole; label: string }[] = [
  { value: "DEVOTEE", label: "Devotee / Public" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "TRUSTEE", label: "Trustee" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "BOOKING_MANAGER", label: "Booking Manager" },
  { value: "CONTENT_MANAGER", label: "Content Manager" },
];

export function Navbar() {
  const pathname = usePathname();
  const { userRole, setUserRole, cart, wishlist, currentMemberNumber } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/user-dashboard");
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-bg-warm/80 backdrop-blur-md border-b border-primary-gold/15 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze flex items-center justify-center text-white font-bold shadow-md shadow-secondary-bronze/20">
              🕉️
            </span>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-semibold tracking-wide text-dark-surface leading-tight group-hover:text-primary-gold transition-colors">
                SKSS Kampala
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-secondary-bronze font-sans font-medium -mt-0.5">
                Temple ERP Platform
              </p>
            </div>
          </Link>
   
          {/* Desktop Navigation */}
          {!isDashboard && (
            <nav className="hidden lg:flex space-x-6">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative text-sm font-sans font-medium transition-colors py-2 px-1 hover:text-primary-gold",
                      isActive ? "text-primary-gold" : "text-dark-surface/75"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavLine"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-gold rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
   
          {/* Right Section: Shop Icons & Login Action */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* E-commerce Quick Icons */}
            {!isDashboard && (
              <div className="flex items-center space-x-2 mr-2">
                {/* Wishlist Link */}
                <Link
                  href="/wishlist"
                  className="relative p-2 rounded-full hover:bg-primary-gold/10 text-secondary-bronze transition-all cursor-pointer"
                  title="Wishlist"
                >
                  <Heart className="w-5 h-5 text-secondary-bronze/85" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-error-red text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                {/* Cart Link */}
                <Link
                  href="/cart"
                  className="relative p-2 rounded-full hover:bg-primary-gold/10 text-secondary-bronze transition-all cursor-pointer"
                  title="Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-secondary-bronze/85" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary-gold text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}

            {/* Login / Devotee Portal / Admin Portal CTAs */}
            {userRole === "DEVOTEE" ? (
              currentMemberNumber ? (
                <Link
                  href="/user-dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-primary-gold hover:bg-secondary-bronze rounded-xl shadow-md transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Portal</span>
                </Link>
              ) : (
                <Link
                  href="/membership"
                  className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-primary-gold hover:bg-secondary-bronze rounded-xl shadow-md transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login / Register</span>
                </Link>
              )
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-primary-gold to-secondary-bronze hover:brightness-110 rounded-xl shadow-md transition-all"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>
  
          {/* Mobile menu triggers */}
          <div className="flex items-center lg:hidden space-x-3">
            {!isDashboard && (
              <div className="flex items-center space-x-1.5">
                <Link href="/wishlist" className="relative p-1.5 text-secondary-bronze">
                  <Heart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-0 right-0 bg-error-red text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
                <Link href="/cart" className="relative p-1.5 text-secondary-bronze">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-primary-gold text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl border border-primary-gold/20 bg-white text-dark-surface hover:bg-primary-gold/10 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
  
        </div>
  
        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden w-full bg-white border-b border-primary-gold/15 overflow-hidden shadow-inner"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {!isDashboard &&
                  NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-3 py-2 text-base font-semibold rounded-xl hover:bg-primary-gold/10 hover:text-primary-gold transition-colors",
                        pathname === item.href ? "text-primary-gold bg-primary-gold/5" : "text-dark-surface/85"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                
                <div className="pt-4 border-t border-primary-gold/10 px-3">
                  {userRole === "DEVOTEE" ? (
                    currentMemberNumber ? (
                      <Link
                        href="/user-dashboard"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center space-x-2 py-3 text-sm font-semibold text-white bg-primary-gold hover:bg-secondary-bronze rounded-xl shadow-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Account Portal</span>
                      </Link>
                    ) : (
                      <Link
                        href="/membership"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-center space-x-2 py-3 text-sm font-semibold text-white bg-primary-gold hover:bg-secondary-bronze rounded-xl shadow-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Login / Register</span>
                      </Link>
                    )
                  ) : (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center space-x-2 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-gold to-secondary-bronze rounded-xl shadow-md transition-all"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating Simulation Sandbox Role Switcher (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
          className="flex items-center space-x-2 px-3 py-2.5 rounded-full border border-primary-gold/45 bg-white text-xs font-bold text-secondary-bronze shadow-lg hover:border-primary-gold hover:bg-bg-warm transition-all cursor-pointer"
        >
          <Shield className="w-4 h-4 text-primary-gold" />
          <span className="hidden sm:inline">Simulation Role: {userRole}</span>
          <ChevronDown className="w-3.5 h-3.5 text-secondary-bronze" />
        </button>

        <AnimatePresence>
          {showRoleDropdown && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowRoleDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 bottom-14 w-60 rounded-2xl bg-white border border-primary-gold/20 shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-primary-gold/10 bg-bg-warm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-bronze">
                    Developer Sandbox Role
                  </p>
                </div>
                <div className="p-1 max-h-60 overflow-y-auto">
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => {
                        setUserRole(role.value);
                        setShowRoleDropdown(false);
                      }}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors hover:bg-primary-gold/10 hover:text-secondary-bronze cursor-pointer",
                        userRole === role.value ? "bg-primary-gold/15 text-primary-gold font-bold" : "text-dark-surface/80"
                      )}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
