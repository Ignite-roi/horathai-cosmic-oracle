import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BirthProfileInput = z.object({
  nickname: z.string().trim().min(1, "กรุณากรอกชื่อเล่น").max(40),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันเกิดไม่ถูกต้อง"),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/, "รูปแบบเวลาเกิดไม่ถูกต้อง").optional(),
  birth_time_known: z.boolean(),
  country: z.string().trim().min(1).max(60),
  province: z.string().trim().min(1, "กรุณาเลือกจังหวัด").max(60),
  district: z.string().trim().max(60).optional().nullable(),
});

export type BirthProfileRow = {
  id: string;
  nickname: string;
  birth_date: string;
  birth_time: string | null;
  birth_time_known: boolean;
  country: string;
  province: string;
  district: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  calculation_system: string;
};

export type NatalChartRow = {
  id: string;
  ascendant_sign: string;
  ascendant_degree: number;
  planets_json: unknown;
  houses_json: unknown;
  standards_json: unknown;
  calculation_version: string;
  calculated_at: string;
};

const BIRTH_COLUMNS =
  "id, nickname, birth_date, birth_time, birth_time_known, country, province, district, latitude, longitude, timezone, calculation_system";
const CHART_COLUMNS =
  "id, ascendant_sign, ascendant_degree, planets_json, houses_json, standards_json, calculation_version, calculated_at";

/** The user's saved birth profile plus its cached natal chart. */
export const getMyBirthContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const birth = await supabase
      .from("birth_profiles")
      .select(BIRTH_COLUMNS)
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();
    if (birth.error) throw new Error(birth.error.message);
    if (!birth.data) return { birthProfile: null, chart: null } as const;

    const chart = await supabase
      .from("natal_charts")
      .select(CHART_COLUMNS)
      .eq("birth_profile_id", birth.data.id)
      .maybeSingle();
    if (chart.error) throw new Error(chart.error.message);
    return {
      birthProfile: birth.data as BirthProfileRow,
      chart: (chart.data as NatalChartRow | null) ?? null,
    };
  });

/** Step 1–4 of onboarding: persist the answers (no calculation yet). */
export const saveBirthProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BirthProfileInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { findProvince } = await import("./provinces");
    const place = findProvince(data.province);

    const birthDate = new Date(`${data.birth_date}T00:00:00+07:00`);
    if (Number.isNaN(birthDate.getTime())) throw new Error("วันเกิดไม่ถูกต้อง");
    if (birthDate.getTime() > Date.now()) throw new Error("วันเกิดต้องไม่เป็นวันในอนาคต");
    if (birthDate.getUTCFullYear() < 1900) throw new Error("ปีเกิดต้องไม่เก่ากว่า พ.ศ. ๒๔๔๓");

    const row = {
      user_id: userId,
      nickname: data.nickname,
      birth_date: data.birth_date,
      birth_time: data.birth_time_known ? (data.birth_time ?? "12:00") : null,
      birth_time_known: data.birth_time_known,
      country: data.country,
      province: data.province,
      district: data.district?.trim() || null,
      latitude: place.lat,
      longitude: place.lon,
      timezone: "Asia/Bangkok",
      calculation_system: "suriyayart",
      is_primary: true,
    };

    const existing = await supabase
      .from("birth_profiles")
      .select("id")
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();

    if (existing.data) {
      const { data: updated, error } = await supabase
        .from("birth_profiles")
        .update(row)
        .eq("id", existing.data.id)
        .select(BIRTH_COLUMNS)
        .single();
      if (error) throw new Error(error.message);
      return updated as BirthProfileRow;
    }

    const { data: inserted, error } = await supabase
      .from("birth_profiles")
      .insert(row)
      .select(BIRTH_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return inserted as BirthProfileRow;
  });

/**
 * Step 5: calculate the natal chart, cache it, complete onboarding and start
 * the 30-day trial on first completion.
 */
export const calculateAndSaveChart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const birth = await supabase
      .from("birth_profiles")
      .select(BIRTH_COLUMNS)
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();
    if (birth.error) throw new Error(birth.error.message);
    if (!birth.data) throw new Error("ยังไม่พบข้อมูลวันเกิด กรุณากรอกข้อมูลก่อน");
    const b = birth.data as BirthProfileRow;

    const { calculateNatal, CALCULATION_VERSION } = await import("./astrology-engine.server");
    let payload;
    try {
      payload = await calculateNatal({
        birthDate: b.birth_date,
        birthTime: (b.birth_time ?? "12:00").slice(0, 5),
        birthTimeKnown: b.birth_time_known,
        latitude: b.latitude,
        longitude: b.longitude,
        timezone: b.timezone,
      });
    } catch (err) {
      console.error("[astro] natal calculation failed", err instanceof Error ? err.message : err);
      throw new Error("คำนวณดวงกำเนิดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }

    const chartRow = {
      birth_profile_id: b.id,
      user_id: userId,
      ascendant_sign: payload.ascendant.signTh,
      ascendant_degree: payload.ascendant.degree,
      planets_json: payload.planets,
      houses_json: payload.houses,
      standards_json: payload.standards,
      calculation_version: CALCULATION_VERSION,
      calculated_at: payload.calculatedAt,
    };

    const { data: saved, error } = await supabase
      .from("natal_charts")
      .upsert(chartRow, { onConflict: "birth_profile_id" })
      .select(CHART_COLUMNS)
      .single();
    if (error) throw new Error(error.message);

    const now = new Date();
    const profile = await supabase
      .from("profiles")
      .select("trial_started_at")
      .eq("id", userId)
      .maybeSingle();

    const patch: Record<string, unknown> = { onboarding_completed: true, onboarded: true };
    if (!profile.data?.trial_started_at) {
      patch["trial_started_at"] = now.toISOString();
      patch["trial_ends_at"] = new Date(now.getTime() + 30 * 86400000).toISOString();
      patch["subscription_status"] = "trialing";
    }
    await supabase.from("profiles").update(patch).eq("id", userId);
    await supabase
      .from("entitlements")
      .update({
        plan: "premium_trial",
        trial_started_at: (patch["trial_started_at"] as string) ?? undefined,
        expires_at: (patch["trial_ends_at"] as string) ?? undefined,
      })
      .eq("user_id", userId)
      .is("trial_started_at", null);

    return saved as NatalChartRow;
  });

/** Transit reading for the signed-in user's saved birth data. */
export const getMyTransit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ at: z.string().optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const birth = await supabase
      .from("birth_profiles")
      .select(BIRTH_COLUMNS)
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();
    if (birth.error) throw new Error(birth.error.message);
    if (!birth.data) throw new Error("ยังไม่พบข้อมูลวันเกิด");
    const b = birth.data as BirthProfileRow;

    const { calculateTransit } = await import("./astrology-engine.server");
    try {
      return await calculateTransit(
        {
          birthDate: b.birth_date,
          birthTime: (b.birth_time ?? "12:00").slice(0, 5),
          birthTimeKnown: b.birth_time_known,
          latitude: b.latitude,
          longitude: b.longitude,
          timezone: b.timezone,
        },
        data.at ? new Date(data.at) : undefined,
      );
    } catch (err) {
      console.error("[astro] transit failed", err instanceof Error ? err.message : err);
      throw new Error("คำนวณดาวจรไม่สำเร็จ กรุณาลองใหม่");
    }
  });