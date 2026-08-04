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

export const THAI_NARRATIVE_TEMPLATES = {
  noMatch: "ระบบยังแสดงข้อเท็จจริงจากการคำนวณได้ แต่จะไม่สร้างคำพยากรณ์แทนกฎที่ยังไม่ผ่านการตรวจทาน",
  unknownBirthTime: "ไม่ทราบเวลาเกิด จึงไม่ใช้ลัคนา เรือนชะตา หรือมุมที่พึ่งเวลาเกิดในการสรุปผล",
  sensitiveHealth: "ข้อมูลนี้ไม่ใช่การวินิจฉัย หากมีอาการหรือความกังวลควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพ",
  sensitiveLegalFinance: "ข้อมูลนี้ไม่ใช่คำแนะนำทางกฎหมายหรือการเงิน ควรตรวจสอบกับผู้เชี่ยวชาญก่อนตัดสินใจ",
} as const;

export const PROHIBITED_NARRATIVE_PHRASES = ["รับประกัน", "เกิดแน่นอน", "หายแน่นอน", "ลงทุนแล้วได้กำไรแน่นอน"] as const;

export function assertNarrativeSafety(text: string): void {
  const phrase = PROHIBITED_NARRATIVE_PHRASES.find((item) => text.includes(item));
  if (phrase) throw new Error(`PROHIBITED_NARRATIVE_PHRASE:${phrase}`);
}

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
      : THAI_NARRATIVE_TEMPLATES.noMatch,
    trace: matches,
    limitations,
    renderer: "horathai_template_th_v1",
    rendererVersion: "1.1.0-draft",
    sentenceLineage,
  } as const;
  assertNarrativeSafety(`${narrative.headline} ${narrative.summary}`);
  return { ...narrative, outputHash: deterministicHash(narrative) };
}
