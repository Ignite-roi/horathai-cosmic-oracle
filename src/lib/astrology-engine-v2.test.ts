import { describe, expect, it } from "vitest";

import { calculateNatal } from "./astrology-engine.server";
import { computeChart, normalizeLongitudePosition } from "./ephemeris.server";
import { zonedWallClockToUtc } from "./timezone";

const PLACE = { latitude: 15.8068, longitude: 102.0315 };

describe("versioned deterministic Lahiri calculation contracts", () => {
  it("handles historical timezone offsets and DST deterministically", () => {
    expect(zonedWallClockToUtc("1988-05-05", "00:00", "Asia/Bangkok").toISOString()).toBe(
      "1988-05-04T17:00:00.000Z",
    );
    expect(zonedWallClockToUtc("2024-07-01", "12:00", "America/New_York").toISOString()).toBe(
      "2024-07-01T16:00:00.000Z",
    );
    expect(zonedWallClockToUtc("2024-01-01", "12:00", "America/New_York").toISOString()).toBe(
      "2024-01-01T17:00:00.000Z",
    );
  });

  it("returns planets only when birth time is unknown", async () => {
    const result = await calculateNatal({
      birthDate: "1988-05-05",
      birthTime: "12:00",
      birthTimeKnown: false,
      ...PLACE,
      timezone: "Asia/Bangkok",
    });
    expect(result.planets).toHaveLength(9);
    expect(result.ascendant).toBeNull();
    expect(result.houses).toEqual([]);
  });

  it("detects deterministic retrograde motion", () => {
    const chart = computeChart(new Date("1988-05-04T17:00:00Z"), PLACE.latitude, PLACE.longitude);
    expect(chart.planets.find((planet) => planet.num === 7)?.retrograde).toBe(true);
    expect(chart.planets.find((planet) => planet.num === 1)?.retrograde).toBe(false);
  });

  it("normalizes sign boundaries without producing 30-degree positions", () => {
    for (let day = 0; day < 40; day += 1) {
      const chart = computeChart(
        new Date(Date.UTC(2025, 0, 1 + day)),
        PLACE.latitude,
        PLACE.longitude,
      );
      for (const planet of chart.planets) {
        expect(planet.longitude).toBeGreaterThanOrEqual(0);
        expect(planet.longitude).toBeLessThan(360);
        expect(planet.degree).toBeGreaterThanOrEqual(0);
        expect(planet.degree).toBeLessThan(30);
        expect(planet.minute).toBeGreaterThanOrEqual(0);
        expect(planet.minute).toBeLessThan(60);
      }
    }
  });

  it("carries rounded minutes across sign and zodiac boundaries", () => {
    expect(normalizeLongitudePosition(29 + 59.5 / 60)).toEqual({
      signIndex: 1,
      degree: 0,
      minute: 0,
    });
    expect(normalizeLongitudePosition(359 + 59.5 / 60)).toEqual({
      signIndex: 0,
      degree: 0,
      minute: 0,
    });
    expect(normalizeLongitudePosition(29 + 59.49 / 60)).toEqual({
      signIndex: 0,
      degree: 29,
      minute: 59,
    });
  });

  it("stamps one canonical provenance on natal and transit facts", () => {
    const natal = computeChart(new Date("1988-05-04T17:00:00Z"), PLACE.latitude, PLACE.longitude);
    const transit = computeChart(new Date("2026-08-04T00:00:00Z"), PLACE.latitude, PLACE.longitude);
    expect(natal.engine).toBe(transit.engine);
    expect(natal.calculationVersion).toBe(transit.calculationVersion);
    expect(natal.ephemerisSource).toBe(transit.ephemerisSource);
    expect(natal.houseSystem).toBe("whole_sign");
  });
});
