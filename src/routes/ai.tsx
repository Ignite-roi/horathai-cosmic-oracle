import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { HOUSES, buildChart } from "@/lib/astro";
import { seedKey, useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "โหร AI ส่วนตัว | Horathai AI" },
      { name: "description", content: "ถามโหร AI ได้ทุกเรื่อง การงาน การเงิน ความรัก โดยอ้างอิงผังดวงจริงของคุณ" },
      { property: "og:title", content: "โหร AI ส่วนตัว | Horathai AI" },
      { property: "og:description", content: "ผู้ช่วยโหราศาสตร์ไทยที่ตอบจากข้อมูลผังดวงกำเนิดของคุณโดยตรง" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiPage,
});

type Msg = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "ควรลงทุนตอนนี้ไหม",
  "ควรเปลี่ยนงานหรือเปล่า",
  "จะเจอเนื้อคู่เมื่อไหร่",
  "ช่วงนี้ควรระวังอะไร",
];

function AiPage() {
  const profile = useProfile();
  const chart = useMemo(() => buildChart(seedKey(profile) || "guest"), [profile]);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: `สวัสดีค่ะ คุณ${profile.name} ดิฉันคือโหร AI ที่อ่านจากผังดวงกำเนิดของคุณโดยตรง ถามได้เลยค่ะ`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  function answer(q: string) {
    const p = chart[Math.floor(Math.random() * chart.length)]!;
    return `จากผังดวงของคุณ ดาว${p.th}สถิตราศี${p.sign.th} ${p.degree}° ในเรือน${HOUSES[p.house - 1]} — ${p.influence}กำลังเป็นแกนหลักของช่วงนี้\n\nสำหรับคำถาม “${q}” แนะนำให้เดินหน้าอย่างมีจังหวะ ใช้ช่วง 2 สัปดาห์ข้างหน้าเตรียมข้อมูลให้พร้อม แล้วตัดสินใจในวันที่ดาว${p.th}ได้กำลัง จะได้ผลลัพธ์มั่นคงกว่าการรีบร้อน`;
  }

  function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai", text: answer(text) }]);
      setTyping(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    }, 900);
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full btn-gold">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <div>
            <h1 className="display text-lg font-semibold text-foreground">โหร AI</h1>
            <p className="text-[11px] text-muted-foreground">อ่านจากผังดวงจริง ไม่มโน</p>
          </div>
        </div>

        <div className="min-h-[46vh] space-y-3">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-md bg-primary/18 px-4 py-3 text-[13px] text-foreground"
                    : "glass max-w-[86%] whitespace-pre-line rounded-2xl rounded-bl-md px-4 py-3 text-[13px] leading-relaxed text-foreground/90"
                }
              >
                {m.text}
              </div>
            </motion.div>
          ))}
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1.5 pl-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-[11px] text-primary"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="sticky bottom-24 z-20 mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="glass flex items-center gap-2 rounded-full py-2 pl-4 pr-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ถามโหร AI..."
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full btn-gold"
              aria-label="ส่งคำถาม"
            >
              <Send className="h-4 w-4 text-primary-foreground" />
            </button>
          </form>
        </div>
      </PageTransition>
    </AppShell>
  );
}