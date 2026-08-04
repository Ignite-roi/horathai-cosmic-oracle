export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ascendant_rules: {
        Row: {
          algorithm_profile: string | null
          boundary_sensitivity_minutes: number[]
          created_at: string
          id: string
          input_requirements: Json
          rule_id: string
        }
        Insert: {
          algorithm_profile?: string | null
          boundary_sensitivity_minutes?: number[]
          created_at?: string
          id?: string
          input_requirements: Json
          rule_id: string
        }
        Update: {
          algorithm_profile?: string | null
          boundary_sensitivity_minutes?: number[]
          created_at?: string
          id?: string
          input_requirements?: Json
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ascendant_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: true
            referencedRelation: "kb_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      astronomical_event_groups: {
        Row: {
          astronomy_profile_id: string
          calculation_status: Database["public"]["Enums"]["calculation_status"]
          created_at: string
          ends_at: string | null
          event_group_key: string
          event_type: string
          event_version: number
          id: string
          provenance_json: Json
          starts_at: string | null
          superseded_at: string | null
        }
        Insert: {
          astronomy_profile_id: string
          calculation_status?: Database["public"]["Enums"]["calculation_status"]
          created_at?: string
          ends_at?: string | null
          event_group_key: string
          event_type: string
          event_version?: number
          id?: string
          provenance_json?: Json
          starts_at?: string | null
          superseded_at?: string | null
        }
        Update: {
          astronomy_profile_id?: string
          calculation_status?: Database["public"]["Enums"]["calculation_status"]
          created_at?: string
          ends_at?: string | null
          event_group_key?: string
          event_type?: string
          event_version?: number
          id?: string
          provenance_json?: Json
          starts_at?: string | null
          superseded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "astronomical_event_groups_astronomy_profile_id_fkey"
            columns: ["astronomy_profile_id"]
            isOneToOne: false
            referencedRelation: "astronomy_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      astronomical_events: {
        Row: {
          body_code: string | null
          created_at: string
          direction: string | null
          event_group_id: string
          event_type: string
          exact_at: string | null
          facts_json: Json
          id: string
          longitude: number | null
          precision_error_estimate: string | null
          speed: number | null
        }
        Insert: {
          body_code?: string | null
          created_at?: string
          direction?: string | null
          event_group_id: string
          event_type: string
          exact_at?: string | null
          facts_json?: Json
          id?: string
          longitude?: number | null
          precision_error_estimate?: string | null
          speed?: number | null
        }
        Update: {
          body_code?: string | null
          created_at?: string
          direction?: string | null
          event_group_id?: string
          event_type?: string
          exact_at?: string | null
          facts_json?: Json
          id?: string
          longitude?: number | null
          precision_error_estimate?: string | null
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "astronomical_events_event_group_id_fkey"
            columns: ["event_group_id"]
            isOneToOne: false
            referencedRelation: "astronomical_event_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      astronomy_profiles: {
        Row: {
          ayanamsa_profile: string | null
          benchmark_status: Database["public"]["Enums"]["calculation_status"]
          calculation_engine: string
          created_at: string
          engine_version: string
          ephemeris_source: string
          id: string
          known_limitations: string
          name: string
          precision_error_estimate: string | null
          profile_key: string
          published_at: string | null
          status: Database["public"]["Enums"]["kb_workflow_status"]
          timezone_strategy: string
          tzdb_version: string | null
          updated_at: string
          version: number
          zodiac_system: string
        }
        Insert: {
          ayanamsa_profile?: string | null
          benchmark_status?: Database["public"]["Enums"]["calculation_status"]
          calculation_engine: string
          created_at?: string
          engine_version: string
          ephemeris_source: string
          id?: string
          known_limitations: string
          name: string
          precision_error_estimate?: string | null
          profile_key: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          timezone_strategy: string
          tzdb_version?: string | null
          updated_at?: string
          version?: number
          zodiac_system: string
        }
        Update: {
          ayanamsa_profile?: string | null
          benchmark_status?: Database["public"]["Enums"]["calculation_status"]
          calculation_engine?: string
          created_at?: string
          engine_version?: string
          ephemeris_source?: string
          id?: string
          known_limitations?: string
          name?: string
          precision_error_estimate?: string | null
          profile_key?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          timezone_strategy?: string
          tzdb_version?: string | null
          updated_at?: string
          version?: number
          zodiac_system?: string
        }
        Relationships: []
      }
      auth_events: {
        Row: {
          created_at: string
          error_code: string | null
          event_type: string
          id: string
          ip_hash: string | null
          provider: string
          success: boolean
          user_agent_summary: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_code?: string | null
          event_type: string
          id?: string
          ip_hash?: string | null
          provider?: string
          success?: boolean
          user_agent_summary?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string | null
          event_type?: string
          id?: string
          ip_hash?: string | null
          provider?: string
          success?: boolean
          user_agent_summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      birth_profiles: {
        Row: {
          birth_date: string
          birth_time: string | null
          birth_time_estimated: boolean
          birth_time_known: boolean
          calculation_settings_json: Json
          calculation_system: string
          calculation_version: string
          country: string
          country_code: string
          created_at: string
          district: string | null
          id: string
          is_primary: boolean
          latitude: number
          locality: string | null
          longitude: number
          nickname: string
          province: string
          timezone: string
          updated_at: string
          user_id: string
          utc_birth_datetime: string | null
        }
        Insert: {
          birth_date: string
          birth_time?: string | null
          birth_time_estimated?: boolean
          birth_time_known?: boolean
          calculation_settings_json?: Json
          calculation_system?: string
          calculation_version?: string
          country?: string
          country_code?: string
          created_at?: string
          district?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number
          locality?: string | null
          longitude?: number
          nickname?: string
          province?: string
          timezone?: string
          updated_at?: string
          user_id: string
          utc_birth_datetime?: string | null
        }
        Update: {
          birth_date?: string
          birth_time?: string | null
          birth_time_estimated?: boolean
          birth_time_known?: boolean
          calculation_settings_json?: Json
          calculation_system?: string
          calculation_version?: string
          country?: string
          country_code?: string
          created_at?: string
          district?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number
          locality?: string | null
          longitude?: number
          nickname?: string
          province?: string
          timezone?: string
          updated_at?: string
          user_id?: string
          utc_birth_datetime?: string | null
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          created_at: string
          expires_at: string | null
          plan: string
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          plan?: string
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          plan?: string
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gamification: {
        Row: {
          created_at: string
          last_check_in: string | null
          points: number
          streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          last_check_in?: string | null
          points?: number
          streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          last_check_in?: string | null
          points?: number
          streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gamification_events: {
        Row: {
          created_at: string
          event_date: string
          event_type: string
          id: string
          metadata: Json
          points_delta: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date: string
          event_type: string
          id?: string
          metadata?: Json
          points_delta?: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json
          points_delta?: number
          user_id?: string
        }
        Relationships: []
      }
      interpretation_templates: {
        Row: {
          created_at: string
          id: string
          language: string
          limitations_text: string
          published_at: string | null
          required_citation_fields: string[]
          rule_id: string
          status: Database["public"]["Enums"]["kb_workflow_status"]
          template_key: string
          template_text: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          limitations_text: string
          published_at?: string | null
          required_citation_fields?: string[]
          rule_id: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          template_key: string
          template_text: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          limitations_text?: string
          published_at?: string | null
          required_citation_fields?: string[]
          rule_id?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          template_key?: string
          template_text?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "interpretation_templates_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "kb_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_benchmarks: {
        Row: {
          actual_output_json: Json | null
          astronomy_profile_id: string | null
          benchmark_key: string
          calculation_status: Database["public"]["Enums"]["calculation_status"]
          created_at: string
          engine_name: string | null
          engine_version: string | null
          expected_output_json: Json
          id: string
          independent_reference: string | null
          input_label: string
          last_run_at: string | null
          normalized_input_json: Json
          original_input_json: Json
          status: Database["public"]["Enums"]["kb_workflow_status"]
          title: string
          tolerance_json: Json
          updated_at: string
          version: number
        }
        Insert: {
          actual_output_json?: Json | null
          astronomy_profile_id?: string | null
          benchmark_key: string
          calculation_status?: Database["public"]["Enums"]["calculation_status"]
          created_at?: string
          engine_name?: string | null
          engine_version?: string | null
          expected_output_json?: Json
          id?: string
          independent_reference?: string | null
          input_label: string
          last_run_at?: string | null
          normalized_input_json: Json
          original_input_json: Json
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          title: string
          tolerance_json?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          actual_output_json?: Json | null
          astronomy_profile_id?: string | null
          benchmark_key?: string
          calculation_status?: Database["public"]["Enums"]["calculation_status"]
          created_at?: string
          engine_name?: string | null
          engine_version?: string | null
          expected_output_json?: Json
          id?: string
          independent_reference?: string | null
          input_label?: string
          last_run_at?: string | null
          normalized_input_json?: Json
          original_input_json?: Json
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          title?: string
          tolerance_json?: Json
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "kb_benchmarks_astronomy_profile_fkey"
            columns: ["astronomy_profile_id"]
            isOneToOne: false
            referencedRelation: "astronomy_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_conflicts: {
        Row: {
          both_publishable: boolean
          conflict_type: string
          created_at: string
          id: string
          nature_summary: string
          resolution_status: string
          resolved_at: string | null
          resolved_by: string | null
          reviewer_decision: string | null
          rule_a_id: string
          rule_b_id: string
        }
        Insert: {
          both_publishable?: boolean
          conflict_type: string
          created_at?: string
          id?: string
          nature_summary: string
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          reviewer_decision?: string | null
          rule_a_id: string
          rule_b_id: string
        }
        Update: {
          both_publishable?: boolean
          conflict_type?: string
          created_at?: string
          id?: string
          nature_summary?: string
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          reviewer_decision?: string | null
          rule_a_id?: string
          rule_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "kb_experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_conflicts_rule_a_id_fkey"
            columns: ["rule_a_id"]
            isOneToOne: false
            referencedRelation: "kb_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_conflicts_rule_b_id_fkey"
            columns: ["rule_b_id"]
            isOneToOne: false
            referencedRelation: "kb_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_documents: {
        Row: {
          chapter_map: Json
          checksum_sha256: string | null
          created_at: string
          document_type: string
          embedding_status: string
          file_locator: string | null
          fulltext_stored: boolean
          id: string
          ingestion_status: string
          page_end: number | null
          page_start: number | null
          published_at: string | null
          source_id: string
          status: Database["public"]["Enums"]["kb_workflow_status"]
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          chapter_map?: Json
          checksum_sha256?: string | null
          created_at?: string
          document_type?: string
          embedding_status?: string
          file_locator?: string | null
          fulltext_stored?: boolean
          id?: string
          ingestion_status?: string
          page_end?: number | null
          page_start?: number | null
          published_at?: string | null
          source_id: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          chapter_map?: Json
          checksum_sha256?: string | null
          created_at?: string
          document_type?: string
          embedding_status?: string
          file_locator?: string | null
          fulltext_stored?: boolean
          id?: string
          ingestion_status?: string
          page_end?: number | null
          page_start?: number | null
          published_at?: string | null
          source_id?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "kb_documents_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "kb_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_experts: {
        Row: {
          active: boolean
          created_at: string
          credentials: string | null
          display_name: string
          id: string
          profile_id: string | null
          school_affiliations: Json
          updated_at: string
          verification_status: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          credentials?: string | null
          display_name: string
          id?: string
          profile_id?: string | null
          school_affiliations?: Json
          updated_at?: string
          verification_status?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          credentials?: string | null
          display_name?: string
          id?: string
          profile_id?: string | null
          school_affiliations?: Json
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_experts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_passages: {
        Row: {
          content_summary: string
          created_at: string
          document_id: string
          excerpt_word_count: number
          extraction_confidence: number | null
          id: string
          page_number: number | null
          passage_kind: string
          published_at: string | null
          rights_basis: string
          section_locator: string
          status: Database["public"]["Enums"]["kb_workflow_status"]
          updated_at: string
          verbatim_excerpt: string | null
          version: number
        }
        Insert: {
          content_summary: string
          created_at?: string
          document_id: string
          excerpt_word_count?: number
          extraction_confidence?: number | null
          id?: string
          page_number?: number | null
          passage_kind?: string
          published_at?: string | null
          rights_basis: string
          section_locator: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          updated_at?: string
          verbatim_excerpt?: string | null
          version?: number
        }
        Update: {
          content_summary?: string
          created_at?: string
          document_id?: string
          excerpt_word_count?: number
          extraction_confidence?: number | null
          id?: string
          page_number?: number | null
          passage_kind?: string
          published_at?: string | null
          rights_basis?: string
          section_locator?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          updated_at?: string
          verbatim_excerpt?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "kb_passages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "kb_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_review_logs: {
        Row: {
          action: Database["public"]["Enums"]["kb_review_action"]
          actor_user_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          entity_version: number
          from_status: Database["public"]["Enums"]["kb_workflow_status"] | null
          id: string
          notes: string | null
          reviewer_id: string | null
          snapshot_json: Json
          to_status: Database["public"]["Enums"]["kb_workflow_status"] | null
        }
        Insert: {
          action: Database["public"]["Enums"]["kb_review_action"]
          actor_user_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          entity_version: number
          from_status?: Database["public"]["Enums"]["kb_workflow_status"] | null
          id?: string
          notes?: string | null
          reviewer_id?: string | null
          snapshot_json: Json
          to_status?: Database["public"]["Enums"]["kb_workflow_status"] | null
        }
        Update: {
          action?: Database["public"]["Enums"]["kb_review_action"]
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          entity_version?: number
          from_status?: Database["public"]["Enums"]["kb_workflow_status"] | null
          id?: string
          notes?: string | null
          reviewer_id?: string | null
          snapshot_json?: Json
          to_status?: Database["public"]["Enums"]["kb_workflow_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_review_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_review_logs_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "kb_experts"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_rule_sources: {
        Row: {
          citation_note: string | null
          created_at: string
          document_id: string | null
          id: string
          is_primary: boolean
          locator: string
          passage_id: string | null
          rule_id: string
          source_id: string
        }
        Insert: {
          citation_note?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          is_primary?: boolean
          locator: string
          passage_id?: string | null
          rule_id: string
          source_id: string
        }
        Update: {
          citation_note?: string | null
          created_at?: string
          document_id?: string | null
          id?: string
          is_primary?: boolean
          locator?: string
          passage_id?: string | null
          rule_id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_rule_sources_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "kb_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rule_sources_passage_id_fkey"
            columns: ["passage_id"]
            isOneToOne: false
            referencedRelation: "kb_passages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rule_sources_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "kb_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rule_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "kb_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_rules: {
        Row: {
          category: string
          conditions_json: Json
          confidence: number
          copyright_safe_wording: string
          created_at: string
          created_by: string | null
          deprecated_at: string | null
          document_id: string | null
          exceptions_json: Json
          id: string
          outcome_summary: string
          page_locator: string
          priority: number
          published_at: string | null
          reviewer_id: string | null
          rule_key: string
          school_id: string | null
          source_id: string
          status: Database["public"]["Enums"]["kb_workflow_status"]
          subcategory: string | null
          supersedes_rule_id: string | null
          system_id: string
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          conditions_json: Json
          confidence: number
          copyright_safe_wording: string
          created_at?: string
          created_by?: string | null
          deprecated_at?: string | null
          document_id?: string | null
          exceptions_json?: Json
          id?: string
          outcome_summary: string
          page_locator: string
          priority?: number
          published_at?: string | null
          reviewer_id?: string | null
          rule_key: string
          school_id?: string | null
          source_id: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          subcategory?: string | null
          supersedes_rule_id?: string | null
          system_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          conditions_json?: Json
          confidence?: number
          copyright_safe_wording?: string
          created_at?: string
          created_by?: string | null
          deprecated_at?: string | null
          document_id?: string | null
          exceptions_json?: Json
          id?: string
          outcome_summary?: string
          page_locator?: string
          priority?: number
          published_at?: string | null
          reviewer_id?: string | null
          rule_key?: string
          school_id?: string | null
          source_id?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          subcategory?: string | null
          supersedes_rule_id?: string | null
          system_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "kb_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rules_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "kb_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rules_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "kb_experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "kb_schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rules_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "kb_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rules_supersedes_rule_id_fkey"
            columns: ["supersedes_rule_id"]
            isOneToOne: false
            referencedRelation: "kb_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_rules_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "kb_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_schools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name_th: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["kb_workflow_status"]
          system_id: string
          teacher_or_lineage: string | null
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name_th: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          system_id: string
          teacher_or_lineage?: string | null
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name_th?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          system_id?: string
          teacher_or_lineage?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_schools_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "kb_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_sources: {
        Row: {
          author: string | null
          commercial_use_allowed: boolean
          copyright_status: string
          created_at: string
          created_by: string | null
          duplicate_fingerprint: string | null
          edition_year: string | null
          fullbook_embedding_allowed: boolean
          fulltext_storage_allowed: boolean
          id: string
          language: string
          license_access_basis: string | null
          ocr_confidence: number | null
          page_count: number | null
          published_at: string | null
          publisher_archive: string | null
          rights_holder: string | null
          source_type: string
          status: Database["public"]["Enums"]["kb_workflow_status"]
          title: string
          updated_at: string
          updated_by: string | null
          version: number
          visual_extraction_confidence: number | null
        }
        Insert: {
          author?: string | null
          commercial_use_allowed?: boolean
          copyright_status: string
          created_at?: string
          created_by?: string | null
          duplicate_fingerprint?: string | null
          edition_year?: string | null
          fullbook_embedding_allowed?: boolean
          fulltext_storage_allowed?: boolean
          id?: string
          language?: string
          license_access_basis?: string | null
          ocr_confidence?: number | null
          page_count?: number | null
          published_at?: string | null
          publisher_archive?: string | null
          rights_holder?: string | null
          source_type: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          visual_extraction_confidence?: number | null
        }
        Update: {
          author?: string | null
          commercial_use_allowed?: boolean
          copyright_status?: string
          created_at?: string
          created_by?: string | null
          duplicate_fingerprint?: string | null
          edition_year?: string | null
          fullbook_embedding_allowed?: boolean
          fulltext_storage_allowed?: boolean
          id?: string
          language?: string
          license_access_basis?: string | null
          ocr_confidence?: number | null
          page_count?: number | null
          published_at?: string | null
          publisher_archive?: string | null
          rights_holder?: string | null
          source_type?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          visual_extraction_confidence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_sources_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_systems: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name_en: string | null
          name_th: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["kb_workflow_status"]
          tradition: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name_en?: string | null
          name_th: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          tradition?: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name_en?: string | null
          name_th?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          tradition?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      natal_charts: {
        Row: {
          activated_rule_ids: string[]
          ascendant_degree: number
          ascendant_json: Json
          ascendant_known: boolean
          ascendant_sign: string
          aspects_json: Json
          astronomy_profile_id: string | null
          ayanamsa: number | null
          birth_profile_id: string
          calculated_at: string
          calculation_engine: string | null
          calculation_settings_json: Json
          calculation_status: Database["public"]["Enums"]["calculation_status"]
          calculation_version: string
          chart_version: number
          engine_type: string
          engine_version: string | null
          ephemeris_source: string | null
          house_system: string
          houses_json: Json
          id: string
          input_hash: string | null
          input_snapshot_json: Json
          known_limitations: string | null
          latitude: number | null
          longitude: number | null
          original_input_json: Json
          original_input_label: string | null
          planets_json: Json
          precision_error_estimate: string | null
          standards_json: Json
          superseded_at: string | null
          timezone: string
          tzdb_version: string | null
          user_id: string
          utc_birth_datetime: string | null
          zodiac_system: string | null
        }
        Insert: {
          activated_rule_ids?: string[]
          ascendant_degree?: number
          ascendant_json?: Json
          ascendant_known?: boolean
          ascendant_sign: string
          aspects_json?: Json
          astronomy_profile_id?: string | null
          ayanamsa?: number | null
          birth_profile_id: string
          calculated_at?: string
          calculation_engine?: string | null
          calculation_settings_json?: Json
          calculation_status?: Database["public"]["Enums"]["calculation_status"]
          calculation_version?: string
          chart_version?: number
          engine_type?: string
          engine_version?: string | null
          ephemeris_source?: string | null
          house_system?: string
          houses_json?: Json
          id?: string
          input_hash?: string | null
          input_snapshot_json?: Json
          known_limitations?: string | null
          latitude?: number | null
          longitude?: number | null
          original_input_json?: Json
          original_input_label?: string | null
          planets_json?: Json
          precision_error_estimate?: string | null
          standards_json?: Json
          superseded_at?: string | null
          timezone?: string
          tzdb_version?: string | null
          user_id: string
          utc_birth_datetime?: string | null
          zodiac_system?: string | null
        }
        Update: {
          activated_rule_ids?: string[]
          ascendant_degree?: number
          ascendant_json?: Json
          ascendant_known?: boolean
          ascendant_sign?: string
          aspects_json?: Json
          astronomy_profile_id?: string | null
          ayanamsa?: number | null
          birth_profile_id?: string
          calculated_at?: string
          calculation_engine?: string | null
          calculation_settings_json?: Json
          calculation_status?: Database["public"]["Enums"]["calculation_status"]
          calculation_version?: string
          chart_version?: number
          engine_type?: string
          engine_version?: string | null
          ephemeris_source?: string | null
          house_system?: string
          houses_json?: Json
          id?: string
          input_hash?: string | null
          input_snapshot_json?: Json
          known_limitations?: string | null
          latitude?: number | null
          longitude?: number | null
          original_input_json?: Json
          original_input_label?: string | null
          planets_json?: Json
          precision_error_estimate?: string | null
          standards_json?: Json
          superseded_at?: string | null
          timezone?: string
          tzdb_version?: string | null
          user_id?: string
          utc_birth_datetime?: string | null
          zodiac_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "natal_charts_astronomy_profile_id_fkey"
            columns: ["astronomy_profile_id"]
            isOneToOne: false
            referencedRelation: "astronomy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "natal_charts_birth_profile_id_fkey"
            columns: ["birth_profile_id"]
            isOneToOne: false
            referencedRelation: "birth_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_logs: {
        Row: {
          attempt_number: number
          attempted_at: string
          error_code: string | null
          id: string
          job_id: string
          metadata: Json
          provider_message_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          attempt_number?: number
          attempted_at?: string
          error_code?: string | null
          id?: string
          job_id: string
          metadata?: Json
          provider_message_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          attempt_number?: number
          attempted_at?: string
          error_code?: string | null
          id?: string
          job_id?: string
          metadata?: Json
          provider_message_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "notification_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_delivery_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_jobs: {
        Row: {
          advance_interval: string
          cancel_reason: string | null
          cancelled_at: string | null
          channel: string
          created_at: string
          event_group_id: string
          event_version: number
          id: string
          idempotency_key: string
          impact_id: string
          natal_chart_version: number
          notification_type: string
          scheduled_for: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advance_interval: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          channel: string
          created_at?: string
          event_group_id: string
          event_version: number
          id?: string
          idempotency_key: string
          impact_id: string
          natal_chart_version: number
          notification_type: string
          scheduled_for: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advance_interval?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          channel?: string
          created_at?: string
          event_group_id?: string
          event_version?: number
          id?: string
          idempotency_key?: string
          impact_id?: string
          natal_chart_version?: number
          notification_type?: string
          scheduled_for?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_jobs_event_group_id_fkey"
            columns: ["event_group_id"]
            isOneToOne: false
            referencedRelation: "astronomical_event_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_jobs_impact_id_fkey"
            columns: ["impact_id"]
            isOneToOne: false
            referencedRelation: "user_transit_impacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channels: string[]
          consent_version: string | null
          consented_at: string | null
          created_at: string
          daily_cap: number
          enabled: boolean
          event_types: string[]
          id: string
          impact_threshold: number
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string
          updated_at: string
          user_id: string
          weekly_cap: number
        }
        Insert: {
          channels?: string[]
          consent_version?: string | null
          consented_at?: string | null
          created_at?: string
          daily_cap?: number
          enabled?: boolean
          event_types?: string[]
          id?: string
          impact_threshold?: number
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
          weekly_cap?: number
        }
        Update: {
          channels?: string[]
          consent_version?: string | null
          consented_at?: string | null
          created_at?: string
          daily_cap?: number
          enabled?: boolean
          event_types?: string[]
          id?: string
          impact_threshold?: number
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
          weekly_cap?: number
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          birth_time: string | null
          country: string
          created_at: string
          display_name: string
          id: string
          last_login_at: string | null
          line_user_id: string | null
          onboarded: boolean
          onboarding_completed: boolean
          picture_url: string | null
          province: string
          subscription_status: string
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          country?: string
          created_at?: string
          display_name?: string
          id: string
          last_login_at?: string | null
          line_user_id?: string | null
          onboarded?: boolean
          onboarding_completed?: boolean
          picture_url?: string | null
          province?: string
          subscription_status?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          birth_time?: string | null
          country?: string
          created_at?: string
          display_name?: string
          id?: string
          last_login_at?: string | null
          line_user_id?: string | null
          onboarded?: boolean
          onboarding_completed?: boolean
          picture_url?: string | null
          province?: string
          subscription_status?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rectification_rules: {
        Row: {
          allowed_time_window_minutes: number | null
          created_at: string
          evidence_requirements: Json
          id: string
          rule_id: string
        }
        Insert: {
          allowed_time_window_minutes?: number | null
          created_at?: string
          evidence_requirements?: Json
          id?: string
          rule_id: string
        }
        Update: {
          allowed_time_window_minutes?: number | null
          created_at?: string
          evidence_requirements?: Json
          id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rectification_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: true
            referencedRelation: "kb_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      transit_event_passes: {
        Row: {
          created_at: string
          direction: string | null
          event_group_id: string
          exact_at: string | null
          id: string
          is_final: boolean
          pass_kind: string
          pass_number: number
        }
        Insert: {
          created_at?: string
          direction?: string | null
          event_group_id: string
          exact_at?: string | null
          id?: string
          is_final?: boolean
          pass_kind: string
          pass_number: number
        }
        Update: {
          created_at?: string
          direction?: string | null
          event_group_id?: string
          exact_at?: string | null
          id?: string
          is_final?: boolean
          pass_kind?: string
          pass_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "transit_event_passes_event_group_id_fkey"
            columns: ["event_group_id"]
            isOneToOne: false
            referencedRelation: "astronomical_event_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      transit_rules: {
        Row: {
          created_at: string
          event_types: string[]
          id: string
          orb_degrees: number | null
          pass_handling: Json
          rule_id: string
        }
        Insert: {
          created_at?: string
          event_types: string[]
          id?: string
          orb_degrees?: number | null
          pass_handling?: Json
          rule_id: string
        }
        Update: {
          created_at?: string
          event_types?: string[]
          id?: string
          orb_degrees?: number | null
          pass_handling?: Json
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transit_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: true
            referencedRelation: "kb_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_transit_impacts: {
        Row: {
          activated_rule_ids: string[]
          created_at: string
          event_group_id: string
          event_version: number
          facts_json: Json
          id: string
          impact_score: number | null
          impact_threshold_met: boolean
          interpretation_status: string
          natal_chart_id: string
          natal_chart_version: number
          user_id: string
        }
        Insert: {
          activated_rule_ids?: string[]
          created_at?: string
          event_group_id: string
          event_version: number
          facts_json?: Json
          id?: string
          impact_score?: number | null
          impact_threshold_met?: boolean
          interpretation_status?: string
          natal_chart_id: string
          natal_chart_version: number
          user_id: string
        }
        Update: {
          activated_rule_ids?: string[]
          created_at?: string
          event_group_id?: string
          event_version?: number
          facts_json?: Json
          id?: string
          impact_score?: number | null
          impact_threshold_met?: boolean
          interpretation_status?: string
          natal_chart_id?: string
          natal_chart_version?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_transit_impacts_event_group_id_fkey"
            columns: ["event_group_id"]
            isOneToOne: false
            referencedRelation: "astronomical_event_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_transit_impacts_natal_chart_id_fkey"
            columns: ["natal_chart_id"]
            isOneToOne: false
            referencedRelation: "natal_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_transit_impacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      daily_check_in: {
        Args: { _user_id: string }
        Returns: {
          already_checked_in: boolean
          event_date: string
          points: number
          reward: number
          streak: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "user"
      calculation_status:
        | "calculation_pending"
        | "calculated"
        | "benchmark_verified"
        | "failed"
      kb_review_action:
        | "created"
        | "verified"
        | "extracted"
        | "normalized"
        | "conflict_flagged"
        | "reviewed"
        | "published"
        | "deprecated"
        | "rejected"
        | "commented"
      kb_workflow_status:
        | "candidate"
        | "source_verified"
        | "extracted"
        | "normalized"
        | "conflict_flagged"
        | "expert_reviewed"
        | "published"
        | "deprecated"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "reviewer", "user"],
      calculation_status: [
        "calculation_pending",
        "calculated",
        "benchmark_verified",
        "failed",
      ],
      kb_review_action: [
        "created",
        "verified",
        "extracted",
        "normalized",
        "conflict_flagged",
        "reviewed",
        "published",
        "deprecated",
        "rejected",
        "commented",
      ],
      kb_workflow_status: [
        "candidate",
        "source_verified",
        "extracted",
        "normalized",
        "conflict_flagged",
        "expert_reviewed",
        "published",
        "deprecated",
      ],
    },
  },
} as const
