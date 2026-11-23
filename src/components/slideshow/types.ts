import { SlideshowItem } from "@/app/api/slideshow/route";

export type { SlideshowItem };

export type TransitionType = "kenburns" | "crossfade" | "slide";
export type FitMode = "ambient" | "contain" | "cover";

export interface SlideshowSettings {
  durationSeconds: number; // Duration in seconds (e.g., 5)
  transition: TransitionType;
  fitMode: FitMode;
  showInfoOverlay: boolean;
  autoPlay: boolean;
}

export interface NewPhotoAlert {
  id: string;
  visitorName: string;
  imageUrl: string;
  timestamp: number;
}
