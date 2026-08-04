import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, Gift, Settings2 } from "lucide-react";
import { useState } from "react";

import { AppShell, PageTransition } from "@/components/AppShell";
import { CinematicHero } from "@/components/home/CinematicHero";
import {
  AstrologerConsult,
  DemoCallout,
  DevAccessNotice,
  DestinyTimeline,
  DayWalletStatus,
  TimeTravelPreview,
  type DestinyPoint,
} from "@/components/home/HomeSections";
import { MajorTransitCard } from "@/components/home/MajorTransitCard";
import { PlanetMovement, buildMovements } from "@/components/home/PlanetMovement";
import { TodayScore } from "@/components/home/TodayScore";
import { useLineAuth } from "@/context/LineAuthContext";
import { LOOKAHEAD_DAYS, LOOKBACK_DAYS, useHomeReading } from "@/hooks/useHomeReading";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { useWallet } from "@/hooks/useWallet";
import { dailyCheckIn } from "@/lib/profile.functions";
import { HOUSES, moonPhaseLabel, thaiDate, toThaiDigits } from "@/lib/astro";
import { useProfile } from "@/store/useProfile";
import { PUBLIC_REVIEW_MODE } from "@/config/public-review";

export function DashboardHome() {
  const profile = useProfile();
  const checkIn = useProfile((s) => s.checkIn);
  const { isSignedIn } = useLineAuth();
  const access = useFeatureAccess();
  const wallet = useWallet();
  const queryClient = useQueryClient();
  const { data, past, future, majorTransit, isDemo, isLoading } = useHomeReading();
  const [reward, setReward] = useState<number | null>(null);

  const handleCheckIn = async () => {
    if (!isSignedIn) {
      if (PUBLIC_REVIEW_MODE) return;
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
  const element = data?.natal.planets.find((p) => p.num === 1)?.element;

  const destiny: DestinyPoint[] = data
    ? data.scores.slice(0, 4).map((s) => ({
        label: s.th,
        sub: s.reasons[0] ?? "จังหวะดาวส่งผล",
        value: s.score,
      }))
    : [];

  const consultQuestion = majorTransit
    ? `ดาว${majorTransit.planet.th}เข้า${HOUSES.find((h) => h.n === majorTransit.house)?.th ?? "ภพสำคัญ"} ผมควรระวังเรื่องอะไรบ้าง`
    : "ช่วงนี้ดวงการงานและการเงินของฉันเป็นอย่างไร";

  const movements =
    past && data ? buildMovements(past.transit, data.transit, data.natal.ascendant.longitude) : [];

  return (
    <AppShell
      {...(data ? { moonPhase: data.transit.moonPhase } : {})}
      {...(element ? { element } : {})}
    >
      <PageTransition>
        {/* A. identity header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="gold-hairline relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--indigo-deep)]">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-[var(--gold)]">
                  {profile.name.slice(0, 1)}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <p className="numeral text-[10.5px] text-muted-foreground">{thaiDate()}</p>
              <h1 className="truncate text-[14px] font-semibold text-foreground">{profile.name}</h1>
              <p className="truncate text-[11px] text-muted-foreground">
                {data ? `ลัคนาราศี${data.natal.ascendant.signTh}` : "ยังไม่ได้ตั้งค่าดวงกำเนิด"}
                {data ? ` · ${moonPhaseLabel(data.transit.moonPhase)}` : ""}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="gold-hairline flex items-center gap-1.5 rounded-full px-2.5 py-1.5">
              <Flame className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span className="numeral text-[11px] text-foreground">
                {`${toThaiDigits(wallet.data.daysRemaining)} วัน`}
              </span>
            </span>
            <Link
              to="/settings"
              className="press surface-inset rounded-full p-2"
              aria-label="ตั้งค่า"
            >
              <Settings2 className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </header>

        {/* B. cinematic hero — always composed, demo chart before onboarding */}
        <div className="mt-4">
          <CinematicHero
            planets={data?.transit.planets ?? []}
            ascendant={data?.natal.ascendant.longitude ?? 0}
            activePlanet={majorTransit?.planet}
            isDemo={isDemo}
          />
        </div>

        {isDemo && !PUBLIC_REVIEW_MODE && (
          <div className="mt-4">
            <DemoCallout />
          </div>
        )}

        {/* C. today score */}
        <div className="mt-5">
          {data ? (
            <TodayScore overall={data.overall} scores={data.scores} />
          ) : (
            <div className="surface-hero h-[380px] animate-breathe" aria-busy={isLoading} />
          )}
        </div>

        {/* D. major transit */}
        {majorTransit && (
          <div className="mt-5">
            <MajorTransitCard transit={majorTransit} />
          </div>
        )}

        {/* E. before / after planet movement */}
        {movements.length > 0 && (
          <div className="mt-5">
            <PlanetMovement movements={movements} days={LOOKBACK_DAYS} />
          </div>
        )}

        {/* E. time travel */}
        {past && data && future && (
          <div className="mt-5">
            <TimeTravelPreview
              past={past.overall}
              now={data.overall}
              future={future.overall}
              days={LOOKAHEAD_DAYS}
            />
          </div>
        )}

        {/* F. destiny timeline */}
        {destiny.length > 0 && (
          <div className="mt-5">
            <DestinyTimeline points={destiny} />
          </div>
        )}

        {/* G. AI astrologer */}
        <div className="mt-5">
          <AstrologerConsult question={consultQuestion} />
        </div>

        {/* daily ritual */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => void handleCheckIn()}
          disabled={PUBLIC_REVIEW_MODE && !isSignedIn}
          className="press surface-card mt-5 flex w-full items-center gap-3 p-4 text-left"
        >
          <span className="surface-inset flex h-10 w-10 shrink-0 items-center justify-center">
            <Gift className="h-4.5 w-4.5 text-[var(--gold)]" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-medium text-foreground">
              เช็คอินรับแต้มประจำวัน
            </span>
            <span className="block text-[11.5px] text-muted-foreground">
              {PUBLIC_REVIEW_MODE && !isSignedIn
                ? "โหมดอ่านอย่างเดียว · เข้าสู่ระบบเพื่อเช็คอิน"
                : reward
                  ? `ได้รับ ${toThaiDigits(reward)} แต้ม`
                  : `สตรีค ${toThaiDigits(profile.streak)} วัน · ${moon ? `จันทร์ราศี${moon.signTh}` : "ดวงจันทร์กำลังเคลื่อน"}`}
            </span>
          </span>
        </motion.button>

        {/* H. premium */}
        <div className="mt-5">
          <DayWalletStatus days={wallet.data.daysRemaining} points={wallet.data.points} />
        </div>

        {/* I. development full access notice */}
        {access.unlockedForEveryone && (
          <div className="mt-4">
            <DevAccessNotice />
          </div>
        )}
      </PageTransition>
    </AppShell>
  );
}
