export type KnowledgeSystemRef = {
  id: string;
  code: string;
  version: string;
};

export type CalculatedFact = {
  key: string;
  value: string | number | boolean | null;
  authority: "calculation_engine" | "natal_chart" | "neutral_transit";
  provenance: string;
};

export type NeutralTransitEvent = {
  id: string;
  eventCode: string;
  eventType: string;
  systemId: string;
  eventTime: string;
  facts: CalculatedFact[];
  calculationEngine: string;
  calculationVersion: string;
};

export type KnowledgeCitation = {
  id: string;
  sourceCode: string;
  sourceTitle: string;
  locator: string;
  supportType: "direct" | "paraphrase" | "context" | "conflict";
};

export type KnowledgeRule = {
  id: string;
  ruleCode: string;
  systemId: string;
  systemVersion: string;
  ruleType: string;
  status: "draft" | "review" | "approved" | "published" | "deprecated" | "rejected";
  condition: Record<string, unknown>;
  outcome: Record<string, unknown>;
  outcomeId?: string;
  confidence: number;
  priority: number;
  citations: KnowledgeCitation[];
  limitations: string[];
  runtimeEligible?: boolean;
  inImmutableRelease?: boolean;
  citationsReviewed?: boolean;
  rightsCleared?: boolean;
  reviewerApproved?: boolean;
  testsPassed?: boolean;
  openBlockingConflict?: boolean;
  evidenceGrade?: "A" | "B" | "C" | "D";
  evidenceCoverage?: number;
  conditionSpecificity?: number;
  requiredFactKeys?: string[];
  conclusionCode?: string;
};

export type RuleEngineInput = {
  system: KnowledgeSystemRef;
  calculationProfile: { id: string; version: string };
  interpretationProfile: {
    id: string;
    version: string;
    calculationProfileId: string;
    calculationProfileVersion: string;
    systemId: string;
    systemVersion: string;
    releaseId: string;
  };
  chartFacts: CalculatedFact[];
  transitEvent?: NeutralTransitEvent;
  releaseRuleIds?: string[];
};

export type RuleMatch = {
  ruleId: string;
  ruleCode: string;
  outcomeId: string;
  factsUsed: CalculatedFact[];
  citations: KnowledgeCitation[];
  confidence: number;
  limitations: string[];
  systemId: string;
  systemVersion: string;
  releaseId: string;
};

export type RuleEngineOutput = {
  system: KnowledgeSystemRef;
  matches: RuleMatch[];
};

export type InterpretationContext = {
  system: KnowledgeSystemRef;
  calculatedFacts: CalculatedFact[];
  matchedRules: Array<Pick<KnowledgeRule, "id" | "ruleCode" | "outcome" | "confidence">>;
  citations: KnowledgeCitation[];
  wordingConstraints: string[];
  prohibitedCapabilities: string[];
};
