import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Quality = "auto" | "full" | "battery";
export type ResolvedQuality = "full" | "battery";

type State = {
  quality: Quality;
  reduceMotion: boolean;
  showAspects: boolean;
  setQuality: (q: Quality) => void;
  setReduceMotion: (v: boolean) => void;
  setShowAspects: (v: boolean) => void;
};

export const useSettings = create<State>()(
  persist(
    (set) => ({
      quality: "auto",
      reduceMotion: false,
      showAspects: true,
      setQuality: (quality) => set({ quality }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setShowAspects: (showAspects) => set({ showAspects }),
    }),
    { name: "horathai-settings" },
  ),
);

/** Detects whether this device can comfortably run the full WebGL universe. */
export function detectCapability(): ResolvedQuality {
  if (typeof window === "undefined") return "battery";
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "battery";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "battery";
  if ((nav.deviceMemory ?? 4) < 4) return "battery";
  if ((nav.hardwareConcurrency ?? 4) < 4) return "battery";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return "battery";
  } catch {
    return "battery";
  }
  return "full";
}
