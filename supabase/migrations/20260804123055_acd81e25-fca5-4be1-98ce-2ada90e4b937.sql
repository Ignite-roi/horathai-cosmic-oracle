CREATE TYPE public.astrology_source_type AS ENUM ('book','manuscript','article','website','research','user_note');
CREATE TYPE public.source_rights_status AS ENUM ('public_domain','open_license','user_owned','permission_granted','review_required','restricted');
CREATE TYPE public.source_ingestion_status AS ENUM ('registered','queued','extracted','reviewing','approved','rejected');
CREATE TYPE public.transcription_status AS ENUM ('pending','extracted','reviewing','approved','rejected');
CREATE TYPE public.knowledge_job_status AS ENUM ('queued','running','completed','failed','cancelled');
CREATE TYPE public.knowledge_issue_severity AS ENUM ('low','medium','high','critical');
CREATE TYPE public.knowledge_issue_status AS ENUM ('open','reviewing','resolved','wont_fix');
CREATE TYPE public.astrology_rule_type AS ENUM ('natal','transit','dignity','aspect','yoga','taksa','timing','compatibility','interpretation');
CREATE TYPE public.rule_evidence_level AS ENUM ('primary_source','secondary_source','editorial','inference','experimental');
CREATE TYPE public.astrology_rule_status AS ENUM ('draft','review','approved','published','deprecated','rejected');
CREATE TYPE public.rule_support_type AS ENUM ('direct','paraphrase','context','conflict');
CREATE TYPE public.knowledge_release_status AS ENUM ('draft','published','retired');
CREATE TYPE public.transit_definition_type AS ENUM ('sign_ingress','house_ingress','retrograde_start','direct_start','exact_aspect','natal_contact','eclipse','lunation');

CREATE TABLE public.astrology_systems (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), system_code text NOT NULL UNIQUE, name_th text NOT NULL, name_en text NOT NULL,
 description text NOT NULL DEFAULT '', zodiac_type text NOT NULL, ayanamsa text, house_system text, node_type text,
 aspect_model text, status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','deprecated')), version text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astrology_systems TO authenticated; GRANT ALL ON public.astrology_systems TO service_role;
ALTER TABLE public.astrology_systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active astrology systems readable" ON public.astrology_systems FOR SELECT TO authenticated USING (status = 'active');

CREATE TABLE public.astrology_sources (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_code text NOT NULL UNIQUE, title text NOT NULL, alternative_titles text[] NOT NULL DEFAULT '{}',
 author text, editor_translator text, publisher text, edition text, publication_year integer, language text NOT NULL DEFAULT 'th',
 source_type public.astrology_source_type NOT NULL, astrology_system_id uuid REFERENCES public.astrology_systems(id) ON DELETE SET NULL,
 rights_status public.source_rights_status NOT NULL DEFAULT 'review_required', license_notes text NOT NULL DEFAULT '', provenance text NOT NULL,
 file_reference text, checksum text UNIQUE, page_count integer CHECK (page_count IS NULL OR page_count > 0),
 ingestion_status public.source_ingestion_status NOT NULL DEFAULT 'registered', source_quality numeric(5,4) CHECK (source_quality IS NULL OR source_quality BETWEEN 0 AND 1),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id,source_code,title,alternative_titles,author,editor_translator,publisher,edition,publication_year,language,source_type,astrology_system_id,rights_status,license_notes,provenance,page_count,ingestion_status,source_quality,created_at,updated_at) ON public.astrology_sources TO authenticated;
GRANT ALL ON public.astrology_sources TO service_role;
ALTER TABLE public.astrology_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved source metadata readable" ON public.astrology_sources FOR SELECT TO authenticated USING (ingestion_status = 'approved' AND rights_status <> 'restricted');

CREATE TABLE public.source_sections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES public.astrology_sources(id) ON DELETE CASCADE,
 parent_id uuid REFERENCES public.source_sections(id) ON DELETE SET NULL, section_code text NOT NULL, title text NOT NULL,
 page_start integer, page_end integer, sequence integer NOT NULL DEFAULT 0, raw_text text, normalized_text text,
 transcription_status public.transcription_status NOT NULL DEFAULT 'pending', confidence numeric(5,4) CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
 reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, approved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(source_id,section_code), CHECK (page_start IS NULL OR page_start > 0), CHECK (page_end IS NULL OR page_end >= page_start)
);
GRANT ALL ON public.source_sections TO service_role;
ALTER TABLE public.source_sections ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.source_citations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES public.astrology_sources(id) ON DELETE RESTRICT,
 section_id uuid REFERENCES public.source_sections(id) ON DELETE SET NULL, page_start integer, page_end integer, locator_text text NOT NULL,
 excerpt_hash text, citation_label text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (page_start IS NULL OR page_start > 0), CHECK (page_end IS NULL OR page_end >= page_start)
);
GRANT SELECT ON public.source_citations TO authenticated; GRANT ALL ON public.source_citations TO service_role;
ALTER TABLE public.source_citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citations for approved sources readable" ON public.source_citations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.astrology_sources s WHERE s.id = source_id AND s.ingestion_status = 'approved' AND s.rights_status <> 'restricted'));

CREATE TABLE public.ingestion_jobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES public.astrology_sources(id) ON DELETE CASCADE,
 job_type text NOT NULL, status public.knowledge_job_status NOT NULL DEFAULT 'queued', progress numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
 error_summary text, started_at timestamptz, finished_at timestamptz, created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ingestion_jobs TO service_role;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ingestion_issues (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES public.astrology_sources(id) ON DELETE CASCADE,
 section_id uuid REFERENCES public.source_sections(id) ON DELETE SET NULL, issue_type text NOT NULL,
 severity public.knowledge_issue_severity NOT NULL, description text NOT NULL, status public.knowledge_issue_status NOT NULL DEFAULT 'open',
 reviewer_notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ingestion_issues TO service_role;
ALTER TABLE public.ingestion_issues ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.astrology_concepts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), concept_code text NOT NULL UNIQUE, concept_type text NOT NULL CHECK (concept_type IN ('planet','sign','house','aspect','dignity','yoga','element','modality','nakshatra','taksa','weekday','lunar_day','transit_event','life_area')),
 name_th text NOT NULL, name_en text NOT NULL, aliases text[] NOT NULL DEFAULT '{}', description text NOT NULL DEFAULT '',
 parent_id uuid REFERENCES public.astrology_concepts(id) ON DELETE SET NULL, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astrology_concepts TO authenticated; GRANT ALL ON public.astrology_concepts TO service_role;
ALTER TABLE public.astrology_concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Concept taxonomy readable" ON public.astrology_concepts FOR SELECT TO authenticated USING (true);

CREATE TABLE public.astrology_rules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_code text NOT NULL UNIQUE, system_id uuid NOT NULL REFERENCES public.astrology_systems(id) ON DELETE RESTRICT,
 rule_type public.astrology_rule_type NOT NULL, title_th text NOT NULL, summary_th text NOT NULL, condition_json jsonb NOT NULL,
 outcome_json jsonb NOT NULL, priority integer NOT NULL DEFAULT 100, confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
 evidence_level public.rule_evidence_level NOT NULL, status public.astrology_rule_status NOT NULL DEFAULT 'draft', effective_version text NOT NULL,
 supersedes_rule_id uuid REFERENCES public.astrology_rules(id) ON DELETE SET NULL, created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL, approved_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (status NOT IN ('approved','published') OR (reviewed_by IS NOT NULL AND approved_at IS NOT NULL))
);
GRANT SELECT ON public.astrology_rules TO authenticated; GRANT ALL ON public.astrology_rules TO service_role;
ALTER TABLE public.astrology_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published astrology rules readable" ON public.astrology_rules FOR SELECT TO authenticated USING (status = 'published');

CREATE TABLE public.rule_citations (
 rule_id uuid NOT NULL REFERENCES public.astrology_rules(id) ON DELETE CASCADE, citation_id uuid NOT NULL REFERENCES public.source_citations(id) ON DELETE RESTRICT,
 support_type public.rule_support_type NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(rule_id,citation_id)
);
GRANT SELECT ON public.rule_citations TO authenticated; GRANT ALL ON public.rule_citations TO service_role;
ALTER TABLE public.rule_citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published rule citations readable" ON public.rule_citations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.astrology_rules r WHERE r.id = rule_id AND r.status = 'published'));

CREATE TABLE public.rule_tags (
 rule_id uuid NOT NULL REFERENCES public.astrology_rules(id) ON DELETE CASCADE, concept_id uuid NOT NULL REFERENCES public.astrology_concepts(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(rule_id,concept_id)
);
GRANT SELECT ON public.rule_tags TO authenticated; GRANT ALL ON public.rule_tags TO service_role;
ALTER TABLE public.rule_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published rule tags readable" ON public.rule_tags FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.astrology_rules r WHERE r.id = rule_id AND r.status = 'published'));

CREATE TABLE public.rule_conflicts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_a_id uuid NOT NULL REFERENCES public.astrology_rules(id) ON DELETE CASCADE,
 rule_b_id uuid NOT NULL REFERENCES public.astrology_rules(id) ON DELETE CASCADE, conflict_type text NOT NULL, notes text NOT NULL DEFAULT '',
 resolution_status text NOT NULL DEFAULT 'open' CHECK (resolution_status IN ('open','reviewing','resolved','accepted_variance')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK(rule_a_id <> rule_b_id), UNIQUE(rule_a_id,rule_b_id)
);
GRANT ALL ON public.rule_conflicts TO service_role;
ALTER TABLE public.rule_conflicts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.concept_relationships (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), subject_concept_id uuid NOT NULL REFERENCES public.astrology_concepts(id) ON DELETE CASCADE,
 predicate text NOT NULL, object_concept_id uuid NOT NULL REFERENCES public.astrology_concepts(id) ON DELETE CASCADE,
 system_id uuid NOT NULL REFERENCES public.astrology_systems(id) ON DELETE CASCADE, source_rule_id uuid REFERENCES public.astrology_rules(id) ON DELETE SET NULL,
 confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(subject_concept_id,predicate,object_concept_id,system_id)
);
GRANT SELECT ON public.concept_relationships TO authenticated; GRANT ALL ON public.concept_relationships TO service_role;
ALTER TABLE public.concept_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grounded concept relationships readable" ON public.concept_relationships FOR SELECT TO authenticated USING (source_rule_id IS NULL OR EXISTS (SELECT 1 FROM public.astrology_rules r WHERE r.id = source_rule_id AND r.status = 'published'));

ALTER TABLE public.interpretation_templates ADD COLUMN IF NOT EXISTS system_id uuid REFERENCES public.astrology_systems(id) ON DELETE RESTRICT;
ALTER TABLE public.interpretation_templates ADD COLUMN IF NOT EXISTS template_code text;
ALTER TABLE public.interpretation_templates ADD COLUMN IF NOT EXISTS rule_type public.astrology_rule_type;
ALTER TABLE public.interpretation_templates ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'th-TH';
ALTER TABLE public.interpretation_templates ADD COLUMN IF NOT EXISTS safety_level text NOT NULL DEFAULT 'reflective';
CREATE UNIQUE INDEX IF NOT EXISTS interpretation_templates_system_code_idx ON public.interpretation_templates(system_id,template_code) WHERE system_id IS NOT NULL AND template_code IS NOT NULL;

CREATE TABLE public.transit_event_definitions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_code text NOT NULL UNIQUE, planet_concept_id uuid REFERENCES public.astrology_concepts(id) ON DELETE RESTRICT,
 event_type public.transit_definition_type NOT NULL, orb_policy_json jsonb NOT NULL DEFAULT '{}', system_id uuid NOT NULL REFERENCES public.astrology_systems(id) ON DELETE RESTRICT,
 version text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transit_event_definitions TO authenticated; GRANT ALL ON public.transit_event_definitions TO service_role;
ALTER TABLE public.transit_event_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transit definitions readable" ON public.transit_event_definitions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.transit_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_definition_id uuid NOT NULL REFERENCES public.transit_event_definitions(id) ON DELETE RESTRICT,
 event_time timestamptz NOT NULL, window_start timestamptz, window_end timestamptz, from_sign_id uuid REFERENCES public.astrology_concepts(id) ON DELETE RESTRICT,
 to_sign_id uuid REFERENCES public.astrology_concepts(id) ON DELETE RESTRICT, degree numeric(8,5), longitude numeric(8,5), retrograde boolean NOT NULL DEFAULT false,
 calculation_engine text NOT NULL, calculation_version text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}', event_hash text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transit_events TO authenticated; GRANT ALL ON public.transit_events TO service_role;
ALTER TABLE public.transit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Neutral transit events readable" ON public.transit_events FOR SELECT TO authenticated USING (true);

CREATE TABLE public.personal_transit_matches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 natal_chart_id uuid NOT NULL REFERENCES public.natal_charts(id) ON DELETE CASCADE, transit_event_id uuid NOT NULL REFERENCES public.transit_events(id) ON DELETE CASCADE,
 matched_rule_id uuid NOT NULL REFERENCES public.astrology_rules(id) ON DELETE RESTRICT, natal_object_json jsonb NOT NULL,
 impact_area text NOT NULL, strength numeric(5,4) NOT NULL CHECK (strength BETWEEN 0 AND 1), confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
 facts_json jsonb NOT NULL, explanation_status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,natal_chart_id,transit_event_id,matched_rule_id)
);
GRANT SELECT ON public.personal_transit_matches TO authenticated; GRANT ALL ON public.personal_transit_matches TO service_role;
ALTER TABLE public.personal_transit_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transit matches" ON public.personal_transit_matches FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.personal_interpretations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 natal_chart_id uuid NOT NULL REFERENCES public.natal_charts(id) ON DELETE CASCADE, rule_id uuid NOT NULL REFERENCES public.astrology_rules(id) ON DELETE RESTRICT,
 transit_event_id uuid REFERENCES public.transit_events(id) ON DELETE SET NULL, facts_json jsonb NOT NULL, generated_text text NOT NULL,
 model_name text, prompt_version text, citation_snapshot_json jsonb NOT NULL, status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','rejected')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.personal_interpretations TO authenticated; GRANT ALL ON public.personal_interpretations TO service_role;
ALTER TABLE public.personal_interpretations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own interpretations" ON public.personal_interpretations FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.knowledge_releases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), release_code text NOT NULL UNIQUE, description text NOT NULL,
 status public.knowledge_release_status NOT NULL DEFAULT 'draft', published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), CHECK(status <> 'published' OR published_at IS NOT NULL)
);
GRANT SELECT ON public.knowledge_releases TO authenticated; GRANT ALL ON public.knowledge_releases TO service_role;
ALTER TABLE public.knowledge_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published knowledge releases readable" ON public.knowledge_releases FOR SELECT TO authenticated USING (status = 'published');

CREATE TABLE public.release_rules (
 release_id uuid NOT NULL REFERENCES public.knowledge_releases(id) ON DELETE CASCADE, rule_id uuid NOT NULL REFERENCES public.astrology_rules(id) ON DELETE RESTRICT,
 rule_version text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(release_id,rule_id)
);
GRANT SELECT ON public.release_rules TO authenticated; GRANT ALL ON public.release_rules TO service_role;
ALTER TABLE public.release_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published release rules readable" ON public.release_rules FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.knowledge_releases k WHERE k.id = release_id AND k.status = 'published') AND EXISTS (SELECT 1 FROM public.astrology_rules r WHERE r.id = rule_id AND r.status = 'published'));

CREATE TABLE public.knowledge_audit_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, entity_type text NOT NULL,
 entity_id uuid NOT NULL, action text NOT NULL, before_json jsonb, after_json jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.knowledge_audit_log TO service_role;
ALTER TABLE public.knowledge_audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.enforce_published_rule_citation() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.status = 'published' AND NOT EXISTS (SELECT 1 FROM public.rule_citations rc WHERE rc.rule_id = NEW.id) THEN
  RAISE EXCEPTION 'Published astrology rule requires at least one citation';
 END IF;
 RETURN NEW;
END; $$;
CREATE CONSTRAINT TRIGGER astrology_rules_require_citation AFTER INSERT OR UPDATE OF status ON public.astrology_rules DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.enforce_published_rule_citation();

CREATE TRIGGER update_astrology_systems_updated_at BEFORE UPDATE ON public.astrology_systems FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_astrology_sources_updated_at BEFORE UPDATE ON public.astrology_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_source_sections_updated_at BEFORE UPDATE ON public.source_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ingestion_jobs_updated_at BEFORE UPDATE ON public.ingestion_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ingestion_issues_updated_at BEFORE UPDATE ON public.ingestion_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_astrology_concepts_updated_at BEFORE UPDATE ON public.astrology_concepts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_astrology_rules_updated_at BEFORE UPDATE ON public.astrology_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rule_conflicts_updated_at BEFORE UPDATE ON public.rule_conflicts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transit_event_definitions_updated_at BEFORE UPDATE ON public.transit_event_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_releases_updated_at BEFORE UPDATE ON public.knowledge_releases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.astrology_systems(system_code,name_th,name_en,description,zodiac_type,ayanamsa,house_system,node_type,aspect_model,status,version) VALUES
('thai_traditional_unimplemented','โหราศาสตร์ไทยดั้งเดิม (ยังไม่ติดตั้งเอนจิน)','Thai Traditional (Unimplemented)','ทะเบียนระบบสำหรับจัดหมวดความรู้เท่านั้น ยังไม่อ้างความเข้ากันได้กับสุริยยาตร์','sidereal',NULL,NULL,NULL,NULL,'draft','0.1.0'),
('sidereal_lahiri_dev','นิรายนะลาหิรี รุ่นพัฒนา','Sidereal Lahiri Dev','เอนจินคำนวณปัจจุบัน แยกจากระบบโหราศาสตร์ไทยดั้งเดิม','sidereal','lahiri','whole_sign','configured_by_engine','configured_by_engine','active','dev'),
('western_tropical_reference','ตะวันตกเขตร้อน (อ้างอิง)','Western Tropical Reference','ระบบอ้างอิงแยก ห้ามนำกฎมาผสมโดยปริยาย','tropical',NULL,'system_defined','system_defined','western_major','active','1.0.0');

INSERT INTO public.astrology_sources(source_code,title,alternative_titles,author,language,source_type,rights_status,license_notes,provenance,file_reference,page_count,ingestion_status) VALUES
('TH-PROMMACHAT-TEP-001','พรหมชาติ',ARRAY['ตำราพรหมชาติ'],'เทพ สาริกบุตร','th','book','review_required','ไฟล์ผู้ใช้ 145 หน้า ต้องตรวจสอบสถานะลิขสิทธิ์ สิทธิ์การถอดความ และฉบับพิมพ์ก่อนนำข้อความมาใช้','สแกนฉบับประวัติศาสตร์ที่ผู้ใช้จัดให้; ยังไม่ยืนยัน edition หรือสิทธิ์','user-provided://prommachat-tep-scan',145,'registered');

INSERT INTO public.source_sections(source_id,section_code,title,page_start,page_end,sequence,transcription_status,confidence)
SELECT id,'manifest-pending','สารบัญและช่วงบท — รอตรวจสอบ',1,145,1,'pending',NULL FROM public.astrology_sources WHERE source_code='TH-PROMMACHAT-TEP-001';

INSERT INTO public.astrology_concepts(concept_code,concept_type,name_th,name_en,aliases,description,metadata) VALUES
('planet_sun','planet','อาทิตย์','Sun',ARRAY['พระอาทิตย์'],'ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),('planet_moon','planet','จันทร์','Moon',ARRAY['พระจันทร์'],'ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),('planet_mars','planet','อังคาร','Mars','{}','ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),('planet_mercury','planet','พุธ','Mercury','{}','ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),('planet_jupiter','planet','พฤหัสบดี','Jupiter','{}','ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),('planet_venus','planet','ศุกร์','Venus','{}','ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),('planet_saturn','planet','เสาร์','Saturn','{}','ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),('planet_rahu','planet','ราหู','Rahu','{}','ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),('planet_ketu','planet','เกตุ','Ketu','{}','ระเบียนอนุกรมวิธาน ไม่ใช่กฎทำนาย','{}'),
('sign_aries','sign','เมษ','Aries','{}','ราศีลำดับ 1','{"ordinal":1}'),('sign_taurus','sign','พฤษภ','Taurus','{}','ราศีลำดับ 2','{"ordinal":2}'),('sign_gemini','sign','เมถุน','Gemini','{}','ราศีลำดับ 3','{"ordinal":3}'),('sign_cancer','sign','กรกฎ','Cancer','{}','ราศีลำดับ 4','{"ordinal":4}'),('sign_leo','sign','สิงห์','Leo','{}','ราศีลำดับ 5','{"ordinal":5}'),('sign_virgo','sign','กันย์','Virgo','{}','ราศีลำดับ 6','{"ordinal":6}'),('sign_libra','sign','ตุล','Libra','{}','ราศีลำดับ 7','{"ordinal":7}'),('sign_scorpio','sign','พิจิก','Scorpio','{}','ราศีลำดับ 8','{"ordinal":8}'),('sign_sagittarius','sign','ธนู','Sagittarius','{}','ราศีลำดับ 9','{"ordinal":9}'),('sign_capricorn','sign','มกร','Capricorn','{}','ราศีลำดับ 10','{"ordinal":10}'),('sign_aquarius','sign','กุมภ์','Aquarius','{}','ราศีลำดับ 11','{"ordinal":11}'),('sign_pisces','sign','มีน','Pisces','{}','ราศีลำดับ 12','{"ordinal":12}'),
('house_1','house','เรือนที่ 1','House 1','{}','เรือนลำดับ 1','{"ordinal":1}'),('house_2','house','เรือนที่ 2','House 2','{}','เรือนลำดับ 2','{"ordinal":2}'),('house_3','house','เรือนที่ 3','House 3','{}','เรือนลำดับ 3','{"ordinal":3}'),('house_4','house','เรือนที่ 4','House 4','{}','เรือนลำดับ 4','{"ordinal":4}'),('house_5','house','เรือนที่ 5','House 5','{}','เรือนลำดับ 5','{"ordinal":5}'),('house_6','house','เรือนที่ 6','House 6','{}','เรือนลำดับ 6','{"ordinal":6}'),('house_7','house','เรือนที่ 7','House 7','{}','เรือนลำดับ 7','{"ordinal":7}'),('house_8','house','เรือนที่ 8','House 8','{}','เรือนลำดับ 8','{"ordinal":8}'),('house_9','house','เรือนที่ 9','House 9','{}','เรือนลำดับ 9','{"ordinal":9}'),('house_10','house','เรือนที่ 10','House 10','{}','เรือนลำดับ 10','{"ordinal":10}'),('house_11','house','เรือนที่ 11','House 11','{}','เรือนลำดับ 11','{"ordinal":11}'),('house_12','house','เรือนที่ 12','House 12','{}','เรือนลำดับ 12','{"ordinal":12}'),
('life_self','life_area','ตัวตน','Self','{}','ขอบเขตชีวิตมาตรฐาน','{}'),('life_finance','life_area','การเงิน','Finance','{}','ขอบเขตชีวิตมาตรฐาน','{}'),('life_love','life_area','ความรัก','Love','{}','ขอบเขตชีวิตมาตรฐาน','{}'),('life_career','life_area','การงาน','Career','{}','ขอบเขตชีวิตมาตรฐาน','{}'),('life_health','life_area','สุขภาวะ','Wellbeing','{}','ขอบเขตชีวิตมาตรฐาน','{}'),('life_family','life_area','ครอบครัว','Family','{}','ขอบเขตชีวิตมาตรฐาน','{}'),('life_learning','life_area','การเรียนรู้','Learning','{}','ขอบเขตชีวิตมาตรฐาน','{}'),('life_spirituality','life_area','การใคร่ครวญ','Reflection','{}','ขอบเขตชีวิตมาตรฐาน','{}'),
('event_sign_ingress','transit_event','ย้ายราศี','Sign ingress','{}','ประเภทเหตุการณ์กลาง','{}'),('event_house_ingress','transit_event','ย้ายเรือน','House ingress','{}','ประเภทเหตุการณ์กลาง','{}'),('event_retrograde_start','transit_event','เริ่มพักร์','Retrograde start','{}','ประเภทเหตุการณ์กลาง','{}'),('event_direct_start','transit_event','เริ่มเดินหน้า','Direct start','{}','ประเภทเหตุการณ์กลาง','{}'),('event_exact_aspect','transit_event','มุมสัมพันธ์ตรงองศา','Exact aspect','{}','ประเภทเหตุการณ์กลาง','{}'),('event_natal_contact','transit_event','สัมพันธ์จุดกำเนิด','Natal contact','{}','ประเภทเหตุการณ์กลาง','{}'),('event_eclipse','transit_event','คราส','Eclipse','{}','ประเภทเหตุการณ์กลาง','{}'),('event_lunation','transit_event','จันทร์ดับหรือเพ็ญ','Lunation','{}','ประเภทเหตุการณ์กลาง','{}');