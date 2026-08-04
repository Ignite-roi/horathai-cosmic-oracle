import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  getLiffIdToken,
  initLiff,
  isLiffLoggedIn,
  liffLogin,
  liffLogout,
} from "@/lib/liff-browser";
import { getLiffConfig, signInWithLine } from "@/lib/line-auth.functions";
import { getMyAccount, type AccountData } from "@/lib/profile.functions";
import { useProfile } from "@/store/useProfile";

/**
 * booting        – LIFF SDK is initialising
 * external       – opened outside the LINE app (login still possible)
 * logged-out     – LIFF ready, user has not authorised yet
 * verifying      – exchanging the LINE ID token with our backend
 * ready          – verified session available
 * unconfigured   – no LIFF id configured on the server
 * error          – init / login / verification failed, retry available
 */
export type LineStatus =
  | "idle"
  | "booting"
  | "external"
  | "logged-out"
  | "verifying"
  | "ready"
  | "unconfigured"
  | "error";

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

/**
 * Boots LIFF, auto-signs the user in when the app is opened from LINE, and
 * mirrors the account row into the local store so every screen keeps working.
 */
export function useLineAuth() {
  const { session, loading } = useSession();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LineStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const { data: account } = useAccount();
  const setProfile = useProfile((s) => s.setProfile);

  const { data: config } = useQuery({
    queryKey: ["liff-config"],
    queryFn: () => getLiffConfig(),
    staleTime: Infinity,
  });

  const doSignIn = useCallback(async () => {
    setError(null);
    setStatus("signing-in");
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
      setStatus("ready");
      return true;
    } catch (err) {
      console.error("[line] sign-in", err);
      setError(err instanceof Error ? err.message : "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ");
      setStatus("error");
      return false;
    }
  }, [queryClient]);

  // Boot LIFF, then finish sign-in automatically when LINE already knows the user.
  useEffect(() => {
    if (loading) return;
    if (config === undefined) return;
    if (!config.liffId) {
      setStatus("unconfigured");
      return;
    }
    let cancelled = false;
    setStatus((s) => (s === "idle" ? "booting" : s));
    void (async () => {
      const ok = await initLiff(config.liffId);
      if (cancelled) return;
      if (!ok) {
        setStatus("error");
        setError("เริ่มต้น LIFF ไม่สำเร็จ");
        return;
      }
      if (!session && (await isLiffLoggedIn())) {
        await doSignIn();
        return;
      }
      if (!cancelled) setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [config, loading, session, doSignIn]);

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
    setError(null);
    if (!config?.liffId) {
      setError("ยังไม่ได้ตั้งค่า LIFF ID");
      return false;
    }
    const ok = await initLiff(config.liffId);
    if (!ok) {
      setError("เริ่มต้น LIFF ไม่สำเร็จ");
      return false;
    }
    if (!(await isLiffLoggedIn())) {
      await liffLogin(window.location.href);
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

  return {
    session,
    isSignedIn: Boolean(session),
    status,
    error,
    configured: Boolean(config?.liffId),
    account,
    login,
    logout,
  };
}
