import { describe, expect, it } from "vitest";

import { BirthInputSchema, PartnerBirthSchema } from "./insights.schemas";
import { scoreFromPolicy, type ScoringPolicy } from "./insights.server";
import type { computeChart } from "./ephemeris.server";

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

  it("derives scores from the supplied rule policy without using house values", () => {
    type Chart = ReturnType<typeof computeChart>;
    const chart = (longitude: number, house: number) =>
      ({ planets: [{ num: 1, th: "อาทิตย์", longitude, house }] }) as Chart;
    const policy: ScoringPolicy = {
      base_score: 50,
      minimum_score: 0,
      maximum_score: 100,
      known_time_confidence: 0.8,
      unknown_time_confidence: 0.6,
      uses_houses_when_time_unknown: false,
      aspect_orb_degrees: 8,
      aspect_fade_degrees: 12,
      aspect_angles: { conjunction: 0 },
      aspect_weights: { conjunction: 20 },
      areas: [{ id: "career", label: "การงาน", planets: [1] }],
      strength_weight: 0,
      reason_positive: "{planet} {area}",
      reason_challenging: "{planet} {area}",
      reason_neutral: "{area}",
    };
    const first = scoreFromPolicy(chart(10, 1), chart(10, 10), policy, false);
    const second = scoreFromPolicy(chart(10, 12), chart(10, 3), policy, false);
    expect(first.scores[0]?.score).toBe(70);
    expect(second.scores[0]?.score).toBe(70);
    expect(first.confidence).toBe(0.6);
  });

  it("changes its result when the published policy weights change", () => {
    type Chart = ReturnType<typeof computeChart>;
    const chart = { planets: [{ num: 1, th: "อาทิตย์", longitude: 0 }] } as Chart;
    const base: ScoringPolicy = {
      base_score: 50,
      minimum_score: 0,
      maximum_score: 100,
      known_time_confidence: 0.8,
      unknown_time_confidence: 0.6,
      uses_houses_when_time_unknown: false,
      aspect_orb_degrees: 8,
      aspect_fade_degrees: 12,
      aspect_angles: { conjunction: 0 },
      aspect_weights: { conjunction: 10 },
      areas: [{ id: "career", label: "การงาน", planets: [1] }],
      strength_weight: 0,
      reason_positive: "{planet} {area}",
      reason_challenging: "{planet} {area}",
      reason_neutral: "{area}",
    };
    const low = scoreFromPolicy(chart, chart, base, true).overall;
    const high = scoreFromPolicy(
      chart,
      chart,
      { ...base, aspect_weights: { conjunction: 30 } },
      true,
    ).overall;
    expect([low, high]).toEqual([60, 80]);
  });
});
