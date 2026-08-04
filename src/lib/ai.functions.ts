import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AskAstrologerInput } from "@/lib/ai.schemas";

/** Thai astrologer AI. The chart facts are computed server-side and passed in as ground truth. */
export const askAstrologer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskAstrologerInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) throw new Error("ยังไม่ได้ตั้งค่า Gemini API key");

    const { generateAstrologerAnswer } = await import("@/lib/gemini-astrologer.server");
    return generateAstrologerAnswer(apiKey, data);
  });
