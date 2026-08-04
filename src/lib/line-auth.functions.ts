import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

const SignInInput = z.object({ idToken: z.string().min(20).max(4000) });

/** Public config the browser needs to boot LIFF. LIFF id is not a secret. */
export const getLiffConfig = createServerFn({ method: "GET" }).handler(async () => {
  return { liffId: process.env["LINE_LIFF_ID"] ?? null };
});

function maskId(value: string | undefined | null) {
  if (!value) return null;
  if (value.length <= 6) return "***";
  return `${value.slice(0, 4)}***${value.slice(-3)}`;
}

/**
 * Development-only configuration diagnostic. Returns booleans and a masked id
 * only — never a secret value, token or full credential.
 */
export const getLiffDiagnostics = createServerFn({ method: "GET" }).handler(async () => {
  const { APP_ACCESS_MODE } = await import("@/config/access");
  if (APP_ACCESS_MODE !== "development_unlocked") return null;
  const liffId = process.env["LINE_LIFF_ID"] ?? null;
  return {
    accessMode: APP_ACCESS_MODE,
    hasLiffId: Boolean(liffId),
    maskedLiffId: maskId(liffId),
    liffIdLooksValid: Boolean(liffId && /^\d{10}-[0-9a-zA-Z]{8}$/.test(liffId)),
    hasLoginChannelId: Boolean(process.env["LINE_LOGIN_CHANNEL_ID"]),
    hasChannelSecret: Boolean(process.env["LINE_CHANNEL_SECRET"]),
    hasBridgeSecret: Boolean(process.env["LINE_AUTH_BRIDGE_SECRET"]),
  };
});

type LineVerified = { sub: string; name?: string; picture?: string };

const MAX_ATTEMPTS_PER_WINDOW = 10;
const WINDOW_MINUTES = 5;

function sha256(value: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return import("node:crypto").then(({ createHash }) =>
    createHash("sha256").update(value).digest("hex"),
  );
}

/**
 * Verifies a LIFF ID token with LINE, then signs the user into Cloud auth,
 * creating the account on first login. Returns a session for the browser.
 *
 * Security notes: the ID token is never trusted client-side, never logged, and
 * the Cloud bridge password is derived from a dedicated bridge secret rather
 * than the LINE channel secret. Every attempt is rate limited per client and
 * recorded in the server-only auth_events audit log.
 */
export const signInWithLine = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SignInInput.parse(input))
  .handler(async ({ data }) => {
    const channelId = process.env["LINE_LOGIN_CHANNEL_ID"];
    const channelSecret = process.env["LINE_CHANNEL_SECRET"];
    if (!channelId || !channelSecret) {
      throw new Error("ยังไม่ได้ตั้งค่า LINE Login (Channel ID / Secret)");
    }
    const bridgeSecret = process.env["LINE_AUTH_BRIDGE_SECRET"] ?? null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    const ipHash = await sha256(`${ip}:${channelId}`);
    const userAgent = (getRequestHeader("user-agent") ?? "").slice(0, 120);
    const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

    const recent = await supabaseAdmin
      .from("auth_events")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((recent.count ?? 0) >= MAX_ATTEMPTS_PER_WINDOW) {
      await supabaseAdmin.from("auth_events").insert({
        event_type: "line_sign_in",
        success: false,
        error_code: "rate_limited",
        ip_hash: ipHash,
        user_agent_summary: userAgent,
      });
      throw new Error("พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่");
    }

    const audit = async (
      success: boolean,
      errorCode: string | null,
      userId: string | null = null,
    ) => {
      await supabaseAdmin.from("auth_events").insert({
        user_id: userId,
        event_type: "line_sign_in",
        success,
        error_code: errorCode,
        ip_hash: ipHash,
        user_agent_summary: userAgent,
      });
    };

    const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_token: data.idToken, client_id: channelId }),
    });
    if (!verifyRes.ok) {
      console.error(`[line] verify failed with status ${verifyRes.status}`);
      await audit(false, `verify_${verifyRes.status}`);
      throw new Error("ยืนยันตัวตนกับ LINE ไม่สำเร็จ กรุณาลองใหม่");
    }
    const verified = (await verifyRes.json()) as LineVerified;
    if (!verified.sub) {
      await audit(false, "missing_sub");
      throw new Error("LINE ไม่ได้ส่งรหัสผู้ใช้กลับมา");
    }

    const { createHmac } = await import("node:crypto");
    const legacyPassword = createHmac("sha256", channelSecret).update(verified.sub).digest("hex");
    const password = bridgeSecret
      ? createHmac("sha256", bridgeSecret).update(`line:${verified.sub}`).digest("hex")
      : legacyPassword;
    const email = `line_${verified.sub.toLowerCase()}@horathai.app`;
    const displayName = verified.name?.slice(0, 80) || "ผู้เดินทางแห่งดวงดาว";
    const avatarUrl = verified.picture ?? null;

    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"]!;
    const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const authClient = createClient(url, publishableKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    let signIn = await authClient.auth.signInWithPassword({ email, password });

    // Accounts created before the bridge secret existed still hold the legacy
    // password: sign in with it once, then rotate to the bridge-derived one.
    if (signIn.error && bridgeSecret) {
      const legacy = await authClient.auth.signInWithPassword({
        email,
        password: legacyPassword,
      });
      if (!legacy.error && legacy.data.user) {
        await supabaseAdmin.auth.admin.updateUserById(legacy.data.user.id, { password });
        signIn = await authClient.auth.signInWithPassword({ email, password });
      }
    }

    if (signIn.error) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          line_user_id: verified.sub,
          display_name: displayName,
          avatar_url: avatarUrl,
        },
      });
      if (created.error && !/already/i.test(created.error.message)) {
        console.error("[line] createUser failed", created.error.message);
        await audit(false, "create_user_failed");
        throw new Error("สร้างบัญชีผู้ใช้ไม่สำเร็จ");
      }
      signIn = await authClient.auth.signInWithPassword({ email, password });
      if (signIn.error) {
        console.error("[line] sign-in failed", signIn.error.message);
        await audit(false, "sign_in_failed");
        throw new Error("เข้าสู่ระบบไม่สำเร็จ");
      }
    }

    const session = signIn.data.session;
    if (!session) {
      await audit(false, "missing_session");
      throw new Error("ไม่ได้รับ session จากระบบยืนยันตัวตน");
    }

    // Keep the LINE display name / avatar fresh on every sign-in.
    await supabaseAdmin
      .from("profiles")
      .update({
        line_user_id: verified.sub,
        display_name: displayName,
        avatar_url: avatarUrl,
        picture_url: avatarUrl,
        last_login_at: new Date().toISOString(),
      })
      .eq("id", signIn.data.user!.id);

    await audit(true, null, signIn.data.user!.id);

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      lineUserId: verified.sub,
      displayName,
      avatarUrl,
    };
  });
