import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { usePageVisible } from "@/hooks/useQuality";
import type { PlanetShift } from "@/hooks/useTimeTravel";

const SIZE = 260;
const CENTER = SIZE / 2;
const RINGS = [46, 60, 74, 88, 102, 116];

/**
 * Lightweight SVG orrery — no WebGL canvas, so it stays cheap inside the LINE
 * WebView. Rotation pauses when the tab is hidden or the section scrolls out
 * of view, and stops entirely under reduced-motion.
 */
export function TransitOrbit({ shifts }: { shifts: PlanetShift[] }) {
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(Boolean(entry?.isIntersecting)), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animating = !reduced && pageVisible && onScreen;

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[300px]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-auto w-full"
        role="img"
        aria-label="ภาพจำลองตำแหน่งดาวจรรอบลัคนา"
      >
        <defs>
          <radialGradient id="orbit-core" cx="50%" cy="50%">
            <stop offset="0%" stopColor="var(--gold-hot)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--gold-deep)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CENTER} cy={CENTER} r={30} fill="url(#orbit-core)" />

        <g
          style={{
            transformOrigin: "50% 50%",
            animation: animating ? "orbit-spin 220s linear infinite" : "none",
          }}
        >
          {RINGS.map((r) => (
            <circle
              key={r}
              cx={CENTER}
              cy={CENTER}
              r={r}
              fill="none"
              stroke="color-mix(in oklab, var(--gold) 16%, transparent)"
              strokeWidth={0.6}
              strokeDasharray="2 6"
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={CENTER + Math.cos(a) * 34}
                y1={CENTER + Math.sin(a) * 34}
                x2={CENTER + Math.cos(a) * 122}
                y2={CENTER + Math.sin(a) * 122}
                stroke="color-mix(in oklab, var(--gold) 10%, transparent)"
                strokeWidth={0.5}
              />
            );
          })}
        </g>

        {shifts.map((s, i) => {
          const radius = RINGS[i % RINGS.length]!;
          const angle = ((s.to.longitude - 90) * Math.PI) / 180;
          const x = CENTER + Math.cos(angle) * radius;
          const y = CENTER + Math.sin(angle) * radius;
          return (
            <g key={s.num}>
              <circle cx={x} cy={y} r={s.meaningful ? 9 : 6} fill={s.to.color} opacity={0.18} />
              <circle cx={x} cy={y} r={s.meaningful ? 4.4 : 3.2} fill={s.to.color} />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontSize="7.5"
                fill={s.to.color}
                opacity={0.9}
              >
                {s.to.thaiNumeral}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
