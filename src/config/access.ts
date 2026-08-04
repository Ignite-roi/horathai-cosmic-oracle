/**
 * Central access configuration.
 *
 * The product is in active development: every feature is unlocked for every
 * user (free, trial and guest alike). Entitlement plumbing stays in place so
 * real restrictions can be switched on later by flipping APP_ACCESS_MODE to
 * "entitlement_enforced" — no feature code has to change.
 */
export type AccessMode = "development_unlocked" | "entitlement_enforced";

export const APP_ACCESS_MODE: AccessMode = "development_unlocked";

export const FEATURES = [
  "birth_chart",
  "transit",
  "time_travel",
  "ai_astrologer",
  "ai_voice",
  "deep_report",
  "life_timeline",
  "compatibility",
  "notifications",
] as const;

export type Feature = (typeof FEATURES)[number];

/** Features that will require an active plan once enforcement is enabled. */
export const PREMIUM_FEATURES: readonly Feature[] = [
  "deep_report",
  "life_timeline",
  "compatibility",
  "ai_voice",
  "time_travel",
];

export type PlanState = {
  plan: string;
  isTrial: boolean;
  isActive: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
};

export const FREE_PLAN: PlanState = {
  plan: "free",
  isTrial: false,
  isActive: false,
  expiresAt: null,
  daysLeft: null,
};

export function planStateFrom(
  entitlement: { plan?: string | null; expires_at?: string | null } | null | undefined,
  now: Date = new Date(),
): PlanState {
  const plan = entitlement?.plan ?? "free";
  const expiresAt = entitlement?.expires_at ?? null;
  const ms = expiresAt ? new Date(expiresAt).getTime() - now.getTime() : null;
  const isActive = plan !== "free" && (ms === null || ms > 0);
  return {
    plan,
    isTrial: plan === "premium_trial",
    isActive,
    expiresAt,
    daysLeft: ms === null ? null : Math.max(0, Math.ceil(ms / 86_400_000)),
  };
}

/** Single source of truth for "can this user use feature X right now?". */
export function canUseFeature(
  feature: Feature,
  plan: PlanState,
  mode: AccessMode = APP_ACCESS_MODE,
): boolean {
  if (mode === "development_unlocked") return true;
  if (!PREMIUM_FEATURES.includes(feature)) return true;
  return plan.isActive;
}