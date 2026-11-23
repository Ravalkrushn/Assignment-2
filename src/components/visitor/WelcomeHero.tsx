"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface WelcomeHeroProps {
  onStartClick: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ onStartClick }) => {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between px-6 md:px-12 lg:px-20 py-12 border-b border-hairline overflow-hidden">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber/5 rounded-full blur-3xl" />
      </div>

      {/* Top Bar Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-hairline pb-6">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
          <span className="font-syne text-xs uppercase tracking-[0.25em] text-primary-text font-bold">
            Live Display Node
          </span>
        </div>
        <div className="flex items-center space-x-6 text-xs tracking-widest text-muted uppercase">
          <span className="hidden sm:inline">Edition 2026</span>
          <span className="text-secondary-text">V.01 // Public Feed</span>
        </div>
      </header>

      {/* Main Hero Statement & Right Portrait Grid */}
      <div className="relative z-10 my-auto py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Heading, Subtext, CTA */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-amber mb-6 border border-hairline px-3.5 py-1.5 bg-[#101317]/80 self-start"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber" />
            <span>Interactive Exhibition Experience</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-syne text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-extrabold tracking-tight text-primary-text leading-[0.95]"
          >
            Every Visit <br />
            <span className="text-secondary-text">Leaves a Story.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 text-base md:text-lg text-secondary-text max-w-xl font-normal leading-relaxed"
          >
            Your presence shapes this space. Upload your photos to immediately project them on the venue&apos;s
            smart displays. Returning visitors unlock their complete retrospective journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <Button onClick={onStartClick} size="lg" className="group">
              <span>Start Your Visit</span>
              <ArrowDown className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-y-1" />
            </Button>

            <div className="flex items-center space-x-3 text-xs tracking-wider text-muted uppercase pl-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal" />
              <span>Instant Broadcast to Screen</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Editorial Portrait Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-sm sm:max-w-md aspect-[3/4] bg-[#101317] border border-hairline p-3 group shadow-2xl">
            {/* Fine corner brackets */}
            <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber" />
            <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-teal" />
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-teal" />

            {/* Inner Portrait Image Container */}
            <div className="relative w-full h-full overflow-hidden bg-[#0A0C0E]">
              <Image
                src="/images/hero-portrait.jpg"
                alt="Visitor Exhibition Editorial Portrait"
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 35vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient Vignette Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0E]/90 via-transparent to-transparent pointer-events-none" />

              {/* Lower Third Aesthetic Badge */}
              <div className="absolute bottom-4 inset-x-4 flex items-end justify-between text-xs tracking-widest uppercase">
                <div className="bg-[#0A0C0E]/85 border border-hairline px-3 py-1.5 backdrop-blur-md">
                  <span className="text-[10px] text-amber font-mono font-bold block">
                    LIVE CURATION
                  </span>
                  <span className="text-primary-text font-syne text-[11px] font-semibold">
                    FRAME #082 // ARCHIVE
                  </span>
                </div>

                <div className="hidden sm:flex items-center space-x-1.5 text-secondary-text text-[10px] font-mono bg-[#0A0C0E]/70 px-2.5 py-1 border border-hairline">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                  <span>BROADCASTING</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Info Indicator */}
      <footer className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-hairline text-xs uppercase tracking-widest text-muted">
        <div className="flex items-center space-x-2">
          <span className="text-primary-text font-syne font-bold">01</span>
          <span>Register Identity</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-primary-text font-syne font-bold">02</span>
          <span>Upload In High Resolution</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-primary-text font-syne font-bold">03</span>
          <span>Real-time Slideshow Inclusion</span>
        </div>
      </footer>
    </section>
  );
};
