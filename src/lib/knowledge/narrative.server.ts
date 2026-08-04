import type { KnowledgeRule, RuleMatch } from "./types";
import { deterministicHash } from "./canonical-json.server";

export type SentenceLineage = {
  sentence: string;
  outcomeId: string;
  ruleId: string;
  citationIds: string[];
};

export type DeterministicNarrative = {
  headline: string;
  summary: string;
  trace: RuleMatch[];
  limitations: string[];
  renderer: "horathai_template_th_v1";
  rendererVersion: "1.1.0-draft";
  sentenceLineage: SentenceLineage[];
  outputHash: string;
};

function outcomeText(rule: KnowledgeRule): string {
  const summary = rule.outcome["summaryTh"];
  if (typeof summary === "string" && summary.trim()) return summary.trim();
  return "มีประเด็นให้สังเกตจากกฎที่ผ่านการทบทวน โดยควรพิจารณาร่วมกับบริบทชีวิตจริง";
}

export function renderThaiNarrative(
  matches: RuleMatch[],
  rules: KnowledgeRule[],
  factSheetLimitations: string[] = [],
): DeterministicNarrative {
  const byId = new Map(rules.map((rule) => [rule.id, rule]));
  const lines = matches.flatMap((match) => {
    const rule = byId.get(match.ruleId);
    return rule ? [outcomeText(rule)] : [];
  });
  const sentenceLineage = matches.flatMap((match) => {
    const rule = byId.get(match.ruleId);
    return rule
      ? [{ sentence: outcomeText(rule), outcomeId: match.outcomeId, ruleId: match.ruleId, citationIds: match.citations.map((citation) => citation.id) }]
      : [];
  });
  const limitations = Array.from(
    new Set([...factSheetLimitations, ...matches.flatMap((match) => match.limitations)]),
  );

  const narrative = {
    headline: matches.length
      ? `พบประเด็นสำคัญ ${matches.length} ข้อ`
      : "ยังไม่พบกฎที่ตรงกับข้อมูลชุดนี้",
    summary: lines.length
      ? lines.join(" ")
      : "ข้อมูลคำนวณยังคงแสดงได้ แต่ยังไม่มีกฎที่เผยแพร่พร้อมแหล่งอ้างอิงสำหรับสรุปความหมาย",
    trace: matches,
    limitations,
    renderer: "horathai_template_th_v1",
    rendererVersion: "1.1.0-draft",
    sentenceLineage,
  } as const;
  return { ...narrative, outputHash: deterministicHash(narrative) };
}
