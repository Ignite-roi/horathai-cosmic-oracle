import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock, MapPin, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { useLineAuth } from "@/hooks/useAuth";
import { saveMyProfile, startPremiumTrial } from "@/lib/profile.functions";
import { PROVINCES } from "@/lib/provinces";
import { useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "เริ่มต้นผูกดวง | Horathai AI" },
      { name: "description", content: "กรอกวันเวลาเกิดและสถานที่เกิด เพื่อคำนวณผังดวงโหราศาสตร์ไทยของคุณ" },
      { property: "og:title", content: "เริ่มต้นผูกดวง | Horathai AI" },
      { property: "og:description", content: "ผูกดวงกำเนิดด้วยหลักสุริยยาตร์ ภายใน 3 ขั้นตอน" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});


function SkyOrb() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(70%_70%_at_50%_50%,oklch(0.24_0.12_305/70%),transparent_72%)]">
      <div className="absolute h-[70%] w-[70%] animate-orbit-spin rounded-full border border-dashed border-primary/30" />
      <div className="absolute h-[45%] w-[45%] animate-orbit-spin rounded-full border border-primary/20" style={{ animationDirection: "reverse" }} />
      <div className="h-16 w-16 animate-pulse-glow rounded-full bg-[radial-gradient(circle,var(--gold),transparent_70%)]" />
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <label className="glass block rounded-2xl p-4">
      <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </span>
      {children}
    </label>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const { setProfile, startTrial, ...profile } = useProfile();
  const { isSignedIn, status, error: lineError, configured, login } = useLineAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [step, setStep] = useState(profile.onboarded ? 1 : 0);
  const [form, setForm] = useState({
    name: profile.name,
    birthDate: profile.birthDate || "1995-06-15",
    birthTime: profile.birthTime || "08:30",
    province: profile.province,
    country: profile.country,
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step !== 2) return;
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 2)), 55);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step === 2 && progress >= 100) {
      setProfile({ ...form, onboarded: true });
      if (!profile.premiumTrialStartedAt) startTrial();
      if (isSignedIn) {
        void saveMyProfile({
          data: {
            display_name: form.name,
            birth_date: form.birthDate,
            birth_time: form.birthTime,
            province: form.province,
            country: form.country,
            onboarded: true,
          },
        }).catch((e) => console.error("[profile] save failed", e));
        void startPremiumTrial().catch((e) => console.error("[trial] start failed", e));
      }
      const t = setTimeout(() => navigate({ to: "/chart" }), 500);
      return () => clearTimeout(t);
    }
    return;
  }, [step, progress, form, navigate, setProfile, startTrial, profile.premiumTrialStartedAt, isSignedIn]);

  // Skip the login step once the LINE session is live.
  useEffect(() => {
    if (isSignedIn && step === 0) setStep(1);
  }, [isSignedIn, step]);

  const handleLineLogin = async () => {
    setSigningIn(true);
    const ok = await login();
    setSigningIn(false);
    if (ok) setStep(1);
  };

  const inputCls =
    "mt-2 w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground";

  return (
    <AppShell>
      <PageTransition>
        <div className="mb-5 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full btn-gold"
                animate={{ width: step >= i ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pt-6 text-center"
            >
              <div className="mx-auto h-[240px] w-full overflow-hidden rounded-3xl border border-primary/15">
                <SkyOrb />
              </div>
              <h1 className="display mt-6 text-2xl font-semibold text-gold">ยินดีต้อนรับสู่ Horathai AI</h1>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                โหราศาสตร์ไทยสุริยยาตร์ต้นตำรับ ผสานปัญญาประดิษฐ์ เข้าสู่ระบบด้วย LINE เพื่อเริ่มต้น
              </p>
              <button
                onClick={() => setStep(1)}
                className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#06C755] text-[15px] font-semibold text-white"
              >
                <MessageCircle className="h-5 w-5" />
                เข้าสู่ระบบด้วย LINE
              </button>
              <p className="mt-3 text-[11px] text-muted-foreground">ทดลองพรีเมียมฟรี 30 วัน · ไม่ต้องใช้บัตรเครดิต</p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <h1 className="display text-2xl font-semibold text-gold">ข้อมูลวันเกิด</h1>
              <p className="pb-2 text-xs text-muted-foreground">
                ยิ่งเวลาเกิดแม่นยำ ลัคนาและเรือนชะตายิ่งตรง
              </p>
              <Field label="ชื่อของคุณ" icon={MapPin}>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="วันเกิด" icon={CalendarDays}>
                <input
                  type="date"
                  className={inputCls}
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                />
              </Field>
              <Field label="เวลาเกิด" icon={Clock}>
                <input
                  type="time"
                  className={inputCls}
                  value={form.birthTime}
                  onChange={(e) => setForm({ ...form, birthTime: e.target.value })}
                />
              </Field>
              <Field label="จังหวัดที่เกิด" icon={MapPin}>
                <select
                  className={`${inputCls} [&>option]:bg-card`}
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                >
                  {PROVINCES.map((p) => (
                    <option key={p.th}>{p.th}</option>
                  ))}
                </select>
              </Field>
              <Field label="ประเทศ" icon={MapPin}>
                <input
                  className={inputCls}
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </Field>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(2)}
                className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl btn-gold text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              >
                คำนวณผังดวง
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 text-center">
              <div className="h-[320px] w-full overflow-hidden rounded-3xl border border-primary/15">
                <SkyOrb />
              </div>
              <h2 className="display mt-6 text-xl font-semibold text-gold">กำลังผูกดวงกำเนิด</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                คำนวณสมผุสดาวตามคัมภีร์สุริยยาตร์ · {progress}%
              </p>
              <div className="mx-auto mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full btn-gold"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.06 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  );
}