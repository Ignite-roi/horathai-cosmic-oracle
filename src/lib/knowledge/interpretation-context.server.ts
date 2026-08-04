import { citationSnapshot } from "./citation.server";
import { productionRuleIsValid } from "./rule-engine.server";
import type { InterpretationContext, KnowledgeRule, RuleEngineInput } from "./types";

export function buildInterpretationContext(
  input: RuleEngineInput,
  matchedRules: KnowledgeRule[],
): InterpretationContext {
  const approved = matchedRules.filter(
    (rule) =>
      productionRuleIsValid(rule) && rule.systemId === input.system.id && rule.systemVersion === input.system.version && Boolean(input.releaseRuleIds?.includes(rule.id)),
  );
  return {
    system: input.system,
    calculatedFacts: input.transitEvent
      ? [...input.chartFacts, ...input.transitEvent.facts]
      : input.chartFacts,
    matchedRules: approved.map(({ id, ruleCode, outcome, confidence }) => ({
      id,
      ruleCode,
      outcome,
      confidence,
    })),
    citations: citationSnapshot(approved),
    wordingConstraints: [
      "ใช้ภาษาเชิงสะท้อนและไม่อ้างเหตุเป็นผลทางวิทยาศาสตร์",
      "แยกข้อเท็จจริงที่คำนวณได้ออกจากคำอธิบาย",
      "ไม่ทำนายเชิงเด็ดขาดด้านแพทย์ กฎหมาย การเงิน ความตาย ภัยพิบัติ หรืออาชญากรรม",
    ],
    prohibitedCapabilities: [
      "create_planetary_positions",
      "create_ascendant",
      "create_houses",
      "create_transit_dates",
      "create_rules",
      "create_citations",
    ],
  };
}
