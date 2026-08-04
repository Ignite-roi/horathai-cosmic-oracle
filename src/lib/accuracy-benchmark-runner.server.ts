import {
  ACCURACY_BENCHMARK_MANIFEST,
  APPROVED_ACCEPTANCE_THRESHOLDS,
  type AccuracyBenchmarkCase,
  type IndependentExpected,
} from "./accuracy-benchmark-manifest";
import { ascendantDetail, ayanamsa, computeChart, julianDay } from "./ephemeris.server";
import { zonedWallClockToUtc } from "./timezone";

type Difference<T> = {
  actual: T;
  expected: T | null;
  delta: number | null;
  outcome: "not_evaluated" | "match" | "mismatch";
};

export type AccuracyBenchmarkResult = {
  caseId: string;
  kind: "natal" | "transit";
  status: "observed" | "unverified" | "validated";
  actual: {
    utcInstant: string;
    planets: ReadonlyArray<{
      planetId: number;
      tropicalLongitude: number;
      siderealLongitude: number;
      signId: number;
      degree: number;
      minute: number;
      retrograde: boolean;
      house: number | null;
    }>;
    ascendant: {
      tropicalLongitude: number;
      siderealLongitude: number;
      signId: number;
      degree: number;
      minute: number;
    } | null;
  };
  discrepancies: {
    utcInstantSeconds: Difference<number>;
    ascendantLongitude: Difference<number | null>;
    planets: ReadonlyArray<{
      planetId: number;
      longitude: Difference<number>;
      sign: Difference<number>;
      degree: Difference<number>;
      minute: Difference<number>;
      retrograde: Difference<boolean>;
      house: Difference<number | null>;
    }>;
  };
  evidenceReady: boolean;
};

function circularDelta(actual: number, expected: number): number {
  const raw = Math.abs(actual - expected) % 360;
  return Math.min(raw, 360 - raw);
}

function difference<T>(actual: T, expected: T | null, delta: number | null = null): Difference<T> {
  if (expected === null) return { actual, expected, delta: null, outcome: "not_evaluated" };
  return { actual, expected, delta, outcome: Object.is(actual, expected) ? "match" : "mismatch" };
}

function hasIndependentEvidence(item: AccuracyBenchmarkCase): boolean {
  const expected = item.independentExpected;
  return Boolean(
    item.status === "validated" &&
      item.evidence.source &&
      item.evidence.reference &&
      item.evidence.reviewedBy &&
      item.evidence.reviewedAt &&
      expected.utcInstant &&
      expected.planets,
  );
}

export function assertValidatedFixtureIsUsable(item: AccuracyBenchmarkCase): void {
  if (item.status !== "validated") return;
  if (!APPROVED_ACCEPTANCE_THRESHOLDS) {
    throw new Error("Validated fixture blocked: acceptance thresholds are not approved");
  }
  if (!hasIndependentEvidence(item)) {
    throw new Error("Validated fixture blocked: independent evidence is incomplete");
  }
}

function expectedPlanet(expected: IndependentExpected, planetId: number) {
  return expected.planets?.find((planet) => planet.planetId === planetId) ?? null;
}

export function runAccuracyBenchmark(item: AccuracyBenchmarkCase): AccuracyBenchmarkResult {
  assertValidatedFixtureIsUsable(item);
  const natalUtc = zonedWallClockToUtc(item.input.localDate, item.input.localTime, item.input.timezone);
  const calculationInstant = item.kind === "transit" ? new Date(item.input.transitAt ?? "") : natalUtc;
  if (Number.isNaN(calculationInstant.getTime())) throw new Error(`Invalid transit instant: ${item.id}`);
  const chart = computeChart(calculationInstant, item.input.latitude, item.input.longitude);
  const exactAyanamsa = ayanamsa(julianDay(calculationInstant));
  const asc = item.input.birthTimeKnown
    ? ascendantDetail(calculationInstant, item.input.latitude, item.input.longitude)
    : null;
  const expected = item.independentExpected;
  const actualPlanets = chart.planets.map((planet) => ({
    planetId: planet.num,
    tropicalLongitude: (planet.longitude + exactAyanamsa + 360) % 360,
    siderealLongitude: planet.longitude,
    signId: planet.signId,
    degree: planet.degree,
    minute: planet.minute,
    retrograde: planet.retrograde,
    house: item.input.birthTimeKnown ? planet.house : null,
  }));
  const actualUtcMs = calculationInstant.getTime();
  const expectedUtcMs = expected.utcInstant ? new Date(expected.utcInstant).getTime() : null;

  return {
    caseId: item.id,
    kind: item.kind,
    status: item.status,
    actual: {
      utcInstant: calculationInstant.toISOString(),
      planets: actualPlanets,
      ascendant: asc
        ? {
            tropicalLongitude: asc.tropicalLongitude,
            siderealLongitude: asc.siderealLongitude,
            signId: asc.signId,
            degree: asc.degree,
            minute: asc.minute,
          }
        : null,
    },
    discrepancies: {
      utcInstantSeconds: difference(
        actualUtcMs / 1000,
        expectedUtcMs === null ? null : expectedUtcMs / 1000,
        expectedUtcMs === null ? null : Math.abs(actualUtcMs - expectedUtcMs) / 1000,
      ),
      ascendantLongitude: difference(
        asc?.siderealLongitude ?? null,
        expected.ascendant?.longitude ?? null,
        asc && expected.ascendant ? circularDelta(asc.siderealLongitude, expected.ascendant.longitude) : null,
      ),
      planets: actualPlanets.map((planet) => {
        const reference = expectedPlanet(expected, planet.planetId);
        return {
          planetId: planet.planetId,
          longitude: difference(
            planet.siderealLongitude,
            reference?.longitude ?? null,
            reference ? circularDelta(planet.siderealLongitude, reference.longitude) : null,
          ),
          sign: difference(planet.signId, reference?.signId ?? null),
          degree: difference(planet.degree, reference?.degree ?? null),
          minute: difference(planet.minute, reference?.minute ?? null),
          retrograde: difference(planet.retrograde, reference?.retrograde ?? null),
          house: difference(planet.house, reference?.house ?? null),
        };
      }),
    },
    evidenceReady: hasIndependentEvidence(item),
  };
}

export function runAccuracyBenchmarkManifest(
  manifest: readonly AccuracyBenchmarkCase[] = ACCURACY_BENCHMARK_MANIFEST,
): readonly AccuracyBenchmarkResult[] {
  return [...manifest]
    .sort((left, right) => left.id.localeCompare(right.id, "en"))
    .map(runAccuracyBenchmark);
}

export function summarizeAccuracyReadiness(results: readonly AccuracyBenchmarkResult[]) {
  return {
    total: results.length,
    observed: results.filter((item) => item.status === "observed").length,
    unverified: results.filter((item) => item.status === "unverified").length,
    validated: results.filter((item) => item.status === "validated").length,
    evidenceReady: results.filter((item) => item.evidenceReady).length,
    independentlyEvaluated: results.filter(
      (item) => item.discrepancies.utcInstantSeconds.outcome !== "not_evaluated",
    ).length,
  };
}