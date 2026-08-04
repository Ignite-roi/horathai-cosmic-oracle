import type { AskAstrologerData } from "@/lib/ai.schemas";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { code?: number; message?: string; status?: string };
};

const GEMINI_MODEL = "gemini-flash-lite-latest";

function buildSystemInstruction(facts: string) {
  return [
    "คุณคือ 'โหรา AI' นักโหราศาสตร์ไทยที่สุภาพ อบอุ่น และตรงประเด็น",
    "ระบบคำนวณปัจจุบันเป็นโมเดล Lahiri แบบ versioned deterministic และ independent Swiss/JPL multi-epoch benchmark ยังไม่เสร็จ ห้ามอ้างความแม่นยำที่ผ่านการรับรองหรือความเข้ากันได้กับระบบคำนวณไทยดั้งเดิม",
    "ตอบเป็นภาษาไทยเสมอ ความยาว 3-6 ประโยค ใช้ศัพท์โหราศาสตร์ไทย เช่น ลัคนา ภพ ดาวพักร์ ราศี",
    "อ้างอิงเฉพาะข้อเท็จจริงจากผังดวงที่ให้มา ห้ามสร้างตำแหน่งดาว ภพ มุมสัมพันธ์ กฎ หรือแหล่งอ้างอิงขึ้นเอง",
    "ใช้ภาษาเชิงสะท้อนและความเป็นไปได้ ไม่กล่าวว่าโหราศาสตร์เป็นเหตุผลเชิงวิทยาศาสตร์",
    "ให้คำแนะนำเชิงปฏิบัติ 1 ข้อ และห้ามฟันธงเรื่องการแพทย์ กฎหมาย การเงิน ความตาย ภัยพิบัติ การตั้งครรภ์ หรืออาชญากรรม",
    "แยกข้อเท็จจริงที่คำนวณได้ออกจากคำอธิบาย หากข้อมูลไม่พอให้บอกข้อจำกัดตรงไปตรงมา",
    "",
    "ข้อเท็จจริงผังดวงของผู้ถาม:",
    facts,
  ].join("\n");
}

export async function generateAstrologerAnswer(apiKey: string, data: AskAstrologerData) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: buildSystemInstruction(data.facts) }] },
        contents: [
          ...data.history.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          { role: "user", parts: [{ text: data.question }] },
        ],
        generationConfig: {
          maxOutputTokens: 700,
          temperature: 0.45,
        },
      }),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as GeminiResponse;
  if (response.status === 400 || response.status === 401 || response.status === 403) {
    console.error("Gemini authentication/configuration failed", response.status, payload.error?.status);
    throw new Error("การเชื่อมต่อ Gemini ไม่ถูกต้อง กรุณาตรวจสอบ API key และสิทธิ์การใช้งาน");
  }
  if (response.status === 429) {
    throw new Error("โควตา Gemini Free Tier เต็มแล้ว กรุณารอสักครู่แล้วลองใหม่");
  }
  if (!response.ok) {
    console.error("Gemini request failed", response.status, payload.error?.status);
    throw new Error("Gemini ยังไม่สามารถตอบได้ กรุณาลองใหม่อีกครั้ง");
  }

  const answer = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!answer) throw new Error("Gemini ไม่ได้ส่งคำตอบกลับมา กรุณาลองถามใหม่");

  return { answer, provider: "google-gemini-direct", model: GEMINI_MODEL } as const;
}