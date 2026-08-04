import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getKbAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    const roles = data.map((item) => item.role);
    return { canReview: roles.includes("admin") || roles.includes("reviewer"), isAdmin: roles.includes("admin"), roles };
  });

export const listKbEntities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    entity: z.enum(["sources", "documents", "rules", "review_queue", "conflicts", "schools_systems", "experts", "benchmarks", "astronomy_profiles", "ingestion_jobs"]),
    search: z.string().max(100).default(""),
    status: z.string().max(40).default("all"),
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(5).max(50).default(10),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const roleResult = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roleResult.error) throw new Error(roleResult.error.message);
    if (!roleResult.data.some((item) => item.role === "admin" || item.role === "reviewer")) throw new Error("Forbidden");
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    if (data.entity === "sources") {
      let query = context.supabase.from("kb_sources").select("id,title,author,source_type,copyright_status,status,version,updated_at", { count: "exact" });
      if (data.search) query = query.or(`title.ilike.%${data.search}%,author.ilike.%${data.search}%`);
      if (data.status !== "all") query = query.eq("status", data.status as "candidate");
      const result = await query.order("updated_at", { ascending: false }).range(from, to);
      if (result.error) throw new Error(result.error.message);
      return { rows: result.data, count: result.count ?? 0 };
    }
    if (data.entity === "documents" || data.entity === "ingestion_jobs") {
      let query = context.supabase.from("kb_documents").select("id,title,document_type,ingestion_status,embedding_status,status,version,updated_at", { count: "exact" });
      if (data.search) query = query.ilike("title", `%${data.search}%`);
      if (data.status !== "all") query = data.entity === "ingestion_jobs" ? query.eq("ingestion_status", data.status) : query.eq("status", data.status as "candidate");
      const result = await query.order("updated_at", { ascending: false }).range(from, to);
      if (result.error) throw new Error(result.error.message);
      return { rows: result.data, count: result.count ?? 0 };
    }
    if (data.entity === "rules" || data.entity === "review_queue") {
      let query = context.supabase.from("kb_rules").select("id,rule_key,category,page_locator,outcome_summary,confidence,status,version,updated_at", { count: "exact" });
      if (data.search) query = query.or(`rule_key.ilike.%${data.search}%,outcome_summary.ilike.%${data.search}%`);
      if (data.entity === "review_queue") query = query.in("status", ["normalized", "conflict_flagged", "expert_reviewed"]);
      else if (data.status !== "all") query = query.eq("status", data.status as "candidate");
      const result = await query.order("updated_at", { ascending: false }).range(from, to);
      if (result.error) throw new Error(result.error.message);
      return { rows: result.data, count: result.count ?? 0 };
    }
    if (data.entity === "conflicts") {
      const result = await context.supabase.from("kb_conflicts").select("id,conflict_type,nature_summary,resolution_status,both_publishable,created_at", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
      if (result.error) throw new Error(result.error.message);
      return { rows: result.data, count: result.count ?? 0 };
    }
    if (data.entity === "schools_systems") {
      const result = await context.supabase.from("kb_systems").select("id,slug,name_th,name_en,tradition,status,version,updated_at", { count: "exact" }).order("updated_at", { ascending: false }).range(from, to);
      if (result.error) throw new Error(result.error.message);
      return { rows: result.data, count: result.count ?? 0 };
    }
    if (data.entity === "experts") {
      const result = await context.supabase.from("kb_experts").select("id,display_name,credentials,verification_status,active,updated_at", { count: "exact" }).order("updated_at", { ascending: false }).range(from, to);
      if (result.error) throw new Error(result.error.message);
      return { rows: result.data, count: result.count ?? 0 };
    }
    if (data.entity === "benchmarks") {
      const result = await context.supabase.from("kb_benchmarks").select("id,benchmark_key,title,input_label,calculation_status,status,version,updated_at", { count: "exact" }).order("updated_at", { ascending: false }).range(from, to);
      if (result.error) throw new Error(result.error.message);
      return { rows: result.data, count: result.count ?? 0 };
    }
    const result = await context.supabase.from("astronomy_profiles").select("id,profile_key,name,calculation_engine,engine_version,benchmark_status,status,version,updated_at", { count: "exact" }).order("updated_at", { ascending: false }).range(from, to);
    if (result.error) throw new Error(result.error.message);
    return { rows: result.data, count: result.count ?? 0 };
  });

export const getKbSourceDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ sourceId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const roleResult = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roleResult.error || !roleResult.data.some((item) => item.role === "admin" || item.role === "reviewer")) throw new Error("Forbidden");
    const [source, documents, rules, citations, reviews, conflicts] = await Promise.all([
      context.supabase.from("kb_sources").select("*").eq("id", data.sourceId).single(),
      context.supabase.from("kb_documents").select("*").eq("source_id", data.sourceId).order("created_at"),
      context.supabase.from("kb_rules").select("id,rule_key,page_locator,category,outcome_summary,confidence,status,version").eq("source_id", data.sourceId).order("created_at"),
      context.supabase.from("kb_rule_sources").select("id,rule_id,locator,citation_note,is_primary").eq("source_id", data.sourceId),
      context.supabase.from("kb_review_logs").select("*").eq("entity_id", data.sourceId).order("created_at", { ascending: false }),
      context.supabase.from("kb_conflicts").select("id,rule_a_id,rule_b_id,conflict_type,nature_summary,resolution_status").order("created_at", { ascending: false }),
    ]);
    if (source.error) throw new Error(source.error.message);
    const sourceRuleIds = new Set((rules.data ?? []).map((rule) => rule.id));
    return {
      source: source.data,
      documents: documents.data ?? [],
      rules: rules.data ?? [],
      citations: citations.data ?? [],
      reviews: reviews.data ?? [],
      conflicts: (conflicts.data ?? []).filter((item) => sourceRuleIds.has(item.rule_a_id) || sourceRuleIds.has(item.rule_b_id)),
    };
  });

export const transitionKbRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    ruleId: z.string().uuid(),
    toStatus: z.enum(["candidate", "source_verified", "extracted", "normalized", "conflict_flagged", "expert_reviewed", "published", "deprecated"]),
    notes: z.string().trim().min(3).max(1000),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const roles = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roles.error || !roles.data.some((item) => item.role === "admin")) throw new Error("Forbidden");
    const current = await context.supabase.from("kb_rules").select("id,status,version,reviewer_id,published_at").eq("id", data.ruleId).single();
    if (current.error) throw new Error(current.error.message);
    if (data.toStatus === "published" && (!current.data.reviewer_id || !current.data.published_at)) throw new Error("ต้องมีผู้ตรวจและวันเผยแพร่ก่อนเปิดใช้กฎ");
    const updated = await context.supabase.from("kb_rules").update({ status: data.toStatus }).eq("id", data.ruleId).select("id,status,version").single();
    if (updated.error) throw new Error(updated.error.message);
    const audit = await context.supabase.from("kb_review_logs").insert({
      entity_type: "kb_rule",
      entity_id: data.ruleId,
      entity_version: current.data.version,
      action: data.toStatus === "published" ? "published" : data.toStatus === "deprecated" ? "deprecated" : "commented",
      from_status: current.data.status,
      to_status: data.toStatus,
      actor_user_id: context.userId,
      notes: data.notes,
      snapshot_json: updated.data,
    });
    if (audit.error) throw new Error(audit.error.message);
    return updated.data;
  });