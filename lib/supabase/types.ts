export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          name: string;
          listing_url: string;
          parser_strategy: string | null;
          is_active: boolean;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          listing_url: string;
          parser_strategy?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          listing_url?: string;
          parser_strategy?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          source_id: string;
          original_url: string;
          canonical_url: string | null;
          title: string;
          image_url: string;
          published_at: string;
          raw_text: string | null;
          category: string | null;
          scraped_at: string;
          analyzed_at: string | null;
        };
        Insert: {
          id?: string;
          source_id: string;
          original_url: string;
          canonical_url?: string | null;
          title: string;
          image_url: string;
          published_at: string;
          raw_text?: string | null;
          category?: string | null;
          scraped_at?: string;
          analyzed_at?: string | null;
        };
        Update: {
          id?: string;
          source_id?: string;
          original_url?: string;
          canonical_url?: string | null;
          title?: string;
          image_url?: string;
          published_at?: string;
          raw_text?: string | null;
          category?: string | null;
          scraped_at?: string;
          analyzed_at?: string | null;
        };
      };
      article_analyses: {
        Row: {
          id: string;
          article_id: string;
          summary: string;
          sentiment_score: number;
          sentiment_label: "positive" | "neutral" | "negative";
          bias_score: number;
          bias_label: "left" | "center" | "right" | "mixed" | "unclear";
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          confidence: number;
          framing_notes: string | null;
          loaded_terms: Json;
          disclaimer: string | null;
          model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          summary: string;
          sentiment_score: number;
          sentiment_label: "positive" | "neutral" | "negative";
          bias_score: number;
          bias_label: "left" | "center" | "right" | "mixed" | "unclear";
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          confidence: number;
          framing_notes?: string | null;
          loaded_terms?: Json;
          disclaimer?: string | null;
          model: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          summary?: string;
          sentiment_score?: number;
          sentiment_label?: "positive" | "neutral" | "negative";
          bias_score?: number;
          bias_label?: "left" | "center" | "right" | "mixed" | "unclear";
          left_percentage?: number;
          center_percentage?: number;
          right_percentage?: number;
          confidence?: number;
          framing_notes?: string | null;
          loaded_terms?: Json;
          disclaimer?: string | null;
          model?: string;
          created_at?: string;
        };
      };
      logs: {
        Row: {
          id: string;
          run_type: string;
          status: string;
          message: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_type: string;
          status: string;
          message?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          run_type?: string;
          status?: string;
          message?: string | null;
          details?: Json | null;
          created_at?: string;
        };
      };
      oxylabs_schedules: {
        Row: {
          id: string;
          source_id: string;
          oxylabs_schedule_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          oxylabs_schedule_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          oxylabs_schedule_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      oxylabs_schedule_runs: {
        Row: {
          id: string;
          schedule_id: string;
          oxylabs_run_id: string;
          status: string;
          articles_found: number;
          articles_inserted: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          oxylabs_run_id: string;
          status: string;
          articles_found?: number;
          articles_inserted?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          oxylabs_run_id?: string;
          status?: string;
          articles_found?: number;
          articles_inserted?: number;
          created_at?: string;
        };
      };
    };
  };
}

export type SourceRow = Database["public"]["Tables"]["sources"]["Row"];
export type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
export type ArticleAnalysisRow = Database["public"]["Tables"]["article_analyses"]["Row"];
export type LogRow = Database["public"]["Tables"]["logs"]["Row"];
export type OxylabsScheduleRow = Database["public"]["Tables"]["oxylabs_schedules"]["Row"];
export type OxylabsScheduleRunRow = Database["public"]["Tables"]["oxylabs_schedule_runs"]["Row"];

export type JoinedArticleRow = ArticleRow & {
  sources: SourceRow | null;
  article_analyses: ArticleAnalysisRow | null;
};
