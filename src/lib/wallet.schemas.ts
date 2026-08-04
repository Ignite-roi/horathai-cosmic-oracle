import { z } from "zod";

export const MockCheckoutInput = z
  .object({
    packageCode: z.string().regex(/^[a-z0-9_]+$/),
    pointsToUse: z.number().int().min(0),
  })
  .strict();

export type MockCheckoutData = z.infer<typeof MockCheckoutInput>;