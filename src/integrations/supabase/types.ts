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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      candidatos: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: never
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: never
          metadata?: Json | null
        }
        Relationships: []
      }
      chat_favoritos: {
        Row: {
          candidate_index: number
          compatibilidade: number | null
          created_at: string | null
          email: string | null
          id: string
          link: string | null
          nome: string
          recrutador_id: string
          resumo: string
          session_id: string
          telefone: string | null
          updated_at: string | null
          vaga_id: string | null
        }
        Insert: {
          candidate_index: number
          compatibilidade?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          link?: string | null
          nome: string
          recrutador_id: string
          resumo: string
          session_id: string
          telefone?: string | null
          updated_at?: string | null
          vaga_id?: string | null
        }
        Update: {
          candidate_index?: number
          compatibilidade?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          link?: string | null
          nome?: string
          recrutador_id?: string
          resumo?: string
          session_id?: string
          telefone?: string | null
          updated_at?: string | null
          vaga_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_favoritos_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_copy: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_index: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      filtros_personalizados: {
        Row: {
          created_at: string
          criterios: Json
          id: string
          nome: string
          recrutador_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criterios: Json
          id?: string
          nome: string
          recrutador_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criterios?: Json
          id?: string
          nome?: string
          recrutador_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      login: {
        Row: {
          id: number
          login: string
          senha: string | null
        }
        Insert: {
          id?: number
          login: string
          senha?: string | null
        }
        Update: {
          id?: number
          login?: string
          senha?: string | null
        }
        Relationships: []
      }
      mec_instituicoes: {
        Row: {
          categoria_administrativa: string | null
          codigo_ies: string
          created_at: string
          cursos: Json | null
          id: string
          municipio: string | null
          nome_ies: string
          organizacao_academica: string | null
          sigla_ies: string | null
          uf: string | null
          updated_at: string
        }
        Insert: {
          categoria_administrativa?: string | null
          codigo_ies: string
          created_at?: string
          cursos?: Json | null
          id?: string
          municipio?: string | null
          nome_ies: string
          organizacao_academica?: string | null
          sigla_ies?: string | null
          uf?: string | null
          updated_at?: string
        }
        Update: {
          categoria_administrativa?: string | null
          codigo_ies?: string
          created_at?: string
          cursos?: Json | null
          id?: string
          municipio?: string | null
          nome_ies?: string
          organizacao_academica?: string | null
          sigla_ies?: string | null
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
          primeiro_nome: string | null
          sobrenome: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome: string
          primeiro_nome?: string | null
          sobrenome?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          primeiro_nome?: string | null
          sobrenome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tabelateste: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
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
        Relationships: []
      }
      vagas: {
        Row: {
          created_at: string
          id: string
          recrutador_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recrutador_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recrutador_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      candidato_dinamico:
        | {
            Args: {
              data_nascimento?: string
              email?: string
              endereco?: string
              experiencias?: string
              formacoes?: string
              idiomas?: string
              nome?: string
              perfil?: string
              qtd?: number
              query_embedding: string
              telefone?: string
            }
            Returns: {
              content: string
              id: number
              metadata: Json
              similaridade: number
            }[]
          }
        | {
            Args: {
              data_nascimento?: string
              email?: string
              endereco?: string
              experiencias?: string
              formacoes?: string
              nome?: string
              perfil?: string
              qtd?: number
              query_embedding: string
              telefone?: string
            }
            Returns: {
              content: string
              id: number
              metadata: Json
              similaridade: number
            }[]
          }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
      match_documents: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      supabase_candidato: {
        Args: { qtd?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "recruiter"
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
      app_role: ["admin", "recruiter"],
    },
  },
} as const
