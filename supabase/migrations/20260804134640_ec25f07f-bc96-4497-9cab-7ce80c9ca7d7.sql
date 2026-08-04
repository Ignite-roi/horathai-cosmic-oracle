ALTER TABLE public.astrology_rules
  ADD COLUMN IF NOT EXISTS institutional_reviewer text,
  ADD COLUMN IF NOT EXISTS limitations text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.astrology_rules DROP CONSTRAINT IF EXISTS astrology_rules_check;
ALTER TABLE public.astrology_rules
  ADD CONSTRAINT astrology_rules_publication_review_check
  CHECK (
    status NOT IN ('approved','published')
    OR (
      approved_at IS NOT NULL
      AND (reviewed_by IS NOT NULL OR length(trim(COALESCE(institutional_reviewer, ''))) >= 3)
    )
  );

CREATE TABLE public.compatibility_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  person_label text NOT NULL CHECK (length(trim(person_label)) BETWEEN 1 AND 40),
  partner_birth_date date NOT NULL,
  partner_birth_time time,
  partner_birth_time_known boolean NOT NULL DEFAULT true,
  partner_country text NOT NULL DEFAULT 'ประเทศไทย' CHECK (length(partner_country) <= 60),
  partner_province text NOT NULL CHECK (length(partner_province) BETWEEN 1 AND 60),
  partner_district text CHECK (partner_district IS NULL OR length(partner_district) <= 60),
  partner_timezone text NOT NULL DEFAULT 'Asia/Bangkok' CHECK (length(partner_timezone) <= 80),
  partner_latitude double precision NOT NULL CHECK (partner_latitude BETWEEN -90 AND 90),
  partner_longitude double precision NOT NULL CHECK (partner_longitude BETWEEN -180 AND 180),
  result_json jsonb NOT NULL,
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  calculation_engine text NOT NULL,
  calculation_version text NOT NULL,
  rule_ids uuid[] NOT NULL DEFAULT '{}',
  citation_snapshot_json jsonb NOT NULL DEFAULT '[]',
  input_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, input_hash)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compatibility_checks TO authenticated;
GRANT ALL ON public.compatibility_checks TO service_role;
ALTER TABLE public.compatibility_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own compatibility checks" ON public.compatibility_checks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own compatibility checks" ON public.compatibility_checks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own compatibility checks" ON public.compatibility_checks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own compatibility checks" ON public.compatibility_checks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_compatibility_checks_updated_at BEFORE UPDATE ON public.compatibility_checks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.astrology_sources (
  source_code, title, author, publisher, edition, publication_year, language, source_type,
  astrology_system_id, rights_status, license_notes, provenance, ingestion_status, source_quality
)
SELECT
  'HORATHAI-METHOD-V1',
  'Horathai Calculation Methodology: Relationship, Daily Color and Electional Scoring',
  'Horathai Editorial & Engineering',
  'Horathai AI',
  '1.0.0',
  2026,
  'th',
  'research'::public.astrology_source_type,
  s.id,
  'user_owned'::public.source_rights_status,
  'วิธีคำนวณต้นฉบับของ Horathai อนุญาตใช้ภายในผลิตภัณฑ์ ไม่ใช่ข้ออ้างจากตำราไทยดั้งเดิม',
  'Documented deterministic product methodology derived from sidereal_lahiri_dev astronomical facts. Cultural and reflective use only.',
  'approved'::public.source_ingestion_status,
  0.72
FROM public.astrology_systems s
WHERE s.system_code = 'sidereal_lahiri_dev'
ON CONFLICT (source_code) DO UPDATE SET
  astrology_system_id = EXCLUDED.astrology_system_id,
  ingestion_status = EXCLUDED.ingestion_status,
  updated_at = now();

INSERT INTO public.source_citations (source_id, locator_text, citation_label)
SELECT s.id, v.locator, v.label
FROM public.astrology_sources s
CROSS JOIN (VALUES
  ('§2 Relationship vector comparison', 'Horathai Method v1 — Relationship scoring'),
  ('§3 Natal-transit daily color selection', 'Horathai Method v1 — Daily color policy'),
  ('§4 Six-month electional day classification', 'Horathai Method v1 — Calendar classification'),
  ('§5 Confidence, missing-time and safety limits', 'Horathai Method v1 — Limitations')
) AS v(locator,label)
WHERE s.source_code = 'HORATHAI-METHOD-V1'
  AND NOT EXISTS (
    SELECT 1 FROM public.source_citations c
    WHERE c.source_id = s.id AND c.locator_text = v.locator
  );

INSERT INTO public.astrology_rules (
  rule_code, system_id, rule_type, title_th, summary_th, condition_json, outcome_json,
  priority, confidence, evidence_level, status, effective_version,
  institutional_reviewer, limitations, approved_at
)
SELECT
  v.rule_code,
  s.id,
  v.rule_type::public.astrology_rule_type,
  v.title_th,
  v.summary_th,
  v.condition_json,
  v.outcome_json,
  v.priority,
  v.confidence,
  'editorial'::public.rule_evidence_level,
  'published'::public.astrology_rule_status,
  '1.0.0',
  'Horathai Editorial & Engineering',
  ARRAY[
    'วิธีคำนวณนี้เป็นแบบจำลองเชิงวัฒนธรรมและการสะท้อนตนเอง ไม่ใช่หลักฐานเชิงวิทยาศาสตร์',
    'sidereal_lahiri_dev ยังไม่ใช่เครื่องคำนวณสุริยยาตร์ไทยที่ผ่านการรับรอง',
    'เมื่อไม่ทราบเวลาเกิด ระบบไม่ใช้ลัคนาและภพของบุคคลนั้น'
  ],
  now()
FROM public.astrology_systems s
CROSS JOIN (VALUES
  (
    'HT-COMPAT-V1', 'compatibility', 'ดวงสมพงษ์ 5 มิติ',
    'เทียบเวกเตอร์ดาวกำเนิดของคนสองคนด้วยมุมสัมพันธ์และกำลังดาว แล้วแปลงเป็นคะแนน 5 มิติ',
    '{"feature":"compatibility"}'::jsonb,
    '{"dimensions":[{"id":"attitude","label":"ทัศนคติ","planets":[1,2,4],"practical_high":"ใช้จุดร่วมวางเป้าหมายและสื่อสารให้ตรงประเด็น","practical_mid":"ตกลงคำจำกัดความและความคาดหวังก่อนตัดสินใจร่วมกัน","practical_low":"เว้นจังหวะก่อนตอบ และสรุปข้อตกลงเป็นลายลักษณ์อักษร"},{"id":"love","label":"ความรัก","planets":[2,6,5],"practical_high":"รักษาพื้นที่ปลอดภัยและแสดงความใส่ใจอย่างสม่ำเสมอ","practical_mid":"ถามภาษาความรักของกันและกันแทนการคาดเดา","practical_low":"ลดการตีความอารมณ์ และกำหนดเวลาคุยเมื่อทั้งคู่พร้อม"},{"id":"partner","label":"หุ้นส่วน","planets":[4,5,6],"practical_high":"แบ่งบทบาทตามจุดแข็งและตรวจเป้าหมายร่วมเป็นระยะ","practical_mid":"กำหนดอำนาจตัดสินใจ งบ และเส้นตายให้ชัด","practical_low":"เริ่มจากโครงการเล็กและใช้หลักฐานก่อนขยายความร่วมมือ"},{"id":"boss","label":"เจ้านาย","planets":[1,5,7],"practical_high":"เสนอภาพรวมพร้อมเหตุผลและกรอบเวลาที่รับผิดชอบได้","practical_mid":"ยืนยันลำดับความสำคัญและรูปแบบรายงานก่อนเริ่มงาน","practical_low":"ลดการปะทะตรง ๆ และบันทึกขอบเขตงานให้ตรวจสอบได้"},{"id":"direct_report","label":"ลูกน้อง","planets":[1,4,7],"practical_high":"มอบหมายผลลัพธ์ที่ชัดและเปิดพื้นที่ให้เลือกวิธีทำ","practical_mid":"แบ่งงานเป็นช่วงสั้นพร้อม feedback ที่เฉพาะเจาะจง","practical_low":"หลีกเลี่ยงคำสั่งคลุมเครือและตรวจความเข้าใจก่อนส่งมอบ"}],"aspect_weights":{"conjunction":8,"sextile":6,"trine":10,"square":-8,"opposition":-10},"base_score":55,"unknown_time_confidence":0.68,"known_time_confidence":0.86}'::jsonb,
    10, 0.72
  ),
  (
    'HT-DAILY-COLOR-V1', 'transit', 'สีส่งเสริมจากดาวจรเทียบดวงกำเนิด',
    'เลือกดาวที่มีน้ำหนักต่อแต่ละด้านจากคะแนนดาวจร-ดวงกำเนิด และใช้ชุดสีที่ประกาศในกฎนี้',
    '{"feature":"daily_color"}'::jsonb,
    '{"categories":[{"id":"fortune","label":"โชคลาภ","area":"money","planets":[5,6,4]},{"id":"career","label":"การงาน","area":"career","planets":[1,4,7]},{"id":"charm","label":"เสน่ห์","area":"love","planets":[6,2,5]},{"id":"health","label":"สุขภาพ","area":"health","planets":[1,3,2]}],"planet_colors":{"1":{"name":"ทองอรุณ","hex":"#D7A83D"},"2":{"name":"เงินจันทร์","hex":"#C7D3E3"},"3":{"name":"แดงชาด","hex":"#B84A3A"},"4":{"name":"เขียวหยก","hex":"#3F8C72"},"5":{"name":"เหลืองบุษราคัม","hex":"#D9B44A"},"6":{"name":"ชมพูกุหลาบ","hex":"#C76B93"},"7":{"name":"ม่วงคราม","hex":"#655A8A"},"8":{"name":"ม่วงราหู","hex":"#704A96"},"9":{"name":"ฟ้านภา","hex":"#4C91A8"}},"avoid_policy":"lowest_weighted_transit_planet","reason_template":"ดาว{planet}จรสัมพันธ์กับพื้นดวงด้าน{category}","wallpaper_notice":"สีเป็นสัญลักษณ์เชิงวัฒนธรรม ใช้เพื่อการสะท้อนและกำหนดเจตนา"}'::jsonb,
    20, 0.7
  ),
  (
    'HT-CALENDAR-V1', 'timing', 'ปฏิทินคะแนนวัน 6 เดือน',
    'คำนวณคะแนนดาวจรเทียบดวงกำเนิดรายวัน แล้วจัดระดับและกิจกรรมจากเกณฑ์ที่เผยแพร่ในกฎ',
    '{"feature":"calendar_day"}'::jsonb,
    '{"bands":[{"min":82,"level":"วันมหาเฮง"},{"min":68,"level":"วันเฮง"},{"min":48,"level":"ปกติ"},{"min":0,"level":"วันควรระวัง"}],"activities":[{"id":"contract","label":"เซ็นสัญญา","area":"career","min":68},{"id":"vehicle","label":"ออกรถ","area":"money","min":68},{"id":"home","label":"ขึ้นบ้านใหม่","area":"family","min":68},{"id":"negotiate","label":"เจรจา","area":"partner","min":68}],"avoid_below":48,"practical_caution":"หากจำเป็นต้องทำกิจกรรมสำคัญในวันที่คะแนนต่ำ ให้ตรวจเอกสาร เวลา และเงื่อนไขสำรองมากกว่าปกติ","sampling_time":"12:00 Asia/Bangkok"}'::jsonb,
    30, 0.7
  )
) AS v(rule_code,rule_type,title_th,summary_th,condition_json,outcome_json,priority,confidence)
WHERE s.system_code = 'sidereal_lahiri_dev'
ON CONFLICT (rule_code) DO UPDATE SET
  condition_json = EXCLUDED.condition_json,
  outcome_json = EXCLUDED.outcome_json,
  summary_th = EXCLUDED.summary_th,
  confidence = EXCLUDED.confidence,
  institutional_reviewer = EXCLUDED.institutional_reviewer,
  limitations = EXCLUDED.limitations,
  approved_at = EXCLUDED.approved_at,
  status = 'published',
  updated_at = now();

INSERT INTO public.rule_citations (rule_id, citation_id, support_type)
SELECT r.id, c.id, 'direct'::public.rule_support_type
FROM public.astrology_rules r
JOIN public.astrology_sources s ON s.source_code = 'HORATHAI-METHOD-V1'
JOIN public.source_citations c ON c.source_id = s.id
WHERE
  (r.rule_code = 'HT-COMPAT-V1' AND c.locator_text IN ('§2 Relationship vector comparison','§5 Confidence, missing-time and safety limits'))
  OR (r.rule_code = 'HT-DAILY-COLOR-V1' AND c.locator_text IN ('§3 Natal-transit daily color selection','§5 Confidence, missing-time and safety limits'))
  OR (r.rule_code = 'HT-CALENDAR-V1' AND c.locator_text IN ('§4 Six-month electional day classification','§5 Confidence, missing-time and safety limits'))
ON CONFLICT (rule_id,citation_id) DO NOTHING;

INSERT INTO public.knowledge_audit_log (entity_type,entity_id,action,before_json,after_json)
SELECT 'astrology_rule', r.id, 'seed:published_methodology_v1', '{}'::jsonb,
  jsonb_build_object('rule_code',r.rule_code,'status',r.status,'effective_version',r.effective_version,'institutional_reviewer',r.institutional_reviewer)
FROM public.astrology_rules r
WHERE r.rule_code IN ('HT-COMPAT-V1','HT-DAILY-COLOR-V1','HT-CALENDAR-V1')
  AND NOT EXISTS (
    SELECT 1 FROM public.knowledge_audit_log a
    WHERE a.entity_id = r.id AND a.action = 'seed:published_methodology_v1'
  );