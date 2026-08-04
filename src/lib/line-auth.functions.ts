import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SignInInput = z.object({ idToken: z.string().min(20).max(4000) });

/** Public config the browser needs to boot LIFF. LIFF id is not a secret. */
export const getLiffConfig = createServerFn({ method: "GET" }).handler(async () => {
  return { liffId: process.env["LINE_LIFF_ID"] ?? null };
});

type LineVerified = { sub: string; name?: string; picture?: string };

/**
 * Verifies a LIFF ID token with LINE, then signs the user into Cloud auth,
 * creating the account on first login. Returns a session for the browser.
 */
export const signInWithLine = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SignInInput.parse(input))
  .handler(async ({ data }) => {
    const channelId = process.env["LINE_LOGIN_CHANNEL_ID"];
    const channelSecret = process.env["LINE_CHANNEL_SECRET"];
    if (!channelId || !channelSecret) {
      throw new Error("ยังไม่ได้ตั้งค่า LINE Login (Channel ID / Secret)");
    }

    const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_token: data.idToken, client_id: channelId }),
    });
    if (!verifyRes.ok) {
      const body = await verifyRes.text();
      console.error(`[line] verify failed [${verifyRes.status}]: ${body}`);
      throw new Error("ยืนยันตัวตนกับ LINE ไม่สำเร็จ กรุณาลองใหม่");
    }
    const verified = (await verifyRes.json()) as LineVerified;
    if (!verified.sub) throw new Error("LINE ไม่ได้ส่งรหัสผู้ใช้กลับมา");

    const { createHmac } = await import("node:crypto");
    const password = createHmac("sha256", channelSecret).update(verified.sub).digest("hex");
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

    if (signIn.error) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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
        throw new Error("สร้างบัญชีผู้ใช้ไม่สำเร็จ");
      }
      signIn = await authClient.auth.signInWithPassword({ email, password });
      if (signIn.error) {
        console.error("[line] sign-in failed", signIn.error.message);
        throw new Error("เข้าสู่ระบบไม่สำเร็จ");
      }
    }

    const session = signIn.data.session;
    if (!session) throw new Error("ไม่ได้รับ session จากระบบยืนยันตัวตน");

    // Keep the LINE display name / avatar fresh on every sign-in.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
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

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      lineUserId: verified.sub,
      displayName,
      avatarUrl,
    };
  });
