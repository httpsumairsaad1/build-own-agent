# Supabase Database and Data Access Implementation for vibeXnews

## Goal

Implement the complete Supabase database layer and data access architecture for **vibeXnews** adhering to `AGENTS.md` and `.agents/skills/supabase`.
This includes:
1. Installing `@supabase/supabase-js`.
2. Defining the clean, production-grade schema in `supabase/schema.sql` (for `sources`, `articles`, `article_analyses`, `logs`, `oxylabs_schedules`, `oxylabs_schedule_runs`) with proper RLS, constraints, and indexes.
3. Supplying a standalone `supabase/seed.sql` containing 5 active news sources (`Reuters`, `BBC News`, `NPR`, `The Guardian`, `Fox News`) with their homepage `listing_url` values, kept strictly separate from `schema.sql`.
4. Implementing Supabase clients in `lib/supabase/client.ts` (browser client using anon key) and `lib/supabase/server.ts` (service role client for backend operations, and anon client for read operations).
5. Defining full TypeScript database types and domain types in `lib/supabase/types.ts`.
6. Creating clean data access query functions in `lib/supabase/queries/articles.ts` and `lib/supabase/queries/sources.ts` with graceful fallback to mock data when Supabase has no data yet or during development transition.
7. Wiring the home feed (`app/page.tsx`), article detail page (`app/article/[id]/page.tsx`), and category pages to the new query functions so they seamlessly display Supabase persisted data.
8. Updating `.env.example` to document Supabase environment variables.

---

## Skills Read

- `AGENTS.md` — Section 1 (Product), Section 5 (Architecture), Section 6 (Tech stack), Section 7 (Supabase source of truth), Section 8 (Scraping source selection), Section 9 (Correct scraping model & dedupe), Section 19 (AI analysis & framing), Section 21 (Security: never expose service role key to client, Joined table filter gotcha).
- `.agents/skills/supabase` — Core principles, RLS in exposed schemas, API key exposure, Data API permissions, security traps, querying best practices.
- `.agents/skills/supabase-postgres-best-practices` — Primary keys (`uuid`), foreign keys with indexes, RLS policies, column types, timestamp with time zone, casing conventions.

---

## Existing Code Inspected

- `package.json` — Next.js 16.3.1, React 19; `@supabase/supabase-js` needs to be installed.
- `.env.local` — Contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- `.env.example` — Currently only lists Clerk variables; needs to be updated with Supabase variables.
- `lib/data/mock-articles.ts` — Defines existing article, sentiment, and bias models used across UI.
- `app/page.tsx` — Home feed currently reading from `MOCK_ARTICLES`.
- `app/article/[id]/page.tsx` — Article detail page currently using `getArticleById` and `getRelatedArticles` from `mock-articles.ts`.
- `app/politics/page.tsx`, `tech-vibe/page.tsx`, `social-change/page.tsx`, `economy/page.tsx`, `pop-culture/page.tsx` — Category pages using `getArticlesByCategory`.
- `components/ArticleCard.tsx`, `components/BiasMeter.tsx`, `components/Badges.tsx`, `components/ArticleThumbnail.tsx` — Reusable UI components expecting standard article data fields.

---

## Decisions and Assumptions

1. **Client / Server Boundaries**:
   - `lib/supabase/client.ts` uses `createClient` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - `lib/supabase/server.ts` provides `getServiceSupabase()` for administrative / pipeline backend operations requiring `SUPABASE_SERVICE_ROLE_KEY`, and `getAnonSupabase()` for server-side reads.
   - Server-only modules will enforce the server boundary so `SUPABASE_SERVICE_ROLE_KEY` is never leaked to the browser.
2. **Schema & Tables** (`supabase/schema.sql`):
   - Tables:
     - `sources`: `id` (uuid default gen_random_uuid()), `name` (text unique), `listing_url` (text not null), `parser_strategy` (text), `is_active` (boolean default true), `logo_url` (text), `created_at` (timestamptz default now()), `updated_at` (timestamptz default now()).
     - `articles`: `id` (uuid default gen_random_uuid()), `source_id` (uuid references sources(id) on delete cascade), `original_url` (text unique not null), `canonical_url` (text), `title` (text not null), `image_url` (text not null), `published_at` (timestamptz not null), `raw_text` (text), `category` (text), `scraped_at` (timestamptz default now()), `analyzed_at` (timestamptz).
     - `article_analyses`: `id` (uuid default gen_random_uuid()), `article_id` (uuid references articles(id) on delete cascade unique), `summary` (text not null), `sentiment_score` (numeric(3,2) not null), `sentiment_label` (text not null), `bias_score` (numeric(3,2) not null), `bias_label` (text not null), `left_percentage` (int not null), `center_percentage` (int not null), `right_percentage` (int not null), `confidence` (numeric(3,2) not null), `framing_notes` (text), `loaded_terms` (jsonb default '[]'::jsonb), `disclaimer` (text), `model` (text not null), `created_at` (timestamptz default now()).
       *(Note: `embedding vector(1536)` is excluded per AGENTS.md Section 7 until section 20).*
     - `logs`: `id` (uuid default gen_random_uuid()), `run_type` (text not null), `status` (text not null), `message` (text), `details` (jsonb), `created_at` (timestamptz default now()).
     - `oxylabs_schedules`: `id` (uuid default gen_random_uuid()), `source_id` (uuid references sources(id) on delete cascade), `oxylabs_schedule_id` (text not null unique), `is_active` (boolean default true), `created_at` (timestamptz default now()), `updated_at` (timestamptz default now()).
     - `oxylabs_schedule_runs`: `id` (uuid default gen_random_uuid()), `schedule_id` (uuid references oxylabs_schedules(id) on delete cascade), `oxylabs_run_id` (text not null), `status` (text not null), `articles_found` (int default 0), `articles_inserted` (int default 0), `created_at` (timestamptz default now()).
   - RLS Policies:
     - Enable RLS on all tables.
     - Public read (`anon`, `authenticated`) allowed for `sources`, `articles`, and `article_analyses`.
     - Write access (`insert`, `update`, `delete`) restricted to `service_role`.
   - Indexes:
     - Foreign key indexes on `articles(source_id)`, `article_analyses(article_id)`, `oxylabs_schedules(source_id)`, `oxylabs_schedule_runs(schedule_id)`.
     - Indexes on `articles(published_at desc)`, `articles(analyzed_at)`, `articles(original_url)`.
3. **Seed Data** (`supabase/seed.sql`):
   - Standalone file containing the 5 active news sources:
     - Reuters (`https://www.reuters.com`)
     - BBC News (`https://www.bbc.com/news`)
     - NPR (`https://www.npr.org`)
     - The Guardian (`https://www.theguardian.com/us`)
     - Fox News (`https://www.foxnews.com`)
   - Uses `ON CONFLICT (listing_url) DO UPDATE` or `ON CONFLICT (name) DO NOTHING` for idempotence.
4. **Data Access Queries & Graceful Fallback**:
   - `getArticles(category?: string, limit?: number)`: Queries Supabase for analyzed articles with joined `sources` and `article_analyses`. Falls back to `MOCK_ARTICLES` if Supabase has 0 rows or is not populated yet, ensuring the UI remains interactive and fully populated until real scraping/analysis runs.
   - `getArticleById(id: string)`: Queries Supabase article by id (or slug/id), falling back to mock articles if not found in DB.
   - `getActiveSources()`: Reads active sources from `sources` table.
5. **UI Wiring**:
   - Update `app/page.tsx` (Home feed) and category pages to use `getArticles()` and `getActiveSources()` from `@/lib/supabase/queries/articles`.
   - Update `app/article/[id]/page.tsx` (Detail page) to query via `getArticleById()` and `getRelatedArticles()` from `@/lib/supabase/queries/articles`.

---

## Files Likely to Change / Create

- `package.json` [MODIFY] — add `@supabase/supabase-js`.
- `.env.example` [MODIFY] — add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- `supabase/schema.sql` [NEW] — comprehensive Postgres schema with DDL, constraints, RLS policies, and indexes.
- `supabase/seed.sql` [NEW] — standalone seed script inserting the 5 active sources with their listing URLs.
- `lib/supabase/types.ts` [NEW] — Database schema types and UI mapping types.
- `lib/supabase/client.ts` [NEW] — Browser Supabase client.
- `lib/supabase/server.ts` [NEW] — Server-side Supabase client (anon and service-role).
- `lib/supabase/queries/articles.ts` [NEW] — `getArticles`, `getArticleById`, `getRelatedArticles` functions with DB queries and fallback.
- `lib/supabase/queries/sources.ts` [NEW] — `getActiveSources` query function.
- `app/page.tsx` [MODIFY] — fetch and display articles via query function.
- `app/article/[id]/page.tsx` [MODIFY] — fetch article and related perspectives via query function.
- `app/politics/page.tsx`, `app/tech-vibe/page.tsx`, `app/social-change/page.tsx`, `app/economy/page.tsx`, `app/pop-culture/page.tsx` [MODIFY] — wired to query function.

---

## Implementation Requirements

1. **Package Installation**:
   - `npm install @supabase/supabase-js`
2. **Schema & Migration (`supabase/schema.sql`)**:
   - Implement `sources`, `articles`, `article_analyses`, `logs`, `oxylabs_schedules`, `oxylabs_schedule_runs`.
   - Enable RLS on every table.
   - Provide `SELECT` policies for public read on `sources`, `articles`, and `article_analyses`.
   - Service role retains full bypass or explicit write permissions.
3. **Seed File (`supabase/seed.sql`)**:
   - Provide clean INSERT statements for the 5 active news sources (`Reuters`, `BBC News`, `NPR`, `The Guardian`, `Fox News`) with `listing_url`, `is_active = true`.
4. **Supabase Client Architecture**:
   - Client-side: `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`.
   - Server-side: `getServiceSupabase()` using `SUPABASE_SERVICE_ROLE_KEY`.
5. **Type Safety & Mapping**:
   - Strong TypeScript types for database rows and UI representation.
   - Helper mapping function from joined Supabase row `ArticleWithSourceAndAnalysis` to UI `Article` interface.
6. **Query Functions**:
   - Efficient queries with `.order('published_at', { ascending: false })`.
   - Avoid joined table `.eq()` filter bugs (per `AGENTS.md` section 21) by filtering in JS or query chaining.
7. **Page Wiring**:
   - Home page and details page hooked up to the query functions.

---

## Security Requirements

- Never import `SUPABASE_SERVICE_ROLE_KEY` or `lib/supabase/server.ts` into client-side components (`"use client"`).
- Only publishable anon key is exposed to browser via `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- RLS enabled on all tables in `public`.
- Non-public tables (`logs`, `oxylabs_schedules`, `oxylabs_schedule_runs`) are inaccessible via anon role.

---

## Acceptance Criteria

- `supabase/schema.sql` created with complete tables, constraints, foreign keys, indexes, and RLS policies.
- `supabase/seed.sql` created with 5 active sources and listing URLs.
- `@supabase/supabase-js` installed cleanly.
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, and `lib/supabase/types.ts` created.
- `lib/supabase/queries/articles.ts` and `lib/supabase/queries/sources.ts` created with fallback support.
- Home feed and details page wired to use Supabase queries.
- `npm run typecheck` and `npm run lint` pass with 0 errors.

---

## Checks to Run

1. `npm run typecheck` (`tsc --noEmit`)
2. `npm run lint` (`eslint`)
3. `npm run build` (Next.js build verification)

---

## Manual Test Steps

1. Run `npm run dev` and navigate to `http://localhost:3000`.
2. Verify home feed loads smoothly and displays article cards with sentiment, bias meters, and sources.
3. Click an article card and verify navigation to `/article/[id]` renders full article content, key takeaways, and related perspectives.
4. Verify category pages (`/politics`, `/tech-vibe`, `/economy`, etc.) load properly.
5. In Supabase Dashboard SQL Editor, run `supabase/schema.sql` followed by `supabase/seed.sql`.
6. Run a query in Supabase SQL editor: `SELECT * FROM sources;` to confirm 5 active sources inserted.
