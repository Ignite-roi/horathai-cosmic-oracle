import type { KnowledgeRule, RuleEngineInput, RuleEngineOutput } from "./types";

function profilesMatch(input: RuleEngineInput): boolean {
  return (
    input.calculationProfile.id === input.interpretationProfile.calculationProfileId &&
    input.calculationProfile.version === input.interpretationProfile.calculationProfileVersion &&
    input.system.id === input.interpretationProfile.systemId &&
    input.system.version === input.interpretationProfile.systemVersion &&
    input.system.id === input.calculationProfile.id &&
    input.system.version === input.calculationProfile.version
  );
}

function matchesConditions(rule: KnowledgeRule, input: RuleEngineInput): boolean {
  const facts = new Map(input.chartFacts.map((fact) => [fact.key, fact.value]));
  for (const [key, expected] of Object.entries(rule.condition)) {
    if (facts.get(key) !== expected) return false;
  }
  return true;
}

export function matchKnowledgeRules(
  input: RuleEngineInput,
  rules: KnowledgeRule[],
): RuleEngineOutput {
  if (!profilesMatch(input))
    throw new Error("Calculation, interpretation, and rule profiles do not match");
  const eligible = rules.filter(
    (rule) =>
      rule.systemId === input.system.id &&
      rule.systemVersion === input.system.version &&
      rule.status === "published" &&
      rule.citations.length > 0 &&
      (!input.releaseRuleIds || input.releaseRuleIds.includes(rule.id)),
  );
  return {
    system: input.system,
    matches: eligible
      .filter((rule) => matchesConditions(rule, input))
      .sort((a, b) => a.priority - b.priority)
      .map((rule) => ({
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        outcomeId: rule.outcomeId ?? `${rule.ruleCode}:default`,
        factsUsed: input.transitEvent
          ? [...input.chartFacts, ...input.transitEvent.facts]
          : input.chartFacts,
        citations: rule.citations,
        confidence: rule.confidence,
        limitations: rule.limitations,
        systemId: rule.systemId,
        systemVersion: rule.systemVersion,
        releaseId: input.interpretationProfile.releaseId,
      })),
  };
}

export function productionRuleIsValid(rule: KnowledgeRule): boolean {
  return rule.status === "published" && rule.citations.length > 0;
}
