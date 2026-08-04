/**
 * IANA timezone handling for birth data.
 * The local birth wall-clock time is converted to a true UTC instant using the
 * zone's real historical offset (via Intl), not a fixed +07:00 assumption.
 */

/** Offset in minutes that `timeZone` was at the given UTC instant. */
function offsetMinutesAt(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return (asUTC - Math.floor(utcMs / 1000) * 1000) / 60000;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts `YYYY-MM-DD` + `HH:mm` interpreted in `timeZone` into a UTC Date.
 * Two-pass fixed point handles DST/offset changes correctly.
 */
export function zonedWallClockToUtc(date: string, time: string, timeZone: string): Date {
  if (!isValidTimeZone(timeZone)) throw new Error(`โซนเวลาไม่ถูกต้อง: ${timeZone}`);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!m || !t) throw new Error("รูปแบบวันเวลาเกิดไม่ถูกต้อง");
  const naive = Date.UTC(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(t[1]),
    Number(t[2]),
    0,
  );
  let utc = naive - offsetMinutesAt(naive, timeZone) * 60000;
  utc = naive - offsetMinutesAt(utc, timeZone) * 60000;
  const result = new Date(utc);
  if (Number.isNaN(result.getTime())) throw new Error("รูปแบบวันเวลาเกิดไม่ถูกต้อง");
  return result;
}

/** "+07:00" style label for the offset actually applied at that instant. */
export function offsetLabel(utc: Date, timeZone: string): string {
  const mins = offsetMinutesAt(utc.getTime(), timeZone);
  const sign = mins >= 0 ? "+" : "-";
  const abs = Math.abs(mins);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}
