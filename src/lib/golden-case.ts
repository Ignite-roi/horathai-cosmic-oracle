import { zonedWallClockToUtc } from "./timezone";

export const GOLDEN_CHAIYAPHUM_24H = {
  benchmarkKey: "golden-chaiyaphum-2531-05-05-2400",
  originalInputLabel: "5 May 2531, 24:00, Chaiyaphum",
  normalizedDate: "1988-05-06",
  normalizedTime: "00:00",
  timezone: "Asia/Bangkok",
  calculationStatus: "calculation_pending",
  activatedRuleIds: [] as string[],
} as const;

/**
 * Owner-approved regression fixture from the earlier accepted binding-flow
 * case, cross-checked against the documented analytic ascendant pipeline.
 * This is literal 1988-05-05 00:00 local, not the separate 24:00 case.
 */
export const GOLDEN_CHAIYAPHUM_MIDNIGHT = {
  benchmarkKey: "golden-chaiyaphum-1988-05-05-0000",
  input: {
    birthDate: "1988-05-05",
    birthTime: "00:00",
    birthTimeKnown: true,
    latitude: 15.8068,
    longitude: 102.0315,
    timezone: "Asia/Bangkok",
  },
  expectedUtc: "1988-05-04T17:00:00.000Z",
  expectedSiderealAscendant: 278.047959,
  expectedSign: "มังกร",
  expectedDegree: 8,
  expectedMinute: 2,
  provenance:
    "Prior owner-approved Horathai acceptance case; Lahiri whole-sign analytic cross-check; independent external reproduction pending",
  toleranceDegrees: 0.25,
} as const;

/** Normalizes the civil convention 24:00 to 00:00 on the following day. */
export function normalizeCivil24Hour(date: string, time: string): { date: string; time: string } {
  if (time !== "24:00") return { date, time };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error("รูปแบบวันที่ไม่ถูกต้อง");
  const next = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + 1));
  return { date: next.toISOString().slice(0, 10), time: "00:00" };
}

export function goldenCaseUtc(): string {
  return zonedWallClockToUtc(
    GOLDEN_CHAIYAPHUM_24H.normalizedDate,
    GOLDEN_CHAIYAPHUM_24H.normalizedTime,
    GOLDEN_CHAIYAPHUM_24H.timezone,
  ).toISOString();
}
