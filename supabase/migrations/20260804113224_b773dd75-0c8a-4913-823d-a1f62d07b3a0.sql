CREATE TYPE public.app_role AS ENUM ('admin', 'reviewer', 'user');
CREATE TYPE public.kb_workflow_status AS ENUM ('candidate', 'source_verified', 'extracted', 'normalized', 'conflict_flagged', 'expert_reviewed', 'published', 'deprecated');
CREATE TYPE public.kb_review_action AS ENUM ('created', 'verified', 'extracted', 'normalized', 'conflict_flagged', 'reviewed', 'published', 'deprecated', 'rejected', 'commented');
CREATE TYPE public.calculation_status AS ENUM ('calculation_pending', 'calculated', 'benchmark_verified', 'failed');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, name_th text NOT NULL, name_en text,
  description text, tradition text NOT NULL DEFAULT 'thai_astrology', version text NOT NULL DEFAULT '1.0.0',
  status public.kb_workflow_status NOT NULL DEFAULT 'candidate', published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kb_systems TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_systems TO authenticated;
GRANT ALL ON public.kb_systems TO service_role;
ALTER TABLE public.kb_systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published systems are readable" ON public.kb_systems FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all systems" ON public.kb_systems FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage systems" ON public.kb_systems FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), system_id uuid NOT NULL REFERENCES public.kb_systems(id) ON DELETE RESTRICT,
  slug text NOT NULL UNIQUE, name_th text NOT NULL, teacher_or_lineage text, description text,
  version text NOT NULL DEFAULT '1.0.0', status public.kb_workflow_status NOT NULL DEFAULT 'candidate', published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kb_schools TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_schools TO authenticated;
GRANT ALL ON public.kb_schools TO service_role;
ALTER TABLE public.kb_schools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published schools are readable" ON public.kb_schools FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Reviewers read all schools" ON public.kb_schools FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage schools" ON public.kb_schools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, author text, edition_year text, publisher_archive text,
  source_type text NOT NULL, language text NOT NULL DEFAULT 'th', page_count integer CHECK (page_count IS NULL OR page_count > 0),
  copyright_status text NOT NULL, rights_holder text, license_access_basis text, commercial_use_allowed boolean NOT NULL DEFAULT false,
  fulltext_storage_allowed boolean NOT NULL DEFAULT false, fullbook_embedding_allowed boolean NOT NULL DEFAULT false,
  ocr_confidence numeric(5,4), visual_extraction_confidence numeric(5,4), duplicate_fingerprint text,
  version integer NOT NULL DEFAULT 1, status public.kb_workflow_status NOT NULL DEFAULT 'candidate', published_at timestamptz,
  created_by uuid REFERENCES public.profiles(id), updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ocr_confidence IS NULL OR ocr_confidence BETWEEN 0 AND 1),
  CHECK (visual_extraction_confidence IS NULL OR visual_extraction_confidence BETWEEN 0 AND 1),
  CHECK (fullbook_embedding_allowed = false OR fulltext_storage_allowed = true)
);
GRANT SELECT ON public.kb_sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_sources TO authenticated;
GRANT ALL ON public.kb_sources TO service_role;
ALTER TABLE public.kb_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published sources are readable" ON public.kb_sources FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Reviewers read all sources" ON public.kb_sources FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage sources" ON public.kb_sources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES public.kb_sources(id) ON DELETE RESTRICT,
  title text NOT NULL, document_type text NOT NULL DEFAULT 'scan', file_locator text, checksum_sha256 text,
  page_start integer, page_end integer, chapter_map jsonb NOT NULL DEFAULT '[]', ingestion_status text NOT NULL DEFAULT 'metadata_only',
  fulltext_stored boolean NOT NULL DEFAULT false, embedding_status text NOT NULL DEFAULT 'prohibited',
  version integer NOT NULL DEFAULT 1, status public.kb_workflow_status NOT NULL DEFAULT 'candidate', published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (page_start IS NULL OR page_start > 0), CHECK (page_end IS NULL OR page_end >= page_start)
);
GRANT SELECT ON public.kb_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_documents TO authenticated;
GRANT ALL ON public.kb_documents TO service_role;
ALTER TABLE public.kb_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published documents are readable" ON public.kb_documents FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Reviewers read all documents" ON public.kb_documents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage documents" ON public.kb_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_passages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), document_id uuid NOT NULL REFERENCES public.kb_documents(id) ON DELETE RESTRICT,
  page_number integer, section_locator text NOT NULL, passage_kind text NOT NULL DEFAULT 'concise_summary',
  content_summary text NOT NULL, verbatim_excerpt text, excerpt_word_count integer NOT NULL DEFAULT 0,
  extraction_confidence numeric(5,4), rights_basis text NOT NULL, version integer NOT NULL DEFAULT 1,
  status public.kb_workflow_status NOT NULL DEFAULT 'candidate', published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (page_number IS NULL OR page_number > 0), CHECK (excerpt_word_count >= 0),
  CHECK (extraction_confidence IS NULL OR extraction_confidence BETWEEN 0 AND 1)
);
GRANT SELECT ON public.kb_passages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_passages TO authenticated;
GRANT ALL ON public.kb_passages TO service_role;
ALTER TABLE public.kb_passages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published passages are readable" ON public.kb_passages FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Reviewers read all passages" ON public.kb_passages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage passages" ON public.kb_passages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), profile_id uuid REFERENCES public.profiles(id), display_name text NOT NULL,
  credentials text, school_affiliations jsonb NOT NULL DEFAULT '[]', verification_status text NOT NULL DEFAULT 'pending',
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_experts TO authenticated;
GRANT ALL ON public.kb_experts TO service_role;
ALTER TABLE public.kb_experts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviewers read experts" ON public.kb_experts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage experts" ON public.kb_experts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_key text NOT NULL, source_id uuid NOT NULL REFERENCES public.kb_sources(id) ON DELETE RESTRICT,
  document_id uuid REFERENCES public.kb_documents(id) ON DELETE RESTRICT, page_locator text NOT NULL,
  system_id uuid NOT NULL REFERENCES public.kb_systems(id) ON DELETE RESTRICT, school_id uuid REFERENCES public.kb_schools(id) ON DELETE RESTRICT,
  category text NOT NULL, subcategory text, conditions_json jsonb NOT NULL, outcome_summary text NOT NULL,
  exceptions_json jsonb NOT NULL DEFAULT '[]', priority integer NOT NULL DEFAULT 100, confidence numeric(5,4) NOT NULL,
  reviewer_id uuid REFERENCES public.kb_experts(id), version integer NOT NULL DEFAULT 1,
  status public.kb_workflow_status NOT NULL DEFAULT 'candidate', copyright_safe_wording text NOT NULL,
  supersedes_rule_id uuid REFERENCES public.kb_rules(id), published_at timestamptz, deprecated_at timestamptz,
  created_by uuid REFERENCES public.profiles(id), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rule_key, version), CHECK (confidence BETWEEN 0 AND 1), CHECK (version > 0),
  CHECK (status <> 'published' OR (reviewer_id IS NOT NULL AND published_at IS NOT NULL))
);
GRANT SELECT ON public.kb_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_rules TO authenticated;
GRANT ALL ON public.kb_rules TO service_role;
ALTER TABLE public.kb_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published rules are readable" ON public.kb_rules FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Reviewers read all rules" ON public.kb_rules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage rules" ON public.kb_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_rule_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_id uuid NOT NULL REFERENCES public.kb_rules(id) ON DELETE RESTRICT,
  source_id uuid NOT NULL REFERENCES public.kb_sources(id) ON DELETE RESTRICT, document_id uuid REFERENCES public.kb_documents(id) ON DELETE RESTRICT,
  passage_id uuid REFERENCES public.kb_passages(id) ON DELETE RESTRICT, locator text NOT NULL, citation_note text,
  is_primary boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(rule_id, source_id, locator)
);
GRANT SELECT ON public.kb_rule_sources TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_rule_sources TO authenticated;
GRANT ALL ON public.kb_rule_sources TO service_role;
ALTER TABLE public.kb_rule_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published rule citations are readable" ON public.kb_rule_sources FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.kb_rules r WHERE r.id = rule_id AND r.status = 'published'));
CREATE POLICY "Reviewers read all citations" ON public.kb_rule_sources FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage citations" ON public.kb_rule_sources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_a_id uuid NOT NULL REFERENCES public.kb_rules(id) ON DELETE RESTRICT,
  rule_b_id uuid NOT NULL REFERENCES public.kb_rules(id) ON DELETE RESTRICT, conflict_type text NOT NULL, nature_summary text NOT NULL,
  reviewer_decision text, both_publishable boolean NOT NULL DEFAULT false, resolution_status text NOT NULL DEFAULT 'open',
  resolved_by uuid REFERENCES public.kb_experts(id), resolved_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (rule_a_id <> rule_b_id), UNIQUE(rule_a_id, rule_b_id)
);
GRANT SELECT ON public.kb_conflicts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_conflicts TO authenticated;
GRANT ALL ON public.kb_conflicts TO service_role;
ALTER TABLE public.kb_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published conflicts are readable" ON public.kb_conflicts FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.kb_rules a JOIN public.kb_rules b ON b.id = rule_b_id WHERE a.id = rule_a_id AND a.status = 'published' AND b.status = 'published'));
CREATE POLICY "Reviewers read all conflicts" ON public.kb_conflicts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage conflicts" ON public.kb_conflicts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), benchmark_key text NOT NULL UNIQUE, title text NOT NULL, input_label text NOT NULL,
  original_input_json jsonb NOT NULL, normalized_input_json jsonb NOT NULL, expected_output_json jsonb NOT NULL DEFAULT '{}',
  actual_output_json jsonb, astronomy_profile_id uuid, calculation_status public.calculation_status NOT NULL DEFAULT 'calculation_pending',
  engine_name text, engine_version text, independent_reference text, tolerance_json jsonb NOT NULL DEFAULT '{}',
  last_run_at timestamptz, version integer NOT NULL DEFAULT 1, status public.kb_workflow_status NOT NULL DEFAULT 'candidate',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kb_benchmarks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kb_benchmarks TO authenticated;
GRANT ALL ON public.kb_benchmarks TO service_role;
ALTER TABLE public.kb_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published benchmarks are readable" ON public.kb_benchmarks FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Reviewers read all benchmarks" ON public.kb_benchmarks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage benchmarks" ON public.kb_benchmarks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.ascendant_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_id uuid NOT NULL UNIQUE REFERENCES public.kb_rules(id) ON DELETE RESTRICT,
  input_requirements jsonb NOT NULL, algorithm_profile text, boundary_sensitivity_minutes integer[] NOT NULL DEFAULT ARRAY[1,5,15], created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ascendant_rules TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.ascendant_rules TO authenticated; GRANT ALL ON public.ascendant_rules TO service_role;
ALTER TABLE public.ascendant_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published ascendant rules readable" ON public.ascendant_rules FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.kb_rules r WHERE r.id = rule_id AND r.status = 'published'));
CREATE POLICY "Reviewers read ascendant rules" ON public.ascendant_rules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage ascendant rules" ON public.ascendant_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.rectification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_id uuid NOT NULL UNIQUE REFERENCES public.kb_rules(id) ON DELETE RESTRICT,
  allowed_time_window_minutes integer, evidence_requirements jsonb NOT NULL DEFAULT '[]', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rectification_rules TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.rectification_rules TO authenticated; GRANT ALL ON public.rectification_rules TO service_role;
ALTER TABLE public.rectification_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published rectification rules readable" ON public.rectification_rules FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.kb_rules r WHERE r.id = rule_id AND r.status = 'published'));
CREATE POLICY "Reviewers read rectification rules" ON public.rectification_rules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage rectification rules" ON public.rectification_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.transit_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_id uuid NOT NULL UNIQUE REFERENCES public.kb_rules(id) ON DELETE RESTRICT,
  event_types text[] NOT NULL, orb_degrees numeric(7,4), pass_handling jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.transit_rules TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.transit_rules TO authenticated; GRANT ALL ON public.transit_rules TO service_role;
ALTER TABLE public.transit_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published transit rules readable" ON public.transit_rules FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.kb_rules r WHERE r.id = rule_id AND r.status = 'published'));
CREATE POLICY "Reviewers read transit rules" ON public.transit_rules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage transit rules" ON public.transit_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.interpretation_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), template_key text NOT NULL, rule_id uuid NOT NULL REFERENCES public.kb_rules(id) ON DELETE RESTRICT,
  language text NOT NULL DEFAULT 'th', template_text text NOT NULL, required_citation_fields text[] NOT NULL DEFAULT ARRAY['source','locator','version'],
  limitations_text text NOT NULL, version integer NOT NULL DEFAULT 1, status public.kb_workflow_status NOT NULL DEFAULT 'candidate', published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(template_key, version)
);
GRANT SELECT ON public.interpretation_templates TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.interpretation_templates TO authenticated; GRANT ALL ON public.interpretation_templates TO service_role;
ALTER TABLE public.interpretation_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published templates readable" ON public.interpretation_templates FOR SELECT TO anon, authenticated USING (status = 'published' AND EXISTS (SELECT 1 FROM public.kb_rules r WHERE r.id = rule_id AND r.status = 'published'));
CREATE POLICY "Reviewers read all templates" ON public.interpretation_templates FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage templates" ON public.interpretation_templates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.kb_review_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entity_type text NOT NULL, entity_id uuid NOT NULL, entity_version integer NOT NULL,
  action public.kb_review_action NOT NULL, from_status public.kb_workflow_status, to_status public.kb_workflow_status,
  reviewer_id uuid REFERENCES public.kb_experts(id), actor_user_id uuid REFERENCES public.profiles(id), notes text,
  snapshot_json jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.kb_review_logs TO authenticated; GRANT ALL ON public.kb_review_logs TO service_role;
ALTER TABLE public.kb_review_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviewers read audit logs" ON public.kb_review_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins append audit logs" ON public.kb_review_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.astronomy_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), profile_key text NOT NULL, name text NOT NULL, calculation_engine text NOT NULL,
  engine_version text NOT NULL, zodiac_system text NOT NULL, ayanamsa_profile text, ephemeris_source text NOT NULL,
  timezone_strategy text NOT NULL, tzdb_version text, precision_error_estimate text, known_limitations text NOT NULL,
  benchmark_status public.calculation_status NOT NULL DEFAULT 'calculation_pending', version integer NOT NULL DEFAULT 1,
  status public.kb_workflow_status NOT NULL DEFAULT 'candidate', published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(profile_key, version)
);
GRANT SELECT ON public.astronomy_profiles TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.astronomy_profiles TO authenticated; GRANT ALL ON public.astronomy_profiles TO service_role;
ALTER TABLE public.astronomy_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published astronomy profiles readable" ON public.astronomy_profiles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Reviewers read all astronomy profiles" ON public.astronomy_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'reviewer'));
CREATE POLICY "Admins manage astronomy profiles" ON public.astronomy_profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.kb_benchmarks ADD CONSTRAINT kb_benchmarks_astronomy_profile_fkey FOREIGN KEY (astronomy_profile_id) REFERENCES public.astronomy_profiles(id) ON DELETE SET NULL;

CREATE TABLE public.astronomical_event_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_group_key text NOT NULL, event_type text NOT NULL,
  astronomy_profile_id uuid NOT NULL REFERENCES public.astronomy_profiles(id) ON DELETE RESTRICT, event_version integer NOT NULL DEFAULT 1,
  starts_at timestamptz, ends_at timestamptz, calculation_status public.calculation_status NOT NULL DEFAULT 'calculation_pending',
  provenance_json jsonb NOT NULL DEFAULT '{}', superseded_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(event_group_key, event_version)
);
GRANT SELECT ON public.astronomical_event_groups TO authenticated; GRANT ALL ON public.astronomical_event_groups TO service_role;
ALTER TABLE public.astronomical_event_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read verified event groups" ON public.astronomical_event_groups FOR SELECT TO authenticated USING (calculation_status = 'benchmark_verified');

CREATE TABLE public.astronomical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_group_id uuid NOT NULL REFERENCES public.astronomical_event_groups(id) ON DELETE CASCADE,
  event_type text NOT NULL, body_code text, exact_at timestamptz, longitude numeric(10,6), speed numeric(12,8), direction text,
  facts_json jsonb NOT NULL DEFAULT '{}', precision_error_estimate text, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astronomical_events TO authenticated; GRANT ALL ON public.astronomical_events TO service_role;
ALTER TABLE public.astronomical_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read verified events" ON public.astronomical_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.astronomical_event_groups g WHERE g.id = event_group_id AND g.calculation_status = 'benchmark_verified'));

CREATE TABLE public.transit_event_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_group_id uuid NOT NULL REFERENCES public.astronomical_event_groups(id) ON DELETE CASCADE,
  pass_number integer NOT NULL, pass_kind text NOT NULL, exact_at timestamptz, direction text, is_final boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(event_group_id, pass_number)
);
GRANT SELECT ON public.transit_event_passes TO authenticated; GRANT ALL ON public.transit_event_passes TO service_role;
ALTER TABLE public.transit_event_passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read verified passes" ON public.transit_event_passes FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.astronomical_event_groups g WHERE g.id = event_group_id AND g.calculation_status = 'benchmark_verified'));

ALTER TABLE public.natal_charts
  ADD COLUMN IF NOT EXISTS astronomy_profile_id uuid REFERENCES public.astronomy_profiles(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS chart_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS calculation_status public.calculation_status NOT NULL DEFAULT 'calculation_pending',
  ADD COLUMN IF NOT EXISTS calculation_engine text,
  ADD COLUMN IF NOT EXISTS engine_version text,
  ADD COLUMN IF NOT EXISTS zodiac_system text,
  ADD COLUMN IF NOT EXISTS ephemeris_source text,
  ADD COLUMN IF NOT EXISTS tzdb_version text,
  ADD COLUMN IF NOT EXISTS precision_error_estimate text,
  ADD COLUMN IF NOT EXISTS known_limitations text,
  ADD COLUMN IF NOT EXISTS original_input_label text,
  ADD COLUMN IF NOT EXISTS original_input_json jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activated_rule_ids uuid[] NOT NULL DEFAULT '{}';

CREATE TABLE public.user_transit_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  natal_chart_id uuid NOT NULL REFERENCES public.natal_charts(id) ON DELETE CASCADE,
  event_group_id uuid NOT NULL REFERENCES public.astronomical_event_groups(id) ON DELETE CASCADE,
  event_version integer NOT NULL, natal_chart_version integer NOT NULL, activated_rule_ids uuid[] NOT NULL DEFAULT '{}',
  impact_score numeric(8,4), impact_threshold_met boolean NOT NULL DEFAULT false, facts_json jsonb NOT NULL DEFAULT '{}',
  interpretation_status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_group_id, event_version, natal_chart_version)
);
GRANT SELECT ON public.user_transit_impacts TO authenticated; GRANT ALL ON public.user_transit_impacts TO service_role;
ALTER TABLE public.user_transit_impacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own transit impacts" ON public.user_transit_impacts FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false, channels text[] NOT NULL DEFAULT '{}', event_types text[] NOT NULL DEFAULT '{}',
  impact_threshold numeric(8,4) NOT NULL DEFAULT 0, quiet_hours_start time, quiet_hours_end time,
  timezone text NOT NULL DEFAULT 'Asia/Bangkok', daily_cap integer NOT NULL DEFAULT 1, weekly_cap integer NOT NULL DEFAULT 5,
  consented_at timestamptz, consent_version text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (daily_cap >= 0 AND weekly_cap >= 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated; GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification preferences" ON public.notification_preferences FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  impact_id uuid NOT NULL REFERENCES public.user_transit_impacts(id) ON DELETE CASCADE, event_group_id uuid NOT NULL REFERENCES public.astronomical_event_groups(id) ON DELETE CASCADE,
  event_version integer NOT NULL, natal_chart_version integer NOT NULL, notification_type text NOT NULL, advance_interval text NOT NULL,
  channel text NOT NULL, scheduled_for timestamptz NOT NULL, status text NOT NULL DEFAULT 'pending', idempotency_key text NOT NULL UNIQUE,
  cancelled_at timestamptz, cancel_reason text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notification_jobs TO authenticated; GRANT ALL ON public.notification_jobs TO service_role;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notification jobs" ON public.notification_jobs FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.notification_delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), job_id uuid NOT NULL REFERENCES public.notification_jobs(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, attempt_number integer NOT NULL DEFAULT 1,
  attempted_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL, provider_message_id text, error_code text,
  metadata jsonb NOT NULL DEFAULT '{}', UNIQUE(job_id, attempt_number)
);
GRANT SELECT ON public.notification_delivery_logs TO authenticated; GRANT ALL ON public.notification_delivery_logs TO service_role;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own delivery logs" ON public.notification_delivery_logs FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE INDEX kb_rules_status_category_idx ON public.kb_rules(status, category);
CREATE INDEX kb_rules_source_idx ON public.kb_rules(source_id);
CREATE INDEX kb_documents_source_idx ON public.kb_documents(source_id);
CREATE INDEX kb_passages_document_locator_idx ON public.kb_passages(document_id, page_number);
CREATE INDEX kb_review_logs_entity_idx ON public.kb_review_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX kb_conflicts_status_idx ON public.kb_conflicts(resolution_status);
CREATE INDEX event_groups_type_time_idx ON public.astronomical_event_groups(event_type, starts_at);
CREATE INDEX user_impacts_user_created_idx ON public.user_transit_impacts(user_id, created_at DESC);
CREATE INDEX notification_jobs_schedule_idx ON public.notification_jobs(status, scheduled_for);

CREATE TRIGGER update_kb_systems_updated_at BEFORE UPDATE ON public.kb_systems FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_schools_updated_at BEFORE UPDATE ON public.kb_schools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_sources_updated_at BEFORE UPDATE ON public.kb_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_documents_updated_at BEFORE UPDATE ON public.kb_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_passages_updated_at BEFORE UPDATE ON public.kb_passages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_experts_updated_at BEFORE UPDATE ON public.kb_experts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_rules_updated_at BEFORE UPDATE ON public.kb_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_benchmarks_updated_at BEFORE UPDATE ON public.kb_benchmarks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interpretation_templates_updated_at BEFORE UPDATE ON public.interpretation_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_astronomy_profiles_updated_at BEFORE UPDATE ON public.astronomy_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_jobs_updated_at BEFORE UPDATE ON public.notification_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();