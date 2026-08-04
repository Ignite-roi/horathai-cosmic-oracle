import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CardDrawSchema,
  CreateTransferSchema,
  NotificationPreferenceSchema,
  ShareIdSchema,
  ShareInputSchema,
  TokenSchema,
  TransferIdSchema,
} from "@/lib/social.schemas";

export const createResultShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ShareInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/social.server");
    return service.createResultShare(context.userId, data);
  });

export const revokeResultShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ShareIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/social.server");
    return service.revokeResultShare(context.userId, data.id);
  });

export const getPublicResultShare = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const service = await import("@/lib/social.server");
    return service.getPublicResultShare(data.token);
  });

export const createDayTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateTransferSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/social.server");
    return service.createDayTransfer(context.userId, data.days);
  });

export const getDayTransferPreview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data }) => {
    const service = await import("@/lib/social.server");
    return service.getDayTransferPreview(data.token);
  });

export const claimDayTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TokenSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/social.server");
    return service.claimDayTransfer(context.userId, data.token);
  });

export const cancelDayTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TransferIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/social.server");
    return service.cancelDayTransfer(context.userId, data.id);
  });

export const drawDailyCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CardDrawSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/social.server");
    return service.drawDailyCard(context.userId, data.kind);
  });

export const getNotificationPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const service = await import("@/lib/social.server");
    return service.getNotificationPreferences(context.userId);
  });

export const saveNotificationPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => NotificationPreferenceSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/social.server");
    return service.saveNotificationPreferences(context.userId, data);
  });