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
      app_notification_jobs: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          id: string
          idempotency_key: string
          last_error: string | null
          notification_type: string
          payload: Json
          scheduled_for: string
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          channel?: string
          created_at?: string
          id?: string
          idempotency_key: string
          last_error?: string | null
          notification_type: string
          payload: Json
          scheduled_for: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          last_error?: string | null
          notification_type?: string
          payload?: Json
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_notification_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      astrology_concepts: {
        Row: {
          aliases: string[]
          concept_code: string
          concept_type: string
          created_at: string
          description: string
          id: string
          metadata: Json
          name_en: string
          name_th: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          aliases?: string[]
          concept_code: string
          concept_type: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          name_en: string
          name_th: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          aliases?: string[]
          concept_code?: string
          concept_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json
          name_en?: string
          name_th?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "astrology_concepts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "astrology_concepts"
            referencedColumns: ["id"]
          },
        ]
      }
      astrology_rules: {
        Row: {
          approved_at: string | null
          condition_json: Json
          confidence: number
          created_at: string
          created_by: string | null
          effective_version: string
          evidence_level: Database["public"]["Enums"]["rule_evidence_level"]
          id: string
          institutional_reviewer: string | null
          limitations: string[]
          outcome_json: Json
          priority: number
          reviewed_by: string | null
          rule_code: string
          rule_type: Database["public"]["Enums"]["astrology_rule_type"]
          status: Database["public"]["Enums"]["astrology_rule_status"]
          summary_th: string
          supersedes_rule_id: string | null
          system_id: string
          title_th: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          condition_json: Json
          confidence: number
          created_at?: string
          created_by?: string | null
          effective_version: string
          evidence_level: Database["public"]["Enums"]["rule_evidence_level"]
          id?: string
          institutional_reviewer?: string | null
          limitations?: string[]
          outcome_json: Json
          priority?: number
          reviewed_by?: string | null
          rule_code: string
          rule_type: Database["public"]["Enums"]["astrology_rule_type"]
          status?: Database["public"]["Enums"]["astrology_rule_status"]
          summary_th: string
          supersedes_rule_id?: string | null
          system_id: string
          title_th: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          condition_json?: Json
          confidence?: number
          created_at?: string
          created_by?: string | null
          effective_version?: string
          evidence_level?: Database["public"]["Enums"]["rule_evidence_level"]
          id?: string
          institutional_reviewer?: string | null
          limitations?: string[]
          outcome_json?: Json
          priority?: number
          reviewed_by?: string | null
          rule_code?: string
          rule_type?: Database["public"]["Enums"]["astrology_rule_type"]
          status?: Database["public"]["Enums"]["astrology_rule_status"]
          summary_th?: string
          supersedes_rule_id?: string | null
          system_id?: string
          title_th?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "astrology_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astrology_rules_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astrology_rules_supersedes_rule_id_fkey"
            columns: ["supersedes_rule_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "astrology_rules_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "astrology_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      astrology_sources: {
        Row: {
          alternative_titles: string[]
          astrology_system_id: string | null
          author: string | null
          checksum: string | null
          created_at: string
          edition: string | null
          editor_translator: string | null
          file_reference: string | null
          id: string
          ingestion_status: Database["public"]["Enums"]["source_ingestion_status"]
          language: string
          license_notes: string
          page_count: number | null
          provenance: string
          publication_year: number | null
          publisher: string | null
          rights_status: Database["public"]["Enums"]["source_rights_status"]
          source_code: string
          source_quality: number | null
          source_type: Database["public"]["Enums"]["astrology_source_type"]
          title: string
          updated_at: string
        }
        Insert: {
          alternative_titles?: string[]
          astrology_system_id?: string | null
          author?: string | null
          checksum?: string | null
          created_at?: string
          edition?: string | null
          editor_translator?: string | null
          file_reference?: string | null
          id?: string
          ingestion_status?: Database["public"]["Enums"]["source_ingestion_status"]
          language?: string
          license_notes?: string
          page_count?: number | null
          provenance: string
          publication_year?: number | null
          publisher?: string | null
          rights_status?: Database["public"]["Enums"]["source_rights_status"]
          source_code: string
          source_quality?: number | null
          source_type: Database["public"]["Enums"]["astrology_source_type"]
          title: string
          updated_at?: string
        }
        Update: {
          alternative_titles?: string[]
          astrology_system_id?: string | null
          author?: string | null
          checksum?: string | null
          created_at?: string
          edition?: string | null
          editor_translator?: string | null
          file_reference?: string | null
          id?: string
          ingestion_status?: Database["public"]["Enums"]["source_ingestion_status"]
          language?: string
          license_notes?: string
          page_count?: number | null
          provenance?: string
          publication_year?: number | null
          publisher?: string | null
          rights_status?: Database["public"]["Enums"]["source_rights_status"]
          source_code?: string
          source_quality?: number | null
          source_type?: Database["public"]["Enums"]["astrology_source_type"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "astrology_sources_astrology_system_id_fkey"
            columns: ["astrology_system_id"]
            isOneToOne: false
            referencedRelation: "astrology_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      astrology_systems: {
        Row: {
          aspect_model: string | null
          ayanamsa: string | null
          created_at: string
          description: string
          house_system: string | null
          id: string
          name_en: string
          name_th: string
          node_type: string | null
          status: string
          system_code: string
          updated_at: string
          version: string
          zodiac_type: string
        }
        Insert: {
          aspect_model?: string | null
          ayanamsa?: string | null
          created_at?: string
          description?: string
          house_system?: string | null
          id?: string
          name_en: string
          name_th: string
          node_type?: string | null
          status?: string
          system_code: string
          updated_at?: string
          version: string
          zodiac_type: string
        }
        Update: {
          aspect_model?: string | null
          ayanamsa?: string | null
          created_at?: string
          description?: string
          house_system?: string | null
          id?: string
          name_en?: string
          name_th?: string
          node_type?: string | null
          status?: string
          system_code?: string
          updated_at?: string
          version?: string
          zodiac_type?: string
        }
        Relationships: []
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
      card_draws: {
        Row: {
          activated_rule_ids: string[]
          citations: Json
          created_at: string
          draw_date: string
          draw_type: string
          id: string
          result: Json
          user_id: string
        }
        Insert: {
          activated_rule_ids?: string[]
          citations?: Json
          created_at?: string
          draw_date: string
          draw_type: string
          id?: string
          result: Json
          user_id: string
        }
        Update: {
          activated_rule_ids?: string[]
          citations?: Json
          created_at?: string
          draw_date?: string
          draw_type?: string
          id?: string
          result?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_draws_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_checks: {
        Row: {
          calculation_engine: string
          calculation_version: string
          citation_snapshot_json: Json
          created_at: string
          id: string
          input_hash: string
          overall_score: number
          partner_birth_date: string
          partner_birth_time: string | null
          partner_birth_time_known: boolean
          partner_country: string
          partner_district: string | null
          partner_latitude: number
          partner_longitude: number
          partner_province: string
          partner_timezone: string
          person_label: string
          result_json: Json
          rule_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_engine: string
          calculation_version: string
          citation_snapshot_json?: Json
          created_at?: string
          id?: string
          input_hash: string
          overall_score: number
          partner_birth_date: string
          partner_birth_time?: string | null
          partner_birth_time_known?: boolean
          partner_country?: string
          partner_district?: string | null
          partner_latitude: number
          partner_longitude: number
          partner_province: string
          partner_timezone?: string
          person_label: string
          result_json: Json
          rule_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_engine?: string
          calculation_version?: string
          citation_snapshot_json?: Json
          created_at?: string
          id?: string
          input_hash?: string
          overall_score?: number
          partner_birth_date?: string
          partner_birth_time?: string | null
          partner_birth_time_known?: boolean
          partner_country?: string
          partner_district?: string | null
          partner_latitude?: number
          partner_longitude?: number
          partner_province?: string
          partner_timezone?: string
          person_label?: string
          result_json?: Json
          rule_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_checks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      concept_relationships: {
        Row: {
          confidence: number
          created_at: string
          id: string
          object_concept_id: string
          predicate: string
          source_rule_id: string | null
          subject_concept_id: string
          system_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          id?: string
          object_concept_id: string
          predicate: string
          source_rule_id?: string | null
          subject_concept_id: string
          system_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          object_concept_id?: string
          predicate?: string
          source_rule_id?: string | null
          subject_concept_id?: string
          system_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concept_relationships_object_concept_id_fkey"
            columns: ["object_concept_id"]
            isOneToOne: false
            referencedRelation: "astrology_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concept_relationships_source_rule_id_fkey"
            columns: ["source_rule_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concept_relationships_subject_concept_id_fkey"
            columns: ["subject_concept_id"]
            isOneToOne: false
            referencedRelation: "astrology_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concept_relationships_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "astrology_systems"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          created_at: string
          days: number
          id: string
          note: string | null
          points_used: number
          type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          days: number
          id?: string
          note?: string | null
          points_used?: number
          type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          days?: number
          id?: string
          note?: string | null
          points_used?: number
          type?: Database["public"]["Enums"]["credit_transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      day_transfer_claims: {
        Row: {
          cancelled_at: string | null
          claimed_at: string | null
          created_at: string
          days: number
          expires_at: string
          id: string
          recipient_id: string | null
          sender_id: string
          status: string
          token_hash: string
        }
        Insert: {
          cancelled_at?: string | null
          claimed_at?: string | null
          created_at?: string
          days: number
          expires_at: string
          id?: string
          recipient_id?: string | null
          sender_id: string
          status?: string
          token_hash: string
        }
        Update: {
          cancelled_at?: string | null
          claimed_at?: string | null
          created_at?: string
          days?: number
          expires_at?: string
          id?: string
          recipient_id?: string | null
          sender_id?: string
          status?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_transfer_claims_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_transfer_claims_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      ingestion_issues: {
        Row: {
          created_at: string
          description: string
          id: string
          issue_type: string
          reviewer_notes: string | null
          section_id: string | null
          severity: Database["public"]["Enums"]["knowledge_issue_severity"]
          source_id: string
          status: Database["public"]["Enums"]["knowledge_issue_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          issue_type: string
          reviewer_notes?: string | null
          section_id?: string | null
          severity: Database["public"]["Enums"]["knowledge_issue_severity"]
          source_id: string
          status?: Database["public"]["Enums"]["knowledge_issue_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          issue_type?: string
          reviewer_notes?: string | null
          section_id?: string | null
          severity?: Database["public"]["Enums"]["knowledge_issue_severity"]
          source_id?: string
          status?: Database["public"]["Enums"]["knowledge_issue_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_issues_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "source_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_issues_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "astrology_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          error_summary: string | null
          finished_at: string | null
          id: string
          job_type: string
          progress: number
          source_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["knowledge_job_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error_summary?: string | null
          finished_at?: string | null
          id?: string
          job_type: string
          progress?: number
          source_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["knowledge_job_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error_summary?: string | null
          finished_at?: string | null
          id?: string
          job_type?: string
          progress?: number
          source_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["knowledge_job_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "astrology_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      interpretation_templates: {
        Row: {
          created_at: string
          id: string
          language: string
          limitations_text: string
          locale: string
          published_at: string | null
          required_citation_fields: string[]
          rule_id: string
          rule_type: Database["public"]["Enums"]["astrology_rule_type"] | null
          safety_level: string
          status: Database["public"]["Enums"]["kb_workflow_status"]
          system_id: string | null
          template_code: string | null
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
          locale?: string
          published_at?: string | null
          required_citation_fields?: string[]
          rule_id: string
          rule_type?: Database["public"]["Enums"]["astrology_rule_type"] | null
          safety_level?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          system_id?: string | null
          template_code?: string | null
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
          locale?: string
          published_at?: string | null
          required_citation_fields?: string[]
          rule_id?: string
          rule_type?: Database["public"]["Enums"]["astrology_rule_type"] | null
          safety_level?: string
          status?: Database["public"]["Enums"]["kb_workflow_status"]
          system_id?: string | null
          template_code?: string | null
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
          {
            foreignKeyName: "interpretation_templates_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "astrology_systems"
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
      knowledge_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after_json: Json | null
          before_json: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_releases: {
        Row: {
          created_at: string
          description: string
          id: string
          published_at: string | null
          release_code: string
          status: Database["public"]["Enums"]["knowledge_release_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          published_at?: string | null
          release_code: string
          status?: Database["public"]["Enums"]["knowledge_release_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          published_at?: string | null
          release_code?: string
          status?: Database["public"]["Enums"]["knowledge_release_status"]
          updated_at?: string
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
      packages: {
        Row: {
          bonus_days: number
          code: string
          days: number
          is_popular: boolean
          name_th: string
          price_thb: number
          sort_order: number
        }
        Insert: {
          bonus_days?: number
          code: string
          days: number
          is_popular?: boolean
          name_th: string
          price_thb: number
          sort_order?: number
        }
        Update: {
          bonus_days?: number
          code?: string
          days?: number
          is_popular?: boolean
          name_th?: string
          price_thb?: number
          sort_order?: number
        }
        Relationships: []
      }
      personal_interpretations: {
        Row: {
          citation_snapshot_json: Json
          created_at: string
          facts_json: Json
          generated_text: string
          id: string
          model_name: string | null
          natal_chart_id: string
          prompt_version: string | null
          rule_id: string
          status: string
          transit_event_id: string | null
          user_id: string
        }
        Insert: {
          citation_snapshot_json: Json
          created_at?: string
          facts_json: Json
          generated_text: string
          id?: string
          model_name?: string | null
          natal_chart_id: string
          prompt_version?: string | null
          rule_id: string
          status?: string
          transit_event_id?: string | null
          user_id: string
        }
        Update: {
          citation_snapshot_json?: Json
          created_at?: string
          facts_json?: Json
          generated_text?: string
          id?: string
          model_name?: string | null
          natal_chart_id?: string
          prompt_version?: string | null
          rule_id?: string
          status?: string
          transit_event_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_interpretations_natal_chart_id_fkey"
            columns: ["natal_chart_id"]
            isOneToOne: false
            referencedRelation: "natal_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_interpretations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_interpretations_transit_event_id_fkey"
            columns: ["transit_event_id"]
            isOneToOne: false
            referencedRelation: "transit_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_interpretations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_transit_matches: {
        Row: {
          confidence: number
          created_at: string
          explanation_status: string
          facts_json: Json
          id: string
          impact_area: string
          matched_rule_id: string
          natal_chart_id: string
          natal_object_json: Json
          strength: number
          transit_event_id: string
          user_id: string
        }
        Insert: {
          confidence: number
          created_at?: string
          explanation_status?: string
          facts_json: Json
          id?: string
          impact_area: string
          matched_rule_id: string
          natal_chart_id: string
          natal_object_json: Json
          strength: number
          transit_event_id: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          explanation_status?: string
          facts_json?: Json
          id?: string
          impact_area?: string
          matched_rule_id?: string
          natal_chart_id?: string
          natal_object_json?: Json
          strength?: number
          transit_event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_transit_matches_matched_rule_id_fkey"
            columns: ["matched_rule_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_transit_matches_natal_chart_id_fkey"
            columns: ["natal_chart_id"]
            isOneToOne: false
            referencedRelation: "natal_charts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_transit_matches_transit_event_id_fkey"
            columns: ["transit_event_id"]
            isOneToOne: false
            referencedRelation: "transit_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_transit_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          points_awarded: number
          referee_id: string
          referrer_id: string
          status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number
          referee_id: string
          referrer_id: string
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number
          referee_id?: string
          referrer_id?: string
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: []
      }
      release_rules: {
        Row: {
          created_at: string
          release_id: string
          rule_id: string
          rule_version: string
        }
        Insert: {
          created_at?: string
          release_id: string
          rule_id: string
          rule_version: string
        }
        Update: {
          created_at?: string
          release_id?: string
          rule_id?: string
          rule_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "release_rules_release_id_fkey"
            columns: ["release_id"]
            isOneToOne: false
            referencedRelation: "knowledge_releases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "release_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      result_shares: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          owner_id: string
          payload: Json
          result_type: string
          revoked_at: string | null
          title: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          owner_id: string
          payload: Json
          result_type: string
          revoked_at?: string | null
          title: string
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          owner_id?: string
          payload?: Json
          result_type?: string
          revoked_at?: string | null
          title?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "result_shares_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_citations: {
        Row: {
          citation_id: string
          created_at: string
          rule_id: string
          support_type: Database["public"]["Enums"]["rule_support_type"]
        }
        Insert: {
          citation_id: string
          created_at?: string
          rule_id: string
          support_type: Database["public"]["Enums"]["rule_support_type"]
        }
        Update: {
          citation_id?: string
          created_at?: string
          rule_id?: string
          support_type?: Database["public"]["Enums"]["rule_support_type"]
        }
        Relationships: [
          {
            foreignKeyName: "rule_citations_citation_id_fkey"
            columns: ["citation_id"]
            isOneToOne: false
            referencedRelation: "source_citations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rule_citations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_conflicts: {
        Row: {
          conflict_type: string
          created_at: string
          id: string
          notes: string
          resolution_status: string
          rule_a_id: string
          rule_b_id: string
          updated_at: string
        }
        Insert: {
          conflict_type: string
          created_at?: string
          id?: string
          notes?: string
          resolution_status?: string
          rule_a_id: string
          rule_b_id: string
          updated_at?: string
        }
        Update: {
          conflict_type?: string
          created_at?: string
          id?: string
          notes?: string
          resolution_status?: string
          rule_a_id?: string
          rule_b_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rule_conflicts_rule_a_id_fkey"
            columns: ["rule_a_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rule_conflicts_rule_b_id_fkey"
            columns: ["rule_b_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      rule_tags: {
        Row: {
          concept_id: string
          created_at: string
          rule_id: string
        }
        Insert: {
          concept_id: string
          created_at?: string
          rule_id: string
        }
        Update: {
          concept_id?: string
          created_at?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rule_tags_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "astrology_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rule_tags_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "astrology_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      source_citations: {
        Row: {
          citation_label: string
          created_at: string
          excerpt_hash: string | null
          id: string
          locator_text: string
          page_end: number | null
          page_start: number | null
          section_id: string | null
          source_id: string
        }
        Insert: {
          citation_label: string
          created_at?: string
          excerpt_hash?: string | null
          id?: string
          locator_text: string
          page_end?: number | null
          page_start?: number | null
          section_id?: string | null
          source_id: string
        }
        Update: {
          citation_label?: string
          created_at?: string
          excerpt_hash?: string | null
          id?: string
          locator_text?: string
          page_end?: number | null
          page_start?: number | null
          section_id?: string | null
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_citations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "source_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_citations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "astrology_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_sections: {
        Row: {
          approved_at: string | null
          confidence: number | null
          created_at: string
          id: string
          normalized_text: string | null
          page_end: number | null
          page_start: number | null
          parent_id: string | null
          raw_text: string | null
          reviewer_id: string | null
          section_code: string
          sequence: number
          source_id: string
          title: string
          transcription_status: Database["public"]["Enums"]["transcription_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          normalized_text?: string | null
          page_end?: number | null
          page_start?: number | null
          parent_id?: string | null
          raw_text?: string | null
          reviewer_id?: string | null
          section_code: string
          sequence?: number
          source_id: string
          title: string
          transcription_status?: Database["public"]["Enums"]["transcription_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          normalized_text?: string | null
          page_end?: number | null
          page_start?: number | null
          parent_id?: string | null
          raw_text?: string | null
          reviewer_id?: string | null
          section_code?: string
          sequence?: number
          source_id?: string
          title?: string
          transcription_status?: Database["public"]["Enums"]["transcription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_sections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "source_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_sections_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_sections_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "astrology_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      transit_event_definitions: {
        Row: {
          created_at: string
          event_code: string
          event_type: Database["public"]["Enums"]["transit_definition_type"]
          id: string
          orb_policy_json: Json
          planet_concept_id: string | null
          system_id: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          event_code: string
          event_type: Database["public"]["Enums"]["transit_definition_type"]
          id?: string
          orb_policy_json?: Json
          planet_concept_id?: string | null
          system_id: string
          updated_at?: string
          version: string
        }
        Update: {
          created_at?: string
          event_code?: string
          event_type?: Database["public"]["Enums"]["transit_definition_type"]
          id?: string
          orb_policy_json?: Json
          planet_concept_id?: string | null
          system_id?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "transit_event_definitions_planet_concept_id_fkey"
            columns: ["planet_concept_id"]
            isOneToOne: false
            referencedRelation: "astrology_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transit_event_definitions_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "astrology_systems"
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
      transit_events: {
        Row: {
          calculation_engine: string
          calculation_version: string
          created_at: string
          degree: number | null
          event_definition_id: string
          event_hash: string
          event_time: string
          from_sign_id: string | null
          id: string
          longitude: number | null
          metadata: Json
          retrograde: boolean
          to_sign_id: string | null
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          calculation_engine: string
          calculation_version: string
          created_at?: string
          degree?: number | null
          event_definition_id: string
          event_hash: string
          event_time: string
          from_sign_id?: string | null
          id?: string
          longitude?: number | null
          metadata?: Json
          retrograde?: boolean
          to_sign_id?: string | null
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          calculation_engine?: string
          calculation_version?: string
          created_at?: string
          degree?: number | null
          event_definition_id?: string
          event_hash?: string
          event_time?: string
          from_sign_id?: string | null
          id?: string
          longitude?: number | null
          metadata?: Json
          retrograde?: boolean
          to_sign_id?: string | null
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transit_events_event_definition_id_fkey"
            columns: ["event_definition_id"]
            isOneToOne: false
            referencedRelation: "transit_event_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transit_events_from_sign_id_fkey"
            columns: ["from_sign_id"]
            isOneToOne: false
            referencedRelation: "astrology_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transit_events_to_sign_id_fkey"
            columns: ["to_sign_id"]
            isOneToOne: false
            referencedRelation: "astrology_concepts"
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
      user_credits: {
        Row: {
          days_remaining: number
          expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          days_remaining?: number
          expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          days_remaining?: number
          expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          balance: number
          user_id: string
        }
        Insert: {
          balance?: number
          user_id: string
        }
        Update: {
          balance?: number
          user_id?: string
        }
        Relationships: []
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
      claim_day_transfer: {
        Args: { _recipient_id: string; _transfer_id: string }
        Returns: {
          days_transferred: number
          recipient_days: number
          sender_days: number
        }[]
      }
      complete_mock_day_purchase: {
        Args: {
          _package_code: string
          _points_to_use?: number
          _user_id: string
        }
        Returns: {
          days_added: number
          days_remaining: number
          expires_at: string
          points_balance: number
        }[]
      }
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
      deduct_user_days: {
        Args: {
          _days: number
          _note?: string
          _type?: Database["public"]["Enums"]["credit_transaction_type"]
          _user_id: string
        }
        Returns: {
          days_remaining: number
          expires_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_referral_code: { Args: { _user_id: string }; Returns: string }
      grant_user_days: {
        Args: {
          _days: number
          _note?: string
          _points_used?: number
          _type: Database["public"]["Enums"]["credit_transaction_type"]
          _user_id: string
        }
        Returns: {
          days_remaining: number
          expires_at: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "user_credits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "user"
      astrology_rule_status:
        | "draft"
        | "review"
        | "approved"
        | "published"
        | "deprecated"
        | "rejected"
      astrology_rule_type:
        | "natal"
        | "transit"
        | "dignity"
        | "aspect"
        | "yoga"
        | "taksa"
        | "timing"
        | "compatibility"
        | "interpretation"
      astrology_source_type:
        | "book"
        | "manuscript"
        | "article"
        | "website"
        | "research"
        | "user_note"
      calculation_status:
        | "calculation_pending"
        | "calculated"
        | "benchmark_verified"
        | "failed"
      credit_transaction_type:
        | "purchase"
        | "referral"
        | "transfer_in"
        | "transfer_out"
        | "bonus"
        | "admin"
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
      knowledge_issue_severity: "low" | "medium" | "high" | "critical"
      knowledge_issue_status: "open" | "reviewing" | "resolved" | "wont_fix"
      knowledge_job_status:
        | "queued"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
      knowledge_release_status: "draft" | "published" | "retired"
      referral_status: "pending" | "qualified" | "awarded" | "cancelled"
      rule_evidence_level:
        | "primary_source"
        | "secondary_source"
        | "editorial"
        | "inference"
        | "experimental"
      rule_support_type: "direct" | "paraphrase" | "context" | "conflict"
      source_ingestion_status:
        | "registered"
        | "queued"
        | "extracted"
        | "reviewing"
        | "approved"
        | "rejected"
      source_rights_status:
        | "public_domain"
        | "open_license"
        | "user_owned"
        | "permission_granted"
        | "review_required"
        | "restricted"
      transcription_status:
        | "pending"
        | "extracted"
        | "reviewing"
        | "approved"
        | "rejected"
      transit_definition_type:
        | "sign_ingress"
        | "house_ingress"
        | "retrograde_start"
        | "direct_start"
        | "exact_aspect"
        | "natal_contact"
        | "eclipse"
        | "lunation"
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
      astrology_rule_status: [
        "draft",
        "review",
        "approved",
        "published",
        "deprecated",
        "rejected",
      ],
      astrology_rule_type: [
        "natal",
        "transit",
        "dignity",
        "aspect",
        "yoga",
        "taksa",
        "timing",
        "compatibility",
        "interpretation",
      ],
      astrology_source_type: [
        "book",
        "manuscript",
        "article",
        "website",
        "research",
        "user_note",
      ],
      calculation_status: [
        "calculation_pending",
        "calculated",
        "benchmark_verified",
        "failed",
      ],
      credit_transaction_type: [
        "purchase",
        "referral",
        "transfer_in",
        "transfer_out",
        "bonus",
        "admin",
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
      knowledge_issue_severity: ["low", "medium", "high", "critical"],
      knowledge_issue_status: ["open", "reviewing", "resolved", "wont_fix"],
      knowledge_job_status: [
        "queued",
        "running",
        "completed",
        "failed",
        "cancelled",
      ],
      knowledge_release_status: ["draft", "published", "retired"],
      referral_status: ["pending", "qualified", "awarded", "cancelled"],
      rule_evidence_level: [
        "primary_source",
        "secondary_source",
        "editorial",
        "inference",
        "experimental",
      ],
      rule_support_type: ["direct", "paraphrase", "context", "conflict"],
      source_ingestion_status: [
        "registered",
        "queued",
        "extracted",
        "reviewing",
        "approved",
        "rejected",
      ],
      source_rights_status: [
        "public_domain",
        "open_license",
        "user_owned",
        "permission_granted",
        "review_required",
        "restricted",
      ],
      transcription_status: [
        "pending",
        "extracted",
        "reviewing",
        "approved",
        "rejected",
      ],
      transit_definition_type: [
        "sign_ingress",
        "house_ingress",
        "retrograde_start",
        "direct_start",
        "exact_aspect",
        "natal_contact",
        "eclipse",
        "lunation",
      ],
    },
  },
} as const
