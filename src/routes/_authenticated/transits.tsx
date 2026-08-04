import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell, LoadingSky, PageTransition } from "@/components/AppShell";
import { DevAccessNotice } from "@/components/home/HomeSections";
import { LifeScoreDelta } from "@/components/transit/LifeScoreDelta";
import { PlanetSelector } from "@/components/transit/PlanetSelector";
import { TimeTravelSlider } from "@/components/transit/TimeTravelSlider";
import { TransitComparison } from "@/components/transit/TransitComparison";
import { TransitDemoBanner } from "@/components/transit/TransitDemoBanner";
import { TransitHero } from "@/components/transit/TransitHero";
import { TransitImpactCard, buildHouseImpacts } from "@/components/transit/TransitImpactCard";
import { TransitModeTabs, type TransitMode } from "@/components/transit/TransitModeTabs";
import { TransitOrbit } from "@/components/transit/TransitOrbit";
import { dateAt, useTimeTravel } from "@/hooks/useTimeTravel";
import type { PlanetId } from "@/lib/astro";

export const Route = createFileRoute("/_authenticated/transits")({
  head: () => ({
    meta: [
      { title: "ดาวย้าย & ท่องเวลา | Horathai AI" },
      {
        name: "description",
        content:
          "เลื่อนไทม์ไลน์เพื่อเทียบตำแหน่งดาวจรในอดีตและอนาคต พร้อมผลต่อภพและคะแนนการงาน เงิน ความรัก สุขภาพ",
      },
      { property: "og:title", content: "ดาวย้าย & ท่องเวลา | Horathai AI" },
      {
        property: "og:description",
        content: "Time Travel Slider เทียบตำแหน่งดาวตามวันที่เลือก ด้วยเครื่องคำนวณนิรายนะ",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransitPage,
});

/** Slow-to-fast weighting: the heaviest mover leads the hero. */
const WEIGHT: PlanetId[] = [7, 8, 9, 5, 3, 6, 4, 1, 2];

function TransitPage() {
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState<TransitMode>("overview");
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId | null>(null);

  const { base, target, shifts, scoreShifts, isDemo, isLoading, isSyncing, appliedOffset } =
    useTimeTravel(offset);

  const focus = useMemo(() => {
    if (shifts.length === 0) return null;
    const changed = [...shifts]
      .filter((s) => s.meaningful)
      .sort((a, b) => WEIGHT.indexOf(a.num) - WEIGHT.indexOf(b.num))[0];
    if (changed) return changed;
    return [...shifts].sort((a, b) => b.to.strength - a.to.strength)[0] ?? null;
  }, [shifts]);

  const activePlanet: PlanetId = selectedPlanet ?? focus?.num ?? 1;
  const impacts = useMemo(() => buildHouseImpacts(shifts), [shifts]);
  const selectedDate = dateAt(appliedOffset);
  const sameDay = appliedOffset === 0;

  const moonPhase = target?.transit.moonPhase ?? 0;
  const element = target?.natal.planets.find((p) => p.num === 1)?.element;

  return (
    <AppShell moonPhase={moonPhase} {...(element ? { element } : {})}>
      <PageTransition>
        <div className="space-y-4">
          {isDemo && <TransitDemoBanner />}

          <TransitHero
            date={selectedDate}
            focus={focus}
            ascendantSign={target?.natal.ascendant.signTh ?? "—"}
            moonPhase={moonPhase}
          >
            {shifts.length > 0 && <TransitOrbit shifts={shifts} />}
          </TransitHero>

          <TimeTravelSlider offset={offset} onChange={setOffset} syncing={isSyncing} />

          {isLoading || !base || !target ? (
            <LoadingSky />
          ) : (
            <>
              <TransitModeTabs value={mode} onChange={setMode} />

              {mode === "overview" && (
                <div className="space-y-4">
                  <TransitComparison
                    shifts={shifts}
                    fromDate={dateAt(0)}
                    toDate={selectedDate}
                    sameDay={sameDay}
                  />
                  <LifeScoreDelta shifts={scoreShifts} showDelta={!sameDay} />
                </div>
              )}

              {mode === "planets" && (
                <div className="space-y-4">
                  <PlanetSelector
                    shifts={shifts}
                    selected={activePlanet}
                    onSelect={setSelectedPlanet}
                  />
                  <TransitComparison
                    shifts={shifts}
                    fromDate={dateAt(0)}
                    toDate={selectedDate}
                    sameDay={sameDay}
                  />
                </div>
              )}

              {mode === "houses" && (
                <div className="space-y-4">
                  {impacts.map((impact, i) => (
                    <TransitImpactCard key={impact.house} impact={impact} index={i} />
                  ))}
                </div>
              )}

              {mode === "scores" && (
                <LifeScoreDelta
                  shifts={scoreShifts}
                  showDelta={!sameDay}
                  areas={["career", "money", "love", "health", "family", "partner"]}
                />
              )}
            </>
          )}

          <DevAccessNotice />
        </div>
      </PageTransition>
    </AppShell>
  );
}
