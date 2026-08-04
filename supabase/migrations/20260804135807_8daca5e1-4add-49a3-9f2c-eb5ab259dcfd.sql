UPDATE public.astrology_rules
SET outcome_json = outcome_json || jsonb_build_object(
  'avoid_reason_template', 'น้ำหนักดาว{planet}ต่อพื้นดวงวันนี้ต่ำที่สุดตามเกณฑ์ในกฎที่เผยแพร่'
),
effective_version = '1.1.1',
updated_at = now()
WHERE rule_code = 'HT-DAILY-COLOR-V1'
  AND status = 'published';

INSERT INTO public.knowledge_audit_log (entity_type, entity_id, action, before_json, after_json)
SELECT
  'astrology_rule', r.id, 'policy:daily_avoid_copy_v1_1_1',
  jsonb_build_object('effective_version','1.1.0'),
  jsonb_build_object('effective_version',r.effective_version,'field','avoid_reason_template')
FROM public.astrology_rules r
WHERE r.rule_code = 'HT-DAILY-COLOR-V1'
  AND NOT EXISTS (
    SELECT 1 FROM public.knowledge_audit_log a
    WHERE a.entity_id = r.id AND a.action = 'policy:daily_avoid_copy_v1_1_1'
  );