UPDATE public.astrology_rules
SET outcome_json = outcome_json || jsonb_build_object(
  'scoring_policy', jsonb_build_object(
    'base_score', 55,
    'minimum_score', 12,
    'maximum_score', 98,
    'known_time_confidence', 0.82,
    'unknown_time_confidence', 0.66,
    'uses_houses_when_time_unknown', false,
    'aspect_orb_degrees', 8,
    'aspect_fade_degrees', 12,
    'aspect_angles', jsonb_build_object(
      'conjunction', 0,
      'sextile', 60,
      'square', 90,
      'trine', 120,
      'opposition', 180
    ),
    'aspect_weights', jsonb_build_object(
      'conjunction', 5,
      'sextile', 6,
      'square', -7,
      'trine', 9,
      'opposition', -8
    ),
    'areas', jsonb_build_array(
      jsonb_build_object('id','career','label','การงาน','planets',jsonb_build_array(1,4,7)),
      jsonb_build_object('id','money','label','การเงิน','planets',jsonb_build_array(5,6,4)),
      jsonb_build_object('id','love','label','ความรัก','planets',jsonb_build_array(6,2,5)),
      jsonb_build_object('id','health','label','สุขภาพ','planets',jsonb_build_array(1,3,2)),
      jsonb_build_object('id','family','label','ครอบครัว','planets',jsonb_build_array(2,5,4)),
      jsonb_build_object('id','partner','label','คู่สัมพันธ์','planets',jsonb_build_array(6,5,2))
    ),
    'strength_weight', 10,
    'reason_positive', 'ดาว{planet}จรทำมุมส่งเสริมกับดาวกำเนิดในด้าน{area}',
    'reason_challenging', 'ดาว{planet}จรทำมุมตึงเครียดกับดาวกำเนิดในด้าน{area}',
    'reason_neutral', 'ตำแหน่งดาวจรด้าน{area}ไม่มีมุมเด่นในระยะที่กฎกำหนด'
  )
),
effective_version = '1.1.0',
updated_at = now()
WHERE rule_code IN ('HT-DAILY-COLOR-V1','HT-CALENDAR-V1')
  AND status = 'published';

INSERT INTO public.knowledge_audit_log (entity_type, entity_id, action, before_json, after_json)
SELECT
  'astrology_rule',
  r.id,
  'policy:knowledge_backed_scoring_v1_1',
  jsonb_build_object('effective_version','1.0.0'),
  jsonb_build_object(
    'effective_version',r.effective_version,
    'uses_houses_when_time_unknown',false,
    'policy_source','outcome_json.scoring_policy'
  )
FROM public.astrology_rules r
WHERE r.rule_code IN ('HT-DAILY-COLOR-V1','HT-CALENDAR-V1')
  AND NOT EXISTS (
    SELECT 1 FROM public.knowledge_audit_log a
    WHERE a.entity_id = r.id AND a.action = 'policy:knowledge_backed_scoring_v1_1'
  );