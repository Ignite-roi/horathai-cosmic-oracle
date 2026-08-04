import type { KnowledgeCitation, KnowledgeRule } from "./types";

export function validateRuleCitations(rule: KnowledgeRule): KnowledgeCitation[] {
  if (rule.status === "published" && rule.citations.length === 0) {
    throw new Error(`Published rule ${rule.ruleCode} has no citation`);
  }
  return rule.citations.filter((citation) =>
    Boolean(citation.sourceCode && citation.sourceTitle && citation.locator),
  );
}

export function citationSnapshot(rules: KnowledgeRule[]): KnowledgeCitation[] {
  const citations = rules.flatMap(validateRuleCitations);
  return Array.from(new Map(citations.map((citation) => [citation.id, citation])).values());
}