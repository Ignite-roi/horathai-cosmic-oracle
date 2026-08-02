import { useEffect, useState } from "react";

import { detectCapability, useSettings, type ResolvedQuality } from "@/store/useSettings";

/** Resolves the user's quality preference against real device capability. */
export function useQuality(): { quality: ResolvedQuality; hydrated: boolean } {
  const pref = useSettings((s) => s.quality);
  const [detected, setDetected] = useState<ResolvedQuality | null>(null);

  useEffect(() => {
    setDetected(detectCapability());
  }, []);

  if (detected === null) return { quality: "battery", hydrated: false };
  if (pref === "full") return { quality: "full", hydrated: true };
  if (pref === "battery") return { quality: "battery", hydrated: true };
  return { quality: detected, hydrated: true };
}

/** True once the client has hydrated — for browser-only rendering. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

/** Pauses expensive rendering when the tab is hidden. */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
}
