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

export type BindChartResult = {
  birthProfile: BirthProfileRow;
  chart: NatalChartRow;
  ascendantKnown: boolean;
  reused: boolean;
};

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

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type NatalChartRow = {
  id: string;
  ascendant_sign: string;
  ascendant_degree: number;
  planets_json: Json;
  houses_json: Json;
  standards_json: Json;
  calculation_version: string;
  calculated_at: string;
  ascendant_json: Json;
  ascendant_known: boolean;
  utc_birth_datetime: string | null;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  house_system: string;
  ayanamsa: number | null;
  engine_type: string;
  input_hash: string | null;
};

const BIRTH_COLUMNS =
  "id, nickname, birth_date, birth_time, birth_time_known, country, province, district, latitude, longitude, timezone, calculation_system";
const CHART_COLUMNS =
  "id, ascendant_sign, ascendant_degree, planets_json, houses_json, standards_json, calculation_version, calculated_at, ascendant_json, ascendant_known, utc_birth_datetime, timezone, latitude, longitude, house_system, ayanamsa, engine_type, input_hash";

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
      country_code: "TH",
      locality: data.district?.trim() || data.province,
      birth_time_estimated: !data.birth_time_known,
      utc_birth_datetime: new Date(
        `${data.birth_date}T${(data.birth_time_known ? (data.birth_time ?? "12:00") : "12:00")}:00+07:00`,
      ).toISOString(),
      calculation_system: "sidereal_lahiri_dev",
      calculation_settings_json: {
        ayanamsa: "lahiri",
        zodiac: "sidereal",
        house_system: "whole_sign",
        engine: "sidereal_lahiri_dev",
      },
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
 * Step 5: calculate the natal chart, snapshot it and complete onboarding.
 * No entitlement is granted here — the premium trial only starts when the
 * user explicitly confirms it on the premium screen.
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
      planets_json: payload.planets as unknown as Json,
      houses_json: payload.houses as unknown as Json,
      standards_json: payload.standards as unknown as Json,
      calculation_version: CALCULATION_VERSION,
      engine_type: "sidereal_lahiri_dev",
      input_snapshot_json: {
        birth_date: b.birth_date,
        birth_time: b.birth_time,
        birth_time_known: b.birth_time_known,
        latitude: b.latitude,
        longitude: b.longitude,
        timezone: b.timezone,
        province: b.province,
        country: b.country,
      } as unknown as Json,
      calculation_settings_json: {
        ayanamsa: "lahiri",
        zodiac: "sidereal",
        house_system: "whole_sign",
      } as unknown as Json,
      calculated_at: payload.calculatedAt,
    };

    const { data: saved, error } = await supabase
      .from("natal_charts")
      .upsert(chartRow, { onConflict: "birth_profile_id" })
      .select(CHART_COLUMNS)
      .single();
    if (error) throw new Error(error.message);

    await supabase
      .from("profiles")
      .update({ onboarding_completed: true, onboarded: true })
      .eq("id", userId);

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