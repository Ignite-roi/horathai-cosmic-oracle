import { motion } from "framer-motion";
import { Activity, Briefcase, Coins, Heart, Home, Users } from "lucide-react";

import { toThaiDigits, type AreaScore, type LifeArea } from "@/lib/astro";

const ICONS: Record<LifeArea, typeof Heart> = {
  career: Briefcase,
  money: Coins,
  love: Heart,
  health: Activity,
  family: Home,
  partner: Users,
};

function toneColor(score: number) {
  if (score >= 75) return "var(--gold)";
  if (score >= 55) return "oklch(0.75 0.15 160)";
  if (score >= 40) return "oklch(0.78 0.15 70)";
  return "oklch(0.68 0.19 25)";
}

export function ScoreRing({
  value,
  label,
  area,
  delay = 0,
  size = 84,
}: {
  value: number;
  label: string;
  area: LifeArea;
  delay?: number;
  size?: number;
}) {
  const Icon = ICONS[area];
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = toneColor(value);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="var(--muted)" fill="none" />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            stroke={color}
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDasharray: `0 ${c}` }}
            animate={{ strokeDasharray: `${(value / 100) * c} ${c}` }}
            transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={1.8} />
          <span className="display mt-0.5 text-[15px] font-semibold text-foreground">
            {toThaiDigits(value)}
          </span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function AreaScoreRow({ score, index }: { score: AreaScore; index: number }) {
  const color = toneColor(score.score);
  const Icon = ICONS[score.area];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="glass grain rounded-[22px] p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: `color-mix(in oklab, ${color} 18%, transparent)` }}
          >
            <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.8} />
          </span>
          <p className="text-[14px] font-medium text-foreground">{score.th}</p>
        </div>
        <span className="display text-[16px] font-semibold" style={{ color }}>
          {toThaiDigits(score.score)}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${score.score}%` }}
          transition={{ duration: 0.9, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <ul className="mt-3 space-y-1.5">
        {score.reasons.slice(0, 2).map((r) => (
          <li key={r} className="flex gap-2 text-[11.5px] leading-relaxed text-muted-foreground">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
            {r}
          </li>
        ))}
        {score.reasons.length === 0 && (
          <li className="text-[11.5px] text-muted-foreground">ดาวจรไม่กระทบภพนี้ชัดเจน ถือว่าทรงตัว</li>
        )}
      </ul>
    </motion.div>
  );
}
