import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Gift, Moon, Settings2, Sparkles } from "lucide-react";
import { useState } from "react";

import { AppShell, LoadingSky, PageTransition, SectionTitle } from "@/components/AppShell";
import { ScoreRing } from "@/components/ScoreCard";
import { useLineAuth } from "@/hooks/useAuth";
import { useReading } from "@/hooks/useReading";
import { dailyCheckIn } from "@/lib/profile.functions";
import { moonPhaseLabel, thaiDate, toThaiDigits } from "@/lib/astro";
import { trialDaysLeft, useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Horathai AI — โหราศาสตร์ไทยสุริยยาตร์ ด้วยพลัง AI" },
      {
        name: "description",
        content:
          "ดูดวงโหราศาสตร์ไทยแม่นยำจากตำแหน่งดาวจริง ผังดวง 3 มิติ ดาวย้าย และโหร AI ส่วนตัว ทดลองพรีเมียมฟรี 30 วัน",
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
  const checkIn = useProfile((s) => s.checkIn);
  const { isSignedIn } = useLineAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useReading();
  const [reward, setReward] = useState<number | null>(null);
  const daysLeft = trialDaysLeft(profile.premiumTrialStartedAt);

  const handleCheckIn = async () => {
    if (!isSignedIn) {
      setReward(checkIn());
      return;
    }
    try {
      const result = await dailyCheckIn();
      setReward(result.reward);
      await queryClient.invalidateQueries({ queryKey: ["account"] });
    } catch (err) {
      console.error("[checkin] failed", err);
    }
  };

  const moon = data?.transit.planets.find((p) => p.num === 2);
  const sun = data?.transit.planets.find((p) => p.num === 1);
  const element = data?.natal.planets.find((p) => p.num === 1)?.element;
  const hero = data?.highlights[0];

  return (
    <AppShell
      {...(data ? { moonPhase: data.transit.moonPhase } : {})}
      {...(element ? { element } : {})}
    >
      <PageTransition>
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="btn-gold relative h-11 w-11 shrink-0 rounded-full p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-sm font-semibold text-primary">
                {profile.name.slice(0, 1)}
              </div>
              <span className="absolute -inset-1 -z-10 animate-pulse-glow rounded-full bg-primary/25 blur-md" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{thaiDate()}</p>
              <h1 className="text-sm font-semibold text-foreground">สวัสดี, {profile.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5">
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-foreground">{toThaiDigits(profile.points)}</span>
            </div>
            <Link to="/settings" className="press glass rounded-full p-2" aria-label="ตั้งค่า">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </header>

        {/* Hero: today's real sky event */}
        <section className="relative mt-5">
          <div className="glass-deep grain relative overflow-hidden rounded-[30px] p-6">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,var(--gold),transparent_65%)] opacity-25 blur-2xl" />
            <p className="text-[10px] uppercase tracking-[0.36em] text-primary/80">ท้องฟ้าวันนี้</p>
            {isLoading || !data ? (
              <div className="mt-3 space-y-2">
                <div className="h-7 w-2/3 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
              </div>
            ) : (
              <>
                <h2 className="display mt-2 text-[26px] font-semibold leading-tight">
                  <span className="text-gold">{hero?.title ?? "จักรวาลของคุณกำลังเคลื่อนไหว"}</span>
                </h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/80">{hero?.body}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge icon={<Sparkles className="h-3 w-3" />} text={`อาทิตย์ราศี${sun?.signTh ?? "-"}`} />
                  <Badge icon={<Moon className="h-3 w-3" />} text={moonPhaseLabel(data.transit.moonPhase)} />
                  <Badge text={`ลัคนาราศี${data.natal.ascendant.signTh}`} />
                </div>
              </>
            )}
          </div>

          <motion.div whileTap={{ scale: 0.97 }} className="mt-4">
            <Link
              to={profile.birthDate ? "/chart" : "/onboarding"}
              className="btn-gold sheen relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-[15px] font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              <Sparkles className="h-4 w-4" />
              {profile.birthDate ? "เปิดจักรวาลดวงชะตา" : "ตั้งค่าดวงกำเนิดของฉัน"}
            </Link>
          </motion.div>
        </section>

        <section className="mt-8">
          <SectionTitle
            kicker="Daily Energy"
            title="พลังดวงวันนี้"
            right={
              data && (
                <span className="display text-[26px] text-gold">{toThaiDigits(data.overall)}</span>
              )
            }
          />
          {isLoading ? (
            <LoadingSky />
          ) : !data ? (
            <div className="glass grain rounded-[24px] p-5 text-center text-[12.5px] text-muted-foreground">
              เพิ่มวันเกิดเพื่อคำนวณพลังดวงจากตำแหน่งดาวจริง
              <Link to="/onboarding" className="mt-3 block text-primary">
                ตั้งค่าตอนนี้ →
              </Link>
            </div>
          ) : (
            <div className="glass grain grid grid-cols-3 gap-y-5 rounded-[26px] p-5">
              {data.scores.map((s, i) => (
                <ScoreRing key={s.area} value={s.score} label={s.th} area={s.area} delay={i * 0.06} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => void handleCheckIn()}
            className="press glass grain flex flex-col items-start gap-1 rounded-[22px] p-4 text-left"
          >
            <Gift className="h-5 w-5 text-primary" />
            <p className="mt-1 text-[13px] font-medium text-foreground">เช็คอินรับแต้ม</p>
            <p className="text-[11px] text-muted-foreground">
              {reward ? `ได้รับ ${toThaiDigits(reward)} แต้ม!` : `สตรีค ${toThaiDigits(profile.streak)} วัน`}
            </p>
          </button>
          <Link to="/transit" className="press glass grain flex flex-col items-start gap-1 rounded-[22px] p-4">
            <Moon className="h-5 w-5 text-primary" />
            <p className="mt-1 text-[13px] font-medium text-foreground">ดาวย้ายล่าสุด</p>
            <p className="text-[11px] text-muted-foreground">
              {moon ? `จันทร์ราศี${moon.signTh}` : "ดูจังหวะดาว"}
            </p>
          </Link>
        </section>

        <section className="mt-6">
          <Link
            to="/premium"
            className="press glass-deep grain flex items-center justify-between rounded-[24px] p-5"
          >
            <div>
              <p className="display text-[15px] font-semibold text-gold">
                {daysLeft === null ? "ทดลองพรีเมียมฟรี 30 วัน" : `พรีเมียมเหลือ ${toThaiDigits(daysLeft)} วัน`}
              </p>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                คำพยากรณ์เชิงลึก เสียงโหร AI และแจ้งเตือนดาวย้ายรายวัน
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
          </Link>
        </section>
      </PageTransition>
    </AppShell>
  );
}

function Badge({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <span className="hairline-gold flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-[11px] text-foreground/85">
      {icon}
      {text}
    </span>
  );
}
