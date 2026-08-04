import { useMemo } from "react";

import {
  APP_ACCESS_MODE,
  canUseFeature,
  FREE_PLAN,
  planStateFrom,
  PREMIUM_FEATURES,
  type Feature,
  type PlanState,
} from "@/config/access";
import { useLineAuth } from "@/context/LineAuthContext";

export type FeatureAccess = {
  /** True while the development-wide unlock is active. */
  unlockedForEveryone: boolean;
  mode: typeof APP_ACCESS_MODE;
  plan: PlanState;
  /** Can the current user use this feature right now? */
  can: (feature: Feature) => boolean;
  /** Would this feature need a plan once enforcement is switched on? */
  isPremiumFeature: (feature: Feature) => boolean;
  loading: boolean;
};

/**
 * The single hook every screen uses to decide what to show. Never gate UI on
 * subscription fields directly — always go through `access.can(...)` so the
 * later switch to real enforcement is a one-line config change.
 */
export function useFeatureAccess(): FeatureAccess {
  const { account, isSignedIn } = useLineAuth();
  const entitlement = account?.entitlement ?? null;

  return useMemo(() => {
    const plan = entitlement ? planStateFrom(entitlement) : FREE_PLAN;
    return {
      unlockedForEveryone: APP_ACCESS_MODE === "development_unlocked",
      mode: APP_ACCESS_MODE,
      plan,
      can: (feature: Feature) => canUseFeature(feature, plan),
      isPremiumFeature: (feature: Feature) => PREMIUM_FEATURES.includes(feature),
      loading: isSignedIn && !account,
    };
  }, [entitlement, account, isSignedIn]);
}