import { describe, expect, it } from "vitest";

import {
  ACCURACY_BENCHMARK_MANIFEST,
  APPROVED_ACCEPTANCE_THRESHOLDS,
  PROPOSED_ACCEPTANCE_THRESHOLDS,
  type AccuracyBenchmarkCase,
} from "./accuracy-benchmark-manifest";
import {
  assertValidatedFixtureIsUsable,
  runAccuracyBenchmarkManifest,
  summarizeAccuracyReadiness,
} from "./accuracy-benchmark-runner.server";
import { OBSERVED_BENCHMARKS } from "./astrology-benchmarks";
import { CivilTimeSchema } from "./civil-time";

describe("P1.1 astrology accuracy benchmark foundation", () => {
  it("covers at least 40 deterministic natal/transit inputs", () => {
    expect(ACCURACY_BENCHMARK_MANIFEST.length).toBeGreaterThanOrEqual(40);
    expect(ACCURACY_BENCHMARK_MANIFEST.some((item) => item.kind === "natal")).toBe(true);
    expect(ACCURACY_BENCHMARK_MANIFEST.some((item) => item.kind === "transit")).toBe(true);
  });

  it("contains no fabricated independent expected values", () => {
    for (const item of ACCURACY_BENCHMARK_MANIFEST) {
      expect(item.status).toBe("unverified");
      expect(item.independentExpected).toEqual({ utcInstant: null, ascendant: null, planets: null });
      expect(item.evidence).toEqual({
        source: null,
        reference: null,
        reviewedBy: null,
        reviewedAt: null,
      });
    }
  });

  it("never promotes observed competitor output to a truth fixture", () => {
    for (const item of OBSERVED_BENCHMARKS.filter((benchmark) => benchmark.source === "competitor")) {
      expect(item.status).toBe("observed");
      expect(item.usableAsTruthFixture).toBe(false);
    }
  });

  it("keeps proposals separate and fails closed without approved thresholds", () => {
    expect(PROPOSED_ACCEPTANCE_THRESHOLDS.longitudeDegrees).toBeGreaterThan(0);
    expect(APPROVED_ACCEPTANCE_THRESHOLDS).toBeNull();
    const firstCase = ACCURACY_BENCHMARK_MANIFEST[0];
    if (!firstCase) throw new Error("Benchmark manifest must not be empty");
    const invalidValidated = {
      ...firstCase,
      status: "validated",
    } as AccuracyBenchmarkCase;
    expect(() => assertValidatedFixtureIsUsable(invalidValidated)).toThrow(/not approved/);
  });

  it("omits ascendant and houses for unknown birth time", () => {
    const results = runAccuracyBenchmarkManifest(
      ACCURACY_BENCHMARK_MANIFEST.filter((item) => !item.input.birthTimeKnown),
    );
    expect(results.length).toBeGreaterThan(0);
    for (const result of results) {
      expect(result.actual.ascendant).toBeNull();
      expect(result.actual.planets.every((planet) => planet.house === null)).toBe(true);
    }
  });

  it("is invariant to input order and reports unevaluated external discrepancies", () => {
    const forward = runAccuracyBenchmarkManifest();
    const reverse = runAccuracyBenchmarkManifest([...ACCURACY_BENCHMARK_MANIFEST].reverse());
    expect(reverse).toEqual(forward);
    expect(forward.every((item) => item.discrepancies.utcInstantSeconds.outcome === "not_evaluated")).toBe(
      true,
    );
    expect(summarizeAccuracyReadiness(forward)).toEqual({
      total: ACCURACY_BENCHMARK_MANIFEST.length,
      observed: 0,
      unverified: ACCURACY_BENCHMARK_MANIFEST.length,
      validated: 0,
      evidenceReady: 0,
      independentlyEvaluated: 0,
    });
  });

  it("preserves strict 24-hour civil time", () => {
    for (const item of ACCURACY_BENCHMARK_MANIFEST) {
      expect(CivilTimeSchema.parse(item.input.localTime)).toBe(item.input.localTime);
    }
    expect(CivilTimeSchema.safeParse("24:00").success).toBe(false);
    expect(CivilTimeSchema.safeParse("12:00 PM").success).toBe(false);
  });
});