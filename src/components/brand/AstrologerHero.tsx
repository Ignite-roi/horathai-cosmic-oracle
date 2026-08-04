import astrologer from "@/assets/astrologer-master.png.asset.json";

/**
 * The official Horathai AI astrologer. Immutable brand asset — this exact
 * portrait is always used; it is never regenerated or replaced.
 *
 * Framing rule: the face sits in the upper-middle of the source image, so
 * every variant anchors around `50% 22%` and keeps forehead, eyes and chin
 * fully inside the frame down to 320px.
 */

type Variant = "avatar" | "bust" | "hero";

const FRAME: Record<Variant, { ratio: string; position: string; scale: string }> = {
  avatar: { ratio: "1 / 1", position: "50% 20%", scale: "175%" },
  bust: { ratio: "1 / 1", position: "50% 21%", scale: "150%" },
  hero: { ratio: "3 / 4", position: "50% 24%", scale: "128%" },
};

export function AstrologerHero({
  variant = "hero",
  className = "",
  priority = false,
  ring = true,
}: {
  variant?: Variant;
  className?: string;
  priority?: boolean;
  ring?: boolean;
}) {
  const frame = FRAME[variant];
  const rounded = variant === "hero" ? "rounded-[26px]" : "rounded-full";

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${className}`}
      style={{ aspectRatio: frame.ratio }}
    >
      <img
        src={astrologer.url}
        alt="โหราจารย์ประจำ Horathai AI"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
        className="h-full w-full object-cover"
        style={{ objectPosition: frame.position, transform: `scale(${frame.scale})`, transformOrigin: frame.position }}
      />
      {/* warm key light from the top-right, matching the global light direction */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 60% at 88% 2%, color-mix(in oklab, var(--ember) 22%, transparent), transparent 62%)",
        }}
      />
      {/* bottom fade so overlaid text always keeps contrast */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: "linear-gradient(to top, oklch(0.03 0.01 285 / 92%), transparent)" }}
      />
      {ring && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${rounded}`}
          style={{
            border: "1px solid color-mix(in oklab, var(--gold) 34%, transparent)",
            boxShadow: "inset 0 1px 0 color-mix(in oklab, var(--gold-hot) 22%, transparent)",
          }}
        />
      )}
    </div>
  );
}