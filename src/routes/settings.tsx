import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge, Sparkles, User } from "lucide-react";

import { AppShell, PageTransition, SectionTitle } from "@/components/AppShell";
import { useQuality } from "@/hooks/useQuality";
import { useProfile } from "@/store/useProfile";
import { useSettings } from "@/store/useSettings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "ตั้งค่าประสบการณ์ | Horathai AI" },
      {
        name: "description",
        content: "ปรับโหมดกราฟิก 3 มิติ ประหยัดแบตเตอรี่ การเคลื่อนไหว และข้อมูลดวงกำเนิดของคุณ",
      },
      { property: "og:title", content: "ตั้งค่าประสบการณ์ | Horathai AI" },
      { property: "og:description", content: "เลือกโหมด Auto / Full 3D / Battery Saver ให้เหมาะกับเครื่องของคุณ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const MODES = [
  { id: "auto", th: "อัตโนมัติ", desc: "ปรับตามความแรงของเครื่อง" },
  { id: "full", th: "3 มิติเต็มรูปแบบ", desc: "จักรวาลสมจริงที่สุด" },
  { id: "battery", th: "ประหยัดแบตเตอรี่", desc: "ปิดเอฟเฟกต์หนัก ลื่นบนเครื่องเล็ก" },
] as const;

function SettingsPage() {
  const { quality, setQuality, reduceMotion, setReduceMotion, showAspects, setShowAspects } = useSettings();
  const resolved = useQuality().quality;
  const { name, birthDate, birthTime, province } = useProfile();

  return (
    <AppShell>
      <PageTransition>
        <SectionTitle kicker="Settings" title="ตั้งค่าประสบการณ์" />

        <div className="glass-deep grain rounded-[26px] p-5">
          <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Gauge className="h-4 w-4 text-primary" /> โหมดกราฟิก · กำลังใช้{" "}
            <span className="text-primary">{resolved === "full" ? "3 มิติเต็ม" : "ประหยัดแบต"}</span>
          </p>
          <div className="mt-4 space-y-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setQuality(m.id)}
                className={`press flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                  quality === m.id ? "border-primary/50 bg-primary/10" : "border-border bg-card/40"
                }`}
              >
                <span>
                  <span className="block text-[13.5px] text-foreground">{m.th}</span>
                  <span className="block text-[11px] text-muted-foreground">{m.desc}</span>
                </span>
                <span
                  className={`h-4 w-4 rounded-full border ${
                    quality === m.id ? "border-primary bg-primary" : "border-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="glass grain mt-4 space-y-3 rounded-[26px] p-5">
          <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> การแสดงผล
          </p>
          {[
            ["ลดการเคลื่อนไหว", reduceMotion, setReduceMotion],
            ["แสดงเส้นมุมสัมพันธ์ในผังดวง", showAspects, setShowAspects],
          ].map(([label, value, set]) => (
            <label key={label as string} className="flex items-center justify-between text-[13px] text-foreground">
              {label as string}
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={(e) => (set as (v: boolean) => void)(e.target.checked)}
                className="h-4 w-4 accent-[var(--gold)]"
              />
            </label>
          ))}
        </div>

        <div className="glass grain mt-4 rounded-[26px] p-5">
          <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <User className="h-4 w-4 text-primary" /> ดวงกำเนิด
          </p>
          <div className="mt-3 space-y-1 text-[13px] text-foreground">
            <p>{name}</p>
            <p className="text-[12px] text-muted-foreground">
              {birthDate ? `${birthDate} · ${birthTime || "12:00"} น. · ${province}` : "ยังไม่ได้กรอกข้อมูลวันเกิด"}
            </p>
          </div>
          <Link
            to="/onboarding"
            className="press btn-gold mt-4 flex h-12 items-center justify-center rounded-2xl text-[14px] font-semibold text-primary-foreground"
          >
            แก้ไขข้อมูลดวงกำเนิด
          </Link>
        </div>
      </PageTransition>
    </AppShell>
  );
}
