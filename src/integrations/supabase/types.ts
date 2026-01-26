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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessment_analysis: {
        Row: {
          analysis_json: Json | null
          assessment_id: string
          created_at: string
          growth_areas: string[] | null
          id: string
          overall_summary: string | null
          patterns_observed: string[] | null
          recommendations: string[] | null
          strengths: string[] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          analysis_json?: Json | null
          assessment_id: string
          created_at?: string
          growth_areas?: string[] | null
          id?: string
          overall_summary?: string | null
          patterns_observed?: string[] | null
          recommendations?: string[] | null
          strengths?: string[] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          analysis_json?: Json | null
          assessment_id?: string
          created_at?: string
          growth_areas?: string[] | null
          id?: string
          overall_summary?: string | null
          patterns_observed?: string[] | null
          recommendations?: string[] | null
          strengths?: string[] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_analysis_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_analysis_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "assessment_analysis_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_items: {
        Row: {
          assessment_id: string
          created_at: string
          difficulty_level: string | null
          id: string
          item_order: number | null
          knowledge_type: string | null
          max_score: number | null
          question_text: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          difficulty_level?: string | null
          id?: string
          item_order?: number | null
          knowledge_type?: string | null
          max_score?: number | null
          question_text: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          difficulty_level?: string | null
          id?: string
          item_order?: number | null
          knowledge_type?: string | null
          max_score?: number | null
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_items_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_date: string | null
          assessment_type: string | null
          created_at: string
          description: string | null
          grade_level: string | null
          id: string
          max_score: number | null
          standards_covered: string[] | null
          subject: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_date?: string | null
          assessment_type?: string | null
          created_at?: string
          description?: string | null
          grade_level?: string | null
          id?: string
          max_score?: number | null
          standards_covered?: string[] | null
          subject?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_date?: string | null
          assessment_type?: string | null
          created_at?: string
          description?: string | null
          grade_level?: string | null
          id?: string
          max_score?: number | null
          standards_covered?: string[] | null
          subject?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          academic_year: string | null
          created_at: string
          description: string | null
          grade_level: string | null
          id: string
          name: string
          subject: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          description?: string | null
          grade_level?: string | null
          id?: string
          name: string
          subject?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          description?: string | null
          grade_level?: string | null
          id?: string
          name?: string
          subject?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string | null
          created_at: string
          id: string
          name: string
          subject: string
          teacher_id: string
          template_type: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          name: string
          subject: string
          teacher_id: string
          template_type?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          name?: string
          subject?: string
          teacher_id?: string
          template_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          progress: number | null
          status: string | null
          student_id: string
          target_date: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          student_id: string
          target_date?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          student_id?: string
          target_date?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_communications: {
        Row: {
          communication_type: string
          content: string | null
          created_at: string
          email_status: string | null
          id: string
          parent_email: string | null
          pdf_url: string | null
          sent_at: string | null
          student_id: string | null
          subject: string | null
          teacher_id: string
        }
        Insert: {
          communication_type: string
          content?: string | null
          created_at?: string
          email_status?: string | null
          id?: string
          parent_email?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          student_id?: string | null
          subject?: string | null
          teacher_id: string
        }
        Update: {
          communication_type?: string
          content?: string | null
          created_at?: string
          email_status?: string | null
          id?: string
          parent_email?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          student_id?: string | null
          subject?: string | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_communications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "parent_communications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          grade_levels: string[] | null
          id: string
          name: string
          subject: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          grade_levels?: string[] | null
          id?: string
          name: string
          subject?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          grade_levels?: string[] | null
          id?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      student_responses: {
        Row: {
          assessment_id: string
          assessment_item_id: string | null
          created_at: string
          error_type: string | null
          id: string
          score: number | null
          student_id: string
          teacher_notes: string | null
        }
        Insert: {
          assessment_id: string
          assessment_item_id?: string | null
          created_at?: string
          error_type?: string | null
          id?: string
          score?: number | null
          student_id: string
          teacher_notes?: string | null
        }
        Update: {
          assessment_id?: string
          assessment_item_id?: string | null
          created_at?: string
          error_type?: string | null
          id?: string
          score?: number | null
          student_id?: string
          teacher_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_responses_assessment_item_id_fkey"
            columns: ["assessment_item_id"]
            isOneToOne: false
            referencedRelation: "assessment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_performance"
            referencedColumns: ["student_id"]
          },
          {
            foreignKeyName: "student_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          class_id: string | null
          created_at: string
          first_name: string
          grade_level: string | null
          id: string
          last_name: string
          learning_goals: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          special_considerations: string | null
          student_id: string | null
          teacher_id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          first_name: string
          grade_level?: string | null
          id?: string
          last_name: string
          learning_goals?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          special_considerations?: string | null
          student_id?: string | null
          teacher_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          first_name?: string
          grade_level?: string | null
          id?: string
          last_name?: string
          learning_goals?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          special_considerations?: string | null
          student_id?: string | null
          teacher_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      system_performance_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          method: string | null
          response_time_ms: number | null
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          method?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          grade_levels: string[] | null
          id: string
          school: string | null
          subjects: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          grade_levels?: string[] | null
          id: string
          school?: string | null
          subjects?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          grade_levels?: string[] | null
          id?: string
          school?: string | null
          subjects?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      student_performance: {
        Row: {
          assessment_count: number | null
          average_score: number | null
          first_name: string | null
          last_name: string | null
          needs_attention: boolean | null
          performance_level: string | null
          student_id: string | null
          teacher_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_teacher_profile: {
        Args: { p_user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          full_name: string
          grade_levels: string[]
          id: string
          school: string
          subjects: string[]
          updated_at: string
          years_experience: number
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
