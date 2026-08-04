const STATIC_FACT_KEYS = [
  "birth.time_known",
  "ascendant.sign_id",
  "ascendant.longitude",
  "transit.aspect.type",
  "transit.planet.retrograde",
] as const;

export type StaticFactKey = (typeof STATIC_FACT_KEYS)[number];
export type CanonicalFactKey =
  | StaticFactKey
  | `planet.${number}.longitude`
  | `planet.${number}.sign_id`
  | `planet.${number}.retrograde`
  | `planet.${number}.house`;

const DYNAMIC_FACT_PATTERN = /^planet\.(?:[0-9]|10)\.(?:longitude|sign_id|retrograde|house)$/;

export function isCanonicalFactKey(value: string): value is CanonicalFactKey {
  return (STATIC_FACT_KEYS as readonly string[]).includes(value) || DYNAMIC_FACT_PATTERN.test(value);
}

export function factRequiresKnownBirthTime(value: CanonicalFactKey): boolean {
  return value.startsWith("ascendant.") || value.endsWith(".house");
}

export function assertCanonicalFactKey(value: string): asserts value is CanonicalFactKey {
  if (!isCanonicalFactKey(value)) throw new Error(`Unknown canonical fact key: ${value}`);
}