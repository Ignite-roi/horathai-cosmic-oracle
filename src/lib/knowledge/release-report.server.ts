import { deterministicHash } from "./canonical-json.server";
import { productionRuleIsValid } from "./rule-engine.server";
import type { KnowledgeRule } from "./types";

export type CandidateReleaseReport = {
  status: "candidate" | "blocked";
  systemId: string;
  systemVersion: string;
  ruleIds: string[];
  eligibleRuleIds: string[];
  blockedRules: Array<{ ruleId: string; gaps: string[] }>;
  replayHash: string;
  immutableReleaseCreated: false;
};

function ruleGaps(rule: KnowledgeRule): string[] {
  return [
    rule.status !== "published" ? "not_published" : null,
    rule.runtimeEligible !== true ? "runtime_ineligible" : null,
    rule.inImmutableRelease !== true ? "immutable_release_missing" : null,
    rule.citations.length === 0 ? "citation_missing" : null,
    rule.citationsReviewed !== true ? "citation_review_missing" : null,
    rule.rightsCleared !== true ? "rights_review_missing" : null,
    rule.reviewerApproved !== true ? "reviewer_approval_missing" : null,
    rule.testsPassed !== true ? "tests_missing" : null,
    rule.openBlockingConflict === true ? "blocking_conflict" : null,
  ].filter((gap): gap is string => Boolean(gap));
}

export function buildCandidateReleaseReport(
  systemId: string,
  systemVersion: string,
  rules: KnowledgeRule[],
): CandidateReleaseReport {
  const scoped = rules.filter((rule) => rule.systemId === systemId && rule.systemVersion === systemVersion);
  const eligibleRuleIds = scoped.filter(productionRuleIsValid).map((rule) => rule.id).sort();
  const blockedRules = scoped
    .filter((rule) => !productionRuleIsValid(rule))
    .map((rule) => ({ ruleId: rule.id, gaps: ruleGaps(rule) }))
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
  const content = { systemId, systemVersion, ruleIds: scoped.map((rule) => rule.id).sort(), eligibleRuleIds, blockedRules };
  return {
    status: blockedRules.length ? "blocked" : "candidate",
    ...content,
    replayHash: deterministicHash(content),
    immutableReleaseCreated: false,
  };
}