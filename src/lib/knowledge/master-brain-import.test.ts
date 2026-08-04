import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

import { evaluateConditionAst, type ConditionAst } from "./condition-ast";
import { buildNatalFactSheet } from "./fact-sheet.server";
import { dryRunMasterBrainImport, type KnowledgeBaselineSnapshot } from "./master-brain-import.server";
import { masterBrainPackSchema } from "./master-brain-pack.schema";
import { assertNarrativeSafety, renderThaiNarrative } from "./narrative.server";
import { buildCandidateReleaseReport } from "./release-report.server";
import { matchKnowledgeRules } from "./rule-engine.server";
import type { CalculatedFact, KnowledgeRule, RuleEngineInput } from "./types";

const fixtureUrl = new URL("../../../docs/fixtures/master-brain-pack-v0.1.0-draft.json", import.meta.url);
const baselineUrl = new URL("../../../docs/fixtures/live-knowledge-baseline-cd7b33ab.json", import.meta.url);

async function fixtures() {
  const pack = JSON.parse(await readFile(fixtureUrl, "utf8"));
  const stored = JSON.parse(await readFile(baselineUrl, "utf8")) as {
    conceptCount: number; publishedEditorialRuleCount: number; knowledgeReleaseCount: number;
    conceptHash: string; ruleHash: string; releaseHash: string;
    concepts: [string, string][]; publishedEditorialRules: [string, string, string][];
  };
  const baseline: KnowledgeBaselineSnapshot = {
    ...stored,
    concepts: stored.concepts.map(([code, id]) => ({ code, id })),
    publishedEditorialRules: stored.publishedEditorialRules.map(([code, id, hash]) => ({ code, id, hash })),
  };
  return { pack, baseline };
}

const facts: CalculatedFact[] = [
  { key: "birth.time_known", value: true, authority: "calculation_engine", provenance: "test" },
  { key: "planet.1.longitude", value: 359, authority: "calculation_engine", provenance: "test" },
  { key: "planet.1.sign_id", value: 12, authority: "calculation_engine", provenance: "test" },
];

describe("Master Brain Pack dry-run import", () => {
  it("validates the pack and preserves draft-only activation", async () => {
    const { pack, baseline } = await fixtures();
    const parsed = masterBrainPackSchema.parse(pack);
    expect(parsed.seedRules.every((rule) => rule.status === "draft" && rule.evidenceLevel === "editorial" && !rule.runtimeEligible)).toBe(true);
    const report = dryRunMasterBrainImport(pack, baseline);
    expect(report).toMatchObject({ mode: "dry_run_only", aborted: false, candidateRelease: { status: "blocked", immutableReleaseCreated: false, eligibleRuleIds: [] } });
    expect(report.mappedExisting.concepts).toHaveLength(49);
    expect(report.mappedExisting.rules).toHaveLength(5);
  });

  it("aborts on invalid schema, baseline mismatch, duplicate code, and dangling reference", async () => {
    const { pack, baseline } = await fixtures();
    expect(() => dryRunMasterBrainImport({ ...pack, schema: "wrong" }, baseline)).toThrow();
    expect(() => dryRunMasterBrainImport(pack, { ...baseline, conceptCount: 48 })).toThrow("MASTER_BRAIN_BASELINE_MISMATCH");
    expect(() => dryRunMasterBrainImport({ ...pack, seedRules: [...pack.seedRules, pack.seedRules[0]] }, baseline)).toThrow("MASTER_BRAIN_DUPLICATE_CODE");
    const broken = structuredClone(pack);
    broken.seedRules[0].outcomeId = "missing";
    expect(() => dryRunMasterBrainImport(broken, baseline)).toThrow("MASTER_BRAIN_DANGLING_REFERENCE");
  });

  it("keeps competitor observations out of truth fixtures and research profiles out of runtime", async () => {
    const { pack } = await fixtures();
    const parsed = masterBrainPackSchema.parse(pack);
    expect(parsed.benchmarks.filter((item) => ["competitor", "myhora"].includes(item.source)).every((item) => !item.usableAsTruthFixture)).toBe(true);
    expect(parsed.systems.filter((item) => item.id !== "sidereal_lahiri").every((item) => !item.runtimeEligible)).toBe(true);
    expect(parsed.systems.find((item) => item.id === "sidereal_lahiri")).toMatchObject({ version: "3.0.0", status: "active", runtimeEligible: true });
  });
});

describe("safe condition AST", () => {
  it.each<[ConditionAst, boolean]>([
    [{ op: "eq", fact: "planet.1.sign_id", value: 12 }, true],
    [{ op: "in", fact: "planet.1.sign_id", values: [1, 12] }, true],
    [{ op: "between", fact: "planet.1.longitude", min: 359, max: 359 }, true],
    [{ op: "angularWithin", fact: "planet.1.longitude", target: 1, orb: 2 }, true],
    [{ op: "gt", fact: "planet.1.longitude", value: 359 }, false],
    [{ op: "not", condition: { op: "exists", fact: "ascendant.longitude" } }, true],
    [{ op: "all", conditions: [{ op: "exists", fact: "planet.1.longitude" }, { op: "eq", fact: "birth.time_known", value: true }] }, true],
    [{ op: "any", conditions: [{ op: "eq", fact: "planet.1.sign_id", value: 1 }, { op: "eq", fact: "planet.1.sign_id", value: 12 }] }, true],
  ])("evaluates boundaries without executable code", (ast, expected) => expect(evaluateConditionAst(ast, facts)).toBe(expected));

  it("rejects prose, JavaScript, and unknown fact keys", () => {
    expect(() => evaluateConditionAst({ op: "eq", fact: "process.env.SECRET", value: true }, facts)).toThrow("Unknown canonical fact key");
    expect(() => masterBrainPackSchema.parse({ schema: "eval(payload)" })).toThrow();
  });
});

describe("deterministic offline pipeline", () => {
  it("repeats facts, matches, Thai text, lineage, and hash 100 times with no fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const birth = { birthDate: "1988-05-05", birthTime: "00:00", birthTimeKnown: true, latitude: 15.8068, longitude: 102.0315, timezone: "Asia/Bangkok" };
    const sheet = await buildNatalFactSheet(birth);
    const input: RuleEngineInput = { system: { id: "sidereal_lahiri", code: "sidereal_lahiri", version: "3.0.0" }, calculationProfile: { id: "sidereal_lahiri", version: "3.0.0" }, interpretationProfile: { id: "test", version: "0.1.0", calculationProfileId: "sidereal_lahiri", calculationProfileVersion: "3.0.0", systemId: "sidereal_lahiri", systemVersion: "3.0.0", releaseId: "immutable-test" }, chartFacts: sheet.facts, releaseRuleIds: ["known-time"] };
    const rule: KnowledgeRule = { id: "known-time", ruleCode: "TEST-KNOWN-TIME", systemId: "sidereal_lahiri", systemVersion: "3.0.0", ruleType: "natal", status: "published", condition: { op: "eq", fact: "birth.time_known", value: true }, outcome: { summaryTh: "ข้อมูลเวลาเกิดรองรับการคำนวณลัคนาในโปรไฟล์นี้" }, outcomeId: "known", confidence: 1, priority: 1, citations: [{ id: "c1", sourceCode: "TEST", sourceTitle: "Test", locator: "section 1", supportType: "paraphrase" }], limitations: [], runtimeEligible: true, inImmutableRelease: true, citationsReviewed: true, rightsCleared: true, reviewerApproved: true, testsPassed: true, openBlockingConflict: false };
    const expected = renderThaiNarrative(matchKnowledgeRules(input, [rule]).matches, [rule], sheet.limitations);
    for (let index = 0; index < 100; index += 1) {
      const repeatSheet = await buildNatalFactSheet(birth);
      const repeat = renderThaiNarrative(matchKnowledgeRules({ ...input, chartFacts: repeatSheet.facts }, [rule]).matches, [rule], repeatSheet.limitations);
      expect({ facts: repeatSheet.facts, inputHash: repeatSheet.provenance.inputHash, repeat }).toEqual({ facts: sheet.facts, inputHash: sheet.provenance.inputHash, repeat: expected });
    }
    expect(expected.sentenceLineage[0]).toMatchObject({ outcomeId: "known", ruleId: "known-time", citationIds: ["c1"] });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("omits time-dependent facts and rejects unsafe deterministic claims", async () => {
    const sheet = await buildNatalFactSheet({ birthDate: "1988-05-05", birthTime: "12:00", birthTimeKnown: false, latitude: 15.8068, longitude: 102.0315, timezone: "Asia/Bangkok" });
    expect(sheet.facts.some((fact) => fact.key.startsWith("ascendant.") || fact.key.endsWith(".house"))).toBe(false);
    expect(() => assertNarrativeSafety("ลงทุนแล้วได้กำไรแน่นอน")).toThrow("PROHIBITED_NARRATIVE_PHRASE");
  });

  it("generates a deterministic blocked candidate release report for drafts", () => {
    const draft: KnowledgeRule = { id: "draft-1", ruleCode: "DRAFT-1", systemId: "sidereal_lahiri", systemVersion: "3.0.0", ruleType: "natal", status: "draft", condition: { op: "exists", fact: "planet.1.longitude" }, outcome: {}, confidence: 0.5, priority: 1, citations: [], limitations: [], runtimeEligible: false };
    const first = buildCandidateReleaseReport("sidereal_lahiri", "3.0.0", [draft]);
    const second = buildCandidateReleaseReport("sidereal_lahiri", "3.0.0", [draft]);
    expect(first).toEqual(second);
    expect(first).toMatchObject({ status: "blocked", eligibleRuleIds: [], immutableReleaseCreated: false, blockedRules: [{ ruleId: "draft-1" }] });
  });
});