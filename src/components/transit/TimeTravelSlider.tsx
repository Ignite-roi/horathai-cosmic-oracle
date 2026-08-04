import { Loader2, RotateCcw } from "lucide-react";
import { useId } from "react";

import { MAX_OFFSET, MIN_OFFSET, dateAt } from "@/hooks/useTimeTravel";
import { thaiDate, toThaiDigits } from "@/lib/astro";

const JUMPS: { value: number; th: string }[] = [
  { value: -45, th: "-๔๕ วัน" },
  { value: -7, th: "-๗ วัน" },
  { value: 0, th: "วันนี้" },
  { value: 7, th: "+๗ วัน" },
  { value: 45, th: "+๔๕ วัน" },
];

function offsetLabel(offset: number) {
  if (offset === 0) return "ปัจจุบัน";
  return `${offset > 0 ? "อีก" : "ย้อนหลัง"} ${toThaiDigits(Math.abs(offset))} วัน`;
}

/**
 * Gold rail with a draggable orb handle. Built on a native range input so it
 * stays keyboard accessible (arrows / Home / End) and touch friendly inside
 * the LINE WebView.
 */
export function TimeTravelSlider({
  offset,
  onChange,
  syncing,
}: {
  offset: number;
  onChange: (offset: number) => void;
  syncing: boolean;
}) {
  const id = useId();
  const date = dateAt(offset);
  const percent = ((offset - MIN_OFFSET) / (MAX_OFFSET - MIN_OFFSET)) * 100;

  return (
    <section className="surface-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Time travel</p>
          <p className="numeral mt-1 truncate text-[17px] text-gold">{thaiDate(date)}</p>
          <p className="numeral mt-0.5 text-[11px] text-muted-foreground">{offsetLabel(offset)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {syncing && <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--gold)]" />}
          {offset !== 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="press gold-hairline flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] text-foreground/85"
            >
              <RotateCcw className="h-3 w-3" /> วันนี้
            </button>
          )}
        </div>
      </div>

      <div className="time-rail relative mt-5">
        <span aria-hidden className="time-rail-track" />
        <span aria-hidden className="time-rail-fill" style={{ width: `${percent}%` }} />
        <input
          id={id}
          type="range"
          min={MIN_OFFSET}
          max={MAX_OFFSET}
          step={1}
          value={offset}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="เลื่อนเวลาเพื่อดูตำแหน่งดาว"
          aria-valuetext={`${thaiDate(date)} (${offsetLabel(offset)})`}
          className="time-rail-input"
        />
      </div>

      <div className="numeral mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>ย้อน ๑๘๐ วัน</span>
        <span>วันนี้</span>
        <span>อีก ๓๖๕ วัน</span>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {JUMPS.map((j) => {
          const active = offset === j.value;
          return (
            <button
              key={j.value}
              type="button"
              onClick={() => onChange(j.value)}
              aria-pressed={active}
              className={`press numeral min-w-0 truncate rounded-full px-1 py-2 text-[10.5px] transition-colors ${
                active
                  ? "border border-primary/40 bg-primary/15 text-gold"
                  : "surface-inset text-muted-foreground"
              }`}
            >
              {j.th}
            </button>
          );
        })}
      </div>
    </section>
  );
}
