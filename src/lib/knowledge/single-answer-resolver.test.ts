import { describe, expect, it, vi } from "vitest";

import { renderResolvedConclusion } from "./narrative.server";
import { matchKnowledgeRules } from "./rule-engine.server";
import { resolveSingleAnswer } from "./single-answer-resolver.server";
import type { KnowledgeRule, RuleEngineInput } from "./types";

const input: RuleEngineInput = {
  system: { id: "sidereal_lahiri", code: "sidereal_lahiri", version: "3.0.0" },
  calculationProfile: { id: "sidereal_lahiri", version: "3.0.0" },
  interpretationProfile: {
    id: "lahiri_natal_th",
    version: "1.0.0",
    calculationProfileId: "sidereal_lahiri",
    calculationProfileVersion: "3.0.0",
    systemId: "sidereal_lahiri",
    systemVersion: "3.0.0",
    releaseId: "immutable-release-1",
  },
  chartFacts: [
    { key: "birth.time_known", value: true, authority: "calculation_engine", provenance: "test" },
    { key: "planet.1.sign_id", value: 10, authority: "calculation_engine", provenance: "test" },
  ],
  releaseRuleIds: [],
};

const question = { questionId: "career", domainId: "work", targetPeriod: "2026-08" };

function rule(
  id: string,
  conclusionCode: string,
  overrides: Partial<KnowledgeRule> = {},
): KnowledgeRule {
  return {
    id,
    ruleCode: `RULE-${id}`,
    systemId: "sidereal_lahiri",
    systemVersion: "3.0.0",
    ruleType: "natal",
    status: "published",
    condition: { op: "eq", fact: "birth.time_known", value: true },
    outcome: { summaryTh: `ข้อสรุป ${conclusionCode}` },
    outcomeId: conclusionCode,
    conclusionCode,
    confidence: 0.8,
    priority: 1,
    citations: [{ id: `C-${id}`, sourceCode: "SRC", sourceTitle: "Source", locator: id, supportType: "paraphrase" }],
    limitations: [],
    runtimeEligible: true,
    inImmutableRelease: true,
    citationsReviewed: true,
    rightsCleared: true,
    reviewerApproved: true,
    testsPassed: true,
    openBlockingConflict: false,
    evidenceGrade: "B",
    evidenceCoverage: 1,
    ...overrides,
  };
}

function resolve(rules: KnowledgeRule[]) {
  const scopedInput = { ...input, releaseRuleIds: rules.map((item) => item.id) };
  return resolveSingleAnswer(
    question,
    scopedInput,
    matchKnowledgeRules(scopedInput, rules).matches,
    rules,
  );
}

describe("deterministic Single Answer Resolver", () => {
  it("merges three supporting rules into exactly one final answer", () => {
    const result = resolve([rule("1", "STEADY"), rule("2", "STEADY"), rule("3", "STEADY")]);
    expect(result.finalAnswers).toHaveLength(1);
    expect(result.finalAnswers[0]).toMatchObject({ conclusionCode: "STEADY", winningRuleIds: ["1", "2", "3"] });
    expect(result.finalAnswers[0]?.supportingCitationIds).toEqual(["C-1", "C-2", "C-3"]);
  });

  it("chooses higher evidence grade before all lower ranking dimensions", () => {
    const result = resolve([
      rule("low", "LOW", { evidenceGrade: "C", confidence: 1, priority: 100 }),
      rule("high", "HIGH", { evidenceGrade: "A", confidence: 0.5, priority: 0 }),
    ]);
    expect(result.finalAnswers[0]?.conclusionCode).toBe("HIGH");
    expect(result.internalTrace.rejectedCandidates).toContainEqual(expect.objectContaining({ ruleId: "low", reason: "lower_rank" }));
  });

  it.each([
    ["specificity", rule("a", "A", { conditionSpecificity: 2 }), rule("b", "B", { conditionSpecificity: 1 }), "A"],
    ["confidence", rule("a", "A", { confidence: 0.9 }), rule("b", "B", { confidence: 0.8 }), "A"],
    ["priority", rule("a", "A", { priority: 2 }), rule("b", "B", { priority: 1 }), "A"],
    ["lexical ruleCode", rule("z", "Z", { ruleCode: "RULE-Z" }), rule("a", "A", { ruleCode: "RULE-A" }), "A"],
  ])("applies %s deterministically", (_label, first, second, expected) => {
    expect(resolve([first, second]).finalAnswers[0]?.conclusionCode).toBe(expected);
  });

  it("returns one insufficient-evidence answer for an unresolved equal conflict", () => {
    const first = rule("same-id-a", "A", { ruleCode: "SAME" });
    const second = rule("same-id-b", "B", { ruleCode: "SAME" });
    const result = resolve([first, second]);
    expect(result.finalAnswers).toHaveLength(1);
    expect(result.finalAnswers[0]).toMatchObject({ conclusionCode: "INSUFFICIENT_EVIDENCE", winningRuleIds: [] });
    expect(result.internalTrace.resolution).toBe("insufficient_evidence");
  });

  it("is invariant to input order and repeats cardinality/hash 100 times without network", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const rules = [rule("1", "WIN", { evidenceGrade: "A" }), rule("2", "WIN"), rule("3", "LOSE")];
    const expected = resolve(rules).finalAnswers[0];
    expect(resolve([...rules].reverse()).finalAnswers[0]).toEqual(expected);
    for (let index = 0; index < 100; index += 1) {
      const result = resolve(index % 2 ? rules : [...rules].reverse());
      expect(result.finalAnswers).toHaveLength(1);
      expect(result.finalAnswers[0]?.resolutionTraceHash).toBe(expected?.resolutionTraceHash);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("does not allow the renderer to accept raw matches or unresolved rules", () => {
    const unsafeRenderer = renderResolvedConclusion as unknown as (value: unknown) => unknown;
    expect(() => unsafeRenderer({ kind: "raw_rule_matches", matches: [] })).toThrow("NARRATIVE_REQUIRES_RESOLVED_CONCLUSION");
  });
});