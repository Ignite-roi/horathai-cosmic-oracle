/**
 * Server-side astronomy engine.
 * Geocentric apparent positions are produced by Astronomy Engine, whose
 * numerical model is validated against JPL Horizons. They are converted to
 * the sidereal zodiac with the explicitly versioned Lahiri approximation.
 */

import {
  ASPECT_LABEL,
  HOUSES,
  LIFE_AREAS,
  PLANETS,
  ZODIACS,
  type Aspect,
  type AspectKind,
  type AreaScore,
  type ChartResult,
  type LifeArea,
  type PlacedPlanet,
  type PlanetId,
  type ReadingResult,
} from "./astro";
import { Body, Ecliptic, GeoVector } from "astronomy-engine";

export const EPHEMERIS_SOURCE = "astronomy-engine@2.1.19 (VSOP/JPL-validated)";
export const ENGINE_NAME = "sidereal_lahiri_astronomy_engine";
export const ENGINE_VERSION = "3.0.0";
export const HOUSE_SYSTEM_NAME = "whole_sign";

const RAD = Math.PI / 180;
const norm360 = (x: number) => ((x % 360) + 360) % 360;

export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}
const centuries = (jd: number) => (jd - 2451545) / 36525;

const BODY_BY_PLANET: Partial<Record<PlanetId, Body>> = {
  1: Body.Sun,
  2: Body.Moon,
  3: Body.Mars,
  4: Body.Mercury,
  5: Body.Jupiter,
  6: Body.Venus,
  7: Body.Saturn,
};

function apparentTropicalLongitude(body: Body, date: Date): number {
  return norm360(Ecliptic(GeoVector(body, date, true)).elon);
}

/** mean lunar ascending node = ราหู (always retrograde) */
function rahuLongitude(t: number) {
  return norm360(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t);
}

/** Lahiri ayanamsa (อายนางศ) in degrees */
export function ayanamsa(jd: number) {
  const t = centuries(jd);
  return 23.85 + 1.3969 * t + 0.0000305 * t * t;
}

/** local sidereal time in degrees */
function siderealDegrees(jd: number, longitudeEast: number) {
  const t = centuries(jd);
  const gmst =
    280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t - (t * t * t) / 38710000;
  return norm360(gmst + longitudeEast);
}

function ascendantLongitude(jd: number, latitude: number, longitudeEast: number) {
  const obliquity = (23.4392911 - 0.0130042 * centuries(jd)) * RAD;
  const lst = siderealDegrees(jd, longitudeEast) * RAD;
  const lat = latitude * RAD;
  const y = -Math.cos(lst);
  const x = Math.sin(lst) * Math.cos(obliquity) + Math.tan(lat) * Math.sin(obliquity);
  return norm360(Math.atan2(y, x) / RAD + 180);
}

export type AscendantDetail = {
  /** Tropical (สายนะ) ecliptic longitude of the rising degree. */
  tropicalLongitude: number;
  /** Lahiri ayanamsha applied at that instant. */
  ayanamsa: number;
  /** Sidereal (นิรายนะ) ascendant longitude = tropical − ayanamsha. */
  siderealLongitude: number;
  signId: number;
  signTh: string;
  degree: number;
  minute: number;
  julianDay: number;
  /** Local (apparent) sidereal time in degrees, kept for verification. */
  localSiderealTime: number;
  obliquity: number;
};

/**
 * Full ascendant (ลัคนา) result for an exact UTC instant and geographic position.
 * Standard spherical formula for the ecliptic degree rising on the eastern
 * horizon, then shifted to the sidereal zodiac with the Lahiri ayanamsha.
 */
export function ascendantDetail(
  date: Date,
  latitude: number,
  longitudeEast: number,
): AscendantDetail {
  const jd = julianDay(date);
  const aya = ayanamsa(jd);
  const tropical = ascendantLongitude(jd, latitude, longitudeEast);
  const sidereal = norm360(tropical - aya);
  const signIndex = Math.floor(sidereal / 30);
  const within = sidereal - signIndex * 30;
  const sign = ZODIACS[signIndex]!;
  return {
    tropicalLongitude: Math.round(tropical * 1e6) / 1e6,
    ayanamsa: Math.round(aya * 1e6) / 1e6,
    siderealLongitude: Math.round(sidereal * 1e6) / 1e6,
    signId: sign.id,
    signTh: sign.th,
    degree: Math.floor(within),
    minute: Math.floor((within % 1) * 60),
    julianDay: Math.round(jd * 1e5) / 1e5,
    localSiderealTime: Math.round(siderealDegrees(jd, longitudeEast) * 1e4) / 1e4,
    obliquity: Math.round((23.4392911 - 0.0130042 * centuries(jd)) * 1e6) / 1e6,
  };
}

/* ---------- chart building ---------- */

const ASPECTS: { kind: AspectKind; angle: number; orb: number; benefic: boolean }[] = [
  { kind: "conjunction", angle: 0, orb: 8, benefic: true },
  { kind: "sextile", angle: 60, orb: 5, benefic: true },
  { kind: "square", angle: 90, orb: 6, benefic: false },
  { kind: "trine", angle: 120, orb: 7, benefic: true },
  { kind: "opposition", angle: 180, orb: 7, benefic: false },
];

const BENEFIC = new Set<PlanetId>([2, 4, 5, 6]);

export function computeChart(date: Date, latitude: number, longitudeEast: number): ChartResult {
  const jd = julianDay(date);
  const t = centuries(jd);
  const aya = ayanamsa(jd);

  const ascTropical = ascendantLongitude(jd, latitude, longitudeEast);
  const ascSidereal = norm360(ascTropical - aya);
  const ascSignIndex = Math.floor(ascSidereal / 30);

  const planets: PlacedPlanet[] = PLANETS.map((meta) => {
    const body = BODY_BY_PLANET[meta.num];
    const tropical = body
      ? apparentTropicalLongitude(body, date)
      : meta.num === 8
        ? rahuLongitude(t)
        : norm360(rahuLongitude(t) + 180);
    const nextDate = new Date(date.getTime() + 86_400_000);
    const nextTropical = body
      ? apparentTropicalLongitude(body, nextDate)
      : meta.num === 8
        ? rahuLongitude(centuries(jd + 1))
        : norm360(rahuLongitude(centuries(jd + 1)) + 180);
    let delta = nextTropical - tropical;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const lon = norm360(tropical - aya);
    const signIndex = Math.floor(lon / 30);
    const sign = ZODIACS[signIndex]!;
    const within = lon - signIndex * 30;
    const house = ((signIndex - ascSignIndex + 12) % 12) + 1;
    // strength: angular houses + own sign + direct motion
    let strength = 0.45;
    if ([1, 4, 7, 10].includes(house)) strength += 0.25;
    if ([5, 9, 11].includes(house)) strength += 0.15;
    if ([6, 8, 12].includes(house)) strength -= 0.15;
    if (sign.lord === meta.num) strength += 0.2;
    if (delta < 0 && meta.num !== 8 && meta.num !== 9) strength -= 0.1;
    return {
      num: meta.num,
      th: meta.th,
      thaiNumeral: meta.thaiNumeral,
      color: meta.color,
      meaning: meta.meaning,
      influence: meta.influence,
      orbit: meta.orbit,
      size: meta.size,
      longitude: lon,
      signId: sign.id,
      signTh: sign.th,
      signSymbol: sign.symbol,
      element: sign.element,
      degree: Math.floor(within),
      minute: Math.round((within % 1) * 60),
      house,
      retrograde: delta < 0,
      strength: Math.min(1, Math.max(0.15, strength)),
    };
  });

  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i]!;
      const b = planets[j]!;
      let diff = Math.abs(a.longitude - b.longitude);
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECTS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          const benefic =
            asp.kind === "conjunction" ? BENEFIC.has(a.num) && BENEFIC.has(b.num) : asp.benefic;
          aspects.push({
            a: a.num,
            b: b.num,
            kind: asp.kind,
            angle: asp.angle,
            orb: Math.round(orb * 10) / 10,
            benefic,
          });
          break;
        }
      }
    }
  }

  const sun = planets.find((p) => p.num === 1)!;
  const moon = planets.find((p) => p.num === 2)!;
  const moonPhase = norm360(moon.longitude - sun.longitude) / 360;

  return {
    planets,
    aspects,
    ascendant: {
      longitude: ascSidereal,
      signId: ZODIACS[ascSignIndex]!.id,
      signTh: ZODIACS[ascSignIndex]!.th,
      degree: Math.round((ascSidereal - ascSignIndex * 30) * 10) / 10,
    },
    moonPhase,
    ayanamsa: Math.round(aya * 1000) / 1000,
    julianDay: Math.round(jd * 100000) / 100000,
    isoDate: date.toISOString(),
    engine: ENGINE_NAME,
    calculationVersion: `${ENGINE_NAME}-${ENGINE_VERSION}`,
    ephemerisSource: EPHEMERIS_SOURCE,
    ayanamsaName: "lahiri_polynomial_v1",
    houseSystem: HOUSE_SYSTEM_NAME,
  };
}

/* ---------- transparent rule engine ---------- */

const AREA_HOUSES: Record<LifeArea, number[]> = {
  career: [10, 6, 1],
  money: [2, 11, 9],
  love: [5, 7, 12],
  health: [1, 6, 8],
  family: [4, 2, 9],
  partner: [7, 11, 5],
};

const AREA_PLANETS: Record<LifeArea, PlanetId[]> = {
  career: [1, 7, 3],
  money: [5, 6, 4],
  love: [6, 2],
  health: [1, 3, 7],
  family: [2, 5],
  partner: [6, 5, 2],
};

export function scoreAreas(natal: ChartResult, transit: ChartResult): AreaScore[] {
  return LIFE_AREAS.map(({ id, th }) => {
    let score = 58;
    const reasons: string[] = [];
    const houses = AREA_HOUSES[id];
    const keys = AREA_PLANETS[id];

    for (const tp of transit.planets) {
      const natalHouseOfSign = natal.planets.find((n) => n.num === tp.num);
      const house = ((tp.signId - natal.ascendant.signId + 12) % 12) + 1;
      if (!houses.includes(house)) continue;
      const houseName = HOUSES[house - 1]!.th;
      if (BENEFIC.has(tp.num) && !tp.retrograde) {
        score += 9;
        reasons.push(`ดาว${tp.th}จรเข้า${houseName} ส่งเสริมเรื่อง${th}`);
      } else if (tp.num === 7 || tp.num === 8) {
        score -= 8;
        reasons.push(`ดาว${tp.th}จรทับ${houseName} ให้ระวังอุปสรรคเรื่อง${th}`);
      } else {
        score += 3;
        reasons.push(`ดาว${tp.th}จรอยู่${houseName} เพิ่มความเคลื่อนไหวเรื่อง${th}`);
      }
      if (natalHouseOfSign?.retrograde && tp.retrograde) score -= 3;
    }

    for (const asp of transit.aspects) {
      if (!keys.includes(asp.a) && !keys.includes(asp.b)) continue;
      const pa = PLANETS.find((p) => p.num === asp.a)!;
      const pb = PLANETS.find((p) => p.num === asp.b)!;
      score += asp.benefic ? 6 : -6;
      reasons.push(
        `${pa.th}${ASPECT_LABEL[asp.kind]}${pb.th} (คลาด ${asp.orb}°) ${asp.benefic ? "หนุน" : "กดดัน"}เรื่อง${th}`,
      );
    }

    for (const np of natal.planets) {
      if (!keys.includes(np.num)) continue;
      if (houses.includes(np.house)) {
        score += Math.round(np.strength * 12);
        reasons.push(
          `ดวงกำเนิดมีดาว${np.th}สถิต${HOUSES[np.house - 1]!.th} เป็นพื้นดวงที่ดีของ${th}`,
        );
      }
    }

    return {
      area: id,
      th,
      score: Math.max(12, Math.min(98, Math.round(score))),
      reasons: reasons.slice(0, 4),
    };
  });
}

export function buildReading(natal: ChartResult, transit: ChartResult): ReadingResult {
  const scores = scoreAreas(natal, transit);
  const overall = Math.round(scores.reduce((s, a) => s + a.score, 0) / scores.length);

  const highlights: ReadingResult["highlights"] = [];
  const retro = transit.planets.filter((p) => p.retrograde && p.num <= 7);
  if (retro.length) {
    highlights.push({
      title: `ดาวพักร์: ${retro.map((r) => r.th).join(" · ")}`,
      body: `ช่วงนี้ ${retro.map((r) => `ดาว${r.th}`).join(" และ ")} เดินถอยหลัง เรื่องที่เกี่ยวข้องมักย้อนกลับมาทบทวนใหม่ ควรตรวจทานเอกสารและคำพูดให้ดี`,
      tone: "watch",
    });
  }
  const best = [...scores].sort((a, b) => b.score - a.score)[0]!;
  const worst = [...scores].sort((a, b) => a.score - b.score)[0]!;
  highlights.push({
    title: `จุดเด่นวันนี้: ${best.th}`,
    body: best.reasons[0] ?? `พลังดาวจรหนุนเรื่อง${best.th}เป็นพิเศษ`,
    tone: "good",
  });
  highlights.push({
    title: `จุดที่ต้องระวัง: ${worst.th}`,
    body: worst.reasons[0] ?? `ดาวจรกดดันเรื่อง${worst.th} ควรตั้งรับอย่างมีสติ`,
    tone: "watch",
  });

  const moon = transit.planets.find((p) => p.num === 2)!;
  highlights.push({
    title: `จันทร์จรราศี${moon.signTh}`,
    body: `อารมณ์ประจำวันถูกปรับด้วยธาตุ${moon.element} เหมาะกับการ${
      moon.element === "ไฟ"
        ? "ลงมือทำอย่างเด็ดขาด"
        : moon.element === "ดิน"
          ? "จัดระเบียบและวางแผนระยะยาว"
          : moon.element === "ลม"
            ? "เจรจาและติดต่อสื่อสาร"
            : "ดูแลจิตใจและคนใกล้ตัว"
    }`,
    tone: "neutral",
  });

  return {
    natal,
    transit,
    scores,
    overall,
    highlights,
    provenance: {
      engine: transit.engine,
      calculationVersion: transit.calculationVersion,
      ephemerisSource: transit.ephemerisSource,
      ayanamsaName: transit.ayanamsaName,
      houseSystem: transit.houseSystem,
      natalInstant: natal.isoDate,
      transitInstant: transit.isoDate,
    },
  };
}
