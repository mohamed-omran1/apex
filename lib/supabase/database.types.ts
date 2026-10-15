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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_events: {
        Row: {
          actor_user_id: string | null
          body: string | null
          created_at: string
          event_type: string
          id: string
          lead_id: string
          metadata: Json | null
        }
        Insert: {
          actor_user_id?: string | null
          body?: string | null
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          metadata?: Json | null
        }
        Update: {
          actor_user_id?: string | null
          body?: string | null
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          consent_at: string | null
          consent_email: boolean
          consent_sms: boolean
          consent_version: string | null
          created_at: string
          email: string | null
          id: string
          issue: string | null
          kind: Database["public"]["Enums"]["lead_kind"]
          name: string
          phone: string
          preferred_day: string | null
          preferred_window: string | null
          reference_code: string | null
          status: Database["public"]["Enums"]["lead_status"]
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          zip: string
        }
        Insert: {
          address?: string | null
          consent_at?: string | null
          consent_email?: boolean
          consent_sms?: boolean
          consent_version?: string | null
          created_at?: string
          email?: string | null
          id?: string
          issue?: string | null
          kind: Database["public"]["Enums"]["lead_kind"]
          name: string
          phone: string
          preferred_day?: string | null
          preferred_window?: string | null
          reference_code?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          zip: string
        }
        Update: {
          address?: string | null
          consent_at?: string | null
          consent_email?: boolean
          consent_sms?: boolean
          consent_version?: string | null
          created_at?: string
          email?: string | null
          id?: string
          issue?: string | null
          kind?: Database["public"]["Enums"]["lead_kind"]
          name?: string
          phone?: string
          preferred_day?: string | null
          preferred_window?: string | null
          reference_code?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          zip?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          body: string
          created_at: string
          ends_on: string
          id: string
          is_active: boolean
          starts_on: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          ends_on: string
          id?: string
          is_active?: boolean
          starts_on: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          ends_on?: string
          id?: string
          is_active?: boolean
          starts_on?: string
          title?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string
          created_at: string
          id: string
          is_published: boolean
          is_sample: boolean
          name: string
          rating: number
          reviewed_on: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_published?: boolean
          is_sample?: boolean
          name: string
          rating: number
          reviewed_on: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_published?: boolean
          is_sample?: boolean
          name?: string
          rating?: number
          reviewed_on?: string
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          city: string
          created_at: string
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          zip_codes: string[]
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          zip_codes: string[]
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          zip_codes?: string[]
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          id: string
          is_emergency: boolean
          name: string
          slug: string
          sort_order: number
          summary: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_emergency?: boolean
          name: string
          slug: string
          sort_order?: number
          summary: string
        }
        Update: {
          created_at?: string
          id?: string
          is_emergency?: boolean
          name?: string
          slug?: string
          sort_order?: number
          summary?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          business_hours: Json
          created_at: string
          emergency_banner: string | null
          emergency_mode: boolean
          id: boolean
          phone: string
          tdlr_license: string
        }
        Insert: {
          business_hours: Json
          created_at?: string
          emergency_banner?: string | null
          emergency_mode?: boolean
          id?: boolean
          phone: string
          tdlr_license: string
        }
        Update: {
          business_hours?: Json
          created_at?: string
          emergency_banner?: string | null
          emergency_mode?: boolean
          id?: boolean
          phone?: string
          tdlr_license?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_kind:
        | "emergency"
        | "repair"
        | "estimate"
        | "tune_up"
        | "membership_enquiry"
      lead_status:
        | "new"
        | "contacted"
        | "scheduled"
        | "completed"
        | "lost"
        | "spam"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      lead_kind: [
        "emergency",
        "repair",
        "estimate",
        "tune_up",
        "membership_enquiry",
      ],
      lead_status: [
        "new",
        "contacted",
        "scheduled",
        "completed",
        "lost",
        "spam",
      ],
    },
  },
} as const
