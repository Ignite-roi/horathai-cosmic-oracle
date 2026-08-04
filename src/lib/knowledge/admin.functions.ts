import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getKnowledgeAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (role.error || !role.data) throw new Error("Forbidden");
    const { getKnowledgeAdminOverview } = await import("./source-registry.server");
    return getKnowledgeAdminOverview();
  });

export const createKnowledgeDraftRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        ruleCode: z
          .string()
          .trim()
          .min(3)
          .max(100)
          .regex(/^[A-Z0-9_-]+$/),
        systemId: z.string().uuid(),
        ruleType: z.enum([
          "natal",
          "transit",
          "dignity",
          "aspect",
          "yoga",
          "taksa",
          "timing",
          "compatibility",
          "interpretation",
        ]),
        titleTh: z.string().trim().min(3).max(200),
        summaryTh: z.string().trim().min(3).max(1000),
        condition: z.record(z.string(), z.unknown()),
        outcome: z.record(z.string(), z.unknown()),
        evidenceLevel: z.enum([
          "primary_source",
          "secondary_source",
          "editorial",
          "inference",
          "experimental",
        ]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const role = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (role.error || !role.data) throw new Error("Forbidden");
    const { createDraftKnowledgeRule } = await import("./source-registry.server");
    return createDraftKnowledgeRule({ actorId: context.userId, ...data });
  });


export const attachKnowledgeCitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        ruleId: z.string().uuid(),
        citationId: z.string().uuid(),
        supportType: z.enum(["direct", "paraphrase", "context", "conflict"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const role = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (role.error || !role.data) throw new Error("Forbidden");
    const { attachRuleCitation } = await import("./source-registry.server");
    return attachRuleCitation(data);
  });

export const changeKnowledgeRuleStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        ruleId: z.string().uuid(),
        status: z.enum(["review", "approved", "published", "deprecated", "rejected"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const role = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (role.error || !role.data) throw new Error("Forbidden");
    const { transitionKnowledgeRule } = await import("./source-registry.server");
    return transitionKnowledgeRule({ actorId: context.userId, ...data });
  });