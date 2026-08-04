import { createHash, randomBytes, randomInt } from "node:crypto";

import type { Json } from "@/integrations/supabase/types";
import type { CardKind, CardDraw, DayTransferPreview, PublicShare, ShareKind } from "@/lib/social.features";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function makeToken() {
  return randomBytes(32).toString("base64url");
}

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

export async function createResultShare(
  userId: string,
  input: { type: ShareKind; sourceId?: string | undefined; expiresInDays: number },
) {
  const db = await admin();
  let payload: Json | null = null;
  let title = "ผลอ่าน Horathai";
  if (input.type === "natal") {
    const query = db.from("natal_charts").select("ascendant_json,planets_json,standards_json,calculation_engine,engine_version,activated_rule_ids,known_limitations,calculated_at").eq("user_id", userId).eq("calculation_status", "calculated").order("calculated_at", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await query;
    if (error || !data) throw new Error("ยังไม่มีพื้นดวงที่พร้อมแชร์");
    payload = data as Json;
    title = "พื้นดวงกำเนิด";
  } else if (input.type === "compatibility") {
    let query = db.from("compatibility_checks").select("person_label,overall_score,result_json,calculation_engine,calculation_version,rule_ids,citation_snapshot_json,created_at").eq("user_id", userId);
    query = input.sourceId ? query.eq("id", input.sourceId) : query.order("updated_at", { ascending: false }).limit(1);
    const { data, error } = await query.maybeSingle();
    if (error || !data) throw new Error("ไม่พบผลสมพงษ์ที่เลือก");
    payload = data as Json;
    title = `ดวงสมพงษ์ · ${data.person_label}`;
  } else {
    const service = await import("@/lib/insights.server");
    payload = (await service.calculateDailyInsight(await service.userBirth(db as never, userId), new Date())) as unknown as Json;
    title = "สีมงคลและพลังวันนี้";
  }
  const token = makeToken();
  const expiresAt = new Date(Date.now() + input.expiresInDays * 86_400_000).toISOString();
  const { data, error } = await db.from("result_shares").insert({ owner_id: userId, token_hash: hashToken(token), result_type: input.type, title, payload, expires_at: expiresAt }).select("id").single();
  if (error || !data) throw new Error("สร้างลิงก์แชร์ไม่สำเร็จ");
  return { id: data.id, token, expiresAt, title };
}

export async function revokeResultShare(userId: string, id: string) {
  const db = await admin();
  const { error } = await db.from("result_shares").update({ revoked_at: new Date().toISOString() }).eq("id", id).eq("owner_id", userId).is("revoked_at", null);
  if (error) throw new Error("เพิกถอนลิงก์ไม่สำเร็จ");
  return { ok: true };
}

export async function getPublicResultShare(token: string): Promise<PublicShare> {
  const db = await admin();
  const { data, error } = await db.from("result_shares").select("result_type,title,payload,expires_at").eq("token_hash", hashToken(token)).is("revoked_at", null).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (error || !data) throw new Error("ลิงก์นี้หมดอายุ ถูกเพิกถอน หรือไม่ถูกต้อง");
  return { type: data.result_type as ShareKind, title: data.title, payload: data.payload, expiresAt: data.expires_at };
}

export async function createDayTransfer(userId: string, days: number) {
  const db = await admin();
  const { data: credit } = await db.from("user_credits").select("days_remaining").eq("user_id", userId).maybeSingle();
  if (!credit || credit.days_remaining - days < 60) throw new Error("โอนได้เฉพาะวันส่วนที่เกิน 60 วัน");
  const token = makeToken();
  const expiresAt = new Date(Date.now() + 60 * 60_000).toISOString();
  const { data, error } = await db.from("day_transfer_claims").insert({ sender_id: userId, token_hash: hashToken(token), days, expires_at: expiresAt }).select("id").single();
  if (error || !data) throw new Error("สร้าง QR โอนวันไม่สำเร็จ");
  return { id: data.id, token, expiresAt, days };
}

export async function getDayTransferPreview(token: string): Promise<DayTransferPreview> {
  const db = await admin();
  const { data } = await db.from("day_transfer_claims").select("id,days,expires_at,status,sender_id").eq("token_hash", hashToken(token)).maybeSingle();
  if (!data) throw new Error("ไม่พบรายการโอน");
  const { data: sender } = await db.from("profiles").select("display_name").eq("id", data.sender_id).maybeSingle();
  return { id: data.id, days: data.days, senderName: sender?.display_name ?? "เพื่อนของคุณ", expiresAt: data.expires_at, available: data.status === "pending" && new Date(data.expires_at).getTime() > Date.now() };
}

export async function claimDayTransfer(userId: string, token: string) {
  const db = await admin();
  const { data: claim } = await db.from("day_transfer_claims").select("id").eq("token_hash", hashToken(token)).maybeSingle();
  if (!claim) throw new Error("QR ไม่ถูกต้องหรือหมดอายุ");
  const { data, error } = await db.rpc("claim_day_transfer", { _transfer_id: claim.id, _recipient_id: userId });
  if (error) throw new Error(error.message.includes("60") ? "ผู้ส่งต้องเหลืออย่างน้อย 60 วัน" : "รับวันไม่สำเร็จ QR อาจถูกใช้แล้วหรือหมดอายุ");
  return Array.isArray(data) ? data[0] : data;
}

export async function cancelDayTransfer(userId: string, id: string) {
  const db = await admin();
  const { error } = await db.from("day_transfer_claims").update({ status: "cancelled", cancelled_at: new Date().toISOString() }).eq("id", id).eq("sender_id", userId).eq("status", "pending");
  if (error) throw new Error("ยกเลิก QR ไม่สำเร็จ");
  return { ok: true };
}

export async function drawDailyCard(userId: string, kind: CardKind): Promise<CardDraw> {
  const db = await admin();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
  const { data: existing } = await db.from("card_draws").select("result,created_at,activated_rule_ids,citations").eq("user_id", userId).eq("draw_type", kind).eq("draw_date", today).maybeSingle();
  const code = kind === "yes_no" ? "HT-CARD-YESNO-V1" : "HT-CARD-LUCKY-3-V1";
  const { data: rule, error } = await db.from("astrology_rules").select("id,rule_code,outcome_json,confidence,limitations,rule_citations(source_citations(citation_label,locator_text))").eq("rule_code", code).eq("status", "published").single();
  if (error || !rule) throw new Error("กฎไพ่ยังไม่พร้อมเผยแพร่");
  const citations = ((rule.rule_citations ?? []) as Array<{ source_citations: { citation_label: string; locator_text: string } | null }>).flatMap((item) => item.source_citations ? [{ title: item.source_citations.citation_label, locator: item.source_citations.locator_text }] : []);
  if (existing) return { kind, result: existing.result, ruleCode: rule.rule_code, confidence: Number(rule.confidence), citations, limitations: rule.limitations ?? [], drawnAt: existing.created_at };
  const policy = rule.outcome_json as { cards?: Json[]; digits?: Json[]; disclaimer?: string };
  let result: Json;
  if (kind === "yes_no") {
    const cards = policy.cards ?? [];
    const selected = cards.length ? cards[randomInt(cards.length)] : null;
    if (!selected || typeof selected !== "object" || Array.isArray(selected)) throw new Error("policy ไพ่ไม่ครบ");
    result = { ...selected, disclaimer: policy.disclaimer ?? "" };
  } else {
    const digits = policy.digits ?? [];
    if (!digits.length) throw new Error("policy เลขมงคลไม่ครบ");
    const chosen: Json[] = Array.from({ length: 3 }, () => digits[randomInt(digits.length)] ?? null);
    const number = chosen.map((item) => typeof item === "object" && item && !Array.isArray(item) ? String(item["digit"] ?? "") : "").join("");
    result = { number, symbols: chosen, disclaimer: policy.disclaimer ?? "" };
  }
  const { data: saved, error: saveError } = await db.from("card_draws").insert({ user_id: userId, draw_type: kind, draw_date: today, result, activated_rule_ids: [rule.id], citations }).select("created_at").single();
  if (saveError) throw new Error("วันนี้คุณเปิดไพ่ชนิดนี้แล้ว");
  return { kind, result, ruleCode: rule.rule_code, confidence: Number(rule.confidence), citations, limitations: rule.limitations ?? [], drawnAt: saved.created_at };
}

export async function getNotificationPreferences(userId: string) {
  const db = await admin();
  const { data } = await db.from("notification_preferences").select("enabled,event_types").eq("user_id", userId).maybeSingle();
  const events = data?.event_types ?? [];
  return { enabled: data?.enabled ?? false, dailyColor: events.includes("daily_color"), majorTransit: events.includes("major_transit"), creditExpiry: events.includes("credit_expiry") };
}

export async function saveNotificationPreferences(userId: string, input: { enabled: boolean; dailyColor: boolean; majorTransit: boolean; creditExpiry: boolean }) {
  const db = await admin();
  const eventTypes = [input.dailyColor && "daily_color", input.majorTransit && "major_transit", input.creditExpiry && "credit_expiry"].filter(Boolean) as string[];
  const { error } = await db.from("notification_preferences").upsert({ user_id: userId, enabled: input.enabled, channels: input.enabled ? ["line"] : [], event_types: eventTypes, timezone: "Asia/Bangkok", daily_cap: 2, weekly_cap: 10, consented_at: input.enabled ? new Date().toISOString() : null, consent_version: input.enabled ? "line-push-v1" : null }, { onConflict: "user_id" });
  if (error) throw new Error("บันทึกการแจ้งเตือนไม่สำเร็จ");
  return { ...input };
}