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