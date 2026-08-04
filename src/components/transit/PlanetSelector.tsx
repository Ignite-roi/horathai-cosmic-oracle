import { PlanetGlyph, ThaiHouseNumber } from "@/components/thai/PlanetGlyph";
import type { PlanetShift } from "@/hooks/useTimeTravel";
import { HOUSES, formatDegree, toThaiDigits, type PlanetId } from "@/lib/astro";

function houseTh(n: number) {
  return HOUSES.find((h) => h.n === n)?.th ?? `ภพที่ ${toThaiDigits(n)}`;
}

/**
 * All nine planets used by the current engine, with the selected planet's
 * measured position on the chosen date.
 */
export function PlanetSelector({
  shifts,
  selected,
  onSelect,
}: {
  shifts: PlanetShift[];
  selected: PlanetId;
  onSelect: (num: PlanetId) => void;
}) {
  const ordered = [...shifts].sort((a, b) => a.num - b.num);
  const active = shifts.find((s) => s.num === selected) ?? ordered[0];

  return (
    <section className="surface-card p-5">
      <p className="eyebrow">Planet focus</p>
      <h2 className="thai-heading mt-1 text-[17px] text-foreground">ดาวพระเคราะห์ทั้ง ๙</h2>
      <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
        ตำแหน่งจากโมเดล Lahiri แบบ versioned deterministic ณ วันที่เลือก
      </p>

      <div
        role="listbox"
        aria-label="เลือกดาว"
        className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-9"
      >
        {ordered.map((s) => {
          const isActive = s.num === active?.num;
          return (
            <button
              key={s.num}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => onSelect(s.num)}
              className={`press flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-colors ${
                isActive ? "border border-primary/35 bg-primary/12" : "border border-transparent"
              }`}
            >
              <PlanetGlyph num={s.num} size={32} active={isActive} />
              <span
                className={`w-full truncate text-center text-[10px] ${
                  isActive ? "text-gold" : "text-muted-foreground"
                }`}
              >
                {s.th}
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="surface-inset mt-4 p-4">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <PlanetGlyph num={active.num} size={44} active />
            <div className="min-w-0">
              <p className="thai-heading text-[15px] text-foreground">ดาว{active.th}</p>
              <p className="numeral mt-0.5 text-[11.5px] text-muted-foreground">
                ราศี{active.to.signTh} {formatDegree(active.to)} · สมผุส{" "}
                {toThaiDigits(active.to.longitude.toFixed(2))}°
              </p>
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
            <div className="surface-inset p-3">
              <dt className="text-muted-foreground">ภพที่สถิต</dt>
              <dd className="mt-1">
                <ThaiHouseNumber house={active.toHouse} label={houseTh(active.toHouse)} />
              </dd>
            </div>
            <div className="surface-inset p-3">
              <dt className="text-muted-foreground">สภาพการโคจร</dt>
              <dd
                className={`mt-1 text-[12.5px] ${active.to.retrograde ? "text-[oklch(0.72_0.17_30)]" : "text-foreground"}`}
              >
                {active.to.retrograde ? "พักร์ (ถอยหลัง)" : "เดินหน้า (มารค)"}
              </dd>
            </div>
          </dl>

          <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
            {active.to.meaning} · ส่งผลด้าน{active.to.influence}
          </p>
        </div>
      )}
    </section>
  );
}
