"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Shield,
  UserPlus,
  Trash2,
  Edit3,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Mail,
  User,
  CheckCircle2,
  Power,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { adminApiClient } from "@/lib/apiClient";
import { useApp } from "@/lib/context";

interface AdminRecord {
  id: string; // prefixed with admin- or staff-
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isGlobal: boolean;
  createdAt: string;
}

export default function AdminRosterPage() {
  const { userRole } = useApp();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminRecord | null>(null);

  // Form States
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("trustee");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load admins on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await adminApiClient.get("/auth/admins");
      setAdmins(response.data.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? err.message ?? "Failed to fetch administrator roster.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const response = await adminApiClient.post("/auth/admins", {
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
      });

      setSuccessMsg(`Account created successfully for ${formName}!`);
      setIsAddOpen(false);
      
      // Clear form
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormRole("trustee");
      
      fetchAdmins();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? err.message ?? "Failed to create administrator account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      await adminApiClient.patch(`/auth/admins/${selectedAdmin.id}`, {
        name: formName,
        email: formEmail,
        role: formRole,
        isActive: formIsActive,
      });

      setSuccessMsg(`Administrator details updated successfully.`);
      setIsEditOpen(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? err.message ?? "Failed to update administrator account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s administrator access?`)) {
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await adminApiClient.delete(`/auth/admins/${id}`);
      setSuccessMsg(`Access revoked and account deleted for ${name}.`);
      fetchAdmins();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? err.message ?? "Failed to delete administrator account.");
    }
  };

  const toggleStatus = async (admin: AdminRecord) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await adminApiClient.patch(`/auth/admins/${admin.id}`, {
        isActive: !admin.isActive,
      });
      setAdmins(prev =>
        prev.map(a => (a.id === admin.id ? { ...a, isActive: !a.isActive } : a))
      );
      setSuccessMsg(`Access status updated for ${admin.name}.`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? err.message ?? "Failed to update administrator status.");
    }
  };

  const openAddModal = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("trustee");
    setErrorMsg("");
    setSuccessMsg("");
    setIsAddOpen(true);
  };

  const openEditModal = (admin: AdminRecord) => {
    setSelectedAdmin(admin);
    setFormName(admin.name);
    setFormEmail(admin.email);
    setFormRole(admin.role.toLowerCase());
    setFormIsActive(admin.isActive);
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditOpen(true);
  };

  const getRoleLabel = (role: string) => {
    const r = role.toLowerCase();
    if (r === "super_admin" || r === "superadmin") return "Super Admin";
    if (r === "module_admin" || r === "moduleadmin") return "Module Admin";
    if (r === "trustee") return "Trustee";
    if (r === "accountant") return "Accountant";
    if (r === "booking_manager" || r === "bookingmanager") return "Booking Manager";
    if (r === "content_manager" || r === "contentmanager") return "Content Manager";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleBadgeColor = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("super")) return "bg-error-red/10 text-error-red border border-error-red/20";
    if (r === "trustee") return "bg-primary-gold/10 text-secondary-bronze border border-primary-gold/20";
    if (r === "accountant") return "bg-success-green/10 text-success-green border border-success-green/20";
    return "bg-bg-warm text-secondary-bronze border border-primary-gold/10";
  };

  if (userRole !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Shield className="w-16 h-16 text-error-red" />
        <h2 className="font-heading text-2xl font-bold text-dark-surface">Unauthorized</h2>
        <p className="text-sm text-secondary-bronze/70">
          Only the Super Administrator role has permission to access the admin user management panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Staff & Access Roster
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Register and authorize website staff, assign roles (Trustee, Accountant, Content, Booking), and toggle permissions.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs uppercase tracking-wider shadow hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Admin / Staff</span>
        </button>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-xl border border-error-red/25 bg-error-red/5 text-error-red text-xs leading-normal max-w-3xl animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start space-x-2.5 p-3.5 rounded-xl border border-success-green/25 bg-success-green/5 text-success-green text-xs leading-normal max-w-3xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Roster Data Table */}
      <GlassCard className="overflow-hidden border border-primary-gold/15" hoverEffect={false}>
        <div className="p-6 border-b border-primary-gold/10 flex items-center justify-between">
          <h3 className="font-heading text-lg font-medium text-dark-surface flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-gold" />
            <span>Active Administrators</span>
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze bg-bg-warm px-3 py-1 rounded-xl">
            {admins.length} Accounts
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <Loader2 className="w-10 h-10 text-primary-gold animate-spin" />
            <p className="text-xs text-secondary-bronze/70">Fetching credentials list...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-16 text-center text-xs text-secondary-bronze/70">
            No administrator accounts found. Click "+ Add Admin / Staff" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-warm/30 text-[10px] font-bold uppercase tracking-wider text-secondary-bronze/80 border-b border-primary-gold/10">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Scope</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-gold/5 text-xs text-secondary-bronze">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-bg-warm/15 transition-colors">
                    <td className="px-6 py-4 font-semibold text-dark-surface">
                      {admin.name}
                      {admin.isGlobal && (
                        <span className="ml-2 text-[9px] font-bold bg-error-red/10 text-error-red px-1.5 py-0.5 rounded">
                          SYSTEM
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(admin.role)}`}>
                        {getRoleLabel(admin.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(admin)}
                        disabled={admin.isGlobal && admin.email.includes("superadmin")}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                          admin.isActive
                            ? "bg-success-green/10 border-success-green/20 text-success-green"
                            : "bg-secondary-bronze/10 border-secondary-bronze/20 text-secondary-bronze/70"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Power className="w-3 h-3" />
                        <span>{admin.isActive ? "ACTIVE" : "INACTIVE"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center font-sans font-semibold text-[10px] tracking-wider text-secondary-bronze/70 uppercase">
                      {admin.isGlobal ? "Full Platform" : "Website Modules"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-1.5 rounded-lg border border-primary-gold/20 hover:bg-primary-gold/10 text-secondary-bronze transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                          disabled={admin.isGlobal}
                          className="p-1.5 rounded-lg border border-error-red/20 hover:bg-error-red/10 text-error-red transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={admin.isGlobal ? "System administrator profiles cannot be deleted" : "Revoke staff permissions"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* 3. Add Modal Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-primary-gold/25 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-primary-gold/15 bg-bg-warm/30 flex items-center justify-between">
              <h3 className="font-heading text-lg font-medium text-dark-surface flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary-gold" />
                <span>Create Staff Account</span>
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg border border-primary-gold/15 hover:bg-bg-warm/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-primary-gold/60" />
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none placeholder-secondary-bronze/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-primary-gold/60" />
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@swami.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none placeholder-secondary-bronze/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                  Access Password *
                </label>
                <input
                  type="password"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none placeholder-secondary-bronze/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                  Access Role & Scope *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-white text-xs focus:outline-none"
                >
                  <option value="trustee">Trustee</option>
                  <option value="accountant">Accountant</option>
                  <option value="booking_manager">Booking Manager</option>
                  <option value="content_manager">Content Manager</option>
                </select>
                <p className="text-[10px] text-secondary-bronze/70 mt-1">
                  Assigns custom navigation privileges within the Main Website dashboard modules.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 border-t border-primary-gold/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-secondary-bronze hover:bg-bg-warm rounded-xl border border-primary-gold/15"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 4. Edit Modal Dialog */}
      {isEditOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-primary-gold/25 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-primary-gold/15 bg-bg-warm/30 flex items-center justify-between">
              <h3 className="font-heading text-lg font-medium text-dark-surface flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary-gold" />
                <span>Modify Staff Account</span>
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 rounded-lg border border-primary-gold/15 hover:bg-bg-warm/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                  Access Role & Scope *
                </label>
                {selectedAdmin.isGlobal ? (
                  <input
                    type="text"
                    disabled
                    value={getRoleLabel(selectedAdmin.role)}
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/15 bg-bg-warm/40 text-xs text-secondary-bronze/70 focus:outline-none"
                  />
                ) : (
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-white text-xs focus:outline-none"
                  >
                    <option value="trustee">Trustee</option>
                    <option value="accountant">Accountant</option>
                    <option value="booking_manager">Booking Manager</option>
                    <option value="content_manager">Content Manager</option>
                  </select>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formIsActive}
                  disabled={selectedAdmin.isGlobal && selectedAdmin.email.includes("superadmin")}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-primary-gold border-primary-gold/20 rounded"
                />
                <label htmlFor="editIsActive" className="text-xs font-semibold text-secondary-bronze cursor-pointer select-none">
                  Authorize active status (permits console access)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 border-t border-primary-gold/10 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-secondary-bronze hover:bg-bg-warm rounded-xl border border-primary-gold/15"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
