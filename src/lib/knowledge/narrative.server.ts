import type { FinalAnswer, ResolvedConclusion } from "./single-answer-resolver.server";

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

export function renderResolvedConclusion(resolved: ResolvedConclusion): FinalAnswer {
  if (resolved.kind !== "resolved_conclusion") {
    throw new Error("NARRATIVE_REQUIRES_RESOLVED_CONCLUSION");
  }
  assertNarrativeSafety(resolved.summaryTh);
  return {
    answerId: resolved.answerId,
    conclusionCode: resolved.conclusionCode,
    text: resolved.summaryTh,
    confidence: resolved.confidence,
    evidenceCoverage: resolved.evidenceCoverage,
    winningRuleIds: resolved.winningRuleIds,
    supportingCitationIds: resolved.supportingCitationIds,
    limitations: resolved.limitations,
    resolutionTraceHash: resolved.resolutionTraceHash,
  };
}
