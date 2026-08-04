import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AppShell, EmptyBirthData, PageTransition } from "@/components/AppShell";
import { useReading } from "@/hooks/useReading";
import { askAstrologer } from "@/lib/ai.functions";
import {
  ASPECT_LABEL,
  HOUSES,
  PLANET_BY_NUM,
  formatDegree,
  moonPhaseLabel,
  type ReadingResult,
} from "@/lib/astro";
import { useProfile } from "@/store/useProfile";
import { PUBLIC_REVIEW_MODE } from "@/config/public-review";
import { useLineAuth } from "@/context/LineAuthContext";

export const Route = createFileRoute("/_authenticated/ai-astrologer")({
  head: () => ({
    meta: [
      { title: "โหรา AI ส่วนตัว | Horathai AI" },
      {
        name: "description",
        content:
          "ถามโหรา AI ได้ทุกเรื่อง การงาน การเงิน ความรัก โดยอ้างอิงตำแหน่งดาวจริงในผังดวงของคุณ",
      },
      { property: "og:title", content: "โหรา AI ส่วนตัว | Horathai AI" },
      {
        property: "og:description",
        content: "ผู้ช่วยโหราศาสตร์ไทยที่ตอบจากผังดวงกำเนิดจริงของคุณ",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AiPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "ช่วงนี้การงานเป็นอย่างไร",
  "ควรลงทุนตอนนี้ไหม",
  "ความรักช่วงนี้เป็นยังไง",
  "ต้องระวังอะไรเป็นพิเศษ",
];

function factSheet(data: ReadingResult, name: string) {
  const lines: string[] = [`ชื่อผู้ถาม: ${name}`, `ลัคนาราศี${data.natal.ascendant.signTh}`];
  lines.push("— ดาวกำเนิด —");
  for (const p of data.natal.planets) {
    lines.push(
      `${p.th}: ราศี${p.signTh} ${formatDegree(p)} ${HOUSES[p.house - 1]!.th}${p.retrograde ? " (พักร์)" : ""}`,
    );
  }
  lines.push("— ดาวจรวันนี้ —");
  for (const p of data.transit.planets) {
    lines.push(`${p.th}: ราศี${p.signTh} ${formatDegree(p)}${p.retrograde ? " (พักร์)" : ""}`);
  }
  lines.push(`ข้างขึ้นข้างแรม: ${moonPhaseLabel(data.transit.moonPhase)}`);
  lines.push("— มุมสัมพันธ์เด่นวันนี้ —");
  for (const a of data.transit.aspects.slice(0, 6)) {
    lines.push(
      `${PLANET_BY_NUM.get(a.a)!.th} ${ASPECT_LABEL[a.kind]} ${PLANET_BY_NUM.get(a.b)!.th} คลาด ${a.orb}°`,
    );
  }
  lines.push("— คะแนนรายด้าน —");
  for (const s of data.scores) lines.push(`${s.th}: ${s.score}/100 (${s.reasons[0] ?? "ทรงตัว"})`);
  return lines.join("\n");
}

function AiPage() {
  const name = useProfile((s) => s.name);
  const birthDate = useProfile((s) => s.birthDate);
  const { data } = useReading();
  const { isSignedIn, login } = useLineAuth();
  const reviewGuest = PUBLIC_REVIEW_MODE && !isSignedIn;
  const ask = useServerFn(askAstrologer);
  const endRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `สวัสดีค่ะ คุณ${name} ดิฉันคือโหรา AI อ่านจากตำแหน่งดาวจริงในผังดวงของคุณ ถามได้เลยค่ะ`,
    },
  ]);
  const [input, setInput] = useState("");

  const facts = useMemo(() => (data ? factSheet(data, name) : ""), [data, name]);

  const mutation = useMutation({
    mutationFn: (question: string) =>
      ask({ data: { question, facts, history: messages.slice(-6) } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.answer }]),
    onError: (e: Error) =>
      setMessages((m) => [...m, { role: "assistant", content: `ขออภัยค่ะ ${e.message}` }]),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending]);

  function send(text: string) {
    const q = text.trim();
    if (!q || mutation.isPending || !facts) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    if (reviewGuest) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "โหมดตรวจสอบแสดงดวงตัวอย่างแบบอ่านอย่างเดียว จึงยังไม่ส่งคำถามไปยัง AI กรุณาเข้าสู่ระบบด้วย LINE เพื่อถามจากดวงของคุณ",
        },
      ]);
      return;
    }
    mutation.mutate(q);
  }

  if (!birthDate && !reviewGuest) {
    return (
      <AppShell>
        <PageTransition>
          <h1 className="display mb-4 text-xl font-semibold text-foreground">โหรา AI</h1>
          <EmptyBirthData />
        </PageTransition>
      </AppShell>
    );
  }

  return (
    <AppShell {...(data ? { moonPhase: data.transit.moonPhase } : {})}>
      <PageTransition>
        <header className="glass grain sticky top-0 z-20 mb-4 flex items-center gap-3 rounded-[22px] p-3">
          <span className="btn-gold flex h-9 w-9 items-center justify-center rounded-full">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-foreground">โหรา AI</p>
            <p className="text-[10.5px] text-muted-foreground">
              {data ? `อ่านจากลัคนาราศี${data.natal.ascendant.signTh}` : "กำลังเรียงดาว…"}
            </p>
          </div>
        </header>

        <div className="min-h-[46vh] space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-[20px] px-4 py-3 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "btn-gold text-primary-foreground"
                      : "glass grain text-foreground/90"
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {mutation.isPending && (
            <div className="glass flex w-fit gap-1.5 rounded-[20px] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="sticky bottom-24 mt-5">
          {reviewGuest && (
            <button
              onClick={() => void login()}
              className="press mb-3 flex h-11 w-full items-center justify-center rounded-xl border border-primary/30 text-[12px] text-primary"
            >
              เข้าสู่ระบบด้วย LINE เพื่อถามโหรา AI
            </button>
          )}
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="press glass whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] text-foreground/85"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="glass-deep grain flex items-center gap-2 rounded-full p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ถามโหรา AI…"
              className="flex-1 bg-transparent px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !input.trim()}
              className="press btn-gold flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-40"
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
