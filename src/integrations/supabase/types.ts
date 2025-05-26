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
      parent_communications: {
        Row: {
          communication_type: string
          content: string
          created_at: string
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
      students: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          grade_level: string
          id: string
          last_name: string
          learning_goals: string | null
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
          special_considerations?: string | null
          student_id?: string | null
          teacher_id?: string
          updated_at?: string
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
