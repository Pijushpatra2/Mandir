"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "@/lib/context";
import { WordStyleEditor } from "@/components/cms/WordStyleEditor";
import { ImageUploader } from "@/components/cms/ImageUploader";
import {
  DEFAULT_HOME_CONTENT,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_DONATIONS_CONTENT,
  DEFAULT_GALLERY_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  INITIAL_GALLERY_ITEMS,
  HomeCmsData,
  AboutCmsData,
  DonationsCmsData,
  GalleryCmsData,
  ContactCmsData
} from "@/data/cmsDefaults";
import {
  Globe, Home, Info, Heart, Image as ImageIcon, Phone, Save,
  RotateCcw, ExternalLink, CheckCircle2, AlertCircle, Plus, Trash2,
  Lock, Eye, ChevronDown, ChevronUp, Sparkles, Clock, MapPin,
  Calendar, Building, Tv, ShieldCheck, Zap, HelpCircle, UserCheck
} from "lucide-react";

interface SectionCardProps {
  id: string;
  title: string;
  icon: any;
  isOpen: boolean;
  onToggle: () => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  saveLabel?: string;
  apiConnectedNotice?: string;
  children: React.ReactNode;
}

function SectionCard({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  onSave,
  onReset,
  isSaving,
  saveLabel = "Save Section",
  apiConnectedNotice,
  children
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#B47F35]/20 overflow-hidden shadow-xs transition-shadow hover:shadow-sm">
      <div
        onClick={onToggle}
        className="p-5 bg-[#FAF7F2] border-b border-[#B47F35]/15 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#B47F35]/10 flex items-center justify-center text-[#B47F35] shrink-0 border border-[#B47F35]/20">
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base sm:text-lg font-bold text-[#2B132C]">
                {title}
              </h3>
              {apiConnectedNotice && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>⚡ Connected to API</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronUp className="w-5 h-5 text-stone-600" /> : <ChevronDown className="w-5 h-5 text-stone-600" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-6 space-y-6 text-left">
          {apiConnectedNotice && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
              <Zap className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Connected to External API</p>
                <p className="text-amber-800/90 text-xs mt-0.5 leading-relaxed">
                  {apiConnectedNotice}
                </p>
              </div>
            </div>
          )}

          {children}

          <div className="flex items-center justify-between pt-4 border-t border-[#B47F35]/15">
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B47F35] to-[#8B5E34] hover:brightness-105 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : saveLabel}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminCmsPage() {
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState<"home" | "about" | "donations" | "gallery" | "contact">("home");

  // State for each page's content
  const [homeData, setHomeData] = useState<HomeCmsData>(DEFAULT_HOME_CONTENT);
  const [aboutData, setAboutData] = useState<AboutCmsData>(DEFAULT_ABOUT_CONTENT);
  const [donationsData, setDonationsData] = useState<DonationsCmsData>(DEFAULT_DONATIONS_CONTENT);
  const [galleryData, setGalleryData] = useState<GalleryCmsData>(DEFAULT_GALLERY_CONTENT);
  const [contactData, setContactData] = useState<ContactCmsData>(DEFAULT_CONTACT_CONTENT);

  // Gallery items loaded from backend / fallback
  const [galleryItems, setGalleryItems] = useState<any[]>(INITIAL_GALLERY_ITEMS);
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({
    title: "",
    category: "Deities",
    imageUrl: "",
    capturedDate: new Date().toISOString().split("T")[0],
    displayOrder: 1
  });

  // UI status states
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "home-hero": true,
    "about-hero": true,
    "donations-hero": true,
    "gallery-header": true,
    "contact-info": true
  });

  // Fetch live CMS data on load
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    async function loadAllCms() {
      try {
        const [homeRes, aboutRes, donRes, galRes, conRes, itemsRes] = await Promise.allSettled([
          axios.get(`${apiUrl}/cms/pages/home`),
          axios.get(`${apiUrl}/cms/pages/about`),
          axios.get(`${apiUrl}/cms/pages/donations`),
          axios.get(`${apiUrl}/cms/pages/gallery`),
          axios.get(`${apiUrl}/cms/pages/contact`),
          axios.get(`${apiUrl}/cms/gallery`)
        ]);

        if (homeRes.status === "fulfilled" && homeRes.value.data?.data?.sections) {
          setHomeData(prev => ({ ...prev, ...homeRes.value.data.data.sections }));
        }
        if (aboutRes.status === "fulfilled" && aboutRes.value.data?.data?.sections) {
          setAboutData(prev => ({ ...prev, ...aboutRes.value.data.data.sections }));
        }
        if (donRes.status === "fulfilled" && donRes.value.data?.data?.sections) {
          setDonationsData(prev => ({ ...prev, ...donRes.value.data.data.sections }));
        }
        if (galRes.status === "fulfilled" && galRes.value.data?.data?.sections) {
          setGalleryData(prev => ({ ...prev, ...galRes.value.data.data.sections }));
        }
        if (conRes.status === "fulfilled" && conRes.value.data?.data?.sections) {
          setContactData(prev => ({ ...prev, ...conRes.value.data.data.sections }));
        }
        if (itemsRes.status === "fulfilled" && itemsRes.value.data?.data?.length > 0) {
          setGalleryItems(itemsRes.value.data.data);
        }
      } catch (err) {
        console.warn("Could not prefetch CMS database content, loaded static baseline.", err);
      }
    }

    loadAllCms();
  }, []);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSection = async (pageSlug: string, sectionKey: string, payload: any) => {
    const key = `${pageSlug}-${sectionKey}`;
    setSavingSection(key);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const res = await axios.put(
        `${apiUrl}/cms/pages/${pageSlug}/sections/${sectionKey}`,
        { contentJson: payload },
        { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      );

      if (res.data?.success) {
        setSaveSuccess(`"${sectionKey}" section on ${pageSlug.toUpperCase()} page saved successfully!`);
        setTimeout(() => setSaveSuccess(null), 4000);
      } else {
        throw new Error(res.data?.message || "Failed to save section");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.response?.data?.message || err.message || "Failed to save changes to database");
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSavingSection(null);
    }
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryPhoto.imageUrl || !newGalleryPhoto.title) {
      alert("Please provide both photo title and uploaded image");
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const res = await axios.post(`${apiUrl}/cms/gallery`, newGalleryPhoto, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });

      if (res.data?.success && res.data?.data) {
        setGalleryItems(prev => [res.data.data, ...prev]);
        setNewGalleryPhoto({
          title: "",
          category: "Deities",
          imageUrl: "",
          capturedDate: new Date().toISOString().split("T")[0],
          displayOrder: 1
        });
        setSaveSuccess("New photo published to public gallery successfully!");
        setTimeout(() => setSaveSuccess(null), 4000);
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to add gallery item");
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Are you sure you want to remove this photo from the gallery?")) return;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_access_token") : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      await axios.delete(`${apiUrl}/cms/gallery/${id}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });

      setGalleryItems(prev => prev.filter(item => item.id !== id));
      setSaveSuccess("Gallery photo removed successfully");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to delete gallery item");
    }
  };

  // Guard: Strictly Super Admin
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  if (!isSuperAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto font-poppins">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#2B132C]">
            Access Restricted to Super Admin
          </h2>
          <p className="text-stone-600 max-w-md mx-auto text-sm leading-relaxed">
            Only administrators with the <span className="font-semibold text-red-700">SUPER_ADMIN</span> role have permission to modify live website content, banners, and media.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto font-poppins pb-24 text-left">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#B47F35]/15 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B47F35]/10 border border-[#B47F35]/25 text-[#B47F35] text-xs font-semibold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Super Admin Content Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#2B132C]">
            Website Content Manager (CMS)
          </h1>
          <p className="text-xs sm:text-sm text-[#8B5E34]/80 mt-1 max-w-2xl">
            Live editor for public temple pages with Word-style formatting, direct AWS S3 image storage, and real-time preview.
          </p>
        </div>

        {/* Global Live Preview Links */}
        <div className="flex items-center gap-2">
          <a
            href={
              activeTab === "home"
                ? "/"
                : activeTab === "about"
                ? "/about"
                : activeTab === "donations"
                ? "/donations"
                : activeTab === "gallery"
                ? "/gallery"
                : "/contact"
            }
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl border border-[#B47F35]/40 bg-white hover:bg-[#FAF7F2] text-[#2B132C] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#B47F35]" />
            <span>View Live Page</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Toast Notification Banners */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}
      {saveError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 5 Page Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#B47F35]/15 pb-2">
        {[
          { key: "home", label: "Home Page (11 Sections)", icon: Home },
          { key: "about", label: "About Page (6 Sections)", icon: Info },
          { key: "donations", label: "Donations Page (6 Sections)", icon: Heart },
          { key: "gallery", label: "Gallery Media (3 Sections)", icon: ImageIcon },
          { key: "contact", label: "Contact & Desk (4 Sections)", icon: Phone }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#B47F35] to-[#8B5E34] text-white shadow-md shadow-[#B47F35]/20 scale-102"
                  : "bg-white text-stone-700 hover:text-[#2B132C] hover:bg-[#FAF7F2] border border-[#B47F35]/15"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: HOME PAGE (11 SECTIONS)                                           */}
      {/* ========================================================================= */}
      {activeTab === "home" && (
        <div className="space-y-6">
          {/* Section 1: Hero */}
          <SectionCard
            id="home-hero"
            title="1. Hero Banner Section"
            icon={Sparkles}
            isOpen={!!expandedSections["home-hero"]}
            onToggle={() => toggleSection("home-hero")}
            onSave={() => handleSaveSection("home", "hero", homeData.hero)}
            onReset={() => setHomeData(p => ({ ...p, hero: DEFAULT_HOME_CONTENT.hero }))}
            isSaving={savingSection === "home-hero"}
            saveLabel="Save Hero Banner"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge Text</label>
                <input
                  type="text"
                  value={homeData.hero.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, hero: { ...p.hero, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline Title</label>
                <input
                  type="text"
                  value={homeData.hero.title}
                  onChange={(e) => setHomeData(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <WordStyleEditor
              label="Hero Subtitle & Narrative (Word-Style Formatting)"
              value={homeData.hero.subtitle}
              onChange={(val) => setHomeData(p => ({ ...p, hero: { ...p.hero, subtitle: val } }))}
              minHeight="140px"
            />

            <ImageUploader
              label="Hero Background Banner (Upload to S3)"
              value={homeData.hero.bgImageUrl}
              onChange={(url) => setHomeData(p => ({ ...p, hero: { ...p.hero, bgImageUrl: url } }))}
              folder="cms/home"
              recommendedSize="1920x1080 (HD Background)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Primary CTA Label</label>
                <input
                  type="text"
                  value={homeData.hero.ctaPrimaryText}
                  onChange={(e) => setHomeData(p => ({ ...p, hero: { ...p.hero, ctaPrimaryText: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Primary CTA Link</label>
                <input
                  type="text"
                  value={homeData.hero.ctaPrimaryLink}
                  onChange={(e) => setHomeData(p => ({ ...p, hero: { ...p.hero, ctaPrimaryLink: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Secondary CTA Label</label>
                <input
                  type="text"
                  value={homeData.hero.ctaSecondaryText}
                  onChange={(e) => setHomeData(p => ({ ...p, hero: { ...p.hero, ctaSecondaryText: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-600 block mb-1">Secondary CTA Link</label>
                <input
                  type="text"
                  value={homeData.hero.ctaSecondaryLink}
                  onChange={(e) => setHomeData(p => ({ ...p, hero: { ...p.hero, ctaSecondaryLink: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-xs"
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Intro */}
          <SectionCard
            id="home-intro"
            title="2. About Mandir Introduction Section"
            icon={Info}
            isOpen={!!expandedSections["home-intro"]}
            onToggle={() => toggleSection("home-intro")}
            onSave={() => handleSaveSection("home", "intro", homeData.intro)}
            onReset={() => setHomeData(p => ({ ...p, intro: DEFAULT_HOME_CONTENT.intro }))}
            isSaving={savingSection === "home-intro"}
            saveLabel="Save Intro Section"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.intro.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, intro: { ...p.intro, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Title Headline</label>
                <input
                  type="text"
                  value={homeData.intro.title}
                  onChange={(e) => setHomeData(p => ({ ...p, intro: { ...p.intro, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <WordStyleEditor
              label="Mandir Story & Introduction (Word-Style Formatting)"
              value={homeData.intro.description}
              onChange={(val) => setHomeData(p => ({ ...p, intro: { ...p.intro, description: val } }))}
              minHeight="140px"
            />

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-[#2B132C]">4 Core Sanctum Pillars</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {homeData.intro.coreItems.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...homeData.intro.coreItems];
                        updated[idx].title = e.target.value;
                        setHomeData(p => ({ ...p, intro: { ...p.intro, coreItems: updated } }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                      placeholder="Title"
                    />
                    <textarea
                      rows={2}
                      value={item.desc}
                      onChange={(e) => {
                        const updated = [...homeData.intro.coreItems];
                        updated[idx].desc = e.target.value;
                        setHomeData(p => ({ ...p, intro: { ...p.intro, coreItems: updated } }));
                      }}
                      className="w-full p-2 rounded-lg border border-stone-300 text-xs"
                      placeholder="Description"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Section 3: Services */}
          <SectionCard
            id="home-services"
            title="3. SaaS-Grade Quick Services Section"
            icon={Zap}
            isOpen={!!expandedSections["home-services"]}
            onToggle={() => toggleSection("home-services")}
            onSave={() => handleSaveSection("home", "services", homeData.services)}
            onReset={() => setHomeData(p => ({ ...p, services: DEFAULT_HOME_CONTENT.services }))}
            isSaving={savingSection === "home-services"}
            saveLabel="Save Services Header"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.services.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, services: { ...p.services, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={homeData.services.title}
                  onChange={(e) => setHomeData(p => ({ ...p, services: { ...p.services, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={homeData.services.subtitle}
                onChange={(e) => setHomeData(p => ({ ...p, services: { ...p.services, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 4: Timings */}
          <SectionCard
            id="home-timings"
            title="4. Darshan & Daily Aarti Timings Section"
            icon={Clock}
            isOpen={!!expandedSections["home-timings"]}
            onToggle={() => toggleSection("home-timings")}
            onSave={() => handleSaveSection("home", "timings", homeData.timings)}
            onReset={() => setHomeData(p => ({ ...p, timings: DEFAULT_HOME_CONTENT.timings }))}
            isSaving={savingSection === "home-timings"}
            saveLabel="Save Timings Section"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Morning Hours</label>
                <input
                  type="text"
                  value={homeData.timings.morningHours}
                  onChange={(e) => setHomeData(p => ({ ...p, timings: { ...p.timings, morningHours: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Evening Hours</label>
                <input
                  type="text"
                  value={homeData.timings.eveningHours}
                  onChange={(e) => setHomeData(p => ({ ...p, timings: { ...p.timings, eveningHours: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
            </div>

            {/* Daily Aartis Array Repeater */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-[#2B132C]">Daily Aarti Schedule</label>
                <button
                  type="button"
                  onClick={() => setHomeData(p => ({
                    ...p,
                    timings: {
                      ...p.timings,
                      aartis: [...p.timings.aartis, { time: "12:00 PM", name: "Rajbhog Aarti" }]
                    }
                  }))}
                  className="text-xs text-[#B47F35] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Aarti</span>
                </button>
              </div>

              <div className="space-y-2">
                {homeData.timings.aartis.map((aarti, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <input
                      type="text"
                      value={aarti.time}
                      onChange={(e) => {
                        const updated = [...homeData.timings.aartis];
                        updated[idx].time = e.target.value;
                        setHomeData(p => ({ ...p, timings: { ...p.timings, aartis: updated } }));
                      }}
                      placeholder="6:00 AM"
                      className="w-36 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={aarti.name}
                      onChange={(e) => {
                        const updated = [...homeData.timings.aartis];
                        updated[idx].name = e.target.value;
                        setHomeData(p => ({ ...p, timings: { ...p.timings, aartis: updated } }));
                      }}
                      placeholder="Aarti Name"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = homeData.timings.aartis.filter((_, i) => i !== idx);
                        setHomeData(p => ({ ...p, timings: { ...p.timings, aartis: updated } }));
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Sanctum Guidelines</label>
              <textarea
                rows={2}
                value={homeData.timings.guidelines}
                onChange={(e) => setHomeData(p => ({ ...p, timings: { ...p.timings, guidelines: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 5: Festivals (API CONNECTED) */}
          <SectionCard
            id="home-festivals"
            title="5. Upcoming Festivals & Celebrations"
            icon={Calendar}
            isOpen={!!expandedSections["home-festivals"]}
            onToggle={() => toggleSection("home-festivals")}
            onSave={() => handleSaveSection("home", "festivals", homeData.festivals)}
            onReset={() => setHomeData(p => ({ ...p, festivals: DEFAULT_HOME_CONTENT.festivals }))}
            isSaving={savingSection === "home-festivals"}
            saveLabel="Save Festivals Header"
            apiConnectedNotice="Connected to Temple Events API — The live event cards and festival dates are dynamically managed by the Events system. Customize the section badge, headline, and framing copy below."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.festivals.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, festivals: { ...p.festivals, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={homeData.festivals.title}
                  onChange={(e) => setHomeData(p => ({ ...p, festivals: { ...p.festivals, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={homeData.festivals.subtitle}
                onChange={(e) => setHomeData(p => ({ ...p, festivals: { ...p.festivals, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 6: Live Darshan */}
          <SectionCard
            id="home-live-darshan"
            title="6. Virtual Shrine & Live Darshan Section"
            icon={Tv}
            isOpen={!!expandedSections["home-live-darshan"]}
            onToggle={() => toggleSection("home-live-darshan")}
            onSave={() => handleSaveSection("home", "live_darshan", homeData.live_darshan)}
            onReset={() => setHomeData(p => ({ ...p, live_darshan: DEFAULT_HOME_CONTENT.live_darshan }))}
            isSaving={savingSection === "home-live-darshan"}
            saveLabel="Save Live Darshan"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.live_darshan.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, live_darshan: { ...p.live_darshan, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Section Title</label>
                <input
                  type="text"
                  value={homeData.live_darshan.title}
                  onChange={(e) => setHomeData(p => ({ ...p, live_darshan: { ...p.live_darshan, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Stream Broadcast Title</label>
                <input
                  type="text"
                  value={homeData.live_darshan.streamTitle}
                  onChange={(e) => setHomeData(p => ({ ...p, live_darshan: { ...p.live_darshan, streamTitle: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">YouTube Embed Stream URL</label>
                <input
                  type="text"
                  value={homeData.live_darshan.liveStreamUrl}
                  onChange={(e) => setHomeData(p => ({ ...p, live_darshan: { ...p.live_darshan, liveStreamUrl: e.target.value } }))}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                id="isLiveCheckbox"
                checked={homeData.live_darshan.isLive}
                onChange={(e) => setHomeData(p => ({ ...p, live_darshan: { ...p.live_darshan, isLive: e.target.checked } }))}
                className="w-4 h-4 accent-[#B47F35]"
              />
              <label htmlFor="isLiveCheckbox" className="text-xs font-bold text-[#2B132C] cursor-pointer">
                Show Live Broadcast Badge (Devotees see red "LIVE DARSHAN" blinking pulse)
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Broadcast Schedule Note</label>
              <textarea
                rows={2}
                value={homeData.live_darshan.scheduleNote}
                onChange={(e) => setHomeData(p => ({ ...p, live_darshan: { ...p.live_darshan, scheduleNote: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 7: Hall Showcase (API CONNECTED) */}
          <SectionCard
            id="home-hall"
            title="7. Shree Swaminarayan Community Hall Showcase"
            icon={Building}
            isOpen={!!expandedSections["home-hall"]}
            onToggle={() => toggleSection("home-hall")}
            onSave={() => handleSaveSection("home", "hall_showcase", homeData.hall_showcase)}
            onReset={() => setHomeData(p => ({ ...p, hall_showcase: DEFAULT_HOME_CONTENT.hall_showcase }))}
            isSaving={savingSection === "home-hall"}
            saveLabel="Save Hall Showcase"
            apiConnectedNotice="Connected to Hall Booking & Calculator API — Dynamic pricing formulas, calendar availability, and booking forms stay connected to the Hall module. Framing copy is editable below."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.hall_showcase.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, hall_showcase: { ...p.hall_showcase, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={homeData.hall_showcase.title}
                  onChange={(e) => setHomeData(p => ({ ...p, hall_showcase: { ...p.hall_showcase, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle Description</label>
              <textarea
                rows={2}
                value={homeData.hall_showcase.subtitle}
                onChange={(e) => setHomeData(p => ({ ...p, hall_showcase: { ...p.hall_showcase, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Capacity / Hall Highlight Text</label>
              <input
                type="text"
                value={homeData.hall_showcase.capacityText}
                onChange={(e) => setHomeData(p => ({ ...p, hall_showcase: { ...p.hall_showcase, capacityText: e.target.value } }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 8: Gallery Highlight (API CONNECTED) */}
          <SectionCard
            id="home-gallery-highlight"
            title="8. Temple Gallery Highlights Section"
            icon={ImageIcon}
            isOpen={!!expandedSections["home-gallery-highlight"]}
            onToggle={() => toggleSection("home-gallery-highlight")}
            onSave={() => handleSaveSection("home", "gallery_highlight", homeData.gallery_highlight)}
            onReset={() => setHomeData(p => ({ ...p, gallery_highlight: DEFAULT_HOME_CONTENT.gallery_highlight }))}
            isSaving={savingSection === "home-gallery-highlight"}
            saveLabel="Save Gallery Highlights"
            apiConnectedNotice="Connected to Media Gallery API — Photos feed dynamically from the Gallery Media module. Header framing copy is editable below."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.gallery_highlight.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, gallery_highlight: { ...p.gallery_highlight, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={homeData.gallery_highlight.title}
                  onChange={(e) => setHomeData(p => ({ ...p, gallery_highlight: { ...p.gallery_highlight, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={homeData.gallery_highlight.subtitle}
                onChange={(e) => setHomeData(p => ({ ...p, gallery_highlight: { ...p.gallery_highlight, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 9: Mobile App */}
          <SectionCard
            id="home-mobile-app"
            title="9. Mandir Mobile App & Download QR Code Section"
            icon={Phone}
            isOpen={!!expandedSections["home-mobile-app"]}
            onToggle={() => toggleSection("home-mobile-app")}
            onSave={() => handleSaveSection("home", "mobile_app", homeData.mobile_app)}
            onReset={() => setHomeData(p => ({ ...p, mobile_app: DEFAULT_HOME_CONTENT.mobile_app }))}
            isSaving={savingSection === "home-mobile-app"}
            saveLabel="Save Mobile App Section"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.mobile_app.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={homeData.mobile_app.title}
                  onChange={(e) => setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <WordStyleEditor
              label="App Description & Store Appeal (Word-Style Formatting)"
              value={homeData.mobile_app.description}
              onChange={(val) => setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, description: val } }))}
              minHeight="120px"
            />

            {/* Store Download Links & QR Code Management */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-4">
              <h4 className="text-xs font-bold uppercase text-[#2B132C] flex items-center gap-2">
                <span>📱 App Store & QR Code Download Settings</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">
                    Google Play Store URL
                  </label>
                  <input
                    type="text"
                    value={homeData.mobile_app.googlePlayUrl || ""}
                    onChange={(e) => setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, googlePlayUrl: e.target.value } }))}
                    placeholder="https://play.google.com/store/apps/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">
                    Apple App Store URL
                  </label>
                  <input
                    type="text"
                    value={homeData.mobile_app.appStoreUrl || ""}
                    onChange={(e) => setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, appStoreUrl: e.target.value } }))}
                    placeholder="https://apps.apple.com/app/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-mono bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">
                    QR Code Button Label
                  </label>
                  <input
                    type="text"
                    value={homeData.mobile_app.qrCodeLabel || ""}
                    onChange={(e) => setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, qrCodeLabel: e.target.value } }))}
                    placeholder="Scan to Download App"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm bg-white"
                  />
                </div>
                <div>
                  <ImageUploader
                    label="QR Code Image File (Upload to S3)"
                    value={homeData.mobile_app.qrCodeImageUrl || ""}
                    onChange={(url) => setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, qrCodeImageUrl: url } }))}
                    folder="cms/mobile_app"
                    recommendedSize="500x500 (Square QR Code Image)"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-[#2B132C]">4 Key Mobile App Features</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {homeData.mobile_app.features.map((feat, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => {
                        const updated = [...homeData.mobile_app.features];
                        updated[idx].title = e.target.value;
                        setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, features: updated } }));
                      }}
                      className="w-full px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-bold"
                      placeholder="Title"
                    />
                    <textarea
                      rows={2}
                      value={feat.desc}
                      onChange={(e) => {
                        const updated = [...homeData.mobile_app.features];
                        updated[idx].desc = e.target.value;
                        setHomeData(p => ({ ...p, mobile_app: { ...p.mobile_app, features: updated } }));
                      }}
                      className="w-full p-2 rounded-lg border border-stone-300 text-xs"
                      placeholder="Description"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Section 10: Testimonials */}
          <SectionCard
            id="home-testimonials"
            title="10. Devotee Voices & Dynamic Testimonials Section"
            icon={UserCheck}
            isOpen={!!expandedSections["home-testimonials"]}
            onToggle={() => toggleSection("home-testimonials")}
            onSave={() => handleSaveSection("home", "testimonials", homeData.testimonials)}
            onReset={() => setHomeData(p => ({ ...p, testimonials: DEFAULT_HOME_CONTENT.testimonials }))}
            isSaving={savingSection === "home-testimonials"}
            saveLabel="Save All Testimonials"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.testimonials.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={homeData.testimonials.title}
                  onChange={(e) => setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={homeData.testimonials.subtitle}
                onChange={(e) => setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>

            {/* Dynamic Testimonials List Manager */}
            <div className="space-y-4 pt-4 border-t border-[#B47F35]/15">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#2B132C]">
                    Dynamic Devotee Testimonials ({(homeData.testimonials.items || []).length})
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Controls the auto-scrolling Swiper carousel on the public website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const items = homeData.testimonials.items || [];
                    const newItem = {
                      id: `test-${Date.now()}`,
                      name: "Devotee Name",
                      location: "Kampala, Uganda",
                      rating: 5,
                      quote: "Write devotee experience here...",
                      avatar: ""
                    };
                    setHomeData(p => ({
                      ...p,
                      testimonials: {
                        ...p.testimonials,
                        items: [newItem, ...items]
                      }
                    }));
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#B47F35]/10 hover:bg-[#B47F35]/20 text-[#B47F35] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Testimonial</span>
                </button>
              </div>

              <div className="space-y-4">
                {(homeData.testimonials.items || []).map((t, idx) => (
                  <div key={t.id || idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 flex-1">
                        <span className="w-6 h-6 rounded-full bg-[#B47F35]/10 text-[#B47F35] text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const updated = [...(homeData.testimonials.items || [])];
                            updated[idx].name = e.target.value;
                            setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, items: updated } }));
                          }}
                          placeholder="Devotee Name"
                          className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                        />
                        <input
                          type="text"
                          value={t.location}
                          onChange={(e) => {
                            const updated = [...(homeData.testimonials.items || [])];
                            updated[idx].location = e.target.value;
                            setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, items: updated } }));
                          }}
                          placeholder="Location / Member Title"
                          className="w-48 px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                        />
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] uppercase font-bold text-stone-500">Rating:</label>
                          <select
                            value={t.rating || 5}
                            onChange={(e) => {
                              const updated = [...(homeData.testimonials.items || [])];
                              updated[idx].rating = parseInt(e.target.value);
                              setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, items: updated } }));
                            }}
                            className="px-2 py-1 rounded-lg border border-stone-300 text-xs bg-white font-bold"
                          >
                            <option value={5}>5 ★</option>
                            <option value={4}>4 ★</option>
                            <option value={3}>3 ★</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (homeData.testimonials.items || []).filter((_, i) => i !== idx);
                          setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, items: updated } }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Remove Testimonial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">Testimonial Quote</label>
                      <textarea
                        rows={2}
                        value={t.quote}
                        onChange={(e) => {
                          const updated = [...(homeData.testimonials.items || [])];
                          updated[idx].quote = e.target.value;
                          setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, items: updated } }));
                        }}
                        className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white"
                        placeholder="Testimonial text..."
                      />
                    </div>

                    <ImageUploader
                      label="Devotee Avatar / Photo (Upload to S3)"
                      value={t.avatar || ""}
                      onChange={(url) => {
                        const updated = [...(homeData.testimonials.items || [])];
                        updated[idx].avatar = url;
                        setHomeData(p => ({ ...p, testimonials: { ...p.testimonials, items: updated } }));
                      }}
                      folder="cms/testimonials"
                      recommendedSize="150x150 (Square Avatar)"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Section 11: Latest News / Blog Management */}
          <SectionCard
            id="home-latest-news"
            title="11. Mandir Bulletins & Blog Management Section"
            icon={Globe}
            isOpen={!!expandedSections["home-latest-news"]}
            onToggle={() => toggleSection("home-latest-news")}
            onSave={() => handleSaveSection("home", "latest_news", homeData.latest_news)}
            onReset={() => setHomeData(p => ({ ...p, latest_news: DEFAULT_HOME_CONTENT.latest_news }))}
            isSaving={savingSection === "home-latest-news"}
            saveLabel="Save Blog & Bulletins"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={homeData.latest_news.badge}
                  onChange={(e) => setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={homeData.latest_news.title}
                  onChange={(e) => setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={homeData.latest_news.subtitle}
                onChange={(e) => setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>

            {/* Dynamic Blog / Articles Manager */}
            <div className="space-y-4 pt-4 border-t border-[#B47F35]/15">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#2B132C]">
                    Published Blog & News Articles ({(homeData.latest_news.articles || []).length})
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Powers the responsive Swiper auto-scroller with left/right buttons on the public website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const articles = homeData.latest_news.articles || [];
                    const newArticle = {
                      id: `news-${Date.now()}`,
                      title: "New Temple Announcement or Article",
                      excerpt: "Brief summary excerpt for devotees...",
                      content: "Full blog article content...",
                      publishedDate: new Date().toISOString().split("T")[0],
                      category: "Announcement",
                      imageUrl: ""
                    };
                    setHomeData(p => ({
                      ...p,
                      latest_news: {
                        ...p.latest_news,
                        articles: [newArticle, ...articles]
                      }
                    }));
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#B47F35]/10 hover:bg-[#B47F35]/20 text-[#B47F35] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Article</span>
                </button>
              </div>

              <div className="space-y-4">
                {(homeData.latest_news.articles || []).map((art, idx) => (
                  <div key={art.id || idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 flex-1">
                        <span className="w-6 h-6 rounded-full bg-[#B47F35]/10 text-[#B47F35] text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={art.title}
                          onChange={(e) => {
                            const updated = [...(homeData.latest_news.articles || [])];
                            updated[idx].title = e.target.value;
                            setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, articles: updated } }));
                          }}
                          placeholder="Article Title"
                          className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                        />
                        <select
                          value={art.category}
                          onChange={(e) => {
                            const updated = [...(homeData.latest_news.articles || [])];
                            updated[idx].category = e.target.value;
                            setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, articles: updated } }));
                          }}
                          className="w-36 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white font-semibold"
                        >
                          <option value="Announcement">Announcement</option>
                          <option value="Festival">Festival</option>
                          <option value="Community">Community</option>
                          <option value="Seva">Seva</option>
                        </select>
                        <input
                          type="date"
                          value={art.publishedDate}
                          onChange={(e) => {
                            const updated = [...(homeData.latest_news.articles || [])];
                            updated[idx].publishedDate = e.target.value;
                            setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, articles: updated } }));
                          }}
                          className="w-36 px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (homeData.latest_news.articles || []).filter((_, i) => i !== idx);
                          setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, articles: updated } }));
                        }}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Remove Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">Summary Excerpt</label>
                      <textarea
                        rows={2}
                        value={art.excerpt}
                        onChange={(e) => {
                          const updated = [...(homeData.latest_news.articles || [])];
                          updated[idx].excerpt = e.target.value;
                          setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, articles: updated } }));
                        }}
                        className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-white"
                        placeholder="Brief excerpt..."
                      />
                    </div>

                    <ImageUploader
                      label="Article Cover Image (Upload to S3)"
                      value={art.imageUrl || ""}
                      onChange={(url) => {
                        const updated = [...(homeData.latest_news.articles || [])];
                        updated[idx].imageUrl = url;
                        setHomeData(p => ({ ...p, latest_news: { ...p.latest_news, articles: updated } }));
                      }}
                      folder="cms/news"
                      recommendedSize="800x500 (Landscape Cover Image)"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: ABOUT PAGE (6 SECTIONS)                                           */}
      {/* ========================================================================= */}
      {activeTab === "about" && (
        <div className="space-y-6">
          {/* Section 1: Hero & Heritage */}
          <SectionCard
            id="about-hero"
            title="1. About Mandir Hero & Showcase Section"
            icon={Info}
            isOpen={!!expandedSections["about-hero"]}
            onToggle={() => toggleSection("about-hero")}
            onSave={() => handleSaveSection("about", "hero", aboutData.hero)}
            onReset={() => setAboutData(p => ({ ...p, hero: DEFAULT_ABOUT_CONTENT.hero }))}
            isSaving={savingSection === "about-hero"}
            saveLabel="Save About Hero"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={aboutData.hero.badge}
                  onChange={(e) => setAboutData(p => ({ ...p, hero: { ...p.hero, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={aboutData.hero.title}
                  onChange={(e) => setAboutData(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <WordStyleEditor
              label="Heritage Narrative Story (Word Editor with Preview)"
              value={aboutData.hero.description}
              onChange={(val) => setAboutData(p => ({ ...p, hero: { ...p.hero, description: val } }))}
              minHeight="160px"
            />

            <ImageUploader
              label="Arched Showcase Temple Image (Upload to S3)"
              value={aboutData.hero.showcaseImage}
              onChange={(url) => setAboutData(p => ({ ...p, hero: { ...p.hero, showcaseImage: url } }))}
              folder="cms/about"
              recommendedSize="800x1000 (Vertical Arched Photo)"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge Pill 1</label>
                <input
                  type="text"
                  value={aboutData.hero.badge1Text}
                  onChange={(e) => setAboutData(p => ({ ...p, hero: { ...p.hero, badge1Text: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge Pill 2</label>
                <input
                  type="text"
                  value={aboutData.hero.badge2Text}
                  onChange={(e) => setAboutData(p => ({ ...p, hero: { ...p.hero, badge2Text: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-xs"
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Purpose & Pillars */}
          <SectionCard
            id="about-purpose"
            title="2. Mission, Vision & Spiritual Pillars"
            icon={Sparkles}
            isOpen={!!expandedSections["about-purpose"]}
            onToggle={() => toggleSection("about-purpose")}
            onSave={() => handleSaveSection("about", "purpose", aboutData.purpose)}
            onReset={() => setAboutData(p => ({ ...p, purpose: DEFAULT_ABOUT_CONTENT.purpose }))}
            isSaving={savingSection === "about-purpose"}
            saveLabel="Save Purpose & Pillars"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Section Title</label>
                <input
                  type="text"
                  value={aboutData.purpose.sectionTitle}
                  onChange={(e) => setAboutData(p => ({ ...p, purpose: { ...p.purpose, sectionTitle: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={aboutData.purpose.subtitle}
                  onChange={(e) => setAboutData(p => ({ ...p, purpose: { ...p.purpose, subtitle: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Mission Description</label>
                <textarea
                  rows={3}
                  value={aboutData.purpose.missionDesc}
                  onChange={(e) => setAboutData(p => ({ ...p, purpose: { ...p.purpose, missionDesc: e.target.value } }))}
                  className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Vision Description</label>
                <textarea
                  rows={3}
                  value={aboutData.purpose.visionDesc}
                  onChange={(e) => setAboutData(p => ({ ...p, purpose: { ...p.purpose, visionDesc: e.target.value } }))}
                  className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Core Values (Comma Separated)</label>
                <input
                  type="text"
                  value={aboutData.purpose.valuesList.join(", ")}
                  onChange={(e) => setAboutData(p => ({
                    ...p,
                    purpose: { ...p.purpose, valuesList: e.target.value.split(",").map(s => s.trim()) }
                  }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Commitment Statement</label>
                <textarea
                  rows={2}
                  value={aboutData.purpose.commitmentDesc}
                  onChange={(e) => setAboutData(p => ({ ...p, purpose: { ...p.purpose, commitmentDesc: e.target.value } }))}
                  className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 3: Metrics */}
          <SectionCard
            id="about-metrics"
            title="3. Temple Statistics & Devotee Counters Bar"
            icon={ShieldCheck}
            isOpen={!!expandedSections["about-metrics"]}
            onToggle={() => toggleSection("about-metrics")}
            onSave={() => handleSaveSection("about", "metrics", aboutData.metrics)}
            onReset={() => setAboutData(p => ({ ...p, metrics: DEFAULT_ABOUT_CONTENT.metrics }))}
            isSaving={savingSection === "about-metrics"}
            saveLabel="Save Temple Counters"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutData.metrics.stats.map((stat, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-600 block mb-0.5">Counter Number</label>
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => {
                        const updated = [...aboutData.metrics.stats];
                        updated[idx].number = e.target.value;
                        setAboutData(p => ({ ...p, metrics: { ...p.metrics, stats: updated } }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-sm font-bold text-[#B47F35]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-600 block mb-0.5">Title</label>
                    <input
                      type="text"
                      value={stat.title}
                      onChange={(e) => {
                        const updated = [...aboutData.metrics.stats];
                        updated[idx].title = e.target.value;
                        setAboutData(p => ({ ...p, metrics: { ...p.metrics, stats: updated } }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-600 block mb-0.5">Subtitle</label>
                    <input
                      type="text"
                      value={stat.subtitle}
                      onChange={(e) => {
                        const updated = [...aboutData.metrics.stats];
                        updated[idx].subtitle = e.target.value;
                        setAboutData(p => ({ ...p, metrics: { ...p.metrics, stats: updated } }));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Section 4: Story & Timeline */}
          <SectionCard
            id="about-story"
            title="4. Temple Historical Journey & Milestones"
            icon={Clock}
            isOpen={!!expandedSections["about-story"]}
            onToggle={() => toggleSection("about-story")}
            onSave={() => handleSaveSection("about", "story", aboutData.story)}
            onReset={() => setAboutData(p => ({ ...p, story: DEFAULT_ABOUT_CONTENT.story }))}
            isSaving={savingSection === "about-story"}
            saveLabel="Save Story & Timeline"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={aboutData.story.badge}
                  onChange={(e) => setAboutData(p => ({ ...p, story: { ...p.story, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={aboutData.story.title}
                  onChange={(e) => setAboutData(p => ({ ...p, story: { ...p.story, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <WordStyleEditor
              label="Story Narrative - Paragraph 1"
              value={aboutData.story.p1}
              onChange={(val) => setAboutData(p => ({ ...p, story: { ...p.story, p1: val } }))}
              minHeight="100px"
            />

            <WordStyleEditor
              label="Story Narrative - Paragraph 2"
              value={aboutData.story.p2}
              onChange={(val) => setAboutData(p => ({ ...p, story: { ...p.story, p2: val } }))}
              minHeight="100px"
            />

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-[#2B132C]">Historical Milestones</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aboutData.story.milestones.map((m, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={m.year}
                        onChange={(e) => {
                          const updated = [...aboutData.story.milestones];
                          updated[idx].year = e.target.value;
                          setAboutData(p => ({ ...p, story: { ...p.story, milestones: updated } }));
                        }}
                        className="w-28 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-[#B47F35]"
                        placeholder="Year"
                      />
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => {
                          const updated = [...aboutData.story.milestones];
                          updated[idx].title = e.target.value;
                          setAboutData(p => ({ ...p, story: { ...p.story, milestones: updated } }));
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                        placeholder="Milestone Title"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={m.desc}
                      onChange={(e) => {
                        const updated = [...aboutData.story.milestones];
                        updated[idx].desc = e.target.value;
                        setAboutData(p => ({ ...p, story: { ...p.story, milestones: updated } }));
                      }}
                      className="w-full p-2 rounded-lg border border-stone-300 text-xs"
                      placeholder="Description"
                    />
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Section 5: Offers */}
          <SectionCard
            id="about-offers"
            title="5. What We Offer Services Grid"
            icon={Zap}
            isOpen={!!expandedSections["about-offers"]}
            onToggle={() => toggleSection("about-offers")}
            onSave={() => handleSaveSection("about", "offers", aboutData.offers)}
            onReset={() => setAboutData(p => ({ ...p, offers: DEFAULT_ABOUT_CONTENT.offers }))}
            isSaving={savingSection === "about-offers"}
            saveLabel="Save What We Offer"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={aboutData.offers.badge}
                  onChange={(e) => setAboutData(p => ({ ...p, offers: { ...p.offers, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={aboutData.offers.title}
                  onChange={(e) => setAboutData(p => ({ ...p, offers: { ...p.offers, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={aboutData.offers.subtitle}
                onChange={(e) => setAboutData(p => ({ ...p, offers: { ...p.offers, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 6: Testimonials */}
          <SectionCard
            id="about-testimonials"
            title="6. What Devotees Say Section Header"
            icon={UserCheck}
            isOpen={!!expandedSections["about-testimonials"]}
            onToggle={() => toggleSection("about-testimonials")}
            onSave={() => handleSaveSection("about", "testimonials", aboutData.testimonials)}
            onReset={() => setAboutData(p => ({ ...p, testimonials: DEFAULT_ABOUT_CONTENT.testimonials }))}
            isSaving={savingSection === "about-testimonials"}
            saveLabel="Save Testimonials Header"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={aboutData.testimonials.badge}
                  onChange={(e) => setAboutData(p => ({ ...p, testimonials: { ...p.testimonials, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={aboutData.testimonials.title}
                  onChange={(e) => setAboutData(p => ({ ...p, testimonials: { ...p.testimonials, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: DONATIONS PAGE (6 SECTIONS)                                       */}
      {/* ========================================================================= */}
      {activeTab === "donations" && (
        <div className="space-y-6">
          {/* Section 1: Hero */}
          <SectionCard
            id="donations-hero"
            title="1. Donations Hero Appeal Banner"
            icon={Heart}
            isOpen={!!expandedSections["donations-hero"]}
            onToggle={() => toggleSection("donations-hero")}
            onSave={() => handleSaveSection("donations", "hero", donationsData.hero)}
            onReset={() => setDonationsData(p => ({ ...p, hero: DEFAULT_DONATIONS_CONTENT.hero }))}
            isSaving={savingSection === "donations-hero"}
            saveLabel="Save Donation Hero"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={donationsData.hero.badge}
                  onChange={(e) => setDonationsData(p => ({ ...p, hero: { ...p.hero, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={donationsData.hero.title}
                  onChange={(e) => setDonationsData(p => ({ ...p, hero: { ...p.hero, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <WordStyleEditor
              label="Donation Appeal Copy (Word-Style Formatting)"
              value={donationsData.hero.description}
              onChange={(val) => setDonationsData(p => ({ ...p, hero: { ...p.hero, description: val } }))}
              minHeight="120px"
            />

            <ImageUploader
              label="Donations Sacred Banner (Upload to S3)"
              value={donationsData.hero.bgImageUrl}
              onChange={(url) => setDonationsData(p => ({ ...p, hero: { ...p.hero, bgImageUrl: url } }))}
              folder="cms/donations"
            />
          </SectionCard>

          {/* Section 2: Donation Form Header (API CONNECTED) */}
          <SectionCard
            id="donations-form"
            title="2. Online Sacred Seva Portal Form Header"
            icon={Building}
            isOpen={!!expandedSections["donations-form"]}
            onToggle={() => toggleSection("donations-form")}
            onSave={() => handleSaveSection("donations", "donation_form", donationsData.donation_form)}
            onReset={() => setDonationsData(p => ({ ...p, donation_form: DEFAULT_DONATIONS_CONTENT.donation_form }))}
            isSaving={savingSection === "donations-form"}
            saveLabel="Save Form Header"
            apiConnectedNotice="Connected to Payment Gateway & Ledger API — Payment processing, donor receipt PDF generation, and currency transactions remain securely managed by the payment engine. Form title and security badges are editable below."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={donationsData.donation_form.badge}
                  onChange={(e) => setDonationsData(p => ({ ...p, donation_form: { ...p.donation_form, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Form Title</label>
                <input
                  type="text"
                  value={donationsData.donation_form.title}
                  onChange={(e) => setDonationsData(p => ({ ...p, donation_form: { ...p.donation_form, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={donationsData.donation_form.subtitle}
                onChange={(e) => setDonationsData(p => ({ ...p, donation_form: { ...p.donation_form, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 3: Causes */}
          <SectionCard
            id="donations-causes"
            title="3. Sacred Sevas & Impact Causes Grid"
            icon={Sparkles}
            isOpen={!!expandedSections["donations-causes"]}
            onToggle={() => toggleSection("donations-causes")}
            onSave={() => handleSaveSection("donations", "causes", donationsData.causes)}
            onReset={() => setDonationsData(p => ({ ...p, causes: DEFAULT_DONATIONS_CONTENT.causes }))}
            isSaving={savingSection === "donations-causes"}
            saveLabel="Save Impact Causes"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Section Headline</label>
                <input
                  type="text"
                  value={donationsData.causes.title}
                  onChange={(e) => setDonationsData(p => ({ ...p, causes: { ...p.causes, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={donationsData.causes.subtitle}
                  onChange={(e) => setDonationsData(p => ({ ...p, causes: { ...p.causes, subtitle: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-xs font-bold uppercase text-[#2B132C]">Impact Seva Campaigns ({donationsData.causes.causes.length})</label>
              <div className="space-y-3">
                {donationsData.causes.causes.map((c, idx) => (
                  <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">Campaign Title</label>
                      <input
                        type="text"
                        value={c.title}
                        onChange={(e) => {
                          const updated = [...donationsData.causes.causes];
                          updated[idx].title = e.target.value;
                          setDonationsData(p => ({ ...p, causes: { ...p.causes, causes: updated } }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">Description</label>
                      <input
                        type="text"
                        value={c.desc}
                        onChange={(e) => {
                          const updated = [...donationsData.causes.causes];
                          updated[idx].desc = e.target.value;
                          setDonationsData(p => ({ ...p, causes: { ...p.causes, causes: updated } }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">Rate Label</label>
                      <input
                        type="text"
                        value={c.rateText}
                        onChange={(e) => {
                          const updated = [...donationsData.causes.causes];
                          updated[idx].rateText = e.target.value;
                          setDonationsData(p => ({ ...p, causes: { ...p.causes, causes: updated } }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-[#B47F35]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">Image URL</label>
                      <input
                        type="text"
                        value={c.img}
                        onChange={(e) => {
                          const updated = [...donationsData.causes.causes];
                          updated[idx].img = e.target.value;
                          setDonationsData(p => ({ ...p, causes: { ...p.causes, causes: updated } }));
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Section 4: Recent Donors (API CONNECTED) */}
          <SectionCard
            id="donations-recent-donors"
            title="4. Recent Donors Wall of Honor"
            icon={UserCheck}
            isOpen={!!expandedSections["donations-recent-donors"]}
            onToggle={() => toggleSection("donations-recent-donors")}
            onSave={() => handleSaveSection("donations", "recent_donors", donationsData.recent_donors)}
            onReset={() => setDonationsData(p => ({ ...p, recent_donors: DEFAULT_DONATIONS_CONTENT.recent_donors }))}
            isSaving={savingSection === "donations-recent-donors"}
            saveLabel="Save Donors Header"
            apiConnectedNotice="Connected to Devotee Ledger API — Verified donor contributions stream automatically in real-time from the database ledger. Framing title and button text are editable below."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Section Title</label>
                <input
                  type="text"
                  value={donationsData.recent_donors.title}
                  onChange={(e) => setDonationsData(p => ({ ...p, recent_donors: { ...p.recent_donors, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">View All Button Text</label>
                <input
                  type="text"
                  value={donationsData.recent_donors.viewAllText}
                  onChange={(e) => setDonationsData(p => ({ ...p, recent_donors: { ...p.recent_donors, viewAllText: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 5: Bank Details */}
          <SectionCard
            id="donations-bank"
            title="5. Temple Bank & Mobile Money Details"
            icon={Globe}
            isOpen={!!expandedSections["donations-bank"]}
            onToggle={() => toggleSection("donations-bank")}
            onSave={() => handleSaveSection("donations", "bank_details", donationsData.bank_details)}
            onReset={() => setDonationsData(p => ({ ...p, bank_details: DEFAULT_DONATIONS_CONTENT.bank_details }))}
            isSaving={savingSection === "donations-bank"}
            saveLabel="Save Bank Details"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={donationsData.bank_details.bankName}
                  onChange={(e) => setDonationsData(p => ({ ...p, bank_details: { ...p.bank_details, bankName: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Account Name</label>
                <input
                  type="text"
                  value={donationsData.bank_details.accountName}
                  onChange={(e) => setDonationsData(p => ({ ...p, bank_details: { ...p.bank_details, accountName: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={donationsData.bank_details.accountNumber}
                  onChange={(e) => setDonationsData(p => ({ ...p, bank_details: { ...p.bank_details, accountNumber: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Swift / BIC Code</label>
                <input
                  type="text"
                  value={donationsData.bank_details.swiftCode}
                  onChange={(e) => setDonationsData(p => ({ ...p, bank_details: { ...p.bank_details, swiftCode: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Bank Branch</label>
                <input
                  type="text"
                  value={donationsData.bank_details.branch}
                  onChange={(e) => setDonationsData(p => ({ ...p, bank_details: { ...p.bank_details, branch: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Mobile Money UPI / Code</label>
                <input
                  type="text"
                  value={donationsData.bank_details.mobileMoneyUpi}
                  onChange={(e) => setDonationsData(p => ({ ...p, bank_details: { ...p.bank_details, mobileMoneyUpi: e.target.value } }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 6: FAQs */}
          <SectionCard
            id="donations-faqs"
            title="6. Frequently Asked Questions (FAQs)"
            icon={HelpCircle}
            isOpen={!!expandedSections["donations-faqs"]}
            onToggle={() => toggleSection("donations-faqs")}
            onSave={() => handleSaveSection("donations", "faqs", donationsData.faqs)}
            onReset={() => setDonationsData(p => ({ ...p, faqs: DEFAULT_DONATIONS_CONTENT.faqs }))}
            isSaving={savingSection === "donations-faqs"}
            saveLabel="Save FAQs"
          >
            <div className="flex items-center justify-between pb-2">
              <label className="text-xs font-bold uppercase text-[#2B132C]">FAQ Items Repeater ({donationsData.faqs.faqs.length})</label>
              <button
                type="button"
                onClick={() => setDonationsData(p => ({
                  ...p,
                  faqs: {
                    ...p.faqs,
                    faqs: [...p.faqs.faqs, { question: "New Question?", answer: "Answer description." }]
                  }
                }))}
                className="text-xs text-[#B47F35] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {donationsData.faqs.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const updated = [...donationsData.faqs.faqs];
                        updated[idx].question = e.target.value;
                        setDonationsData(p => ({ ...p, faqs: { ...p.faqs, faqs: updated } }));
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold"
                      placeholder="Question"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = donationsData.faqs.faqs.filter((_, i) => i !== idx);
                        setDonationsData(p => ({ ...p, faqs: { ...p.faqs, faqs: updated } }));
                      }}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...donationsData.faqs.faqs];
                      updated[idx].answer = e.target.value;
                      setDonationsData(p => ({ ...p, faqs: { ...p.faqs, faqs: updated } }));
                    }}
                    className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
                    placeholder="Answer"
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: GALLERY MEDIA (3 SECTIONS)                                        */}
      {/* ========================================================================= */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          {/* Section 1: Header */}
          <SectionCard
            id="gallery-header"
            title="1. Gallery Page Header Banner"
            icon={Sparkles}
            isOpen={!!expandedSections["gallery-header"]}
            onToggle={() => toggleSection("gallery-header")}
            onSave={() => handleSaveSection("gallery", "header", galleryData.header)}
            onReset={() => setGalleryData(p => ({ ...p, header: DEFAULT_GALLERY_CONTENT.header }))}
            isSaving={savingSection === "gallery-header"}
            saveLabel="Save Gallery Header"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={galleryData.header.badge}
                  onChange={(e) => setGalleryData(p => ({ ...p, header: { ...p.header, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={galleryData.header.title}
                  onChange={(e) => setGalleryData(p => ({ ...p, header: { ...p.header, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={galleryData.header.subtitle}
                onChange={(e) => setGalleryData(p => ({ ...p, header: { ...p.header, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 2: Categories */}
          <SectionCard
            id="gallery-categories"
            title="2. Category Filter Tags"
            icon={Zap}
            isOpen={!!expandedSections["gallery-categories"]}
            onToggle={() => toggleSection("gallery-categories")}
            onSave={() => handleSaveSection("gallery", "categories", galleryData.categories)}
            onReset={() => setGalleryData(p => ({ ...p, categories: DEFAULT_GALLERY_CONTENT.categories }))}
            isSaving={savingSection === "gallery-categories"}
            saveLabel="Save Categories"
          >
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">
                Filter Category Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={galleryData.categories.categories.join(", ")}
                onChange={(e) => setGalleryData(p => ({
                  ...p,
                  categories: { categories: e.target.value.split(",").map(s => s.trim()) }
                }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Example: All, Deities, Festivals, Temple Complex, Social Events
              </p>
            </div>
          </SectionCard>

          {/* Section 3: Photo Management & S3 Upload */}
          <div className="bg-white rounded-3xl border border-[#B47F35]/20 p-6 space-y-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#B47F35]/15 pb-4">
              <Plus className="w-5 h-5 text-[#B47F35]" />
              <h3 className="font-heading text-lg font-bold text-[#2B132C]">
                3. Upload New Photo to Mandir Gallery (Direct S3 Storage)
              </h3>
            </div>

            <form onSubmit={handleCreateGalleryItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Photo Title *</label>
                  <input
                    type="text"
                    required
                    value={newGalleryPhoto.title}
                    onChange={(e) => setNewGalleryPhoto(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Maha Shivratri Deepotsav"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Category *</label>
                  <select
                    value={newGalleryPhoto.category}
                    onChange={(e) => setNewGalleryPhoto(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm bg-white"
                  >
                    <option value="Deities">Deities</option>
                    <option value="Festivals">Festivals</option>
                    <option value="Temple Complex">Temple Complex</option>
                    <option value="Social Events">Social Events</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Date Captured</label>
                  <input
                    type="date"
                    value={newGalleryPhoto.capturedDate}
                    onChange={(e) => setNewGalleryPhoto(p => ({ ...p, capturedDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                  />
                </div>
              </div>

              {/* Direct S3 Image Uploader */}
              <ImageUploader
                label="Gallery Photo Image File (Stored in AWS S3)"
                value={newGalleryPhoto.imageUrl}
                onChange={(url) => setNewGalleryPhoto(p => ({ ...p, imageUrl: url }))}
                folder="cms/gallery"
                recommendedSize="800x600 or 1200x800"
              />

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#B47F35] to-[#8B5E34] hover:brightness-105 text-white text-xs sm:text-base font-semibold shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish to Public Gallery</span>
                </button>
              </div>
            </form>

            {/* Current Live Gallery Grid */}
            <div className="pt-6 border-t border-[#B47F35]/15 space-y-4">
              <h4 className="font-heading text-base font-bold text-[#2B132C]">
                Current Published Photos ({galleryItems.length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryItems.map((item) => (
                  <div key={item.id} className="group relative rounded-2xl border border-[#B47F35]/20 overflow-hidden bg-[#FAF7F2] shadow-xs">
                    <div className="aspect-4/3 w-full overflow-hidden bg-stone-100">
                      <img
                        src={item.imageUrl || item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#B47F35] bg-[#B47F35]/10 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <h5 className="text-xs font-bold text-[#2B132C] truncate" title={item.title}>
                        {item.title}
                      </h5>
                      <p className="text-[10px] text-stone-500">
                        Captured: {item.date || item.captured_date || "N/A"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow transition-transform opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: CONTACT PAGE (4 SECTIONS)                                         */}
      {/* ========================================================================= */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          {/* Section 1: Header */}
          <SectionCard
            id="contact-header"
            title="1. Contact & Feedback Header Banner"
            icon={Sparkles}
            isOpen={!!expandedSections["contact-header"]}
            onToggle={() => toggleSection("contact-header")}
            onSave={() => handleSaveSection("contact", "header", contactData.header)}
            onReset={() => setContactData(p => ({ ...p, header: DEFAULT_CONTACT_CONTENT.header }))}
            isSaving={savingSection === "contact-header"}
            saveLabel="Save Contact Header"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Badge</label>
                <input
                  type="text"
                  value={contactData.header.badge}
                  onChange={(e) => setContactData(p => ({ ...p, header: { ...p.header, badge: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Headline</label>
                <input
                  type="text"
                  value={contactData.header.title}
                  onChange={(e) => setContactData(p => ({ ...p, header: { ...p.header, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={contactData.header.subtitle}
                onChange={(e) => setContactData(p => ({ ...p, header: { ...p.header, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 2: Info */}
          <SectionCard
            id="contact-info"
            title="2. Administrative Desk & Temple Office Details"
            icon={MapPin}
            isOpen={!!expandedSections["contact-info"]}
            onToggle={() => toggleSection("contact-info")}
            onSave={() => handleSaveSection("contact", "info", contactData.info)}
            onReset={() => setContactData(p => ({ ...p, info: DEFAULT_CONTACT_CONTENT.info }))}
            isSaving={savingSection === "contact-info"}
            saveLabel="Save Administrative Details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Official Address</label>
                <input
                  type="text"
                  value={contactData.info.address}
                  onChange={(e) => setContactData(p => ({ ...p, info: { ...p.info, address: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Official Phone</label>
                <input
                  type="text"
                  value={contactData.info.phone}
                  onChange={(e) => setContactData(p => ({ ...p, info: { ...p.info, phone: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Official Email</label>
                <input
                  type="email"
                  value={contactData.info.email}
                  onChange={(e) => setContactData(p => ({ ...p, info: { ...p.info, email: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Office Visiting Hours</label>
                <input
                  type="text"
                  value={contactData.info.officeHours}
                  onChange={(e) => setContactData(p => ({ ...p, info: { ...p.info, officeHours: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Hall Inspection / Appointment Note</label>
              <textarea
                rows={2}
                value={contactData.info.bookingNote}
                onChange={(e) => setContactData(p => ({ ...p, info: { ...p.info, bookingNote: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 3: Feedback Form (API CONNECTED) */}
          <SectionCard
            id="contact-feedback"
            title="3. Devotee Feedback & Inquiries Form"
            icon={Phone}
            isOpen={!!expandedSections["contact-feedback"]}
            onToggle={() => toggleSection("contact-feedback")}
            onSave={() => handleSaveSection("contact", "feedback_form", contactData.feedback_form)}
            onReset={() => setContactData(p => ({ ...p, feedback_form: DEFAULT_CONTACT_CONTENT.feedback_form }))}
            isSaving={savingSection === "contact-feedback"}
            saveLabel="Save Feedback Header"
            apiConnectedNotice="Connected to Inquiries & Feedback CRM API — Submissions are routed to the administrative inquiry desk. Form framing copy and button text are editable below."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Form Headline</label>
                <input
                  type="text"
                  value={contactData.feedback_form.title}
                  onChange={(e) => setContactData(p => ({ ...p, feedback_form: { ...p.feedback_form, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Submit Button Label</label>
                <input
                  type="text"
                  value={contactData.feedback_form.submitButtonText}
                  onChange={(e) => setContactData(p => ({ ...p, feedback_form: { ...p.feedback_form, submitButtonText: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Subtitle</label>
              <textarea
                rows={2}
                value={contactData.feedback_form.subtitle}
                onChange={(e) => setContactData(p => ({ ...p, feedback_form: { ...p.feedback_form, subtitle: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Success Message Confirmation</label>
              <textarea
                rows={2}
                value={contactData.feedback_form.successMessage}
                onChange={(e) => setContactData(p => ({ ...p, feedback_form: { ...p.feedback_form, successMessage: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>

          {/* Section 4: Map */}
          <SectionCard
            id="contact-map"
            title="4. Temple Location Map & Directions Section"
            icon={MapPin}
            isOpen={!!expandedSections["contact-map"]}
            onToggle={() => toggleSection("contact-map")}
            onSave={() => handleSaveSection("contact", "map", contactData.map)}
            onReset={() => setContactData(p => ({ ...p, map: DEFAULT_CONTACT_CONTENT.map }))}
            isSaving={savingSection === "contact-map"}
            saveLabel="Save Map Location"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Map Title</label>
                <input
                  type="text"
                  value={contactData.map.title}
                  onChange={(e) => setContactData(p => ({ ...p, map: { ...p.map, title: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Google Maps Link / URL</label>
                <input
                  type="text"
                  value={contactData.map.mapEmbedUrl}
                  onChange={(e) => setContactData(p => ({ ...p, map: { ...p.map, mapEmbedUrl: e.target.value } }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#B47F35]/25 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-stone-700 block mb-1">Location Address Text</label>
              <textarea
                rows={2}
                value={contactData.map.mapLocationText}
                onChange={(e) => setContactData(p => ({ ...p, map: { ...p.map, mapLocationText: e.target.value } }))}
                className="w-full p-3 rounded-xl border border-[#B47F35]/25 text-xs sm:text-sm"
              />
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
