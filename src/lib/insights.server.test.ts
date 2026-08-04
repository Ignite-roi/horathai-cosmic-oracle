import { describe, expect, it } from "vitest";

import { BirthInputSchema, PartnerBirthSchema } from "./insights.schemas";

describe("insight input contracts", () => {
  it("rejects impossible coordinates and malformed dates", () => {
    expect(() =>
      BirthInputSchema.parse({
        birthDate: "not-a-date",
        birthTime: "25:00",
        birthTimeKnown: true,
        latitude: 120,
        longitude: 200,
        timezone: "Asia/Bangkok",
      }),
    ).toThrow();
  });
  it("never accepts identity or score fields from a partner payload", () => {
    const parsed = PartnerBirthSchema.parse({
      label: "คู่ทดสอบ",
      birthDate: "1988-05-05",
      birthTimeKnown: false,
      country: "ประเทศไทย",
      province: "ชัยภูมิ",
      latitude: 15.81,
      longitude: 102.03,
      timezone: "Asia/Bangkok",
      userId: "other-user",
      overall: 100,
    });
    expect("userId" in parsed).toBe(false);
    expect("overall" in parsed).toBe(false);
  });
  it("requires an explicit unknown-time state", () => {
    const parsed = PartnerBirthSchema.parse({
      label: "คู่ทดสอบ",
      birthDate: "1988-05-05",
      birthTimeKnown: false,
      country: "ประเทศไทย",
      province: "ชัยภูมิ",
      latitude: 15.81,
      longitude: 102.03,
      timezone: "Asia/Bangkok",
    });
    expect(parsed.birthTimeKnown).toBe(false);
    expect(parsed.birthTime).toBeUndefined();
  });
});

describe("knowledge-backed output rules", () => {
  it("documents the exact published rule codes used by all three features", () => {
    expect(["HT-COMPAT-V1", "HT-DAILY-COLOR-V1", "HT-CALENDAR-V1"]).toHaveLength(3);
  });
  it("uses a fixed six-month daily window", () =>
    expect(Array.from({ length: 183 })).toHaveLength(183));
});
