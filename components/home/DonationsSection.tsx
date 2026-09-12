"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { donationCampaigns } from "@/data/donations";
import { formatCurrency } from "@/lib/utils";

export function DonationsSection() {
  return (
    <section className="py-24 bg-surface-white font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Generous Giving"
          title="Active Donation Campaigns"
          subtitle="Your financial contributions directly support deity seva, annadan, and infrastructural development."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {donationCampaigns.map((camp) => {
            const percentage = Math.round((camp.raisedAmount / camp.goalAmount) * 100);
            return (
              <GlassCard hoverEffect className="p-6 sm:p-8" key={camp.id}>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="relative w-full md:w-40 h-40 rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={camp.image}
                      alt={camp.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow space-y-4">
                    <div>
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-gold font-poppins">
                        {camp.category} Seva
                      </span>
                      <h4 className="text-xl sm:text-2xl font-heading font-medium text-dark-surface mt-1">
                        {camp.title}
                      </h4>
                    </div>
                    <p className="text-sm sm:text-base text-secondary-bronze/85 font-poppins line-clamp-2">
                      {camp.description}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm sm:text-base font-poppins">
                        <span className="font-semibold text-dark-surface">
                          Raised: {formatCurrency(camp.raisedAmount)}
                        </span>
                        <span className="text-primary-gold font-bold">{percentage}%</span>
                      </div>
                      <div className="w-full bg-bg-warm h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-gold to-secondary-bronze h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm text-secondary-bronze/70 font-poppins">
                        <span>Goal: {formatCurrency(camp.goalAmount)}</span>
                        <span>{camp.donorCount} Donors</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/donations"
                        className="inline-flex items-center space-x-2 text-sm sm:text-base font-semibold px-5 py-2.5 bg-bg-warm border border-primary-gold/20 hover:border-primary-gold text-secondary-bronze rounded-xl transition-all font-poppins"
                      >
                        <Heart className="w-4 h-4 text-primary-gold fill-primary-gold/10" />
                        <span>Donate Now</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
