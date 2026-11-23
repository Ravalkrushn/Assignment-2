"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlideshowItem } from "./types";
import { User, Sparkles, Clock } from "lucide-react";

interface SlideshowInfoOverlayProps {
  photo: SlideshowItem | null;
  currentIndex: number;
  totalPhotos: number;
  visible: boolean;
  progress: number; // 0 to 100
  isAutoPlay: boolean;
}

export function SlideshowInfoOverlay({
  photo,
  currentIndex,
  totalPhotos,
  visible,
  progress,
  isAutoPlay,
}: SlideshowInfoOverlayProps) {
  if (!photo) return null;

  // Format relative or readable date
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const uploadTime = formatTime(photo.uploadedAt);

  return (
    <>
      {/* Top Countdown Progress Bar */}
      {isAutoPlay && totalPhotos > 1 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-black/40 z-40 overflow-hidden pointer-events-none">
          <motion.div
            className="h-full bg-gradient-to-r from-teal via-amber to-teal"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.05 }}
          />
        </div>
      )}

      {/* Lower Third Cinematic Attribution Overlay */}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-8 left-8 right-8 z-40 flex items-end justify-between pointer-events-none select-none"
          >
            {/* Left: Visitor Attribution */}
            <div className="bg-[#101317]/85 backdrop-blur-xl border border-hairline rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-4 max-w-lg">
              <div className="w-10 h-10 rounded-xl bg-[#0A0C0E] border border-hairline flex items-center justify-center text-teal shrink-0">
                <User className="w-5 h-5 text-teal" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Captured By
                  </span>

                  {photo.visitor.isReturning && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/15 border border-amber/30 text-[10px] font-mono text-amber uppercase tracking-wider">
                      <Sparkles className="w-2.5 h-2.5" />
                      Returning Visitor
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <h2 className="text-lg sm:text-xl font-syne font-bold text-primary-text truncate">
                    {photo.visitor.name}
                  </h2>

                  {uploadTime && (
                    <span className="text-xs text-muted flex items-center gap-1 font-mono shrink-0">
                      <Clock className="w-3 h-3 text-secondary-text" />
                      {uploadTime}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Slide Counter */}
            <div className="bg-[#101317]/85 backdrop-blur-xl border border-hairline rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-2 text-xs font-mono">
              <span className="text-amber font-semibold text-sm">
                {String(currentIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-muted">/</span>
              <span className="text-secondary-text">
                {String(totalPhotos).padStart(2, "0")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
