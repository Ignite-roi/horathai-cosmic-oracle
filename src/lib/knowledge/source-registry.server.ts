import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Json } from "@/integrations/supabase/types";

export async function getKnowledgeAdminOverview() {
  const [sources, systems, rules] = await Promise.all([
    supabaseAdmin.from("astrology_sources").select("id,source_code,title,author,rights_status,ingestion_status,page_count,updated_at").order("updated_at", { ascending: false }),
    supabaseAdmin.from("astrology_systems").select("id,system_code,name_th,version,status").order("system_code"),
    supabaseAdmin.from("astrology_rules").select("id,rule_code,system_id,rule_type,status,title_th,confidence,updated_at").order("updated_at", { ascending: false }),
  ]);
  if (sources.error) throw new Error(sources.error.message);
  if (systems.error) throw new Error(systems.error.message);
  if (rules.error) throw new Error(rules.error.message);
  return { sources: sources.data, systems: systems.data, rules: rules.data };
}

export async function createDraftKnowledgeRule(input: {
  actorId: string; ruleCode: string; systemId: string; ruleType: "natal" | "transit" | "dignity" | "aspect" | "yoga" | "taksa" | "timing" | "compatibility" | "interpretation";
  titleTh: string; summaryTh: string; condition: Record<string, unknown>; outcome: Record<string, unknown>; evidenceLevel: "primary_source" | "secondary_source" | "editorial" | "inference" | "experimental";
}) {
  const result = await supabaseAdmin.from("astrology_rules").insert({ rule_code: input.ruleCode, system_id: input.systemId, rule_type: input.ruleType, title_th: input.titleTh, summary_th: input.summaryTh, condition_json: input.condition as Json, outcome_json: input.outcome as Json, confidence: 0.5, evidence_level: input.evidenceLevel, effective_version: "1.0.0", created_by: input.actorId, status: "draft" }).select("*").single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function attachRuleCitation(input: { ruleId: string; citationId: string; supportType: "direct" | "paraphrase" | "context" | "conflict" }) {
  const result = await supabaseAdmin.from("rule_citations").upsert({ rule_id: input.ruleId, citation_id: input.citationId, support_type: input.supportType }).select("*").single();
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function transitionKnowledgeRule(input: { actorId: string; ruleId: string; status: "review" | "approved" | "published" | "deprecated" | "rejected" }) {
  const current = await supabaseAdmin.from("astrology_rules").select("*").eq("id", input.ruleId).single();
  if (current.error) throw new Error(current.error.message);
  if (input.status === "published") {
    const citations = await supabaseAdmin.from("rule_citations").select("citation_id", { count: "exact", head: true }).eq("rule_id", input.ruleId);
    if (citations.error) throw new Error(citations.error.message);
    if (!citations.count) throw new Error("Published rule requires at least one citation");
  }
  const patch = input.status === "approved" || input.status === "published" ? { status: input.status, reviewed_by: input.actorId, approved_at: new Date().toISOString() } : { status: input.status };
  const updated = await supabaseAdmin.from("astrology_rules").update(patch).eq("id", input.ruleId).select("*").single();
  if (updated.error) throw new Error(updated.error.message);
  const audit = await supabaseAdmin.from("knowledge_audit_log").insert({ actor_id: input.actorId, entity_type: "astrology_rule", entity_id: input.ruleId, action: `status:${input.status}`, before_json: current.data, after_json: updated.data });
  if (audit.error) throw new Error(audit.error.message);
  return updated.data;
}