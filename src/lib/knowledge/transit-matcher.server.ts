import { matchKnowledgeRules } from "./rule-engine.server";
import type {
  KnowledgeRule,
  NeutralTransitEvent,
  RuleEngineInput,
  RuleEngineOutput,
} from "./types";

export function matchNeutralTransit(
  input: Omit<RuleEngineInput, "transitEvent">,
  event: NeutralTransitEvent,
  rules: KnowledgeRule[],
): RuleEngineOutput {
  if (event.systemId !== input.system.id) return { system: input.system, matches: [] };
  if (event.calculationVersion !== input.calculationProfile.version) {
    throw new Error("Transit event and calculation profile versions do not match");
  }
  if (!event.calculationEngine || !event.calculationVersion) {
    throw new Error("Transit event lacks calculation provenance");
  }
  return matchKnowledgeRules(
    { ...input, transitEvent: event },
    rules.filter((rule) => rule.ruleType === "transit"),
  );
}
