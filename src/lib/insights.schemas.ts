import { z } from "zod";

import { CivilTimeSchema } from "./civil-time";

export const BirthInputSchema = z.object({
  birthDate: z.string().date(),
  birthTime: CivilTimeSchema,
  birthTimeKnown: z.boolean(),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  timezone: z.string().trim().min(1).max(80),
});

export const PartnerBirthSchema = z.object({
  label: z.string().trim().min(1).max(40),
  birthDate: z.string().date(),
  birthTime: CivilTimeSchema.optional(),
  birthTimeKnown: z.boolean(),
  country: z.string().trim().min(1).max(60).default("ประเทศไทย"),
  province: z.string().trim().min(1).max(60),
  district: z.string().trim().max(60).nullable().optional(),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  timezone: z.string().trim().min(1).max(80).default("Asia/Bangkok"),
});

export const DateInputSchema = z.object({ at: z.string().datetime() });
export const CalendarInputSchema = z.object({ start: z.string().date() });
export const GuestDailySchema = z.object({ birth: BirthInputSchema, at: z.string().datetime() });
export const GuestCalendarSchema = z.object({ birth: BirthInputSchema, start: z.string().date() });
export const GuestCompatibilitySchema = z.object({
  birth: BirthInputSchema,
  partner: PartnerBirthSchema,
});

export type ValidBirthInput = z.infer<typeof BirthInputSchema>;
export type PartnerBirthInput = z.infer<typeof PartnerBirthSchema>;
