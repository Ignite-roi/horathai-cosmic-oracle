import { z } from "zod";

import { CivilTimeSchema } from "./civil-time";

export const PublicReadingInput = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: CivilTimeSchema.default("12:00"),
  province: z.string().trim().min(1).max(60).default("กรุงเทพมหานคร"),
  timezone: z.literal("Asia/Bangkok").default("Asia/Bangkok"),
  at: z.string().datetime().optional(),
});
