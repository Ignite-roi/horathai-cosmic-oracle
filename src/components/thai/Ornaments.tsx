/**
 * Original Thai-inspired decorative primitives (kanok / lai-thai vocabulary),
 * drawn from scratch as low-opacity SVG. Purely presentational.
 */

export function KanokCorner({
  className = "",
  position = "tr",
  size = 86,
  opacity = 0.3,
}: {
  className?: string;
  position?: "tl" | "tr" | "bl" | "br";
  size?: number;
  opacity?: number;
}) {
  const flip = {
    tl: "none",
    tr: "scaleX(-1)",
    bl: "scaleY(-1)",
    br: "scale(-1,-1)",
  }[position];
  const anchor = {
    tl: "left-0 top-0",
    tr: "right-0 top-0",
    bl: "bottom-0 left-0",
    br: "bottom-0 right-0",
  }[position];

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ transform: flip, opacity }}
      className={`pointer-events-none absolute ${anchor} ${className}`}
      fill="none"
    >
      <path
        d="M4 4 L4 40 C4 22 18 8 38 6 L64 4"
        stroke="var(--gold)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M10 12 C26 12 34 20 36 34 C38 22 46 15 58 14"
        stroke="var(--gold)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M12 26 C20 27 24 32 25 40 C27 33 31 29 38 28"
        stroke="var(--gold-soft)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
      <path d="M14 40 C17 41 19 45 19 50" stroke="var(--gold-soft)" strokeWidth="0.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.6" fill="var(--gold)" />
      <circle cx="44" cy="7" r="1" fill="var(--gold-soft)" />
    </svg>
  );
}

/** Thin celestial divider: a lai-thai flourish framing a small star. */
export function CelestialDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex w-full items-center justify-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-[color-mix(in_oklab,var(--gold)_34%,transparent)]" />
      <svg viewBox="0 0 60 16" width="72" height="18" fill="none" className="shrink-0 opacity-70">
        <path d="M2 8 C10 8 12 3 16 3 C13 6 14 8 18 8 C14 8 13 10 16 13 C12 13 10 8 2 8Z" fill="var(--gold-deep)" />
        <path d="M58 8 C50 8 48 3 44 3 C47 6 46 8 42 8 C46 8 47 10 44 13 C48 13 50 8 58 8Z" fill="var(--gold-deep)" />
        <path d="M30 1 L31.8 6.2 L37 8 L31.8 9.8 L30 15 L28.2 9.8 L23 8 L28.2 6.2 Z" fill="var(--gold)" />
      </svg>
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-[color-mix(in_oklab,var(--gold)_34%,transparent)]" />
    </div>
  );
}

/** Corner tick marks used to frame astrology panels. */
export function ThaiFrame({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {(["tl", "tr", "bl", "br"] as const).map((c) => (
        <span
          key={c}
          className={`absolute h-4 w-4 border-[color-mix(in_oklab,var(--gold)_38%,transparent)] ${
            c === "tl"
              ? "left-2.5 top-2.5 border-l border-t rounded-tl-md"
              : c === "tr"
                ? "right-2.5 top-2.5 border-r border-t rounded-tr-md"
                : c === "bl"
                  ? "bottom-2.5 left-2.5 border-b border-l rounded-bl-md"
                  : "bottom-2.5 right-2.5 border-b border-r rounded-br-md"
          }`}
        />
      ))}
    </div>
  );
}