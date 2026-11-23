"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Sliders,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
} from "lucide-react";
import { SlideshowSettings, TransitionType, FitMode } from "./types";

interface SlideshowControlsProps {
  visible: boolean;
  settings: SlideshowSettings;
  isFullscreen: boolean;
  totalPhotos: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
  onUpdateSettings: (settings: Partial<SlideshowSettings>) => void;
}

const DURATIONS = [3, 5, 8, 10, 15];

export function SlideshowControls({
  visible,
  settings,
  isFullscreen,
  totalPhotos,
  onTogglePlay,
  onPrev,
  onNext,
  onToggleFullscreen,
  onUpdateSettings,
}: SlideshowControlsProps) {
  const [showSettingsDrawer, setShowSettingsDrawer] = React.useState(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-6 left-6 right-6 z-50 flex items-center justify-between select-none"
        >
          {/* Left: Live Status Pill & Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-[#101317]/90 backdrop-blur-xl border border-hairline rounded-full px-4 py-2 flex items-center gap-2.5 shadow-2xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal" />
              </span>
              <span className="font-syne font-bold text-xs uppercase tracking-[0.2em] text-primary-text">
                Live Slideshow
              </span>
              <span className="text-secondary-text text-xs hidden sm:inline">
                • {totalPhotos} {totalPhotos === 1 ? "Photo" : "Photos"}
              </span>
            </div>
          </div>

          {/* Center: Playback Navigation Controls */}
          {totalPhotos > 0 && (
            <div className="bg-[#101317]/90 backdrop-blur-xl border border-hairline rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-2xl">
              <button
                onClick={onPrev}
                title="Previous photo (Left Arrow)"
                className="p-2 rounded-full hover:bg-white/10 text-secondary-text hover:text-primary-text transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onTogglePlay}
                title={settings.autoPlay ? "Pause (Spacebar)" : "Play (Spacebar)"}
                className="p-2.5 rounded-full bg-amber/20 hover:bg-amber/30 text-amber transition-colors"
                aria-label={settings.autoPlay ? "Pause slideshow" : "Play slideshow"}
              >
                {settings.autoPlay ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                title="Next photo (Right Arrow)"
                className="p-2 rounded-full hover:bg-white/10 text-secondary-text hover:text-primary-text transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Right: Display Preferences & Fullscreen Toggle */}
          <div className="flex items-center gap-2">
            {/* Quick Duration Selector */}
            <div className="hidden md:flex items-center bg-[#101317]/90 backdrop-blur-xl border border-hairline rounded-full p-1 shadow-2xl text-xs font-mono">
              {DURATIONS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => onUpdateSettings({ durationSeconds: sec })}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    settings.durationSeconds === sec
                      ? "bg-teal text-white font-semibold"
                      : "text-muted hover:text-primary-text"
                  }`}
                  title={`Show each photo for ${sec} seconds`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* Quick Settings Toggle Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                className={`p-2.5 rounded-full border border-hairline backdrop-blur-xl transition-all shadow-2xl ${
                  showSettingsDrawer
                    ? "bg-amber text-black border-amber"
                    : "bg-[#101317]/90 hover:bg-[#1a1f24] text-secondary-text hover:text-primary-text"
                }`}
                title="Slideshow Settings"
                aria-label="Slideshow Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Popover Settings Drawer */}
              <AnimatePresence>
                {showSettingsDrawer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-[#101317]/98 backdrop-blur-2xl border border-hairline rounded-2xl p-4 shadow-2xl text-xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-hairline pb-2 font-syne font-bold uppercase tracking-wider text-primary-text">
                      <span>Display Settings</span>
                      <span className="text-[10px] text-teal font-mono">TV Ready</span>
                    </div>

                    {/* Duration slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-muted">
                        <span>Duration per slide:</span>
                        <span className="text-amber font-mono font-semibold">
                          {settings.durationSeconds}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="20"
                        step="1"
                        value={settings.durationSeconds}
                        onChange={(e) =>
                          onUpdateSettings({ durationSeconds: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-amber cursor-pointer bg-black/40 rounded-lg h-1.5"
                      />
                    </div>

                    {/* Transition Selector */}
                    <div className="space-y-1.5">
                      <span className="text-muted block">Transition Effect:</span>
                      <div className="grid grid-cols-3 gap-1">
                        {(["kenburns", "crossfade", "slide"] as TransitionType[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => onUpdateSettings({ transition: t })}
                            className={`py-1.5 px-2 rounded-lg text-center capitalize transition-colors font-mono text-[11px] ${
                              settings.transition === t
                                ? "bg-teal/20 text-teal border border-teal/40 font-medium"
                                : "bg-black/30 hover:bg-black/50 text-secondary-text"
                            }`}
                          >
                            {t === "kenburns" ? "Ken Burns" : t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Scaling */}
                    <div className="space-y-1.5">
                      <span className="text-muted block">Image Framing:</span>
                      <div className="grid grid-cols-3 gap-1">
                        {(["ambient", "contain", "cover"] as FitMode[]).map((f) => (
                          <button
                            key={f}
                            onClick={() => onUpdateSettings({ fitMode: f })}
                            className={`py-1.5 px-2 rounded-lg text-center capitalize transition-colors font-mono text-[11px] ${
                              settings.fitMode === f
                                ? "bg-amber/20 text-amber border border-amber/40 font-medium"
                                : "bg-black/30 hover:bg-black/50 text-secondary-text"
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Info Overlay Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-hairline">
                      <span className="text-secondary-text">Visitor Details</span>
                      <button
                        onClick={() =>
                          onUpdateSettings({ showInfoOverlay: !settings.showInfoOverlay })
                        }
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-primary-text"
                        title="Toggle attribution overlay (I key)"
                      >
                        {settings.showInfoOverlay ? (
                          <Eye className="w-4 h-4 text-teal" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={onToggleFullscreen}
              className="p-2.5 rounded-full bg-[#101317]/90 hover:bg-[#1a1f24] border border-hairline text-secondary-text hover:text-primary-text transition-colors shadow-2xl"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
