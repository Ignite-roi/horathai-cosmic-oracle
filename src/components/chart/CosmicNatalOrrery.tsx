import { useEffect, useRef, useState, type CSSProperties } from "react";

import type { ChartPlanet } from "@/lib/astrology-engine.server";
import { ZODIACS } from "@/lib/astro";
import { aspectPairs, layoutPlanets, polarPoint } from "@/lib/chart-geometry";
import type { ChartView } from "./ChartControls";

export function CosmicNatalOrrery({ planets, transitPlanets = [], ascendant, showAspects, fullNames, view, onSelect }: { planets: ChartPlanet[]; transitPlanets?: ChartPlanet[]; ascendant?: number; showAspects: boolean; fullNames: boolean; view: ChartView; onSelect: (planet: ChartPlanet) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting) && !document.hidden), { threshold: 0.1 });
    const onVisibility = () => setActive(!document.hidden);
    observer.observe(element); document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  const points = layoutPlanets(planets, view);
  const transitPoints = layoutPlanets(transitPlanets, view);
  const aspects = aspectPairs(planets);
  return (
    <div ref={container} className="orrery-shell mt-4 aspect-square w-full overflow-hidden rounded-[28px]" data-motion={active ? "running" : "paused"}>
      <svg viewBox="0 0 480 480" role="img" aria-label="ผังดวงกำเนิดจักรวาล แสดงราศี ภพ ลัคนา และตำแหน่งดาวจริง" className="h-full w-full">
        <defs>
          <radialGradient id="core"><stop offset="0" stopColor="var(--gold-hot)"/><stop offset=".2" stopColor="var(--gold)"/><stop offset="1" stopColor="var(--gold)" stopOpacity="0"/></radialGradient>
          <radialGradient id="sphere"><stop offset="0" stopColor="var(--gold-hot)"/><stop offset=".35" stopColor="var(--planet-color)"/><stop offset="1" stopColor="var(--void)"/></radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <g className="orrery-drift">
          <circle cx="240" cy="240" r="219" className="orrery-ring-strong" />
          <circle cx="240" cy="240" r="184" className="orrery-ring" />
          <circle cx="240" cy="240" r="146" className="orrery-ring" />
          <circle cx="240" cy="240" r="108" className="orrery-ring" />
          {ZODIACS.map((z, index) => {
            const boundary = polarPoint(index * 30, 219); const inner = polarPoint(index * 30, 184); const label = polarPoint(index * 30 + 15, 202); const house = ascendant === undefined ? null : ((z.id - 1 - Math.floor(ascendant / 30) + 12) % 12) + 1;
            return <g key={z.id}><line x1={inner.x} y1={inner.y} x2={boundary.x} y2={boundary.y} className="orrery-line"/><text x={label.x} y={label.y - 3} className="orrery-zodiac" textAnchor="middle">{z.symbol}</text><text x={label.x} y={label.y + 11} className="orrery-label" textAnchor="middle">{z.th}</text>{house && <text x={label.x} y={label.y + 22} className="orrery-house" textAnchor="middle">ภพ {house}</text>}</g>;
          })}
          {showAspects && aspects.map((aspect) => { const a = points.find((p) => p.num === aspect.a.num); const b = points.find((p) => p.num === aspect.b.num); return a && b ? <line key={`${a.num}-${b.num}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={aspect.benefic ? "orrery-aspect-good" : "orrery-aspect-watch"}/> : null; })}
          {ascendant !== undefined && (() => { const end = polarPoint(ascendant, 222); const tag = polarPoint(ascendant, 172); return <g><line x1="240" y1="240" x2={end.x} y2={end.y} className="orrery-asc"/><path d={`M ${end.x} ${end.y} l -7 -5 l 1 9 z`} className="orrery-asc-marker"/><text x={tag.x} y={tag.y} className="orrery-asc-label" textAnchor="middle">ลัคนา</text></g>; })()}
          {[...points, ...transitPoints].map((planet, index) => <g key={`${index < points.length ? 'n' : 't'}-${planet.num}`} role="button" tabIndex={0} onClick={() => onSelect(planet)} onKeyDown={(event) => { if (event.key === "Enter") onSelect(planet); }} className="cursor-pointer focus:outline-none"><line x1={planet.x} y1={planet.y} x2={planet.labelX} y2={planet.labelY} className="orrery-leader"/><circle cx={planet.x} cy={planet.y} r={index < points.length ? 12 : 8} fill="url(#sphere)" filter="url(#glow)" style={{ "--planet-color": planet.color } as CSSProperties}/><text x={planet.x} y={planet.y + 4} textAnchor="middle" className="orrery-planet-number">{planet.thaiNumeral}</text><text x={planet.labelX} y={planet.labelY} textAnchor="middle" className="orrery-planet-label">{fullNames ? planet.th : planet.thaiNumeral}{planet.retrograde ? " พักร์" : ""}</text></g>)}
        </g>
        <circle cx="240" cy="240" r="53" fill="url(#core)" className="orrery-core"/><circle cx="240" cy="240" r="10" fill="var(--gold-hot)" filter="url(#glow)"/><text x="240" y="264" textAnchor="middle" className="orrery-center-label">จักรวาลของคุณ</text>
      </svg>
    </div>
  );
}