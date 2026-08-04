import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Briefcase, Coins, Heart, Home as HomeIcon, RotateCcw, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell, EmptyBirthData, LoadingSky, PageTransition, SectionTitle } from "@/components/AppShell";
import { useReading } from "@/hooks/useReading";
import {
  ASPECT_LABEL,
  PLANET_BY_NUM,
  formatDegree,
  moonPhaseLabel,
  thaiDate,
  toThaiDigits,
  type LifeArea,
} from "@/lib/astro";
import { useProfile } from "@/store/useProfile";

export const Route = createFileRoute("/transit")({
  head: () => ({
    meta: [
      { title: "ดาวจร & ท่องเวลา | Horathai AI" },
      {
        name: "description",
        content: "เลื่อนไทม์ไลน์เพื่อดูดาวจรในอดีตและอนาคต พร้อมเทียบผลก่อน–หลังต่อการงาน เงิน ความรัก สุขภาพ",
      },
      { property: "og:title", content: "ดาวจร & ท่องเวลา | Horathai AI" },
      { property: "og:description", content: "Time Travel Slider ดูจังหวะดาวย้ายที่เปลี่ยนดวงชะตาของคุณ" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransitPage,
});

const AREA_ICON: Record<LifeArea, typeof Briefcase> = {
  career: Briefcase,
  money: Coins,
  love: Heart,
  health: Activity,
  family: HomeIcon,
  partner: Users,
};

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function TransitPage() {
  const birthDate = useProfile((s) => s.birthDate);
  const [offset, setOffset] = useState(0);

  const targetIso = useMemo(() => isoOffset(offset), [offset]);
  const today = useReading();
  const future = useReading(offset === 0 ? undefined : targetIso);

  if (!birthDate) {
    return (
      <AppShell>
        <PageTransition>
          <SectionTitle kicker="Transit" title="ดาวจร & ท่องเวลา" />
          <EmptyBirthData />
        </PageTransition>
      </AppShell>
    );
  }

  const base = today.data;
  const shifted = future.data ?? base;
  const targetDate = new Date(targetIso);

  return (
    <AppShell {...(shifted ? { moonPhase: shifted.transit.moonPhase } : {})}>
      <PageTransition>
        <SectionTitle
          kicker="Time Travel"
          title="ดาวจร & ท่องเวลา"
          right={
            offset !== 0 && (
              <button
                onClick={() => setOffset(0)}
                className="press glass flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] text-foreground/85"
              >
                <RotateCcw className="h-3 w-3" /> วันนี้
              </button>
            )
          }
        />

        <div className="glass-deep grain rounded-[26px] p-5">
          <div className="flex items-baseline justify-between">
            <p className="display text-lg text-foreground">{thaiDate(targetDate)}</p>
            <p className="text-[11px] text-primary">
              {offset === 0
                ? "ปัจจุบัน"
                : `${offset > 0 ? "อีก" : "ย้อนหลัง"} ${toThaiDigits(Math.abs(offset))} วัน`}
            </p>
          </div>
          <input
            type="range"
            min={-180}
            max={365}
            step={1}
            value={offset}
            onChange={(e) => setOffset(Number(e.target.value))}
            className="mt-4 w-full accent-[var(--gold)]"
            aria-label="เลื่อนเวลาเพื่อดูดาวจร"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>ย้อน ๖ เดือน</span>
            <span>วันนี้</span>
            <span>อีก ๑ ปี</span>
          </div>
          <div className="mt-3 flex gap-2">
            {[
              [-30, "-๑ เดือน"],
              [0, "วันนี้"],
              [30, "+๑ เดือน"],
              [90, "+๓ เดือน"],
            ].map(([v, label]) => (
              <button
                key={label as string}
                onClick={() => setOffset(v as number)}
                className={`press flex-1 rounded-full px-2 py-1.5 text-[11px] transition-colors ${
                  offset === v ? "btn-gold text-primary-foreground" : "glass text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {(today.isLoading || !base) && <div className="mt-4"><LoadingSky /></div>}

        {base && shifted && (
          <>
            <div className="mt-6">
              <SectionTitle kicker="Before / After" title="ผลต่อชีวิตแต่ละด้าน" />
              <div className="space-y-2.5">
                {shifted.scores.map((s, i) => {
                  const before = base.scores.find((x) => x.area === s.area)?.score ?? s.score;
                  const delta = s.score - before;
                  const Icon = AREA_ICON[s.area];
                  return (
                    <motion.div
                      key={s.area}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass grain rounded-[22px] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12">
                            <Icon className="h-4 w-4 text-primary" />
                          </span>
                          <p className="text-[13.5px] font-medium text-foreground">{s.th}</p>
                        </div>
                        <div className="text-right">
                          <p className="display text-[17px] text-foreground">{toThaiDigits(s.score)}</p>
                          {offset !== 0 && (
                            <p
                              className="text-[11px]"
                              style={{
                                color:
                                  delta > 0
                                    ? "oklch(0.78 0.14 160)"
                                    : delta < 0
                                      ? "oklch(0.7 0.18 30)"
                                      : "oklch(0.7 0 0)",
                              }}
                            >
                              {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {toThaiDigits(Math.abs(delta))}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          className="h-full rounded-full bg-[var(--gradient-gold)]"
                          animate={{ width: `${s.score}%` }}
                          transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        />
                      </div>
                      {s.reasons[0] && (
                        <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-foreground">{s.reasons[0]}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <SectionTitle
                kicker="Sky"
                title="ตำแหน่งดาวจร"
                right={
                  <span className="text-[11px] text-muted-foreground">
                    {moonPhaseLabel(shifted.transit.moonPhase)}
                  </span>
                }
              />
              <div className="grid grid-cols-3 gap-2.5">
                {shifted.transit.planets.map((p) => {
                  const was = base.transit.planets.find((x) => x.num === p.num);
                  const moved = was && was.signId !== p.signId;
                  return (
                    <div key={p.num} className="glass grain rounded-2xl p-3">
                      <span
                        className="mb-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
                        style={{ background: `${p.color}22`, color: p.color }}
                      >
                        {p.thaiNumeral}
                      </span>
                      <p className="text-[12.5px] text-foreground">{p.th}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.signTh} {formatDegree(p)}
                      </p>
                      {moved && <p className="mt-1 text-[10px] text-primary">ย้ายจาก{was!.signTh}</p>}
                      {p.retrograde && <p className="text-[10px] text-destructive">พักร์</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {shifted.transit.aspects.length > 0 && (
              <div className="mt-6">
                <SectionTitle kicker="Aspects" title="มุมดาวจรที่ต้องจับตา" />
                <div className="space-y-2">
                  {shifted.transit.aspects.slice(0, 5).map((a, i) => (
                    <div key={i} className="glass flex items-center justify-between rounded-2xl px-4 py-3">
                      <p className="text-[12.5px] text-foreground">
                        {PLANET_BY_NUM.get(a.a)!.th} <span className="text-primary">{ASPECT_LABEL[a.kind]}</span>{" "}
                        {PLANET_BY_NUM.get(a.b)!.th}
                      </p>
                      <span
                        className="text-[11px]"
                        style={{ color: a.benefic ? "oklch(0.78 0.14 160)" : "oklch(0.7 0.18 30)" }}
                      >
                        {a.benefic ? "ส่งเสริม" : "ท้าทาย"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </PageTransition>
    </AppShell>
  );
}
