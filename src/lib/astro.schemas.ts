import { z } from "zod";

export const PublicReadingInput = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("12:00"),
  province: z.string().trim().min(1).max(60).default("กรุงเทพมหานคร"),
  timezone: z.literal("Asia/Bangkok").default("Asia/Bangkok"),
  at: z.string().datetime().optional(),
});
