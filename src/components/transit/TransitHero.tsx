import { motion } from "framer-motion";

import { KanokCorner } from "@/components/thai/Ornaments";
import { PlanetGlyph, ThaiHouseNumber } from "@/components/thai/PlanetGlyph";
import { ENGINE_LABEL, type PlanetShift } from "@/hooks/useTimeTravel";
import { HOUSES, moonPhaseLabel, thaiDate, toThaiDigits } from "@/lib/astro";

function thaiTime(d: Date) {
  return toThaiDigits(
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
  );
}

/**
 * Cinematic header for the transit page: the moment being read, the planet in
 * focus, its sign, the personal house it falls in and a one-line summary.
 */
export function TransitHero({
  date,
  focus,
  ascendantSign,
  moonPhase,
  children,
}: {
  date: Date;
  focus: PlanetShift | null;
  ascendantSign: string;
  moonPhase: number;
  children?: React.ReactNode;
}) {
  const house = focus ? HOUSES.find((h) => h.n === focus.toHouse) : undefined;

  return (
    <section className="surface-hero grain relative overflow-hidden p-5">
      <KanokCorner className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 opacity-40" />
      <span
        aria-hidden
        className="absolute -left-16 top-10 h-44 w-44 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--royal) 40%, transparent), transparent 70%)",
        }}
      />

      <div className="relative">
        <p className="eyebrow">Live transit</p>
        <h1 className="thai-heading mt-1 text-[21px] leading-tight text-foreground">
          ดาวจร ณ เวลาที่คุณเลือก
        </h1>
        <p className="numeral mt-1.5 text-[12px] text-muted-foreground">
          {thaiDate(date)} · {thaiTime(date)} น. · ลัคนาราศี{ascendantSign} ·{" "}
          {moonPhaseLabel(moonPhase)}
        </p>

        {children && <div className="mt-4">{children}</div>}

        {focus && (
          <motion.div
            key={`${focus.num}-${focus.to.signId}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="surface-inset mt-5 p-4"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
              <PlanetGlyph num={focus.num} size={46} active />
              <div className="min-w-0">
                <p className="eyebrow">ดาวที่โดดเด่น</p>
                <p className="thai-heading mt-0.5 truncate text-[16px] text-gold">
                  ดาว{focus.th} ราศี{focus.to.signTh}
                </p>
                <p className="numeral mt-0.5 text-[11px] text-muted-foreground">
                  {toThaiDigits(focus.to.degree)}° {focus.to.retrograde ? "· พักร์" : "· เดินหน้า"}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <ThaiHouseNumber house={focus.toHouse} label={house?.th ?? ""} />
            </div>

            <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground">
              ดาว{focus.th}ให้ผลด้าน{focus.to.influence} ตกในภพที่ดูแลเรื่อง
              {house?.about ?? "ชีวิตประจำวัน"} ของดวงกำเนิดคุณ
            </p>
          </motion.div>
        )}

        <p className="mt-4 text-[10.5px] leading-relaxed text-muted-foreground">
          เครื่องคำนวณที่ใช้ขณะนี้:{" "}
          <span className="numeral text-[var(--gold)]">{ENGINE_LABEL}</span> —
          ตำแหน่งดาวคำนวณแบบนิรายนะ (Lahiri) และเป็นค่าที่สุ่มวัดตามเวลาที่เลือก
        </p>
      </div>
    </section>
  );
}
