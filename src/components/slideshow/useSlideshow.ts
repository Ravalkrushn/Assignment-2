"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SlideshowItem, SlideshowSettings, NewPhotoAlert } from "./types";

const DEFAULT_SETTINGS: SlideshowSettings = {
  durationSeconds: 5,
  transition: "kenburns",
  fitMode: "ambient",
  showInfoOverlay: true,
  autoPlay: true,
};

const STORAGE_KEY = "visitor_slideshow_settings";
const POLL_INTERVAL_MS = 4000;

export function useSlideshow() {
  const [photos, setPhotos] = useState<SlideshowItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [newPhotoAlert, setNewPhotoAlert] = useState<NewPhotoAlert | null>(null);
  const [settings, setSettings] = useState<SlideshowSettings>(DEFAULT_SETTINGS);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdatedRef = useRef<string | null>(null);
  const knownPhotoIdsRef = useRef<Set<string>>(new Set());

  // Load settings from localStorage and URL query parameters on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let initialSettings = DEFAULT_SETTINGS;
      if (saved) {
        try {
          initialSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
          // ignore parse error
        }
      }

      // Check URL search parameters
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const durationParam = params.get("duration") || params.get("interval");
        if (durationParam) {
          const val = parseInt(durationParam, 10);
          if (!isNaN(val) && val >= 2 && val <= 60) {
            initialSettings.durationSeconds = val;
          }
        }
        const fitParam = params.get("fit");
        if (fitParam && ["ambient", "contain", "cover"].includes(fitParam)) {
          initialSettings.fitMode = fitParam as SlideshowSettings["fitMode"];
        }
        const transitionParam = params.get("transition");
        if (transitionParam && ["kenburns", "crossfade", "slide"].includes(transitionParam)) {
          initialSettings.transition = transitionParam as SlideshowSettings["transition"];
        }
        const autoPlayParam = params.get("autoplay");
        if (autoPlayParam !== null) {
          initialSettings.autoPlay = autoPlayParam !== "false";
        }
      }

      setSettings(initialSettings);
    } catch {
      // ignore storage access issues
    }
  }, []);

  // Persist settings changes
  const updateSettings = useCallback((newSettings: Partial<SlideshowSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  // Initial fetch of photos
  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch("/api/slideshow", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load slideshow photos");

      const data = await res.json();
      if (data.success && Array.isArray(data.photos)) {
        setPhotos(data.photos);
        lastUpdatedRef.current = data.lastUpdated || null;
        const ids = new Set<string>(data.photos.map((p: SlideshowItem) => p.id));
        knownPhotoIdsRef.current = ids;
      }
      setError(null);
    } catch (err: unknown) {
      console.error("Slideshow fetch error:", err);
      setError("Unable to connect to live slideshow stream");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Polling for live photo updates
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const lastUpdated = lastUpdatedRef.current;
        const query = lastUpdated
          ? `/api/slideshow?since=${encodeURIComponent(lastUpdated)}&mode=delta`
          : "/api/slideshow";

        const res = await fetch(query, { cache: "no-store" });
        if (!res.ok) return;

        const deltaData = await res.json();

        // If delta indicated updates OR if polling full list
        if (deltaData.hasUpdates || !lastUpdated) {
          // Fetch complete current active list to sync accurately
          const fullRes = await fetch("/api/slideshow", { cache: "no-store" });
          if (!fullRes.ok) return;
          const fullData = await fullRes.json();

          if (fullData.success && Array.isArray(fullData.photos)) {
            const incomingPhotos: SlideshowItem[] = fullData.photos;
            const newIds = new Set<string>(incomingPhotos.map((p) => p.id));

            // Detect newly added photos
            const brandNewPhotos = incomingPhotos.filter(
              (p) => !knownPhotoIdsRef.current.has(p.id)
            );

            if (brandNewPhotos.length > 0) {
              const latestNew = brandNewPhotos[0];
              setNewPhotoAlert({
                id: latestNew.id,
                visitorName: latestNew.visitor.name,
                imageUrl: latestNew.imageUrl,
                timestamp: Date.now(),
              });

              if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
              alertTimeoutRef.current = setTimeout(() => {
                setNewPhotoAlert(null);
              }, 5000);
            }

            knownPhotoIdsRef.current = newIds;
            lastUpdatedRef.current = fullData.lastUpdated || null;

            // Preserve current photo position seamlessly
            setPhotos((prevPhotos) => {
              if (prevPhotos.length === 0) {
                return incomingPhotos;
              }
              const currentItem = prevPhotos[currentIndex];
              if (!currentItem) return incomingPhotos;

              // Find where the current item is in the new list
              const newIndex = incomingPhotos.findIndex((p) => p.id === currentItem.id);
              if (newIndex !== -1) {
                setCurrentIndex(newIndex);
              }
              return incomingPhotos;
            });
          }
        }
      } catch (e) {
        // Silent poll error recovery
        console.warn("Poll check notice:", e);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollInterval);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, [currentIndex]);

  // Navigate to next photo
  const goToNext = useCallback(() => {
    setPhotos((currentList) => {
      if (currentList.length === 0) return currentList;
      setCurrentIndex((prev) => (prev + 1) % currentList.length);
      return currentList;
    });
    setProgress(0);
  }, []);

  // Navigate to previous photo
  const goToPrev = useCallback(() => {
    setPhotos((currentList) => {
      if (currentList.length === 0) return currentList;
      setCurrentIndex((prev) => (prev - 1 + currentList.length) % currentList.length);
      return currentList;
    });
    setProgress(0);
  }, []);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    setSettings((prev) => ({ ...prev, autoPlay: !prev.autoPlay }));
  }, []);

  // Slide rotation timer
  useEffect(() => {
    if (!settings.autoPlay || photos.length <= 1) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const totalMs = Math.max(2, settings.durationSeconds) * 1000;
    const increment = (stepMs / totalMs) * 100;

    timerIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [settings.autoPlay, settings.durationSeconds, photos.length, goToNext]);

  // Handle broken/invalid image
  const handleImageError = useCallback(
    (brokenPhotoId: string) => {
      console.warn("Image load failed for:", brokenPhotoId);
      setPhotos((prev) => {
        const filtered = prev.filter((p) => p.id !== brokenPhotoId);
        if (filtered.length === 0) {
          setCurrentIndex(0);
          return [];
        }
        setCurrentIndex((curr) => curr % filtered.length);
        return filtered;
      });
      setProgress(0);
    },
    []
  );

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Activity detection: Auto-hide controls after 3.5s of no mouse interaction
  const triggerActivity = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3500);
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      triggerActivity();

      // Don't intercept if an input is focused
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          goToNext();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goToPrev();
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "i":
        case "I":
          e.preventDefault();
          updateSettings({ showInfoOverlay: !settings.showInfoOverlay });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [goToNext, goToPrev, togglePlay, toggleFullscreen, triggerActivity, settings.showInfoOverlay, updateSettings]);

  const currentPhoto = photos.length > 0 && currentIndex < photos.length ? photos[currentIndex] : null;

  return {
    photos,
    currentPhoto,
    currentIndex,
    totalPhotos: photos.length,
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
    refetch: fetchPhotos,
  };
}
