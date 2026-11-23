"use client";

import React from "react";
import { motion } from "framer-motion";
import { Radio, Sparkles, Image as ImageIcon, QrCode } from "lucide-react";

interface SlideshowEmptyStateProps {
  onRefresh?: () => void;
}

export function SlideshowEmptyState({ onRefresh }: SlideshowEmptyStateProps) {
  return (
    <div className="relative w-screen h-screen bg-[#0A0C0E] flex flex-col items-center justify-center p-8 overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(237,231,220,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(237,231,220,0.4) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-xl text-center flex flex-col items-center">
        {/* Live Radar Pulse Indicator */}
        <div className="relative mb-8 flex items-center justify-center">
          <motion.div
            className="absolute w-24 h-24 rounded-full border border-teal/40"
            animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-16 h-16 rounded-full border border-amber/40"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
          />
          <div className="w-16 h-16 rounded-full bg-[#101317] border border-hairline flex items-center justify-center shadow-2xl">
            <Radio className="w-7 h-7 text-amber animate-pulse" />
          </div>
        </div>

        {/* Live Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101317] border border-hairline text-xs font-mono uppercase tracking-widest text-teal mb-6">
          <span className="w-2 h-2 rounded-full bg-teal animate-ping" />
          Live Display Feed Active
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl font-syne font-bold text-primary-text tracking-tight mb-4">
          Awaiting Moments.
        </h1>

        <p className="text-secondary-text text-base sm:text-lg font-light leading-relaxed mb-10 max-w-md">
          Photos uploaded by visitors at the entrance kiosk will appear here automatically on this smart display in real time.
        </p>

        {/* Instructions Card */}
        <div className="bg-[#101317]/80 backdrop-blur-md border border-hairline rounded-2xl p-6 w-full text-left space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-muted flex items-center justify-between border-b border-hairline pb-3">
            <span>How to share</span>
            <span className="text-amber">Step 1 of 1</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-[#0A0C0E] border border-hairline text-amber shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-text">
                Scan or visit the visitor portal
              </p>
              <p className="text-xs text-secondary-text mt-0.5">
                Visit the homepage <span className="text-teal font-mono">/</span> on your phone or kiosk tablet, enter your name, and select photos.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-muted">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal" />
              <span>Smart TV Polling: Active (4s interval)</span>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="hover:text-primary-text underline underline-offset-2 transition-colors"
              >
                Force Check
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
