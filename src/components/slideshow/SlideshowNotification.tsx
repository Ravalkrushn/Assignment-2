"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, UserCheck } from "lucide-react";
import { NewPhotoAlert } from "./types";

interface SlideshowNotificationProps {
  alert: NewPhotoAlert | null;
}

export function SlideshowNotification({ alert }: SlideshowNotificationProps) {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed top-6 right-6 z-50 pointer-events-none select-none"
        >
          <div className="bg-[#101317]/95 backdrop-blur-xl border border-amber/40 shadow-2xl rounded-2xl p-4 flex items-center gap-4 max-w-sm">
            {/* Thumbnail */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-hairline shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={alert.imageUrl}
                alt="Incoming upload"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Notification Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-amber text-xs font-mono font-medium uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Photo Live</span>
              </div>
              <p className="text-sm font-syne font-semibold text-primary-text truncate">
                {alert.visitorName}
              </p>
              <p className="text-[11px] text-muted">Added to slideshow rotation</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
