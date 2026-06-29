"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Users,
  Heart,
  Calendar,
  IndianRupee,
  Plus,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Award,
  BookOpen,
  Sparkles,
  ChevronRight,
  Download,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const {
    userRole,
    members,
    donations,
    hallBookings,
    poojaBookings,
    events,
    setMembers,
    currentMemberNumber,
    darshanBookings,
    orders
  } = useApp();

  // Family profile creation state (for Devotee Portal mode)
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyRel, setNewFamilyRel] = useState("Spouse");
  const [newFamilyAge, setNewFamilyAge] = useState<number>(35);

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName) return;

    // Simulate adding family member to the current devotee
    setMembers((prev) =>
      prev.map((m) => {
        if (m.membershipNumber === currentMemberNumber) {
          return {
            ...m,
            familyMembers: [
              ...m.familyMembers,
              { fullName: newFamilyName, relationship: newFamilyRel, age: Number(newFamilyAge) }
            ]
          };
        }
        return m;
      })
    );

    setNewFamilyName("");
  };

  // General counts & metrics
  const activeMembers = members.filter((m) => m.status === "ACTIVE").length;
  const pendingMembers = members.filter((m) => m.status === "PENDING").length;

  const totalDonationValue = donations
    .filter((d) => d.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingBookingsCount =
    hallBookings.filter((h) => h.status === "PENDING").length +
    poojaBookings.filter((p) => p.status === "PENDING").length;

  const upcomingEventsCount = events.filter((e) => e.status === "Upcoming").length;

  // Devotee Info based on currentMemberNumber context
  const devoteeMember = members.find((m) => m.membershipNumber === currentMemberNumber) || members[0];
  const devoteeBookings = poojaBookings.filter((p) => p.devoteeName === devoteeMember?.firstName + " " + devoteeMember?.lastName);
  const devoteeDonations = donations.filter((d) => d.donorName === devoteeMember?.firstName + " " + devoteeMember?.lastName);
  const devoteeDarshans = darshanBookings.filter((d) => d.devoteeName === devoteeMember?.firstName + " " + devoteeMember?.lastName);
  const devoteeOrders = orders; // Mock orders for sandbox devotee
  
  // SVG Line Chart Details (Simulating Revenue analytics over last 6 months)
  const revenuePoints = "5,95 45,75 85,85 125,50 165,60 205,30";

  // Canvas ID Card Downloader
  const downloadIDCard = () => {
    if (!devoteeMember) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Background Fill
    ctx.fillStyle = "#FAF7F2";
    ctx.fillRect(0, 0, 600, 360);

    // 2. Gold/Bronze Borders
    ctx.strokeStyle = "#C59D5F";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 590, 350);
    ctx.strokeStyle = "#8B5E34";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(14, 14, 572, 332);

    // 3. Header Banner
    ctx.fillStyle = "#8B5E34";
    ctx.fillRect(15, 15, 570, 65);

    // Header text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px serif";
    ctx.textAlign = "center";
    ctx.fillText("SRI RADHE KRISHNA MANDIR", 300, 44);
    ctx.font = "italic 11px sans-serif";
    ctx.fillStyle = "#C59D5F";
    ctx.fillText("Official Devotee Pass", 300, 64);

    // 4. Content Details
    ctx.textAlign = "left";

    // Name Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("DEVOTEE MEMBER NAME", 40, 120);
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#111111";
    ctx.fillText(`${devoteeMember.firstName} ${devoteeMember.lastName}`.toUpperCase(), 40, 145);

    // ID Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("MEMBERSHIP ID", 40, 190);
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#111111";
    ctx.fillText(devoteeMember.membershipNumber, 40, 215);

    // Type Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("MEMBERSHIP LEVEL", 40, 260);
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#C59D5F";
    ctx.fillText(`${devoteeMember.membershipType} Patron`, 40, 285);

    // Footer lines
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText(`ISSUED: ${devoteeMember.joinedDate}`, 40, 325);
    ctx.fillText(`VALID UNTIL: ${devoteeMember.validUntil}`, 200, 325);
    ctx.fillStyle = devoteeMember.status === "ACTIVE" ? "green" : "orange";
    ctx.fillText(`STATUS: ${devoteeMember.status}`, 350, 325);

    // 5. Draw QR code
    const qrImage = new window.Image();
    qrImage.crossOrigin = "anonymous";
    qrImage.src = devoteeMember.qrCodeUrl;
    qrImage.onload = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(405, 105, 150, 150);
      ctx.drawImage(qrImage, 405, 105, 150, 150);

      // Label below QR
      ctx.fillStyle = "#8B5E34";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GATE PASS BARCODE", 480, 275);

      // Trigger Download
      const link = document.createElement("a");
      link.download = `ID_Card_${devoteeMember.membershipNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    
    // In case of network errors loading QR Code URL, draw placeholder QR
    qrImage.onerror = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(405, 105, 150, 150);
      ctx.strokeStyle = "#8B5E34";
      ctx.lineWidth = 1;
      ctx.strokeRect(405, 105, 150, 150);
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = "#111111";
      ctx.textAlign = "center";
      ctx.fillText("[QR PASS CODE]", 480, 185);

      ctx.fillStyle = "#8B5E34";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("GATE PASS BARCODE", 480, 275);

      const link = document.createElement("a");
      link.download = `ID_Card_${devoteeMember.membershipNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };
  // Devotee Restricted Access warning
  if (userRole === "DEVOTEE") {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white border border-primary-gold/10 rounded-3xl max-w-md mx-auto shadow-sm space-y-5 my-8">
        <div className="w-16 h-16 bg-primary-gold/10 rounded-full flex items-center justify-center text-primary-gold text-3xl">
          🔒
        </div>
        <div>
          <h2 className="font-heading text-2xl font-semibold text-dark-surface">Admin Access Only</h2>
          <p className="text-xs text-secondary-bronze/70 mt-2 max-w-xs leading-relaxed">
            This route is reserved for temple staff and managers. Please access your bookings and purchases from the devotee portal.
          </p>
        </div>
        <Link
          href="/user-dashboard"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-semibold bg-primary-gold text-white hover:bg-secondary-bronze transition-all shadow-md cursor-pointer"
        >
          Go to Devotee Portal
        </Link>
      </div>
    );
  }

  // Render Administrative SaaS Dashboard Overview Mode
  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-3xl font-medium text-dark-surface">
          Dashboard Overview
        </h1>
        <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
          Platform health, devotee registrations, and booking summaries.
        </p>
      </div>

      {/* Top 4 Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1 */}
        <GlassCard hoverEffect className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Total Members
              </p>
              <h3 className="text-3xl font-bold text-dark-surface font-heading">{activeMembers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-[10px] text-warning-amber font-semibold font-sans">
            <span>{pendingMembers} applications pending approval</span>
          </div>
        </GlassCard>

        {/* Stat 2 */}
        <GlassCard hoverEffect className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Total Donations
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                {formatCurrency(totalDonationValue)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-[10px] text-success-green font-semibold font-sans">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% from last month</span>
          </div>
        </GlassCard>

        {/* Stat 3 */}
        <GlassCard hoverEffect className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Pending Bookings
              </p>
              <h3 className="text-3xl font-bold text-dark-surface font-heading">
                {pendingBookingsCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-[10px] text-secondary-bronze/70 font-semibold font-sans">
            <span>Requires operational checks</span>
          </div>
        </GlassCard>

        {/* Stat 4 */}
        <GlassCard hoverEffect className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Upcoming Festivals
              </p>
              <h3 className="text-3xl font-bold text-dark-surface font-heading">
                {upcomingEventsCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-[10px] text-success-green font-semibold font-sans">
            <span>Janmashtami setups active</span>
          </div>
        </GlassCard>

      </div>

      {/* Analytics Charts & Details Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* SVG Chart Left */}
        <div className="lg:col-span-8">
          <GlassCard className="p-8 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-heading text-xl font-medium text-dark-surface">
                  Donation Revenue Trends
                </h3>
                <p className="text-[10px] text-secondary-bronze/65 font-sans mt-0.5">
                  Monthly donation collections (INR) - Simulated Chart
                </p>
              </div>
              <span className="text-xs font-semibold text-primary-gold bg-primary-gold/5 px-2.5 py-1.5 rounded-lg border border-primary-gold/15">
                Last 6 Months
              </span>
            </div>

            {/* Custom SVG line chart */}
            <div className="relative w-full h-56 mt-4">
              <svg viewBox="0 0 240 100" className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="240" y2="20" stroke="#FAF7F2" strokeWidth="1" />
                <line x1="0" y1="50" x2="240" y2="50" stroke="#FAF7F2" strokeWidth="1" />
                <line x1="0" y1="80" x2="240" y2="80" stroke="#FAF7F2" strokeWidth="1" />
                
                {/* Chart Path Line */}
                <polyline
                  fill="none"
                  stroke="url(#chartGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={revenuePoints}
                />
                
                {/* Gradients definitions */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C59D5F" />
                    <stop offset="100%" stopColor="#8B5E34" />
                  </linearGradient>
                </defs>

                {/* Data Points Markers */}
                <circle cx="5" cy="95" r="3" fill="#C59D5F" />
                <circle cx="45" cy="75" r="3" fill="#C59D5F" />
                <circle cx="85" cy="85" r="3" fill="#C59D5F" />
                <circle cx="125" cy="50" r="3" fill="#C59D5F" />
                <circle cx="165" cy="60" r="3" fill="#C59D5F" />
                <circle cx="205" cy="30" r="3" fill="#C59D5F" />
              </svg>
            </div>
            
            {/* Month labels */}
            <div className="flex justify-between px-2 text-[10px] font-bold text-secondary-bronze/70 uppercase font-sans mt-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </GlassCard>
        </div>

        {/* Recent Audits Right */}
        <div className="lg:col-span-4">
          <GlassCard className="p-8 h-full">
            <h3 className="font-heading text-xl font-medium text-dark-surface mb-6">
              Recent Audits
            </h3>
            
            <div className="space-y-4">
              {[
                { title: "Pan Number audited", time: "2 hours ago", desc: "Donation tx-2 Section 80G eligibility confirmed." },
                { title: "Priest assigned", time: "5 hours ago", desc: "Satyanarayan Pooja pb-1 assigned to Pandit Ramachandra." },
                { title: "Tally XML export completed", time: "1 day ago", desc: "Accounts closed for May 2026." },
                { title: "Hall availability updated", time: "2 days ago", desc: "Radhe Krishna Hall blocked for marriage hb-1." }
              ].map((act, idx) => (
                <div className="flex items-start space-x-3 text-xs leading-normal" key={idx}>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-gold shrink-0 mt-1.5" />
                  <div>
                    <h5 className="font-semibold text-dark-surface">{act.title}</h5>
                    <p className="text-[10px] text-secondary-bronze/60 mt-0.5">{act.time}</p>
                    <p className="text-[11px] text-secondary-bronze/85 mt-1 font-light font-sans">
                      {act.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
