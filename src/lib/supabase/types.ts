/**
 * Supabase Database Types
 *
 * 이 파일은 Supabase CLI로 자동 생성되어야 합니다:
 * npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
 *
 * 아래는 예상 스키마입니다.
 */

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          primary_color: string;
          color_ramp: Record<string, string>;
          extracted_colors: Record<string, unknown>[];
          theme_palette: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          primary_color: string;
          color_ramp: Record<string, string>;
          extracted_colors?: Record<string, unknown>[];
          theme_palette?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          primary_color?: string;
          color_ramp?: Record<string, string>;
          extracted_colors?: Record<string, unknown>[];
          theme_palette?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
      color_palettes: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          colors: Record<string, string>;
          is_favorite: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          colors: Record<string, string>;
          is_favorite?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          colors?: Record<string, string>;
          is_favorite?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type NewProject = Database["public"]["Tables"]["projects"]["Insert"];
export type UpdateProject = Database["public"]["Tables"]["projects"]["Update"];

export type ColorPalette =
  Database["public"]["Tables"]["color_palettes"]["Row"];
export type NewColorPalette =
  Database["public"]["Tables"]["color_palettes"]["Insert"];
