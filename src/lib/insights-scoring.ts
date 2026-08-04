export type AspectPolicy = {
  aspect_weights: Record<string, number>;
  aspect_angles: Record<string, number>;
  aspect_orb_degrees: number;
  aspect_fade_degrees: number;
};

export type ScoringPolicy = AspectPolicy & {
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

type ScorePlanet = { num: number; th: string; longitude: number };
type ScoreChart = { planets: ScorePlanet[] };

export function circularDistance(a: number, b: number) {
  const distance = Math.abs(a - b) % 360;
  return Math.min(distance, 360 - distance);
}

export function aspectContribution(distance: number, policy: AspectPolicy) {
  const nearest = Object.entries(policy.aspect_angles)
    .map(([key, angle]) => ({ key, orb: Math.abs(distance - angle) }))
    .sort((a, b) => a.orb - b.orb)[0];
  if (!nearest || nearest.orb > policy.aspect_orb_degrees) {
    return { value: 0, fact: null };
  }
  return {
    value:
      (policy.aspect_weights[nearest.key] ?? 0) *
      Math.max(0, 1 - nearest.orb / policy.aspect_fade_degrees),
    fact: `${nearest.key} คลาด ${nearest.orb.toFixed(1)}°`,
  };
}

export function assertScoringPolicy(
  policy: ScoringPolicy | undefined,
): asserts policy is ScoringPolicy {
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

export function scoreFromPolicy(
  natal: ScoreChart,
  transit: ScoreChart,
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
        const template = aspect.value > 0 ? policy.reason_positive : policy.reason_challenging;
        reasons.push(
          `${template.replace("{planet}", transiting.th).replace("{area}", area.label)} · ${aspect.fact}`,
        );
      }
    }
    if (!reasons.length) reasons.push(policy.reason_neutral.replace("{area}", area.label));
    return {
      area: area.id,
      th: area.label,
      score: Math.max(policy.minimum_score, Math.min(policy.maximum_score, Math.round(raw))),
      reasons,
    };
  });
  return {
    overall: Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length),
    scores,
    confidence: birthTimeKnown ? policy.known_time_confidence : policy.unknown_time_confidence,
  };
}