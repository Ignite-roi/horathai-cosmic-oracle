import type { ChartPlanet } from "./astrology-engine.server";

export type ChartPoint = ChartPlanet & { x: number; y: number; labelX: number; labelY: number };

const radians = (longitude: number) => ((longitude - 90) * Math.PI) / 180;

export function polarPoint(longitude: number, radius: number, center = 240) {
  const angle = radians(longitude);
  return { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
}

/** Keeps exact planet angles while moving only labels away from near-neighbours. */
export function layoutPlanets(planets: ChartPlanet[], view: "orbit" | "zodiac"): ChartPoint[] {
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);
  return sorted.map((planet, index) => {
    const radius = view === "zodiac" ? 145 : 92 + (index % 3) * 25;
    const point = polarPoint(planet.longitude, radius);
    const previous = sorted[(index - 1 + sorted.length) % sorted.length];
    const separation = previous ? (planet.longitude - previous.longitude + 360) % 360 : 360;
    const labelRadius = radius + (separation < 14 ? 34 : 24) + (index % 2) * 8;
    const label = polarPoint(planet.longitude, labelRadius);
    return { ...planet, ...point, labelX: label.x, labelY: label.y };
  });
}

export function aspectPairs(planets: ChartPlanet[]) {
  const results: { a: ChartPlanet; b: ChartPlanet; kind: string; benefic: boolean }[] = [];
  const targets = [0, 60, 90, 120, 180];
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const a = planets[i];
      const b = planets[j];
      if (!a || !b) continue;
      const raw = Math.abs(a.longitude - b.longitude);
      const angle = Math.min(raw, 360 - raw);
      const target = targets.find((value) => Math.abs(angle - value) <= 5);
      if (target === undefined) continue;
      results.push({ a, b, kind: String(target), benefic: target === 60 || target === 120 });
    }
  }
  return results;
}