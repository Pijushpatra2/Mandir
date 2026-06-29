"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, cards, typography, buttons } from "@/lib/design-system";
import { Download, Plus, Award, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export default function UserDashboardOverviewPage() {
  const {
    members,
    setMembers,
    currentMemberNumber,
    poojaBookings,
    donations,
    darshanBookings,
    orders
  } = useApp();

  // Family profile creation state
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyRel, setNewFamilyRel] = useState("Spouse");
  const [newFamilyAge, setNewFamilyAge] = useState<number>(35);

  const activeMember = members.find((m) => m.membershipNumber === currentMemberNumber) || members[0];

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName || !activeMember) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.membershipNumber === activeMember.membershipNumber) {
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
    ctx.fillText("SHREE KUTCH SATSANG SWAMINARAYAN TEMPLE", 300, 44);
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
    ctx.fillText(`${activeMember.firstName} ${activeMember.lastName}`.toUpperCase(), 40, 145);

    // ID Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("MEMBERSHIP ID", 40, 190);
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#111111";
    ctx.fillText(activeMember.membershipNumber, 40, 215);

    // Type Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("MEMBERSHIP LEVEL", 40, 260);
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#C59D5F";
    ctx.fillText(`${activeMember.membershipType} Patron`, 40, 285);

    // Footer lines
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText(`ISSUED: ${activeMember.joinedDate}`, 40, 325);
    ctx.fillText(`VALID UNTIL: ${activeMember.validUntil}`, 200, 325);
    ctx.fillStyle = activeMember.status === "ACTIVE" ? "green" : "orange";
    ctx.fillText(`STATUS: ${activeMember.status}`, 350, 325);

    // 5. Draw QR code
    const qrImage = new window.Image();
    qrImage.crossOrigin = "anonymous";
    qrImage.src = activeMember.qrCodeUrl;
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
      link.download = `ID_Card_${activeMember.membershipNumber}.png`;
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
      link.download = `ID_Card_${activeMember.membershipNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary-gold/15 to-secondary-bronze/10 p-8 rounded-3xl border border-primary-gold/15">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Hari Om, {activeMember?.firstName}!
          </h1>
          <p className="text-xs text-secondary-bronze/80 mt-1">
            Access your devotee pass, manage family profiles, and track sponsorships.
          </p>
        </div>
        <span className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary-gold text-white rounded-xl shadow-md flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          <span>{activeMember?.membershipType} Member</span>
        </span>
      </div>

      {/* Row: ID Pass & Family links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Pass Column */}
        <div className="lg:col-span-5 flex flex-col">
          <GlassCard hoverEffect={false} className="p-8 border-primary-gold/30 flex-grow flex flex-col justify-between bg-gradient-to-br from-surface-white to-bg-warm shadow-md relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading text-xl font-medium text-dark-surface leading-none">
                  Devotee QR Card
                </h3>
                <p className="text-[10px] text-secondary-bronze/60 mt-1">
                  Sri Radhe Krishna Mandir
                </p>
              </div>
              <span className="px-2 py-0.5 text-[8px] font-bold text-success-green bg-success-green/10 border border-success-green rounded">
                {activeMember?.status}
              </span>
            </div>

            <div className="flex justify-center my-6">
              <div className="p-2 bg-surface-white border border-primary-gold/15 rounded-xl shadow-inner">
                <img src={activeMember?.qrCodeUrl} alt="Devotee QR" className="w-28 h-28" />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-primary-gold/10 pt-4">
              <div>
                <p className="text-[9px] text-secondary-bronze/50 uppercase">Name</p>
                <p className="font-semibold text-dark-surface">
                  {activeMember?.firstName} {activeMember?.lastName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-secondary-bronze/50 uppercase">Member ID</p>
                <p className="font-mono font-semibold text-dark-surface">
                  {activeMember?.membershipNumber}
                </p>
              </div>
            </div>
          </GlassCard>

          <button
            onClick={downloadIDCard}
            className="mt-4 py-3 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center space-x-1.5 cursor-pointer hover:brightness-105 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Digital ID Card</span>
          </button>
        </div>

        {/* Family profiles Column */}
        <div className="lg:col-span-7">
          <GlassCard className="p-8 border-primary-gold/15 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-heading text-2xl font-medium text-dark-surface mb-6">
                Family Profile Linkages
              </h3>
              
              <div className="space-y-3 mb-6">
                {activeMember?.familyMembers.map((fam, idx) => (
                  <div className="flex items-center justify-between p-3 border border-primary-gold/10 rounded-xl bg-bg-warm/50 text-xs" key={idx}>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-gold/10 flex items-center justify-center text-primary-gold font-bold">
                        {fam.fullName.charAt(0)}
                      </div>
                      <span className="font-semibold text-dark-surface">{fam.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-secondary-bronze/75">
                      <span>Rel: {fam.relationship}</span>
                      <span>Age: {fam.age} yrs</span>
                    </div>
                  </div>
                ))}
                {activeMember?.familyMembers.length === 0 && (
                  <p className="text-xs text-secondary-bronze/50 font-light text-center py-4">
                    No family profiles linked yet. Add members below.
                  </p>
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
                  className="px-3 py-2 text-xs rounded-lg border border-primary-gold/25 focus:border-primary-gold bg-transparent focus:outline-none"
                />
                <select
                  value={newFamilyRel}
                  onChange={(e) => setNewFamilyRel(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-primary-gold/25 focus:border-primary-gold bg-transparent focus:outline-none"
                >
                  <option>Spouse</option>
                  <option>Son</option>
                  <option>Daughter</option>
                  <option>Father</option>
                  <option>Mother</option>
                </select>
                <input
                  type="number"
                  required
                  value={newFamilyAge}
                  onChange={(e) => setNewFamilyAge(Number(e.target.value))}
                  placeholder="Age"
                  className="px-3 py-2 text-xs rounded-lg border border-primary-gold/25 focus:border-primary-gold bg-transparent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center space-x-1.5 cursor-pointer hover:brightness-105 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Profile</span>
              </button>
            </form>
          </GlassCard>
        </div>
      </div>

      {/* Stats Quick Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60">My Puja Bookings</p>
          <h4 className="text-2xl font-bold text-dark-surface mt-2">{devoteeBookings.length} Booked</h4>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60">My Donations</p>
          <h4 className="text-2xl font-bold text-dark-surface mt-2">
            {formatCurrency(devoteeDonations.reduce((sum, d) => sum + d.amount, 0))} Paid
          </h4>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60">My Darshan Passes</p>
          <h4 className="text-2xl font-bold text-dark-surface mt-2">{devoteeDarshans.length} Slots</h4>
        </GlassCard>
      </div>
    </div>
  );
}
