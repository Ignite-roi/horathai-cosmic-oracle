import { PLANET_BY_NUM, type PlacedPlanet } from "@/lib/astro";

/**
 * Personalised orrery for the Home hero.
 *
 * Deliberately SVG + CSS rather than WebGL: the background already owns the
 * only canvas on the page, and this must paint instantly inside the LINE
 * WebView.
 */
export function HeroOrrery({
  planets,
  ascendant,
  activeNum,
  className = "",
}: {
  planets: PlacedPlanet[];
  ascendant: number;
  activeNum?: number;
  className?: string;
}) {
  const C = 100;
  const rings = [34, 46, 58, 70, 82];

  // sidereal longitude → svg angle, with the ascendant pinned to the left horizon
  const angleOf = (lon: number) => ((lon - ascendant + 180) * Math.PI) / 180;

  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      className={`h-full w-full ${className}`}
      fill="none"
    >
      <defs>
        <radialGradient id="orrery-core" cx="50%" cy="42%">
          <stop offset="0%" stopColor="var(--gold-hot)" stopOpacity="0.95" />
          <stop offset="42%" stopColor="var(--gold)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--gold-bronze)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* slow counter-rotating scaffolding */}
      <g className="animate-orbit-slow-rev" style={{ transformOrigin: "100px 100px" }}>
        <circle cx={C} cy={C} r="92" stroke="var(--gold)" strokeOpacity="0.16" strokeWidth="0.5" />
        <circle cx={C} cy={C} r="88" stroke="var(--gold)" strokeOpacity="0.1" strokeWidth="0.4" strokeDasharray="0.6 4" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={(C + Math.cos(a) * 82).toFixed(3)}
              y1={(C + Math.sin(a) * 82).toFixed(3)}
              x2={(C + Math.cos(a) * 92).toFixed(3)}
              y2={(C + Math.sin(a) * 92).toFixed(3)}
              stroke="var(--gold)"
              strokeOpacity="0.28"
              strokeWidth="0.7"
            />
          );
        })}
      </g>

      <g className="animate-orbit-slow" style={{ transformOrigin: "100px 100px" }}>
        {rings.map((r) => (
          <circle key={r} cx={C} cy={C} r={r} stroke="var(--royal)" strokeOpacity="0.4" strokeWidth="0.4" />
        ))}
      </g>

      {/* core light */}
      <circle cx={C} cy={C} r="30" fill="url(#orrery-core)" className="animate-breathe" />
      <circle cx={C} cy={C} r="7" fill="var(--gold-hot)" opacity="0.9" />

      {/* planets on their real sidereal longitudes */}
      {planets.map((p, i) => {
        const r = rings[Math.min(i, rings.length - 1)]! + (i > 4 ? (i - 4) * 6 : 0);
        const a = angleOf(p.longitude);
        const x = Number((C + Math.cos(a) * r).toFixed(3));
        const y = Number((C + Math.sin(a) * r).toFixed(3));
        const meta = PLANET_BY_NUM.get(p.num);
        const active = activeNum === p.num;
        return (
          <g key={p.num}>
            <circle cx={x} cy={y} r={active ? 7.5 : 4.6} fill={meta?.color ?? "#fff"} opacity={active ? 0.22 : 0.14} />
            <circle cx={x} cy={y} r={active ? 3.4 : 2.1} fill={meta?.color ?? "#fff"} />
            {active && (
              <circle
                cx={x}
                cy={y}
                r="9.5"
                stroke="var(--gold)"
                strokeOpacity="0.75"
                strokeWidth="0.7"
                strokeDasharray="2 3"
              />
            )}
          </g>
        );
      })}

      {/* ascendant marker on the left horizon */}
      <g opacity="0.85">
        <line x1={C - 96} y1={C} x2={C - 78} y2={C} stroke="var(--gold)" strokeWidth="1" />
        <circle cx={C - 96} cy={C} r="2.2" fill="var(--gold-hot)" />
      </g>
    </svg>
  );
}