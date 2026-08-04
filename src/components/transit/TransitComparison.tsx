import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { PlanetGlyph } from "@/components/thai/PlanetGlyph";
import type { PlanetShift } from "@/hooks/useTimeTravel";
import { HOUSES, thaiDate, toThaiDigits } from "@/lib/astro";

function houseTh(n: number) {
  return HOUSES.find((h) => h.n === n)?.th ?? `ภพที่ ${toThaiDigits(n)}`;
}

/**
 * Before / after comparison between today's sampled positions and the
 * selected date's sampled positions. Only genuine differences are listed;
 * when nothing meaningful changed we say so instead of inventing an event.
 */
export function TransitComparison({
  shifts,
  fromDate,
  toDate,
  sameDay,
}: {
  shifts: PlanetShift[];
  fromDate: Date;
  toDate: Date;
  sameDay: boolean;
}) {
  const meaningful = shifts.filter((s) => s.meaningful);

  return (
    <section className="surface-card p-5">
      <p className="eyebrow">Before / after</p>
      <h2 className="thai-heading mt-1 text-[17px] text-foreground">เปรียบเทียบตำแหน่งดาวตามวันที่เลือก</h2>

      <div className="surface-inset mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 p-3">
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground">วันที่อ้างอิง</p>
          <p className="numeral mt-0.5 truncate text-[12.5px] text-foreground">{thaiDate(fromDate)}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--gold)]" />
        <div className="min-w-0 text-right">
          <p className="text-[10px] text-muted-foreground">วันที่เลือก</p>
          <p className="numeral mt-0.5 truncate text-[12.5px] text-gold">{thaiDate(toDate)}</p>
        </div>
      </div>

      {sameDay ? (
        <p className="mt-4 text-[11.5px] leading-relaxed text-muted-foreground">
          กำลังดูวันปัจจุบัน เลื่อนไทม์ไลน์เพื่อเทียบกับวันอื่น
        </p>
      ) : meaningful.length === 0 ? (
        <div className="surface-inset mt-4 flex items-start gap-3 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" strokeWidth={1.8} />
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            ไม่พบการเปลี่ยนราศี เปลี่ยนภพ หรือเปลี่ยนสภาพพักร์ระหว่างสองวันนี้
            ดาวเคลื่อนเพียงเล็กน้อยภายในตำแหน่งเดิม
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {meaningful.map((s, i) => (
            <motion.li
              key={s.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="surface-inset grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 p-3"
            >
              <PlanetGlyph num={s.num} size={34} active />
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="truncate text-[13px] font-medium text-foreground">ดาว{s.th}</span>
                  {s.signChanged && (
                    <span className="gold-hairline shrink-0 rounded-full px-1.5 py-0.5 text-[9px] text-[var(--gold)]">
                      เปลี่ยนราศี
                    </span>
                  )}
                  {s.houseChanged && (
                    <span className="gold-hairline shrink-0 rounded-full px-1.5 py-0.5 text-[9px] text-[var(--gold)]">
                      เปลี่ยนภพ
                    </span>
                  )}
                  {s.retroChanged && (
                    <span className="shrink-0 rounded-full border border-[oklch(0.72_0.17_30/40%)] px-1.5 py-0.5 text-[9px] text-[oklch(0.78_0.15_30)]">
                      {s.to.retrograde ? "เริ่มพักร์" : "กลับมาเดินหน้า"}
                    </span>
                  )}
                </div>

                {s.signChanged && (
                  <p className="mt-1 text-[11.5px] text-muted-foreground">
                    ราศี{s.from.signTh} <span className="text-[var(--gold)]">→</span> ราศี{s.to.signTh}
                  </p>
                )}
                {s.houseChanged && (
                  <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                    {houseTh(s.fromHouse)} <span className="text-[var(--gold)]">→</span> {houseTh(s.toHouse)}
                  </p>
                )}
                <p className="numeral mt-0.5 text-[10.5px] text-muted-foreground">
                  เคลื่อนไปราว {toThaiDigits(s.degrees)}°
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-[10.5px] leading-relaxed text-muted-foreground">
        เป็นการเทียบตำแหน่งดาว ณ สองช่วงเวลาที่สุ่มวัดเท่านั้น ไม่ใช่การระบุวันย้ายราศีที่แน่นอน
      </p>
    </section>
  );
}
