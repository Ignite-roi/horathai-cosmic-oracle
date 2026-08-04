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
  ไฟ: { hue: "#5a2a12", tint: "#ffe6cb" },
  ดิน: { hue: "#2c3f1d", tint: "#e9f0dd" },
  ลม: { hue: "#1e3364", tint: "#dbe6ff" },
  น้ำ: { hue: "#33196b", tint: "#e9dcff" },
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
      energy: night ? 0.34 : dusk ? 0.26 : 0.18,
      stars: night ? 1300 : 900,
      glow: 0.16 + fullness * 0.28,
      night,
    };
  }, [element, moonPhase]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* near-black foundation — always present, also the battery-saver visual */}
      <div className="absolute inset-0 bg-[var(--gradient-void)]" />

      {/* deep-violet nebula pools, kept small and off-center so they never wash the screen */}
      <div
        className="absolute -left-[18%] top-[-12%] h-[62vh] w-[78vw] rounded-full blur-3xl animate-aurora"
        style={{
          background: `radial-gradient(circle, ${mood.hue}, transparent 66%)`,
          opacity: mood.energy,
        }}
      />
      <div
        className="absolute bottom-[-22%] right-[-20%] h-[58vh] w-[70vw] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, color-mix(in oklab, var(--nebula) 42%, transparent), transparent 64%)",
          opacity: 0.22,
        }}
      />

      {/* single warm directional key light from the top-right */}
      <div
        className="absolute right-[-14%] top-[-6%] h-72 w-72 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--gold-soft), transparent 60%)",
          opacity: mood.glow * 0.34,
        }}
      />

      {/* faint astrology geometry */}
      <svg
        className="absolute left-1/2 top-[6%] h-[86vw] w-[86vw] max-h-[520px] max-w-[520px] -translate-x-1/2 animate-orbit-slow opacity-[0.055]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="96" stroke="var(--gold)" strokeWidth="0.4" />
        <circle cx="100" cy="100" r="78" stroke="var(--gold)" strokeWidth="0.3" strokeDasharray="1 3" />
        <circle cx="100" cy="100" r="54" stroke="var(--gold)" strokeWidth="0.3" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 54}
              y1={100 + Math.sin(a) * 54}
              x2={100 + Math.cos(a) * 96}
              y2={100 + Math.sin(a) * 96}
              stroke="var(--gold)"
              strokeWidth="0.3"
            />
          );
        })}
      </svg>

      {hydrated && visible && quality === "full" && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 opacity-70">
            <LiveUniverseGL starCount={mood.stars} tint={mood.tint} hue={mood.hue} energy={mood.energy} />
          </div>
        </Suspense>
      )}

      {/* film grain keeps the big gradients from banding */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(oklch(1 0 0) 0.5px, transparent 0.5px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* vignette — protects text contrast at every edge */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 88% at 50% 34%, transparent 34%, oklch(0.02 0.008 285 / 55%) 78%, oklch(0.015 0.006 285 / 88%) 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-44 bg-linear-to-b from-black/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-black/85 to-transparent" />
    </div>
  );
}
