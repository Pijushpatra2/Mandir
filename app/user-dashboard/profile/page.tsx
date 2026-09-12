"use client";

import React, { useState, useEffect } from "react";
import { useApp, DevoteeProfile } from "@/lib/context";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, typography, buttons, badges } from "@/lib/design-system";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Lock,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Download,
  QrCode,
  ShieldCheck,
  Calendar,
  Sparkles,
  Users,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FamilyMember {
  fullName: string;
  relationship: string;
  age: number;
}

export default function DevoteeProfilePage() {
  const { devoteeProfile, updateDevoteeProfile, showToast } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Uganda");
  const [postalCode, setPostalCode] = useState("");
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Add Family Member Form State
  const [newFamilyName, setNewFamilyName] = useState("");
  const [newFamilyRel, setNewFamilyRel] = useState("Spouse");
  const [newFamilyAge, setNewFamilyAge] = useState<number | "">(30);

  // Sync state when devoteeProfile changes
  useEffect(() => {
    if (devoteeProfile) {
      setFirstName(devoteeProfile.first_name || "");
      setLastName(devoteeProfile.last_name || "");
      setPhone(devoteeProfile.phone || "");
      setAddress(devoteeProfile.address || "");
      setCity(devoteeProfile.city || "Kampala");
      setCountry(devoteeProfile.country || "Uganda");
      setPostalCode(devoteeProfile.postal_code || "");

      if (devoteeProfile.family_members) {
        try {
          const parsed = typeof devoteeProfile.family_members === "string" 
            ? JSON.parse(devoteeProfile.family_members) 
            : devoteeProfile.family_members;
          if (Array.isArray(parsed)) {
            setFamilyMembers(parsed);
          }
        } catch {
          setFamilyMembers([]);
        }
      } else {
        setFamilyMembers([]);
      }
    }
  }, [devoteeProfile]);

  const handleCancelEdit = () => {
    if (devoteeProfile) {
      setFirstName(devoteeProfile.first_name || "");
      setLastName(devoteeProfile.last_name || "");
      setPhone(devoteeProfile.phone || "");
      setAddress(devoteeProfile.address || "");
      setCity(devoteeProfile.city || "Kampala");
      setCountry(devoteeProfile.country || "Uganda");
      setPostalCode(devoteeProfile.postal_code || "");
    }
    setIsEditing(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      showToast("Please fill in all required profile fields.", "error");
      return;
    }

    try {
      setIsSaving(true);
      await updateDevoteeProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        address: address.trim() || null,
        city: city.trim() || null,
        country: country.trim() || "Uganda",
        postal_code: postalCode.trim() || null,
        family_members: JSON.stringify(familyMembers),
      });
      setIsEditing(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) {
      showToast("Please provide the family member's name", "error");
      return;
    }

    const updated = [
      ...familyMembers,
      {
        fullName: newFamilyName.trim(),
        relationship: newFamilyRel,
        age: Number(newFamilyAge) || 0,
      },
    ];
    setFamilyMembers(updated);
    setNewFamilyName("");
    setNewFamilyAge(30);

    // Persist to backend if devoteeProfile is active
    if (devoteeProfile) {
      try {
        await updateDevoteeProfile({
          family_members: JSON.stringify(updated),
        });
      } catch (err: any) {
        showToast("Failed to save family member linkage", "error");
      }
    }
  };

  const handleRemoveFamilyMember = async (index: number) => {
    const updated = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updated);
    if (devoteeProfile) {
      try {
        await updateDevoteeProfile({
          family_members: JSON.stringify(updated),
        });
        showToast("Family member removed", "info");
      } catch (err: any) {
        showToast("Failed to update family linkage", "error");
      }
    }
  };

  // Canvas Digital ID Pass Downloader
  const downloadIDCard = () => {
    const memNumber = devoteeProfile?.membership_number || "MEM-2026-DEV";
    const fName = devoteeProfile?.first_name || firstName || "Devotee";
    const lName = devoteeProfile?.last_name || lastName || "Member";
    const memType = devoteeProfile?.membership_type || "Annual";
    const status = devoteeProfile?.status || "ACTIVE";
    const joinDate = devoteeProfile?.joined_date ? new Date(devoteeProfile.joined_date).toISOString().split("T")[0] : "2026-01-01";
    const validUntil = devoteeProfile?.valid_until ? new Date(devoteeProfile.valid_until).toISOString().split("T")[0] : "2099-12-31";
    const qrUrl = devoteeProfile?.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(memNumber)}`;

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
    ctx.fillText(`${fName} ${lName}`.toUpperCase(), 45, 162);

    // ID Detail
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("MEMBERSHIP ID", 45, 205);
    ctx.font = "bold 19px monospace";
    ctx.fillStyle = "#C59D5F";
    ctx.fillText(memNumber, 45, 230);

    // Type & Contact
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText("MEMBERSHIP LEVEL", 45, 270);
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#111111";
    ctx.fillText(`${memType} Patron`, 45, 292);

    // Footer lines
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#8B5E34";
    ctx.fillText(`ISSUED: ${joinDate}`, 45, 355);
    ctx.fillText(`VALID UNTIL: ${validUntil}`, 220, 355);
    ctx.fillStyle = status === "ACTIVE" ? "#16a34a" : "#d97706";
    ctx.fillText(`STATUS: ${status}`, 400, 355);

    // 5. Draw QR code
    const qrImage = new window.Image();
    qrImage.crossOrigin = "anonymous";
    qrImage.src = qrUrl;
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
      link.download = `Devotee_Pass_${memNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Digital Devotee Pass downloaded!", "success");
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
      link.download = `Devotee_Pass_${memNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Digital Devotee Pass downloaded!", "success");
    };
  };

  const memNumber = devoteeProfile?.membership_number || "MEM-2026-DEV";
  const qrUrl = devoteeProfile?.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(memNumber)}`;

  return (
    <div className="space-y-8 font-jakarta max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-bg-warm via-surface-white to-primary-gold/15 p-6 sm:p-8 border border-primary-gold/25 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary-gold to-secondary-bronze text-white flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-lg shadow-secondary-bronze/20 border-2 border-white">
              {(firstName.charAt(0) || "D") + (lastName.charAt(0) || "P")}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading text-2xl sm:text-3xl font-medium text-dark-surface">
                  {firstName || "Devotee"} {lastName || "Member"}
                </h1>
                <span className={cn(
                  "px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                  devoteeProfile?.status === "ACTIVE" ? "bg-success-green/15 text-success-green border border-success-green/30" :
                  devoteeProfile?.status === "PENDING" ? "bg-warning-amber/15 text-warning-amber border border-warning-amber/30" :
                  "bg-error-red/15 text-error-red border border-error-red/30"
                )}>
                  {devoteeProfile?.status || "ACTIVE"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-secondary-bronze font-sans flex-wrap">
                <span className="font-mono font-semibold text-primary-gold bg-primary-gold/10 px-2.5 py-0.5 rounded-lg border border-primary-gold/20">
                  {memNumber}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary-bronze" />
                  {devoteeProfile?.membership_type || "Annual"} Membership
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-secondary-bronze" />
                  Joined: {devoteeProfile?.joined_date ? new Date(devoteeProfile.joined_date).toLocaleDateString() : "2026"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-xl border border-secondary-bronze/30 text-secondary-bronze hover:bg-secondary-bronze/10 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Personal Info Form + QR Pass Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Personal Information & Family Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Information Form */}
          <GlassCard className="p-6 sm:p-8 border-primary-gold/20 bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-primary-gold/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary-gold/10 text-primary-gold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-medium text-dark-surface">
                    Personal Information
                  </h2>
                  <p className="text-xs text-secondary-bronze/70 font-sans">
                    Update your personal contact details and residential address.
                  </p>
                </div>
              </div>
              {isEditing && (
                <span className="text-[11px] font-semibold text-primary-gold bg-primary-gold/10 px-2.5 py-1 rounded-full animate-pulse">
                  Editing Mode Active
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary-bronze flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-gold" />
                    First Name <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-xs font-sans border transition-all focus:outline-none",
                      isEditing
                        ? "border-primary-gold/40 focus:border-primary-gold bg-surface-white ring-1 ring-primary-gold/20"
                        : "border-primary-gold/15 bg-bg-warm/40 text-dark-surface cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary-bronze flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary-gold" />
                    Last Name <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-xs font-sans border transition-all focus:outline-none",
                      isEditing
                        ? "border-primary-gold/40 focus:border-primary-gold bg-surface-white ring-1 ring-primary-gold/20"
                        : "border-primary-gold/15 bg-bg-warm/40 text-dark-surface cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Email Address - Strictly Locked / Read Only */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-secondary-bronze flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary-gold" />
                      Email Address (Locked & Verified)
                    </label>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-secondary-bronze/80 bg-secondary-bronze/10 px-2 py-0.5 rounded-md">
                      <Lock className="w-3 h-3 text-secondary-bronze" />
                      Immutable
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={devoteeProfile?.email || "devotee@example.com"}
                      className="w-full px-4 py-2.5 pl-10 rounded-xl text-xs font-sans border border-primary-gold/20 bg-gray-100/80 text-gray-600 cursor-not-allowed font-medium select-none"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-[11px] text-secondary-bronze/70 font-sans italic flex items-center gap-1 mt-1">
                    <span>* For identity verification & security reasons, devotee email addresses cannot be altered directly.</span>
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary-bronze flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary-gold" />
                    Phone Number <span className="text-error-red">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 700 000000"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-xs font-sans border transition-all focus:outline-none",
                      isEditing
                        ? "border-primary-gold/40 focus:border-primary-gold bg-surface-white ring-1 ring-primary-gold/20"
                        : "border-primary-gold/15 bg-bg-warm/40 text-dark-surface cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Postal Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary-bronze flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-gold" />
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="P.O. Box or Code"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-xs font-sans border transition-all focus:outline-none",
                      isEditing
                        ? "border-primary-gold/40 focus:border-primary-gold bg-surface-white ring-1 ring-primary-gold/20"
                        : "border-primary-gold/15 bg-bg-warm/40 text-dark-surface cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Street Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-secondary-bronze flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-gold" />
                    Street / Residential Address
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot / Street / Neighborhood"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-xs font-sans border transition-all focus:outline-none",
                      isEditing
                        ? "border-primary-gold/40 focus:border-primary-gold bg-surface-white ring-1 ring-primary-gold/20"
                        : "border-primary-gold/15 bg-bg-warm/40 text-dark-surface cursor-not-allowed"
                    )}
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary-bronze flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary-gold" />
                    City
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Kampala"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-xs font-sans border transition-all focus:outline-none",
                      isEditing
                        ? "border-primary-gold/40 focus:border-primary-gold bg-surface-white ring-1 ring-primary-gold/20"
                        : "border-primary-gold/15 bg-bg-warm/40 text-dark-surface cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-secondary-bronze flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary-gold" />
                    Country
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Uganda"
                    className={cn(
                      "w-full px-4 py-2.5 rounded-xl text-xs font-sans border transition-all focus:outline-none",
                      isEditing
                        ? "border-primary-gold/40 focus:border-primary-gold bg-surface-white ring-1 ring-primary-gold/20"
                        : "border-primary-gold/15 bg-bg-warm/40 text-dark-surface cursor-not-allowed"
                    )}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary-gold/15">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 rounded-xl border border-secondary-bronze/30 text-secondary-bronze hover:bg-secondary-bronze/10 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving Updates..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              )}
            </form>
          </GlassCard>

          {/* Linked Family Profiles Section */}
          <GlassCard className="p-6 sm:p-8 border-primary-gold/20 bg-white shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-primary-gold/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-secondary-bronze/10 text-secondary-bronze">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-medium text-dark-surface">
                    Linked Family Members
                  </h2>
                  <p className="text-xs text-secondary-bronze/70 font-sans">
                    Register family members under your devotee account for group Darshan & Pooja bookings.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-secondary-bronze bg-bg-warm px-3 py-1 rounded-full border border-primary-gold/20">
                {familyMembers.length} {familyMembers.length === 1 ? "Member" : "Members"} Linked
              </span>
            </div>

            {/* Family Members List */}
            <div className="space-y-3">
              {familyMembers.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-primary-gold/15 bg-bg-warm/50 hover:bg-bg-warm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-gold/15 text-primary-gold flex items-center justify-center font-bold text-xs">
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-dark-surface">
                        {member.fullName}
                      </p>
                      <p className="text-[10px] text-secondary-bronze/75 font-sans">
                        Relationship: <span className="font-medium text-secondary-bronze">{member.relationship}</span> • Age: {member.age} yrs
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFamilyMember(index)}
                    className="p-1.5 rounded-lg text-secondary-bronze/60 hover:text-error-red hover:bg-error-red/10 transition-colors cursor-pointer"
                    title="Remove family member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {familyMembers.length === 0 && (
                <div className="text-center py-6 border border-dashed border-primary-gold/25 rounded-2xl bg-bg-warm/30">
                  <Users className="w-8 h-8 text-primary-gold/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-dark-surface">No Family Members Linked Yet</p>
                  <p className="text-[11px] text-secondary-bronze/60 font-sans max-w-sm mx-auto mt-0.5">
                    Add your spouse, children, or parents below to include them under your temple pass.
                  </p>
                </div>
              )}
            </div>

            {/* Add New Family Member Form */}
            <form onSubmit={handleAddFamilyMember} className="border-t border-primary-gold/15 pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-bronze">
                Add Family Member
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    required
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="Full Legal Name"
                    className="w-full px-3.5 py-2 rounded-xl text-xs border border-primary-gold/25 focus:border-primary-gold bg-transparent focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-4">
                  <select
                    value={newFamilyRel}
                    onChange={(e) => setNewFamilyRel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-primary-gold/25 focus:border-primary-gold bg-surface-white focus:outline-none"
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
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={newFamilyAge}
                    onChange={(e) => setNewFamilyAge(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Age"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-primary-gold/25 focus:border-primary-gold bg-transparent focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold rounded-xl shadow hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Link Family Member</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Devotee QR Pass & Digital Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Devotee Digital QR Pass Card */}
          <GlassCard hoverEffect={false} className="p-6 sm:p-7 border-primary-gold/30 bg-gradient-to-br from-surface-white via-bg-warm to-primary-gold/10 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                  Official Digital Pass
                </span>
                <h3 className="font-heading text-xl font-medium text-dark-surface leading-tight mt-0.5">
                  SKSS Kampala
                </h3>
              </div>
              <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-success-green/15 text-success-green border border-success-green/30 rounded-full">
                {devoteeProfile?.status || "ACTIVE"}
              </span>
            </div>

            {/* QR Code Graphic Box */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="p-3 bg-white border-2 border-primary-gold/30 rounded-2xl shadow-md">
                <img
                  src={qrUrl}
                  alt="Devotee Pass QR Code"
                  className="w-36 h-36 object-contain"
                />
              </div>
              <p className="text-[10px] font-mono font-bold text-secondary-bronze tracking-wider mt-3 bg-white/80 px-3 py-1 rounded-md border border-primary-gold/20 shadow-xs">
                {memNumber}
              </p>
              <p className="text-[11px] text-secondary-bronze/70 text-center mt-1 font-sans">
                Scan at temple entrance for instant verification
              </p>
            </div>

            {/* Member Details in Card */}
            <div className="space-y-2.5 text-xs border-t border-primary-gold/20 pt-4 font-sans">
              <div className="flex justify-between items-center">
                <span className="text-secondary-bronze/70 text-[11px]">Member:</span>
                <span className="font-semibold text-dark-surface">
                  {firstName} {lastName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-bronze/70 text-[11px]">Level:</span>
                <span className="font-semibold text-primary-gold">
                  {devoteeProfile?.membership_type || "Annual"} Patron
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-bronze/70 text-[11px]">Valid Until:</span>
                <span className="font-semibold text-dark-surface">
                  {devoteeProfile?.valid_until ? new Date(devoteeProfile.valid_until).toLocaleDateString() : "Life Member (2099)"}
                </span>
              </div>
            </div>

            {/* Download Button */}
            <button
              type="button"
              onClick={downloadIDCard}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Digital ID Card</span>
            </button>
          </GlassCard>

          {/* Quick Help Card */}
          <GlassCard hoverEffect={false} className="p-5 border-primary-gold/15 bg-white text-xs space-y-3 font-sans">
            <div className="flex items-center gap-2 text-primary-gold font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Devotee Pass Guidelines</span>
            </div>
            <p className="text-secondary-bronze/75 text-[11px] leading-relaxed">
              Present your QR code pass upon arrival at Shree Kutch Satsang Swaminarayan Temple Kampala for fast check-in to events, pooja ceremonies, and dining privileges.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
