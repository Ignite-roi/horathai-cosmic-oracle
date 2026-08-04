import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AskAstrologerInput } from "@/lib/ai.schemas";

/** Thai astrologer AI. The chart facts are computed server-side and passed in as ground truth. */
export const askAstrologer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskAstrologerInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: wallet, error: walletError } = await context.supabase
      .from("user_credits")
      .select("days_remaining, expires_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (walletError) throw new Error(walletError.message);
    const expired = wallet?.expires_at ? new Date(wallet.expires_at).getTime() <= Date.now() : true;
    if (!wallet || wallet.days_remaining <= 0 || expired) {
      throw new Error("วันใช้งานหมดแล้ว กรุณาเติมวันเพื่อถามโหรา AI");
    }
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) throw new Error("ยังไม่ได้ตั้งค่า Gemini API key");

    const { generateAstrologerAnswer } = await import("@/lib/gemini-astrologer.server");
    return generateAstrologerAnswer(apiKey, data);
  });
