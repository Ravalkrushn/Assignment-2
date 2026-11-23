"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlideshowItem, SlideshowSettings } from "./types";

interface SlideshowViewProps {
  currentPhoto: SlideshowItem | null;
  settings: SlideshowSettings;
  onError: (photoId: string) => void;
}

export function SlideshowView({
  currentPhoto,
  settings,
  onError,
}: SlideshowViewProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  if (!currentPhoto) return null;

  // Configure transition animation based on settings and accessibility
  const isReduced = prefersReducedMotion;
  const transitionType = isReduced ? "crossfade" : settings.transition;

  const getAnimationVariants = () => {
    switch (transitionType) {
      case "kenburns":
        return {
          initial: { opacity: 0, scale: 1 },
          animate: {
            opacity: 1,
            scale: 1.05,
            transition: {
              opacity: { duration: 0.8, ease: "easeInOut" },
              scale: {
                duration: Math.max(3, settings.durationSeconds + 1),
                ease: "linear",
              },
            },
          },
          exit: {
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" },
          },
        };

      case "slide":
        return {
          initial: { opacity: 0, x: 80 },
          animate: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          },
          exit: {
            opacity: 0,
            x: -80,
            transition: { duration: 0.5, ease: "easeInOut" },
          },
        };

      case "crossfade":
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } },
          exit: { opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <div className="relative w-screen h-screen bg-[#0A0C0E] overflow-hidden select-none flex items-center justify-center">
      {/* 1. Ambient Blurred Background (For portrait and square photos) */}
      {settings.fitMode === "ambient" && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`ambient-${currentPhoto.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.38 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPhoto.imageUrl}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover filter blur-[90px] scale-125 transform"
            />
            {/* Subtle dark gradient overlay to ensure foreground contrast */}
            <div className="absolute inset-0 bg-[#0A0C0E]/50" />
          </motion.div>
        </AnimatePresence>
      )}

      {/* 2. Primary Foreground Presentation Image */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`main-${currentPhoto.id}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentPhoto.imageUrl}
            alt={currentPhoto.originalName || "Visitor Photo"}
            onError={() => onError(currentPhoto.id)}
            className={`w-full h-full ${
              settings.fitMode === "cover"
                ? "object-cover"
                : "object-contain"
            }`}
          />
        </motion.div>
      </AnimatePresence>

      {/* 3. Subtle Vignette Border for cinematic smart screen feel */}
      <div
        className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.7)]"
        aria-hidden="true"
      />
    </div>
  );
}
