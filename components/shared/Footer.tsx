"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-surface text-white border-t border-primary-gold/20 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze flex items-center justify-center text-white font-bold">
                🕉️
              </span>
              <span className="font-heading text-xl font-medium tracking-wide text-primary-gold">
                SKSS Kampala
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 font-light">
              Shree Kutch Satsang Swaminarayan Temple, Kampala is a spiritual sanctuary dedicated to spreading peace, devotion, and community wisdom.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl border border-white/10 hover:border-primary-gold flex items-center justify-center text-white/70 hover:text-primary-gold transition-colors bg-white/5"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="mailto:connect@radhekrishnamandir.org"
                className="w-10 h-10 rounded-xl border border-white/10 hover:border-primary-gold flex items-center justify-center text-white/70 hover:text-primary-gold transition-colors bg-white/5"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg text-primary-gold font-medium mb-6 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "About History", href: "/about" },
                { label: "Daily Darshan Timings", href: "/darshan" },
                { label: "Pooja Services", href: "/services" },
                { label: "Donation Campaigns", href: "/donations" },
                { label: "Membership Benefits", href: "/membership" },
                { label: "Radhe Krishna Hall", href: "/hall-booking" }
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-primary-gold text-sm font-light transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-heading text-lg text-primary-gold font-medium mb-6 tracking-wide">
              Reach Us
            </h3>
            <ul className="space-y-4 text-sm font-light text-white/75">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-gold shrink-0 mt-0.5" />
                <span className="leading-relaxed text-white/70">
                  Spiritual Boulevard, Sector 5, Divine City, Pin - 400001
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-gold shrink-0" />
                <span className="text-white/70">+91 22 5555 1008</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-gold shrink-0" />
                <span className="text-white/70">connect@radhekrishnamandir.org</span>
              </li>
            </ul>
          </div>

          {/* Darshan Overview */}
          <div>
            <h3 className="font-heading text-lg text-primary-gold font-medium mb-6 tracking-wide">
              Darshan Hours
            </h3>
            <div className="space-y-4 text-sm font-light text-white/75 bg-white/5 p-5 rounded-2xl border border-white/10">
              <div>
                <p className="font-semibold text-primary-gold text-xs uppercase tracking-wider mb-1">
                  Morning Sessions
                </p>
                <p className="text-white/70">5:30 AM - 11:00 AM</p>
              </div>
              <div>
                <p className="font-semibold text-primary-gold text-xs uppercase tracking-wider mb-1">
                  Evening Sessions
                </p>
                <p className="text-white/70">4:00 PM - 8:30 PM</p>
              </div>
              <div className="pt-2 border-t border-white/15">
                <Link
                  href="/live-darshan"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-primary-gold hover:text-white transition-colors"
                >
                  <span>Watch Live Darshan 24/7</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light text-white/55">
          <p>© {currentYear} Shree Kutch Satsang Swaminarayan Temple, Kampala. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for digital spiritual connection with <Heart className="w-3.5 h-3.5 text-primary-gold fill-primary-gold" />
          </p>
        </div>

      </div>
    </footer>
  );
}
