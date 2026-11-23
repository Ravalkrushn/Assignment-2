"use client";

import React, { useRef } from "react";
import { WelcomeHero } from "@/components/visitor/WelcomeHero";
import { PortalOpeningSection } from "@/components/visitor/PortalOpeningSection";
import { SvgJourneyConnector } from "@/components/visitor/SvgJourneyConnector";
import { VisitorForm } from "@/components/visitor/VisitorForm";

export default function VisitorPage() {
  const formSectionRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    const el = document.getElementById("visitor-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0C0E] text-primary-text flex flex-col justify-between selection:bg-teal selection:text-white">
      {/* 1. Welcome Hero */}
      <WelcomeHero onStartClick={scrollToForm} />

      {/* 2. Portal Opening Scroll Animation */}
      <PortalOpeningSection />

      {/* 3. SVG Journey Connector Timeline */}
      <SvgJourneyConnector />

      {/* 4. Complete Interactive Visitor Form */}
      <div ref={formSectionRef}>
        <VisitorForm />
      </div>

      {/* 5. Minimal Record-Label Styled Footer */}
      <footer className="border-t border-hairline bg-[#07080a] py-12 px-6 md:px-12 lg:px-20 text-xs text-muted flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber" />
          <span className="font-syne font-bold uppercase tracking-[0.2em] text-primary-text">
            Visitor Photo Experience
          </span>
          <span className="text-secondary-text hidden sm:inline">| Public Smart Screen Feed</span>
        </div>

        <div className="flex items-center space-x-8 uppercase tracking-widest text-[11px]">
          <span>Protected Consent</span>
          <span>Automatic Rotation</span>
          <span className="text-teal font-medium">Node Active</span>
        </div>
      </footer>
    </main>
  );
}
