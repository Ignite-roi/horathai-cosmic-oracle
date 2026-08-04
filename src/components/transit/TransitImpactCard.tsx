import { motion } from "framer-motion";
import { Landmark } from "lucide-react";

import { PlanetGlyph, ThaiHouseNumber } from "@/components/thai/PlanetGlyph";
import type { PlanetShift } from "@/hooks/useTimeTravel";
import { HOUSES, toThaiDigits } from "@/lib/astro";

export type HouseImpact = {
  house: number;
  th: string;
  about: string;
  planets: PlanetShift[];
};

/** Groups the transiting planets by the natal house they currently occupy. */
export function buildHouseImpacts(shifts: PlanetShift[]): HouseImpact[] {
  const map = new Map<number, PlanetShift[]>();
  for (const s of shifts) {
    const list = map.get(s.toHouse) ?? [];
    list.push(s);
    map.set(s.toHouse, list);
  }
  return [...map.entries()]
    .map(([house, planets]) => {
      const info = HOUSES.find((h) => h.n === house);
      return {
        house,
        th: info?.th ?? `ภพที่ ${toThaiDigits(house)}`,
        about: info?.about ?? "",
        planets,
      };
    })
    .sort((a, b) => b.planets.length - a.planets.length || a.house - b.house);
}

/**
 * Impact of a natal house on the selected date. The measured data (planets,
 * houses) is separated from the rule-engine interpretation below it.
 */
export function TransitImpactCard({ impact, index = 0 }: { impact: HouseImpact; index?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="surface-card p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <ThaiHouseNumber house={impact.house} label={impact.th} />
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">{impact.about}</p>
        </div>
        <Landmark className="h-5 w-5 shrink-0 text-[var(--gold)]" strokeWidth={1.6} />
      </div>

      <div className="mt-3.5">
        <p className="eyebrow">ข้อมูลที่วัดได้</p>
        <ul className="mt-2 space-y-2">
          {impact.planets.map((p) => (
            <li key={p.num} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5">
              <PlanetGlyph num={p.num} size={28} active={p.meaningful} />
              <p className="min-w-0 truncate text-[11.5px] text-foreground/85">
                ดาว{p.th} ราศี{p.to.signTh} {toThaiDigits(p.to.degree)}°
                {p.to.retrograde ? " · พักร์" : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-inset mt-3.5 p-3.5">
        <p className="eyebrow">คำอธิบายจากชุดกฎ</p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
          {impact.planets
            .slice(0, 2)
            .map((p) => `ดาว${p.th}ให้ผลด้าน${p.to.influence}ต่อ${impact.about}`)
            .join(" · ")}
        </p>
      </div>
    </motion.section>
  );
}
