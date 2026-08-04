import { z } from "zod";

export const ShareInputSchema = z.object({
  type: z.enum(["natal", "compatibility", "daily"]),
  sourceId: z.string().uuid().optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

export const TokenSchema = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{32,128}$/) });
export const ShareIdSchema = z.object({ id: z.string().uuid() });
export const CreateTransferSchema = z.object({ days: z.number().int().min(1).max(3650) });
export const TransferIdSchema = z.object({ id: z.string().uuid() });
export const CardDrawSchema = z.object({ kind: z.enum(["yes_no", "lucky_number"]) });
export const NotificationPreferenceSchema = z.object({
  enabled: z.boolean(),
  dailyColor: z.boolean(),
  majorTransit: z.boolean(),
  creditExpiry: z.boolean(),
});