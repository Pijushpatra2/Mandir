"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { formatCurrency } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Building2,
  Clock,
  Flame,
  Calendar as CalendarIcon,
  CalendarCheck,
  CheckCircle2,
  Users,
  Sparkles,
  Info,
  X,
  Plus,
  Minus,
  ShieldCheck,
  Check,
  Phone,
  Mail,
  User,
  MapPin,
  ChefHat,
  Wind,
  Search,
  ArrowUpDown,
  Lock,
  ArrowRight,
  LogIn,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchHalls,
  fetchDarshanSlots,
  fetchPujas,
  createHallBooking,
  createDarshanBooking,
  createPujaBooking,
  TempleHallItem,
  TempleDarshanSlotItem,
  TemplePujaItem,
  TempleHallBookingItem,
  TempleDarshanBookingItem,
  TemplePujaBookingItem
} from "@/lib/bookingApi";

function BookingScrollPortal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    devoteeProfile,
    showToast
  } = useApp();

  // Active section tracking for sticky scroll spy
  const [activeSection, setActiveSection] = useState<"hall" | "darshan" | "puja">("hall");

  // Dynamic API state
  const [halls, setHalls] = useState<TempleHallItem[]>([]);
  const [darshanSlots, setDarshanSlots] = useState<TempleDarshanSlotItem[]>([]);
  const [pujas, setPujas] = useState<TemplePujaItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Filter & Search & Sort states for Horizontal Bar
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "duration">("popular");

  // Auth Guard Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionMessage, setAuthActionMessage] = useState("");

  // Submitting loaders
  const [isSubmittingHall, setIsSubmittingHall] = useState(false);
  const [isSubmittingDarshan, setIsSubmittingDarshan] = useState(false);
  const [isSubmittingPuja, setIsSubmittingPuja] = useState(false);

  // Success Confirmation states
  const [hallSuccessBooking, setHallSuccessBooking] = useState<TempleHallBookingItem | null>(null);
  const [darshanSuccessPass, setDarshanSuccessPass] = useState<TempleDarshanBookingItem | null>(null);
  const [pujaSuccessReceipt, setPujaSuccessReceipt] = useState<TemplePujaBookingItem | null>(null);

  // Auto-fill devotee details
  const defaultName = devoteeProfile
    ? `${devoteeProfile.first_name} ${devoteeProfile.last_name}`
    : "";
  const defaultEmail = devoteeProfile?.email || "";
  const defaultPhone = devoteeProfile?.phone || "";

  // Section references for scroll
  const hallRef = useRef<HTMLDivElement>(null);
  const darshanRef = useRef<HTMLDivElement>(null);
  const pujaRef = useRef<HTMLDivElement>(null);

  // Load dynamic data from Backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [hallsData, slotsData, pujasData] = await Promise.all([
          fetchHalls(false).catch(() => []),
          fetchDarshanSlots(false).catch(() => []),
          fetchPujas(false).catch(() => []),
        ]);
        setHalls(hallsData);
        setDarshanSlots(slotsData);
        setPujas(pujasData);
      } catch (err) {
        console.error("Failed to load booking master catalog:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // Smooth scroll to section
  const scrollToSection = (section: "hall" | "darshan" | "puja") => {
    setActiveSection(section);
    const element = document.getElementById(`${section}-section`);
    if (element) {
      const navOffset = 140; // account for sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Scroll to query param section on load
  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "hall" || type === "darshan" || type === "puja") {
      setTimeout(() => {
        scrollToSection(type as any);
      }, 200);
    }
  }, [searchParams]);

  // Scrollspy observer
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      const hallEl = document.getElementById("hall-section");
      const darshanEl = document.getElementById("darshan-section");
      const pujaEl = document.getElementById("puja-section");

      if (pujaEl && scrollPosition >= pujaEl.offsetTop) {
        setActiveSection("puja");
      } else if (darshanEl && scrollPosition >= darshanEl.offsetTop) {
        setActiveSection("darshan");
      } else if (hallEl) {
        setActiveSection("hall");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auth Guard Checker
  const checkDevoteeAuth = (actionName: string): boolean => {
    const isDevoteeLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("devotee_access_token");
    const isAdminLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("admin_access_token");
    
    if (!isDevoteeLoggedIn && !isAdminLoggedIn && !devoteeProfile) {
      setAuthActionMessage(actionName);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  /* =========================================================================
   * 1. HALL BOOKING STATE
   * ========================================================================= */
  const [selectedHallId, setSelectedHallId] = useState<string>("");
  const [hallDate, setHallDate] = useState("");
  const [hallEventType, setHallEventType] = useState("Marriage Ceremony");
  const [hallDuration, setHallDuration] = useState<"full" | "half" | "multi">("full");
  const [hallDays, setHallDays] = useState(1);
  const [hallGuests, setHallGuests] = useState(500);
  const [hallDevoteeName, setHallDevoteeName] = useState(defaultName);
  const [hallEmail, setHallEmail] = useState(defaultEmail);
  const [hallPhone, setHallPhone] = useState(defaultPhone);
  const [hallStartTime, setHallStartTime] = useState("09:00 AM");
  const [hallEndTime, setHallEndTime] = useState("06:00 PM");
  const [hallNotes, setHallNotes] = useState("");

  // Sync default devotee fields when profile loads
  useEffect(() => {
    if (devoteeProfile) {
      if (!hallDevoteeName) setHallDevoteeName(`${devoteeProfile.first_name} ${devoteeProfile.last_name}`);
      if (!hallEmail) setHallEmail(devoteeProfile.email || "");
      if (!hallPhone) setHallPhone(devoteeProfile.phone || "");
      if (!darshanName) setDarshanName(`${devoteeProfile.first_name} ${devoteeProfile.last_name}`);
      if (!darshanPhone) setDarshanPhone(devoteeProfile.phone || "");
      if (!pujaDevoteeName) setPujaDevoteeName(`${devoteeProfile.first_name} ${devoteeProfile.last_name}`);
    }
  }, [devoteeProfile]);

  // Set default selected hall
  useEffect(() => {
    if (halls.length > 0 && !selectedHallId) {
      setSelectedHallId(halls[0].id);
      setHallGuests(Math.min(500, halls[0].capacity));
    }
  }, [halls, selectedHallId]);

  const activeHall = halls.find((h) => h.id === selectedHallId) || halls[0];

  const getHallEstimate = () => {
    if (!activeHall) return { base: 0, cleaningFee: 0, refundableDeposit: 0, total: 0 };

    let basePerDay = Number(activeHall.price_per_day) || 2000000;
    if (hallDuration === "half") {
      basePerDay = Number(activeHall.price_per_half_day) > 0 ? Number(activeHall.price_per_half_day) : Math.round(basePerDay * 0.6);
    }

    const totalDays = hallDuration === "multi" ? Math.max(1, hallDays) : 1;
    const base = basePerDay * totalDays;
    const cleaningFee = 150000;
    const refundableDeposit = Math.round(base * 0.15);
    const total = base + cleaningFee + refundableDeposit;

    return { base, cleaningFee, refundableDeposit, total };
  };

  const handleHallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkDevoteeAuth("reserve the Temple Hall")) return;

    if (!selectedHallId || !hallDate || !hallDevoteeName || !hallPhone) {
      showToast("Please fill in all required booking details", "error");
      return;
    }

    if (activeHall && hallGuests > activeHall.capacity) {
      showToast(`Expected guests exceeds hall capacity of ${activeHall.capacity}`, "error");
      return;
    }

    try {
      setIsSubmittingHall(true);
      const created = await createHallBooking({
        hall_id: selectedHallId,
        hall_name: activeHall?.name || "Temple Grand Hall",
        devotee_id: devoteeProfile?.id || undefined,
        devotee_name: hallDevoteeName,
        devotee_email: hallEmail || devoteeProfile?.email || undefined,
        devotee_phone: hallPhone || devoteeProfile?.phone || undefined,
        event_title: hallEventType,
        booking_date: hallDate,
        duration_type: hallDuration,
        duration_days: hallDuration === "multi" ? hallDays : 1,
        start_time: hallStartTime,
        end_time: hallEndTime,
        expected_guests: Number(hallGuests),
        notes: hallNotes,
      });

      setHallSuccessBooking(created);
      showToast("Hall reservation request submitted successfully!", "success");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to submit hall booking";
      showToast(msg, "error");
    } finally {
      setIsSubmittingHall(false);
    }
  };

  /* =========================================================================
   * 2. DARSHAN PASS STATE
   * ========================================================================= */
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [darshanDate, setDarshanDate] = useState("");
  const [darshanVisitors, setDarshanVisitors] = useState(2);
  const [darshanName, setDarshanName] = useState(defaultName);
  const [darshanPhone, setDarshanPhone] = useState(defaultPhone);
  const [darshanEmail, setDarshanEmail] = useState(defaultEmail);

  // Set default slot
  useEffect(() => {
    if (darshanSlots.length > 0 && !selectedSlotId) {
      setSelectedSlotId(darshanSlots[0].id);
    }
  }, [darshanSlots, selectedSlotId]);

  const activeSlot = darshanSlots.find((s) => s.id === selectedSlotId) || darshanSlots[0];

  const handleDarshanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkDevoteeAuth("issue a Priority Darshan Pass")) return;

    if (!darshanDate || !darshanName || !darshanPhone) {
      showToast("Please provide your name, phone, and visit date.", "error");
      return;
    }

    try {
      setIsSubmittingDarshan(true);
      const created = await createDarshanBooking({
        slot_id: activeSlot?.id,
        slot_name: activeSlot ? `${activeSlot.slot_name} (${activeSlot.start_time} - ${activeSlot.end_time})` : "General Darshan",
        devotee_id: devoteeProfile?.id || undefined,
        devotee_name: darshanName,
        devotee_phone: darshanPhone || devoteeProfile?.phone,
        devotee_email: darshanEmail || devoteeProfile?.email || undefined,
        visit_date: darshanDate,
        visitor_count: Number(darshanVisitors),
      });

      setDarshanSuccessPass(created);
      showToast("Priority Darshan pass issued successfully!", "success");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to issue darshan pass";
      showToast(msg, "error");
    } finally {
      setIsSubmittingDarshan(false);
    }
  };

  /* =========================================================================
   * 3. PUJA SEVA STATE
   * ========================================================================= */
  const [activePujaModal, setActivePujaModal] = useState<TemplePujaItem | null>(null);
  const [pujaDate, setPujaDate] = useState("");
  const [pujaTimeSlot, setPujaTimeSlot] = useState("Morning (08:30 AM - 10:30 AM)");
  const [pujaDevoteeName, setPujaDevoteeName] = useState(defaultName);
  const [pujaGotra, setPujaGotra] = useState("Kashyap");
  const [pujaNakshatra, setPujaNakshatra] = useState("General");
  const [includeSamagri, setIncludeSamagri] = useState(true);

  // Filtered & Sorted Pujas
  const filteredPujas = pujas.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return Number(a.base_price) - Number(b.base_price);
    if (sortBy === "price-desc") return Number(b.base_price) - Number(a.base_price);
    if (sortBy === "duration") return (a.duration_minutes || 0) - (b.duration_minutes || 0);
    return Number(b.base_price) - Number(a.base_price);
  });

  const handleOpenPujaModal = (puja: TemplePujaItem) => {
    if (!checkDevoteeAuth("sponsor a Vedic Puja ceremony")) return;
    setActivePujaModal(puja);
    setPujaDate("");
    setPujaGotra("Kashyap");
    setPujaNakshatra("General");
    setIncludeSamagri(true);
  };

  const handlePujaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePujaModal || !pujaDate || !pujaDevoteeName) {
      showToast("Please fill in devotee name and date.", "error");
      return;
    }

    try {
      setIsSubmittingPuja(true);
      const created = await createPujaBooking({
        puja_id: activePujaModal.id,
        puja_name: activePujaModal.name,
        devotee_id: devoteeProfile?.id || undefined,
        devotee_name: pujaDevoteeName,
        devotee_phone: (devoteeProfile?.phone || defaultPhone) || undefined,
        devotee_email: (devoteeProfile?.email || defaultEmail) || undefined,
        gothra: pujaGotra,
        nakshatra: pujaNakshatra,
        booking_date: pujaDate,
        time_slot: pujaTimeSlot,
        has_samagri: includeSamagri,
      });

      setActivePujaModal(null);
      setPujaSuccessReceipt(created);
      showToast("Puja seva ceremony confirmed successfully!", "success");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Failed to book puja seva";
      showToast(msg, "error");
    } finally {
      setIsSubmittingPuja(false);
    }
  };

  // Amenities parser helper
  const parseAmenities = (raw: string | string[] | null | undefined): string[] => {
    if (!raw) return ["Central AC", "Veg Kitchen", "Acoustic Audio", "Secure Parking"];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return typeof raw === "string" ? raw.split(",").map((s) => s.trim()) : [];
  };

  return (
    <div className="bg-bg-warm min-h-screen font-poppins pb-24">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-dark-surface via-[#1c140d] to-dark-surface text-white py-20 border-b border-primary-gold/25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary-gold)_0%,_transparent_70%)] opacity-15 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-gold/20 border border-primary-gold/40 text-primary-gold text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Divine Reservations & Sevas</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white">
            Online Temple <span className="text-primary-gold italic font-normal">Booking Portal</span>
          </h1>
          <p className="text-xs sm:text-base text-white/75 max-w-2xl mx-auto leading-relaxed font-light font-sans">
            Scroll seamlessly through our sacred facilities — reserve community halls for auspicious celebrations, obtain priority Darshan passes, and sponsor traditional Vedic Pujas with or without Samagri kits.
          </p>
        </div>
      </div>

      {/* 2. Sticky Horizontal Navigation & Filter / Sort Bar */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-primary-gold/25 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Section Jump Tabs (Scroll Spy Anchor Nav) */}
            <div className="flex items-center gap-1.5 p-1 bg-bg-warm rounded-2xl border border-primary-gold/20 overflow-x-auto">
              <button
                type="button"
                onClick={() => scrollToSection("hall")}
                className={cn(
                  "px-3.5 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
                  activeSection === "hall"
                    ? "bg-gradient-to-r from-primary-gold to-secondary-bronze text-white shadow-sm"
                    : "text-secondary-bronze hover:text-dark-surface hover:bg-primary-gold/10"
                )}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>01. Hall Booking</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("darshan")}
                className={cn(
                  "px-3.5 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
                  activeSection === "darshan"
                    ? "bg-gradient-to-r from-primary-gold to-secondary-bronze text-white shadow-sm"
                    : "text-secondary-bronze hover:text-dark-surface hover:bg-primary-gold/10"
                )}
              >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                <span>02. Darshan Pass</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("puja")}
                className={cn(
                  "px-3.5 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
                  activeSection === "puja"
                    ? "bg-gradient-to-r from-primary-gold to-secondary-bronze text-white shadow-sm"
                    : "text-secondary-bronze hover:text-dark-surface hover:bg-primary-gold/10"
                )}
              >
                <Flame className="w-4 h-4 shrink-0" />
                <span>03. Vedic Pujas</span>
              </button>
            </div>

            {/* Quick Search & Sort Controls */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
              {/* Search */}
              <div className="relative flex-grow sm:flex-grow-0 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-bronze/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter ceremonies..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/50 focus:bg-white focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-bronze/60 hover:text-dark-surface"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-primary-gold" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-2 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/50 text-xs font-semibold text-secondary-bronze focus:outline-none cursor-pointer"
                >
                  <option value="popular">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="duration">Shortest Duration</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 mt-12">
        {/* =========================================================================
         * SECTION 1: 🏛️ GRAND HALL EVENT BOOKING
         * ========================================================================= */}
        <section id="hall-section" ref={hallRef} className="scroll-mt-36 space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary-gold/20 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary-gold font-bold text-xs uppercase tracking-widest">
                <span>01</span>
                <span>•</span>
                <span>Grand Event Venues & Spaces</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-medium text-dark-surface mt-1">
                Temple Halls & Banquet Facilities
              </h2>
              <p className="text-xs sm:text-sm text-secondary-bronze/80 font-sans mt-0.5">
                Choose between the Grand Auditorium, Devotional Dining Hall, or Satsang Bhavan. Fully equipped with central AC, pure vegetarian kitchen, and fire permits.
              </p>
            </div>
            <span className="px-3.5 py-1 text-xs font-bold text-success-green bg-success-green/10 border border-success-green/30 rounded-xl self-start md:self-auto">
              🟢 Dates Open for 2026
            </span>
          </div>

          {/* Hall Selection Selector Tabs */}
          {halls.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {halls.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setSelectedHallId(h.id);
                    setHallGuests(Math.min(hallGuests, h.capacity));
                  }}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2.5 shrink-0 cursor-pointer",
                    (selectedHallId === h.id || (!selectedHallId && h === halls[0]))
                      ? "bg-primary-gold text-white border-primary-gold shadow-md"
                      : "bg-white text-secondary-bronze border-primary-gold/20 hover:border-primary-gold/50"
                  )}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{h.name}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px]",
                    (selectedHallId === h.id || (!selectedHallId && h === halls[0]))
                      ? "bg-white/20 text-white font-mono"
                      : "bg-primary-gold/10 text-primary-gold font-mono"
                  )}>
                    {h.capacity} Cap
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Active Hall Showcase Banner & Amenities */}
          {activeHall && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-8 border border-primary-gold/20 shadow-sm">
              <div className="lg:col-span-6 relative aspect-video sm:h-[320px] rounded-2xl overflow-hidden shadow-md">
                <img
                  src={activeHall.image_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80"}
                  alt={activeHall.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-gold px-2 py-0.5 rounded text-white">
                        {activeHall.space_sqft ? `${activeHall.space_sqft.toLocaleString()} Sq. Ft.` : "Spacious Facility"}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded text-white">
                        Max {activeHall.capacity} Devotees
                      </span>
                    </div>
                    <h3 className="font-heading text-xl sm:text-2xl font-medium mt-1 text-white">
                      {activeHall.name}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div>
                  <h3 className="font-heading text-2xl font-medium text-dark-surface">
                    {activeHall.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-bronze leading-relaxed font-sans mt-1">
                    {activeHall.description || "Spacious temple venue equipped with elevated royal stage, bridal suite, audio sound system, pure vegetarian dining halls, and continuous power generator."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs text-secondary-bronze font-medium">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-warm border border-primary-gold/15">
                    <Users className="w-4 h-4 text-primary-gold shrink-0" />
                    <span>{activeHall.capacity} Seats</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-warm border border-primary-gold/15">
                    <Wind className="w-4 h-4 text-primary-gold shrink-0" />
                    <span>Central AC</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-warm border border-primary-gold/15">
                    <ChefHat className="w-4 h-4 text-primary-gold shrink-0" />
                    <span>Veg Kitchen</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-warm border border-primary-gold/15">
                    <Flame className="w-4 h-4 text-primary-gold shrink-0" />
                    <span>Homa Allowed</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-warm border border-primary-gold/15">
                    <ShieldCheck className="w-4 h-4 text-primary-gold shrink-0" />
                    <span>Max {activeHall.max_people_at_a_time || activeHall.capacity} at a time</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-warm border border-primary-gold/15">
                    <Sparkles className="w-4 h-4 text-primary-gold shrink-0" />
                    <span>{activeHall.space_sqft} sqft Space</span>
                  </div>
                </div>

                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {parseAmenities(activeHall.amenities).map((am, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-primary-gold/10 text-secondary-bronze text-[11px] font-semibold border border-primary-gold/15">
                      ✓ {am}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form & Cost Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <GlassCard className="p-6 sm:p-8 border-primary-gold/20 bg-white space-y-5">
                <div className="border-b border-primary-gold/15 pb-3">
                  <h3 className="font-heading text-2xl font-medium text-dark-surface">
                    Hall Reservation Request
                  </h3>
                  <p className="text-xs text-secondary-bronze/75 font-sans">
                    Submit your booking date, time slots, and guest headcount to reserve the facility.
                  </p>
                </div>

                <form onSubmit={handleHallSubmit} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-secondary-bronze">Selected Hall Venue *</label>
                      <select
                        value={selectedHallId}
                        onChange={(e) => {
                          setSelectedHallId(e.target.value);
                          const chosen = halls.find((h) => h.id === e.target.value);
                          if (chosen) setHallGuests(Math.min(hallGuests, chosen.capacity));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      >
                        {halls.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} (Max Capacity: {h.capacity} Devotees • {formatCurrency(Number(h.price_per_day))}/day)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-secondary-bronze">Event Type *</label>
                      <select
                        value={hallEventType}
                        onChange={(e) => setHallEventType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      >
                        <option>Marriage Ceremony</option>
                        <option>Satsang & Katha</option>
                        <option>Thread / Upanayana Ceremony</option>
                        <option>Cultural Music / Drama</option>
                        <option>Community Seminar / Exhibition</option>
                        <option>Memorial Prayer Sabha</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-secondary-bronze">Target Event Date *</label>
                      <input
                        type="date"
                        required
                        value={hallDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setHallDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-secondary-bronze">Duration Option</label>
                      <select
                        value={hallDuration}
                        onChange={(e) => setHallDuration(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      >
                        <option value="full">Full Day (10 Hours)</option>
                        <option value="half">Half Day (5 Hours)</option>
                        <option value="multi">Multiple Consecutive Days</option>
                      </select>
                    </div>

                    {hallDuration === "multi" ? (
                      <div className="space-y-1">
                        <label className="font-semibold text-secondary-bronze">Number of Days</label>
                        <input
                          type="number"
                          min={2}
                          max={14}
                          value={hallDays}
                          onChange={(e) => setHallDays(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="font-semibold text-secondary-bronze">
                          Expected Guests (Max {activeHall?.capacity || 1200})
                        </label>
                        <input
                          type="number"
                          min={20}
                          max={activeHall?.capacity || 1200}
                          value={hallGuests}
                          onChange={(e) => setHallGuests(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="font-semibold text-secondary-bronze">Start Time</label>
                      <input
                        type="text"
                        value={hallStartTime}
                        onChange={(e) => setHallStartTime(e.target.value)}
                        placeholder="e.g., 09:00 AM"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-secondary-bronze">End Time</label>
                      <input
                        type="text"
                        value={hallEndTime}
                        onChange={(e) => setHallEndTime(e.target.value)}
                        placeholder="e.g., 06:00 PM"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-secondary-bronze">Primary Host / Devotee Name *</label>
                      <input
                        type="text"
                        required
                        value={hallDevoteeName}
                        onChange={(e) => setHallDevoteeName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-secondary-bronze">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={hallPhone}
                        onChange={(e) => setHallPhone(e.target.value)}
                        placeholder="+256 700 000000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-secondary-bronze">Devotee Email</label>
                      <input
                        type="email"
                        value={hallEmail}
                        onChange={(e) => setHallEmail(e.target.value)}
                        placeholder="devotee@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-secondary-bronze">Special Notes & Arrangements</label>
                      <textarea
                        rows={2}
                        value={hallNotes}
                        onChange={(e) => setHallNotes(e.target.value)}
                        placeholder="E.g., sound equipment, mandap setup time, kitchen usage..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingHall}
                    className="w-full py-3.5 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{isSubmittingHall ? "Submitting Reservation..." : "Submit Hall Reservation"}</span>
                  </button>
                </form>
              </GlassCard>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <GlassCard className="p-6 sm:p-8 border-primary-gold/25 bg-gradient-to-br from-white via-bg-warm/40 to-primary-gold/10 shadow-md">
                <div className="flex justify-between items-center border-b border-primary-gold/15 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-gold">
                    Estimated Cost Summary
                  </span>
                  <span className="text-[10px] text-secondary-bronze bg-primary-gold/10 px-2 py-0.5 rounded-md font-semibold">
                    UGX Quote
                  </span>
                </div>

                {(() => {
                  const quote = getHallEstimate();
                  return (
                    <div className="space-y-3 text-xs text-secondary-bronze mt-4">
                      <div className="flex justify-between">
                        <span>Venue:</span>
                        <span className="font-semibold text-dark-surface">{activeHall?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rental ({hallDuration === "multi" ? `${hallDays} Days` : hallDuration}):</span>
                        <span className="font-bold text-dark-surface">{formatCurrency(quote.base)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sanitization & Cleaning Fee:</span>
                        <span className="font-bold text-dark-surface">{formatCurrency(quote.cleaningFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Refundable Security Deposit (15%):</span>
                        <span className="font-bold text-dark-surface">{formatCurrency(quote.refundableDeposit)}</span>
                      </div>

                      <div className="border-t border-primary-gold/20 pt-3 flex justify-between items-center text-sm font-bold text-dark-surface">
                        <span>Total Estimated Quote:</span>
                        <span className="font-heading text-xl text-primary-gold">
                          {formatCurrency(quote.total)}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="mt-5 p-3.5 rounded-xl bg-primary-gold/10 border border-primary-gold/20 text-[11px] text-secondary-bronze">
                  <p className="font-semibold flex items-center gap-1.5 text-dark-surface">
                    <Info className="w-3.5 h-3.5 text-primary-gold" />
                    Reservation Guarantee
                  </p>
                  <p className="opacity-85 mt-0.5">
                    Your date is provisionally reserved upon form submission. Official approval and invoicing are synchronized directly to your devotee dashboard.
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * SECTION 2: 🕉️ DARSHAN & AARTI TIMING PASSES
         * ========================================================================= */}
        <section id="darshan-section" ref={darshanRef} className="scroll-mt-36 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary-gold/20 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary-gold font-bold text-xs uppercase tracking-widest">
                <span>02</span>
                <span>•</span>
                <span>Worship & Darshan Timetable</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-medium text-dark-surface mt-1">
                Daily Aarti & Darshan Schedule
              </h2>
              <p className="text-xs sm:text-sm text-secondary-bronze/80 font-sans mt-0.5">
                Join daily prayers in Kampala timezone (EAT - UTC+3) or issue a free priority Darshan gate pass for family members.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-primary-gold/10 border border-primary-gold/25 text-xs font-semibold text-secondary-bronze font-mono">
              🌍 Timezone: East Africa Time (EAT)
            </span>
          </div>

          {/* Slots Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {darshanSlots.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSlotId(s.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer bg-white text-left space-y-2",
                  selectedSlotId === s.id
                    ? "border-primary-gold ring-2 ring-primary-gold/30 shadow-md bg-gradient-to-br from-white to-primary-gold/10"
                    : "border-primary-gold/20 hover:border-primary-gold/40 shadow-xs"
                )}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary-gold bg-primary-gold/10 px-2 py-0.5 rounded">
                    {s.badge || "Daily Aarti"}
                  </span>
                  <span className="text-[9px] text-secondary-bronze/60 font-mono">
                    Max {s.max_visitors_limit}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-dark-surface line-clamp-1">{s.slot_name}</h4>
                <p className="font-mono font-bold text-xs text-primary-gold">
                  {s.start_time} - {s.end_time}
                </p>
                <p className="text-[10px] text-secondary-bronze/60 line-clamp-1">
                  {s.time_zone || "EAT (Africa/Kampala)"}
                </p>
              </div>
            ))}
          </div>

          {/* Darshan Pass Booking Box */}
          <div className="max-w-3xl mx-auto">
            <GlassCard className="p-6 sm:p-8 border-primary-gold/30 bg-white shadow-md space-y-5">
              <div className="text-center space-y-1 border-b border-primary-gold/15 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                  Complimentary Priority Pass
                </span>
                <h3 className="font-heading text-2xl font-medium text-dark-surface">
                  Schedule Family Darshan Visit
                </h3>
              </div>

              <form onSubmit={handleDarshanSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze flex items-center gap-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary-gold" />
                      Visit Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={darshanDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDarshanDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary-gold" />
                      Selected Time Slot *
                    </label>
                    <select
                      value={selectedSlotId}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                    >
                      {darshanSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.slot_name} ({slot.start_time} - {slot.end_time})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary-gold" />
                      Total Devotees / Family Members
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDarshanVisitors((prev) => Math.max(1, prev - 1))}
                        className="w-9 h-9 rounded-xl border border-primary-gold/25 flex items-center justify-center text-secondary-bronze hover:bg-primary-gold/10 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center font-bold text-sm text-dark-surface font-mono">
                        {darshanVisitors}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDarshanVisitors((prev) => Math.min(20, prev + 1))}
                        className="w-9 h-9 rounded-xl border border-primary-gold/25 flex items-center justify-center text-secondary-bronze hover:bg-primary-gold/10 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-secondary-bronze flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary-gold" />
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={darshanPhone}
                      onChange={(e) => setDarshanPhone(e.target.value)}
                      placeholder="+256 700 000000"
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-secondary-bronze flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary-gold" />
                      Devotee / Family Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={darshanName}
                      onChange={(e) => setDarshanName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-4 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDarshan}
                  className="w-full py-3.5 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{isSubmittingDarshan ? "Issuing Pass..." : "Issue Priority Darshan Pass"}</span>
                </button>
              </form>
            </GlassCard>
          </div>
        </section>

        {/* =========================================================================
         * SECTION 3: 🪔 VEDIC PUJA & SEVA CEREMONIES
         * ========================================================================= */}
        <section id="puja-section" ref={pujaRef} className="scroll-mt-36 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary-gold/20 pb-4">
            <div>
              <div className="flex items-center gap-2 text-primary-gold font-bold text-xs uppercase tracking-widest">
                <span>03</span>
                <span>•</span>
                <span>Sacred Ceremonies & Pujas</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-medium text-dark-surface mt-1">
                Vedic Pooja & Seva Offerings
              </h2>
              <p className="text-xs sm:text-sm text-secondary-bronze/80 font-sans mt-0.5">
                Conducted by resident Vedic Shastri priests. Choose with complete Mandir Puja Samagri kit or devotee self-arranged samagri.
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 self-start md:self-auto">
              {["All", "Special", "Abhishek", "Daily", "Homa"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                    selectedCategory === cat
                      ? "bg-primary-gold text-white shadow-xs"
                      : "bg-white text-secondary-bronze border border-primary-gold/20 hover:bg-primary-gold/10"
                  )}
                >
                  {cat === "All" ? "All Sevas" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Puja Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPujas.map((puja) => (
              <GlassCard
                hoverEffect
                key={puja.id}
                className="p-6 bg-white border-primary-gold/20 flex flex-col justify-between h-full shadow-sm"
              >
                <div className="space-y-3.5">
                  <div className="relative h-44 rounded-2xl overflow-hidden">
                    <img
                      src={puja.image_url || "https://images.unsplash.com/photo-1609358905581-e5382c473950?auto=format&fit=crop&w=600&q=80"}
                      alt={puja.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-primary-gold backdrop-blur-md border border-primary-gold/30">
                      {puja.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-medium text-dark-surface">
                      {puja.name}
                    </h3>
                    <p className="text-xs text-secondary-bronze/80 line-clamp-2 mt-1 leading-relaxed font-sans">
                      {puja.description}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-secondary-bronze font-sans border-t border-primary-gold/10 pt-2.5">
                    <div className="flex justify-between">
                      <span className="opacity-70">Duration:</span>
                      <span className="font-semibold text-dark-surface">{puja.duration_minutes} Mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Priest:</span>
                      <span className="font-semibold text-dark-surface">{puja.priest_role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Samagri Kit:</span>
                      <span className="font-semibold text-primary-gold">+{formatCurrency(Number(puja.samagri_price))} (Optional)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-primary-gold/15 pt-4 mt-4">
                  <div>
                    <span className="text-[10px] text-secondary-bronze/60 uppercase block">Base Offering</span>
                    <span className="text-lg font-bold text-primary-gold">
                      {formatCurrency(Number(puja.base_price))}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenPujaModal(puja)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all cursor-pointer"
                  >
                    Book Seva
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {filteredPujas.length === 0 && !loadingInitial && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-primary-gold/30 p-6">
              <Sparkles className="w-8 h-8 text-primary-gold/40 mx-auto mb-2" />
              <p className="text-xs font-semibold text-dark-surface">No pooja offerings found matching criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-2 text-xs text-primary-gold underline font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* =========================================================================
       * MODAL: PUJA CUSTOMIZER WITH / WITHOUT SAMAGRI
       * ========================================================================= */}
      {activePujaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-poppins">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-primary-gold/15 bg-gradient-to-r from-bg-warm to-surface-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-gold/15 text-primary-gold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-medium text-dark-surface">
                    Book {activePujaModal.name}
                  </h3>
                  <p className="text-xs text-secondary-bronze/70">
                    Base Offering: {formatCurrency(Number(activePujaModal.base_price))}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePujaModal(null)}
                className="p-1.5 text-secondary-bronze hover:text-dark-surface rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePujaSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Devotee / Sankalp Name *</label>
                  <input
                    type="text"
                    required
                    value={pujaDevoteeName}
                    onChange={(e) => setPujaDevoteeName(e.target.value)}
                    placeholder="Name for sankalp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Puja Date *</label>
                  <input
                    type="date"
                    required
                    value={pujaDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setPujaDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Gotra (Lineage)</label>
                  <input
                    type="text"
                    value={pujaGotra}
                    onChange={(e) => setPujaGotra(e.target.value)}
                    placeholder="e.g., Kashyap / Garg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-secondary-bronze">Nakshatra / Rashi</label>
                  <input
                    type="text"
                    value={pujaNakshatra}
                    onChange={(e) => setPujaNakshatra(e.target.value)}
                    placeholder="e.g., Rohini / Vrishabha"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-secondary-bronze">Preferred Time Slot</label>
                  <select
                    value={pujaTimeSlot}
                    onChange={(e) => setPujaTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-bg-warm/30 focus:outline-none"
                  >
                    <option>Morning (08:30 AM - 10:30 AM)</option>
                    <option>Mid-Day (11:00 AM - 01:00 PM)</option>
                    <option>Evening (05:00 PM - 07:00 PM)</option>
                  </select>
                </div>
              </div>

              {/* Samagri Selection Toggle */}
              <div
                onClick={() => setIncludeSamagri(!includeSamagri)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer",
                  includeSamagri
                    ? "border-primary-gold bg-primary-gold/10"
                    : "border-primary-gold/20 bg-bg-warm/40 hover:bg-bg-warm"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeSamagri}
                    onChange={() => {}}
                    className="rounded text-primary-gold focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-dark-surface">Include Mandir Puja Samagri Kit</p>
                    <p className="text-[10px] text-secondary-bronze/70">
                      Coconuts, sacred threads, pure ghee, kumkum, betel leaves, havan samagri
                    </p>
                  </div>
                </div>
                <span className="font-bold text-primary-gold">
                  +{formatCurrency(Number(activePujaModal.samagri_price || 20000))}
                </span>
              </div>

              {/* Price Calculation breakdown */}
              <div className="space-y-1 pt-2 border-t border-primary-gold/15 text-secondary-bronze">
                <div className="flex justify-between">
                  <span>Base Priest & Seva Offering:</span>
                  <span className="font-semibold text-dark-surface">
                    {formatCurrency(Number(activePujaModal.base_price))}
                  </span>
                </div>
                {includeSamagri ? (
                  <div className="flex justify-between">
                    <span>Mandir Samagri Kit:</span>
                    <span className="font-semibold text-dark-surface">
                      +{formatCurrency(Number(activePujaModal.samagri_price || 20000))}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-secondary-bronze/60 italic">
                    <span>Samagri Kit:</span>
                    <span>Self-Arranged (UGX 0)</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-primary-gold/15 text-sm font-bold text-dark-surface">
                  <span>Total Contribution:</span>
                  <span className="text-lg font-bold text-primary-gold font-mono">
                    {formatCurrency(
                      Number(activePujaModal.base_price) + (includeSamagri ? Number(activePujaModal.samagri_price || 20000) : 0)
                    )}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPuja}
                className="w-full py-3 bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold rounded-xl shadow hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmittingPuja ? "Confirming Booking..." : "Confirm & Book Puja Ceremony"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL: AUTHENTICATION GUARD MODAL (Redirects to Login / Register)
       * ========================================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-poppins">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                Authentication Required
              </span>
              <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                Please Login or Register
              </h3>
              <p className="text-xs text-secondary-bronze/80 font-sans mt-2 leading-relaxed">
                To {authActionMessage || "complete your temple booking"}, you need an active Devotee Member account. Your booking draft is saved!
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/login?redirect=/booking"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs sm:text-sm font-semibold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Devotee Member Login</span>
              </Link>

              <Link
                href="/membership?redirect=/booking"
                className="w-full py-3.5 rounded-xl border border-primary-gold/30 bg-bg-warm/60 text-secondary-bronze text-xs sm:text-sm font-semibold hover:bg-primary-gold/10 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-primary-gold" />
                <span>Create Free Devotee Account (OTP Verify)</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="py-2 text-xs text-secondary-bronze/60 hover:text-dark-surface cursor-pointer"
              >
                Cancel and return to browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * MODAL: SUCCESS CONFIRMATION RECEIPT
       * ========================================================================= */}
      {(hallSuccessBooking || darshanSuccessPass || pujaSuccessReceipt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-poppins">
          <div className="bg-white rounded-3xl border border-primary-gold/30 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-full bg-success-green/15 text-success-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                Booking Recorded & Synchronized
              </span>
              <h3 className="font-heading text-2xl font-medium text-dark-surface mt-0.5">
                {hallSuccessBooking
                  ? "Hall Reservation Received"
                  : darshanSuccessPass
                  ? "Priority Darshan Pass Issued"
                  : "Puja Seva Confirmed"}
              </h3>
              <p className="text-xs text-secondary-bronze/70 font-sans mt-1">
                Reference ID:{" "}
                <strong className="font-mono text-dark-surface">
                  {hallSuccessBooking?.id || darshanSuccessPass?.id || pujaSuccessReceipt?.receipt_number || pujaSuccessReceipt?.id}
                </strong>
              </p>
            </div>

            <div className="bg-bg-warm/60 rounded-2xl p-4 text-xs font-sans text-secondary-bronze space-y-2 text-left border border-primary-gold/15">
              <div className="flex justify-between">
                <span className="opacity-70">Devotee:</span>
                <span className="font-semibold text-dark-surface">
                  {hallSuccessBooking?.devotee_name || darshanSuccessPass?.devotee_name || pujaSuccessReceipt?.devotee_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Date:</span>
                <span className="font-semibold text-dark-surface">
                  {hallSuccessBooking?.booking_date || darshanSuccessPass?.visit_date || pujaSuccessReceipt?.booking_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Service:</span>
                <span className="font-semibold text-dark-surface">
                  {hallSuccessBooking?.hall_name || darshanSuccessPass?.slot_name || pujaSuccessReceipt?.puja_name}
                </span>
              </div>
              {pujaSuccessReceipt && (
                <div className="flex justify-between border-t border-primary-gold/15 pt-2 font-bold text-dark-surface">
                  <span>Total Offering:</span>
                  <span className="text-primary-gold">{formatCurrency(Number(pujaSuccessReceipt.total_amount))}</span>
                </div>
              )}
              {hallSuccessBooking && (
                <div className="flex justify-between border-t border-primary-gold/15 pt-2 font-bold text-dark-surface">
                  <span>Estimated Total:</span>
                  <span className="text-primary-gold">{formatCurrency(Number(hallSuccessBooking.total_price))}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                href="/user-dashboard/bookings"
                onClick={() => {
                  setHallSuccessBooking(null);
                  setDarshanSuccessPass(null);
                  setPujaSuccessReceipt(null);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all text-center"
              >
                View in Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setHallSuccessBooking(null);
                  setDarshanSuccessPass(null);
                  setPujaSuccessReceipt(null);
                }}
                className="px-4 py-3 rounded-xl border border-secondary-bronze/30 text-secondary-bronze hover:bg-secondary-bronze/10 text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-warm flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingScrollPortal />
    </Suspense>
  );
}
