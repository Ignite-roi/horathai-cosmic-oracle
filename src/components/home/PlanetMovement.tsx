import { motion } from "framer-motion";
import { ArrowRight, Orbit } from "lucide-react";

import { PlanetGlyph } from "@/components/thai/PlanetGlyph";
import { houseFromAscendant } from "@/hooks/useHomeReading";
import { HOUSES, toThaiDigits, type ChartResult } from "@/lib/astro";

/** Slow-to-fast weighting so the meaningful movers surface first. */
const WEIGHT = [7, 8, 9, 5, 3, 6, 4, 1, 2];

export type Movement = {
  num: number;
  th: string;
  fromSign: string;
  toSign: string;
  fromHouse: number;
  toHouse: number;
  changed: boolean;
  degrees: number;
};

export function buildMovements(
  past: ChartResult,
  now: ChartResult,
  ascendant: number,
): Movement[] {
  const items: Movement[] = [];
  for (const p of now.planets) {
    const before = past.planets.find((q) => q.num === p.num);
    if (!before) continue;
    const delta = ((p.longitude - before.longitude) % 360 + 360) % 360;
    items.push({
      num: p.num,
      th: p.th,
      fromSign: before.signTh,
      toSign: p.signTh,
      fromHouse: houseFromAscendant(before.longitude, ascendant),
      toHouse: houseFromAscendant(p.longitude, ascendant),
      changed: before.signId !== p.signId,
      degrees: Math.round(delta > 180 ? 360 - delta : delta),
    });
  }
  return items
    .sort((a, b) => {
      if (a.changed !== b.changed) return a.changed ? -1 : 1;
      return WEIGHT.indexOf(a.num) - WEIGHT.indexOf(b.num);
    })
    .slice(0, 3);
}

function houseTh(n: number) {
  return HOUSES.find((h) => h.n === n)?.th ?? `ภพที่ ${toThaiDigits(n)}`;
}

/** Before-and-after planet movement over the observed window. */
export function PlanetMovement({
  movements,
  days,
}: {
  movements: Movement[];
  days: number;
}) {
  if (movements.length === 0) return null;

  return (
    <section className="surface-card overflow-hidden p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Planet movement</p>
          <h2 className="thai-heading mt-1 text-[17px] text-foreground">ดาวย้าย ก่อน–หลัง</h2>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            เทียบตำแหน่งดาวเมื่อ {toThaiDigits(days)} วันก่อนกับวันนี้
          </p>
        </div>
        <Orbit className="h-5 w-5 shrink-0 text-[var(--gold)]" strokeWidth={1.6} />
      </div>

      <ul className="mt-4 space-y-2.5">
        {movements.map((m, i) => (
          <motion.li
            key={m.num}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="surface-inset grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-3"
          >
            <PlanetGlyph num={m.num as never} size={34} active={m.changed} />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[13px] font-medium text-foreground">ดาว{m.th}</span>
                {m.changed && (
                  <span className="gold-hairline shrink-0 rounded-full px-1.5 py-0.5 text-[9px] tracking-wide text-[var(--gold)]">
                    ย้ายราศี
                  </span>
                )}
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11.5px]">
                <span className="truncate text-muted-foreground">
                  ราศี{m.fromSign} · {houseTh(m.fromHouse)}
                </span>
                <ArrowRight className="h-3 w-3 shrink-0 text-[var(--gold)]" />
                <span className={`truncate ${m.changed ? "text-gold" : "text-foreground/80"}`}>
                  ราศี{m.toSign} · {houseTh(m.toHouse)}
                </span>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}