import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarRange } from "lucide-react";

import { KanokCorner } from "@/components/thai/Ornaments";
import { PlanetGlyph, ThaiHouseNumber } from "@/components/thai/PlanetGlyph";
import { HOUSES, thaiDate } from "@/lib/astro";
import type { MajorTransit } from "@/hooks/useHomeReading";

export function MajorTransitCard({ transit }: { transit: MajorTransit }) {
  const house = HOUSES.find((h) => h.n === transit.house);
  const p = transit.planet;

  return (
    <section className="surface-hero grain overflow-hidden p-5">
      <KanokCorner position="tr" size={78} opacity={0.22} />
      <p className="eyebrow">Major transit</p>
      <h2 className="thai-heading mt-1 text-[18px] text-foreground">ดาวย้ายที่ส่งผลกับคุณมากที่สุด</h2>

      <div className="mt-4 flex items-center gap-3">
        <PlanetGlyph num={p.num} size={52} active />
        <div className="min-w-0">
          <p className="thai-heading text-[16px] text-gold">ดาว{p.th}</p>
          <p className="text-[11.5px] text-muted-foreground">
            {p.retrograde ? "พักร์ · " : ""}
            {p.meaning}
          </p>
        </div>
      </div>

      <div className="surface-inset mt-4 flex items-center justify-between gap-2 px-3.5 py-3">
        <div className="min-w-0 text-center">
          <p className="text-[10px] text-muted-foreground">ราศีเดิม</p>
          <p className="thai-heading truncate text-[14px] text-foreground/70">
            {transit.fromSign ?? "—"}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--gold)]" strokeWidth={1.8} />
        <div className="min-w-0 text-center">
          <p className="text-[10px] text-muted-foreground">ราศีใหม่</p>
          <p className="thai-heading truncate text-[14px] text-gold">{transit.toSign}</p>
        </div>
        <span aria-hidden className="h-8 w-px shrink-0 bg-[color-mix(in_oklab,var(--gold)_18%,transparent)]" />
        <div className="min-w-0 text-center">
          <p className="text-[10px] text-muted-foreground">ภพของคุณ</p>
          <div className="mt-0.5 flex justify-center">
            <ThaiHouseNumber house={transit.house} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-relaxed text-foreground/85">
        {transit.fromSign
          ? `ดาว${p.th}ย้ายจากราศี${transit.fromSign}เข้าสู่ราศี${transit.toSign} ตกใน${house?.th ?? "ภพ"}ของดวงคุณ `
          : `ดาว${p.th}กำลังโคจรในราศี${transit.toSign} ตกใน${house?.th ?? "ภพ"}ของดวงคุณ `}
        จึงเน้นเรื่อง{house?.about ?? "ชีวิตด้านสำคัญ"} — {p.influence}
      </p>

      <div className="mt-4 flex items-center gap-2 text-[11.5px] text-muted-foreground">
        <CalendarRange className="h-3.5 w-3.5 shrink-0 text-[var(--gold-deep)]" />
        <span>
          {transit.fromSign ? "เข้าราศีในช่วง " : "ตรวจพบตั้งแต่ "}
          {thaiDate(transit.fromDate)}
          {transit.stillAhead ? ` · ยังส่งผลถึง ${thaiDate(transit.untilDate)}` : " · กำลังจะเปลี่ยนอีกครั้ง"}
        </span>
      </div>

      <Link
        to="/transits"
        className="press surface-inset mt-4 flex h-11 items-center justify-center gap-2 text-[13px] font-medium text-foreground"
      >
        ดูผลกระทบทุกภพ
        <ArrowRight className="h-3.5 w-3.5 text-[var(--gold)]" />
      </Link>
    </section>
  );
}