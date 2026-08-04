import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { CivilTimeSchema, formatThaiTime, parseCivilTime, toCivilTime } from "./civil-time";

describe("Thai 24-hour civil time", () => {
  it.each(["00:00", "08:05", "12:00", "23:59"])("accepts and round-trips %s", (value) => {
    expect(CivilTimeSchema.parse(value)).toBe(value);
    const parsed = parseCivilTime(value);
    expect(toCivilTime(parsed.hour, parsed.minute)).toBe(value);
  });

  it.each(["12:00 AM", "08:05 PM", "24:00"])("rejects %s", (value) => {
    expect(CivilTimeSchema.safeParse(value).success).toBe(false);
  });

  it("formats midnight, noon and late evening without a day period", () => {
    expect(formatThaiTime("2026-08-04T17:00:00.000Z")).toBe("00:00");
    expect(formatThaiTime("2026-08-05T05:00:00.000Z")).toBe("12:00");
    expect(formatThaiTime("2026-08-05T16:59:00.000Z")).toBe("23:59");
  });

  it("keeps user time surfaces free of native time inputs and day-period labels", () => {
    const files = [
      "src/routes/_authenticated/onboarding.tsx",
      "src/routes/_authenticated/compat.tsx",
      "src/components/Time24Field.tsx",
    ];
    const source = files.map((file) => readFileSync(resolve(file), "utf8")).join("\n");
    expect(source).not.toMatch(/type=["']time["']/);
    expect(source).not.toMatch(/\b(?:AM|PM)\b/);
  });
});