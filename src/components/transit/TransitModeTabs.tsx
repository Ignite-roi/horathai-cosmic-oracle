import { motion } from "framer-motion";

export type TransitMode = "overview" | "planets" | "houses" | "scores";

export const TRANSIT_MODES: { id: TransitMode; th: string }[] = [
  { id: "overview", th: "ภาพรวม" },
  { id: "planets", th: "ดาวย้าย" },
  { id: "houses", th: "ภพที่ได้รับผล" },
  { id: "scores", th: "คะแนนชีวิต" },
];

/** Segmented control for the four transit reading modes. */
export function TransitModeTabs({
  value,
  onChange,
}: {
  value: TransitMode;
  onChange: (mode: TransitMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="มุมมองดาวย้าย"
      className="surface-inset grid grid-cols-4 gap-1 p-1"
    >
      {TRANSIT_MODES.map((m) => {
        const active = m.id === value;
        return (
          <button
            key={m.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(m.id)}
            className="press relative min-w-0 rounded-[14px] px-1 py-2 text-[11.5px] transition-colors"
          >
            {active && (
              <motion.span
                layoutId="transit-mode-pill"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-[14px] border border-primary/30 bg-primary/12"
              />
            )}
            <span className={`relative block truncate ${active ? "text-gold" : "text-muted-foreground"}`}>
              {m.th}
            </span>
          </button>
        );
      })}
    </div>
  );
}