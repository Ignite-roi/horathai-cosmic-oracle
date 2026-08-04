import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CalendarInputSchema,
  DateInputSchema,
  GuestCalendarSchema,
  GuestCompatibilitySchema,
  GuestDailySchema,
  PartnerBirthSchema,
} from "@/lib/insights.schemas";

export const getMyDailyInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DateInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/insights.server");
    return service.calculateDailyInsight(
      await service.userBirth(context.supabase as never, context.userId),
      new Date(data.at),
    );
  });

export const getGuestDailyInsight = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GuestDailySchema.parse(input))
  .handler(async ({ data }) => {
    const service = await import("@/lib/insights.server");
    service.assertGuestInsightRateLimit(`daily:${data.birth.birthDate}:${data.birth.longitude}`);
    return service.calculateDailyInsight(data.birth, new Date(data.at));
  });

export const getMyCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CalendarInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/insights.server");
    return service.calculateCalendar(
      await service.userBirth(context.supabase as never, context.userId),
      data.start,
    );
  });

export const getGuestCalendar = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GuestCalendarSchema.parse(input))
  .handler(async ({ data }) => {
    const service = await import("@/lib/insights.server");
    service.assertGuestInsightRateLimit(
      `calendar:${data.birth.birthDate}:${data.birth.longitude}`,
      4,
    );
    return service.calculateCalendar(data.birth, data.start);
  });

export const calculateMyCompatibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PartnerBirthSchema.parse(input))
  .handler(async ({ data, context }) => {
    const service = await import("@/lib/insights.server");
    const result = await service.calculateCompatibility(
      await service.userBirth(context.supabase as never, context.userId),
      data,
      false,
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("compatibility_checks").upsert(
      {
        user_id: context.userId,
        person_label: data.label,
        partner_birth_date: data.birthDate,
        partner_birth_time: data.birthTime ?? null,
        partner_birth_time_known: data.birthTimeKnown,
        partner_country: data.country,
        partner_province: data.province,
        partner_district: data.district ?? null,
        partner_timezone: data.timezone,
        partner_latitude: data.latitude,
        partner_longitude: data.longitude,
        result_json: result,
        overall_score: result.overall,
        calculation_engine: result.engine,
        calculation_version: result.calculationVersion,
        rule_ids: [result.evidence.ruleId],
        citation_snapshot_json: result.evidence.citations,
        input_hash: service.compatibilityHash(context.userId, data),
      },
      { onConflict: "user_id,input_hash" },
    );
    if (error) throw new Error("บันทึกผลสมพงษ์ไม่สำเร็จ");
    return result;
  });

export const calculateGuestCompatibility = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GuestCompatibilitySchema.parse(input))
  .handler(async ({ data }) => {
    const service = await import("@/lib/insights.server");
    service.assertGuestInsightRateLimit(
      `compat:${data.birth.birthDate}:${data.birth.longitude}`,
      8,
    );
    return service.calculateCompatibility(data.birth, data.partner, true);
  });

export const listMyCompatibilityChecks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("compatibility_checks")
      .select(
        "id,person_label,partner_birth_date,partner_birth_time,partner_birth_time_known,partner_country,partner_province,partner_district,partner_timezone,partner_latitude,partner_longitude,overall_score,result_json,created_at",
      )
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(20);
    if (error) throw new Error("โหลดรายการที่บันทึกไม่สำเร็จ");
    return data;
  });
