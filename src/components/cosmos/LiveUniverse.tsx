import { Suspense, lazy, useMemo } from "react";

import { useHydrated, usePageVisible, useQuality } from "@/hooks/useQuality";

const LiveUniverseGL = lazy(() => import("./LiveUniverseGL"));

export type SkyMood = {
  /** 0-1 lunar phase, 0.5 = full moon */
  moonPhase?: number;
  /** element of the ascendant, tints the nebula */
  element?: "ไฟ" | "ดิน" | "ลม" | "น้ำ";
};

const ELEMENT_HUE: Record<string, { hue: string; tint: string }> = {
  ไฟ: { hue: "#c2410c", tint: "#ffe0c2" },
  ดิน: { hue: "#4d7c2f", tint: "#e6f2d6" },
  ลม: { hue: "#3b6fd4", tint: "#d9e8ff" },
  น้ำ: { hue: "#6d28d9", tint: "#ecdcff" },
};

/** Live, data-driven cosmic backdrop. Adapts to time of day, moon and element. */
export function LiveUniverse({ moonPhase = 0.5, element = "น้ำ" }: SkyMood) {
  const hydrated = useHydrated();
  const visible = usePageVisible();
  const { quality } = useQuality();

  const mood = useMemo(() => {
    const hour = new Date().getHours();
    const night = hour < 6 || hour >= 19;
    const dusk = hour >= 17 && hour < 19;
    const palette = ELEMENT_HUE[element] ?? ELEMENT_HUE["น้ำ"]!;
    const fullness = 1 - Math.abs(moonPhase - 0.5) * 2;
    return {
      ...palette,
      energy: night ? 0.75 : dusk ? 0.55 : 0.35,
      stars: night ? 1800 : 1100,
      glow: 0.25 + fullness * 0.45,
      night,
    };
  }, [element, moonPhase]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base gradient — always present, also the battery-saver visual */}
      <div className="absolute inset-0 bg-[var(--gradient-void)]" />
      <div
        className="absolute inset-0 animate-aurora"
        style={{
          background: `radial-gradient(90% 70% at 50% -10%, color-mix(in oklab, ${mood.hue} 45%, transparent), transparent 68%)`,
          opacity: mood.energy,
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[-25%] h-[70vh] w-[85vw] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, color-mix(in oklab, var(--nebula) 55%, transparent), transparent 65%)`,
          opacity: 0.4,
        }}
      />
      {/* moon glow, brightness follows the real lunar phase */}
      <div
        className="absolute right-[-10%] top-[6%] h-56 w-56 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--gold-soft), transparent 62%)",
          opacity: mood.glow * 0.5,
        }}
      />

      {hydrated && visible && quality === "full" && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 opacity-90">
            <LiveUniverseGL starCount={mood.stars} tint={mood.tint} hue={mood.hue} energy={mood.energy} />
          </div>
        </Suspense>
      )}

      {/* film grain keeps the big gradients from banding */}
      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(oklch(1 0 0) 0.5px, transparent 0.5px)",
          backgroundSize: "3px 3px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
    </div>
  );
}
