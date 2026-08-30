"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  FileSpreadsheet,
  RefreshCw,
  X,
  Loader2,
  CheckCircle2,
  Crown,
  HeartHandshake,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  useCustomers,
  useAddCustomer,
  useEditCustomer,
  useDeleteCustomer,
  CanteenCustomer,
  CustomerType,
} from "@/lib/api/canteen/useCustomers";
import { exportTableToExcel } from "@/lib/exportExcel";
import { formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch live customers from database
  const { data: customerData, isLoading, refetch } = useCustomers({
    search: searchQuery,
    customerType: selectedTypeFilter === "ALL" ? undefined : selectedTypeFilter,
    page: currentPage,
    limit: 100,
  });

  const customers: CanteenCustomer[] = customerData?.data || [];
  const meta = customerData?.meta || { total: 0, totalPages: 1 };

  const addCustomerMutation = useAddCustomer();
  const editCustomerMutation = useEditCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CanteenCustomer | null>(null);

  // Form State
  const [addForm, setAddForm] = useState<{
    name: string;
    phone: string;
    email: string;
    customer_type: CustomerType;
    notes: string;
  }>({
    name: "",
    phone: "",
    email: "",
    customer_type: "Regular",
    notes: "",
  });

  const [editForm, setEditForm] = useState<{
    name: string;
    phone: string;
    email: string;
    customer_type: CustomerType;
    notes: string;
  }>({
    name: "",
    phone: "",
    email: "",
    customer_type: "Regular",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // KPI Calculations from Live DB Data
  const totalCustomersCount = meta.total || customers.length;
  const vipCount = customers.filter((c) => c.customer_type === "VIP").length;
  const regularCount = customers.filter((c) => c.customer_type === "Regular").length;
  const guestCount = customers.filter((c) => c.customer_type === "Guest").length;
  const totalSpentAll = customers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);

  // Handle Add Customer Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.phone.trim()) {
      alert("Please provide both Customer Name and Phone Number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addCustomerMutation.mutateAsync({
        name: addForm.name.trim(),
        phone: addForm.phone.trim(),
        email: addForm.email.trim() || null,
        customer_type: addForm.customer_type,
        notes: addForm.notes.trim() || null,
      });

      setShowAddModal(false);
      setAddForm({
        name: "",
        phone: "",
        email: "",
        customer_type: "Regular",
        notes: "",
      });
      alert("Devotee customer registered successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to register customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (customer: CanteenCustomer) => {
    setSelectedCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      customer_type: customer.customer_type,
      notes: customer.notes || "",
    });
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setIsSubmitting(true);
    try {
      await editCustomerMutation.mutateAsync({
        id: selectedCustomer.id,
        updates: {
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim() || null,
          customer_type: editForm.customer_type,
          notes: editForm.notes.trim() || null,
        },
      });

      setShowEditModal(false);
      setSelectedCustomer(null);
      alert("Customer profile updated successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Customer
  const handleDeleteCustomer = async (customer: CanteenCustomer) => {
    if (confirm(`Are you sure you want to delete customer record for "${customer.name}"?`)) {
      try {
        await deleteCustomerMutation.mutateAsync(customer.id);
      } catch (err: any) {
        alert(err?.response?.data?.message || "Failed to delete customer");
      }
    }
  };

  // Export Customers to Excel
  const handleExportCustomersExcel = () => {
    if (customers.length === 0) {
      alert("No customer records found to export.");
      return;
    }

    const exportData = customers.map((c, index) => ({
      "Sl No": index + 1,
      "Customer ID": c.id,
      "Full Name": c.name,
      "Phone Number": c.phone,
      "Email Address": c.email || "—",
      "Customer Type": c.customer_type,
      "Total Visits / Orders": Number(c.total_visits || c.total_orders || 0),
      "Lifetime Spend (UGX)": Number(c.total_spent || 0),
      "Last Visit Date": c.last_visit ? new Date(c.last_visit).toLocaleDateString() : "Never",
      "CRM Notes": c.notes || "—",
    }));

    exportTableToExcel(exportData, "Canteen Customer CRM Directory", `Canteen_Customers_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-7 font-sans text-left max-w-[1600px] mx-auto pb-12">
      {/* ─── Top Main Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              Canteen Customer CRM
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Live devotee visit directory, lifetime spend tracking, and loyalty profiles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
          <button
            onClick={() => refetch()}
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl flex items-center gap-2 border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-98"
            title="Refresh CRM Records"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCustomersExcel}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl flex items-center gap-2 border-none shadow-md shadow-emerald-100 transition-all cursor-pointer active:scale-98"
            title="Export Customers to Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl flex items-center gap-2 border-none shadow-lg shadow-blue-200 transition-all cursor-pointer hover:shadow-xl active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* ─── Metric KPI Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Devotees</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              {totalCustomersCount}
            </h3>
            <p className="text-xs font-semibold text-blue-600">Registered CRM Profiles</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">VIP Members</p>
            <h3 className="text-3xl font-bold text-violet-700 tracking-tight font-mono">
              {vipCount}
            </h3>
            <p className="text-xs font-semibold text-violet-600">High-Priority Patrons</p>
          </div>
          <div className="p-4 bg-violet-50 text-violet-700 rounded-3xl">
            <Crown className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Regular Customers</p>
            <h3 className="text-3xl font-bold text-emerald-600 tracking-tight font-mono">
              {regularCount}
            </h3>
            <p className="text-xs font-semibold text-emerald-600">Frequent Dining Guests</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
            <HeartHandshake className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total CRM Spend</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {formatCurrency(totalSpentAll)}
            </h3>
            <p className="text-xs font-medium text-slate-500">Cumulative Canteen Sales</p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* ─── Customer CRM Table Section ─────────────────────────────────── */}
      <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Category Pills & Search Input */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 items-center">
            {[
              { id: "ALL", label: `All Devotees (${totalCustomersCount})` },
              { id: "VIP", label: `VIP Members (${vipCount})` },
              { id: "Regular", label: `Regular Guests (${regularCount})` },
              { id: "Guest", label: `Walk-in Guests (${guestCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTypeFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedTypeFilter === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl text-sm bg-slate-50/70 outline-none focus:bg-white focus:border-blue-500 text-slate-800 font-medium transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-semibold">Loading devotee CRM records from database...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No customer records found matching your filter. Click <span className="font-bold text-blue-600">"Add Customer"</span> to create a new profile.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-xs tracking-wider pb-4">
                  <th className="pb-4 pl-3">Customer Profile</th>
                  <th className="pb-4">Phone Number</th>
                  <th className="pb-4 text-center">Customer Type</th>
                  <th className="pb-4">Visits / Orders</th>
                  <th className="pb-4">Lifetime Spend (UGX)</th>
                  <th className="pb-4">Last Visit</th>
                  <th className="pb-4 text-right pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const typeBadgeClass =
                    c.customer_type === "VIP"
                      ? "bg-violet-50 text-violet-700 border-violet-200"
                      : c.customer_type === "Regular"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-100 text-slate-600 border-slate-200";

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 pl-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.customer_type === "VIP" && (
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            )}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{c.email || "No email registered"}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-sm text-slate-700 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.phone}</span>
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase border ${typeBadgeClass}`}>
                          {c.customer_type}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-sm text-slate-800 font-mono">
                        {Number(c.total_visits || c.total_orders || 0)} orders
                      </td>
                      <td className="py-4 font-bold text-sm text-slate-900 font-mono">
                        {formatCurrency(Number(c.total_spent || 0))}
                      </td>
                      <td className="py-4 text-xs font-medium text-slate-500 font-mono">
                        {c.last_visit ? new Date(c.last_visit).toLocaleDateString("en-IN") : "Never"}
                      </td>
                      <td className="py-4 text-right pr-3 space-x-2 whitespace-nowrap">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition-all border border-blue-200 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                          title="Edit Customer Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteCustomer(c)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-200 cursor-pointer shadow-xs"
                          title="Delete Customer Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── MODAL 1: ADD NEW DEVOTEE CUSTOMER ──────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl p-7 relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Register Devotee Customer
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Create customer record for table reservations and dining loyalty
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 border-none bg-transparent cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel / Sunita Sharma"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +256 700 123456"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Customer Tier
                  </label>
                  <select
                    value={addForm.customer_type}
                    onChange={(e: any) => setAddForm({ ...addForm, customer_type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  >
                    <option value="Regular">Regular Guest</option>
                    <option value="VIP">VIP Patron (Priests & Donors)</option>
                    <option value="Guest">Walk-in Guest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. devotee@mandir.org"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Special Notes / Dietary Preferences
                </label>
                <textarea
                  placeholder="e.g. Jain food preferences, frequent family seating on Sundays..."
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-medium text-sm outline-none focus:bg-white focus:border-blue-500 h-20 resize-none transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl border-none bg-transparent cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isSubmitting ? "Registering..." : "Save Customer"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: EDIT DEVOTEE CUSTOMER ────────────────────────────── */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl p-7 relative max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Edit Profile: {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Update devotee contact info, loyalty tier, or notes
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 border-none bg-transparent cursor-pointer rounded-xl hover:bg-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Customer Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Customer Tier
                  </label>
                  <select
                    value={editForm.customer_type}
                    onChange={(e: any) => setEditForm({ ...editForm, customer_type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                  >
                    <option value="Regular">Regular Guest</option>
                    <option value="VIP">VIP Patron (Priests & Donors)</option>
                    <option value="Guest">Walk-in Guest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-semibold text-sm outline-none focus:bg-white focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Special Notes / Dietary Preferences
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/70 text-slate-900 font-medium text-sm outline-none focus:bg-white focus:border-blue-500 h-20 resize-none transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl border-none bg-transparent cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{isSubmitting ? "Updating..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
