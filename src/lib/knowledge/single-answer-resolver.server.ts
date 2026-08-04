import { deterministicHash } from "./canonical-json.server";
import { renderResolvedConclusion } from "./narrative.server";
import { productionRuleIsValid } from "./rule-engine.server";
import type { KnowledgeRule, RuleEngineInput, RuleMatch } from "./types";

export type AnswerQuestion = {
  questionId: string;
  domainId: string;
  targetPeriod: string;
};

export type ResolvedConclusion = {
  kind: "resolved_conclusion";
  answerId: string;
  conclusionCode: string;
  summaryTh: string;
  confidence: number;
  evidenceCoverage: number;
  winningRuleIds: string[];
  supportingCitationIds: string[];
  limitations: string[];
  resolutionTraceHash: string;
};

export type FinalAnswer = Omit<ResolvedConclusion, "kind" | "summaryTh"> & {
  text: string;
};

type RejectedCandidate = {
  ruleId: string;
  ruleCode: string;
  conclusionCode: string;
  reason: "lower_rank" | "supporting_winner" | "missing_required_fact";
};

export type SingleAnswerResolution = {
  finalAnswers: readonly [FinalAnswer];
  internalTrace: {
    rejectedCandidates: RejectedCandidate[];
    rankedCandidateRuleIds: string[];
    resolution: "winner" | "insufficient_evidence";
  };
};

const EVIDENCE_RANK = { A: 4, B: 3, C: 2, D: 1 } as const;
const MINIMUM_EVIDENCE_COVERAGE = 0.5;
const INSUFFICIENT_CODE = "INSUFFICIENT_EVIDENCE";
const INSUFFICIENT_TEXT =
  "หลักฐานที่ผ่านการทบทวนยังไม่เพียงพอสำหรับข้อสรุปในช่วงเวลานี้";

type Candidate = {
  match: RuleMatch;
  rule: KnowledgeRule;
  conclusionCode: string;
  evidenceRank: number;
  specificity: number;
  coverage: number;
};

function countSpecificity(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countSpecificity(item), 0);
  const record = value as Record<string, unknown>;
  if (typeof record["fact"] === "string") return 1;
  return Object.values(record).reduce<number>((sum, item) => sum + countSpecificity(item), 0);
}

function conclusionCode(rule: KnowledgeRule, match: RuleMatch): string {
  return rule.conclusionCode ??
    (typeof rule.outcome["conclusionCode"] === "string" ? rule.outcome["conclusionCode"] : match.outcomeId);
}

function summaryTh(rule: KnowledgeRule): string {
  const summary = rule.outcome["summaryTh"];
  return typeof summary === "string" && summary.trim()
    ? summary.trim()
    : "มีข้อสรุปจากกฎที่ผ่านการทบทวน โดยควรพิจารณาร่วมกับบริบทชีวิตจริง";
}

function compareCandidates(a: Candidate, b: Candidate): number {
  return (
    b.evidenceRank - a.evidenceRank ||
    b.specificity - a.specificity ||
    b.rule.confidence - a.rule.confidence ||
    b.rule.priority - a.rule.priority ||
    a.rule.ruleCode.localeCompare(b.rule.ruleCode) ||
    a.rule.id.localeCompare(b.rule.id)
  );
}

function sameSubstantiveRank(a: Candidate, b: Candidate): boolean {
  return (
    a.evidenceRank === b.evidenceRank &&
    a.specificity === b.specificity &&
    a.rule.confidence === b.rule.confidence &&
    a.rule.priority === b.rule.priority &&
    a.rule.ruleCode === b.rule.ruleCode
  );
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function profilesMatch(input: RuleEngineInput, match: RuleMatch): boolean {
  return (
    match.systemId === input.system.id &&
    match.systemVersion === input.system.version &&
    match.releaseId === input.interpretationProfile.releaseId &&
    input.calculationProfile.id === input.interpretationProfile.calculationProfileId &&
    input.calculationProfile.version === input.interpretationProfile.calculationProfileVersion &&
    input.system.id === input.interpretationProfile.systemId &&
    input.system.version === input.interpretationProfile.systemVersion
  );
}

export function resolveSingleAnswer(
  question: AnswerQuestion,
  input: RuleEngineInput,
  matches: RuleMatch[],
  rules: KnowledgeRule[],
  factSheetLimitations: string[] = [],
): SingleAnswerResolution {
  const facts = new Set([
    ...input.chartFacts.map((fact) => fact.key),
    ...(input.transitEvent?.facts.map((fact) => fact.key) ?? []),
  ]);
  const byId = new Map(rules.map((rule) => [rule.id, rule]));
  const rejectedMissing: RejectedCandidate[] = [];
  const candidates = matches.flatMap((match): Candidate[] => {
    const rule = byId.get(match.ruleId);
    if (!rule || !profilesMatch(input, match) || !productionRuleIsValid(rule)) return [];
    if (!input.releaseRuleIds?.includes(rule.id)) return [];
    if (rule.requiredFactKeys?.some((key) => !facts.has(key))) {
      rejectedMissing.push({
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        conclusionCode: conclusionCode(rule, match),
        reason: "missing_required_fact",
      });
      return [];
    }
    return [{
      match,
      rule,
      conclusionCode: conclusionCode(rule, match),
      evidenceRank: EVIDENCE_RANK[rule.evidenceGrade ?? "D"],
      specificity: rule.conditionSpecificity ?? countSpecificity(rule.condition),
      coverage: rule.evidenceCoverage ?? (rule.citations.length > 0 ? 1 : 0),
    }];
  }).sort(compareCandidates);

  const top = candidates[0];
  const tiedConflict = top
    ? candidates.find(
        (candidate) =>
          candidate.conclusionCode !== top.conclusionCode &&
          sameSubstantiveRank(candidate, top),
      )
    : undefined;
  const winnerGroup = top
    ? candidates.filter((candidate) => candidate.conclusionCode === top.conclusionCode)
    : [];
  const evidenceCoverage = winnerGroup.length
    ? Math.min(...winnerGroup.map((candidate) => candidate.coverage))
    : 0;
  const insufficient = !top || Boolean(tiedConflict) || evidenceCoverage < MINIMUM_EVIDENCE_COVERAGE;
  const winning = insufficient ? [] : winnerGroup;
  const winningRuleIds = uniqueSorted(winning.map((candidate) => candidate.rule.id));
  const supportingCitationIds = uniqueSorted(
    winning.flatMap((candidate) => candidate.match.citations.map((citation) => citation.id)),
  );
  const limitations = uniqueSorted([
    ...factSheetLimitations,
    ...winning.flatMap((candidate) => candidate.match.limitations),
    ...(insufficient ? ["หลักฐานไม่เพียงพอหรือมีความขัดแย้งที่ยังตัดสินไม่ได้"] : []),
  ]);
  const resolvedCode = insufficient ? INSUFFICIENT_CODE : top.conclusionCode;
  const tracePayload = {
    question,
    calculationProfile: input.calculationProfile,
    interpretationProfile: input.interpretationProfile,
    conclusionCode: resolvedCode,
    winningRuleIds,
    supportingCitationIds,
    rankedCandidates: candidates.map((candidate) => ({
      ruleId: candidate.rule.id,
      ruleCode: candidate.rule.ruleCode,
      conclusionCode: candidate.conclusionCode,
      evidenceRank: candidate.evidenceRank,
      specificity: candidate.specificity,
      confidence: candidate.rule.confidence,
      priority: candidate.rule.priority,
      coverage: candidate.coverage,
    })),
    limitations,
  };
  const resolutionTraceHash = deterministicHash(tracePayload);
  const resolved: ResolvedConclusion = {
    kind: "resolved_conclusion",
    answerId: deterministicHash({ question, resolvedCode, resolutionTraceHash }),
    conclusionCode: resolvedCode,
    summaryTh: insufficient ? INSUFFICIENT_TEXT : summaryTh(top.rule),
    confidence: insufficient
      ? 0
      : Math.min(...winning.map((candidate) => candidate.rule.confidence)),
    evidenceCoverage: insufficient ? evidenceCoverage : evidenceCoverage,
    winningRuleIds,
    supportingCitationIds,
    limitations,
    resolutionTraceHash,
  };
  const finalAnswer = renderResolvedConclusion(resolved);
  const rejectedCandidates = [
    ...rejectedMissing,
    ...candidates.map((candidate): RejectedCandidate => ({
      ruleId: candidate.rule.id,
      ruleCode: candidate.rule.ruleCode,
      conclusionCode: candidate.conclusionCode,
      reason:
        !insufficient && candidate.conclusionCode === resolvedCode
          ? "supporting_winner"
          : "lower_rank",
    })),
  ].filter((candidate) => !winningRuleIds.includes(candidate.ruleId));

  return {
    finalAnswers: [finalAnswer],
    internalTrace: {
      rejectedCandidates,
      rankedCandidateRuleIds: candidates.map((candidate) => candidate.rule.id),
      resolution: insufficient ? "insufficient_evidence" : "winner",
    },
  };
}