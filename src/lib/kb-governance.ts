export const KB_WORKFLOW = [
  "candidate",
  "source_verified",
  "extracted",
  "normalized",
  "conflict_flagged",
  "expert_reviewed",
  "published",
  "deprecated",
] as const;

export type KbWorkflowStatus = (typeof KB_WORKFLOW)[number];

export type GovernedCitation = {
  sourceId: string;
  sourceTitle: string;
  author: string | null;
  locator: string;
  ruleId: string;
  ruleVersion: number;
};

export type GovernedRule = {
  id: string;
  status: KbWorkflowStatus;
  conditions: Record<string, unknown>;
  outcomeSummary: string;
  copyrightSafeWording: string;
  confidence: number;
  conflictOpen: boolean;
  citations: GovernedCitation[];
};

export function isCitationComplete(citation: GovernedCitation): boolean {
  return Boolean(
    citation.sourceId &&
      citation.sourceTitle.trim() &&
      citation.locator.trim() &&
      citation.ruleId &&
      citation.ruleVersion > 0,
  );
}

/** Production interpretation may consume only published, cited, conflict-safe rules. */
export function productionEligibleRules(rules: GovernedRule[]): GovernedRule[] {
  return rules.filter(
    (rule) =>
      rule.status === "published" &&
      !rule.conflictOpen &&
      rule.citations.length > 0 &&
      rule.citations.every(isCitationComplete),
  );
}

export function sourceAllowsFulltext(source: {
  fulltextStorageAllowed: boolean;
  copyrightStatus: string;
}): boolean {
  return source.fulltextStorageAllowed && source.copyrightStatus !== "RIGHTS_UNVERIFIED_USER_SUPPLIED";
}

export function canAdvanceVersion(previousVersion: number, nextVersion: number): boolean {
  return Number.isInteger(previousVersion) && nextVersion === previousVersion + 1;
}

export function shouldUseDemoReading(hasSession: boolean, hasSavedChart: boolean): boolean {
  return !hasSession && !hasSavedChart;
}