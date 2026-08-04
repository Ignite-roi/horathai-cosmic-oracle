import { motion } from "framer-motion";
import { Activity, Briefcase, Coins, Heart, Home, Users } from "lucide-react";

import type { ScoreShift } from "@/hooks/useTimeTravel";
import { toThaiDigits, type LifeArea } from "@/lib/astro";

const AREA_ICON: Record<LifeArea, typeof Briefcase> = {
  career: Briefcase,
  money: Coins,
  love: Heart,
  health: Activity,
  family: Home,
  partner: Users,
};

/** The four life areas the transit comparison reports on. */
export const CORE_AREAS: LifeArea[] = ["career", "money", "love", "health"];

function deltaColor(delta: number) {
  if (delta > 0) return "oklch(0.8 0.14 155)";
  if (delta < 0) return "oklch(0.72 0.17 30)";
  return "oklch(0.72 0 0)";
}

/** Before → after life scores for the selected date. */
export function LifeScoreDelta({
  shifts,
  showDelta,
  areas = CORE_AREAS,
}: {
  shifts: ScoreShift[];
  showDelta: boolean;
  areas?: LifeArea[];
}) {
  const rows = shifts.filter((s) => areas.includes(s.area));

  return (
    <ul className="space-y-2.5">
      {rows.map((s, i) => {
        const Icon = AREA_ICON[s.area];
        return (
          <motion.li
            key={s.area}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="surface-card p-4"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <span className="gold-hairline flex h-9 w-9 items-center justify-center rounded-[12px]">
                <Icon className="h-4 w-4 text-[var(--gold)]" strokeWidth={1.8} />
              </span>
              <p className="min-w-0 truncate text-[13.5px] font-medium text-foreground">{s.th}</p>
              <div className="text-right">
                <p className="numeral text-[17px] text-foreground">{toThaiDigits(s.after)}</p>
                {showDelta && (
                  <p className="numeral text-[11px]" style={{ color: deltaColor(s.delta) }}>
                    {s.delta > 0 ? "▲" : s.delta < 0 ? "▼" : "—"} {toThaiDigits(Math.abs(s.delta))}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[oklch(1_0_0/6%)]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--gold-deep), var(--gold-hot))" }}
                animate={{ width: `${s.after}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
              />
            </div>

            {showDelta && (
              <p className="numeral mt-2 text-[10.5px] text-muted-foreground">
                วันนี้ {toThaiDigits(s.before)} → วันที่เลือก {toThaiDigits(s.after)}
              </p>
            )}
            {s.reasons[0] && (
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
                {s.reasons[0]}
              </p>
            )}
          </motion.li>
        );
      })}
    </ul>
  );
}
