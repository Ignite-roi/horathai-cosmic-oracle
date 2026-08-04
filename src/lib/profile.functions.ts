import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CivilTimeSchema } from "@/lib/civil-time";

const ProfileInput = z.object({
  display_name: z.string().min(1).max(80).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  birth_time: CivilTimeSchema.optional(),
  province: z.string().min(1).max(80).optional(),
  country: z.string().min(1).max(80).optional(),
  onboarded: z.boolean().optional(),
});

export type AccountData = {
  profile: {
    line_user_id: string | null;
    display_name: string;
    avatar_url: string | null;
    picture_url: string | null;
    birth_date: string | null;
    birth_time: string | null;
    province: string;
    country: string;
    onboarded: boolean;
    onboarding_completed: boolean;
    subscription_status: string;
    trial_started_at: string | null;
    trial_ends_at: string | null;
    last_login_at: string | null;
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
        .select(
          "line_user_id, display_name, avatar_url, picture_url, birth_date, birth_time, province, country, onboarded, onboarding_completed, subscription_status, trial_started_at, trial_ends_at, last_login_at",
        )
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

/** The resolved access state for the signed-in user (server is the authority). */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { resolveEntitlementForUser } = await import("./access.server");
    const resolved = await resolveEntitlementForUser(context.supabase, context.userId);
    return { mode: resolved.mode, plan: resolved.plan };
  });

/**
 * Starts the 30-day premium trial. Never called implicitly — the client must
 * pass `confirm: true`, which only happens after the user taps the confirm
 * button in the trial dialog. Entitlements are write-protected by RLS, so the
 * update runs through the trusted server client.
 */
export const startPremiumTrial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ confirm: z.literal(true) }).parse(input))
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("entitlements")
      .update({
        plan: "premium_trial",
        trial_started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("user_id", userId)
      .is("trial_started_at", null)
      .select("plan, trial_started_at, expires_at")
      .maybeSingle();
    if (error) throw new Error(error.message);
    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "trialing",
        trial_started_at: startedAt.toISOString(),
        trial_ends_at: expiresAt.toISOString(),
      })
      .eq("id", userId);
    return (
      data ?? {
        plan: "premium_trial",
        trial_started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      }
    );
  });

/**
 * Daily check-in. Points are awarded by a server-side routine using the
 * server clock (Asia/Bangkok) and a unique per-day event row, so the reward
 * cannot be claimed twice or forged from the client.
 */
export const dailyCheckIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("daily_check_in", {
      _user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("บันทึกเช็คอินไม่สำเร็จ");
    return {
      reward: row.already_checked_in ? null : row.reward,
      points: row.points,
      streak: row.streak,
      last_check_in: row.event_date,
    };
  });
