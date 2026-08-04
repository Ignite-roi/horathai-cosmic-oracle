import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { ChartPlanet } from "@/lib/astrology-engine.server";
import { ZODIACS } from "@/lib/astro";
import { aspectPairs, layoutRingPlanets, polarPoint } from "@/lib/chart-geometry";
import type { ChartView } from "./ChartControls";

export function CosmicNatalOrrery({
  planets,
  transitPlanets = [],
  ascendant,
  showAspects,
  fullNames,
  view,
  mode = "natal",
  ascendantLabel = "ลัคนา",
  onSelect,
}: {
  planets: ChartPlanet[];
  transitPlanets?: ChartPlanet[];
  ascendant?: number;
  showAspects: boolean;
  fullNames: boolean;
  view: ChartView;
  mode?: "natal" | "transit" | "both";
  ascendantLabel?: string;
  onSelect: (planet: ChartPlanet, origin: "natal" | "transit") => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(Boolean(entry?.isIntersecting) && !document.hidden),
      { threshold: 0.1 },
    );
    const onVisibility = () => setActive(!document.hidden);
    observer.observe(element);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const showNatal = mode !== "transit";
  const showTransit = mode !== "natal";
  const points = showNatal ? layoutRingPlanets(planets, "natal", view) : [];
  const transitPoints = showTransit ? layoutRingPlanets(transitPlanets, "transit", view) : [];
  const aspects = aspectPairs(planets);
  return (
    <div
      ref={container}
      className="orrery-shell mt-4 aspect-square w-full overflow-hidden rounded-[28px]"
      data-motion={active ? "running" : "paused"}
      data-chart-mode={mode}
    >
      <svg
        viewBox="0 0 480 480"
        role="img"
        aria-label="ผังดวงกำเนิดจักรวาล แสดงราศี ภพ ลัคนา และตำแหน่งดาวจริง"
        className="h-full w-full"
      >
        <defs>
          <radialGradient id="core">
            <stop offset="0" stopColor="var(--gold-hot)" />
            <stop offset=".2" stopColor="var(--gold)" />
            <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sphere">
            <stop offset="0" stopColor="var(--gold-hot)" />
            <stop offset=".35" stopColor="var(--planet-color)" />
            <stop offset="1" stopColor="var(--void)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="orrery-drift">
          <circle cx="240" cy="240" r="219" className="orrery-ring-strong" />
          <circle
            cx="240"
            cy="240"
            r="184"
            className="orrery-ring-strong orrery-transit-boundary"
          />
          <circle cx="240" cy="240" r="146" className="orrery-ring" />
          <circle cx="240" cy="240" r="108" className="orrery-ring" />
          {ZODIACS.map((z, index) => {
            const boundary = polarPoint(index * 30, 219);
            const inner = polarPoint(index * 30, 184);
            const label = polarPoint(index * 30 + 15, 202);
            const house =
              ascendant === undefined
                ? null
                : ((z.id - 1 - Math.floor(ascendant / 30) + 12) % 12) + 1;
            return (
              <g key={z.id}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={boundary.x}
                  y2={boundary.y}
                  className="orrery-line"
                />
                <text x={label.x} y={label.y - 3} className="orrery-zodiac" textAnchor="middle">
                  {z.symbol}
                </text>
                <text x={label.x} y={label.y + 11} className="orrery-label" textAnchor="middle">
                  {z.th}
                </text>
                {house && (
                  <text x={label.x} y={label.y + 22} className="orrery-house" textAnchor="middle">
                    ภพ {house}
                  </text>
                )}
              </g>
            );
          })}
          {showNatal &&
            showAspects &&
            aspects.map((aspect) => {
              const a = points.find((p) => p.num === aspect.a.num);
              const b = points.find((p) => p.num === aspect.b.num);
              return a && b ? (
                <line
                  key={`${a.num}-${b.num}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className={aspect.benefic ? "orrery-aspect-good" : "orrery-aspect-watch"}
                />
              ) : null;
            })}
          {ascendant !== undefined &&
            (() => {
              const end = polarPoint(ascendant, 222);
              const tag = polarPoint(ascendant, 161);
              return (
                <g>
                  <line x1="240" y1="240" x2={end.x} y2={end.y} className="orrery-asc" />
                  <path d={`M ${end.x} ${end.y} l -7 -5 l 1 9 z`} className="orrery-asc-marker" />
                  <text x={tag.x} y={tag.y} className="orrery-asc-label" textAnchor="middle">
                    {ascendantLabel}
                  </text>
                </g>
              );
            })()}
          {points.map((planet) => (
            <PlanetMarker
              key={`n-${planet.num}`}
              planet={planet}
              origin="natal"
              fullNames={fullNames}
              onSelect={onSelect}
            />
          ))}
          {transitPoints.map((planet) => (
            <PlanetMarker
              key={`t-${planet.num}`}
              planet={planet}
              origin="transit"
              fullNames={fullNames}
              onSelect={onSelect}
            />
          ))}
        </g>
        <circle cx="240" cy="240" r="53" fill="url(#core)" className="orrery-core" />
        <circle cx="240" cy="240" r="10" fill="var(--gold-hot)" filter="url(#glow)" />
        <text x="240" y="256" textAnchor="middle" className="orrery-center-title">
          HORATHAI
        </text>
        <text x="240" y="270" textAnchor="middle" className="orrery-center-label">
          {ascendantLabel}
        </text>
      </svg>
      <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full border border-primary/15 bg-void/75 px-3 py-1.5 text-[9px] text-muted-foreground backdrop-blur-md">
        {showNatal && (
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full border border-primary bg-primary/30" />
            ดาวกำเนิด
          </span>
        )}
        {showTransit && (
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rotate-45 border border-accent bg-accent/25" />
            ดาวจร
          </span>
        )}
      </div>
    </div>
  );
}

function PlanetMarker({
  planet,
  origin,
  fullNames,
  onSelect,
}: {
  planet: ReturnType<typeof layoutRingPlanets>[number];
  origin: "natal" | "transit";
  fullNames: boolean;
  onSelect: (planet: ChartPlanet, origin: "natal" | "transit") => void;
}) {
  const title = `${origin === "natal" ? "ดาวกำเนิด" : "ดาวจร"} ดาว${planet.th} ราศี${planet.signTh} ${planet.degree} องศา ${planet.minute} ลิปดา${planet.retrograde ? " พักร์" : " เดินหน้า"}`;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={() => onSelect(planet, origin)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect(planet, origin);
      }}
      className={`cursor-pointer focus:outline-none ${origin === "transit" ? "orrery-transit-planet" : "orrery-natal-planet"}`}
    >
      <title>{title}</title>
      <line
        x1={planet.x}
        y1={planet.y}
        x2={planet.labelX}
        y2={planet.labelY}
        className="orrery-leader"
      />
      {origin === "natal" ? (
        <circle
          cx={planet.x}
          cy={planet.y}
          r="11"
          fill="url(#sphere)"
          filter="url(#glow)"
          style={{ "--planet-color": planet.color } as CSSProperties}
        />
      ) : (
        <rect
          x={planet.x - 7}
          y={planet.y - 7}
          width="14"
          height="14"
          rx="2"
          transform={`rotate(45 ${planet.x} ${planet.y})`}
          className="orrery-transit-marker"
        />
      )}
      <text x={planet.x} y={planet.y + 3} textAnchor="middle" className="orrery-planet-number">
        {planet.thaiNumeral}
      </text>
      <text
        x={planet.labelX}
        y={planet.labelY + 3}
        textAnchor="middle"
        className={`orrery-planet-label ${origin === "transit" ? "orrery-transit-label" : ""}`}
      >
        {fullNames ? planet.th : planet.thaiNumeral}
        {planet.retrograde ? " R" : ""}
      </text>
    </g>
  );
}
