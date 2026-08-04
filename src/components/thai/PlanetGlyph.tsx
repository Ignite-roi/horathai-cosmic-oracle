import { PLANET_BY_NUM, type PlanetId } from "@/lib/astro";

/**
 * Thai planet presentation: the planet's Thai numeral (๑–๙) set inside a
 * gold-rimmed disc tinted with the planet's own colour.
 */
export function PlanetGlyph({
  num,
  size = 44,
  active = false,
  className = "",
}: {
  num: PlanetId;
  size?: number;
  active?: boolean;
  className?: string;
}) {
  const planet = PLANET_BY_NUM.get(num);
  if (!planet) return null;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 26%, color-mix(in oklab, ${planet.color} 42%, transparent), oklch(0.06 0.02 285) 72%)`,
        border: `1px solid color-mix(in oklab, ${planet.color} 46%, transparent)`,
        boxShadow: active
          ? `0 0 0 1px color-mix(in oklab, var(--gold) 34%, transparent), 0 0 22px -4px ${planet.color}`
          : `inset 0 1px 0 oklch(1 0 0 / 12%)`,
      }}
      aria-label={`ดาว${planet.th}`}
    >
      <span
        className="numeral leading-none"
        style={{ fontSize: size * 0.42, color: planet.color, textShadow: `0 0 10px ${planet.color}66` }}
      >
        {planet.thaiNumeral}
      </span>
    </span>
  );
}

const THAI_NUM = ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙", "๑๐", "๑๑", "๑๒"];

/** House number badge using Thai numerals (ภพ ๑–๑๒). */
export function ThaiHouseNumber({ house, label }: { house: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="gold-hairline relative flex h-7 min-w-7 items-center justify-center rounded-[9px] px-1.5">
        <span className="numeral text-[13px] leading-none text-[var(--gold)]">
          {THAI_NUM[house] ?? house}
        </span>
      </span>
      {label && <span className="text-[12px] text-foreground/80">{label}</span>}
    </span>
  );
}