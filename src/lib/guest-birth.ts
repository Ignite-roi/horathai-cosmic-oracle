import { z } from "zod";

import type { BirthProfileRow, NatalChartRow } from "./birth.functions";

export const GUEST_BIRTH_STORAGE_KEY = "horathai:guest-birth-chart:v1";

export const GuestBirthInputSchema = z.object({
  nickname: z.string().trim().min(1, "กรุณากรอกชื่อเล่น").max(40),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันเกิดไม่ถูกต้อง"),
  birth_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "รูปแบบเวลาเกิดไม่ถูกต้อง")
    .optional(),
  birth_time_known: z.boolean(),
  country: z.string().trim().min(1).max(60),
  province: z.string().trim().min(1, "กรุณาเลือกจังหวัด").max(60),
  district: z.string().trim().max(60).optional().nullable(),
});

export type GuestBirthInput = z.infer<typeof GuestBirthInputSchema>;

export type GuestBirthContext = {
  temporary: true;
  birthProfile: BirthProfileRow;
  chart: NatalChartRow;
};

export function readGuestBirthContext(): GuestBirthContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(GUEST_BIRTH_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as GuestBirthContext;
    return value?.temporary && value.birthProfile && value.chart ? value : null;
  } catch {
    window.sessionStorage.removeItem(GUEST_BIRTH_STORAGE_KEY);
    return null;
  }
}

export function writeGuestBirthContext(value: GuestBirthContext) {
  window.sessionStorage.setItem(GUEST_BIRTH_STORAGE_KEY, JSON.stringify(value));
}