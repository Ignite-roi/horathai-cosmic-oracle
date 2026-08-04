import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock3,
  Crown,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Unlock,
} from "lucide-react";

import { AstrologerHero } from "@/components/brand/AstrologerHero";
import { CelestialDivider } from "@/components/thai/Ornaments";
import { toThaiDigits } from "@/lib/astro";

/* ---------- E. Time travel preview ---------- */

export function TimeTravelPreview({
  past,
  now,
  future,
  days,
}: {
  past: number;
  now: number;
  future: number;
  days: number;
}) {
  const points = [
    { label: `-${toThaiDigits(days)} วัน`, value: past },
    { label: "วันนี้", value: now },
    { label: `+${toThaiDigits(days)} วัน`, value: future },
  ];

  return (
    <Link to="/transits" className="press surface-card block overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Time travel</p>
          <h2 className="thai-heading mt-1 text-[17px] text-foreground">เลื่อนเวลาดูดวงล่วงหน้า</h2>
        </div>
        <Clock3 className="h-5 w-5 shrink-0 text-[var(--gold)]" strokeWidth={1.6} />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        {points.map((p, i) => (
          <div key={p.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end justify-center">
              <motion.span
                initial={{ height: 6 }}
                animate={{ height: `${Math.max(12, p.value)}%` }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[46px] rounded-t-[10px]"
                style={{
                  background:
                    i === 1
                      ? "linear-gradient(180deg, var(--gold-hot), var(--gold-deep))"
                      : "linear-gradient(180deg, color-mix(in oklab, var(--royal) 90%, white 8%), color-mix(in oklab, var(--indigo-deep) 90%, transparent))",
                  boxShadow: i === 1 ? "0 0 24px -8px var(--gold)" : "none",
                }}
              />
            </div>
            <span className={`numeral text-[15px] ${i === 1 ? "text-gold" : "text-foreground/70"}`}>
              {toThaiDigits(p.value)}
            </span>
            <span className="text-[10.5px] text-muted-foreground">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-[12px] text-[var(--gold)]">
        เลื่อนไทม์ไลน์เอง
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

/* ---------- F. Destiny timeline preview ---------- */

export type DestinyPoint = { label: string; sub: string; value: number };

export function DestinyTimeline({ points }: { points: DestinyPoint[] }) {
  const max = Math.max(...points.map((p) => p.value), 1);

  return (
    <section className="surface-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Destiny timeline</p>
          <h2 className="thai-heading mt-1 text-[17px] text-foreground">เส้นทางชีวิตข้างหน้า</h2>
        </div>
        <TrendingUp className="h-5 w-5 shrink-0 text-[var(--gold)]" strokeWidth={1.6} />
      </div>

      <ol className="mt-4 space-y-3">
        {points.map((p, i) => (
          <li key={p.label} className="flex items-center gap-3">
            <span className="numeral w-11 shrink-0 text-[11px] text-muted-foreground">
              {p.label}
            </span>
            <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-[oklch(1_0_0/6%)]">
              <motion.span
                initial={{ width: 0 }}
                whileInView={{ width: `${(p.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "linear-gradient(90deg, var(--gold-deep), var(--gold-hot))" }}
              />
            </span>
            <span className="w-24 shrink-0 truncate text-right text-[11px] text-foreground/75">
              {p.sub}
            </span>
          </li>
        ))}
      </ol>

      <CelestialDivider className="mt-4" />
    </section>
  );
}

/* ---------- G. AI astrologer consultation ---------- */

export function AstrologerConsult({ question }: { question: string }) {
  return (
    <Link
      to="/ai-astrologer"
      className="press surface-hero grain relative flex items-center gap-4 overflow-hidden p-5"
    >
      <AstrologerHero variant="avatar" className="h-[74px] w-[74px] shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">AI Astrologer</p>
        <p className="thai-heading mt-1 text-[16px] text-gold">ปรึกษาโหราจารย์ส่วนตัว</p>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          “{question}”
        </p>
      </div>
      <MessageCircle className="h-5 w-5 shrink-0 text-[var(--gold)]" strokeWidth={1.6} />
    </Link>
  );
}

/* ---------- H. Day wallet ---------- */

export function DayWalletStatus({ days, points }: { days: number; points: number }) {

  return (
    <Link
      to="/wallet"
      search={{ checkout: undefined, returnTo: undefined }}
      className="press surface-card relative flex items-center gap-4 overflow-hidden p-5"
    >
      <span
        aria-hidden
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 34%, transparent), transparent 68%)",
        }}
      />
      <span className="gold-metal flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
        <Crown className="relative h-5 w-5" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="thai-heading text-[15px] text-gold">
          {days > 0 ? `วันใช้งานคงเหลือ ${toThaiDigits(days)} วัน` : "เติมวันเพื่อเปิดประสบการณ์เชิงลึก"}
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
          มี {toThaiDigits(points)} แต้ม · แตะเพื่อดูยอด ประวัติ และแพ็กเกจ
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-[var(--gold)]" />
    </Link>
  );
}

/* ---------- Demo callout (no birth data yet) ---------- */

export function DemoCallout() {
  return (
    <section className="surface-card grain relative overflow-hidden p-5">
      <span
        aria-hidden
        className="absolute -left-8 -top-10 h-28 w-28 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--gold) 24%, transparent), transparent 70%)",
        }}
      />
      <div className="relative">
        <span className="gold-hairline inline-flex rounded-full px-2 py-1 text-[9.5px] tracking-wide text-[var(--gold)]">
          ดวงสาธิต
        </span>
        <h2 className="thai-heading mt-2 text-[16px] text-foreground">
          นี่คือตัวอย่างการแสดงผล ยังไม่ใช่ดวงของคุณ
        </h2>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          ระบบไม่ได้บันทึกดวงสาธิตนี้ไว้ กรอกวัน เวลา และสถานที่เกิด
          เพื่อคำนวณผังดวงจริงด้วยหลักสุริยยาตร์
        </p>
        <Link
          to="/onboarding"
          className="press gold-metal mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-semibold"
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} />
          สร้างดวงจริงของฉัน
        </Link>
      </div>
    </section>
  );
}

/* ---------- Development full access notice ---------- */

export function DevAccessNotice() {
  return (
    <section className="surface-inset flex items-start gap-3 p-4">
      <span className="mt-0.5 shrink-0 text-[var(--gold)]">
        <Unlock className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-foreground">ช่วงพัฒนา เปิดใช้ทุกฟีเจอร์ฟรี</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          ผังดวง ดาวย้าย ย้อน–ไปข้างหน้า โหร AI และรายงานเชิงลึก ใช้ได้เต็มรูปแบบทุกบัญชี
          โดยยังไม่ต้องเริ่มทดลองพรีเมียม
        </p>
      </div>
    </section>
  );
}
