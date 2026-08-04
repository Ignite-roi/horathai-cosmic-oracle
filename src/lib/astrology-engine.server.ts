/**
 * Typed boundary for the Thai Astrology Engine (สุริยยาตร์).
 *
 * Everything the app consumes goes through `calculateNatal` / `calculateTransit`
 * so the underlying implementation can later be swapped for an external API
 * without touching routes. Production data only — no mock fallback.
 */
import { HOUSES, PLANET_BY_NUM, ZODIACS, type PlacedPlanet } from "./astro";
import { offsetLabel, zonedWallClockToUtc } from "./timezone";

/** Bump when the calculation output changes; cached charts are recomputed. */
export const CALCULATION_VERSION = "sidereal-lahiri-dev-2.0.0";
/** Honest label of what is actually implemented today. */
export const ENGINE_LABEL = "sidereal_lahiri_dev";
export const HOUSE_SYSTEM = "whole_sign";

export type BirthInput = {
  birthDate: string; // YYYY-MM-DD (Gregorian)
  birthTime: string; // HH:mm local
  birthTimeKnown: boolean;
  latitude: number;
  longitude: number;
  timezone: string; // IANA zone of the birthplace
};

export type ChartPlanet = {
  num: number;
  th: string;
  thaiNumeral: string;
  longitude: number;
  signId: number;
  signTh: string;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
  strength: number;
  color: string;
  meaning: string;
};

export type ChartHouse = {
  n: number;
  th: string;
  about: string;
  signId: number;
  signTh: string;
  planets: number[];
};

export type PlanetStandard = {
  num: number;
  th: string;
  /** เกษตร / อุจจ์ / ประ / นิจ / มหาอุจจ์ */
  standard: string;
  note: string;
};

export type TransitSummary = {
  isoDate: string;
  headline: string;
  planet: number;
  planetTh: string;
  signTh: string;
  house: number;
  houseTh: string;
  body: string;
  overall: number;
  scores: { area: string; th: string; score: number }[];
};

export type NatalChartPayload = {
  /** null when the birth time is unknown — no ลัคนา is fabricated. */
  ascendant: AscendantResult | null;
  ascendantKnown: boolean;
  planets: ChartPlanet[];
  houses: ChartHouse[];
  standards: PlanetStandard[];
  calculationVersion: string;
  engine: string;
  houseSystem: string;
  ayanamsaName: string;
  ayanamsa: number;
  utcBirthDatetime: string;
  utcOffset: string;
  timezone: string;
  latitude: number;
  longitude: number;
  calculatedAt: string;
  birthTimeKnown: boolean;
};

export type AscendantResult = {
  signId: number;
  signTh: string;
  degree: number;
  minute: number;
  longitude: number;
  tropicalLongitude: number;
  siderealLongitude: number;
  ayanamsa: number;
  julianDay: number;
};

/** Exaltation sign per planet (อุจจ์) in the Thai system. */
const EXALTATION: Record<number, number> = {
  1: 1,
  2: 2,
  3: 10,
  4: 6,
  5: 4,
  6: 12,
  7: 7,
  8: 3,
  9: 9,
};
/** Debilitation is the opposite sign (นิจ). */
const debilitation = (n: number) => (((EXALTATION[n] ?? 1) + 5) % 12) + 1;

function toPlanet(p: PlacedPlanet): ChartPlanet {
  return {
    num: p.num,
    th: p.th,
    thaiNumeral: p.thaiNumeral,
    longitude: p.longitude,
    signId: p.signId,
    signTh: p.signTh,
    degree: p.degree,
    minute: p.minute,
    house: p.house,
    retrograde: p.retrograde,
    strength: p.strength,
    color: p.color,
    meaning: p.meaning,
  };
}

function buildHouses(ascSignId: number, planets: ChartPlanet[]): ChartHouse[] {
  return HOUSES.map((h) => {
    const signId = ((ascSignId - 1 + (h.n - 1)) % 12) + 1;
    const sign = ZODIACS[signId - 1]!;
    return {
      n: h.n,
      th: h.th,
      about: h.about,
      signId,
      signTh: sign.th,
      planets: planets.filter((p) => p.house === h.n).map((p) => p.num),
    };
  });
}

function buildStandards(planets: ChartPlanet[]): PlanetStandard[] {
  return planets.map((p) => {
    const sign = ZODIACS[p.signId - 1]!;
    let standard = "ปกติ";
    let note = `สถิตราศี${p.signTh}`;
    if (sign.lord === p.num) {
      standard = "เกษตร";
      note = `เป็นเจ้าเรือนราศี${p.signTh} ให้ผลเต็มกำลัง`;
    } else if (EXALTATION[p.num] === p.signId) {
      standard = "อุจจ์";
      note = `อยู่ราศีอุจจ์ ${p.th}ให้คุณสูงสุด`;
    } else if (debilitation(p.num) === p.signId) {
      standard = "นิจ";
      note = `อยู่ราศีนิจ กำลังดาวอ่อน ต้องระวังเรื่อง${p.meaning}`;
    } else if (ZODIACS[p.signId - 1]!.element === ZODIACS[(EXALTATION[p.num] ?? 1) - 1]!.element) {
      standard = "ประ";
      note = `กำลังปานกลาง ส่งผลด้าน${p.meaning}`;
    }
    return { num: p.num, th: p.th, standard, note };
  });
}

/** Validates the input and converts the local wall clock to a true UTC instant. */
export function birthMoment(input: BirthInput): Date {
  if (!Number.isFinite(input.latitude) || Math.abs(input.latitude) > 90) {
    throw new Error("ละติจูดของสถานที่เกิดไม่ถูกต้อง");
  }
  if (!Number.isFinite(input.longitude) || Math.abs(input.longitude) > 180) {
    throw new Error("ลองจิจูดของสถานที่เกิดไม่ถูกต้อง");
  }
  const time = input.birthTimeKnown && input.birthTime ? input.birthTime : "12:00";
  return zonedWallClockToUtc(input.birthDate, time, input.timezone);
}

export async function calculateNatal(input: BirthInput): Promise<NatalChartPayload> {
  const { computeChart, ascendantDetail } = await import("./ephemeris.server");
  const utc = birthMoment(input);
  const chart = computeChart(utc, input.latitude, input.longitude);
  const planets = chart.planets.map(toPlanet);

  // Without an exact birth time the rising degree is undetermined; we compute
  // planets (which move slowly enough to stay meaningful) but return no ลัคนา.
  const asc = input.birthTimeKnown ? ascendantDetail(utc, input.latitude, input.longitude) : null;

  const ascendant: AscendantResult | null = asc
    ? {
        signId: asc.signId,
        signTh: asc.signTh,
        degree: asc.degree,
        minute: asc.minute,
        longitude: asc.siderealLongitude,
        tropicalLongitude: asc.tropicalLongitude,
        siderealLongitude: asc.siderealLongitude,
        ayanamsa: asc.ayanamsa,
        julianDay: asc.julianDay,
      }
    : null;

  return {
    ascendant,
    ascendantKnown: Boolean(ascendant),
    planets,
    // Whole-sign houses counted from the ascendant sign; when the time is
    // unknown they are counted from the Moon sign and labelled as such in UI.
    houses: buildHouses(
      ascendant?.signId ?? planets.find((p) => p.num === 2)?.signId ?? 1,
      planets,
    ),
    standards: buildStandards(planets),
    calculationVersion: CALCULATION_VERSION,
    engine: ENGINE_LABEL,
    houseSystem: HOUSE_SYSTEM,
    ayanamsaName: "lahiri",
    ayanamsa: chart.ayanamsa,
    utcBirthDatetime: utc.toISOString(),
    utcOffset: offsetLabel(utc, input.timezone),
    timezone: input.timezone,
    latitude: input.latitude,
    longitude: input.longitude,
    calculatedAt: new Date().toISOString(),
    birthTimeKnown: input.birthTimeKnown,
  };
}

/** Today's (or any moment's) transit read against the natal chart. */
export async function calculateTransit(input: BirthInput, at?: Date): Promise<TransitSummary> {
  const { computeChart, buildReading } = await import("./ephemeris.server");
  const natal = computeChart(birthMoment(input), input.latitude, input.longitude);
  const when = at ?? new Date();
  const transit = computeChart(when, input.latitude, input.longitude);
  const reading = buildReading(natal, transit);

  // Strongest transiting planet drives the headline.
  const lead = [...reading.transit.planets].sort((a, b) => b.strength - a.strength)[0]!;
  const house = ((lead.signId - natal.ascendant.signId + 12) % 12) + 1;
  const houseInfo = HOUSES[house - 1]!;
  const meta = PLANET_BY_NUM.get(lead.num)!;

  return {
    isoDate: when.toISOString(),
    headline: `${meta.th}ย้ายเข้าราศี${lead.signTh} เสวย${houseInfo.th}`,
    planet: lead.num,
    planetTh: meta.th,
    signTh: lead.signTh,
    house,
    houseTh: houseInfo.th,
    body: `${meta.th}ให้ผลด้าน${meta.influence} กระทบ${houseInfo.about}`,
    overall: reading.overall,
    scores: reading.scores.map((s) => ({ area: s.area, th: s.th, score: s.score })),
  };
}
