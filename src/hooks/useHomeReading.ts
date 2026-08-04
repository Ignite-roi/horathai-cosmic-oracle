import { useQueries, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { getReading } from "@/lib/astro.functions";
import type { PlacedPlanet, ReadingResult } from "@/lib/astro";
import { getMyBirthContext } from "@/lib/birth.functions";
import { useProfile } from "@/store/useProfile";

/** Fixed sample birth used only to render the demo composition. Never persisted. */
export const DEMO_BIRTH = {
  birthDate: "1988-05-05",
  birthTime: "00:00",
  province: "ชัยภูมิ",
} as const;

const DAY = 86_400_000;
export const LOOKBACK_DAYS = 45;
export const LOOKAHEAD_DAYS = 45;

function isoAt(offsetDays: number) {
  // hour precision keeps the query key stable within an hour
  return new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 13) + ":00:00.000Z";
}

export type MajorTransit = {
  planet: PlacedPlanet;
  fromSign: string | null;
  toSign: string;
  house: number;
  fromDate: Date;
  untilDate: Date;
  stillAhead: boolean;
};

/** House of a longitude counted from the natal ascendant (presentation only). */
export function houseFromAscendant(longitude: number, ascendant: number) {
  const delta = ((longitude - ascendant) % 360 + 360) % 360;
  return Math.floor(delta / 30) + 1;
}

/**
 * Home needs three real readings from the existing engine: 45 days back,
 * now, and 45 days ahead. Everything the hero and the transit card show is
 * derived from those, so nothing is invented.
 */
/** Saved birth profile + cached natal chart for the signed-in user. */
export function useBirthContext() {
  const lineUserId = useProfile((s) => s.lineUserId);
  return useQuery({
    queryKey: ["birth-context"],
    queryFn: () => getMyBirthContext(),
    staleTime: 60_000,
    enabled: Boolean(lineUserId),
  });
}

export function useHomeReading() {
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
      ? DEMO_BIRTH
      : { birthDate, birthTime: birthTime || "12:00", province };

  const offsets = [-LOOKBACK_DAYS, 0, LOOKAHEAD_DAYS];

  const results = useQueries({
    queries: offsets.map((offset) => ({
      queryKey: ["home-reading", input.birthDate, input.birthTime, input.province, offset, isoAt(offset)],
      staleTime: 1000 * 60 * 30,
      queryFn: () =>
        fetchReading({ data: { ...input, at: isoAt(offset) } }) as Promise<ReadingResult>,
    })),
  });

  const past = results[0]?.data;
  const now = results[1]?.data;
  const future = results[2]?.data;

  return {
    isDemo,
    isLoading: results[1]?.isLoading ?? true,
    data: now,
    past,
    future,
    majorTransit: now && past ? findMajorTransit(now, past, future) : null,
    timeline:
      past && now && future
        ? [
            { label: `${LOOKBACK_DAYS} วันก่อน`, value: past.overall, offset: -LOOKBACK_DAYS },
            { label: "วันนี้", value: now.overall, offset: 0 },
            { label: `อีก ${LOOKAHEAD_DAYS} วัน`, value: future.overall, offset: LOOKAHEAD_DAYS },
          ]
        : null,
  };
}

/** Slowest planet that changed sign in the observed window, else the strongest slow planet. */
function findMajorTransit(
  now: ReadingResult,
  past: ReadingResult,
  future: ReadingResult | undefined,
): MajorTransit | null {
  const asc = now.natal.ascendant.longitude;
  // heavier planets first: เสาร์ ราหู เกตุ พฤหัส อังคาร ศุกร์ พุธ อาทิตย์ จันทร์
  const weight = [7, 8, 9, 5, 3, 6, 4, 1, 2];

  const ordered = [...now.transit.planets].sort(
    (a, b) => weight.indexOf(a.num) - weight.indexOf(b.num),
  );

  const changed = ordered.find((p) => {
    const before = past.transit.planets.find((q) => q.num === p.num);
    return before && before.signId !== p.signId;
  });

  const planet = changed ?? ordered[0];
  if (!planet) return null;

  const before = past.transit.planets.find((q) => q.num === planet.num) ?? null;
  const ahead = future?.transit.planets.find((q) => q.num === planet.num) ?? null;

  return {
    planet,
    fromSign: changed && before ? before.signTh : null,
    toSign: planet.signTh,
    house: houseFromAscendant(planet.longitude, asc),
    fromDate: new Date(Date.now() - LOOKBACK_DAYS * DAY),
    untilDate: new Date(Date.now() + LOOKAHEAD_DAYS * DAY),
    stillAhead: Boolean(ahead && ahead.signId === planet.signId),
  };
}