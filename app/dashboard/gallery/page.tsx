"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Plus, Trash2, ImageIcon, X } from "lucide-react";

export default function GalleryDashboardPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [galleryItems, setGalleryItems] = useState([
    { id: "gal-1", title: "Sri Radhe Krishna Shringar Darshan", category: "Deities", imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", date: "2026-06-21" },
    { id: "gal-2", title: "Janmashtami Midnight Abhishek", category: "Festivals", imageUrl: "https://images.unsplash.com/photo-1608976479500-66c1b376d8b6?auto=format&fit=crop&w=800&q=80", date: "2025-08-25" },
    { id: "gal-3", title: "Main Temple Dome & Architecture", category: "Temple Complex", imageUrl: "https://images.unsplash.com/photo-1583373834249-137a86892a50?auto=format&fit=crop&w=800&q=80", date: "2026-05-10" },
    { id: "gal-4", title: "Vasant Utsav Holi Celebrations", category: "Festivals", imageUrl: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80", date: "2026-03-25" }
  ]);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Deities");
  const [imageUrl, setImageUrl] = useState("");

  const filteredItems = galleryItems.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const newItem = {
      id: "gal-dash-" + Math.random().toString(36).substr(2, 9),
      title,
      category,
      imageUrl,
      date: new Date().toISOString().split("T")[0]
    };

    setGalleryItems((prev) => [newItem, ...prev]);
    setShowAddForm(false);
    setTitle("");
    setImageUrl("");
  };

  const handleDeleteItem = (id: string) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Gallery Management
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Add media assets to the public masonry grid and sort by category tags.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Image Asset</span>
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-2xl border border-primary-gold/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media assets by title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of gallery assets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <GlassCard className="p-0 overflow-hidden flex flex-col justify-between h-full group" hoverEffect={false} key={item.id}>
            <div className="relative h-44 w-full">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-error-red text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4">
              <span className="px-2 py-0.5 text-[8px] font-bold bg-primary-gold/15 text-primary-gold rounded uppercase">
                {item.category}
              </span>
              <h4 className="font-heading text-base font-medium text-dark-surface mt-2 leading-tight">
                {item.title}
              </h4>
              <p className="text-[10px] text-secondary-bronze/50 font-sans mt-3">
                Uploaded: {item.date}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Upload dialog modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-primary-gold/20 shadow-2xl p-8 relative overflow-hidden">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-2 text-secondary-bronze hover:text-dark-surface cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-gold">
                  Media Library
                </span>
                <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                  Upload Image Asset
                </h3>
              </div>

              <form onSubmit={handleAddGalleryItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                    Image Caption / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sri Radhe Krishna Shringar"
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    >
                      <option>Deities</option>
                      <option>Festivals</option>
                      <option>Temple Complex</option>
                      <option>Social Events</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Asset URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Upload to Media Altar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
