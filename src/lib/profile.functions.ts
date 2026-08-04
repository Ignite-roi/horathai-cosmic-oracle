import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ProfileInput = z.object({
  display_name: z.string().min(1).max(80).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  province: z.string().min(1).max(80).optional(),
  country: z.string().min(1).max(80).optional(),
  onboarded: z.boolean().optional(),
});

export type AccountData = {
  profile: {
    line_user_id: string | null;
    display_name: string;
    avatar_url: string | null;
    birth_date: string | null;
    birth_time: string | null;
    province: string;
    country: string;
    onboarded: boolean;
  } | null;
  entitlement: { plan: string; trial_started_at: string | null; expires_at: string | null } | null;
  gamification: { points: number; streak: number; last_check_in: string | null } | null;
};

/** Everything the app needs about the signed-in user, in one round trip. */
export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountData> => {
    const { supabase, userId } = context;
    const [profile, entitlement, gamification] = await Promise.all([
      supabase
        .from("profiles")
        .select("line_user_id, display_name, avatar_url, birth_date, birth_time, province, country, onboarded")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("entitlements")
        .select("plan, trial_started_at, expires_at")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("gamification")
        .select("points, streak, last_check_in")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    return {
      profile: profile.data ?? null,
      entitlement: entitlement.data ?? null,
      gamification: gamification.data ?? null,
    };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProfileInput.parse(input))
  .handler(async ({ data, context }) => {
    const patch: {
      display_name?: string;
      birth_date?: string;
      birth_time?: string;
      province?: string;
      country?: string;
      onboarded?: boolean;
    } = {};
    if (data.display_name !== undefined) patch.display_name = data.display_name;
    if (data.birth_date !== undefined) patch.birth_date = data.birth_date;
    if (data.birth_time !== undefined) patch.birth_time = data.birth_time;
    if (data.province !== undefined) patch.province = data.province;
    if (data.country !== undefined) patch.country = data.country;
    if (data.onboarded !== undefined) patch.onboarded = data.onboarded;
    const { error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Starts the 30-day premium trial once; returns the current entitlement. */
export const startPremiumTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const current = await supabase
      .from("entitlements")
      .select("plan, trial_started_at, expires_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (current.data?.trial_started_at) return current.data;

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 30 * 86400000);
    const { data, error } = await supabase
      .from("entitlements")
      .update({
        plan: "premium_trial",
        trial_started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("user_id", userId)
      .select("plan, trial_started_at, expires_at")
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

/** Daily check-in. Returns the reward, or null when already checked in today. */
export const dailyCheckIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);
    const current = await supabase
      .from("gamification")
      .select("points, streak, last_check_in")
      .eq("user_id", userId)
      .maybeSingle();
    if (!current.data) throw new Error("ไม่พบข้อมูลสะสมแต้ม");
    if (current.data.last_check_in === today) return { reward: null, ...current.data };

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const reward = 20 + Math.floor(Math.random() * 30);
    const streak = current.data.last_check_in === yesterday ? current.data.streak + 1 : 1;
    const { data, error } = await supabase
      .from("gamification")
      .update({ points: current.data.points + reward, streak, last_check_in: today })
      .eq("user_id", userId)
      .select("points, streak, last_check_in")
      .single();
    if (error) throw new Error(error.message);
    return { reward, ...data };
  });
