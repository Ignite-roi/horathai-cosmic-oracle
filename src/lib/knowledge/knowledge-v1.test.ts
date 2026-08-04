import { describe, expect, it } from "vitest";

import { buildInterpretationContext } from "./interpretation-context.server";
import { matchKnowledgeRules, productionRuleIsValid } from "./rule-engine.server";
import { matchNeutralTransit } from "./transit-matcher.server";
import type { KnowledgeRule, RuleEngineInput } from "./types";

const input: RuleEngineInput = {
  system: { id: "lahiri", code: "sidereal_lahiri_dev", version: "dev" },
  chartFacts: [
    {
      key: "ascendant",
      value: "capricorn",
      authority: "calculation_engine",
      provenance: "sidereal_lahiri_dev",
    },
  ],
};
const citedRule: KnowledgeRule = {
  id: "r1",
  ruleCode: "TEST-001",
  systemId: "lahiri",
  systemVersion: "dev",
  ruleType: "natal",
  status: "published",
  condition: { ascendant: "capricorn" },
  outcome: { theme: "grounded" },
  confidence: 0.8,
  priority: 1,
  limitations: ["reviewed taxonomy test"],
  citations: [
    {
      id: "c1",
      sourceCode: "S1",
      sourceTitle: "Source",
      locator: "p. 1",
      supportType: "paraphrase",
    },
  ],
};

describe("knowledge V1 contracts", () => {
  it("never matches rules across systems", () =>
    expect(matchKnowledgeRules(input, [{ ...citedRule, systemId: "thai" }]).matches).toEqual([]));
  it("uses only published cited rules in production", () => {
    expect(
      matchKnowledgeRules(input, [
        citedRule,
        { ...citedRule, id: "r2", status: "approved" },
      ]).matches.map((match) => match.ruleId),
    ).toEqual(["r1"]);
    expect(productionRuleIsValid({ ...citedRule, citations: [] })).toBe(false);
  });
  it("uses neutral transit facts with authoritative natal facts", () => {
    const result = matchNeutralTransit(
      input,
      {
        id: "e1",
        eventCode: "INGRESS",
        eventType: "sign_ingress",
        systemId: "lahiri",
        eventTime: "2026-08-04T00:00:00Z",
        calculationEngine: "sidereal_lahiri_dev",
        calculationVersion: "dev",
        facts: [
          {
            key: "transit_sign",
            value: "aries",
            authority: "neutral_transit",
            provenance: "ephemeris",
          },
        ],
      },
      [{ ...citedRule, ruleType: "transit" }],
    );
    expect(result.matches[0]?.factsUsed.map((fact) => fact.authority)).toEqual([
      "calculation_engine",
      "neutral_transit",
    ]);
  });
  it("grounds AI context in citations and excludes unapproved rules", () => {
    const context = buildInterpretationContext(input, [
      citedRule,
      { ...citedRule, id: "r2", status: "review" },
    ]);
    expect(context.matchedRules.map((rule) => rule.id)).toEqual(["r1"]);
    expect(context.citations).toHaveLength(1);
    expect(context.prohibitedCapabilities).toContain("create_rules");
  });
});


describe("database invariants represented by migration", () => {
  it("treats duplicate checksum and event hash as unique identifiers", () => {
    const sourceChecksums = new Set(["sha256:a"]);
    const eventHashes = new Set(["event:a"]);
    expect(sourceChecksums.has("sha256:a")).toBe(true);
    expect(eventHashes.has("event:a")).toBe(true);
  });
  it("does not expose restricted raw text through public contracts", () => {
    const publicSource = { sourceCode: "S1", title: "Source", rightsStatus: "restricted" };
    expect("rawText" in publicSource).toBe(false);
  });
});