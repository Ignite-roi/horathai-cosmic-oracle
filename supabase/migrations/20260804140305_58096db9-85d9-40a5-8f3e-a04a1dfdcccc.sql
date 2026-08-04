INSERT INTO public.astrology_rules (
  rule_code, system_id, rule_type, title_th, summary_th, condition_json, outcome_json,
  priority, confidence, evidence_level, status, effective_version,
  institutional_reviewer, limitations, approved_at
)
SELECT
  v.rule_code,
  s.id,
  'natal'::public.astrology_rule_type,
  v.title_th,
  v.summary_th,
  v.condition_json,
  v.outcome_json,
  v.priority,
  0.62,
  'editorial'::public.rule_evidence_level,
  'published'::public.astrology_rule_status,
  '1.0.0',
  'Horathai Editorial & Engineering',
  ARRAY[
    'ไพ่เป็นเครื่องมือสะท้อนตนเอง ไม่ใช่หลักฐานเชิงวิทยาศาสตร์หรือคำสั่งตัดสินใจ',
    'ไม่ควรใช้แทนคำแนะนำทางการแพทย์ กฎหมาย การเงิน หรือความปลอดภัย'
  ],
  now()
FROM public.astrology_systems s
CROSS JOIN (VALUES
  (
    'HT-CARD-YESNO-V1',
    'ไพ่คำตอบ ใช่ / ไม่ใช่',
    'สุ่มสัญลักษณ์จากชุดคำตอบที่ผ่านการทบทวน แล้วแสดงคำถามสะท้อนเพื่อช่วยให้ผู้ใช้ตัดสินใจอย่างมีสติ',
    '{"feature":"card_yes_no"}'::jsonb,
    '{"cards":[{"id":"yes","answer":"ใช่ — เมื่อเงื่อนไขพร้อม","symbol":"อาทิตย์","reflection":"สำรวจว่าคุณมีข้อมูลและทรัพยากรพอจะเริ่มก้าวแรกหรือยัง"},{"id":"pause","answer":"ชะลอเพื่อทบทวน","symbol":"จันทร์","reflection":"เว้นจังหวะ ตรวจความรู้สึก และหาข้อมูลที่ยังขาดก่อนตัดสินใจ"},{"id":"no","answer":"ยังไม่ควรในตอนนี้","symbol":"เสาร์","reflection":"พิจารณาขอบเขต ความเสี่ยง และทางเลือกที่ปลอดภัยกว่าในเวลานี้"}],"daily_limit_free":1,"disclaimer":"ใช้เพื่อการสะท้อนตนเอง ไม่ใช่คำยืนยันเหตุการณ์ในอนาคต"}'::jsonb,
    40
  ),
  (
    'HT-CARD-LUCKY-3-V1',
    'ไพ่เลขมงคล 3 หลัก',
    'สร้างเลขสามหลักจากชุดสัญลักษณ์ดาวที่ประกาศในกฎ พร้อมคำถามสะท้อนที่ไม่ชี้นำการพนัน',
    '{"feature":"card_lucky_number"}'::jsonb,
    '{"digits":[{"digit":"1","planet":"อาทิตย์","reflection":"เริ่มต้นและยืนหยัดอย่างมีสติ"},{"digit":"2","planet":"จันทร์","reflection":"รับฟังความรู้สึกและความต้องการที่แท้จริง"},{"digit":"3","planet":"อังคาร","reflection":"ใช้พลังอย่างพอดีและไม่เร่งรัด"},{"digit":"4","planet":"พุธ","reflection":"ตรวจข้อมูลและสื่อสารให้ชัด"},{"digit":"5","planet":"พฤหัสบดี","reflection":"มองภาพใหญ่และยึดหลักที่เชื่อถือได้"},{"digit":"6","planet":"ศุกร์","reflection":"สร้างสมดุลระหว่างคุณค่าและความพึงพอใจ"},{"digit":"7","planet":"เสาร์","reflection":"วางขอบเขตและรับผิดชอบต่อผลลัพธ์"},{"digit":"8","planet":"ราหู","reflection":"รู้เท่าทันความอยากและภาพลวงตา"},{"digit":"9","planet":"เกตุ","reflection":"ทบทวนความหมายภายในก่อนเลือกทาง"}],"daily_limit_free":1,"disclaimer":"เลขนี้เป็นสัญลักษณ์เพื่อการสะท้อน ไม่ใช่เลขพนันหรือการรับประกันโชคลาภ"}'::jsonb,
    50
  )
) AS v(rule_code,title_th,summary_th,condition_json,outcome_json,priority)
WHERE s.system_code = 'sidereal_lahiri_dev'
ON CONFLICT (rule_code) DO UPDATE SET
  summary_th = EXCLUDED.summary_th,
  condition_json = EXCLUDED.condition_json,
  outcome_json = EXCLUDED.outcome_json,
  status = 'published',
  effective_version = EXCLUDED.effective_version,
  institutional_reviewer = EXCLUDED.institutional_reviewer,
  limitations = EXCLUDED.limitations,
  approved_at = EXCLUDED.approved_at,
  updated_at = now();

INSERT INTO public.rule_citations(rule_id, citation_id, support_type)
SELECT r.id, c.id, 'context'::public.rule_support_type
FROM public.astrology_rules r
JOIN public.astrology_sources src ON src.source_code = 'HORATHAI-METHOD-V1'
JOIN public.source_citations c ON c.source_id = src.id AND c.locator_text = '§5 Confidence, missing-time and safety limits'
WHERE r.rule_code IN ('HT-CARD-YESNO-V1','HT-CARD-LUCKY-3-V1')
ON CONFLICT (rule_id, citation_id) DO NOTHING;