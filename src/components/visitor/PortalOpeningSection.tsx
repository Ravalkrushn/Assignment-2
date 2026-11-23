"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

export const PortalOpeningSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Bind scroll position strictly to this section container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Split panels move in opposite directions (left panel slides left, right panel slides right)
  const leftPanelX = useTransform(scrollYProgress, [0.15, 0.7], ["0%", "-102%"]);
  const rightPanelX = useTransform(scrollYProgress, [0.15, 0.7], ["0%", "102%"]);

  // Title halves moving apart
  const leftTitleX = useTransform(scrollYProgress, [0.15, 0.65], ["0%", "-40%"]);
  const rightTitleX = useTransform(scrollYProgress, [0.15, 0.65], ["0%", "40%"]);

  // Wordmark scale and letter spacing
  const wordmarkScale = useTransform(scrollYProgress, [0.15, 0.7], [0.9, 1.2]);
  const wordmarkTracking = useTransform(scrollYProgress, [0.15, 0.7], ["0.35em", "0.05em"]);
  const wordmarkOpacity = useTransform(scrollYProgress, [0.15, 0.5, 0.65], [1, 0.8, 0]);

  // Background reveal opacity & zoom
  const bgOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0.3, 1]);
  const bgScale = useTransform(scrollYProgress, [0.15, 0.8], [1.12, 1.0]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[140vh] w-full bg-[#0A0C0E] border-b border-hairline overflow-hidden select-none"
    >
      {/* Sticky viewport frame */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Revealed Stage (Cinematic Photography) */}
        <motion.div
          style={{ opacity: bgOpacity, scale: bgScale }}
          className="absolute inset-0 flex items-center justify-center bg-[#07080a] overflow-hidden"
        >
          {/* Full-bleed Cinematic Exhibition Photograph */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/portal-reveal.jpg"
              alt="Live Exhibition Collective Memory Gallery"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Cinematic subtle ambient lighting & vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0E] via-transparent to-[#0A0C0E]/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0C0E]/80 via-transparent to-[#0A0C0E]/80" />
            <div className="absolute inset-0 bg-[#0A0C0E]/20" />
          </div>

          {/* Minimal Elegant Exhibition Caption */}
          <div className="relative z-10 text-center px-6 mt-auto mb-20 max-w-lg bg-[#0A0C0E]/85 border border-hairline py-3.5 px-6 backdrop-blur-md shadow-2xl">
            <span className="text-amber text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] block">
              [ ARCHIVE REVEALED ]
            </span>
            <h3 className="font-syne text-sm sm:text-base font-bold text-primary-text tracking-wide mt-1">
              A Living Collective Memory
            </h3>
            <p className="text-secondary-text text-xs mt-1 leading-relaxed">
              Every captured frame enters the permanent gallery stream.
            </p>
          </div>
        </motion.div>

        {/* Left Portal Panel */}
        <motion.div
          style={{ x: leftPanelX }}
          className="absolute top-0 left-0 w-1/2 h-full bg-[#101317] border-r border-hairline z-20 flex items-center justify-end pr-3 sm:pr-8 md:pr-12 shadow-2xl"
        >
          <motion.div style={{ x: leftTitleX }} className="text-right">
            <span className="font-syne text-4xl sm:text-6xl md:text-8xl font-black text-primary-text tracking-tighter uppercase inline-block">
              VISIT
            </span>
          </motion.div>
        </motion.div>

        {/* Right Portal Panel */}
        <motion.div
          style={{ x: rightPanelX }}
          className="absolute top-0 right-0 w-1/2 h-full bg-[#101317] border-l border-hairline z-20 flex items-center justify-start pl-3 sm:pl-8 md:pl-12 shadow-2xl"
        >
          <motion.div style={{ x: rightTitleX }} className="text-left">
            <span className="font-syne text-4xl sm:text-6xl md:text-8xl font-black text-primary-text tracking-tighter uppercase inline-block">
              OR.
            </span>
          </motion.div>
        </motion.div>

        {/* Centered Wordmark Emblem that fades out gracefully as the portal opens */}
        <motion.div
          style={{
            scale: wordmarkScale,
            letterSpacing: wordmarkTracking,
            opacity: wordmarkOpacity,
          }}
          className="relative z-30 pointer-events-none text-center"
        >
          <div className="bg-[#0A0C0E]/90 border border-hairline px-6 py-2.5 backdrop-blur-md shadow-xl">
            <span className="font-syne text-xs sm:text-sm uppercase font-bold text-amber tracking-wider">
              PORTAL ACCESS
            </span>
          </div>
        </motion.div>

        {/* Scroll status prompt */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 text-[11px] uppercase tracking-[0.25em] text-muted flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          <span>Scroll to Unlock Portal</span>
        </div>
      </div>
    </div>
  );
};
