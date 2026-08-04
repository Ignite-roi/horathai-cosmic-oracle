import { motion } from "framer-motion";
import { Activity, Briefcase, Coins, Heart } from "lucide-react";

import { CelestialDivider } from "@/components/thai/Ornaments";
import { toThaiDigits, type AreaScore, type LifeArea } from "@/lib/astro";

const ICONS: Partial<Record<LifeArea, typeof Heart>> = {
  career: Briefcase,
  money: Coins,
  love: Heart,
  health: Activity,
};

const ORDER: LifeArea[] = ["career", "money", "love", "health"];

function tone(score: number) {
  if (score >= 72) return "var(--gold)";
  if (score >= 55) return "var(--success)";
  if (score >= 42) return "var(--warning)";
  return "var(--danger)";
}

export function TodayScore({ overall, scores }: { overall: number; scores: AreaScore[] }) {
  const size = 188;
  const stroke = 9;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const byArea = new Map(scores.map((s) => [s.area, s]));

  return (
    <div className="surface-hero grain overflow-hidden px-5 pb-6 pt-7">
      <p className="eyebrow text-center">Today</p>
      <h2 className="thai-heading mt-1 text-center text-[19px] text-foreground">ดวงวันนี้ของคุณ</h2>

      <div className="relative mx-auto mt-5" style={{ width: size, height: size }}>
        <div
          aria-hidden
          className="absolute inset-6 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--gold) 26%, transparent), transparent 68%)" }}
        />
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="oklch(1 0 0 / 7%)" fill="none" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            stroke="url(#score-gold)"
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDasharray: `0 ${c}` }}
            animate={{ strokeDasharray: `${(overall / 100) * c} ${c}` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: "drop-shadow(0 0 10px color-mix(in oklab, var(--gold) 55%, transparent))" }}
          />
          <defs>
            <linearGradient id="score-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--gold-deep)" />
              <stop offset="45%" stopColor="var(--gold-hot)" />
              <stop offset="100%" stopColor="var(--gold-deep)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="thai-heading text-[52px] leading-none text-gold">{toThaiDigits(overall)}</span>
          <span className="mt-1.5 text-[11px] tracking-[0.18em] text-muted-foreground">คะแนน</span>
        </div>
      </div>

      <CelestialDivider className="mt-5" />

      <div className="mt-5 grid grid-cols-4 gap-2">
        {ORDER.map((area, i) => {
          const s = byArea.get(area);
          if (!s) return null;
          const Icon = ICONS[area]!;
          const color = tone(s.score);
          return (
            <motion.div
              key={area}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="surface-inset flex flex-col items-center gap-1.5 px-1 py-3"
            >
              <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.7} />
              <span className="numeral text-[17px] leading-none" style={{ color }}>
                {toThaiDigits(s.score)}
              </span>
              <span className="text-[10.5px] leading-none text-muted-foreground">{s.th}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}