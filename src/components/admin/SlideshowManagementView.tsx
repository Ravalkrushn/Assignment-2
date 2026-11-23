"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tv,
  Play,
  Pause,
  Repeat,
  Clock,
  Sliders,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
  Maximize2,
  Keyboard,
  Info,
  RefreshCw,
} from "lucide-react";

interface SlideshowConfig {
  durationSeconds: number;
  transition: "kenburns" | "crossfade" | "slide";
  fitMode: "ambient" | "contain" | "cover";
  showInfoOverlay: boolean;
  autoPlay: boolean;
  loop: boolean;
}

const STORAGE_KEY = "visitor_slideshow_settings";

export function SlideshowManagementView() {
  const [config, setConfig] = useState<SlideshowConfig>({
    durationSeconds: 5,
    transition: "kenburns",
    fitMode: "ambient",
    showInfoOverlay: true,
    autoPlay: true,
    loop: true,
  });

  const [meta, setMeta] = useState<{
    totalActivePhotos: number;
    lastUpdated: string | null;
  }>({
    totalActivePhotos: 0,
    lastUpdated: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from DB & sync with localStorage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings) {
            setConfig(data.settings);
            if (data.meta) {
              setMeta({
                totalActivePhotos: data.meta.totalActivePhotos || 0,
                lastUpdated: data.meta.lastUpdated || null,
              });
            }
            // Sync to local storage
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data.settings));
            } catch {
              // ignore
            }
          }
        }
      } catch (err: any) {
        console.error("Failed to load settings:", err);
        setError("Unable to retrieve persistent slideshow configuration");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // 1. Save to MongoDB via Admin API
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to persist settings");
      }

      // 2. Synchronize with localStorage for immediate local TV / preview pickup
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.warn("LocalStorage sync warning:", e);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error("Save settings error:", err);
      setError(err.message || "Failed to save slideshow settings");
    } finally {
      setIsSaving(false);
    }
  };

  const durationPresets = [2, 3, 5, 8, 10, 15, 20];

  // URL query parameter string to ensure standalone TV display immediately adopts exact settings
  const displayUrl = `/display?duration=${config.durationSeconds}&transition=${config.transition}&fit=${config.fitMode}&autoplay=${config.autoPlay}`;

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-[#EDE7DC] tracking-tight">
            Slideshow Display Management
          </h1>
          <p className="text-xs font-sora text-[#9EA5A8] mt-1">
            Configure smart TV broadcast timing, cinematic transitions, framing modes, and projection telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={displayUrl}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8913C] hover:bg-[#E8913C]/90 text-[#0A0C0E] font-sora font-semibold text-xs transition-colors shadow-lg shadow-[#E8913C]/20"
          >
            <Tv className="w-4 h-4" />
            <span>Launch Live Display (/display)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-sora flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>
            Slideshow settings saved persistently to database and synchronized across TV display sessions.
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sora">
          {error}
        </div>
      )}

      {/* Main Grid: Controls + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Slide Timing & Playback */}
          <div className="p-6 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-syne font-bold text-[#EDE7DC] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E8913C]" />
                Display Duration & Playback
              </h2>
              <span className="text-xs font-mono text-[#E8913C] bg-[#E8913C]/10 px-2 py-0.5 rounded border border-[#E8913C]/30">
                {config.durationSeconds} Seconds / Slide
              </span>
            </div>

            {/* Duration Slider & Pills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#9EA5A8] font-sora">
                <span>Slide Transition Interval</span>
                <span className="font-mono text-[#EDE7DC]">{config.durationSeconds}s</span>
              </div>

              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={config.durationSeconds}
                onChange={(e) =>
                  setConfig({ ...config, durationSeconds: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#E8913C] bg-[#0A0C0E] h-2 rounded-lg cursor-pointer"
              />

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-[#6C7378] font-sora">Presets:</span>
                {durationPresets.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setConfig({ ...config, durationSeconds: sec })}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                      config.durationSeconds === sec
                        ? "bg-[#E8913C] text-[#0A0C0E] font-bold"
                        : "bg-[#0A0C0E] text-[#9EA5A8] hover:text-[#EDE7DC] border border-[#EDE7DC]/10"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#EDE7DC]/10 text-xs font-sora">
              {/* Autoplay */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 cursor-pointer hover:border-[#EDE7DC]/20 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-[#2E6B72]" />
                  <div>
                    <p className="font-semibold text-[#EDE7DC]">Autoplay Slides</p>
                    <p className="text-[10px] text-[#6C7378]">Automatically advance</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoPlay}
                  onChange={(e) => setConfig({ ...config, autoPlay: e.target.checked })}
                  className="w-4 h-4 accent-[#E8913C]"
                />
              </label>

              {/* Looping */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 cursor-pointer hover:border-[#EDE7DC]/20 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Repeat className="w-4 h-4 text-[#2E6B72]" />
                  <div>
                    <p className="font-semibold text-[#EDE7DC]">Continuous Loop</p>
                    <p className="text-[10px] text-[#6C7378]">Loop playlist forever</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.loop}
                  onChange={(e) => setConfig({ ...config, loop: e.target.checked })}
                  className="w-4 h-4 accent-[#E8913C]"
                />
              </label>

              {/* Visitor Overlay Attribution */}
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 cursor-pointer hover:border-[#EDE7DC]/20 transition-colors sm:col-span-2">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-[#E8913C]" />
                  <div>
                    <p className="font-semibold text-[#EDE7DC]">Show Visitor Attribution Overlay</p>
                    <p className="text-[10px] text-[#6C7378]">
                      Display name and returning visitor status badge on lower-third of slides
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.showInfoOverlay}
                  onChange={(e) => setConfig({ ...config, showInfoOverlay: e.target.checked })}
                  className="w-4 h-4 accent-[#E8913C]"
                />
              </label>
            </div>
          </div>

          {/* Card: Cinematic Motion & Framing */}
          <div className="p-6 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-5">
            <h2 className="text-base font-syne font-bold text-[#EDE7DC] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E8913C]" />
              Visual Styling & Transitions
            </h2>

            {/* Transition Selector */}
            <div className="space-y-2">
              <label className="text-xs font-sora text-[#9EA5A8]">Cinematic Transition Effect</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "kenburns" as const,
                    title: "Ken Burns",
                    desc: "Slow dynamic scale & crossfade",
                  },
                  {
                    id: "crossfade" as const,
                    title: "Crossfade",
                    desc: "Pure smooth opacity blend",
                  },
                  {
                    id: "slide" as const,
                    title: "Slide",
                    desc: "Directional panoramic glide",
                  },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setConfig({ ...config, transition: t.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.transition === t.id
                        ? "bg-[#E8913C]/15 border-[#E8913C] text-[#EDE7DC] shadow-sm shadow-[#E8913C]/10"
                        : "bg-[#0A0C0E] border-[#EDE7DC]/10 text-[#9EA5A8] hover:text-[#EDE7DC] hover:border-[#EDE7DC]/20"
                    }`}
                  >
                    <p className="font-sora font-semibold text-xs">{t.title}</p>
                    <p className="text-[10px] text-[#6C7378] mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Framing Mode Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-sora text-[#9EA5A8]">Smart TV Display Framing</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: "ambient" as const,
                    title: "Ambient Blur (Recommended)",
                    desc: "Sharp foreground + blurred backdrop for portrait photos",
                  },
                  {
                    id: "contain" as const,
                    title: "Contain Letterbox",
                    desc: "Fit complete image inside black bars",
                  },
                  {
                    id: "cover" as const,
                    title: "Cover Full-Screen",
                    desc: "Fills screen completely edge-to-edge",
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setConfig({ ...config, fitMode: f.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.fitMode === f.id
                        ? "bg-[#2E6B72]/20 border-[#2E6B72] text-[#EDE7DC] shadow-sm shadow-[#2E6B72]/10"
                        : "bg-[#0A0C0E] border-[#EDE7DC]/10 text-[#9EA5A8] hover:text-[#EDE7DC] hover:border-[#EDE7DC]/20"
                    }`}
                  >
                    <p className="font-sora font-semibold text-xs">{f.title}</p>
                    <p className="text-[10px] text-[#6C7378] mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#101317] border border-[#EDE7DC]/10">
            <span className="text-xs font-sora text-[#9EA5A8]">
              Configuration is persisted in MongoDB & synchronized to `/display`
            </span>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8913C] hover:bg-[#E8913C]/90 text-[#0A0C0E] font-sora font-bold text-xs transition-colors shadow-sm shadow-[#E8913C]/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Persisting..." : "Save Settings"}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Column: TV Status & Instructions */}
        <div className="space-y-6">
          {/* Status Telemetry Card */}
          <div className="p-6 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-syne font-bold text-[#EDE7DC] flex items-center gap-2">
                <Tv className="w-4 h-4 text-[#E8913C]" />
                Display Broadcast Telemetry
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 text-xs font-sora">
              <div className="flex justify-between">
                <span className="text-[#6C7378]">Active TV Photos</span>
                <span className="font-mono font-bold text-[#EDE7DC]">
                  {meta.totalActivePhotos}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C7378]">Sync Cadence</span>
                <span className="font-mono text-[#E8913C]">Delta Polling (4s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6C7378]">Display Route</span>
                <span className="font-mono text-[#2E6B72]">/display</span>
              </div>
            </div>

            <Link
              href={displayUrl}
              target="_blank"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#2E6B72] hover:bg-[#2E6B72]/90 text-[#EDE7DC] text-xs font-sora font-medium transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open Fullscreen Display</span>
            </Link>
          </div>

          {/* Smart TV Display & Keyboard Shortcuts Card */}
          <div className="p-6 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-4 text-xs font-sora">
            <h3 className="text-sm font-syne font-bold text-[#EDE7DC] flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-[#2E6B72]" />
              Smart TV & Remote Control Guide
            </h3>

            <p className="text-[#9EA5A8] text-[11px] leading-relaxed">
              When deployed to a Smart TV or reception kiosk monitor, use the following remote or keyboard controls:
            </p>

            <div className="space-y-2 pt-1 font-mono text-[11px]">
              <div className="flex justify-between items-center py-1.5 border-b border-[#EDE7DC]/5">
                <span className="text-[#9EA5A8]">Spacebar / OK</span>
                <span className="text-[#EDE7DC] bg-[#0A0C0E] px-2 py-0.5 rounded border border-[#EDE7DC]/10">
                  Play / Pause
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#EDE7DC]/5">
                <span className="text-[#9EA5A8]">Right Arrow / Next</span>
                <span className="text-[#EDE7DC] bg-[#0A0C0E] px-2 py-0.5 rounded border border-[#EDE7DC]/10">
                  Next Photo
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#EDE7DC]/5">
                <span className="text-[#9EA5A8]">Left Arrow / Back</span>
                <span className="text-[#EDE7DC] bg-[#0A0C0E] px-2 py-0.5 rounded border border-[#EDE7DC]/10">
                  Previous Photo
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#EDE7DC]/5">
                <span className="text-[#9EA5A8]">F Key</span>
                <span className="text-[#EDE7DC] bg-[#0A0C0E] px-2 py-0.5 rounded border border-[#EDE7DC]/10">
                  Toggle Fullscreen
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#EDE7DC]/5">
                <span className="text-[#9EA5A8]">I Key</span>
                <span className="text-[#EDE7DC] bg-[#0A0C0E] px-2 py-0.5 rounded border border-[#EDE7DC]/10">
                  Toggle Visitor Overlay
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0A0C0E] border border-[#EDE7DC]/10 text-[10px] text-[#6C7378]">
              Controls automatically auto-hide after 3.5 seconds of inactivity for a clean gallery presentation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
