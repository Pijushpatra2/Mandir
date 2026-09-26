"use client";

import React, { useState, useEffect } from "react";
import {
  adminListShopkeepers,
  adminCreateShopkeeper,
  adminUpdateShopkeeper,
  adminResetShopkeeperPassword,
  adminDeleteShopkeeper,
  ShopkeeperItem
} from "@/lib/shopkeeperApi";
import { GlassCard } from "@/components/ui/GlassCard";
import { layout, typography, buttons, inputs } from "@/lib/design-system";
import {
  Users,
  UserPlus,
  KeyRound,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Store,
  Lock,
  Mail,
  Phone,
  ShieldAlert
} from "lucide-react";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";

export default function DashboardShopkeepersPage() {
  const { showToast } = useApp();
  const [shopkeepers, setShopkeepers] = useState<ShopkeeperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedShopkeeper, setSelectedShopkeeper] = useState<ShopkeeperItem | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    store_name: "Main Temple Gift & Book Store",
    password: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    address: "",
  });
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    store_name: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
    address: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Password Reset State (ADMIN DIRECT OVERRIDE - NO OLD PASSWORD NEEDED)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Load shopkeepers
  const loadShopkeepers = async () => {
    try {
      setLoading(true);
      const data = await adminListShopkeepers();
      setShopkeepers(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to load shopkeepers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopkeepers();
  }, []);

  // Filtered list
  const filtered = shopkeepers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery)) ||
      (s.store_name && s.store_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      showToast("Please fill in name, email, and password.", "error");
      return;
    }
    if (createForm.password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }

    try {
      setIsSubmittingCreate(true);
      await adminCreateShopkeeper(createForm);
      showToast("Shopkeeper account created successfully!", "success");
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        store_name: "Main Temple Gift & Book Store",
        password: "",
        status: "ACTIVE",
        address: "",
      });
      loadShopkeepers();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to create shopkeeper", "error");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Handle Edit Open
  const handleOpenEdit = (s: ShopkeeperItem) => {
    setSelectedShopkeeper(s);
    setEditForm({
      name: s.name,
      phone: s.phone || "",
      store_name: s.store_name || "Main Temple Gift & Book Store",
      status: s.status,
      address: s.address || "",
    });
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopkeeper) return;

    try {
      setIsSubmittingEdit(true);
      await adminUpdateShopkeeper(selectedShopkeeper.id, editForm);
      showToast("Shopkeeper details updated successfully!", "success");
      setShowEditModal(false);
      loadShopkeepers();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update shopkeeper", "error");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Password Reset Open
  const handleOpenPasswordReset = (s: ShopkeeperItem) => {
    setSelectedShopkeeper(s);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPass(false);
    setShowPasswordModal(true);
  };

  // Handle Admin Password Reset Submit (Direct Without Old Password)
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShopkeeper) return;

    if (!newPassword || newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const res = await adminResetShopkeeperPassword(selectedShopkeeper.id, newPassword);
      showToast(res.message || "Password updated directly by Admin!", "success");
      setShowPasswordModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Handle Delete
  const handleDelete = async (s: ShopkeeperItem) => {
    if (!window.confirm(`Are you sure you want to delete shopkeeper "${s.name}" (${s.email})?`)) {
      return;
    }

    try {
      await adminDeleteShopkeeper(s.id);
      showToast("Shopkeeper deleted successfully", "success");
      loadShopkeepers();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to delete shopkeeper", "error");
    }
  };

  const activeCount = shopkeepers.filter((s) => s.status === "ACTIVE").length;

  return (
    <div className="space-y-8 font-jakarta">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`${typography.h2} text-dark-surface font-medium`}>
            Shopkeeper Staff Management
          </h1>
          <p className="text-xs text-secondary-bronze/75 mt-0.5">
            Create and manage store clerks and shopkeepers. Admin can reset shopkeeper passwords directly without old password credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadShopkeepers()}
            className={`${buttons.secondary} px-3.5 py-2 text-xs flex items-center space-x-1.5 cursor-pointer`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Shopkeeper</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <GlassCard className="p-6" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Total Shopkeepers
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                {shopkeepers.length} Staff
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Active Staff
              </p>
              <h3 className="text-2xl font-bold text-success-green font-heading">
                {activeCount} Active
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-success-green/10 flex items-center justify-center text-success-green">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6" hoverEffect={false}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-secondary-bronze/60 mb-1">
                Store Counters
              </p>
              <h3 className="text-2xl font-bold text-dark-surface font-heading">
                Main Gift & Book Store
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-gold/10 flex items-center justify-center text-primary-gold">
              <Store className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search, Filter & Table */}
      <div className="bg-white border border-primary-gold/15 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/50" />
            <input
              type="text"
              placeholder="Search shopkeeper by name, email, phone, or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputs.text} pl-10 py-2 text-xs`}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary-bronze/70 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-primary-gold/25 bg-bg-warm/40 text-xs font-semibold text-secondary-bronze focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
              <option value="SUSPENDED">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-secondary-bronze">
              <Loader2 className="w-6 h-6 animate-spin text-primary-gold" />
              <p className="text-xs">Loading shopkeeper directory...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-secondary-bronze/60 text-xs space-y-3">
              <Store className="w-8 h-8 text-primary-gold/30 mx-auto" />
              <p>No shopkeepers found matching your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-primary-gold/10 text-secondary-bronze/70 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Shopkeeper</th>
                  <th className="pb-3">Contact Info</th>
                  <th className="pb-3">Assigned Counter / Store</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Last Login</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-bg-warm/20 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-dark-surface text-sm">{s.name}</p>
                          <span className="text-[10px] text-primary-gold font-semibold uppercase tracking-wider">
                            {s.role || "SHOPKEEPER"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-4">
                      <p className="text-dark-surface font-medium">{s.email}</p>
                      <p className="text-[11px] text-secondary-bronze/75">{s.phone || "No phone"}</p>
                    </td>

                    {/* Store */}
                    <td className="py-4 font-semibold text-secondary-bronze">
                      {s.store_name || "Main Temple Gift & Book Store"}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          s.status === "ACTIVE"
                            ? "bg-success-green/10 text-success-green border border-success-green/25"
                            : s.status === "SUSPENDED"
                            ? "bg-error-red/10 text-error-red border border-error-red/25"
                            : "bg-secondary-bronze/10 text-secondary-bronze border border-secondary-bronze/25"
                        )}
                      >
                        {s.status}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-4 text-secondary-bronze/70">
                      {s.last_login ? new Date(s.last_login).toLocaleString() : "Never logged in"}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Reset Password Directly (Admin override) */}
                        <button
                          onClick={() => handleOpenPasswordReset(s)}
                          title="Reset Password (No Old Password Required)"
                          className="p-1.5 rounded-lg border border-primary-gold/25 hover:bg-primary-gold/15 text-primary-gold transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Edit Details */}
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg border border-secondary-bronze/25 hover:bg-secondary-bronze/10 text-secondary-bronze transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(s)}
                          title="Delete Shopkeeper"
                          className="p-1.5 rounded-lg border border-error-red/25 hover:bg-error-red/10 text-error-red transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================================================================
       * MODAL 1: CREATE SHOPKEEPER
       * ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold/15 text-primary-gold flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-dark-surface">
                    Create New Shopkeeper
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Register a store clerk with dashboard access credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-secondary-bronze">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="shopkeeper@example.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+256 700 000000"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-secondary-bronze">Store / Counter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Temple Gift & Book Store"
                    value={createForm.store_name}
                    onChange={(e) => setCreateForm({ ...createForm, store_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-secondary-bronze">Initial Password *</label>
                  <div className="relative">
                    <input
                      type={showCreatePass ? "text" : "password"}
                      required
                      placeholder="Min. 6 characters"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePass(!showCreatePass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-bronze/60 hover:text-dark-surface"
                    >
                      {showCreatePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-secondary-bronze">Initial Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Can log into dashboard)</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmittingCreate ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create Shopkeeper</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 2: EDIT SHOPKEEPER
       * ========================================================================= */}
      {showEditModal && selectedShopkeeper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-primary-gold/25 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-bg-warm/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-bronze/15 text-secondary-bronze flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-dark-surface">
                    Edit Shopkeeper: {selectedShopkeeper.name}
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">{selectedShopkeeper.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Assigned Store / Counter</label>
                  <input
                    type="text"
                    value={editForm.store_name}
                    onChange={(e) => setEditForm({ ...editForm, store_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED (Access Denied)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmittingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL 3: ADMIN DIRECT PASSWORD RESET (WITHOUT OLD PASSWORD)
       * ========================================================================= */}
      {showPasswordModal && selectedShopkeeper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-primary-gold/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary-gold text-white flex items-center justify-center shadow-xs">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-dark-surface">
                    Admin Password Reset
                  </h3>
                  <p className="text-xs text-secondary-bronze font-medium">{selectedShopkeeper.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="p-6 space-y-4 text-xs">
              {/* Admin Override Banner */}
              <div className="p-3.5 rounded-2xl bg-primary-gold/10 border border-primary-gold/25 flex items-start space-x-2.5 text-secondary-bronze">
                <ShieldCheck className="w-4 h-4 text-primary-gold shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Admin Authority:</strong> You can set a new password directly for <strong>{selectedShopkeeper.email}</strong> without providing their current old password.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">New Password *</label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-bronze/60 hover:text-dark-surface"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Confirm New Password *</label>
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
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-secondary-bronze/25 text-secondary-bronze hover:bg-secondary-bronze/10 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword || !newPassword || newPassword !== confirmPassword}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmittingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>Update Password Directly</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
