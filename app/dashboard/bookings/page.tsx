"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Search,
  Calendar,
  Check,
  X,
  Eye,
  Sparkles,
  Building2,
  CalendarCheck,
  Flame,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  MapPin,
  FileText,
  Upload,
  AlertTriangle,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchHalls,
  createHall,
  updateHall,
  deleteHall,
  fetchAllHallBookings,
  updateHallBookingStatus,
  fetchDarshanSlots,
  createDarshanSlot,
  updateDarshanSlot,
  deleteDarshanSlot,
  fetchAllDarshanBookings,
  updateDarshanBookingStatus,
  fetchPujas,
  createPuja,
  updatePuja,
  deletePuja,
  fetchAllPujaBookings,
  updatePujaBookingStatus,
  TempleHallItem,
  TempleHallBookingItem,
  TempleDarshanSlotItem,
  TempleDarshanBookingItem,
  TemplePujaItem,
  TemplePujaBookingItem
} from "@/lib/bookingApi";
import { useApp } from "@/lib/context";

// Reusable Image Upload Dropzone Component (No native alerts)
function ImageUploadField({
  label,
  value,
  onChange,
  onRemove,
  onError,
}: {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  onRemove: () => void;
  onError?: (msg: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      if (onError) onError("Please upload a valid image file (JPG, PNG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 font-sans">
      <label className="font-semibold text-secondary-bronze text-xs flex items-center justify-between">
        <span>{label}</span>
        {value && (
          <span className="text-[10px] text-success-green font-normal">
            ✓ Image Attached
          </span>
        )}
      </label>

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-primary-gold/30 group bg-bg-warm/40 aspect-video max-h-48 flex items-center justify-center shadow-xs">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-dark-surface rounded-xl text-xs font-semibold shadow hover:bg-primary-gold hover:text-white transition-colors cursor-pointer"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="px-3 py-1.5 bg-error-red text-white rounded-xl text-xs font-semibold shadow hover:brightness-110 transition-all cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer bg-bg-warm/20 hover:bg-bg-warm/50 flex flex-col items-center justify-center space-y-2",
            dragOver ? "border-primary-gold bg-primary-gold/10" : "border-primary-gold/25"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-surface">
              Click to upload or drag & drop photo
            </p>
            <p className="text-[10px] text-secondary-bronze/70">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

export default function BookingsDashboardPage() {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<"hall" | "darshan" | "puja">("hall");
  const [searchQuery, setSearchQuery] = useState("");
  const [subView, setSubView] = useState<"bookings" | "master">("bookings");
  const [loading, setLoading] = useState(true);

  // Data states
  const [halls, setHalls] = useState<TempleHallItem[]>([]);
  const [hallBookings, setHallBookings] = useState<TempleHallBookingItem[]>([]);
  const [darshanSlots, setDarshanSlots] = useState<TempleDarshanSlotItem[]>([]);
  const [darshanBookings, setDarshanBookings] = useState<TempleDarshanBookingItem[]>([]);
  const [pujas, setPujas] = useState<TemplePujaItem[]>([]);
  const [pujaBookings, setPujaBookings] = useState<TemplePujaBookingItem[]>([]);

  // Selected for details side drawer
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Custom in-website Delete Confirmation Modal State (No native browser alerts)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "hall" | "slot" | "puja";
    id: string;
    name: string;
    isDeleting?: boolean;
  } | null>(null);

  // Hall Master Form State
  const [hallModalOpen, setHallModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<TempleHallItem | null>(null);
  const [hallForm, setHallForm] = useState({
    name: "",
    description: "",
    capacity: 600,
    max_people_at_a_time: 600,
    space_sqft: 6000,
    price_per_day: 1500000,
    price_per_half_day: 900000,
    image_url: "",
    amenities: ["Central AC", "Pure Veg Kitchen", "Audio Acoustic", "Fire Permit", "Secure Parking"] as string[],
  });
  const [newAmenityInput, setNewAmenityInput] = useState("");

  // Darshan Slot Master Form State
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TempleDarshanSlotItem | null>(null);
  const [slotForm, setSlotForm] = useState({
    slot_name: "",
    start_time: "06:00 AM",
    end_time: "07:30 AM",
    max_visitors_limit: 150,
    time_zone: "EAT (Africa/Kampala)",
    badge: "Morning Aarti",
    description: "",
  });

  // Puja Master Form State
  const [pujaModalOpen, setPujaModalOpen] = useState(false);
  const [editingPuja, setEditingPuja] = useState<TemplePujaItem | null>(null);
  const [pujaForm, setPujaForm] = useState({
    name: "",
    category: "Special" as "Special" | "Abhishek" | "Daily" | "Homa" | "General",
    description: "",
    base_price: 75000,
    samagri_price: 20000,
    duration_minutes: 90,
    priest_role: "Resident Mandir Shastri",
    image_url: "",
  });

  // Fetch all records
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [h, hb, ds, db, p, pb] = await Promise.all([
        fetchHalls(true).catch(() => []),
        fetchAllHallBookings().catch(() => []),
        fetchDarshanSlots(true).catch(() => []),
        fetchAllDarshanBookings().catch(() => []),
        fetchPujas(true).catch(() => []),
        fetchAllPujaBookings().catch(() => []),
      ]);
      setHalls(h);
      setHallBookings(hb);
      setDarshanSlots(ds);
      setDarshanBookings(db);
      setPujas(p);
      setPujaBookings(pb);
    } catch (err) {
      console.error("Error loading admin booking data:", err);
      showToast("Error loading booking records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered lists
  const filteredHallBookings = hallBookings.filter((hb) => {
    const q = searchQuery.toLowerCase();
    return (
      hb.devotee_name.toLowerCase().includes(q) ||
      hb.event_title.toLowerCase().includes(q) ||
      hb.hall_name.toLowerCase().includes(q) ||
      hb.id.toLowerCase().includes(q)
    );
  });

  const filteredDarshanBookings = darshanBookings.filter((db) => {
    const q = searchQuery.toLowerCase();
    return (
      db.devotee_name.toLowerCase().includes(q) ||
      db.slot_name.toLowerCase().includes(q) ||
      db.id.toLowerCase().includes(q) ||
      db.devotee_phone.toLowerCase().includes(q)
    );
  });

  const filteredPujaBookings = pujaBookings.filter((pb) => {
    const q = searchQuery.toLowerCase();
    return (
      pb.devotee_name.toLowerCase().includes(q) ||
      pb.puja_name.toLowerCase().includes(q) ||
      (pb.receipt_number && pb.receipt_number.toLowerCase().includes(q)) ||
      pb.id.toLowerCase().includes(q)
    );
  });

  // Action Handlers
  const handleUpdateHallStatus = async (id: string, status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED") => {
    try {
      const updated = await updateHallBookingStatus(id, status, status === "CONFIRMED" ? "PAID" : undefined);
      setHallBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(updated);
      }
      showToast(`Hall booking marked as ${status}`, "success");
    } catch (err: any) {
      showToast("Failed to update hall booking", "error");
    }
  };

  const handleUpdateDarshanStatus = async (id: string, status: "CONFIRMED" | "CHECKED_IN" | "CANCELLED") => {
    try {
      const updated = await updateDarshanBookingStatus(id, status);
      setDarshanBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(updated);
      }
      showToast(`Darshan pass marked as ${status}`, "success");
    } catch (err: any) {
      showToast("Failed to update darshan pass", "error");
    }
  };

  const handleUpdatePujaStatus = async (id: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    try {
      const updated = await updatePujaBookingStatus(id, status);
      setPujaBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(updated);
      }
      showToast(`Puja booking marked as ${status}`, "success");
    } catch (err: any) {
      showToast("Failed to update puja booking", "error");
    }
  };

  // Amenities Helpers
  const handleAddAmenity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newAmenityInput.trim();
    if (!trimmed) return;
    if (hallForm.amenities.includes(trimmed)) {
      showToast("Amenity already added", "error");
      return;
    }
    setHallForm({
      ...hallForm,
      amenities: [...hallForm.amenities, trimmed],
    });
    setNewAmenityInput("");
  };

  const handleRemoveAmenity = (indexToRemove: number) => {
    setHallForm({
      ...hallForm,
      amenities: hallForm.amenities.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleAddPresetAmenity = (preset: string) => {
    if (hallForm.amenities.includes(preset)) return;
    setHallForm({
      ...hallForm,
      amenities: [...hallForm.amenities, preset],
    });
  };

  // Hall Master Form Submission
  const handleSaveHall = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: hallForm.name,
        description: hallForm.description,
        capacity: Number(hallForm.capacity),
        max_people_at_a_time: Number(hallForm.max_people_at_a_time),
        space_sqft: Number(hallForm.space_sqft),
        price_per_day: Number(hallForm.price_per_day),
        price_per_half_day: Number(hallForm.price_per_half_day),
        image_url: hallForm.image_url || undefined,
        amenities: hallForm.amenities,
      };

      if (editingHall) {
        const res = await updateHall(editingHall.id, payload);
        setHalls((prev) => prev.map((h) => (h.id === editingHall.id ? res : h)));
        showToast("Hall updated successfully", "success");
      } else {
        const res = await createHall(payload);
        setHalls((prev) => [res, ...prev]);
        showToast("New Hall added successfully", "success");
      }
      setHallModalOpen(false);
      setEditingHall(null);
    } catch (err: any) {
      showToast("Failed to save hall", "error");
    }
  };

  // Darshan Slot Master Form Submission
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        slot_name: slotForm.slot_name,
        start_time: slotForm.start_time,
        end_time: slotForm.end_time,
        max_visitors_limit: Number(slotForm.max_visitors_limit),
        time_zone: slotForm.time_zone,
        badge: slotForm.badge,
        description: slotForm.description,
      };

      if (editingSlot) {
        const res = await updateDarshanSlot(editingSlot.id, payload);
        setDarshanSlots((prev) => prev.map((s) => (s.id === editingSlot.id ? res : s)));
        showToast("Darshan slot updated successfully", "success");
      } else {
        const res = await createDarshanSlot(payload);
        setDarshanSlots((prev) => [...prev, res]);
        showToast("New Darshan slot created", "success");
      }
      setSlotModalOpen(false);
      setEditingSlot(null);
    } catch (err: any) {
      showToast("Failed to save darshan slot", "error");
    }
  };

  // Puja Master Form Submission
  const handleSavePuja = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: pujaForm.name,
        category: pujaForm.category,
        description: pujaForm.description,
        base_price: Number(pujaForm.base_price),
        samagri_price: Number(pujaForm.samagri_price),
        duration_minutes: Number(pujaForm.duration_minutes),
        priest_role: pujaForm.priest_role,
        image_url: pujaForm.image_url || undefined,
      };

      if (editingPuja) {
        const res = await updatePuja(editingPuja.id, payload);
        setPujas((prev) => prev.map((p) => (p.id === editingPuja.id ? res : p)));
        showToast("Puja ceremony updated", "success");
      } else {
        const res = await createPuja(payload);
        setPujas((prev) => [...prev, res]);
        showToast("New Puja ceremony created", "success");
      }
      setPujaModalOpen(false);
      setEditingPuja(null);
    } catch (err: any) {
      showToast("Failed to save puja", "error");
    }
  };

  // Execute in-website confirmed delete
  const executeConfirmedDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id, name } = deleteConfirm;
    setDeleteConfirm((prev) => (prev ? { ...prev, isDeleting: true } : null));

    try {
      if (type === "hall") {
        await deleteHall(id);
        setHalls((prev) => prev.filter((h) => h.id !== id));
        showToast(`Hall venue "${name}" removed successfully`, "success");
      } else if (type === "slot") {
        await deleteDarshanSlot(id);
        setDarshanSlots((prev) => prev.filter((s) => s.id !== id));
        showToast(`Darshan slot "${name}" removed successfully`, "success");
      } else if (type === "puja") {
        await deletePuja(id);
        setPujas((prev) => prev.filter((p) => p.id !== id));
        showToast(`Puja ceremony "${name}" removed successfully`, "success");
      }
    } catch (err: any) {
      showToast(`Failed to remove ${type}`, "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Helper to parse amenities array
  const getAmenitiesList = (raw: any): string[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const p = JSON.parse(raw);
        if (Array.isArray(p)) return p;
      } catch (_) {}
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return ["Central AC", "Pure Veg Kitchen", "Audio Acoustics"];
  };

  return (
    <div className="space-y-8 font-poppins pb-16">
      {/* 1. Header & Summary KPIs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Temple Booking & Space Management
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Admin console to configure Venues, capacities, Darshan timetables & timezones, and Vedic Puja offerings.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAllData}
          className="px-4 py-2 bg-white border border-primary-gold/25 rounded-xl text-xs font-semibold text-secondary-bronze hover:bg-primary-gold/10 flex items-center gap-1.5 self-start md:self-auto cursor-pointer shadow-xs"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5 border-primary-gold/20 bg-white shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze/60">
                Hall Bookings
              </p>
              <h3 className="font-heading text-2xl font-semibold text-dark-surface mt-1">
                {hallBookings.length}
              </h3>
              <p className="text-[11px] text-secondary-bronze/80 mt-0.5">
                {halls.length} Configured Venues
              </p>
            </div>
            <div className="p-3 bg-primary-gold/15 text-primary-gold rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-primary-gold/20 bg-white shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze/60">
                Darshan Passes
              </p>
              <h3 className="font-heading text-2xl font-semibold text-dark-surface mt-1">
                {darshanBookings.length}
              </h3>
              <p className="text-[11px] text-secondary-bronze/80 mt-0.5">
                {darshanSlots.length} Active Time Slots
              </p>
            </div>
            <div className="p-3 bg-primary-gold/15 text-primary-gold rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 border-primary-gold/20 bg-white shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-bronze/60">
                Puja Seva Bookings
              </p>
              <h3 className="font-heading text-2xl font-semibold text-dark-surface mt-1">
                {pujaBookings.length}
              </h3>
              <p className="text-[11px] text-secondary-bronze/80 mt-0.5">
                {pujas.length} Ceremonies Catalog
              </p>
            </div>
            <div className="p-3 bg-primary-gold/15 text-primary-gold rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-primary-gold/15 pb-2">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("hall");
              setSelectedBooking(null);
            }}
            className={cn(
              "pb-2 text-sm font-semibold tracking-wide transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 whitespace-nowrap",
              activeTab === "hall"
                ? "border-primary-gold text-primary-gold font-bold"
                : "border-transparent text-secondary-bronze/70 hover:text-secondary-bronze"
            )}
          >
            <Building2 className="w-4 h-4" />
            <span>01. Hall Management ({hallBookings.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("darshan");
              setSelectedBooking(null);
            }}
            className={cn(
              "pb-2 text-sm font-semibold tracking-wide transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 whitespace-nowrap",
              activeTab === "darshan"
                ? "border-primary-gold text-primary-gold font-bold"
                : "border-transparent text-secondary-bronze/70 hover:text-secondary-bronze"
            )}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>02. Darshan Timetable ({darshanBookings.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("puja");
              setSelectedBooking(null);
            }}
            className={cn(
              "pb-2 text-sm font-semibold tracking-wide transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 whitespace-nowrap",
              activeTab === "puja"
                ? "border-primary-gold text-primary-gold font-bold"
                : "border-transparent text-secondary-bronze/70 hover:text-secondary-bronze"
            )}
          >
            <Flame className="w-4 h-4" />
            <span>03. Vedic Puja Sevas ({pujaBookings.length})</span>
          </button>
        </div>

        {/* Sub-view Switcher (Bookings Audit vs Master Configuration) */}
        <div className="flex bg-bg-warm p-1 rounded-xl border border-primary-gold/20 text-xs self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setSubView("bookings")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
              subView === "bookings" ? "bg-white text-dark-surface shadow-xs" : "text-secondary-bronze"
            )}
          >
            Devotee Bookings
          </button>
          <button
            type="button"
            onClick={() => setSubView("master")}
            className={cn(
              "px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer",
              subView === "master" ? "bg-white text-dark-surface shadow-xs" : "text-secondary-bronze"
            )}
          >
            Master Catalog & Venues
          </button>
        </div>
      </div>

      {/* Control Search Bar & Master Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-primary-gold/15 shadow-xs">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === "hall"
                ? "Search hall bookings by devotee, venue, date..."
                : activeTab === "darshan"
                ? "Search darshan passes by name, phone, slot..."
                : "Search puja bookings by devotee, receipt, seva..."
            }
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-bg-warm/30 focus:bg-white focus:outline-none"
          />
        </div>

        {subView === "master" && (
          <div>
            {activeTab === "hall" && (
              <button
                type="button"
                onClick={() => {
                  setEditingHall(null);
                  setHallForm({
                    name: "",
                    description: "",
                    capacity: 600,
                    max_people_at_a_time: 600,
                    space_sqft: 6000,
                    price_per_day: 1500000,
                    price_per_half_day: 900000,
                    image_url: "",
                    amenities: ["Central AC", "Pure Veg Kitchen", "Audio Acoustic", "Fire Permit", "Secure Parking"],
                  });
                  setNewAmenityInput("");
                  setHallModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Hall</span>
              </button>
            )}

            {activeTab === "darshan" && (
              <button
                type="button"
                onClick={() => {
                  setEditingSlot(null);
                  setSlotForm({
                    slot_name: "",
                    start_time: "06:00 AM",
                    end_time: "07:30 AM",
                    max_visitors_limit: 150,
                    time_zone: "EAT (Africa/Kampala)",
                    badge: "Morning Aarti",
                    description: "",
                  });
                  setSlotModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Darshan Slot</span>
              </button>
            )}

            {activeTab === "puja" && (
              <button
                type="button"
                onClick={() => {
                  setEditingPuja(null);
                  setPujaForm({
                    name: "",
                    category: "Special",
                    description: "",
                    base_price: 75000,
                    samagri_price: 20000,
                    duration_minutes: 90,
                    priest_role: "Resident Mandir Shastri",
                    image_url: "",
                  });
                  setPujaModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Puja Offering</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* VIEW 1: DEVOTEE BOOKINGS AUDIT */}
      {subView === "bookings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 overflow-x-auto bg-white rounded-3xl border border-primary-gold/15 shadow-sm">
            {activeTab === "hall" && (
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-4">ID & Venue</th>
                    <th className="px-5 py-4">Devotee Host</th>
                    <th className="px-5 py-4">Event Date & Time</th>
                    <th className="px-5 py-4">Total Quote</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-gold/10">
                  {filteredHallBookings.map((hb) => (
                    <tr className="hover:bg-bg-warm/50 transition-colors" key={hb.id}>
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-dark-surface">{hb.id}</p>
                        <p className="text-[11px] font-semibold text-primary-gold">{hb.event_title}</p>
                        <p className="text-[10px] text-secondary-bronze/65">{hb.hall_name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-dark-surface">{hb.devotee_name}</p>
                        <p className="text-[10px] text-secondary-bronze/65">{hb.devotee_phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-dark-surface">{hb.booking_date}</p>
                        <p className="text-[10px] text-secondary-bronze/65">
                          {hb.start_time} - {hb.end_time} ({hb.duration_days} Day)
                        </p>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-primary-gold">
                        {formatCurrency(Number(hb.total_price))}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 text-[9px] font-bold rounded uppercase",
                            hb.status === "CONFIRMED" && "bg-success-green/10 text-success-green",
                            hb.status === "PENDING" && "bg-warning-amber/10 text-warning-amber",
                            hb.status === "REJECTED" && "bg-error-red/10 text-error-red",
                            hb.status === "CANCELLED" && "bg-secondary-bronze/10 text-secondary-bronze"
                          )}
                        >
                          {hb.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedBooking({ ...hb, type: "hall" })}
                          className="p-1.5 rounded-lg border border-primary-gold/20 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredHallBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-secondary-bronze/60">
                        No hall bookings found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "darshan" && (
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-4">Pass ID</th>
                    <th className="px-5 py-4">Devotee Name</th>
                    <th className="px-5 py-4">Contact Phone</th>
                    <th className="px-5 py-4">Visit Date & Slot</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-gold/10">
                  {filteredDarshanBookings.map((db) => (
                    <tr className="hover:bg-bg-warm/50 transition-colors" key={db.id}>
                      <td className="px-5 py-4 font-mono font-bold text-dark-surface">
                        {db.id}
                      </td>
                      <td className="px-5 py-4 font-semibold text-dark-surface">
                        {db.devotee_name}
                      </td>
                      <td className="px-5 py-4 text-secondary-bronze font-mono">
                        {db.devotee_phone}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-dark-surface">{db.visit_date}</p>
                        <p className="text-[10px] text-secondary-bronze/65">
                          {db.slot_name} ({db.visitor_count} Visitors)
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 text-[9px] font-bold rounded uppercase",
                            db.status === "CONFIRMED" && "bg-success-green/10 text-success-green",
                            db.status === "CHECKED_IN" && "bg-primary-gold/15 text-primary-gold",
                            db.status === "CANCELLED" && "bg-error-red/10 text-error-red"
                          )}
                        >
                          {db.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedBooking({ ...db, type: "darshan" })}
                          className="p-1.5 rounded-lg border border-primary-gold/20 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDarshanBookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-secondary-bronze/60">
                        No darshan passes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {activeTab === "puja" && (
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-bg-warm border-b border-primary-gold/10 text-secondary-bronze uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-4">Receipt & ID</th>
                    <th className="px-5 py-4">Devotee (Sankalp)</th>
                    <th className="px-5 py-4">Puja Service</th>
                    <th className="px-5 py-4">Date & Slot</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-gold/10">
                  {filteredPujaBookings.map((pb) => (
                    <tr className="hover:bg-bg-warm/50 transition-colors" key={pb.id}>
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-dark-surface">{pb.receipt_number || pb.id}</p>
                        <p className="text-[10px] text-secondary-bronze/60 font-mono">{pb.id}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-dark-surface">{pb.devotee_name}</p>
                        <p className="text-[10px] text-secondary-bronze/65">
                          Gotra: {pb.gothra} • Rashi: {pb.nakshatra}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-medium text-dark-surface">
                        <p>{pb.puja_name}</p>
                        {Number(pb.has_samagri) === 1 ? (
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[8px] font-bold text-primary-gold bg-primary-gold/10 border border-primary-gold/25 rounded uppercase">
                            With Samagri Kit
                          </span>
                        ) : (
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[8px] font-bold text-secondary-bronze/60 bg-secondary-bronze/10 rounded uppercase">
                            Without Samagri
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-dark-surface">{pb.booking_date}</p>
                        <p className="text-[10px] text-secondary-bronze/65">{pb.time_slot}</p>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-primary-gold">
                        {formatCurrency(Number(pb.total_amount))}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 text-[9px] font-bold rounded uppercase",
                            pb.status === "CONFIRMED" && "bg-success-green/10 text-success-green",
                            pb.status === "COMPLETED" && "bg-primary-gold/15 text-primary-gold",
                            pb.status === "CANCELLED" && "bg-error-red/10 text-error-red"
                          )}
                        >
                          {pb.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedBooking({ ...pb, type: "puja" })}
                          className="p-1.5 rounded-lg border border-primary-gold/20 text-secondary-bronze hover:bg-primary-gold/10 hover:text-primary-gold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPujaBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-secondary-bronze/60">
                        No puja bookings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Side Details Drawer */}
          <div className="lg:col-span-4">
            {selectedBooking ? (
              <GlassCard className="p-6 sm:p-8 border-primary-gold/25 shadow-md space-y-6 relative overflow-hidden bg-white">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="absolute top-4 right-4 p-1.5 text-secondary-bronze hover:text-dark-surface transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary-gold">
                    {selectedBooking.type === "hall"
                      ? "Hall Event Audit"
                      : selectedBooking.type === "darshan"
                      ? "Darshan Gate Pass"
                      : "Vedic Puja Seva"}
                  </span>
                  <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1 leading-tight">
                    {selectedBooking.type === "hall"
                      ? selectedBooking.event_title
                      : selectedBooking.type === "darshan"
                      ? selectedBooking.slot_name
                      : selectedBooking.puja_name}
                  </h3>
                  <p className="font-mono text-xs text-secondary-bronze mt-0.5">
                    Reference ID: {selectedBooking.id}
                  </p>
                </div>

                <div className="space-y-3 text-xs font-sans border-y border-primary-gold/10 py-4">
                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/70">Devotee Name:</span>
                    <span className="font-semibold text-dark-surface">{selectedBooking.devotee_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-bronze/70">Phone Number:</span>
                    <span className="font-semibold text-dark-surface">{selectedBooking.devotee_phone || "N/A"}</span>
                  </div>
                  {selectedBooking.devotee_email && (
                    <div className="flex justify-between">
                      <span className="text-secondary-bronze/70">Email Address:</span>
                      <span className="font-semibold text-dark-surface">{selectedBooking.devotee_email}</span>
                    </div>
                  )}

                  {selectedBooking.type === "hall" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Hall Venue:</span>
                        <span className="font-bold text-dark-surface">{selectedBooking.hall_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Target Date:</span>
                        <span className="font-semibold text-dark-surface">{selectedBooking.booking_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Expected Guests:</span>
                        <span className="font-semibold text-dark-surface">{selectedBooking.expected_guests} Devotees</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Event Timings:</span>
                        <span className="font-semibold text-dark-surface">{selectedBooking.start_time} - {selectedBooking.end_time}</span>
                      </div>
                      <div className="flex justify-between border-t border-primary-gold/10 pt-2 font-bold text-dark-surface">
                        <span>Total Price:</span>
                        <span className="text-primary-gold font-mono">{formatCurrency(Number(selectedBooking.total_price))}</span>
                      </div>
                    </>
                  )}

                  {selectedBooking.type === "darshan" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Visit Date:</span>
                        <span className="font-semibold text-dark-surface">{selectedBooking.visit_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Visitors Count:</span>
                        <span className="font-semibold text-dark-surface">{selectedBooking.visitor_count} Devotees</span>
                      </div>
                      {selectedBooking.qr_code_url && (
                        <div className="text-center pt-2">
                          <img
                            src={selectedBooking.qr_code_url}
                            alt="QR Pass"
                            className="w-28 h-28 mx-auto border rounded-xl p-1 shadow-xs"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {selectedBooking.type === "puja" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Booking Date:</span>
                        <span className="font-semibold text-dark-surface">{selectedBooking.booking_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Time Slot:</span>
                        <span className="font-semibold text-dark-surface">{selectedBooking.time_slot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Gotra & Nakshatra:</span>
                        <span className="font-semibold text-dark-surface">{selectedBooking.gothra} / {selectedBooking.nakshatra}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-bronze/70">Puja Samagri:</span>
                        <span className="font-bold text-primary-gold">
                          {Number(selectedBooking.has_samagri) === 1 ? "Mandir Kit Included" : "Devotee Brings"}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-primary-gold/10 pt-2 font-bold text-dark-surface">
                        <span>Total Offering:</span>
                        <span className="text-primary-gold font-mono">{formatCurrency(Number(selectedBooking.total_amount))}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="flex gap-2">
                  {selectedBooking.type === "hall" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateHallStatus(selectedBooking.id, "CONFIRMED")}
                        className="flex-1 py-2.5 rounded-xl bg-success-green text-white text-xs font-semibold shadow hover:brightness-105 cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateHallStatus(selectedBooking.id, "REJECTED")}
                        className="px-4 py-2.5 rounded-xl border border-error-red/30 text-error-red text-xs font-semibold hover:bg-error-red/5 cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {selectedBooking.type === "darshan" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdateDarshanStatus(selectedBooking.id, "CHECKED_IN")}
                        className="flex-1 py-2.5 rounded-xl bg-primary-gold text-white text-xs font-semibold shadow hover:brightness-105 cursor-pointer"
                      >
                        Check-In Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateDarshanStatus(selectedBooking.id, "CANCELLED")}
                        className="px-4 py-2.5 rounded-xl border border-error-red/30 text-error-red text-xs font-semibold hover:bg-error-red/5 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {selectedBooking.type === "puja" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleUpdatePujaStatus(selectedBooking.id, "COMPLETED")}
                        className="flex-1 py-2.5 rounded-xl bg-primary-gold text-white text-xs font-semibold shadow hover:brightness-105 cursor-pointer"
                      >
                        Mark Completed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdatePujaStatus(selectedBooking.id, "CANCELLED")}
                        className="px-4 py-2.5 rounded-xl border border-error-red/30 text-error-red text-xs font-semibold hover:bg-error-red/5 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </GlassCard>
            ) : (
              <GlassCard hoverEffect={false} className="p-8 border-primary-gold/15 bg-white text-center py-20">
                <Calendar className="w-10 h-10 text-primary-gold/40 mx-auto mb-3" />
                <h4 className="font-heading text-lg font-medium text-dark-surface">
                  No Booking Selected
                </h4>
                <p className="text-[11px] text-secondary-bronze/65 leading-relaxed font-sans max-w-[220px] mx-auto mt-1">
                  Click the eye icon on any booking to audit applicant specifics and perform approvals.
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MASTER CONFIGURATION CONSOLES */}
      {subView === "master" && (
        <div className="space-y-6">
          {/* Hall Master Grid */}
          {activeTab === "hall" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {halls.map((hall) => {
                const amenitiesList = getAmenitiesList(hall.amenities);
                return (
                  <GlassCard key={hall.id} className="p-6 bg-white border-primary-gold/20 flex flex-col justify-between h-full shadow-sm space-y-4">
                    <div className="space-y-3">
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-bg-warm/30">
                        {hall.image_url ? (
                          <img
                            src={hall.image_url}
                            alt={hall.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary-bronze/40">
                            <Building2 className="w-12 h-12 text-primary-gold/30" />
                          </div>
                        )}
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                          {hall.space_sqft} Sq. Ft.
                        </span>
                      </div>

                      <div>
                        <h3 className="font-heading text-xl font-medium text-dark-surface">{hall.name}</h3>
                        <p className="text-xs text-secondary-bronze/80 line-clamp-2 mt-1">{hall.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-secondary-bronze pt-2 border-t border-primary-gold/10">
                        <div>
                          <span className="opacity-70 text-[10px] block">Capacity:</span>
                          <span className="font-semibold text-dark-surface">{hall.capacity} People</span>
                        </div>
                        <div>
                          <span className="opacity-70 text-[10px] block">Max at a time:</span>
                          <span className="font-semibold text-dark-surface">{hall.max_people_at_a_time || hall.capacity} Devotees</span>
                        </div>
                        <div>
                          <span className="opacity-70 text-[10px] block">Price / Day:</span>
                          <span className="font-bold text-primary-gold">{formatCurrency(Number(hall.price_per_day))}</span>
                        </div>
                        <div>
                          <span className="opacity-70 text-[10px] block">Price / Half-Day:</span>
                          <span className="font-semibold text-dark-surface">{formatCurrency(Number(hall.price_per_half_day))}</span>
                        </div>
                      </div>

                      {/* Amenities Pills Display */}
                      <div className="pt-2 border-t border-primary-gold/10">
                        <p className="text-[10px] font-semibold text-secondary-bronze uppercase tracking-wider mb-1.5">
                          Amenities ({amenitiesList.length}):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {amenitiesList.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-bg-warm text-secondary-bronze text-[10px] font-medium rounded-lg border border-primary-gold/15"
                            >
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-primary-gold/10">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHall(hall);
                          setHallForm({
                            name: hall.name,
                            description: hall.description || "",
                            capacity: hall.capacity,
                            max_people_at_a_time: hall.max_people_at_a_time || hall.capacity,
                            space_sqft: hall.space_sqft || 5000,
                            price_per_day: Number(hall.price_per_day),
                            price_per_half_day: Number(hall.price_per_half_day),
                            image_url: hall.image_url || "",
                            amenities: getAmenitiesList(hall.amenities),
                          });
                          setNewAmenityInput("");
                          setHallModalOpen(true);
                        }}
                        className="flex-1 py-2 rounded-xl border border-primary-gold/30 text-secondary-bronze hover:bg-primary-gold/10 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Venue</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ type: "hall", id: hall.id, name: hall.name })}
                        className="p-2 rounded-xl border border-error-red/30 text-error-red hover:bg-error-red/10 cursor-pointer"
                        title="Delete Hall"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Darshan Slots Master Grid */}
          {activeTab === "darshan" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {darshanSlots.map((slot) => (
                <GlassCard key={slot.id} className="p-6 bg-white border-primary-gold/20 flex flex-col justify-between h-full shadow-sm space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold bg-primary-gold/10 px-2.5 py-1 rounded-lg">
                        {slot.badge || "Daily Aarti"}
                      </span>
                      <span className="text-xs font-mono font-semibold text-secondary-bronze">
                        Max {slot.max_visitors_limit} Visitors
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-medium text-dark-surface">{slot.slot_name}</h3>

                    <div className="p-3 rounded-xl bg-bg-warm/60 border border-primary-gold/10 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-dark-surface">
                        <Clock className="w-3.5 h-3.5 text-primary-gold" />
                        <span>{slot.start_time} - {slot.end_time}</span>
                      </div>
                      <p className="text-[11px] text-secondary-bronze/70">
                        🌍 Timezone: <strong>{slot.time_zone || "EAT (Africa/Kampala)"}</strong>
                      </p>
                    </div>

                    {slot.description && (
                      <p className="text-xs text-secondary-bronze/75 leading-relaxed">{slot.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-primary-gold/10">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSlot(slot);
                        setSlotForm({
                          slot_name: slot.slot_name,
                          start_time: slot.start_time,
                          end_time: slot.end_time,
                          max_visitors_limit: slot.max_visitors_limit,
                          time_zone: slot.time_zone || "EAT (Africa/Kampala)",
                          badge: slot.badge || "Daily Aarti",
                          description: slot.description || "",
                        });
                        setSlotModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl border border-primary-gold/30 text-secondary-bronze hover:bg-primary-gold/10 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Slot</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ type: "slot", id: slot.id, name: slot.slot_name })}
                      className="p-2 rounded-xl border border-error-red/30 text-error-red hover:bg-error-red/10 cursor-pointer"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Puja Master Grid */}
          {activeTab === "puja" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pujas.map((puja) => (
                <GlassCard key={puja.id} className="p-6 bg-white border-primary-gold/20 flex flex-col justify-between h-full shadow-sm space-y-4">
                  <div className="space-y-3">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-bg-warm/30">
                      {puja.image_url ? (
                        <img
                          src={puja.image_url}
                          alt={puja.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary-bronze/40">
                          <Flame className="w-12 h-12 text-primary-gold/30" />
                        </div>
                      )}
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-primary-gold backdrop-blur-md">
                        {puja.category}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-medium text-dark-surface">{puja.name}</h3>
                    <p className="text-xs text-secondary-bronze/80 line-clamp-2">{puja.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-secondary-bronze pt-2 border-t border-primary-gold/10">
                      <div>
                        <span className="opacity-70 text-[10px] block">Base Price (No Samagri):</span>
                        <span className="font-bold text-primary-gold">{formatCurrency(Number(puja.base_price))}</span>
                      </div>
                      <div>
                        <span className="opacity-70 text-[10px] block">Samagri Kit Cost:</span>
                        <span className="font-semibold text-dark-surface">+{formatCurrency(Number(puja.samagri_price))}</span>
                      </div>
                      <div>
                        <span className="opacity-70 text-[10px] block">Duration:</span>
                        <span className="font-semibold text-dark-surface">{puja.duration_minutes} Mins</span>
                      </div>
                      <div>
                        <span className="opacity-70 text-[10px] block">Priest Role:</span>
                        <span className="font-semibold text-dark-surface">{puja.priest_role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-primary-gold/10">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPuja(puja);
                        setPujaForm({
                          name: puja.name,
                          category: puja.category,
                          description: puja.description || "",
                          base_price: Number(puja.base_price),
                          samagri_price: Number(puja.samagri_price),
                          duration_minutes: puja.duration_minutes || 60,
                          priest_role: puja.priest_role || "Resident Mandir Shastri",
                          image_url: puja.image_url || "",
                        });
                        setPujaModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl border border-primary-gold/30 text-secondary-bronze hover:bg-primary-gold/10 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Ceremony</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm({ type: "puja", id: puja.id, name: puja.name })}
                      className="p-2 rounded-xl border border-error-red/30 text-error-red hover:bg-error-red/10 cursor-pointer"
                      title="Delete Puja"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
       * MODAL: IN-WEBSITE CUSTOM DELETE CONFIRMATION POPUP (Replaces browser alert/confirm)
       * ========================================================================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-poppins">
          <div className="bg-white rounded-3xl border border-error-red/20 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-error-red/10 text-error-red flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-error-red bg-error-red/10 px-2.5 py-1 rounded-full">
                Confirm Permanent Removal
              </span>
              <h3 className="font-heading text-2xl font-medium text-dark-surface mt-2">
                Delete {deleteConfirm.type === "hall" ? "Temple Hall Venue" : deleteConfirm.type === "slot" ? "Darshan Slot" : "Puja Ceremony"}?
              </h3>
              <p className="text-xs text-secondary-bronze/80 font-sans mt-2 leading-relaxed">
                Are you sure you want to remove{" "}
                <strong className="text-dark-surface">"{deleteConfirm.name}"</strong>? This will permanently delete it from the master catalog database.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleteConfirm.isDeleting}
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-secondary-bronze/30 text-secondary-bronze hover:bg-secondary-bronze/10 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteConfirm.isDeleting}
                onClick={executeConfirmedDelete}
                className="flex-1 py-3 rounded-xl bg-error-red text-white text-xs font-semibold shadow-md hover:brightness-110 cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleteConfirm.isDeleting ? (
                  <span>Removing...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL: HALL VENUE EDITOR (With Dynamic Amenities and Image Upload)
       * ========================================================================= */}
      {hallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-poppins">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-xl w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-primary-gold/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary-gold/15 text-primary-gold rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-medium text-dark-surface">
                    {editingHall ? "Edit Temple Venue" : "Add New Hall Venue"}
                  </h3>
                  <p className="text-[11px] text-secondary-bronze/70">
                    Configure venue capacities, amenities, and uploaded photo
                  </p>
                </div>
              </div>
              <button onClick={() => setHallModalOpen(false)} className="text-secondary-bronze hover:text-dark-surface cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHall} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">Hall Name *</label>
                <input
                  type="text"
                  required
                  value={hallForm.name}
                  onChange={(e) => setHallForm({ ...hallForm, name: e.target.value })}
                  placeholder="e.g., Shree Swaminarayan Grand Auditorium"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Total Seated Capacity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={hallForm.capacity}
                    onChange={(e) => setHallForm({ ...hallForm, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Max People At A Time (Limit) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={hallForm.max_people_at_a_time}
                    onChange={(e) => setHallForm({ ...hallForm, max_people_at_a_time: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Space (Sq. Ft.)</label>
                  <input
                    type="number"
                    min={1}
                    value={hallForm.space_sqft}
                    onChange={(e) => setHallForm({ ...hallForm, space_sqft: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Price Per Day (UGX) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={hallForm.price_per_day}
                    onChange={(e) => setHallForm({ ...hallForm, price_per_day: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-secondary-bronze">Price Per Half-Day (UGX)</label>
                  <input
                    type="number"
                    min={0}
                    value={hallForm.price_per_half_day}
                    onChange={(e) => setHallForm({ ...hallForm, price_per_half_day: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">Description & About Venue</label>
                <textarea
                  rows={2}
                  value={hallForm.description}
                  onChange={(e) => setHallForm({ ...hallForm, description: e.target.value })}
                  placeholder="Details regarding elevated royal stage, bridal suite, acoustic sound systems..."
                  className="w-full px-3.5 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none resize-none"
                />
              </div>

              {/* DYNAMIC AMENITIES FIELD WITH INPUT & ADD BUTTON */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-bg-warm/40 border border-primary-gold/20">
                <label className="font-semibold text-secondary-bronze block">
                  Venue Amenities & Facilities ({hallForm.amenities.length})
                </label>

                {/* Added Amenities Tags */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-xl border border-primary-gold/15">
                  {hallForm.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-gold/15 text-dark-surface font-semibold text-[11px] border border-primary-gold/30 shadow-2xs"
                    >
                      <span>✓ {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(idx)}
                        className="text-secondary-bronze/70 hover:text-error-red p-0.5 rounded cursor-pointer"
                        title="Remove amenity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {hallForm.amenities.length === 0 && (
                    <span className="text-[11px] text-secondary-bronze/50 italic py-0.5">
                      No amenities added yet. Type below and click Add.
                    </span>
                  )}
                </div>

                {/* Input with Add Button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAmenityInput}
                    onChange={(e) => setNewAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAmenity();
                      }
                    }}
                    placeholder="Type amenity (e.g., Central AC, Pure Veg Kitchen)..."
                    className="flex-grow px-3.5 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddAmenity()}
                    className="px-4 py-2 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold rounded-xl text-xs flex items-center gap-1 shadow hover:brightness-105 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-secondary-bronze/60 font-semibold">Quick Presets:</span>
                  {[
                    "Central AC",
                    "Pure Veg Kitchen",
                    "Audio Acoustics",
                    "Homa Allowed",
                    "Secure Parking",
                    "Bridal Suite",
                    "Generator Backup",
                    "Dining Hall Setup"
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddPresetAmenity(preset)}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer",
                        hallForm.amenities.includes(preset)
                          ? "bg-primary-gold/20 text-primary-gold border-primary-gold/30 opacity-60"
                          : "bg-white text-secondary-bronze/80 border-primary-gold/20 hover:bg-primary-gold/10 hover:text-dark-surface"
                      )}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* IMAGE UPLOAD FIELD (No manual text URL) */}
              <ImageUploadField
                label="Venue Photo / Cover Image"
                value={hallForm.image_url}
                onChange={(base64) => setHallForm({ ...hallForm, image_url: base64 })}
                onRemove={() => setHallForm({ ...hallForm, image_url: "" })}
                onError={(msg) => showToast(msg, "error")}
              />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold rounded-xl shadow hover:brightness-105 transition-all cursor-pointer text-xs"
              >
                {editingHall ? "Update Venue" : "Save Hall Venue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL: DARSHAN SLOT EDITOR
       * ========================================================================= */}
      {slotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-poppins">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-md w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-primary-gold/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary-gold/15 text-primary-gold rounded-xl">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-medium text-dark-surface">
                    {editingSlot ? "Edit Darshan Slot" : "Add Darshan Timetable Slot"}
                  </h3>
                  <p className="text-[11px] text-secondary-bronze/70">
                    Configure timing, timezone, and visitor limits
                  </p>
                </div>
              </div>
              <button onClick={() => setSlotModalOpen(false)} className="text-secondary-bronze hover:text-dark-surface cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">Slot Title *</label>
                <input
                  type="text"
                  required
                  value={slotForm.slot_name}
                  onChange={(e) => setSlotForm({ ...slotForm, slot_name: e.target.value })}
                  placeholder="e.g., Mangala Aarti & Dawn Darshan"
                  className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={slotForm.start_time}
                    onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })}
                    placeholder="06:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">End Time *</label>
                  <input
                    type="text"
                    required
                    value={slotForm.end_time}
                    onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })}
                    placeholder="07:15 AM"
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Max Visitors Limit *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={slotForm.max_visitors_limit}
                    onChange={(e) => setSlotForm({ ...slotForm, max_visitors_limit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Badge / Type</label>
                  <input
                    type="text"
                    value={slotForm.badge}
                    onChange={(e) => setSlotForm({ ...slotForm, badge: e.target.value })}
                    placeholder="e.g. Morning Aarti"
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">Timezone Setting *</label>
                <input
                  type="text"
                  required
                  value={slotForm.time_zone}
                  onChange={(e) => setSlotForm({ ...slotForm, time_zone: e.target.value })}
                  placeholder="EAT (Africa/Kampala)"
                  className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">About Slot</label>
                <textarea
                  rows={2}
                  value={slotForm.description}
                  onChange={(e) => setSlotForm({ ...slotForm, description: e.target.value })}
                  placeholder="Description of the prayer sequence..."
                  className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold rounded-xl shadow hover:brightness-105 transition-all cursor-pointer"
              >
                {editingSlot ? "Update Slot" : "Create Slot"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL: PUJA SEVA MASTER EDITOR (With Image Upload)
       * ========================================================================= */}
      {pujaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-poppins">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-lg w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-primary-gold/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary-gold/15 text-primary-gold rounded-xl">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-medium text-dark-surface">
                    {editingPuja ? "Edit Vedic Puja Ceremony" : "Create New Puja Offering"}
                  </h3>
                  <p className="text-[11px] text-secondary-bronze/70">
                    Set base price, samagri kit fee, and upload ceremony image
                  </p>
                </div>
              </div>
              <button onClick={() => setPujaModalOpen(false)} className="text-secondary-bronze hover:text-dark-surface cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePuja} className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">Puja Name *</label>
                <input
                  type="text"
                  required
                  value={pujaForm.name}
                  onChange={(e) => setPujaForm({ ...pujaForm, name: e.target.value })}
                  placeholder="e.g., Satyanarayan Maha Pooja"
                  className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Category *</label>
                  <select
                    value={pujaForm.category}
                    onChange={(e) => setPujaForm({ ...pujaForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  >
                    <option value="Special">Special</option>
                    <option value="Abhishek">Abhishek</option>
                    <option value="Daily">Daily</option>
                    <option value="Homa">Homa</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Duration (Mins) *</label>
                  <input
                    type="number"
                    required
                    min={5}
                    value={pujaForm.duration_minutes}
                    onChange={(e) => setPujaForm({ ...pujaForm, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Base Price (Without Samagri) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pujaForm.base_price}
                    onChange={(e) => setPujaForm({ ...pujaForm, base_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Samagri Kit Price (UGX) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pujaForm.samagri_price}
                    onChange={(e) => setPujaForm({ ...pujaForm, samagri_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">Resident Priest Role</label>
                <input
                  type="text"
                  value={pujaForm.priest_role}
                  onChange={(e) => setPujaForm({ ...pujaForm, priest_role: e.target.value })}
                  placeholder="e.g., Senior Mandir Shastri / Team of 3 Vedic Priests"
                  className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-secondary-bronze">Ceremony Description</label>
                <textarea
                  rows={2}
                  value={pujaForm.description}
                  onChange={(e) => setPujaForm({ ...pujaForm, description: e.target.value })}
                  placeholder="Spiritual significance and blessings invoked..."
                  className="w-full px-3 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none resize-none"
                />
              </div>

              {/* IMAGE UPLOAD FIELD (No manual text URL) */}
              <ImageUploadField
                label="Ceremony Photo / Image"
                value={pujaForm.image_url}
                onChange={(base64) => setPujaForm({ ...pujaForm, image_url: base64 })}
                onRemove={() => setPujaForm({ ...pujaForm, image_url: "" })}
                onError={(msg) => showToast(msg, "error")}
              />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold rounded-xl shadow hover:brightness-105 transition-all cursor-pointer text-xs"
              >
                {editingPuja ? "Update Puja" : "Save Puja Ceremony"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
