import { z } from "zod";

import { conditionAstSchema } from "./condition-ast";

const systemSchema = z.object({
  id: z.string().min(1), version: z.string().min(1), status: z.string().min(1),
  runtimeEligible: z.boolean(), limitations: z.array(z.string()),
}).passthrough();
const sourceSchema = z.object({
  id: z.string().min(1), authority: z.string().min(1), tradition: z.string().min(1),
  evidence: z.string().min(1), rights: z.string().min(1), allowedUses: z.array(z.string()), status: z.string().min(1),
}).passthrough();
const outcomeSchema = z.object({ outcomeId: z.string().min(1), summaryTh: z.string().min(1), safetyTags: z.array(z.string()) }).strict();
const ruleSchema = z.object({
  ruleId: z.string().min(1), ruleCode: z.string().min(1), version: z.string().min(1), family: z.string().min(1),
  systemId: z.string().min(1), systemVersion: z.string().min(1), condition: conditionAstSchema,
  outcomeId: z.string().min(1), status: z.literal("draft"), evidenceLevel: z.literal("editorial"),
  confidence: z.number().min(0).max(1), priority: z.number().int(), citationIds: z.array(z.string()),
  runtimeEligible: z.literal(false),
}).strict();
const benchmarkSchema = z.object({
  id: z.string().min(1), source: z.string().min(1), status: z.string().min(1),
  methodKnown: z.boolean(), usableAsTruthFixture: z.literal(false),
}).passthrough();

export const masterBrainPackSchema = z.object({
  schema: z.literal("horathai.master-knowledge-pack/v1"), packId: z.string().min(1), version: z.string().endsWith("-draft"),
  createdAt: z.string().datetime(),
  runtimePolicy: z.object({ networkAllowed: z.literal(false), aiRequired: z.literal(false), failClosed: z.literal(true), unknownBirthTimePolicy: z.literal("omit_ascendant_houses_angles"), competitorMaterialPolicy: z.literal("observations_only") }).strict(),
  baseline: z.object({ conceptCountExpected: z.literal(49), existingPublishedEditorialRuleCountExpected: z.literal(5), knowledgeReleaseCountExpected: z.literal(0), strategy: z.literal("reference_then_promote"), abortOnMismatch: z.literal(true) }).strict(),
  activation: z.object({ mode: z.literal("dry_run_only"), productionEligible: z.literal(false), reason: z.string().min(1) }).strict(),
  systems: z.array(systemSchema).min(1), interpretationProfiles: z.array(z.object({ id: z.string(), version: z.string(), systemId: z.string(), systemVersion: z.string(), calculationProfileId: z.string(), calculationProfileVersion: z.string(), releaseId: z.null(), locale: z.literal("th-TH"), status: z.literal("draft"), runtimeEligible: z.literal(false) }).strict()),
  sources: z.array(sourceSchema),
  conditionAst: z.object({ allowedOperators: z.array(z.string()), prohibited: z.array(z.string()), factKeyPolicy: z.literal("canonical_registry_only") }).strict(),
  seedOutcomes: z.array(outcomeSchema), seedRules: z.array(ruleSchema),
  narrativeTemplates: z.object({ renderer: z.literal("horathai_template_th_v1"), version: z.string(), templates: z.record(z.string()), prohibitedPhrases: z.array(z.string()) }).strict(),
  benchmarks: z.array(benchmarkSchema), featureContracts: z.array(z.object({ id: z.string(), ruleFamilies: z.array(z.string()), status: z.string() }).strict()),
  validationGates: z.array(z.string()), productionEligibility: z.string(), dryRunImport: z.array(z.string()),
}).strict();

export type MasterBrainPack = z.infer<typeof masterBrainPackSchema>;