import { createHash } from "node:crypto";

import { CALCULATION_PROFILES, type CalculationProfile } from "../astrology-profiles";
import { calculateNatal, type BirthInput } from "../astrology-engine.server";
import type { CalculatedFact } from "./types";

export type DeterministicFactSheet = {
  calculationProfile: { id: string; version: string };
  facts: CalculatedFact[];
  birthTimeKnown: boolean;
  limitations: string[];
  provenance: {
    engine: string;
    calculationVersion: string;
    ephemerisSource: string;
    houseSystem: string;
    inputHash: string;
  };
};

export async function buildNatalFactSheet(
  input: BirthInput,
  profile: CalculationProfile = CALCULATION_PROFILES.currentLahiri,
): Promise<DeterministicFactSheet> {
  if (
    profile.id !== CALCULATION_PROFILES.currentLahiri.id ||
    profile.version !== CALCULATION_PROFILES.currentLahiri.version ||
    profile.status !== "active"
  ) {
    throw new Error(`Calculation profile is unavailable: ${profile.id}@${profile.version}`);
  }

  const chart = await calculateNatal(input);
  const provenance = `${profile.id}@${profile.version}`;
  const facts: CalculatedFact[] = [
    {
      key: "birth_time_known",
      value: input.birthTimeKnown,
      authority: "calculation_engine",
      provenance,
    },
    ...chart.planets.flatMap((planet) => [
      {
        key: `planet.${planet.num}.longitude`,
        value: Number(planet.longitude.toFixed(6)),
        authority: "calculation_engine" as const,
        provenance,
      },
      {
        key: `planet.${planet.num}.sign_id`,
        value: planet.signId,
        authority: "calculation_engine" as const,
        provenance,
      },
      {
        key: `planet.${planet.num}.retrograde`,
        value: planet.retrograde,
        authority: "calculation_engine" as const,
        provenance,
      },
    ]),
  ];

  if (chart.ascendant) {
    facts.push(
      {
        key: "ascendant.sign_id",
        value: chart.ascendant.signId,
        authority: "calculation_engine",
        provenance,
      },
      {
        key: "ascendant.longitude",
        value: chart.ascendant.siderealLongitude,
        authority: "calculation_engine",
        provenance,
      },
    );
    for (const planet of chart.planets) {
      facts.push({
        key: `planet.${planet.num}.house`,
        value: planet.house,
        authority: "calculation_engine",
        provenance,
      });
    }
  }

  return {
    calculationProfile: { id: profile.id, version: profile.version },
    facts,
    birthTimeKnown: input.birthTimeKnown,
    limitations: input.birthTimeKnown
      ? [...profile.limitations]
      : [
          "ไม่ทราบเวลาเกิด จึงไม่คำนวณลัคนา ภพ ตำแหน่งดาวในภพ หรือกฎที่อาศัยเวลาเกิด",
          ...profile.limitations,
        ],
    provenance: {
      engine: chart.engine,
      calculationVersion: chart.calculationVersion,
      ephemerisSource: chart.ephemerisSource,
      houseSystem: chart.houseSystem,
      inputHash: createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    },
  };
}
