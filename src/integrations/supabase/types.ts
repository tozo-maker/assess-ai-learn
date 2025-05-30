export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessment_analysis: {
        Row: {
          analysis_json: Json | null
          assessment_id: string
          created_at: string
          growth_areas: string[]
          id: string
          overall_summary: string | null
          patterns_observed: string[]
          recommendations: string[]
          strengths: string[]
          student_id: string
          updated_at: string
        }
        Insert: {
          analysis_json?: Json | null
          assessment_id: string
          created_at?: string
          growth_areas?: string[]
          id?: string
          overall_summary?: string | null
          patterns_observed?: string[]
          recommendations?: string[]
          strengths?: string[]
          student_id: string
          updated_at?: string
        }
        Update: {
          analysis_json?: Json | null
          assessment_id?: string
          created_at?: string
          growth_areas?: string[]
          id?: string
          overall_summary?: string | null
          patterns_observed?: string[]
          recommendations?: string[]
          strengths?: string[]
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
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_items: {
        Row: {
          assessment_id: string
          created_at: string
          difficulty_level: string
          id: string
          item_number: number
          knowledge_type: string
          max_score: number
          question_text: string
          standard_reference: string | null
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          difficulty_level: string
          id?: string
          item_number: number
          knowledge_type: string
          max_score: number
          question_text: string
          standard_reference?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          difficulty_level?: string
          id?: string
          item_number?: number
          knowledge_type?: string
          max_score?: number
          question_text?: string
          standard_reference?: string | null
          updated_at?: string
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
      assessment_skill_mapping: {
        Row: {
          assessment_id: string
          assessment_item_id: string | null
          created_at: string
          id: string
          skill_id: string
          weight: number | null
        }
        Insert: {
          assessment_id: string
          assessment_item_id?: string | null
          created_at?: string
          id?: string
          skill_id: string
          weight?: number | null
        }
        Update: {
          assessment_id?: string
          assessment_item_id?: string | null
          created_at?: string
          id?: string
          skill_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_skill_mapping_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_skill_mapping_assessment_item_id_fkey"
            columns: ["assessment_item_id"]
            isOneToOne: false
            referencedRelation: "assessment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_skill_mapping_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_date: string | null
          assessment_type: string
          created_at: string
          description: string | null
          grade_level: string
          id: string
          is_draft: boolean | null
          max_score: number
          standards_covered: string[] | null
          subject: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_date?: string | null
          assessment_type: string
          created_at?: string
          description?: string | null
          grade_level: string
          id?: string
          is_draft?: boolean | null
          max_score: number
          standards_covered?: string[] | null
          subject: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_date?: string | null
          assessment_type?: string
          created_at?: string
          description?: string | null
          grade_level?: string
          id?: string
          is_draft?: boolean | null
          max_score?: number
          standards_covered?: string[] | null
          subject?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_exports: {
        Row: {
          completed_at: string | null
          created_at: string
          export_format: string
          export_type: string
          file_url: string | null
          filters: Json | null
          id: string
          status: string
          teacher_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          export_format: string
          export_type: string
          file_url?: string | null
          filters?: Json | null
          id?: string
          status?: string
          teacher_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          export_format?: string
          export_type?: string
          file_url?: string | null
          filters?: Json | null
          id?: string
          status?: string
          teacher_id?: string
        }
        Relationships: []
      }
      email_automations: {
        Row: {
          created_at: string
          email_template_id: string | null
          id: string
          is_active: boolean | null
          name: string
          teacher_id: string
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_template_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          teacher_id: string
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_template_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          teacher_id?: string
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          subject: string
          teacher_id: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          teacher_id: string
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          teacher_id?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      goal_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          created_at: string
          dismissed_at: string | null
          goal_id: string
          id: string
          student_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          created_at?: string
          dismissed_at?: string | null
          goal_id: string
          id?: string
          student_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          created_at?: string
          dismissed_at?: string | null
          goal_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_achievements_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          goal_id: string
          id: string
          target_date: string | null
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_id: string
          id?: string
          target_date?: string | null
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          goal_id?: string
          id?: string
          target_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_milestones_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_progress_history: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          progress_percentage: number
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          progress_percentage: number
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          progress_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_history_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          progress_percentage: number | null
          status: string
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
          progress_percentage?: number | null
          status?: string
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
          progress_percentage?: number | null
          status?: string
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
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          student_id: string | null
          teacher_id: string
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          student_id?: string | null
          teacher_id: string
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          student_id?: string | null
          teacher_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      parent_communications: {
        Row: {
          communication_type: string
          content: string
          created_at: string
          email_status: string | null
          id: string
          parent_email: string | null
          pdf_url: string | null
          sent_at: string | null
          student_id: string
          subject: string
          teacher_id: string
        }
        Insert: {
          communication_type: string
          content: string
          created_at?: string
          email_status?: string | null
          id?: string
          parent_email?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          student_id: string
          subject: string
          teacher_id: string
        }
        Update: {
          communication_type?: string
          content?: string
          created_at?: string
          email_status?: string | null
          id?: string
          parent_email?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          student_id?: string
          subject?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_communications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_categories: {
        Row: {
          created_at: string
          description: string | null
          grade_levels: string[] | null
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade_levels?: string[] | null
          id?: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade_levels?: string[] | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_mastery_history: {
        Row: {
          assessment_id: string | null
          created_at: string
          date_recorded: string
          id: string
          mastery_level: string
          score: number
          skill_id: string
          student_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          date_recorded?: string
          id?: string
          mastery_level: string
          score: number
          skill_id: string
          student_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          date_recorded?: string
          id?: string
          mastery_level?: string
          score?: number
          skill_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_mastery_history_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_mastery_history_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_mastery_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_prerequisites: {
        Row: {
          created_at: string
          id: string
          prerequisite_skill_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prerequisite_skill_id: string
          skill_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prerequisite_skill_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_prerequisites_prerequisite_skill_id_fkey"
            columns: ["prerequisite_skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_prerequisites_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category_id: string | null
          created_at: string
          curriculum_standard: string | null
          description: string | null
          difficulty_level: number | null
          grade_level: string
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          curriculum_standard?: string | null
          description?: string | null
          difficulty_level?: number | null
          grade_level: string
          id?: string
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          curriculum_standard?: string | null
          description?: string | null
          difficulty_level?: number | null
          grade_level?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      student_performance: {
        Row: {
          assessment_count: number
          average_score: number | null
          created_at: string
          id: string
          last_assessment_date: string | null
          needs_attention: boolean
          performance_level: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          assessment_count?: number
          average_score?: number | null
          created_at?: string
          id?: string
          last_assessment_date?: string | null
          needs_attention?: boolean
          performance_level?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          assessment_count?: number
          average_score?: number | null
          created_at?: string
          id?: string
          last_assessment_date?: string | null
          needs_attention?: boolean
          performance_level?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_performance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_responses: {
        Row: {
          assessment_id: string
          assessment_item_id: string
          created_at: string
          error_type: string | null
          id: string
          score: number
          student_id: string
          teacher_notes: string | null
          updated_at: string
        }
        Insert: {
          assessment_id: string
          assessment_item_id: string
          created_at?: string
          error_type?: string | null
          id?: string
          score: number
          student_id: string
          teacher_notes?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          assessment_item_id?: string
          created_at?: string
          error_type?: string | null
          id?: string
          score?: number
          student_id?: string
          teacher_notes?: string | null
          updated_at?: string
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
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_skills: {
        Row: {
          assessment_count: number | null
          created_at: string
          current_mastery_level: string | null
          id: string
          last_assessed_at: string | null
          mastery_score: number | null
          skill_id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          assessment_count?: number | null
          created_at?: string
          current_mastery_level?: string | null
          id?: string
          last_assessed_at?: string | null
          mastery_score?: number | null
          skill_id: string
          student_id: string
          updated_at?: string
        }
        Update: {
          assessment_count?: number | null
          created_at?: string
          current_mastery_level?: string | null
          id?: string
          last_assessed_at?: string | null
          mastery_score?: number | null
          skill_id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_skills_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          grade_level: string
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
          avatar_url?: string | null
          created_at?: string
          first_name: string
          grade_level: string
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
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          grade_level?: string
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
        Relationships: []
      }
      system_performance_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          method: string
          response_time_ms: number
          status_code: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          method: string
          response_time_ms: number
          status_code: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string
          response_time_ms?: number
          status_code?: number
          user_id?: string | null
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
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
          full_name: string
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
          full_name?: string
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
      [_ in never]: never
    }
    Functions: {
      calculate_mastery_level: {
        Args: { score: number }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
