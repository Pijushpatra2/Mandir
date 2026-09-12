"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Search,
  ChevronDown,
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
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { devoteeApiClient } from "@/lib/apiClient";

export default function MembershipsDashboardPage() {
  const { userRole, members, setMembers, verifyMemberPass, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // QR Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Fetch real-time registered devotees from DB on mount
  useEffect(() => {
    const fetchDevotees = async () => {
      try {
        const res = await devoteeApiClient.get("/devotees/admin/all");
        if (res.data?.data && Array.isArray(res.data.data)) {
          const fetchedDevotees = res.data.data.map((d: any) => {
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
              membershipType: d.membership_type,
              status: d.status,
              joinedDate: d.joined_date ? new Date(d.joined_date).toISOString().split("T")[0] : "2026-01-01",
              validUntil: d.valid_until ? new Date(d.valid_until).toISOString().split("T")[0] : "2099-12-31",
              qrCodeUrl: d.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(d.membership_number)}`,
              familyMembers: parsedFamily,
              address: d.address || "",
              city: d.city || "Kampala",
              country: d.country || "Uganda",
            };
          });

          // Merge with existing members state avoiding duplicates
          setMembers((prev) => {
            const existingIds = new Set(prev.map((m) => m.membershipNumber));
            const newOnes = fetchedDevotees.filter((fd: any) => !existingIds.has(fd.membershipNumber));
            return [...prev, ...newOnes];
          });
        }
      } catch (err) {
        // Fallback silently to mock members in case server is starting
      }
    };

    fetchDevotees();
  }, [setMembers]);

  // Filter list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.membershipNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" ? true : m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Approve member status handler
  const handleApproveMember = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, status: "ACTIVE" };
        }
        return m;
      })
    );
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember((prev: any) => ({ ...prev, status: "ACTIVE" }));
    }
    if (scanResult && scanResult.id === id) {
      setScanResult((prev: any) => ({ ...prev, status: "ACTIVE", isValid: true }));
    }
    showToast("Member status marked as ACTIVE", "success");
  };

  // Reject/Suspend member status handler
  const handleSuspendMember = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, status: "SUSPENDED" };
        }
        return m;
      })
    );
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember((prev: any) => ({ ...prev, status: "SUSPENDED" }));
    }
    if (scanResult && scanResult.id === id) {
      setScanResult((prev: any) => ({ ...prev, status: "SUSPENDED", isValid: false }));
    }
    showToast("Member status updated to SUSPENDED", "info");
  };

  // Scan & Verify Member Pass
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

      // Extract membership number if full URL was scanned
      let parsedNumber = code;
      if (code.includes("data=")) {
        const urlParams = new URLSearchParams(code.split("?")[1]);
        parsedNumber = urlParams.get("data") || code;
      }

      // Try server verify endpoint first
      try {
        const result = await verifyMemberPass(parsedNumber);
        setScanResult(result);
        return;
      } catch (err: any) {
        // Check in local members state if API endpoint failed
        const localMatch = members.find(
          (m) => m.membershipNumber.toLowerCase() === parsedNumber.toLowerCase()
        );
        if (localMatch) {
          setScanResult({
            isValid: localMatch.status === "ACTIVE",
            membershipNumber: localMatch.membershipNumber,
            fullName: `${localMatch.firstName} ${localMatch.lastName}`,
            status: localMatch.status,
            membershipType: localMatch.membershipType,
            joinedDate: localMatch.joinedDate,
            validUntil: localMatch.validUntil,
            phone: localMatch.phone,
            email: localMatch.email,
            address: (localMatch as any).address || "",
            city: (localMatch as any).city || "Kampala",
            country: (localMatch as any).country || "Uganda",
            familyMembers: localMatch.familyMembers || [],
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

  return (
    <div className="space-y-8 font-jakarta">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Membership Management
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Audit devotee membership applications, scan QR digital passes, and inspect family profiles.
          </p>
        </div>

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
          <span>Scan Member QR Pass</span>
        </button>
      </div>

      {/* Control Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-primary-gold/10 shadow-xs">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, membership ID, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-secondary-bronze font-sans shrink-0">
            Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending Approval</option>
            <option value="EXPIRED">Expired</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Directory List & Side details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Directory List Table */}
        <div className="lg:col-span-8 overflow-x-auto bg-white rounded-3xl border border-primary-gold/15 shadow-sm">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Member ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-gold/10">
              {filteredMembers.map((member) => (
                <tr className="hover:bg-bg-warm/50 transition-colors" key={member.id || member.membershipNumber}>
                  <td className="px-6 py-4 font-mono font-semibold text-dark-surface">
                    {member.membershipNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-dark-surface">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-[10px] text-secondary-bronze/65">{member.email}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-secondary-bronze">
                    {member.membershipType}
                  </td>
                  <td className="px-6 py-4 text-secondary-bronze/70">{member.joinedDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[9px] font-bold rounded uppercase",
                        member.status === "ACTIVE" && "bg-success-green/10 text-success-green",
                        member.status === "PENDING" && "bg-warning-amber/10 text-warning-amber",
                        member.status === "EXPIRED" && "bg-secondary-bronze/10 text-secondary-bronze",
                        member.status === "SUSPENDED" && "bg-error-red/10 text-error-red"
                      )}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="p-1.5 rounded-lg border border-primary-gold/20 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold cursor-pointer"
                      title="Inspect Member"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary-bronze/50 font-light">
                    No membership records found matching query criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Side Detail Card Panel */}
        <div className="lg:col-span-4">
          {selectedMember ? (
            <GlassCard className="p-8 border-primary-gold/25 shadow-md space-y-6 relative overflow-hidden bg-white/95">
              {/* Close panel cross */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-1.5 text-secondary-bronze hover:text-dark-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-primary-gold">
                  Member Details
                </span>
                <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1 leading-none">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h3>
                <p className="text-[10px] text-secondary-bronze/70 font-mono mt-1">
                  ID: {selectedMember.membershipNumber}
                </p>
              </div>

              {/* QR Code preview */}
              <div className="flex justify-center border-y border-primary-gold/10 py-5">
                <div className="p-2 border border-primary-gold/15 bg-white rounded-2xl shadow-inner">
                  <img src={selectedMember.qrCodeUrl} alt="Member QR code" className="w-24 h-24" />
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-3.5 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-secondary-bronze/65">Level:</span>
                  <span className="font-semibold text-dark-surface">{selectedMember.membershipType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-bronze/65">Valid Until:</span>
                  <span className="font-semibold text-dark-surface">{selectedMember.validUntil}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-bronze/65">Phone:</span>
                  <span className="font-semibold text-dark-surface">{selectedMember.phone}</span>
                </div>
                {selectedMember.email && (
                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/65">Email:</span>
                    <span className="font-semibold text-dark-surface">{selectedMember.email}</span>
                  </div>
                )}
                {selectedMember.address && (
                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/65">Location:</span>
                    <span className="font-semibold text-dark-surface">
                      {selectedMember.city || "Kampala"}, {selectedMember.country || "Uganda"}
                    </span>
                  </div>
                )}
              </div>

              {/* Family profile sub-table */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze">
                  Linked Family Profiles
                </h5>
                {selectedMember.familyMembers && selectedMember.familyMembers.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMember.familyMembers.map((fam: any, idx: number) => (
                      <div className="flex justify-between items-center p-2.5 border border-primary-gold/10 bg-bg-warm/50 rounded-xl text-[11px]" key={idx}>
                        <span className="font-semibold text-dark-surface">{fam.fullName}</span>
                        <span className="text-secondary-bronze/75 font-sans">
                          {fam.relationship} ({fam.age} yrs)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-secondary-bronze/55 font-light font-sans italic py-2 text-center">
                    No family profiles linked.
                  </p>
                )}
              </div>

              {/* Actions panel */}
              {selectedMember.status === "PENDING" && (
                <div className="pt-4 border-t border-primary-gold/10 flex gap-2">
                  <button
                    onClick={() => handleSuspendMember(selectedMember.id)}
                    className="w-1/3 py-2.5 rounded-xl border border-error-red/35 hover:bg-error-red/5 text-error-red text-xs font-semibold transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveMember(selectedMember.id)}
                    className="flex-grow py-2.5 rounded-xl bg-success-green text-white text-xs font-semibold shadow hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Member</span>
                  </button>
                </div>
              )}

              {selectedMember.status === "ACTIVE" && (
                <div className="pt-4 border-t border-primary-gold/10">
                  <button
                    onClick={() => handleSuspendMember(selectedMember.id)}
                    className="w-full py-2.5 rounded-xl border border-error-red/35 hover:bg-error-red/5 text-error-red text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Suspend Membership</span>
                  </button>
                </div>
              )}

              {selectedMember.status === "SUSPENDED" && (
                <div className="pt-4 border-t border-primary-gold/10">
                  <button
                    onClick={() => handleApproveMember(selectedMember.id)}
                    className="w-full py-2.5 rounded-xl bg-success-green text-white text-xs font-semibold shadow hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Re-activate Membership</span>
                  </button>
                </div>
              )}
            </GlassCard>
          ) : (
            <GlassCard hoverEffect={false} className="p-8 border-primary-gold/15 bg-white text-center py-20">
              <Eye className="w-10 h-10 text-primary-gold/45 mx-auto mb-4" />
              <h4 className="font-heading text-lg font-medium text-dark-surface">
                No Member Selected
              </h4>
              <p className="text-[11px] text-secondary-bronze/65 leading-relaxed font-sans max-w-[200px] mx-auto mt-2">
                Click the eye icon in the table directory to view detailed profile or scan a member's QR pass above.
              </p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Admin QR Code Scanner / Pass Inspector Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-gradient-to-r from-bg-warm to-surface-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-gold/15 text-primary-gold">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-medium text-dark-surface">
                    Scan Devotee QR Pass
                  </h3>
                  <p className="text-xs text-secondary-bronze/75 font-sans">
                    Verify membership validity and inspect devotee profile
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Search / Scan Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyPass();
                }}
                className="space-y-3"
              >
                <label className="text-xs font-semibold text-secondary-bronze flex items-center justify-between">
                  <span>Membership Number / QR Barcode</span>
                  <span className="text-[10px] text-primary-gold font-normal">e.g. MEM-2026-1001</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      autoFocus
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                      placeholder="Scan QR barcode or enter ID..."
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-gold/30 focus:border-primary-gold text-xs font-mono bg-bg-warm/30 focus:bg-white focus:outline-none"
                    />
                  </div>
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

              {/* Error Message */}
              {scanError && (
                <div className="p-4 rounded-2xl bg-error-red/10 border border-error-red/20 text-error-red flex items-start gap-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Verification Failed</p>
                    <p className="text-[11px] opacity-90 mt-0.5">{scanError}</p>
                  </div>
                </div>
              )}

              {/* Scan Result Inspection Card */}
              {scanResult && (
                <div className="rounded-2xl border border-primary-gold/25 p-5 bg-gradient-to-br from-bg-warm/40 via-surface-white to-primary-gold/5 space-y-4">
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
                      <h4 className="font-heading text-lg font-medium text-dark-surface">
                        {scanResult.fullName}
                      </h4>
                      <p className="text-xs text-secondary-bronze flex items-center gap-2 font-sans">
                        <span className="font-semibold">{scanResult.membershipType} Tier</span>
                        <span>•</span>
                        <span>Valid Until: {scanResult.validUntil ? new Date(scanResult.validUntil).toLocaleDateString() : "2099-12-31"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact & Location Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-primary-gold/10 font-sans">
                    <div className="flex items-center gap-1.5 text-secondary-bronze">
                      <Phone className="w-3.5 h-3.5 text-primary-gold" />
                      <span className="truncate">{scanResult.phone}</span>
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
                        <Users className="w-3 h-3" />
                        <span>Linked Family ({scanResult.familyMembers.length})</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.familyMembers.map((f: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] bg-white border border-primary-gold/20 rounded-md text-dark-surface font-medium"
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
                          const m = members.find((x) => x.membershipNumber === scanResult.membershipNumber);
                          if (m) handleApproveMember(m.id);
                        }}
                        className="flex-1 py-2 rounded-xl bg-success-green text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Activate Pass</span>
                      </button>
                    )}
                    {scanResult.status === "ACTIVE" && (
                      <button
                        type="button"
                        onClick={() => {
                          const m = members.find((x) => x.membershipNumber === scanResult.membershipNumber);
                          if (m) handleSuspendMember(m.id);
                        }}
                        className="flex-1 py-2 rounded-xl border border-error-red/35 text-error-red hover:bg-error-red/5 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Suspend Pass</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const m = members.find((x) => x.membershipNumber === scanResult.membershipNumber);
                        if (m) {
                          setSelectedMember(m);
                          setIsScannerOpen(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl border border-primary-gold/30 text-secondary-bronze hover:bg-primary-gold/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-bg-warm/50 border-t border-primary-gold/10 flex justify-between items-center text-xs text-secondary-bronze">
              <span className="text-[11px] font-sans">
                💡 Tip: Hardware barcode scanners will auto-fill and submit.
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
