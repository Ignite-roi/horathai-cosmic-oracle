import { z } from "zod";

export const THAI_TIME_LOCALE = "th-TH-u-hc-h23";
export const CIVIL_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const CivilTimeSchema = z
  .string()
  .regex(CIVIL_TIME_PATTERN, "เวลาใช้รูปแบบ 24 ชั่วโมง HH:mm (00:00–23:59)");

export function isCivilTime(value: string): boolean {
  return CIVIL_TIME_PATTERN.test(value);
}

export function parseCivilTime(value: string): { hour: number; minute: number } {
  if (!isCivilTime(value)) {
    throw new Error("เวลาใช้รูปแบบ 24 ชั่วโมง HH:mm (00:00–23:59)");
  }
  return { hour: Number(value.slice(0, 2)), minute: Number(value.slice(3, 5)) };
}

export function toCivilTime(hour: number, minute: number): string {
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  CivilTimeSchema.parse(value);
  return value;
}

export function formatThaiTime(value: Date | string | number, timeZone = "Asia/Bangkok"): string {
  return new Intl.DateTimeFormat(THAI_TIME_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(new Date(value));
}

export function formatThaiDateTime(
  value: Date | string | number,
  timeZone = "Asia/Bangkok",
): string {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist-hc-h23", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
    timeZone,
  }).format(new Date(value));
}

export function formatThaiDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat("th-TH-u-ca-buddhist", options).format(new Date(value));
}