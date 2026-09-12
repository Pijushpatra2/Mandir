"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons } from "@/lib/design-system";
import { Download, Plus, Award, ArrowRight, Star, Users, Trash2, ShoppingBag, Package } from "lucide-react";
import Link from "next/link";
import { useMyDevoteeOrders } from "@/lib/api/shop";

interface FamilyMember {
  fullName: string;
  relationship: string;
  age: number;
}

export default function UserDashboardOverviewPage() {
  const {
    members,
    setMembers,
    currentMemberNumber,
    poojaBookings,
    donations,
    darshanBookings,
    orders,
    devoteeProfile,
    updateDevoteeProfile,
    showToast
  } = useApp();

  const activeMemberFallback = members.find((m) => m.membershipNumber === currentMemberNumber);
  
  // Real-time shopping orders
  const { data: myLiveOrders } = useMyDevoteeOrders({
    devoteeId: devoteeProfile?.id || activeMemberFallback?.id,
    email: devoteeProfile?.email || activeMemberFallback?.email,
    phone: devoteeProfile?.phone || activeMemberFallback?.phone,
  }, {
    enabled: Boolean(devoteeProfile || activeMemberFallback),
  });

  const totalStoreOrdersCount = myLiveOrders ? myLiveOrders.length : (orders?.length || 0);

  // Family profile creation state
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyRel, setNewFamilyRel] = useState("Spouse");
  const [newFamilyAge, setNewFamilyAge] = useState<number | "">(35);
  const [isAddingFamily, setIsAddingFamily] = useState(false);

  // Parse linked family members dynamically from devoteeProfile
  let familyList: FamilyMember[] = [];
  if (devoteeProfile?.family_members) {
    try {
      const parsed = typeof devoteeProfile.family_members === "string"
        ? JSON.parse(devoteeProfile.family_members)
        : devoteeProfile.family_members;
      if (Array.isArray(parsed)) {
        familyList = parsed;
      }
    } catch (_) {
      familyList = [];
    }
  } else {
    const fallbackLocalMember = members.find((m) => m.membershipNumber === currentMemberNumber) || members[0];
    if (fallbackLocalMember?.familyMembers) {
      familyList = fallbackLocalMember.familyMembers;
    }
  }

  const memNumber = devoteeProfile?.membership_number || currentMemberNumber || "MEM-2026-DEV";
  const qrUrl = devoteeProfile?.qr_code_url || (memNumber ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(memNumber)}` : null);

  const activeMember = {
    firstName: devoteeProfile?.first_name || "Devotee",
    lastName: devoteeProfile?.last_name || "Member",
    email: devoteeProfile?.email || "",
    phone: devoteeProfile?.phone || "",
    membershipNumber: memNumber,
    status: devoteeProfile?.status || "ACTIVE",
    membershipType: devoteeProfile?.membership_type || "Annual",
    qrCodeUrl: qrUrl,
    joinedDate: devoteeProfile?.joined_date ? new Date(devoteeProfile.joined_date).toISOString().split("T")[0] : "2026-01-01",
    validUntil: devoteeProfile?.valid_until ? new Date(devoteeProfile.valid_until).toISOString().split("T")[0] : "2099-12-31",
    familyMembers: familyList
  };

  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) {
      showToast("Please enter the family member's name", "error");
      return;
    }

    const newMember: FamilyMember = {
      fullName: newFamilyName.trim(),
      relationship: newFamilyRel,
      age: Number(newFamilyAge) || 0
    };

    const updated = [...familyList, newMember];

    if (devoteeProfile) {
      try {
        setIsAddingFamily(true);
        await updateDevoteeProfile({
          family_members: JSON.stringify(updated)
        });
        showToast("Family member linked successfully!", "success");
      } catch (err: any) {
        showToast("Failed to link family member", "error");
      } finally {
        setIsAddingFamily(false);
      }
    } else {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.membershipNumber === activeMember.membershipNumber) {
            return {
              ...m,
              familyMembers: [...(m.familyMembers || []), newMember]
            };
          }
          return m;
        })
      );
      showToast("Family member added!", "success");
    }

    setNewFamilyName("");
    setNewFamilyAge(35);
  };

  const devoteeBookings = poojaBookings.filter(
    (p) => activeMember && p.devoteeName.toLowerCase().includes(activeMember.firstName.toLowerCase())
  );
  const devoteeDonations = donations.filter(
    (d) => activeMember && d.donorName.toLowerCase().includes(activeMember.firstName.toLowerCase())
  );
  const devoteeDarshans = darshanBookings.filter(
    (d) => activeMember && d.devoteeName.toLowerCase().includes(activeMember.firstName.toLowerCase())
  );

  // Canvas ID Card Downloader
  const downloadIDCard = () => {
    if (!activeMember) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = 650;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Background Fill
    ctx.fillStyle = "#FAF7F2";
    ctx.fillRect(0, 0, 650, 400);

    // 2. Gold/Bronze Double Borders
    ctx.strokeStyle = "#C59D5F";
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 638, 388);
    ctx.strokeStyle = "#8B5E34";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 618, 368);

    // 3. Header Banner
    ctx.fillStyle = "#8B5E34";
    ctx.fillRect(18, 18, 614, 75);

    // Header text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 21px serif";
    ctx.textAlign = "center";
    ctx.fillText("SHREE KUTCH SATSANG SWAMINARAYAN TEMPLE", 325, 50);
    ctx.font = "italic 13px sans-serif";
    ctx.fillStyle = "#C59D5F";
    ctx.fillText("Official Devotee Membership Pass • Kampala, Uganda", 325, 74);

    // 4. Content Details
    ctx.textAlign = "left";

    // Name Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("DEVOTEE MEMBER NAME", 45, 135);
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#111111";
    ctx.fillText(`${activeMember.firstName} ${activeMember.lastName}`.toUpperCase(), 45, 162);

    // ID Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("MEMBERSHIP ID", 45, 205);
    ctx.font = "bold 19px monospace";
    ctx.fillStyle = "#C59D5F";
    ctx.fillText(activeMember.membershipNumber, 45, 230);

    // Type Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("MEMBERSHIP LEVEL", 45, 270);
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#111111";
    ctx.fillText(`${activeMember.membershipType} Patron`, 45, 292);

    // Footer lines
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText(`ISSUED: ${activeMember.joinedDate}`, 45, 355);
    ctx.fillText(`VALID UNTIL: ${activeMember.validUntil}`, 220, 355);
    ctx.fillStyle = activeMember.status === "ACTIVE" ? "#16a34a" : "#d97706";
    ctx.fillText(`STATUS: ${activeMember.status}`, 400, 355);

    // 5. Draw QR code
    if (activeMember.qrCodeUrl) {
      const qrImage = new window.Image();
      qrImage.crossOrigin = "anonymous";
      qrImage.src = activeMember.qrCodeUrl;
      qrImage.onload = () => {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(445, 120, 160, 160);
        ctx.drawImage(qrImage, 445, 120, 160, 160);

        // Label below QR
        ctx.fillStyle = "#8B5E34";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GATE SCAN PASS", 525, 300);

        // Trigger Download
        const link = document.createElement("a");
        link.download = `ID_Card_${activeMember.membershipNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("Digital Devotee ID Card downloaded!", "success");
      };
      
      qrImage.onerror = () => {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(445, 120, 160, 160);
        ctx.strokeStyle = "#8B5E34";
        ctx.lineWidth = 1;
        ctx.strokeRect(445, 120, 160, 160);
        ctx.font = "bold 12px sans-serif";
        ctx.fillStyle = "#111111";
        ctx.textAlign = "center";
        ctx.fillText("[QR PASS CODE]", 525, 205);

        ctx.fillStyle = "#8B5E34";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("GATE SCAN PASS", 525, 300);

        const link = document.createElement("a");
        link.download = `ID_Card_${activeMember.membershipNumber}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("Digital Devotee ID Card downloaded!", "success");
      };
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary-gold/15 to-secondary-bronze/10 p-6 sm:p-8 rounded-3xl border border-primary-gold/15">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-medium text-dark-surface">
            Hari Om, {activeMember?.firstName}!
          </h1>
          <p className="text-xs text-secondary-bronze/80 mt-1">
            Access your devotee pass, manage family profiles, and track sponsorships.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary-gold text-white rounded-xl shadow-md flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>{activeMember?.membershipType} Member</span>
          </span>
          <Link
            href="/user-dashboard/profile"
            className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white border border-primary-gold/30 text-secondary-bronze hover:bg-primary-gold/10 rounded-xl transition-all shadow-xs"
          >
            Manage Profile →
          </Link>
        </div>
      </div>

      {/* Row: ID Pass & Family links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Pass Column */}
        <div className="lg:col-span-5 flex flex-col">
          <GlassCard hoverEffect={false} className="p-6 sm:p-8 border-primary-gold/30 flex-grow flex flex-col justify-between bg-gradient-to-br from-surface-white to-bg-warm shadow-md relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading text-xl font-medium text-dark-surface leading-none">
                  Devotee QR Card
                </h3>
                <p className="text-[10px] text-secondary-bronze/60 mt-1">
                  Sri Radhe Krishna Mandir Kampala
                </p>
              </div>
              <span className="px-2.5 py-0.5 text-[9px] font-bold text-success-green bg-success-green/10 border border-success-green/30 rounded-full uppercase">
                {activeMember?.status}
              </span>
            </div>

            <div className="flex justify-center my-6">
              <div className="p-3 bg-surface-white border border-primary-gold/20 rounded-2xl shadow-inner">
                {activeMember.qrCodeUrl ? (
                  <img src={activeMember.qrCodeUrl} alt="Devotee QR" className="w-32 h-32 object-contain" />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-xs text-secondary-bronze/40 font-mono">
                    QR Gate Pass
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-primary-gold/10 pt-4">
              <div>
                <p className="text-[9px] text-secondary-bronze/50 uppercase font-sans">Name</p>
                <p className="font-semibold text-dark-surface">
                  {activeMember?.firstName} {activeMember?.lastName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-secondary-bronze/50 uppercase font-sans">Member ID</p>
                <p className="font-mono font-semibold text-primary-gold">
                  {activeMember?.membershipNumber}
                </p>
              </div>
            </div>
          </GlassCard>

          <button
            type="button"
            onClick={downloadIDCard}
            className="mt-4 py-3 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer hover:brightness-105 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Digital ID Card</span>
          </button>
        </div>

        {/* Family profiles Column */}
        <div className="lg:col-span-7">
          <GlassCard className="p-6 sm:p-8 border-primary-gold/15 h-full flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-heading text-2xl font-medium text-dark-surface">
                    Family Profile Linkages
                  </h3>
                  <p className="text-xs text-secondary-bronze/70 font-sans">
                    Synced with your Devotee Profile tab for group Darshan & Pooja bookings.
                  </p>
                </div>
                <span className="text-xs font-semibold text-secondary-bronze bg-bg-warm px-3 py-1 rounded-full border border-primary-gold/20">
                  {familyList.length} {familyList.length === 1 ? "Member" : "Members"}
                </span>
              </div>
              
              <div className="space-y-3 mb-6 max-h-56 overflow-y-auto">
                {familyList.map((fam, idx) => (
                  <div className="flex items-center justify-between p-3 border border-primary-gold/10 rounded-xl bg-bg-warm/50 text-xs" key={idx}>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-gold/15 flex items-center justify-center text-primary-gold font-bold text-xs">
                        {fam.fullName.charAt(0)}
                      </div>
                      <span className="font-semibold text-dark-surface">{fam.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-secondary-bronze/75">
                      <span>Rel: <strong className="text-dark-surface">{fam.relationship}</strong></span>
                      <span>Age: {fam.age} yrs</span>
                    </div>
                  </div>
                ))}
                {familyList.length === 0 && (
                  <div className="text-center py-6 border border-dashed border-primary-gold/20 rounded-2xl bg-bg-warm/20">
                    <Users className="w-8 h-8 text-primary-gold/40 mx-auto mb-1.5" />
                    <p className="text-xs text-secondary-bronze/60 font-medium">
                      No family profiles linked yet. Add members below.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleAddFamilyMember} className="border-t border-primary-gold/15 pt-4 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze">
                Link New Family Member
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  placeholder="Full Name"
                  className="px-3 py-2 text-xs rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent focus:outline-none"
                />
                <select
                  value={newFamilyRel}
                  onChange={(e) => setNewFamilyRel(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-surface-white focus:outline-none"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={newFamilyAge}
                  onChange={(e) => setNewFamilyAge(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Age"
                  className="px-3 py-2 text-xs rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isAddingFamily}
                className="w-full py-2.5 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold rounded-xl shadow flex items-center justify-center space-x-1.5 cursor-pointer hover:brightness-105 transition-all disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingFamily ? "Linking..." : "Link Profile"}</span>
              </button>
            </form>
          </GlassCard>
        </div>
      </div>

      {/* Stats Quick Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <GlassCard className="p-5 sm:p-6">
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 font-sans">My Puja Bookings</p>
          <h4 className="text-xl sm:text-2xl font-bold text-dark-surface mt-2">{devoteeBookings.length} Booked</h4>
          <Link href="/user-dashboard/bookings" className="text-[11px] text-primary-gold hover:underline font-semibold mt-1 inline-block">
            View Bookings →
          </Link>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 font-sans">My Donations</p>
          <h4 className="text-xl sm:text-2xl font-bold text-dark-surface mt-2 truncate">
            {formatCurrency(devoteeDonations.reduce((sum, d) => sum + d.amount, 0))}
          </h4>
          <Link href="/user-dashboard/donations" className="text-[11px] text-primary-gold hover:underline font-semibold mt-1 inline-block">
            View Receipts →
          </Link>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 font-sans">My Darshan Passes</p>
          <h4 className="text-xl sm:text-2xl font-bold text-dark-surface mt-2">{devoteeDarshans.length} Passes</h4>
          <Link href="/user-dashboard/bookings" className="text-[11px] text-primary-gold hover:underline font-semibold mt-1 inline-block">
            View Passes →
          </Link>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 font-sans">My Store Purchases</p>
          <h4 className="text-xl sm:text-2xl font-bold text-dark-surface mt-2">{totalStoreOrdersCount} Orders</h4>
          <Link href="/user-dashboard/orders" className="text-[11px] text-primary-gold hover:underline font-semibold mt-1 inline-block">
            Track Deliveries →
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
