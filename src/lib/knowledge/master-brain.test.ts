import { describe, expect, it } from "vitest";

import { OBSERVED_BENCHMARKS } from "../astrology-benchmarks";
import {
  CALCULATION_PROFILES,
  assertProfilesCompatible,
  type InterpretationProfile,
} from "../astrology-profiles";
import { buildNatalFactSheet } from "./fact-sheet.server";
import { renderThaiNarrative } from "./narrative.server";
import { matchKnowledgeRules } from "./rule-engine.server";
import type { KnowledgeRule, RuleEngineInput } from "./types";

const interpretation: InterpretationProfile = {
  id: "lahiri_natal_th",
  version: "1.0.0",
  calculationProfileId: "sidereal_lahiri",
  calculationProfileVersion: "3.0.0",
  systemId: "sidereal_lahiri",
  systemVersion: "3.0.0",
  releaseId: "brain-test-release",
  locale: "th-TH",
};

const input: RuleEngineInput = {
  system: { id: "sidereal_lahiri", code: "sidereal_lahiri", version: "3.0.0" },
  calculationProfile: { id: "sidereal_lahiri", version: "3.0.0" },
  interpretationProfile: interpretation,
  chartFacts: [
    {
      key: "ascendant.sign_id",
      value: 10,
      authority: "calculation_engine",
      provenance: "sidereal_lahiri@3.0.0",
    },
  ],
};

const rule: KnowledgeRule = {
  id: "rule-1",
  ruleCode: "NATAL-ASC-010",
  systemId: "sidereal_lahiri",
  systemVersion: "3.0.0",
  ruleType: "natal",
  status: "published",
  condition: { "ascendant.sign_id": 10 },
  outcomeId: "outcome-1",
  outcome: { summaryTh: "จังหวะนี้ชวนให้วางแผนอย่างเป็นขั้นตอนและทบทวนภาระที่รับไว้" },
  confidence: 0.75,
  priority: 1,
  limitations: ["เป็นการตีความเชิงสะท้อน"],
  citations: [
    {
      id: "citation-1",
      sourceCode: "TEST-SOURCE",
      sourceTitle: "Test source metadata",
      locator: "section 1",
      supportType: "paraphrase",
    },
  ],
};

describe("Master Astrology Brain foundation", () => {
  it("builds a deterministic fact sheet without network access", async () => {
    const birth = {
      birthDate: "1988-05-05",
      birthTime: "00:00",
      birthTimeKnown: true,
      latitude: 15.8068,
      longitude: 102.0315,
      timezone: "Asia/Bangkok",
    };
    const first = await buildNatalFactSheet(birth);
    const second = await buildNatalFactSheet(birth);
    expect(first.facts).toEqual(second.facts);
    expect(first.provenance.inputHash).toBe(second.provenance.inputHash);
    expect(first.facts.some((fact) => fact.key === "ascendant.sign_id")).toBe(true);
  });

  it("omits ascendant and house facts when birth time is unknown", async () => {
    const sheet = await buildNatalFactSheet({
      birthDate: "1988-05-05",
      birthTime: "12:00",
      birthTimeKnown: false,
      latitude: 15.8068,
      longitude: 102.0315,
      timezone: "Asia/Bangkok",
    });
    expect(sheet.facts.some((fact) => fact.key.startsWith("ascendant."))).toBe(false);
    expect(sheet.facts.some((fact) => fact.key.endsWith(".house"))).toBe(false);
    expect(sheet.limitations.join(" ")).toContain("ไม่ทราบเวลาเกิด");
  });

  it("fails closed when profiles are silently mixed", () => {
    expect(() =>
      assertProfilesCompatible(CALCULATION_PROFILES.currentLahiri, {
        ...interpretation,
        systemId: "thai_suriyayatra",
      }),
    ).toThrow(/do not match/);
    expect(() =>
      matchKnowledgeRules(
        {
          ...input,
          interpretationProfile: { ...input.interpretationProfile, systemVersion: "2.0.0" },
        },
        [rule],
      ),
    ).toThrow(/do not match/);
  });

  it("excludes unpublished and uncited rules from production output", () => {
    const result = matchKnowledgeRules(input, [
      rule,
      { ...rule, id: "draft", status: "draft" },
      { ...rule, id: "uncited", citations: [] },
    ]);
    expect(result.matches.map((match) => match.ruleId)).toEqual(["rule-1"]);
    expect(result.matches[0]).toMatchObject({
      outcomeId: "outcome-1",
      releaseId: "brain-test-release",
      systemVersion: "3.0.0",
    });
  });

  it("renders original deterministic Thai templates from traces", () => {
    const matches = matchKnowledgeRules(input, [rule]).matches;
    const narrative = renderThaiNarrative(matches, [rule]);
    expect(narrative.renderer).toBe("horathai_template_th_v1");
    expect(narrative.summary).toContain("วางแผนอย่างเป็นขั้นตอน");
    expect(narrative.trace[0]?.citations).toHaveLength(1);
  });

  it("keeps the competitor fixture observational and proves no input special-case", async () => {
    const observed = OBSERVED_BENCHMARKS.find((item) => item.source === "competitor");
    expect(observed).toMatchObject({ status: "observed", usableAsTruthFixture: false });
    const base = await buildNatalFactSheet({
      birthDate: "1988-05-05",
      birthTime: "00:00",
      birthTimeKnown: true,
      latitude: 15.8068,
      longitude: 102.0315,
      timezone: "Asia/Bangkok",
    });
    const neighborTime = await buildNatalFactSheet({
      birthDate: "1988-05-05",
      birthTime: "00:01",
      birthTimeKnown: true,
      latitude: 15.8068,
      longitude: 102.0315,
      timezone: "Asia/Bangkok",
    });
    const neighborLocation = await buildNatalFactSheet({
      birthDate: "1988-05-05",
      birthTime: "00:00",
      birthTimeKnown: true,
      latitude: 15.9,
      longitude: 102.2,
      timezone: "Asia/Bangkok",
    });
    const ascendant = (sheet: typeof base) =>
      sheet.facts.find((fact) => fact.key === "ascendant.longitude")?.value;
    expect(ascendant(base)).not.toBe(ascendant(neighborTime));
    expect(ascendant(base)).not.toBe(ascendant(neighborLocation));
  });
});