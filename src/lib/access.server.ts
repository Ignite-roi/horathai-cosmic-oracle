/**
 * Server-side entitlement resolver. Server functions call this instead of
 * trusting anything the browser sends. During the development period it
 * unlocks everything, but the real plan state is still resolved and returned
 * so switching APP_ACCESS_MODE later needs no other change.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  APP_ACCESS_MODE,
  canUseFeature,
  planStateFrom,
  type Feature,
  type PlanState,
} from "@/config/access";

export type ResolvedEntitlement = {
  userId: string;
  mode: typeof APP_ACCESS_MODE;
  plan: PlanState;
  can: (feature: Feature) => boolean;
};

export async function resolveEntitlementForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<ResolvedEntitlement> {
  const { data } = await supabase
    .from("entitlements")
    .select("plan, trial_started_at, expires_at")
    .eq("user_id", userId)
    .maybeSingle();
  const plan = planStateFrom(data);
  return {
    userId,
    mode: APP_ACCESS_MODE,
    plan,
    can: (feature: Feature) => canUseFeature(feature, plan),
  };
}

/** Throws when a feature is not available to the user under the current mode. */
export async function assertFeature(
  supabase: SupabaseClient,
  userId: string,
  feature: Feature,
) {
  const entitlement = await resolveEntitlementForUser(supabase, userId);
  if (!entitlement.can(feature)) {
    throw new Error("ฟีเจอร์นี้สำหรับสมาชิกพรีเมียม");
  }
  return entitlement;
}