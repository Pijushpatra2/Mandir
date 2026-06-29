"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, ChevronDown, Check, X, Eye, FileSpreadsheet, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MembershipsDashboardPage() {
  const { userRole, members, setMembers } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

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
    // Update selected member view as well
    if (selectedMember && selectedMember.id === id) {
      setSelectedMember((prev: any) => ({ ...prev, status: "ACTIVE" }));
    }
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
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Membership Management
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Audit and approve devotee membership applications, view digital cards, and manage family profiles.
          </p>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-primary-gold/10">
        
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or email..."
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
                <tr className="hover:bg-bg-warm/50 transition-colors" key={member.id}>
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
              </div>

              {/* Family profile sub-table */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze">
                  Linked Family Profiles
                </h5>
                {selectedMember.familyMembers.length > 0 ? (
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

            </GlassCard>
          ) : (
            <GlassCard hoverEffect={false} className="p-8 border-primary-gold/15 bg-white text-center py-20">
              <Eye className="w-10 h-10 text-primary-gold/45 mx-auto mb-4" />
              <h4 className="font-heading text-lg font-medium text-dark-surface">
                No Member Selected
              </h4>
              <p className="text-[11px] text-secondary-bronze/65 leading-relaxed font-sans max-w-[200px] mx-auto mt-2">
                Click the eye icon in the table directory to view detailed profile and approve applications.
              </p>
            </GlassCard>
          )}
        </div>

      </div>

    </div>
  );
}
