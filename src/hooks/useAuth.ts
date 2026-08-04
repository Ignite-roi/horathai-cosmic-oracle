import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  getLiffIdToken,
  initLiff,
  isInsideLine,
  isLiffLoggedIn,
  liffLogin,
  liffLogout,
  missingLiffIdError,
  resetLiffInitialization,
  sanitizeRedirectUrl,
  type LiffError,
} from "@/lib/liff-browser";
import { getLiffConfig, signInWithLine } from "@/lib/line-auth.functions";
import { getMyAccount, type AccountData } from "@/lib/profile.functions";
import { useProfile } from "@/store/useProfile";

/**
 * idle                 – nothing started yet
 * loading_config       – fetching the public LIFF config from the server
 * initializing         – LIFF SDK is initialising
 * login_required       – LIFF ready, user has not authorised yet
 * signing_in           – exchanging the LINE ID token with our backend
 * authenticated        – verified Cloud session available
 * ready                – boot finished without a session (e.g. outside LINE)
 * configuration_error  – LIFF id missing / wrong / endpoint mismatch
 * initialization_error – SDK failed for a transient reason
 */
export type LineStatus =
  | "idle"
  | "loading_config"
  | "initializing"
  | "login_required"
  | "signing_in"
  | "authenticated"
  | "ready"
  | "configuration_error"
  | "initialization_error";

/** Session state driven by Cloud auth. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

/** Loads the signed-in user's profile / premium / points from the database. */
export function useAccount() {
  const { session } = useSession();
  return useQuery<AccountData>({
    queryKey: ["account", session?.user.id ?? null],
    queryFn: () => getMyAccount(),
    enabled: Boolean(session),
    staleTime: 30_000,
  });
}

export type LineAuthState = ReturnType<typeof useLineAuthMachine>;

/**
 * Boots LIFF once, auto-signs the user in when LINE already knows them, and
 * mirrors the account row into the local store.
 *
 * Internal: mount exactly once via <LineAuthProvider>.
 */
export function useLineAuthMachine() {
  const { session, loading } = useSession();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LineStatus>("idle");
  const [liffError, setLiffError] = useState<LiffError | null>(null);
  const [inLine, setInLine] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [lineLoggedIn, setLineLoggedIn] = useState(false);
  const { data: account } = useAccount();
  const setProfile = useProfile((s) => s.setProfile);

  const {
    data: config,
    isLoading: configLoading,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: ["liff-config"],
    queryFn: () => getLiffConfig(),
    staleTime: Infinity,
  });

  const doSignIn = useCallback(async () => {
    setLiffError(null);
    setStatus("signing_in");
    try {
      const idToken = await getLiffIdToken();
      if (!idToken) throw new Error("ไม่ได้รับ ID token จาก LINE");
      const result = await signInWithLine({ data: { idToken } });
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
      if (sessionError) throw sessionError;
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      setStatus("authenticated");
      return true;
    } catch (err) {
      console.error("[line] sign-in failed");
      setLiffError({
        code: "SIGN_IN_FAILED",
        message: err instanceof Error ? err.message : "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ",
        isConfigurationError: false,
        isOutsideLine: false,
        timestamp: new Date().toISOString(),
      });
      setStatus("initialization_error");
      return false;
    }
  }, [queryClient]);

  /** One centralized boot sequence. Never runs in parallel with itself. */
  const boot = useCallback(
    async (liffId: string | null) => {
      if (!liffId) {
        setLiffError(missingLiffIdError());
        setStatus("configuration_error");
        return false;
      }
      setStatus("initializing");
      const result = await initLiff(liffId);
      if (!result.ok) {
        setInitialized(false);
        setLiffError(result.error);
        setStatus(
          result.error.isConfigurationError ? "configuration_error" : "initialization_error",
        );
        return false;
      }
      setInitialized(true);
      setLiffError(null);
      const inside = await isInsideLine();
      setInLine(inside);
      const loggedIn = await isLiffLoggedIn();
      setLineLoggedIn(loggedIn);
      if (session) {
        setStatus("authenticated");
        return true;
      }
      if (loggedIn) return doSignIn();
      setStatus(inside ? "login_required" : "ready");
      return false;
    },
    [session, doSignIn],
  );

  // Boot exactly once per config value.
  const bootedFor = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (loading) return;
    if (configLoading) {
      setStatus((s) => (s === "idle" ? "loading_config" : s));
      return;
    }
    if (config === undefined) return;
    if (bootedFor.current === config.liffId) return;
    bootedFor.current = config.liffId;
    void boot(config.liffId);
  }, [config, configLoading, loading, boot]);

  // A session arriving later (e.g. restored from storage) promotes the state.
  useEffect(() => {
    if (session) setStatus((s) => (s === "signing_in" ? s : "authenticated"));
  }, [session]);

  // Mirror the database row into the local store.
  useEffect(() => {
    if (!account?.profile) return;
    const p = account.profile;
    setProfile({
      name: p.display_name,
      avatar: p.avatar_url,
      birthDate: p.birth_date ?? "",
      birthTime: p.birth_time ?? "",
      province: p.province,
      country: p.country,
      onboarded: p.onboarded,
      premiumTrialStartedAt: account.entitlement?.trial_started_at ?? null,
      points: account.gamification?.points ?? 0,
      streak: account.gamification?.streak ?? 0,
      lastCheckIn: account.gamification?.last_check_in ?? null,
      lineUserId: p.line_user_id,
    });
  }, [account, setProfile]);

  const login = useCallback(async () => {
    setLiffError(null);
    if (!config?.liffId) {
      setLiffError(missingLiffIdError());
      setStatus("configuration_error");
      return false;
    }
    const result = await initLiff(config.liffId);
    if (!result.ok) {
      setLiffError(result.error);
      setStatus(result.error.isConfigurationError ? "configuration_error" : "initialization_error");
      return false;
    }
    if (!(await isLiffLoggedIn())) {
      await liffLogin(sanitizeRedirectUrl());
      return false; // page navigates to LINE
    }
    return doSignIn();
  }, [config, doSignIn]);

  const logout = useCallback(async () => {
    await liffLogout();
    await supabase.auth.signOut();
    queryClient.clear();
    useProfile.getState().reset();
  }, [queryClient]);

  /** Clears the error, resets LIFF and performs a true fresh init. */
  const retry = useCallback(async () => {
    setLiffError(null);
    setInitialized(false);
    setStatus("loading_config");
    resetLiffInitialization();
    const next = await refetchConfig();
    const liffId = next.data?.liffId ?? config?.liffId ?? null;
    bootedFor.current = liffId;
    return boot(liffId);
  }, [refetchConfig, config, boot]);

  return {
    session,
    isSignedIn: Boolean(session),
    status,
    /** Sanitized structured error for diagnostics. */
    liffError,
    /** Human readable message for existing screens. */
    error: liffError?.message ?? null,
    inLine,
    initialized,
    lineLoggedIn,
    booting:
      status === "idle" ||
      status === "loading_config" ||
      status === "initializing" ||
      status === "signing_in",
    retry,
    configured: Boolean(config?.liffId),
    account,
    login,
    logout,
  };
}
