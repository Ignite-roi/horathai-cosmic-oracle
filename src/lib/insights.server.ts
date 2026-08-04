import { createHash } from "node:crypto";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  ENGINE_LABEL,
  CALCULATION_VERSION,
  birthMoment,
  calculateNatal,
  type BirthInput,
} from "@/lib/astrology-engine.server";
import { computeChart } from "@/lib/ephemeris.server";
import type { PartnerBirthInput } from "@/lib/insights.schemas";
import type {
  CalendarResult,
  CompatibilityResult,
  DailyInsightResult,
  RuleEvidenceDto,
} from "@/lib/insights.types";

const guestWindows = new Map<string, { count: number; resetAt: number }>();

export function assertGuestInsightRateLimit(key: string, limit = 12) {
  const now = Date.now();
  const current = guestWindows.get(key);
  if (!current || current.resetAt <= now) {
    guestWindows.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (current.count >= limit) throw new Error("ส่งคำขอถี่เกินไป กรุณารอหนึ่งนาทีแล้วลองใหม่");
  current.count += 1;
}

type RuleRow = {
  id: string;
  rule_code: string;
  effective_version: string;
  confidence: number;
  outcome_json: Record<string, unknown>;
  limitations: string[];
  rule_citations: Array<{
    source_citations: {
      locator_text: string;
      astrology_sources: { source_code: string; title: string };
    };
  }>;
};

async function publishedRule(code: string): Promise<{ row: RuleRow; evidence: RuleEvidenceDto }> {
  const result = await supabaseAdmin
    .from("astrology_rules")
    .select(
      "id,rule_code,effective_version,confidence,outcome_json,limitations,rule_citations(source_citations(locator_text,astrology_sources(source_code,title)))",
    )
    .eq("rule_code", code)
    .eq("status", "published")
    .single();
  if (result.error || !result.data) throw new Error("ยังไม่มีกฎที่ผ่านการเผยแพร่สำหรับผลลัพธ์นี้");
  const row = result.data as unknown as RuleRow;
  if (!row.rule_citations.length) throw new Error("กฎยังไม่มีแหล่งอ้างอิง จึงไม่สามารถแสดงผลได้");
  return {
    row,
    evidence: {
      ruleId: row.id,
      ruleCode: row.rule_code,
      version: row.effective_version,
      confidence: row.confidence,
      limitations: row.limitations,
      citations: row.rule_citations.map((item) => ({
        sourceCode: item.source_citations.astrology_sources.source_code,
        title: item.source_citations.astrology_sources.title,
        locator: item.source_citations.locator_text,
      })),
    },
  };
}

function circularDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}
type AspectPolicy = {
  aspect_weights: Record<string, number>;
  aspect_angles: Record<string, number>;
  aspect_orb_degrees: number;
  aspect_fade_degrees: number;
};

function aspectContribution(distance: number, policy: AspectPolicy) {
  const targets = Object.entries(policy.aspect_angles);
  const nearest = targets
    .map(([key, angle]) => ({ key, orb: Math.abs(distance - angle) }))
    .sort((a, b) => a.orb - b.orb)[0];
  if (!nearest || nearest.orb > policy.aspect_orb_degrees) return { value: 0, fact: null };
  return {
    value:
      (policy.aspect_weights[nearest.key] ?? 0) *
      Math.max(0, 1 - nearest.orb / policy.aspect_fade_degrees),
    fact: `${nearest.key} คลาด ${nearest.orb.toFixed(1)}°`,
  };
}

function assertScoringPolicy(policy: ScoringPolicy | undefined): asserts policy is ScoringPolicy {
  if (
    !policy ||
    !Number.isFinite(policy.base_score) ||
    !Number.isFinite(policy.minimum_score) ||
    !Number.isFinite(policy.maximum_score) ||
    !Number.isFinite(policy.aspect_orb_degrees) ||
    !Number.isFinite(policy.aspect_fade_degrees) ||
    policy.aspect_fade_degrees <= 0 ||
    !policy.areas.length ||
    !Object.keys(policy.aspect_angles).length
  ) {
    throw new Error("กฎที่เผยแพร่ยังมี policy การคำนวณไม่ครบ จึงไม่สามารถแสดงผลได้");
  }
}

export async function calculateCompatibility(
  primary: BirthInput,
  partner: PartnerBirthInput,
  temporary: boolean,
): Promise<CompatibilityResult> {
  const { row, evidence } = await publishedRule("HT-COMPAT-V1");
  const config = row.outcome_json as {
    base_score: number;
    aspect_weights: Record<string, number>;
    aspect_angles: Record<string, number>;
    aspect_orb_degrees: number;
    aspect_fade_degrees: number;
    minimum_score: number;
    maximum_score: number;
    high_threshold: number;
    mid_threshold: number;
    unknown_time_confidence: number;
    known_time_confidence: number;
    dimensions: Array<{
      id: string;
      label: string;
      planets: number[];
      practical_high: string;
      practical_mid: string;
      practical_low: string;
    }>;
  };
  const [a, b] = await Promise.all([
    calculateNatal(primary),
    calculateNatal({
      birthDate: partner.birthDate,
      birthTime: partner.birthTime ?? "12:00",
      birthTimeKnown: partner.birthTimeKnown,
      latitude: partner.latitude,
      longitude: partner.longitude,
      timezone: partner.timezone,
    }),
  ]);
  const dimensions = config.dimensions.map((dimension) => {
    let raw = config.base_score;
    const facts: string[] = [];
    for (const planet of dimension.planets) {
      const pa = a.planets.find((item) => item.num === planet);
      const pb = b.planets.find((item) => item.num === planet);
      if (!pa || !pb) continue;
      const aspect = aspectContribution(
        circularDistance(pa.longitude, pb.longitude),
        config,
      );
      raw += aspect.value;
      facts.push(
        `ดาว${pa.th}ของทั้งสองห่าง ${circularDistance(pa.longitude, pb.longitude).toFixed(1)}°${aspect.fact ? ` · ${aspect.fact}` : ""}`,
      );
    }
    const score = Math.max(config.minimum_score, Math.min(config.maximum_score, Math.round(raw)));
    const explanation =
      score >= config.high_threshold
        ? dimension.practical_high
        : score >= config.mid_threshold
          ? dimension.practical_mid
          : dimension.practical_low;
    return { id: dimension.id, label: dimension.label, score, explanation, facts };
  });
  return {
    overall: Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length),
    confidence:
      primary.birthTimeKnown && partner.birthTimeKnown
        ? config.known_time_confidence
        : config.unknown_time_confidence,
    dimensions,
    evidence,
    engine: ENGINE_LABEL,
    calculationVersion: CALCULATION_VERSION,
    temporary,
  };
}

type ColorConfig = {
  categories: Array<{ id: string; label: string; area: string; planets: number[] }>;
  planet_colors: Record<string, { name: string; hex: string }>;
  avoid_policy: string;
  reason_template: string;
  scoring_policy: ScoringPolicy;
};

type ScoringPolicy = AspectPolicy & {
  base_score: number;
  minimum_score: number;
  maximum_score: number;
  known_time_confidence: number;
  unknown_time_confidence: number;
  uses_houses_when_time_unknown: false;
  areas: Array<{ id: string; label: string; planets: number[] }>;
  strength_weight: number;
  reason_positive: string;
  reason_challenging: string;
  reason_neutral: string;
};

function scoreFromPolicy(
  natal: ReturnType<typeof computeChart>,
  transit: ReturnType<typeof computeChart>,
  policy: ScoringPolicy,
  birthTimeKnown: boolean,
) {
  if (policy.uses_houses_when_time_unknown !== false) {
    throw new Error("กฎคะแนนยังไม่รับรองการคำนวณเมื่อไม่ทราบเวลาเกิด");
  }
  const scores = policy.areas.map((area) => {
    let raw = policy.base_score;
    const reasons: string[] = [];
    for (const planetId of area.planets) {
      const transiting = transit.planets.find((planet) => planet.num === planetId);
      const born = natal.planets.find((planet) => planet.num === planetId);
      if (!transiting || !born) continue;
      const aspect = aspectContribution(
        circularDistance(transiting.longitude, born.longitude),
        policy,
      );
      raw += aspect.value;
      if (aspect.fact) {
        const template =
          aspect.value > 0 ? policy.reason_positive : policy.reason_challenging;
        reasons.push(
          `${template.replace("{planet}", transiting.th).replace("{area}", area.label)} · ${aspect.fact}`,
        );
      }
    }
    if (!reasons.length) {
      reasons.push(policy.reason_neutral.replace("{area}", area.label));
    }
    return {
      area: area.id,
      th: area.label,
      score: Math.max(
        policy.minimum_score,
        Math.min(policy.maximum_score, Math.round(raw)),
      ),
      reasons,
    };
  });
  return {
    overall: Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length),
    scores,
    confidence: birthTimeKnown
      ? policy.known_time_confidence
      : policy.unknown_time_confidence,
  };
}
export async function calculateDailyInsight(
  birth: BirthInput,
  at: Date,
): Promise<DailyInsightResult> {
  const { row, evidence } = await publishedRule("HT-DAILY-COLOR-V1");
  const config = row.outcome_json as unknown as ColorConfig;
  assertScoringPolicy(config.scoring_policy);
  const natal = computeChart(birthMoment(birth), birth.latitude, birth.longitude);
  const transit = computeChart(at, birth.latitude, birth.longitude);
  const reading = scoreFromPolicy(natal, transit, config.scoring_policy, birth.birthTimeKnown);
  const weighted = config.categories.map((category) => {
    const candidates = transit.planets
      .filter((p) => category.planets.includes(p.num))
      .map((p) => {
        const np = natal.planets.find((n) => n.num === p.num);
        const signal = aspectContribution(
          circularDistance(p.longitude, np?.longitude ?? p.longitude),
          config.scoring_policy,
        ).value;
        return { planet: p, weight: config.scoring_policy.base_score + signal };
      })
      .sort((a, b) => b.weight - a.weight);
    const lead = candidates[0]?.planet ?? transit.planets[0]!;
    const color = config.planet_colors[String(lead.num)]!;
    return {
      id: category.id,
      label: category.label,
      colorName: color.name,
      hex: color.hex,
      planet: lead.num,
      planetTh: lead.th,
      reason: config.reason_template
        .replace("{planet}", lead.th)
        .replace("{category}", category.label),
      weight: candidates[0]?.weight ?? 0,
    };
  });
  const lowest = [...weighted].sort((a, b) => a.weight - b.weight)[0]!;
  const avoidPlanet = transit.planets.find((p) => p.num === lowest.planet)!;
  const avoidColor = config.planet_colors[String(avoidPlanet.num)]!;
  return {
    date: at.toISOString(),
    overall: reading.overall,
    colors: weighted.map(({ weight, ...item }) => item),
    avoid: {
      id: "avoid",
      label: "สีที่ควรเลี่ยง",
      colorName: avoidColor.name,
      hex: avoidColor.hex,
      planet: avoidPlanet.num,
      planetTh: avoidPlanet.th,
      reason: config.avoid_policy.replace("{planet}", avoidPlanet.th),
    },
    scores: reading.scores.map((s) => ({
      area: s.area,
      label: s.th,
      score: s.score,
      reasons: s.reasons,
    })),
    confidence: reading.confidence,
    timeBasis: birth.birthTimeKnown ? "exact" : "date_only",
    evidence,
    engine: ENGINE_LABEL,
    calculationVersion: CALCULATION_VERSION,
  };
}

export async function calculateCalendar(birth: BirthInput, start: string): Promise<CalendarResult> {
  const { row, evidence } = await publishedRule("HT-CALENDAR-V1");
  const config = row.outcome_json as {
    bands: Array<{ min: number; level: string }>;
    activities: Array<{ id: string; label: string; area: string; min: number }>;
    avoid_below: number;
    practical_caution: string;
    scoring_policy: ScoringPolicy;
  };
  assertScoringPolicy(config.scoring_policy);
  const natal = computeChart(birthMoment(birth), birth.latitude, birth.longitude);
  const from = new Date(`${start}T05:00:00.000Z`);
  const days = [];
  for (let i = 0; i < 183; i++) {
    const at = new Date(from.getTime() + i * 86400000);
    const reading = scoreFromPolicy(
      natal,
      computeChart(at, birth.latitude, birth.longitude),
      config.scoring_policy,
      birth.birthTimeKnown,
    );
    const level = [...config.bands]
      .sort((a, b) => b.min - a.min)
      .find((band) => reading.overall >= band.min)?.level;
    if (!level) throw new Error("กฎปฏิทินไม่มีช่วงคะแนนที่รองรับผลลัพธ์นี้");
    const suitable = config.activities
      .filter((a) => (reading.scores.find((s) => s.area === a.area)?.score ?? 0) >= a.min)
      .map((a) => a.label);
    const avoid = config.activities
      .filter(
        (a) => (reading.scores.find((s) => s.area === a.area)?.score ?? 100) < config.avoid_below,
      )
      .map((a) => a.label);
    days.push({
      date: at.toISOString().slice(0, 10),
      overall: reading.overall,
      level,
      suitable,
      avoid,
      scores: reading.scores.map((s) => ({
        area: s.area,
        label: s.th,
        score: s.score,
        reasons: s.reasons,
      })),
    });
  }
  return {
    start: days[0]!.date,
    end: days.at(-1)!.date,
    days,
    confidence: birth.birthTimeKnown
      ? config.scoring_policy.known_time_confidence
      : config.scoring_policy.unknown_time_confidence,
    timeBasis: birth.birthTimeKnown ? "exact" : "date_only",
    evidence,
    engine: ENGINE_LABEL,
    calculationVersion: CALCULATION_VERSION,
  };
}

export function compatibilityHash(userId: string, partner: PartnerBirthInput) {
  return createHash("sha256")
    .update(
      [userId, partner.label, partner.birthDate, partner.birthTime ?? "", partner.province].join(
        "|",
      ),
    )
    .digest("hex");
}

export async function userBirth(
  supabase: typeof supabaseAdmin,
  userId: string,
): Promise<BirthInput> {
  const result = await supabase
    .from("birth_profiles")
    .select("birth_date,birth_time,birth_time_known,latitude,longitude,timezone")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .single();
  if (result.error) throw new Error("ยังไม่พบดวงกำเนิด กรุณาผูกดวงก่อน");
  return {
    birthDate: result.data.birth_date,
    birthTime: (result.data.birth_time ?? "12:00").slice(0, 5),
    birthTimeKnown: result.data.birth_time_known,
    latitude: result.data.latitude,
    longitude: result.data.longitude,
    timezone: result.data.timezone,
  };
}
