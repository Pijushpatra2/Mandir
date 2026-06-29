"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark";
  hoverEffect?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  variant = "light",
  hoverEffect = true,
  delay = 0,
}: GlassCardProps) {
  const cardStyle = variant === "light" ? "glass-card" : "glass-card-dark";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={hoverEffect ? { y: -6, scale: 1.01 } : undefined}
      className={cn(cardStyle, "transition-colors duration-300", className)}
    >
      {children}
    </motion.div>
  );
}
