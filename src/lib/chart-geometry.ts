import type { ChartPlanet } from "./astrology-engine.server";

export type ChartPoint = ChartPlanet & { x: number; y: number; labelX: number; labelY: number };
export type ChartRing = "natal" | "transit";

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

/**
 * Slot labels around a dedicated ring while preserving the exact marker angle.
 * The forward/backward passes prevent dense 3+ planet clusters from stacking.
 */
export function layoutRingPlanets(
  planets: ChartPlanet[],
  ring: ChartRing,
  view: "orbit" | "zodiac",
): ChartPoint[] {
  if (planets.length === 0) return [];
  const markerRadius = ring === "natal" ? (view === "zodiac" ? 128 : 113) : 168;
  const labelRadius = ring === "natal" ? 143 : 187;
  const minimumGap = ring === "natal" ? 15 : 14;
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);
  const unwrapped = sorted.map((planet, index) => {
    const longitude = index === 0 ? planet.longitude : planet.longitude + (planet.longitude < sorted[0]!.longitude ? 360 : 0);
    return { planet, longitude };
  });
  const slots = unwrapped.map((item) => item.longitude);
  for (let index = 1; index < slots.length; index += 1) slots[index] = Math.max(slots[index]!, slots[index - 1]! + minimumGap);
  const lastSlot = slots.at(-1);
  const lastPlanet = unwrapped.at(-1);
  if (lastSlot === undefined || !lastPlanet) return [];
  const overflow = lastSlot - lastPlanet.longitude;
  if (overflow > 0) {
    for (let index = 0; index < slots.length; index += 1) {
      const slot = slots[index];
      if (slot !== undefined) slots[index] = slot - overflow / 2;
    }
  }

  return unwrapped.map(({ planet }, index) => {
    const point = polarPoint(planet.longitude, markerRadius);
    const labelLongitude = slots[index] ?? planet.longitude;
    const label = polarPoint(labelLongitude, labelRadius);
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