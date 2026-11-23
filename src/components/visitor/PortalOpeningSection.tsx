"use client";

import React, { useRef } from "react";
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
  const wordmarkScale = useTransform(scrollYProgress, [0.15, 0.7], [0.9, 1.25]);
  const wordmarkTracking = useTransform(scrollYProgress, [0.15, 0.7], ["0.35em", "0.05em"]);

  // Background reveal opacity & zoom
  const bgOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0.3, 1]);
  const bgScale = useTransform(scrollYProgress, [0.15, 0.8], [1.15, 1.0]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[140vh] w-full bg-[#0A0C0E] border-b border-hairline overflow-hidden select-none"
    >
      {/* Sticky viewport frame */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Revealed Stage */}
        <motion.div
          style={{ opacity: bgOpacity, scale: bgScale }}
          className="absolute inset-0 flex items-center justify-center bg-[#07080a]"
        >
          {/* Subtle architectural grid & artistic backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#2E6B72_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
          <div className="relative text-center px-6 max-w-3xl z-10">
            <span className="text-amber text-xs font-mono uppercase tracking-[0.3em]">
              [ ARCHIVE REVEALED ]
            </span>
            <h3 className="font-syne text-3xl sm:text-4xl md:text-5xl font-bold text-primary-text mt-3 mb-4">
              A Living Collective Memory
            </h3>
            <p className="text-secondary-text text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Every captured frame enters the permanent gallery stream. As you enter, the physical display adapts
              to celebrate your presence.
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

        {/* Centered Wordmark Emblem that scales up and tightens */}
        <motion.div
          style={{
            scale: wordmarkScale,
            letterSpacing: wordmarkTracking,
          }}
          className="relative z-30 pointer-events-none text-center"
        >
          <div className="bg-[#0A0C0E]/90 border border-hairline px-6 py-2 backdrop-blur-md">
            <span className="font-syne text-xs sm:text-sm uppercase font-bold text-amber">
              PORTAL ACCESS
            </span>
          </div>
        </motion.div>

        {/* Scroll status prompt */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-[11px] uppercase tracking-[0.25em] text-muted flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal" />
          <span>Scroll to Unlock Portal</span>
        </div>
      </div>
    </div>
  );
};
