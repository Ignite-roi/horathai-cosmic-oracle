export type CitationDto = { sourceCode: string; title: string; locator: string };
export type RuleEvidenceDto = {
  ruleId: string;
  ruleCode: string;
  version: string;
  confidence: number;
  citations: CitationDto[];
  limitations: string[];
};

export type CompatibilityDimension = {
  id: string;
  label: string;
  score: number;
  explanation: string;
  facts: string[];
};
export type CompatibilityResult = {
  overall: number;
  confidence: number;
  dimensions: CompatibilityDimension[];
  evidence: RuleEvidenceDto;
  engine: string;
  calculationVersion: string;
  temporary: boolean;
};

export type DailyColor = {
  id: string;
  label: string;
  colorName: string;
  hex: string;
  planet: number;
  planetTh: string;
  reason: string;
};
export type DailyInsightResult = {
  date: string;
  overall: number;
  colors: DailyColor[];
  avoid: DailyColor;
  scores: Array<{ area: string; label: string; score: number; reasons: string[] }>;
  confidence: number;
  timeBasis: "exact" | "date_only";
  evidence: RuleEvidenceDto;
  engine: string;
  calculationVersion: string;
};

export type CalendarDay = {
  date: string;
  overall: number;
  level: string;
  suitable: string[];
  avoid: string[];
  scores: Array<{ area: string; label: string; score: number; reasons: string[] }>;
};
export type CalendarResult = {
  start: string;
  end: string;
  days: CalendarDay[];
  confidence: number;
  timeBasis: "exact" | "date_only";
  evidence: RuleEvidenceDto;
  engine: string;
  calculationVersion: string;
};
