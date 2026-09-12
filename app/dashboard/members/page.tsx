"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/context";
import { GlassCard } from "@/components/ui/GlassCard";
import { QrCameraScanner } from "@/components/ui/QrCameraScanner";
import {
  Search,
  Check,
  X,
  Eye,
  FileSpreadsheet,
  ShieldAlert,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Clock,
  ChevronRight,
  Printer,
  Copy,
  UserCheck,
  Layers,
  HeartHandshake,
  Landmark,
  Flame,
  BadgeCheck,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { devoteeApiClient } from "@/lib/apiClient";
import * as XLSX from "xlsx";

interface MemberItem {
  id: string;
  membershipNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipType: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "EXPIRED" | string;
  joinedDate: string;
  validUntil: string;
  qrCodeUrl: string;
  familyMembers: any[];
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  avatarUrl?: string;
}

export default function MembershipsDashboardPage() {
  const { userRole, updateDevoteeStatus, getDevoteeDetails, verifyMemberPass, showToast } = useApp();
  
  // Member List & Filters
  const [membersList, setMembersList] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");

  // Selected Member for "View Details" Modal / Inspector
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [memberStats, setMemberStats] = useState<any | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // QR Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Fetch real-time registered devotees from DB
  const fetchDevotees = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      const res = await devoteeApiClient.get("/devotees/admin/all");
      const dataArray = res.data?.data?.devotees || res.data?.data || [];

      if (Array.isArray(dataArray)) {
        const fetched = dataArray.map((d: any) => {
          let parsedFamily = [];
          if (d.family_members) {
            try {
              parsedFamily = typeof d.family_members === "string" ? JSON.parse(d.family_members) : d.family_members;
            } catch (_) {}
          }
          return {
            id: d.id,
            membershipNumber: d.membership_number,
            firstName: d.first_name,
            lastName: d.last_name,
            email: d.email,
            phone: d.phone,
            membershipType: d.membership_type || "Annual",
            status: d.status || "ACTIVE",
            joinedDate: d.joined_date ? new Date(d.joined_date).toISOString().split("T")[0] : "2026-01-01",
            validUntil: d.valid_until ? new Date(d.valid_until).toISOString().split("T")[0] : "2099-12-31",
            qrCodeUrl: d.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(d.membership_number)}`,
            familyMembers: parsedFamily,
            address: d.address || "",
            city: d.city || "Kampala",
            country: d.country || "Uganda",
            postalCode: d.postal_code || "",
            avatarUrl: d.avatar_url || null,
          };
        });

        setMembersList(fetched);
      }
    } catch (err: any) {
      showToast("Failed to load members from database", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDevotees();
  }, [fetchDevotees]);

  // Load detailed stats & bookings when opening "View Details"
  const handleOpenDetails = async (member: MemberItem) => {
    setSelectedMember(member);
    setMemberStats(null);
    setIsLoadingStats(true);

    try {
      const details = await getDevoteeDetails(member.id);
      if (details?.stats) {
        setMemberStats(details.stats);
      }
    } catch (e) {
      // stats fallback
      setMemberStats({
        hallBookingsCount: 0,
        darshanBookingsCount: 0,
        pujaBookingsCount: 0,
        recentHallBookings: [],
        recentDarshanBookings: [],
        recentPujaBookings: [],
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Update devotee status dynamically (ACTIVE, SUSPENDED, PENDING)
  const handleStatusChange = async (memberId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await updateDevoteeStatus(memberId, newStatus);
      
      // Update local state
      setMembersList((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status: newStatus } : m))
      );

      if (selectedMember && selectedMember.id === memberId) {
        setSelectedMember((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      if (scanResult && (scanResult.id === memberId || scanResult.membershipNumber === selectedMember?.membershipNumber)) {
        setScanResult((prev: any) => ({
          ...prev,
          status: newStatus,
          isValid: newStatus === "ACTIVE",
        }));
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to update member status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Verify Pass by code / QR scan
  const handleVerifyPass = async (codeToVerify?: string) => {
    const code = (codeToVerify || scannedCode).trim();
    if (!code) {
      setScanError("Please enter or scan a valid membership ID / QR Code.");
      return;
    }

    try {
      setIsVerifying(true);
      setScanError(null);
      setScanResult(null);

      let parsedNumber = code;
      if (code.includes("data=")) {
        const urlParams = new URLSearchParams(code.split("?")[1]);
        parsedNumber = urlParams.get("data") || code;
      }

      // Try server verify endpoint
      try {
        const result = await verifyMemberPass(parsedNumber);
        setScanResult(result);
        return;
      } catch (err: any) {
        // Fallback to local members list if needed
        const localMatch = membersList.find(
          (m) => m.membershipNumber.toLowerCase() === parsedNumber.toLowerCase()
        );
        if (localMatch) {
          setScanResult({
            id: localMatch.id,
            isValid: localMatch.status === "ACTIVE",
            membershipNumber: localMatch.membershipNumber,
            fullName: `${localMatch.firstName} ${localMatch.lastName}`,
            status: localMatch.status,
            membershipType: localMatch.membershipType,
            joinedDate: localMatch.joinedDate,
            validUntil: localMatch.validUntil,
            phone: localMatch.phone,
            email: localMatch.email,
            address: localMatch.address,
            city: localMatch.city,
            country: localMatch.country,
            familyMembers: localMatch.familyMembers,
            qrCodeUrl: localMatch.qrCodeUrl,
          });
          return;
        }
        setScanError(err.response?.data?.message || `No membership pass found matching '${parsedNumber}'.`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Export filtered members to Excel spreadsheet
  const handleExportExcel = () => {
    if (filteredMembers.length === 0) {
      showToast("No member records to export", "info");
      return;
    }

    const exportData = filteredMembers.map((m) => ({
      "Membership ID": m.membershipNumber,
      "First Name": m.firstName,
      "Last Name": m.lastName,
      "Email Address": m.email,
      "Phone Number": m.phone,
      "Membership Tier": m.membershipType,
      "Status": m.status,
      "Joined Date": m.joinedDate,
      "Valid Until": m.validUntil,
      "City": m.city,
      "Country": m.country,
      "Linked Family Count": m.familyMembers?.length || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Devotees");
    XLSX.writeFile(wb, `SKSS_Devotee_Directory_${new Date().toISOString().split("T")[0]}.xlsx`);
    showToast("Devotee directory exported successfully", "success");
  };

  // Filter list
  const filteredMembers = membersList.filter((m) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.firstName?.toLowerCase().includes(q) ||
      m.lastName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.membershipNumber?.toLowerCase().includes(q) ||
      m.city?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "All" ? true : m.status === statusFilter;
    const matchesTier = tierFilter === "All" ? true : m.membershipType === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  // Calculate live statistics
  const totalMembersCount = membersList.length;
  const activePassesCount = membersList.filter((m) => m.status === "ACTIVE").length;
  const pendingApprovalsCount = membersList.filter((m) => m.status === "PENDING").length;
  const totalFamilyCount = membersList.reduce((acc, m) => acc + (m.familyMembers?.length || 0), 0);

  return (
    <div className="space-y-8 font-poppins pb-16">
      {/* Header & Quick Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-surface">
              Devotee & Membership Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-gold/15 text-primary-gold font-bold text-xs">
              Live Database
            </span>
          </div>
          <p className="text-xs sm:text-sm text-secondary-bronze/75 font-normal mt-1">
            Audit registered temple devotees, scan digital QR passes, inspect family profiles, and manage access status.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchDevotees(true)}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-secondary-bronze hover:text-dark-surface hover:bg-bg-warm text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary-gold ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl border border-primary-gold/25 bg-white text-secondary-bronze hover:text-dark-surface hover:bg-bg-warm text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-success-green" />
            <span>Export Excel</span>
          </button>

          {/* Scan QR Pass Action Button */}
          <button
            type="button"
            onClick={() => {
              setIsScannerOpen(true);
              setScanResult(null);
              setScanError(null);
              setScannedCode("");
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Gate Pass</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Devotees */}
        <div className="p-5 rounded-2xl bg-white border border-primary-gold/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-gold/15 text-primary-gold flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary-bronze font-medium">Total Registered</p>
            <h3 className="font-heading text-2xl font-bold text-dark-surface mt-0.5">
              {totalMembersCount}
            </h3>
          </div>
        </div>

        {/* Active Passes */}
        <div className="p-5 rounded-2xl bg-white border border-primary-gold/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success-green/15 text-success-green flex items-center justify-center shrink-0">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary-bronze font-medium">Active Passes</p>
            <h3 className="font-heading text-2xl font-bold text-dark-surface mt-0.5">
              {activePassesCount}
            </h3>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-2xl bg-white border border-primary-gold/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-warning-amber/15 text-warning-amber flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary-bronze font-medium">Pending Review</p>
            <h3 className="font-heading text-2xl font-bold text-dark-surface mt-0.5">
              {pendingApprovalsCount}
            </h3>
          </div>
        </div>

        {/* Linked Family Members */}
        <div className="p-5 rounded-2xl bg-white border border-primary-gold/15 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-bronze/15 text-secondary-bronze flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-secondary-bronze font-medium">Linked Families</p>
            <h3 className="font-heading text-2xl font-bold text-dark-surface mt-0.5">
              {totalFamilyCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-primary-gold/15 shadow-xs">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID (MEM-...), email, phone, city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-bg-warm/20 focus:bg-white text-xs font-poppins focus:outline-none transition-all"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-secondary-bronze shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-white text-xs font-poppins focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending Review</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        {/* Tier Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-secondary-bronze shrink-0">Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-white text-xs font-poppins focus:outline-none"
          >
            <option value="All">All Tiers</option>
            <option value="Annual">Annual Tier</option>
            <option value="Lifetime">Lifetime Tier</option>
            <option value="Patron">Patron Tier</option>
          </select>
        </div>
      </div>

      {/* Directory List Table */}
      <div className="overflow-x-auto bg-white rounded-3xl border border-primary-gold/15 shadow-sm">
        <table className="w-full text-left text-xs font-poppins">
          <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Devotee ID</th>
              <th className="px-6 py-4">Name & Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Tier</th>
              <th className="px-6 py-4">Joined Date</th>
              <th className="px-6 py-4">Pass Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-gold/10">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-secondary-bronze">
                  <RefreshCw className="w-8 h-8 text-primary-gold animate-spin mx-auto mb-3" />
                  <p className="font-semibold text-sm">Loading devotee directory from database...</p>
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-secondary-bronze/60 font-light">
                  <Users className="w-10 h-10 text-primary-gold/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-dark-surface">No devotee records found</p>
                  <p className="text-xs text-secondary-bronze/70 mt-1">Try adjusting your search terms or filters.</p>
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr className="hover:bg-bg-warm/50 transition-colors" key={member.id || member.membershipNumber}>
                  {/* Member ID */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-dark-surface bg-bg-warm/80 px-2 py-1 rounded-lg border border-primary-gold/20 text-[11px]">
                        {member.membershipNumber}
                      </span>
                    </div>
                  </td>

                  {/* Devotee Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-gold to-secondary-bronze text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                        {member.firstName?.charAt(0) || "D"}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-surface text-sm">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-[11px] text-secondary-bronze/75">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-secondary-bronze font-mono">
                    {member.phone || "—"}
                  </td>

                  {/* Tier */}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-primary-gold/10 text-primary-gold font-semibold text-[11px] border border-primary-gold/20">
                      {member.membershipType}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-secondary-bronze/80 font-mono">
                    {member.joinedDate}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1",
                        member.status === "ACTIVE" && "bg-success-green/10 text-success-green border border-success-green/30",
                        member.status === "PENDING" && "bg-warning-amber/10 text-warning-amber border border-warning-amber/30",
                        member.status === "EXPIRED" && "bg-secondary-bronze/10 text-secondary-bronze border border-secondary-bronze/30",
                        member.status === "SUSPENDED" && "bg-error-red/10 text-error-red border border-error-red/30"
                      )}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        member.status === "ACTIVE" ? "bg-success-green" :
                        member.status === "PENDING" ? "bg-warning-amber" :
                        member.status === "SUSPENDED" ? "bg-error-red" : "bg-secondary-bronze"
                      }`} />
                      {member.status}
                    </span>
                  </td>

                  {/* Actions: View Details Button */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(member)}
                        className="px-3 py-1.5 rounded-xl bg-primary-gold/15 text-primary-gold hover:bg-primary-gold hover:text-white transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="View Full Profile & Pass Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      {/* Quick Toggle Status */}
                      {member.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.id, "ACTIVE")}
                          className="p-1.5 rounded-xl bg-success-green/15 text-success-green hover:bg-success-green hover:text-white transition-all cursor-pointer"
                          title="Quick Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : member.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.id, "SUSPENDED")}
                          className="p-1.5 rounded-xl bg-error-red/10 text-error-red hover:bg-error-red hover:text-white transition-all cursor-pointer"
                          title="Suspend Pass"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.id, "ACTIVE")}
                          className="p-1.5 rounded-xl bg-success-green/15 text-success-green hover:bg-success-green hover:text-white transition-all cursor-pointer"
                          title="Re-activate Pass"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 1. DEDICATED "VIEW DETAILS" DEVOTEE PROFILE & GATE PASS INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-gradient-to-r from-bg-warm to-surface-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-gold to-secondary-bronze text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedMember.firstName?.charAt(0) || "D"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-xl font-bold text-dark-surface">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-primary-gold/15 text-primary-gold font-bold text-[10px]">
                      {selectedMember.membershipType} Tier
                    </span>
                  </div>
                  <p className="text-xs text-secondary-bronze font-mono mt-0.5">
                    Member ID: {selectedMember.membershipNumber}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-2 text-secondary-bronze hover:text-dark-surface rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Digital Pass Preview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-bg-warm via-white to-primary-gold/10 border border-primary-gold/25 shadow-xs flex flex-col sm:flex-row items-center gap-6">
                <div className="p-3 bg-white rounded-2xl border border-primary-gold/20 shadow-sm shrink-0 text-center">
                  <img
                    src={selectedMember.qrCodeUrl}
                    alt="Devotee Gate Pass QR"
                    className="w-28 h-28 mx-auto"
                  />
                  <span className="text-[10px] font-mono text-secondary-bronze mt-1 block">
                    {selectedMember.membershipNumber}
                  </span>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-grow">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1.5",
                        selectedMember.status === "ACTIVE" && "bg-success-green/15 text-success-green border border-success-green/30",
                        selectedMember.status === "PENDING" && "bg-warning-amber/15 text-warning-amber border border-warning-amber/30",
                        selectedMember.status === "SUSPENDED" && "bg-error-red/15 text-error-red border border-error-red/30",
                        selectedMember.status === "EXPIRED" && "bg-secondary-bronze/15 text-secondary-bronze border border-secondary-bronze/30"
                      )}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        selectedMember.status === "ACTIVE" ? "bg-success-green" :
                        selectedMember.status === "PENDING" ? "bg-warning-amber" :
                        selectedMember.status === "SUSPENDED" ? "bg-error-red" : "bg-secondary-bronze"
                      }`} />
                      {selectedMember.status === "ACTIVE" ? "Active Digital Gate Pass" : `${selectedMember.status} Pass`}
                    </span>
                  </div>

                  <p className="text-xs text-secondary-bronze leading-relaxed font-normal">
                    This digital card authenticates the devotee at the temple gate for Daily Darshan, Special Aarti, and Puja halls.
                  </p>

                  <div className="text-xs text-secondary-bronze/80 pt-1 flex items-center justify-center sm:justify-start gap-3 font-mono">
                    <span>Joined: {selectedMember.joinedDate}</span>
                    <span>•</span>
                    <span>Valid Until: {selectedMember.validUntil}</span>
                  </div>
                </div>
              </div>

              {/* Devotee Personal & Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-bronze flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-primary-gold" />
                  <span>Contact & Residency Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-bg-warm/30 border border-primary-gold/15 text-xs">
                  <div className="flex items-center gap-2 text-secondary-bronze">
                    <Mail className="w-4 h-4 text-primary-gold shrink-0" />
                    <span className="text-dark-surface font-medium truncate">{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-bronze">
                    <Phone className="w-4 h-4 text-primary-gold shrink-0" />
                    <span className="text-dark-surface font-medium font-mono">{selectedMember.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary-bronze sm:col-span-2">
                    <MapPin className="w-4 h-4 text-primary-gold shrink-0" />
                    <span className="text-dark-surface font-medium">
                      {selectedMember.address ? `${selectedMember.address}, ` : ""}
                      {selectedMember.city || "Kampala"}, {selectedMember.country || "Uganda"}
                      {selectedMember.postalCode ? ` (${selectedMember.postalCode})` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Family Members */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-bronze flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary-gold" />
                  <span>Linked Family Members ({selectedMember.familyMembers?.length || 0})</span>
                </h4>
                {selectedMember.familyMembers && selectedMember.familyMembers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedMember.familyMembers.map((fam: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-primary-gold/20 bg-white shadow-2xs flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-semibold text-dark-surface">{fam.fullName}</p>
                          <p className="text-[11px] text-secondary-bronze/80">{fam.relationship}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-bg-warm text-secondary-bronze text-[11px] font-mono font-medium">
                          {fam.age} yrs
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-primary-gold/20 text-center text-xs text-secondary-bronze/60 bg-bg-warm/20">
                    No family members linked to this devotee account yet.
                  </div>
                )}
              </div>

              {/* Devotee Bookings & Activity Stats */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-bronze flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary-gold" />
                  <span>Devotee Activity & Service Bookings</span>
                </h4>

                {isLoadingStats ? (
                  <div className="p-4 text-center text-secondary-bronze text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary-gold inline mr-2" />
                    <span>Loading devotee booking history...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-primary-gold/15 bg-white text-center shadow-2xs">
                      <Landmark className="w-5 h-5 text-primary-gold mx-auto mb-1" />
                      <p className="text-[10px] text-secondary-bronze uppercase font-bold">Hall Bookings</p>
                      <p className="font-heading text-lg font-bold text-dark-surface mt-0.5">
                        {memberStats?.hallBookingsCount || 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-primary-gold/15 bg-white text-center shadow-2xs">
                      <Sparkles className="w-5 h-5 text-primary-gold mx-auto mb-1" />
                      <p className="text-[10px] text-secondary-bronze uppercase font-bold">Darshan Visits</p>
                      <p className="font-heading text-lg font-bold text-dark-surface mt-0.5">
                        {memberStats?.darshanBookingsCount || 0}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-primary-gold/15 bg-white text-center shadow-2xs">
                      <Flame className="w-5 h-5 text-primary-gold mx-auto mb-1" />
                      <p className="text-[10px] text-secondary-bronze uppercase font-bold">Puja Sevas</p>
                      <p className="font-heading text-lg font-bold text-dark-surface mt-0.5">
                        {memberStats?.pujaBookingsCount || 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Modifier Actions */}
              <div className="pt-4 border-t border-primary-gold/15 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-secondary-bronze">
                  Update Member Access Status
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isUpdatingStatus || selectedMember.status === "ACTIVE"}
                    onClick={() => handleStatusChange(selectedMember.id, "ACTIVE")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                      selectedMember.status === "ACTIVE"
                        ? "bg-success-green text-white"
                        : "border border-success-green/40 text-success-green hover:bg-success-green/10"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Set Active</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingStatus || selectedMember.status === "SUSPENDED"}
                    onClick={() => handleStatusChange(selectedMember.id, "SUSPENDED")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                      selectedMember.status === "SUSPENDED"
                        ? "bg-error-red text-white"
                        : "border border-error-red/40 text-error-red hover:bg-error-red/10"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Suspend Pass</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingStatus || selectedMember.status === "PENDING"}
                    onClick={() => handleStatusChange(selectedMember.id, "PENDING")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                      selectedMember.status === "PENDING"
                        ? "bg-warning-amber text-white"
                        : "border border-warning-amber/40 text-warning-amber hover:bg-warning-amber/10"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Mark Pending</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-bg-warm/60 border-t border-primary-gold/15 flex justify-between items-center text-xs text-secondary-bronze">
              <span className="text-[11px] font-mono">
                Database Record ID: {selectedMember.id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2 rounded-xl bg-white border border-secondary-bronze/20 text-secondary-bronze hover:text-dark-surface hover:bg-bg-warm text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADMIN QR CODE & BARCODE SCANNER / PASS INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-gradient-to-r from-bg-warm to-surface-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary-gold/15 text-primary-gold">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-dark-surface">
                    Devotee QR Gate Pass Scanner
                  </h3>
                  <p className="text-xs text-secondary-bronze/75">
                    Scan via optical camera, upload image, or enter membership code
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="p-2 text-secondary-bronze hover:text-dark-surface rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Interactive Optical Camera & File QR Scanner */}
              <QrCameraScanner
                isOpen={isScannerOpen}
                onScanSuccess={(decoded) => {
                  setScannedCode(decoded);
                  handleVerifyPass(decoded);
                }}
                onClose={() => setIsScannerOpen(false)}
              />

              {/* Direct Code / USB Barcode Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyPass();
                }}
                className="space-y-2 pt-2 border-t border-primary-gold/15"
              >
                <label className="text-xs font-semibold text-secondary-bronze flex items-center justify-between">
                  <span>Manual ID or Hardware Barcode Gun</span>
                  <span className="text-[10px] text-primary-gold font-normal">e.g. MEM-2026-1001</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="Type membership ID or scan barcode..."
                    className="flex-grow px-4 py-2.5 rounded-xl border border-primary-gold/30 focus:border-primary-gold text-xs font-mono bg-bg-warm/30 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="px-5 py-2.5 rounded-xl bg-primary-gold text-white text-xs font-semibold hover:brightness-105 transition-all shadow cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Verify</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Verification Error */}
              {scanError && (
                <div className="p-4 rounded-2xl bg-error-red/10 border border-error-red/25 text-error-red flex items-start gap-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Devotee Record Not Found</p>
                    <p className="text-[11px] opacity-90 mt-0.5">{scanError}</p>
                  </div>
                </div>
              )}

              {/* Scanned Devotee Result Card */}
              {scanResult && (
                <div className="rounded-2xl border border-primary-gold/30 p-5 bg-gradient-to-br from-bg-warm/40 via-surface-white to-primary-gold/5 space-y-4 shadow-sm">
                  {/* Validity Status Header */}
                  <div className="flex items-center justify-between border-b border-primary-gold/15 pb-3">
                    <div className="flex items-center gap-2">
                      {scanResult.isValid ? (
                        <div className="flex items-center gap-1.5 text-success-green font-bold text-xs bg-success-green/10 border border-success-green/30 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>VALID ACTIVE PASS</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-error-red font-bold text-xs bg-error-red/10 border border-error-red/30 px-3 py-1 rounded-full">
                          <AlertCircle className="w-4 h-4" />
                          <span>PASS INACTIVE / {scanResult.status}</span>
                        </div>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-dark-surface bg-white px-2.5 py-1 rounded-lg border border-primary-gold/20 shadow-2xs">
                      {scanResult.membershipNumber}
                    </span>
                  </div>

                  {/* Devotee Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-gold to-secondary-bronze text-white flex items-center justify-center font-bold text-base shadow">
                      {scanResult.fullName?.charAt(0) || "D"}
                    </div>
                    <div>
                      <h4 className="font-heading text-lg font-bold text-dark-surface">
                        {scanResult.fullName}
                      </h4>
                      <p className="text-xs text-secondary-bronze flex items-center gap-2">
                        <span className="font-semibold text-primary-gold">{scanResult.membershipType} Tier</span>
                        <span>•</span>
                        <span>Valid Until: {scanResult.validUntil ? new Date(scanResult.validUntil).toLocaleDateString() : "2099-12-31"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact & Location Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-primary-gold/10">
                    <div className="flex items-center gap-1.5 text-secondary-bronze">
                      <Phone className="w-3.5 h-3.5 text-primary-gold" />
                      <span className="truncate font-mono">{scanResult.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-secondary-bronze">
                      <Mail className="w-3.5 h-3.5 text-primary-gold" />
                      <span className="truncate">{scanResult.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-secondary-bronze col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-primary-gold shrink-0" />
                      <span className="truncate">
                        {scanResult.address ? `${scanResult.address}, ` : ""}{scanResult.city || "Kampala"}, {scanResult.country || "Uganda"}
                      </span>
                    </div>
                  </div>

                  {/* Family Linkages Preview */}
                  {scanResult.familyMembers && scanResult.familyMembers.length > 0 && (
                    <div className="pt-2 border-t border-primary-gold/10 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary-gold" />
                        <span>Linked Family Members ({scanResult.familyMembers.length})</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.familyMembers.map((f: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-[11px] bg-white border border-primary-gold/20 rounded-lg text-dark-surface font-medium shadow-2xs"
                          >
                            {f.fullName} ({f.relationship}, {f.age}y)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Direct Actions on Scanned Pass */}
                  <div className="pt-3 border-t border-primary-gold/15 flex gap-2">
                    {scanResult.status !== "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => {
                          const m = membersList.find((x) => x.membershipNumber === scanResult.membershipNumber);
                          if (m) handleStatusChange(m.id, "ACTIVE");
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-success-green text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Activate Pass</span>
                      </button>
                    )}
                    {scanResult.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => {
                          const m = membersList.find((x) => x.membershipNumber === scanResult.membershipNumber);
                          if (m) handleStatusChange(m.id, "SUSPENDED");
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-error-red/35 text-error-red hover:bg-error-red/5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Suspend Pass</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const m = membersList.find((x) => x.membershipNumber === scanResult.membershipNumber);
                        if (m) {
                          handleOpenDetails(m);
                          setIsScannerOpen(false);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl border border-primary-gold/30 bg-white text-secondary-bronze hover:text-dark-surface hover:bg-bg-warm text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-primary-gold" />
                      <span>View Full Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-bg-warm/50 border-t border-primary-gold/10 flex justify-between items-center text-xs text-secondary-bronze">
              <span className="text-[11px]">
                💡 Tip: Hardware optical scanners will automatically verify on scan.
              </span>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-secondary-bronze/20 text-secondary-bronze hover:bg-secondary-bronze/10 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
