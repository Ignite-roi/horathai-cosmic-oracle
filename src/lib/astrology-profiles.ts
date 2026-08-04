export type CalculationProfileStatus = "active" | "experimental" | "planned_unimplemented";

export type CalculationProfile = {
  id: string;
  version: string;
  label: string;
  status: CalculationProfileStatus;
  zodiac: "sidereal" | "tropical" | "unimplemented";
  ayanamsa: string | null;
  nodeType: "mean" | "true" | "unimplemented";
  houseSystem: "whole_sign" | "unimplemented";
  implementation: "current_lahiri" | "competitor_research" | "thai_suriyayatra";
  limitations: string[];
};

export type InterpretationProfile = {
  id: string;
  version: string;
  calculationProfileId: string;
  calculationProfileVersion: string;
  systemId: string;
  systemVersion: string;
  releaseId: string;
  locale: "th-TH";
};

export const CALCULATION_PROFILES = {
  currentLahiri: {
    id: "sidereal_lahiri",
    version: "3.0.0",
    label: "versioned deterministic Lahiri model",
    status: "active",
    zodiac: "sidereal",
    ayanamsa: "lahiri_polynomial_v1",
    nodeType: "mean",
    houseSystem: "whole_sign",
    implementation: "current_lahiri",
    limitations: ["Independent Swiss/JPL multi-epoch benchmark is pending"],
  },
  competitorExperimental: {
    id: "competitor_compatible_experimental",
    version: "0.0.0-observation.1",
    label: "Experimental competitor-compatibility research profile",
    status: "experimental",
    zodiac: "unimplemented",
    ayanamsa: null,
    nodeType: "unimplemented",
    houseSystem: "unimplemented",
    implementation: "competitor_research",
    limitations: [
      "Observed outputs are not proof of method or correctness",
      "Calculation is not implemented",
    ],
  },
  thaiSuriyayatraPlanned: {
    id: "thai_suriyayatra",
    version: "0.0.0-planned",
    label: "Thai Suriyayatra planned profile",
    status: "planned_unimplemented",
    zodiac: "unimplemented",
    ayanamsa: null,
    nodeType: "unimplemented",
    houseSystem: "unimplemented",
    implementation: "thai_suriyayatra",
    limitations: ["Requires reviewed formulas, source citations, expert review, and benchmarks"],
  },
} as const satisfies Record<string, CalculationProfile>;

export function assertProfilesCompatible(
  calculation: CalculationProfile,
  interpretation: InterpretationProfile,
): void {
  if (
    interpretation.calculationProfileId !== calculation.id ||
    interpretation.calculationProfileVersion !== calculation.version ||
    interpretation.systemId !== calculation.id ||
    interpretation.systemVersion !== calculation.version
  ) {
    throw new Error("Calculation and interpretation profiles do not match");
  }
  if (calculation.status !== "active") {
    throw new Error(`Calculation profile is not active: ${calculation.id}@${calculation.version}`);
  }
}
