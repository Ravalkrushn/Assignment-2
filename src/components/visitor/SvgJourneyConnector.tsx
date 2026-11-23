"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { User, Image as ImageIcon, ShieldCheck, CheckCircle2 } from "lucide-react";

interface StepItem {
  id: number;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  {
    id: 1,
    label: "Your Information",
    desc: "Identity & record matching",
    icon: User,
  },
  {
    id: 2,
    label: "Upload Photos",
    desc: "JPG, PNG or WEBP files",
    icon: ImageIcon,
  },
  {
    id: 3,
    label: "Give Consent",
    desc: "Public slideshow display agreement",
    icon: ShieldCheck,
  },
  {
    id: 4,
    label: "Complete Visit",
    desc: "Instant live TV projection",
    icon: CheckCircle2,
  },
];

export const SvgJourneyConnector: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  // Animate pathLength from 0 to 1 based on scroll
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="w-full py-16 px-6 md:px-12 lg:px-20 border-b border-hairline bg-[#0c0f12]/50 relative"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-amber text-xs uppercase tracking-[0.25em] font-mono">
              [ STAGE CONNECTOR ]
            </span>
            <h2 className="font-syne text-2xl sm:text-3xl font-bold text-primary-text mt-2">
              The Journey of Your Capture
            </h2>
          </div>
          <p className="text-xs uppercase tracking-widest text-muted max-w-xs">
            Dynamic scroll progress synchronizing your upload with the venue feed.
          </p>
        </div>

        {/* Desktop Interactive SVG Timeline */}
        <div className="relative hidden md:block my-8">
          {/* SVG Canvas for drawing the line */}
          <div className="absolute top-[28px] left-0 w-full h-[60px] pointer-events-none z-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1000 60"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Background inactive line */}
              <path
                d="M 50 30 C 250 10, 350 50, 500 30 C 650 10, 750 50, 950 30"
                stroke="rgba(237, 231, 220, 0.12)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Dynamic scroll-driven animated path */}
              <motion.path
                d="M 50 30 C 250 10, 350 50, 500 30 C 650 10, 750 50, 950 30"
                stroke="#E8913C"
                strokeWidth="2.5"
                style={{ pathLength }}
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 4 Step Nodes */}
          <div className="relative z-10 grid grid-cols-4 gap-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-full bg-[#101317] border border-hairline flex items-center justify-center transition-colors duration-300 group-hover:border-amber/80 shadow-md">
                    <Icon className="w-5 h-5 text-primary-text group-hover:text-amber transition-colors" />
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-mono tracking-widest text-muted uppercase block">
                      STAGE 0{step.id}
                    </span>
                    <h4 className="font-syne text-sm font-semibold text-primary-text mt-1">
                      {step.label}
                    </h4>
                    <p className="text-xs text-secondary-text mt-1 max-w-[180px] leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Vertical Step Flow */}
        <div className="md:hidden space-y-6 relative border-l-2 border-hairline pl-6 ml-4">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative">
                <span className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-[#101317] border-2 border-amber" />
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-amber" />
                  <span className="text-[10px] font-mono tracking-widest text-muted uppercase">
                    STAGE 0{step.id}
                  </span>
                </div>
                <h4 className="font-syne text-sm font-semibold text-primary-text mt-1">
                  {step.label}
                </h4>
                <p className="text-xs text-secondary-text mt-0.5">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
