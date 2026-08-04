import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Check, Crown, Gift, Sparkles, Trophy, Users } from "lucide-react";

import { AppShell, PageTransition, SectionTitle } from "@/components/AppShell";
import { useLineAuth } from "@/context/LineAuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { startPremiumTrial } from "@/lib/profile.functions";
import { trialDaysLeft, useProfile } from "@/store/useProfile";
import { PUBLIC_REVIEW_MODE } from "@/config/public-review";

export const Route = createFileRoute("/_authenticated/premium")({
  head: () => ({
    meta: [
      { title: "พรีเมียมฟรี 30 วัน | Horathai AI" },
      {
        name: "description",
        content:
          "ปลดล็อกรายงานดวงเชิงลึก โหร AI ไม่จำกัด และพยากรณ์ดาวย้ายรายเดือน ทดลองฟรี 30 วัน",
      },
      { property: "og:title", content: "พรีเมียมฟรี 30 วัน | Horathai AI" },
      {
        property: "og:description",
        content: "ไม่ต้องใช้บัตรเครดิต ยกเลิกได้ทุกเมื่อ พร้อมรายงานดวงเชิงลึกฉบับเต็ม",
      },
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
  const access = useFeatureAccess();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const daysLeft = trialDaysLeft(premiumTrialStartedAt);
  const reviewGuest = PUBLIC_REVIEW_MODE && !isSignedIn;

  /** Opens the confirmation dialog — the trial never starts automatically. */
  const handleStartTrial = async () => {
    setTrialError(null);
    if (reviewGuest) {
      setTrialError(
        "ระบบชำระเงินอยู่ระหว่างการเชื่อมต่อ กรุณาเข้าสู่ระบบด้วย LINE เพื่อดำเนินการภายหลัง",
      );
      return;
    }
    if (!isSignedIn) {
      const ok = await login();
      if (!ok) return;
    }
    setConfirmOpen(true);
  };

  const confirmTrial = async () => {
    setPending(true);
    setTrialError(null);
    try {
      await startPremiumTrial({ data: { confirm: true } });
      startTrial();
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      setConfirmOpen(false);
    } catch (err) {
      console.error("[trial] start failed", err);
      setTrialError("เริ่มทดลองใช้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setPending(false);
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
          style={{
            background: "linear-gradient(160deg, oklch(0.3 0.12 300), oklch(0.16 0.05 288))",
          }}
        >
          <span className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
          <Crown className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-3 text-[11px] uppercase tracking-[0.34em] text-primary/80">
            Free Premium
          </p>
          <h1 className="display mt-1 text-4xl font-bold text-gold">30 วัน</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ
          </p>
          <p className="mt-2 text-[11px] font-medium text-warning">
            ระบบชำระเงินอยู่ระหว่างการเชื่อมต่อ
          </p>
          {access.unlockedForEveryone && (
            <p className="mt-2 text-[11px] text-primary/80">
              ช่วงพัฒนา: ทุกฟีเจอร์เปิดให้ใช้ฟรีอยู่แล้ว การเริ่มทดลองใช้เป็นการยืนยันด้วยตัวคุณเอง
            </p>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartTrial}
            disabled={reviewGuest}
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl btn-gold py-4 text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            <Sparkles className="h-4 w-4" />
            {daysLeft !== null
              ? `กำลังทดลองใช้ · เหลือ ${daysLeft} วัน`
              : isSignedIn
                ? "เริ่มทดลองใช้ฟรีทันที"
                : "ระบบชำระเงินอยู่ระหว่างการเชื่อมต่อ"}
          </motion.button>
          {trialError && <p className="mt-3 text-[11px] text-warning">{trialError}</p>}
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

        <div className="mt-5 flex justify-center gap-4 text-[11px] text-muted-foreground">
          <a href="/terms" className="underline underline-offset-4">
            ข้อกำหนดการใช้งาน
          </a>
          <a href="/privacy" className="underline underline-offset-4">
            นโยบายความเป็นส่วนตัว
          </a>
        </div>

        <AnimatePresence>
          {confirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-8 backdrop-blur-sm"
              onClick={() => !pending && setConfirmOpen(false)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="surface-card w-full max-w-sm rounded-[26px] p-6 text-center"
                role="dialog"
                aria-modal="true"
                aria-label="ยืนยันการเริ่มทดลองใช้พรีเมียม"
              >
                <Crown className="mx-auto h-6 w-6 text-primary" />
                <h2 className="mt-3 text-[17px] font-semibold text-foreground">
                  เริ่มทดลองใช้พรีเมียม 30 วัน?
                </h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                  ระบบจะเริ่มนับ 30 วันตั้งแต่ตอนนี้ ไม่มีการเรียกเก็บเงิน และยกเลิกได้ทุกเมื่อ
                  {access.unlockedForEveryone
                    ? " ในช่วงพัฒนานี้คุณใช้ทุกฟีเจอร์ได้อยู่แล้วแม้ไม่กดเริ่มทดลอง"
                    : ""}
                </p>
                {trialError && <p className="mt-3 text-[12px] text-destructive">{trialError}</p>}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    disabled={pending}
                    className="press surface-inset rounded-2xl py-3 text-[13px] text-muted-foreground disabled:opacity-50"
                  >
                    ยังก่อน
                  </button>
                  <button
                    onClick={confirmTrial}
                    disabled={pending}
                    className="press btn-gold rounded-2xl py-3 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {pending ? "กำลังเริ่ม…" : "ยืนยันเริ่มทดลอง"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  );
}
