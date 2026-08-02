import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function ScoreRing({
  value,
  label,
  icon: Icon,
  color,
  delay = 0,
}: {
  value: number;
  label: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass flex flex-col items-center gap-2 rounded-2xl px-2 py-3"
    >
      <div className="relative h-[64px] w-[64px]">
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/60" />
          <motion.circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * value) / 100 }}
            transition={{ delay: delay + 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={2} />
          <span className="text-[13px] font-semibold text-foreground">{value}</span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </motion.div>
  );
}