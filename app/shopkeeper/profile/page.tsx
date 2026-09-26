"use client";

import React, { useState, useEffect } from "react";
import {
  getShopkeeperProfile,
  updateShopkeeperProfile,
  changeShopkeeperPassword,
  ShopkeeperItem
} from "@/lib/shopkeeperApi";
import {
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Lock,
  Save,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShopkeeperProfilePage() {
  const [profile, setProfile] = useState<ShopkeeperItem | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile Edit State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileToast, setProfileToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password Change State (REQUIRES OLD/CURRENT PASSWORD)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passToast, setPassToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load Profile
  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await getShopkeeperProfile();
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
    } catch (err: any) {
      console.error("Failed to load shopkeeper profile", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileToast(null);

    if (!name.trim()) {
      setProfileToast({ text: "Name cannot be empty.", type: "error" });
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const updated = await updateShopkeeperProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setProfile(updated);
      setProfileToast({ text: "Profile details updated successfully!", type: "success" });
    } catch (err: any) {
      setProfileToast({
        text: err.response?.data?.message || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Self Password Change (Requires current old password)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassToast(null);

    if (!currentPassword) {
      setPassToast({ text: "Please enter your current password.", type: "error" });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPassToast({ text: "New password must be at least 6 characters long.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassToast({ text: "New password and confirmation do not match.", type: "error" });
      return;
    }

    try {
      setIsChangingPass(true);
      const res = await changeShopkeeperPassword({
        currentPassword,
        newPassword,
      });
      setPassToast({ text: res.message || "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassToast({
        text: err.response?.data?.message || "Incorrect current password or change failed.",
        type: "error",
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 font-jakarta">
        <Loader2 className="w-8 h-8 animate-spin text-primary-gold" />
        <p className="text-xs text-secondary-bronze">Loading shopkeeper profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-jakarta max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface">
          My Account & Security
        </h1>
        <p className="text-xs text-secondary-bronze/75 mt-0.5">
          Manage your clerk credentials, assigned temple store counter, and update your personal password.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-gold via-[#d4af37] to-secondary-bronze text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-primary-gold/20">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h2 className="font-heading text-xl font-bold text-dark-surface">
                {profile?.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-gold/15 text-primary-gold text-[10px] font-bold uppercase tracking-wider">
                {profile?.role || "SHOPKEEPER"}
              </span>
            </div>
            <p className="text-xs text-secondary-bronze font-medium flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-primary-gold" />
              <span>{profile?.email}</span>
            </p>
            <p className="text-xs text-secondary-bronze/70 flex items-center space-x-2">
              <Store className="w-3.5 h-3.5 text-primary-gold" />
              <span>{profile?.store_name || "Main Temple Gift & Book Store"}</span>
            </p>
          </div>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-primary-gold/15 pt-4 sm:pt-0 sm:pl-6 space-y-1 text-xs text-secondary-bronze/80">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-success-green" />
            <span>Account Status: <strong>{profile?.status || "ACTIVE"}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-secondary-bronze/60">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Login: {profile?.last_login ? new Date(profile.last_login).toLocaleString() : "First Session"}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Profile Form & Password Change Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* =========================================================================
         * FORM 1: PERSONAL DETAILS
         * ========================================================================= */}
        <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-primary-gold/10">
            <div className="w-9 h-9 rounded-xl bg-primary-gold/10 text-primary-gold flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-dark-surface">
                Personal Information
              </h3>
              <p className="text-[11px] text-secondary-bronze/70">
                Update your display name and contact phone number.
              </p>
            </div>
          </div>

          {profileToast && (
            <div
              className={cn(
                "p-3 rounded-xl border flex items-center space-x-2 text-xs",
                profileToast.type === "success"
                  ? "bg-success-green/10 border-success-green/30 text-success-green"
                  : "bg-error-red/10 border-error-red/30 text-error-red"
              )}
            >
              {profileToast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileToast.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-secondary-bronze">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-secondary-bronze">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/15 bg-bg-warm/70 text-secondary-bronze/70 cursor-not-allowed focus:outline-none"
              />
              <p className="text-[10px] text-secondary-bronze/50">
                Email is tied to your staff login and can only be altered by Super Admin.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-secondary-bronze">Phone Contact</label>
              <input
                type="tel"
                placeholder="+256 700 000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-secondary-bronze">Counter / Desk Address</label>
              <input
                type="text"
                placeholder="e.g. Ground Floor Main Temple Entrance Desk"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* =========================================================================
         * FORM 2: CHANGE PASSWORD (REQUIRES OLD PASSWORD)
         * ========================================================================= */}
        <div className="bg-white border border-primary-gold/20 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-primary-gold/10">
            <div className="w-9 h-9 rounded-xl bg-primary-gold/10 text-primary-gold flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-dark-surface">
                Change My Password
              </h3>
              <p className="text-[11px] text-secondary-bronze/70">
                Self-service security change requiring your current password.
              </p>
            </div>
          </div>

          {passToast && (
            <div
              className={cn(
                "p-3 rounded-xl border flex items-center space-x-2 text-xs",
                passToast.type === "success"
                  ? "bg-success-green/10 border-success-green/30 text-success-green"
                  : "bg-error-red/10 border-error-red/30 text-error-red"
              )}
            >
              {passToast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passToast.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            {/* Current Password Field (Required for Shopkeeper) */}
            <div className="space-y-1">
              <label className="font-semibold text-secondary-bronze">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  required
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-bronze/60 hover:text-dark-surface cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="font-semibold text-secondary-bronze">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  required
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-bronze/60 hover:text-dark-surface cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="font-semibold text-secondary-bronze">
                Confirm New Password *
              </label>
              <input
                type={showNewPass ? "text" : "password"}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-xl border bg-bg-warm/30 focus:outline-none",
                  confirmPassword && newPassword !== confirmPassword
                    ? "border-error-red focus:border-error-red"
                    : "border-primary-gold/25 focus:border-primary-gold"
                )}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-error-red mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPass || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isChangingPass ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
