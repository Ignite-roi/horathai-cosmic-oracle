UPDATE public.astrology_rules
SET outcome_json = outcome_json || jsonb_build_object(
  'minimum_score', 12,
  'maximum_score', 98,
  'high_threshold', 68,
  'mid_threshold', 48,
  'aspect_orb_degrees', 8,
  'aspect_fade_degrees', 12,
  'aspect_angles', jsonb_build_object(
    'conjunction', 0,
    'sextile', 60,
    'square', 90,
    'trine', 120,
    'opposition', 180
  )
),
effective_version = '1.1.0',
updated_at = now()
WHERE rule_code = 'HT-COMPAT-V1'
  AND status = 'published';

INSERT INTO public.knowledge_audit_log (entity_type, entity_id, action, before_json, after_json)
SELECT
  'astrology_rule',
  r.id,
  'policy:compatibility_thresholds_v1_1',
  jsonb_build_object('effective_version','1.0.0'),
  jsonb_build_object('effective_version',r.effective_version,'policy_source','outcome_json')
FROM public.astrology_rules r
WHERE r.rule_code = 'HT-COMPAT-V1'
  AND NOT EXISTS (
    SELECT 1 FROM public.knowledge_audit_log a
    WHERE a.entity_id = r.id AND a.action = 'policy:compatibility_thresholds_v1_1'
  );