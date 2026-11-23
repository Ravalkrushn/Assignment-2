"use client";

import React from "react";
import { useSlideshow } from "@/components/slideshow/useSlideshow";
import { SlideshowView } from "@/components/slideshow/SlideshowView";
import { SlideshowEmptyState } from "@/components/slideshow/SlideshowEmptyState";
import { SlideshowInfoOverlay } from "@/components/slideshow/SlideshowInfoOverlay";
import { SlideshowControls } from "@/components/slideshow/SlideshowControls";
import { SlideshowNotification } from "@/components/slideshow/SlideshowNotification";
import { Radio } from "lucide-react";

export default function DisplayPage() {
  const {
    photos,
    currentPhoto,
    currentIndex,
    totalPhotos,
    isLoading,
    error,
    progress,
    settings,
    isFullscreen,
    isControlsVisible,
    newPhotoAlert,
    goToNext,
    goToPrev,
    togglePlay,
    toggleFullscreen,
    updateSettings,
    handleImageError,
    triggerActivity,
    refetch,
  } = useSlideshow();

  return (
    <main
      className="relative w-screen h-screen bg-[#0A0C0E] overflow-hidden select-none cursor-default"
      onMouseMove={triggerActivity}
      onTouchStart={triggerActivity}
      onClick={triggerActivity}
    >
      {/* 1. Loading State */}
      {isLoading && photos.length === 0 && (
        <div className="absolute inset-0 z-50 bg-[#0A0C0E] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border border-teal/40 flex items-center justify-center mb-4">
            <Radio className="w-6 h-6 text-teal animate-pulse" />
          </div>
          <p className="font-syne text-lg font-bold text-primary-text tracking-wide mb-1">
            INITIALIZING SMART DISPLAY
          </p>
          <p className="text-xs text-muted font-mono uppercase tracking-widest">
            Connecting to live visitor stream...
          </p>
        </div>
      )}

      {/* 2. Empty State */}
      {!isLoading && photos.length === 0 && (
        <SlideshowEmptyState onRefresh={refetch} />
      )}

      {/* 3. Active Slideshow Stage */}
      {photos.length > 0 && (
        <>
          {/* Main Visual Stage */}
          <SlideshowView
            currentPhoto={currentPhoto}
            settings={settings}
            onError={handleImageError}
          />

          {/* Lower Third Cinematic Attribution */}
          <SlideshowInfoOverlay
            photo={currentPhoto}
            currentIndex={currentIndex}
            totalPhotos={totalPhotos}
            visible={settings.showInfoOverlay}
            progress={progress}
            isAutoPlay={settings.autoPlay}
          />

          {/* Auto-Hiding TV HUD Controls */}
          <SlideshowControls
            visible={isControlsVisible}
            settings={settings}
            isFullscreen={isFullscreen}
            totalPhotos={totalPhotos}
            onTogglePlay={togglePlay}
            onPrev={goToPrev}
            onNext={goToNext}
            onToggleFullscreen={toggleFullscreen}
            onUpdateSettings={updateSettings}
          />

          {/* Toast / Notification for Live Upload Arrivals */}
          <SlideshowNotification alert={newPhotoAlert} />
        </>
      )}

      {/* Error Banner (non-intrusive) */}
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-950/80 border border-red-500/30 text-red-200 text-xs px-4 py-2 rounded-full backdrop-blur-md">
          {error} • Retrying connection...
        </div>
      )}
    </main>
  );
}
