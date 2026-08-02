import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Coins, Heart, HeartPulse, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import { AppShell, PageTransition, SectionTitle } from "@/components/AppShell";
import { ZODIACS, seededRandom, thaiToday } from "@/lib/astro";
import { seedKey, useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/transit")({
  head: () => ({
    meta: [
      { title: "ดาวย้าย & จังหวะชีวิต | Horathai AI" },
      { name: "description", content: "ติดตามการโคจรย้ายราศีของดาวพระเคราะห์ พร้อมเปรียบเทียบผลก่อน–หลังต่อการงาน เงิน ความรัก สุขภาพ" },
      { property: "og:title", content: "ดาวย้าย & จังหวะชีวิต | Horathai AI" },
      { property: "og:description", content: "ดูว่าดาวย้ายครั้งนี้เปลี่ยนดวงคุณอย่างไร ด้วยการ์ดเปรียบเทียบก่อนและหลัง" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransitPage,
});

const AREAS = [
  { key: "การงาน", icon: Briefcase, color: "#a78bfa" },
  { key: "การเงิน", icon: Coins, color: "#f0c674" },
  { key: "ความรัก", icon: Heart, color: "#ff9ad5" },
  { key: "สุขภาพ", icon: HeartPulse, color: "#7ee8c0" },
];

function TransitPage() {
  const profile = useProfile();
  const data = useMemo(() => {
    const rnd = seededRandom("transit:" + (seedKey(profile) || "guest"));
    const from = ZODIACS[Math.floor(rnd() * 12)]!;
    const to = ZODIACS[(from.id % 12)]!;
    return {
      from,
      to,
      areas: AREAS.map((a) => {
        const before = 45 + Math.floor(rnd() * 40);
        const after = Math.max(20, Math.min(99, before + Math.floor(rnd() * 60) - 22));
        return { ...a, before, after };
      }),
    };
  }, [profile]);

  return (
    <AppShell>
      <PageTransition>
        <SectionTitle kicker="Planet Movement" title="ดาวพฤหัสบดีย้ายราศี" />

        <div className="glass relative overflow-hidden rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">ก่อน</p>
              <div className="display mt-1 text-3xl text-primary/80">{data.from.symbol}</div>
              <p className="text-xs text-foreground">ราศี{data.from.th}</p>
            </div>

            <div className="relative mx-3 flex-1">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <motion.span
                className="absolute -top-1.5 h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_var(--gold)]"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }}
              />
              <p className="mt-3 text-center text-[10px] text-muted-foreground">{thaiToday()}</p>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">หลัง</p>
              <div className="display mt-1 text-3xl text-gold">{data.to.symbol}</div>
              <p className="text-xs text-foreground">ราศี{data.to.th}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {data.areas.map((a, i) => {
            const up = a.after >= a.before;
            const Icon = a.icon;
            return (
              <motion.div
                key={a.key}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass flex items-center gap-4 rounded-2xl p-4"
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${a.color}22`, boxShadow: `0 0 22px ${a.color}22` }}
                >
                  <Icon className="h-4 w-4" style={{ color: a.color }} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{a.key}</p>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: a.color }}
                      initial={{ width: `${a.before}%` }}
                      animate={{ width: `${a.after}%` }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-right">
                  <span className="text-[11px] text-muted-foreground">{a.before}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm font-semibold" style={{ color: a.color }}>
                    {a.after}
                  </span>
                  {up ? (
                    <TrendingUp className="h-3.5 w-3.5 text-[#7ee8c0]" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <SectionTitle kicker="Lucky Days" title="วันมงคลข้างหน้า" />
        <div className="grid grid-cols-3 gap-2.5">
          {["ศุกร์ 12", "อังคาร 16", "เสาร์ 20"].map((d, i) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-3 text-center"
            >
              <p className="text-[13px] font-medium text-gold">{d}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">เสริมโชคลาภ</p>
            </motion.div>
          ))}
        </div>
      </PageTransition>
    </AppShell>
  );
}