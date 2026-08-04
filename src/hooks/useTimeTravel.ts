import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getReading } from "@/lib/astro.functions";
import type { LifeArea, PlacedPlanet, PlanetId, ReadingResult } from "@/lib/astro";
import { DEMO_BIRTH, houseFromAscendant, useBirthContext } from "@/hooks/useHomeReading";
import { useProfile } from "@/store/useProfile";

/** Label of the calculation model currently backing every number on screen. */
export const ENGINE_LABEL = "sidereal_lahiri_dev";

export const MIN_OFFSET = -180;
export const MAX_OFFSET = 365;
const DAY = 86_400_000;

/** Hour-precision ISO so query keys stay stable within the hour. */
function isoAt(offsetDays: number) {
  return new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 13) + ":00:00.000Z";
}

export function dateAt(offsetDays: number) {
  return new Date(Date.now() + offsetDays * DAY);
}

/** Debounces a fast-changing value (slider drag) before it triggers a request. */
export function useDebounced<T>(value: T, delay = 260) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export type PlanetShift = {
  num: PlanetId;
  th: string;
  from: PlacedPlanet;
  to: PlacedPlanet;
  fromHouse: number;
  toHouse: number;
  signChanged: boolean;
  houseChanged: boolean;
  retroChanged: boolean;
  /** absolute degrees travelled between the two sampled moments */
  degrees: number;
  meaningful: boolean;
};

export type ScoreShift = {
  area: LifeArea;
  th: string;
  before: number;
  after: number;
  delta: number;
  reasons: string[];
};

/** Slow-to-fast ordering so the meaningful movers surface first. */
const WEIGHT: PlanetId[] = [7, 8, 9, 5, 3, 6, 4, 1, 2];

export function buildShifts(base: ReadingResult, target: ReadingResult): PlanetShift[] {
  const asc = base.natal.ascendant.longitude;
  const shifts: PlanetShift[] = [];

  for (const to of target.transit.planets) {
    const from = base.transit.planets.find((p) => p.num === to.num);
    if (!from) continue;
    const raw = (((to.longitude - from.longitude) % 360) + 360) % 360;
    const degrees = Math.round(raw > 180 ? 360 - raw : raw);
    const fromHouse = houseFromAscendant(from.longitude, asc);
    const toHouse = houseFromAscendant(to.longitude, asc);
    const signChanged = from.signId !== to.signId;
    const houseChanged = fromHouse !== toHouse;
    const retroChanged = from.retrograde !== to.retrograde;
    shifts.push({
      num: to.num,
      th: to.th,
      from,
      to,
      fromHouse,
      toHouse,
      signChanged,
      houseChanged,
      retroChanged,
      degrees,
      meaningful: signChanged || houseChanged || retroChanged,
    });
  }

  return shifts.sort((a, b) => {
    if (a.meaningful !== b.meaningful) return a.meaningful ? -1 : 1;
    return WEIGHT.indexOf(a.num) - WEIGHT.indexOf(b.num);
  });
}

export function buildScoreShifts(base: ReadingResult, target: ReadingResult): ScoreShift[] {
  return target.scores.map((s) => {
    const before = base.scores.find((x) => x.area === s.area)?.score ?? s.score;
    return {
      area: s.area,
      th: s.th,
      before,
      after: s.score,
      delta: s.score - before,
      reasons: s.reasons,
    };
  });
}

/**
 * Two real engine readings — "now" as the baseline and the selected date —
 * plus everything the Transit page derives from them. Nothing is invented:
 * both sides come from `getReading` (sidereal_lahiri_dev).
 */
export function useTimeTravel(offsetDays: number) {
  const birthDate = useProfile((s) => s.birthDate);
  const birthTime = useProfile((s) => s.birthTime);
  const province = useProfile((s) => s.province);
  const fetchReading = useServerFn(getReading);
  const { data: context } = useBirthContext();
  const saved = context?.birthProfile ?? null;

  const isDemo = !saved && !birthDate;
  const input = saved
    ? {
        birthDate: saved.birth_date,
        birthTime: (saved.birth_time ?? "12:00").slice(0, 5),
        province: saved.province,
      }
    : isDemo
      ? { ...DEMO_BIRTH }
      : { birthDate, birthTime: birthTime || "12:00", province };

  const debouncedOffset = useDebounced(offsetDays, 260);
  const offsets = useMemo(() => [0, debouncedOffset], [debouncedOffset]);

  const results = useQueries({
    queries: offsets.map((offset) => ({
      queryKey: ["transit-reading", input.birthDate, input.birthTime, input.province, offset, isoAt(offset)],
      staleTime: 1000 * 60 * 30,
      queryFn: () => fetchReading({ data: { ...input, at: isoAt(offset) } }) as Promise<ReadingResult>,
    })),
  });

  const base = results[0]?.data;
  const target = results[1]?.data ?? base;
  const settled = debouncedOffset === offsetDays && !(results[1]?.isFetching ?? false);

  return {
    isDemo,
    isLoading: results[0]?.isLoading ?? true,
    /** true while the selected date is still being calculated */
    isSyncing: !settled,
    base,
    target,
    appliedOffset: debouncedOffset,
    shifts: base && target ? buildShifts(base, target) : [],
    scoreShifts: base && target ? buildScoreShifts(base, target) : [],
  };
}
