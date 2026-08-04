import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AskInput = z.object({
  question: z.string().min(1).max(600),
  facts: z.string().min(1).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(10)
    .default([]),
});

/** Thai astrologer AI. The chart facts are computed server-side and passed in as ground truth. */
export const askAstrologer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("ยังไม่ได้ตั้งค่าบริการ AI");

    const system = [
      "คุณคือ 'โหรา AI' นักโหราศาสตร์ไทยระบบสุริยยาตร์ที่สุภาพ อบอุ่น และตรงประเด็น",
      "ตอบเป็นภาษาไทยเสมอ ความยาว 3-6 ประโยค ใช้ศัพท์โหราศาสตร์ไทย เช่น ลัคนา ภพ ดาวพักร์ ราศี",
      "ต้องอ้างอิงเฉพาะข้อเท็จจริงจากผังดวงที่ให้มาเท่านั้น ห้ามแต่งตำแหน่งดาวขึ้นเอง",
      "ให้คำแนะนำเชิงปฏิบัติ 1 ข้อเสมอ และห้ามให้คำแนะนำทางการแพทย์ กฎหมาย หรือการลงทุนแบบชี้ชัด",
      "",
      "ข้อเท็จจริงผังดวงของผู้ถาม:",
      data.facts,
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: system },
          ...data.history,
          { role: "user", content: data.question },
        ],
      }),
    });

    if (res.status === 429) throw new Error("มีผู้ใช้งานมากเกินไป กรุณาลองใหม่อีกครั้งในสักครู่");
    if (res.status === 402) throw new Error("เครดิต AI หมด กรุณาเติมเครดิตในเวิร์กสเปซของคุณ");
    if (!res.ok) throw new Error(`โหรา AI ตอบไม่ได้ (${res.status})`);

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { answer: json.choices?.[0]?.message?.content ?? "ขออภัย ยังตอบไม่ได้ในตอนนี้" };
  });
