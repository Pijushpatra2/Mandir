"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Plus, Calendar, Clock, MapPin, Users, X } from "lucide-react";

export default function EventsDashboardPage() {
  const { events, setEvents } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState<"Festival" | "Satsang" | "Seva" | "Cultural">("Festival");
  const [capacityLimit, setCapacityLimit] = useState(500);

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    const newEvent = {
      id: "evt-dash-" + Math.random().toString(36).substr(2, 9),
      title,
      description,
      date,
      time,
      bannerImage: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=800&q=80",
      capacityLimit,
      registeredCount: 0,
      category,
      status: "Upcoming" as const
    };

    setEvents((prev) => [newEvent, ...prev]);
    setShowAddForm(false);
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-medium text-dark-surface">
            Event Management
          </h1>
          <p className="text-xs text-secondary-bronze/75 font-sans mt-0.5">
            Add new festivals, schedule Satsangs, and monitor community attendance limits.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow hover:brightness-105 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      <div className="flex gap-4 bg-white p-4 rounded-2xl border border-primary-gold/10">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-bronze/55" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-primary-gold/20 focus:border-primary-gold bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <GlassCard className="p-6 flex flex-col justify-between h-full" key={evt.id} hoverEffect={false}>
            <div className="space-y-4">
              <span className="px-2 py-0.5 text-[8px] font-bold bg-primary-gold/10 text-primary-gold border border-primary-gold/15 rounded uppercase">
                {evt.category}
              </span>
              <h3 className="font-heading text-xl font-medium text-dark-surface leading-tight">
                {evt.title}
              </h3>
              <p className="text-xs text-secondary-bronze/85 leading-relaxed font-sans line-clamp-3">
                {evt.description}
              </p>
              
              <div className="space-y-2 text-xs text-secondary-bronze pt-2 border-t border-primary-gold/10 font-sans">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary-gold" />
                  <span>Date: {evt.date}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-primary-gold" />
                  <span>Time: {evt.time}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary-gold" />
                  <span>
                    Passes: {evt.registeredCount} / {evt.capacityLimit}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-primary-gold/10 mt-4 flex items-center justify-between text-xs">
              <span className="font-semibold text-secondary-bronze">Status: {evt.status}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Add Event Dialog Modal */}
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
                  Content Management
                </span>
                <h3 className="font-heading text-2xl font-medium text-dark-surface mt-1">
                  Create New Event
                </h3>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Navratri Dandiya Utsav"
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                    Event Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description about the spiritual program..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Time Slot *
                    </label>
                    <input
                      type="text"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g. 6:00 PM - 9:00 PM"
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e: any) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    >
                      <option>Festival</option>
                      <option>Satsang</option>
                      <option>Seva</option>
                      <option>Cultural</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Capacity Limit *
                    </label>
                    <input
                      type="number"
                      required
                      value={capacityLimit}
                      onChange={(e) => setCapacityLimit(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white font-semibold shadow hover:brightness-105 transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Create Event Listing
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
