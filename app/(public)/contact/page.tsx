"use client";

import React, { useState } from "react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Mail, Phone, MapPin, CheckCircle2, X } from "lucide-react";
import { templeConfig } from "@/data/temple";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert("Please fill in all fields.");
      return;
    }
    setSuccess(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="py-24 bg-bg-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeader
          badge="Reach out"
          title="Contact & Feedback"
          subtitle="Get in touch with the mandir administrative office or send us your spiritual feedback."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Contact Details Left */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-8 border-primary-gold/15">
              <h3 className="font-heading text-2xl font-medium text-dark-surface mb-6">
                Administrative Desk
              </h3>
              
              <ul className="space-y-6 text-xs text-secondary-bronze font-sans font-light">
                <li className="flex items-start space-x-3.5">
                  <MapPin className="w-5 h-5 text-primary-gold shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {templeConfig.address}
                  </span>
                </li>
                <li className="flex items-center space-x-3.5">
                  <Phone className="w-5 h-5 text-primary-gold shrink-0" />
                  <span>{templeConfig.phone}</span>
                </li>
                <li className="flex items-center space-x-3.5">
                  <Mail className="w-5 h-5 text-primary-gold shrink-0" />
                  <span>{templeConfig.email}</span>
                </li>
              </ul>
            </GlassCard>

            <GlassCard className="p-8 border-primary-gold/15 bg-white">
              <h4 className="font-heading text-lg font-medium text-primary-gold mb-2">
                Office Hours
              </h4>
              <p className="text-xs text-secondary-bronze leading-relaxed font-sans font-light">
                Monday - Sunday: 9:00 AM - 6:00 PM <br />
                For wedding hall site inspection, please book an appointment via the hall booking panel.
              </p>
            </GlassCard>
          </div>

          {/* Feedback Form Right */}
          <div className="lg:col-span-8">
            <GlassCard className="p-10 border-primary-gold/20 shadow-lg">
              
              {success ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-success-green/10 text-success-green flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-medium text-dark-surface">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-secondary-bronze font-sans max-w-sm mx-auto">
                    Thank you for your feedback. Our administrative office will review your request shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2.5 rounded-xl bg-primary-gold hover:bg-secondary-bronze text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="font-heading text-2xl font-medium text-dark-surface">
                    Send a Message
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Anand Patel"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="anand.patel@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-bronze mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your feedback or query..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-primary-gold/25 focus:border-primary-gold bg-transparent text-sm focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-gold to-secondary-bronze text-white text-xs font-semibold shadow-md hover:brightness-105 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Submit message
                  </button>
                </form>
              )}

            </GlassCard>
          </div>

        </div>

        {/* Embedded Map Grid Mock */}
        <GlassCard className="p-4 border border-primary-gold/15 overflow-hidden shadow-md">
          <div className="w-full h-80 rounded-2xl bg-neutral-gray overflow-hidden relative flex items-center justify-center">
            {/* Visual layout mock instead of loading real google iframe */}
            <div className="absolute inset-0 bg-gradient-to-tr from-stone-200 to-amber-50 pointer-events-none" />
            <div className="relative text-center p-8 space-y-2 z-10">
              <MapPin className="w-10 h-10 text-primary-gold mx-auto animate-bounce" />
              <h4 className="font-heading text-lg font-medium text-dark-surface">
                Location Map Simulator
              </h4>
              <p className="text-xs text-secondary-bronze font-sans leading-relaxed">
                Spiritual Boulevard, Sector 5, Divine City, Pin - 400001
              </p>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
