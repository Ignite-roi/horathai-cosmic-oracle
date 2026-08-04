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
      natal_charts: {
        Row: {
          ascendant_degree: number
          ascendant_json: Json
          ascendant_known: boolean
          ascendant_sign: string
          aspects_json: Json
          ayanamsa: number | null
          birth_profile_id: string
          calculated_at: string
          calculation_settings_json: Json
          calculation_version: string
          engine_type: string
          house_system: string
          houses_json: Json
          id: string
          input_hash: string | null
          input_snapshot_json: Json
          latitude: number | null
          longitude: number | null
          planets_json: Json
          standards_json: Json
          superseded_at: string | null
          timezone: string
          user_id: string
          utc_birth_datetime: string | null
        }
        Insert: {
          ascendant_degree?: number
          ascendant_json?: Json
          ascendant_known?: boolean
          ascendant_sign: string
          aspects_json?: Json
          ayanamsa?: number | null
          birth_profile_id: string
          calculated_at?: string
          calculation_settings_json?: Json
          calculation_version?: string
          engine_type?: string
          house_system?: string
          houses_json?: Json
          id?: string
          input_hash?: string | null
          input_snapshot_json?: Json
          latitude?: number | null
          longitude?: number | null
          planets_json?: Json
          standards_json?: Json
          superseded_at?: string | null
          timezone?: string
          user_id: string
          utc_birth_datetime?: string | null
        }
        Update: {
          ascendant_degree?: number
          ascendant_json?: Json
          ascendant_known?: boolean
          ascendant_sign?: string
          aspects_json?: Json
          ayanamsa?: number | null
          birth_profile_id?: string
          calculated_at?: string
          calculation_settings_json?: Json
          calculation_version?: string
          engine_type?: string
          house_system?: string
          houses_json?: Json
          id?: string
          input_hash?: string | null
          input_snapshot_json?: Json
          latitude?: number | null
          longitude?: number | null
          planets_json?: Json
          standards_json?: Json
          superseded_at?: string | null
          timezone?: string
          user_id?: string
          utc_birth_datetime?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "natal_charts_birth_profile_id_fkey"
            columns: ["birth_profile_id"]
            isOneToOne: false
            referencedRelation: "birth_profiles"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
