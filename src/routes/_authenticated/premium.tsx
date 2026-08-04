import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Crown, Gift, Sparkles, Trophy, Users } from "lucide-react";

import { AppShell, PageTransition, SectionTitle } from "@/components/AppShell";
import { useLineAuth } from "@/hooks/useAuth";
import { startPremiumTrial } from "@/lib/profile.functions";
import { trialDaysLeft, useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/_authenticated/premium")({
  head: () => ({
    meta: [
      { title: "พรีเมียมฟรี 30 วัน | Horathai AI" },
      { name: "description", content: "ปลดล็อกรายงานดวงเชิงลึก โหร AI ไม่จำกัด และพยากรณ์ดาวย้ายรายเดือน ทดลองฟรี 30 วัน" },
      { property: "og:title", content: "พรีเมียมฟรี 30 วัน | Horathai AI" },
      { property: "og:description", content: "ไม่ต้องใช้บัตรเครดิต ยกเลิกได้ทุกเมื่อ พร้อมรายงานดวงเชิงลึกฉบับเต็ม" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PremiumPage,
});

const PERKS = [
  "รายงานดวงเชิงลึกรายเดือนฉบับเต็ม",
  "ถามโหร AI ได้ไม่จำกัด",
  "แจ้งเตือนดาวย้ายและวันมงคลล่วงหน้า",
  "ผังดวงคู่รักและความเข้ากันได้",
  "ไทม์ไลน์ชีวิต 10 ปีข้างหน้า",
];

function PremiumPage() {
  const { premiumTrialStartedAt, startTrial, points, streak } = useProfile();
  const { isSignedIn, login } = useLineAuth();
  const daysLeft = trialDaysLeft(premiumTrialStartedAt);

  const handleStartTrial = async () => {
    if (!isSignedIn) {
      const ok = await login();
      if (!ok) return;
    }
    startTrial();
    try {
      await startPremiumTrial();
    } catch (err) {
      console.error("[trial] start failed", err);
    }
  };

  return (
    <AppShell>
      <PageTransition>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[28px] border border-primary/30 p-7 text-center"
          style={{ background: "linear-gradient(160deg, oklch(0.3 0.12 300), oklch(0.16 0.05 288))" }}
        >
          <span className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
          <Crown className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-3 text-[11px] uppercase tracking-[0.34em] text-primary/80">Free Premium</p>
          <h1 className="display mt-1 text-4xl font-bold text-gold">30 วัน</h1>
          <p className="mt-2 text-xs text-muted-foreground">ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartTrial}
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl btn-gold py-4 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            <Sparkles className="h-4 w-4" />
            {daysLeft !== null
              ? `กำลังทดลองใช้ · เหลือ ${daysLeft} วัน`
              : isSignedIn
                ? "เริ่มทดลองใช้ฟรีทันที"
                : "เข้าสู่ระบบด้วย LINE เพื่อเริ่มทดลอง"}
          </motion.button>
        </motion.div>

        <div className="mt-6 space-y-2.5">
          {PERKS.map((p, i) => (
            <motion.div
              key={p}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass flex items-center gap-3 rounded-2xl px-4 py-3"
            >
              <Check className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-[13px] text-foreground/90">{p}</span>
            </motion.div>
          ))}
        </div>

        <SectionTitle kicker="After Trial" title="แพ็กเกจหลังหมดทดลอง" />
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4">
            <p className="text-[11px] text-muted-foreground">รายเดือน</p>
            <p className="display mt-1 text-2xl font-semibold text-foreground">฿199</p>
            <p className="text-[10px] text-muted-foreground">ต่อเดือน</p>
          </div>
          <div className="relative rounded-2xl border border-primary/40 bg-primary/10 p-4">
            <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold text-primary-foreground">
              คุ้มที่สุด
            </span>
            <p className="text-[11px] text-muted-foreground">รายปี</p>
            <p className="display mt-1 text-2xl font-semibold text-gold">฿1,490</p>
            <p className="text-[10px] text-muted-foreground">ประหยัด 38%</p>
          </div>
        </div>

        <SectionTitle kicker="Rewards" title="ภารกิจสะสมแต้มมงคล" />
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Trophy, label: `เลเวล ${Math.floor(points / 100) + 1}` },
            { icon: Gift, label: `${points} แต้ม` },
            { icon: Users, label: `สตรีค ${streak} วัน` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass flex flex-col items-center gap-2 rounded-2xl py-4">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="glass mt-4 flex items-center justify-between rounded-2xl p-4">
          <div>
            <p className="text-sm font-medium text-foreground">ชวนเพื่อนผ่าน LINE</p>
            <p className="text-[11px] text-muted-foreground">รับเพิ่มคนละ 7 วันพรีเมียม</p>
          </div>
          <button className="rounded-full bg-[#06C755] px-4 py-2 text-xs font-semibold text-white">
            ชวนเลย
          </button>
        </div>
      </PageTransition>
    </AppShell>
  );
}