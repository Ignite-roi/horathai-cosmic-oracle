import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, Clock, MapPin, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { useAccount } from "@/hooks/useAuth";
import { calculateAndSaveChart, getMyBirthContext, saveBirthProfile } from "@/lib/birth.functions";
import { PROVINCES } from "@/lib/provinces";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "เริ่มต้นผูกดวง | Horathai AI" },
      { name: "description", content: "กรอกวันเวลาเกิดและสถานที่เกิด เพื่อคำนวณผังดวงโหราศาสตร์ไทยของคุณ" },
      { property: "og:title", content: "เริ่มต้นผูกดวง | Horathai AI" },
      { property: "og:description", content: "ผูกดวงกำเนิดด้วยหลักสุริยยาตร์ ภายใน 5 ขั้นตอน" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const STEPS = ["ชื่อ & วันเกิด", "เวลาเกิด", "สถานที่เกิด", "ตรวจทาน", "คำนวณ"] as const;

function SkyOrb() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(70%_70%_at_50%_50%,oklch(0.24_0.12_305/70%),transparent_72%)]">
      <div className="absolute h-[70%] w-[70%] animate-orbit-spin rounded-full border border-dashed border-primary/30" />
      <div
        className="absolute h-[45%] w-[45%] animate-orbit-spin rounded-full border border-primary/20"
        style={{ animationDirection: "reverse" }}
      />
      <div className="h-16 w-16 animate-pulse-glow rounded-full bg-[radial-gradient(circle,var(--gold),transparent_70%)]" />
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <label className="surface-inset block rounded-2xl p-4">
      <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "mt-2 w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground";

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
  const { data: context } = useQuery({
    queryKey: ["birth-context"],
    queryFn: () => getMyBirthContext(),
    staleTime: 60_000,
  });

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    nickname: "",
    birth_date: "",
    birth_time: "08:30",
    birth_time_known: true,
    province: "กรุงเทพมหานคร",
    district: "",
    country: "ประเทศไทย",
  });
  const [hydrated, setHydrated] = useState(false);

  // Prefill from LINE display name and any previously saved answers.
  useEffect(() => {
    if (hydrated) return;
    if (context === undefined) return;
    const b = context.birthProfile;
    setForm((f) => ({
      nickname: b?.nickname || account?.profile?.display_name || f.nickname,
      birth_date: b?.birth_date ?? f.birth_date,
      birth_time: (b?.birth_time ?? f.birth_time).slice(0, 5),
      birth_time_known: b?.birth_time_known ?? f.birth_time_known,
      province: b?.province ?? f.province,
      district: b?.district ?? "",
      country: b?.country ?? f.country,
    }));
    setHydrated(true);
  }, [context, account, hydrated]);

  const stepValid = useMemo(() => {
    if (step === 0) return form.nickname.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(form.birth_date);
    if (step === 1) return !form.birth_time_known || /^\d{2}:\d{2}$/.test(form.birth_time);
    if (step === 2) return form.province.trim().length > 0;
    return true;
  }, [step, form]);

  const persist = async () => {
    await saveBirthProfile({
      data: {
        nickname: form.nickname.trim(),
        birth_date: form.birth_date,
        birth_time: form.birth_time_known ? form.birth_time : undefined,
        birth_time_known: form.birth_time_known,
        country: form.country.trim() || "ประเทศไทย",
        province: form.province,
        district: form.district.trim() || null,
      },
    });
  };

  const next = async () => {
    if (!stepValid || busy) return;
    setError(null);
    if (step < 3) {
      setBusy(true);
      try {
        if (step === 2) await persist();
        setStep(step + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "บันทึกข้อมูลไม่สำเร็จ");
      } finally {
        setBusy(false);
      }
      return;
    }
    // Review → calculate
    setStep(4);
    setProgress(0);
    try {
      await persist();
      await calculateAndSaveChart();
      await queryClient.invalidateQueries({ queryKey: ["account"] });
      await queryClient.invalidateQueries({ queryKey: ["birth-context"] });
      setProgress(100);
      setTimeout(() => void navigate({ to: "/dashboard", replace: true }), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "คำนวณดวงกำเนิดไม่สำเร็จ");
      setStep(3);
    }
  };

  // Animated progress while the server computes.
  useEffect(() => {
    if (step !== 4) return;
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 100 : Math.min(96, p + 2))), 60);
    return () => clearInterval(id);
  }, [step]);

  return (
    <AppShell>
      <PageTransition>
        <div className="mb-2 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="btn-gold h-full rounded-full"
                animate={{ width: step >= i ? "100%" : "0%" }}
                transition={{ duration: 0.45 }}
              />
            </div>
          ))}
        </div>
        <p className="mb-5 text-[11px] tracking-[0.2em] text-primary/70">
          ขั้นที่ {step + 1}/5 · {STEPS[step]}
        </p>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-[12px] text-foreground">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-3">
              <h1 className="display text-2xl font-semibold text-gold">เริ่มผูกดวงกำเนิด</h1>
              <p className="pb-1 text-xs text-muted-foreground">บอกชื่อที่อยากให้เราเรียก และวันเกิดของคุณ</p>
              <Field label="ชื่อเล่น" icon={User}>
                <input
                  className={inputCls}
                  placeholder="เช่น ฟ้า"
                  value={form.nickname}
                  onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                />
              </Field>
              <Field label="วันเกิด (ค.ศ.)" icon={CalendarDays}>
                <input
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputCls}
                  value={form.birth_date}
                  onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                />
              </Field>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-3">
              <h1 className="display text-2xl font-semibold text-gold">เวลาเกิด</h1>
              <p className="pb-1 text-xs text-muted-foreground">ยิ่งเวลาแม่นยำ ลัคนาและเรือนชะตายิ่งตรง</p>
              <Field label="เวลาเกิด" icon={Clock}>
                <input
                  type="time"
                  disabled={!form.birth_time_known}
                  className={`${inputCls} disabled:opacity-40`}
                  value={form.birth_time}
                  onChange={(e) => setForm({ ...form, birth_time: e.target.value })}
                />
              </Field>
              <button
                onClick={() => setForm({ ...form, birth_time_known: !form.birth_time_known })}
                className="press surface-inset flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[13px] text-foreground"
              >
                <span>ไม่ทราบเวลาเกิด (ใช้เที่ยงวันแทน)</span>
                <span className={`h-5 w-9 rounded-full transition-colors ${form.birth_time_known ? "bg-muted" : "bg-primary"}`}>
                  <span className={`block h-5 w-5 rounded-full bg-background transition-transform ${form.birth_time_known ? "" : "translate-x-4"}`} />
                </span>
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-3">
              <h1 className="display text-2xl font-semibold text-gold">สถานที่เกิด</h1>
              <p className="pb-1 text-xs text-muted-foreground">ใช้พิกัดจังหวัดเพื่อคำนวณลัคนา</p>
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
              <Field label="อำเภอ/เขต (ไม่บังคับ)" icon={MapPin}>
                <input
                  className={inputCls}
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                />
              </Field>
              <Field label="ประเทศ" icon={MapPin}>
                <input
                  className={inputCls}
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </Field>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} className="space-y-3">
              <h1 className="display text-2xl font-semibold text-gold">ตรวจทานข้อมูล</h1>
              <div className="surface-card space-y-3 rounded-2xl p-5 text-[13px]">
                {[
                  ["ชื่อเล่น", form.nickname],
                  ["วันเกิด", form.birth_date],
                  ["เวลาเกิด", form.birth_time_known ? form.birth_time + " น." : "ไม่ทราบเวลา (เที่ยงวัน)"],
                  ["จังหวัด", form.province],
                  ["อำเภอ/เขต", form.district || "—"],
                  ["ประเทศ", form.country],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-right text-foreground">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                เมื่อกดคำนวณ ระบบจะผูกดวงตามคัมภีร์สุริยยาตร์ และเปิดทดลองพรีเมียมฟรี 30 วันให้อัตโนมัติ
              </p>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4 text-center">
              <div className="h-[300px] w-full overflow-hidden rounded-3xl border border-primary/15">
                <SkyOrb />
              </div>
              <h2 className="display mt-6 text-xl font-semibold text-gold">กำลังผูกดวงกำเนิด</h2>
              <p className="mt-1 text-xs text-muted-foreground">คำนวณสมผุสดาวตามคัมภีร์สุริยยาตร์ · {progress}%</p>
              <div className="mx-auto mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-muted">
                <motion.div className="btn-gold h-full" animate={{ width: `${progress}%` }} transition={{ ease: "linear", duration: 0.1 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="press surface-inset flex h-14 w-14 items-center justify-center rounded-2xl text-foreground"
                aria-label="ย้อนกลับ"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!stepValid || busy}
              onClick={() => void next()}
              className="btn-gold flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50"
            >
              {busy ? "กำลังบันทึก…" : step === 3 ? "คำนวณผังดวง" : "ถัดไป"}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </PageTransition>
    </AppShell>
  );
}
