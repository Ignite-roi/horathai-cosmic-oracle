import { z } from "zod";

import { assertCanonicalFactKey } from "./fact-registry";
import type { CalculatedFact } from "./types";

const scalarSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Scalar = z.infer<typeof scalarSchema>;

export type ConditionAst =
  | { op: "all" | "any"; conditions: ConditionAst[] }
  | { op: "not"; condition: ConditionAst }
  | { op: "eq" | "gt" | "gte" | "lt" | "lte"; fact: string; value: Scalar }
  | { op: "in"; fact: string; values: Scalar[] }
  | { op: "between"; fact: string; min: number; max: number }
  | { op: "exists"; fact: string }
  | { op: "angularWithin"; fact: string; target: number; orb: number };

export const conditionAstSchema: z.ZodType<ConditionAst> = z.lazy(() =>
  z.discriminatedUnion("op", [
    z.object({ op: z.enum(["all", "any"]), conditions: z.array(conditionAstSchema).min(1) }).strict(),
    z.object({ op: z.literal("not"), condition: conditionAstSchema }).strict(),
    z.object({ op: z.enum(["eq", "gt", "gte", "lt", "lte"]), fact: z.string(), value: scalarSchema }).strict(),
    z.object({ op: z.literal("in"), fact: z.string(), values: z.array(scalarSchema).min(1) }).strict(),
    z.object({ op: z.literal("between"), fact: z.string(), min: z.number(), max: z.number() }).strict(),
    z.object({ op: z.literal("exists"), fact: z.string() }).strict(),
    z.object({ op: z.literal("angularWithin"), fact: z.string(), target: z.number(), orb: z.number().min(0).max(180) }).strict(),
  ]),
);

function factValue(facts: ReadonlyMap<string, CalculatedFact["value"]>, key: string) {
  assertCanonicalFactKey(key);
  return facts.get(key);
}

function angularDistance(a: number, b: number): number {
  const distance = Math.abs(a - b) % 360;
  return Math.min(distance, 360 - distance);
}

export function evaluateConditionAst(ast: ConditionAst, facts: CalculatedFact[]): boolean {
  const byKey = new Map(facts.map((fact) => [fact.key, fact.value]));
  const evaluate = (node: ConditionAst): boolean => {
    if (node.op === "all") return node.conditions.every(evaluate);
    if (node.op === "any") return node.conditions.some(evaluate);
    if (node.op === "not") return !evaluate(node.condition);
    const actual = factValue(byKey, node.fact);
    if (node.op === "exists") return byKey.has(node.fact) && actual !== null;
    if (node.op === "eq") return actual === node.value;
    if (node.op === "in") return node.values.includes(actual as Scalar);
    if (node.op === "between") return typeof actual === "number" && actual >= node.min && actual <= node.max;
    if (node.op === "angularWithin") return typeof actual === "number" && angularDistance(actual, node.target) <= node.orb;
    if (typeof actual !== "number" || typeof node.value !== "number") return false;
    if (node.op === "gt") return actual > node.value;
    if (node.op === "gte") return actual >= node.value;
    if (node.op === "lt") return actual < node.value;
    return actual <= node.value;
  };
  return evaluate(conditionAstSchema.parse(ast));
}