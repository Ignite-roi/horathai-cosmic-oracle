import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Briefcase, Coins, Flame, Gift, Heart, HeartPulse, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell, PageTransition, SectionTitle } from "@/components/AppShell";
import { CosmicSceneClient } from "@/components/ClientScene";
import { ScoreRing } from "@/components/ScoreCard";
import { dailyScores, thaiToday } from "@/lib/astro";
import { seedKey, trialDaysLeft, useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Horathai AI — โหราศาสตร์ไทยสุริยยาตร์ ด้วยพลัง AI" },
      {
        name: "description",
        content:
          "ดูดวงโหราศาสตร์ไทยแม่นยำ ผังดวงกำเนิด 3 มิติ ดาวย้าย และโหร AI ส่วนตัว ทดลองพรีเมียมฟรี 30 วัน",
      },
      { property: "og:title", content: "Horathai AI — โหราศาสตร์ไทยสุริยยาตร์" },
      {
        property: "og:description",
        content: "ผังดวง 3 มิติ ดาวย้าย และโหร AI ส่วนตัว สำหรับคนไทย ทดลองฟรี 30 วัน",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const profile = useProfile();
  const scores = useMemo(() => dailyScores(seedKey(profile) || "guest"), [profile]);
  const [reward, setReward] = useState<number | null>(null);
  const daysLeft = trialDaysLeft(profile.premiumTrialStartedAt);

  return (
    <AppShell>
      <PageTransition>
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 rounded-full btn-gold p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-sm font-semibold text-primary">
                {profile.name.slice(0, 1)}
              </div>
              <span className="absolute -inset-1 -z-10 animate-pulse-glow rounded-full bg-primary/25 blur-md" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{thaiToday()}</p>
              <h1 className="text-sm font-semibold text-foreground">สวัสดี, {profile.name}</h1>
            </div>
          </div>
          <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] text-foreground">{profile.points} แต้ม</span>
          </div>
        </header>

        <section className="relative mt-4">
          <div className="relative h-[340px] w-full overflow-hidden rounded-[28px] border border-primary/15">
            <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_20%,oklch(0.32_0.16_305/60%),transparent_70%)]" />
            <CosmicSceneClient />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[oklch(0.11_0.03_285)] to-transparent p-5 pt-16">
              <p className="text-[11px] uppercase tracking-[0.34em] text-primary/80">Horathai AI</p>
              <h2 className="display mt-1 text-2xl font-semibold leading-tight">
                <span className="text-gold">จักรวาลของคุณ</span> กำลังเคลื่อนไหว
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                คะแนนดวงวันนี้ {scores.overall}/100 · พลังดาวพฤหัสบดีเสริมการงาน
              </p>
            </div>
          </div>

          <motion.div whileTap={{ scale: 0.97 }} className="mt-4">
            <Link
              to={profile.onboarded ? "/chart" : "/onboarding"}
              className="relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl btn-gold text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              <Sparkles className="h-4 w-4" />
              เปิดดวงชะตาของฉัน
            </Link>
          </motion.div>
        </section>

        <section className="mt-7">
          <SectionTitle kicker="Today" title="คะแนนดวงวันนี้" />
          <div className="grid grid-cols-4 gap-2.5">
            <ScoreRing value={scores.money} label="การเงิน" icon={Coins} color="#f0c674" delay={0.05} />
            <ScoreRing value={scores.love} label="ความรัก" icon={Heart} color="#ff9ad5" delay={0.12} />
            <ScoreRing value={scores.career} label="การงาน" icon={Briefcase} color="#a78bfa" delay={0.19} />
            <ScoreRing value={scores.health} label="สุขภาพ" icon={HeartPulse} color="#7ee8c0" delay={0.26} />
          </div>
        </section>

        <section className="mt-7">
          <SectionTitle kicker="Daily" title="เช็คอินรับพลังดาว" />
          <div className="glass flex items-center justify-between rounded-2xl p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                สตรีค {profile.streak} วันติดต่อกัน
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {reward ? `รับไปเลย +${reward} แต้มมงคล` : "เช็คอินทุกวันเพื่อสะสมแต้มมงคล"}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setReward(profile.checkIn())}
              className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/12 px-4 py-2 text-xs font-semibold text-primary"
            >
              <Gift className="h-3.5 w-3.5" />
              เช็คอิน
            </motion.button>
          </div>
        </section>

        <section className="mt-7">
          <Link to="/premium" className="block">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden rounded-2xl border border-primary/30 p-5"
              style={{ background: "linear-gradient(135deg, oklch(0.28 0.11 300), oklch(0.18 0.05 288))" }}
            >
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary/80">Premium</p>
              <h3 className="display mt-1 text-2xl font-semibold text-gold">ฟรี 30 วัน</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {daysLeft !== null
                  ? `เหลือเวลาทดลองอีก ${daysLeft} วัน`
                  : "ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ"}
              </p>
              <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/25 blur-2xl" />
            </motion.div>
          </Link>
        </section>
      </PageTransition>
    </AppShell>
  );
}
