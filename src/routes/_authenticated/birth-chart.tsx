import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

import { AppShell, EmptyBirthData, LoadingSky, PageTransition, SectionTitle } from "@/components/AppShell";
import { SolarSystemClient } from "@/components/ClientScene";
import { useReading } from "@/hooks/useReading";
import { ASPECT_LABEL, HOUSES, PLANET_BY_NUM, formatDegree, toThaiDigits, type PlacedPlanet } from "@/lib/astro";
import { useProfile } from "@/store/useProfile";
import { useSettings } from "@/store/useSettings";

export const Route = createFileRoute("/chart")({
  head: () => ({
    meta: [
      { title: "จักรวาลดวงชะตา 3 มิติ | Horathai AI" },
      {
        name: "description",
        content: "ผังดวงกำเนิดสามมิติจากตำแหน่งดาวจริง ราศีไทย เรือนชะตา ดาวพักร์ และมุมสัมพันธ์",
      },
      { property: "og:title", content: "จักรวาลดวงชะตา 3 มิติ | Horathai AI" },
      { property: "og:description", content: "หมุนดูจักรวาลดวงชะตาของคุณ พร้อมความหมายดาวทุกดวง" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChartPage,
});

type Mode = "natal" | "transit" | "both";

function ChartPage() {
  const birthDate = useProfile((s) => s.birthDate);
  const showAspects = useSettings((s) => s.showAspects);
  const setShowAspects = useSettings((s) => s.setShowAspects);
  const { data, isLoading, error } = useReading();
  const [selected, setSelected] = useState<PlacedPlanet | null>(null);
  const [mode, setMode] = useState<Mode>("natal");

  if (!birthDate) {
    return (
      <AppShell>
        <PageTransition>
          <SectionTitle kicker="Birth Chart" title="จักรวาลดวงชะตา" />
          <EmptyBirthData />
        </PageTransition>
      </AppShell>
    );
  }

  const natal = data?.natal;
  const list = mode === "transit" ? data?.transit.planets : natal?.planets;

  return (
    <AppShell
      {...(data ? { moonPhase: data.transit.moonPhase } : {})}
      {...(natal?.planets[0]?.element ? { element: natal.planets[0].element } : {})}
    >
      <PageTransition>
        <SectionTitle
          kicker="Birth Chart"
          title="จักรวาลดวงชะตา"
          right={
            natal && (
              <span className="hairline-gold rounded-full bg-primary/8 px-3 py-1 text-[11px] text-foreground/85">
                ลัคนาราศี{natal.ascendant.signTh}
              </span>
            )
          }
        />

        {isLoading && <LoadingSky />}
        {error && (
          <div className="glass rounded-[24px] p-5 text-[12.5px] text-destructive">
            คำนวณดวงไม่สำเร็จ: {(error as Error).message}
          </div>
        )}

        {data && natal && (
          <>
            <div className="glass grain mb-3 flex gap-1 rounded-full p-1">
              {(
                [
                  ["natal", "ดวงกำเนิด"],
                  ["transit", "ดาวจร"],
                  ["both", "ซ้อนกัน"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`relative flex-1 rounded-full px-3 py-2 text-[12px] transition-colors ${
                    mode === id ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {mode === id && (
                    <motion.span layoutId="mode-pill" className="btn-gold absolute inset-0 rounded-full" />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>

            <div className="relative h-[440px] w-full overflow-hidden rounded-[30px] border border-primary/15 bg-[radial-gradient(70%_60%_at_50%_45%,oklch(0.22_0.11_305/70%),transparent_72%)]">
              <SolarSystemClient
                planets={natal.planets}
                transitPlanets={mode === "natal" ? [] : data.transit.planets}
                aspects={natal.aspects}
                ascendant={natal.ascendant.longitude}
                ascendantLabel={natal.ascendant.signTh}
                selected={selected}
                showAspects={showAspects}
                onSelect={setSelected}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-1">
                <p className="text-[11px] text-muted-foreground">ลากเพื่อหมุน · หนีบเพื่อซูม · แตะดาวเพื่อดูความหมาย</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={showAspects}
                  onChange={(e) => setShowAspects(e.target.checked)}
                  className="h-4 w-4 accent-[var(--gold)]"
                />
                แสดงเส้นมุมสัมพันธ์
              </label>
              <span className="text-[11px] text-muted-foreground">
                อายนางศ {toThaiDigits(natal.ayanamsa.toFixed(2))}°
              </span>
            </div>

            {/* 2D readable list — accessible fallback for the 3D scene */}
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              {(list ?? []).map((p, i) => (
                <motion.button
                  key={p.num}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.035 }}
                  onClick={() => setSelected(p)}
                  className="press glass grain rounded-2xl p-3 text-left"
                >
                  <span
                    className="mb-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
                    style={{ background: `${p.color}22`, color: p.color, boxShadow: `0 0 12px ${p.color}55` }}
                  >
                    {p.thaiNumeral}
                  </span>
                  <p className="text-[13px] font-medium text-foreground">{p.th}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.signTh} {formatDegree(p)}
                  </p>
                  {p.retrograde && <p className="text-[10px] text-destructive">พักร์</p>}
                </motion.button>
              ))}
            </div>

            {natal.aspects.length > 0 && (
              <div className="mt-6">
                <SectionTitle kicker="Aspects" title="มุมสัมพันธ์ในดวงกำเนิด" />
                <div className="space-y-2">
                  {natal.aspects.slice(0, 6).map((asp, i) => {
                    const a = PLANET_BY_NUM.get(asp.a)!;
                    const b = PLANET_BY_NUM.get(asp.b)!;
                    return (
                      <div key={i} className="glass flex items-center justify-between rounded-2xl px-4 py-3">
                        <p className="text-[12.5px] text-foreground">
                          {a.th} <span className="text-primary">{ASPECT_LABEL[asp.kind]}</span> {b.th}
                        </p>
                        <span
                          className="text-[11px]"
                          style={{ color: asp.benefic ? "oklch(0.78 0.14 160)" : "oklch(0.7 0.18 30)" }}
                        >
                          คลาด {toThaiDigits(asp.orb)}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <AnimatePresence>
          {selected && (
            <motion.div
              key="sheet"
              className="fixed inset-0 z-40 flex items-end justify-center bg-black/65 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-deep grain w-full max-w-lg rounded-t-[30px] p-6 pb-10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="display flex h-11 w-11 items-center justify-center rounded-full text-[18px]"
                      style={{
                        background: `${selected.color}22`,
                        color: selected.color,
                        boxShadow: `0 0 28px ${selected.color}66`,
                      }}
                    >
                      {selected.thaiNumeral}
                    </span>
                    <div>
                      <h3 className="display text-xl font-semibold text-foreground">{selected.th}</h3>
                      <p className="text-[11px] text-muted-foreground">{selected.meaning}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="press rounded-full bg-muted p-2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {[
                    ["ตำแหน่ง", `ราศี${selected.signTh} ${formatDegree(selected)}`],
                    ["ธาตุราศี", selected.element],
                    ["เรือนชะตา", `${HOUSES[selected.house - 1]!.th} (${toThaiDigits(selected.house)})`],
                    ["ทิศทาง", selected.retrograde ? "พักร์ (เดินถอย)" : "เดินหน้าปกติ"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl border border-border bg-card/50 p-3">
                      <p className="text-[10px] text-muted-foreground">{k}</p>
                      <p className="mt-1 text-[13px] text-foreground">{v}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 rounded-2xl border border-primary/20 bg-primary/8 p-4 text-[12px] leading-relaxed text-foreground/90">
                  ดาว{selected.th}สถิต{HOUSES[selected.house - 1]!.th} ({HOUSES[selected.house - 1]!.about}){" "}
                  ส่งผลให้เรื่อง{selected.influence}เด่นชัด
                  {selected.retrograde ? " แต่อยู่ในภาวะพักร์ ผลจะมาช้าและต้องทบทวนซ้ำ" : " และให้ผลตรงไปตรงมา"}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageTransition>
    </AppShell>
  );
}
