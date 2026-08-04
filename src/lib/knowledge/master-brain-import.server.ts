import { deterministicHash } from "./canonical-json.server";
import { conditionAstSchema } from "./condition-ast";
import { masterBrainPackSchema, type MasterBrainPack } from "./master-brain-pack.schema";

export type LiveKnowledgeReference = { id: string; code: string; hash?: string };
export type KnowledgeBaselineSnapshot = {
  conceptCount: number;
  publishedEditorialRuleCount: number;
  knowledgeReleaseCount: number;
  conceptHash: string;
  ruleHash: string;
  releaseHash: string;
  concepts: LiveKnowledgeReference[];
  publishedEditorialRules: LiveKnowledgeReference[];
};

export type DryRunImportReport = {
  mode: "dry_run_only";
  aborted: boolean;
  packHash: string;
  baseline: KnowledgeBaselineSnapshot;
  mappedExisting: { concepts: LiveKnowledgeReference[]; rules: LiveKnowledgeReference[] };
  simulatedDrafts: { ruleCodes: string[]; outcomeIds: string[]; sourceIds: string[] };
  duplicatesPrevented: string[];
  danglingReferences: string[];
  candidateRelease: { status: "blocked"; immutableReleaseCreated: false; eligibleRuleIds: string[]; gaps: string[] };
};

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => (seen.has(value) ? true : !seen.add(value)));
}

export function dryRunMasterBrainImport(rawPack: unknown, baseline: KnowledgeBaselineSnapshot): DryRunImportReport {
  const pack: MasterBrainPack = masterBrainPackSchema.parse(rawPack);
  const mismatch = baseline.conceptCount !== pack.baseline.conceptCountExpected || baseline.publishedEditorialRuleCount !== pack.baseline.existingPublishedEditorialRuleCountExpected || baseline.knowledgeReleaseCount !== pack.baseline.knowledgeReleaseCountExpected || baseline.concepts.length !== baseline.conceptCount || baseline.publishedEditorialRules.length !== baseline.publishedEditorialRuleCount;
  if (mismatch) throw new Error("MASTER_BRAIN_BASELINE_MISMATCH");
  const duplicateCodes = [...duplicates(pack.systems.map((item) => `${item.id}@${item.version}`)), ...duplicates(pack.sources.map((item) => item.id)), ...duplicates(pack.seedOutcomes.map((item) => item.outcomeId)), ...duplicates(pack.seedRules.map((item) => item.ruleCode)), ...duplicates(pack.benchmarks.map((item) => item.id))];
  if (duplicateCodes.length) throw new Error(`MASTER_BRAIN_DUPLICATE_CODE:${duplicateCodes.join(",")}`);
  const systems = new Set(pack.systems.map((item) => `${item.id}@${item.version}`));
  const outcomes = new Set(pack.seedOutcomes.map((item) => item.outcomeId));
  const danglingReferences = pack.seedRules.flatMap((rule) => {
    conditionAstSchema.parse(rule.condition);
    return [!systems.has(`${rule.systemId}@${rule.systemVersion}`) ? `${rule.ruleCode}:system` : null, !outcomes.has(rule.outcomeId) ? `${rule.ruleCode}:outcome` : null].filter((item): item is string => Boolean(item));
  });
  if (danglingReferences.length) throw new Error(`MASTER_BRAIN_DANGLING_REFERENCE:${danglingReferences.join(",")}`);
  const liveRuleCodes = new Set(baseline.publishedEditorialRules.map((item) => item.code));
  const duplicatesPrevented = pack.seedRules.filter((rule) => liveRuleCodes.has(rule.ruleCode)).map((rule) => rule.ruleCode);
  if (duplicatesPrevented.length) throw new Error(`MASTER_BRAIN_LIVE_RULE_COLLISION:${duplicatesPrevented.join(",")}`);
  return {
    mode: "dry_run_only", aborted: false, packHash: deterministicHash(pack), baseline,
    mappedExisting: { concepts: baseline.concepts, rules: baseline.publishedEditorialRules },
    simulatedDrafts: { ruleCodes: pack.seedRules.map((rule) => rule.ruleCode), outcomeIds: pack.seedOutcomes.map((outcome) => outcome.outcomeId), sourceIds: pack.sources.map((source) => source.id) },
    duplicatesPrevented, danglingReferences,
    candidateRelease: { status: "blocked", immutableReleaseCreated: false, eligibleRuleIds: [], gaps: ["immutable release missing", "draft rules", "citations missing", "reviewers missing", "rule tests incomplete", "rights review incomplete"] },
  };
}