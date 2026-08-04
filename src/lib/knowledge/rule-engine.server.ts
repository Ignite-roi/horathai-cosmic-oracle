import type { KnowledgeRule, RuleEngineInput, RuleEngineOutput } from "./types";

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
        factsUsed: input.transitEvent
          ? [...input.chartFacts, ...input.transitEvent.facts]
          : input.chartFacts,
        citations: rule.citations,
        confidence: rule.confidence,
        limitations: rule.limitations,
      })),
  };
}

export function productionRuleIsValid(rule: KnowledgeRule): boolean {
  return rule.status === "published" && rule.citations.length > 0;
}
