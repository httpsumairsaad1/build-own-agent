-- vibeXnews Database Schema
-- Supabase source of truth schema for sources, articles, analyses, logs, and scheduler tracking.
-- Note: pgvector and embedding vector(1536) are excluded here per AGENTS.md section 7 and will be added in section 20.

-- 1. SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  listing_url TEXT NOT NULL UNIQUE,
  parser_strategy TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL UNIQUE,
  canonical_url TEXT,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  raw_text TEXT,
  category TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMPTZ
);

-- 3. ARTICLE_ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.article_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL UNIQUE REFERENCES public.articles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  sentiment_score NUMERIC(4,2) NOT NULL, -- range -1.00 to 1.00
  sentiment_label TEXT NOT NULL CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
  bias_score NUMERIC(4,2) NOT NULL, -- range -1.00 to 1.00, derived as (right - left) / 100
  bias_label TEXT NOT NULL CHECK (bias_label IN ('left', 'center', 'right', 'mixed', 'unclear')),
  left_percentage INTEGER NOT NULL CHECK (left_percentage >= 0 AND left_percentage <= 100),
  center_percentage INTEGER NOT NULL CHECK (center_percentage >= 0 AND center_percentage <= 100),
  right_percentage INTEGER NOT NULL CHECK (right_percentage >= 0 AND right_percentage <= 100),
  confidence NUMERIC(4,2) NOT NULL CHECK (confidence >= 0.00 AND confidence <= 1.00),
  framing_notes TEXT,
  loaded_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
  disclaimer TEXT,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_percentage_sum CHECK (left_percentage + center_percentage + right_percentage = 100)
);

-- 4. LOGS TABLE
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type TEXT NOT NULL, -- 'manual_scrape', 'scheduler_process', 'ai_analysis', 'cron_pipeline'
  status TEXT NOT NULL,   -- 'started', 'completed', 'failed'
  message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. OXYLABS_SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.oxylabs_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  oxylabs_schedule_id TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. OXYLABS_SCHEDULE_RUNS TABLE
CREATE TABLE IF NOT EXISTS public.oxylabs_schedule_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.oxylabs_schedules(id) ON DELETE CASCADE,
  oxylabs_run_id TEXT NOT NULL,
  status TEXT NOT NULL,
  articles_found INTEGER NOT NULL DEFAULT 0,
  articles_inserted INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_sources_active ON public.sources(is_active);
CREATE INDEX IF NOT EXISTS idx_articles_source_id ON public.articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_analyzed_at ON public.articles(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_original_url ON public.articles(original_url);
CREATE INDEX IF NOT EXISTS idx_article_analyses_article_id ON public.article_analyses(article_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON public.logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oxylabs_schedules_source_id ON public.oxylabs_schedules(source_id);
CREATE INDEX IF NOT EXISTS idx_oxylabs_schedule_runs_schedule_id ON public.oxylabs_schedule_runs(schedule_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oxylabs_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oxylabs_schedule_runs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Sources: Public read (anon & authenticated)
CREATE POLICY "Allow public read access on sources"
  ON public.sources
  FOR SELECT
  TO public
  USING (true);

-- Articles: Public read (anon & authenticated)
CREATE POLICY "Allow public read access on articles"
  ON public.articles
  FOR SELECT
  TO public
  USING (true);

-- Article Analyses: Public read (anon & authenticated)
CREATE POLICY "Allow public read access on article_analyses"
  ON public.article_analyses
  FOR SELECT
  TO public
  USING (true);

-- Logs, oxylabs_schedules, oxylabs_schedule_runs have NO public policies.
-- They are only accessible via service_role which bypasses RLS.
