# Implementation Prompt: Dynamic Real Articles & Category Niche Routing (Eliminate Mocks)

## Goal
Fix news article display issues across **vibeXnews**:
1. Eliminate all `MOCK_ARTICLES` fallbacks so the app strictly displays stored real news from Supabase (per AGENTS.md Sections 1, 5, 6, 7).
2. Ensure newly scraped articles from Oxylabs Scheduler runs are immediately analyzed by AI (`analyzed_at IS NOT NULL`) so they appear dynamically on the home page / all-feed without delay.
3. Assign proper categories (`"Tech-Vibe"`, `"Economy"`, `"Politics"`, `"Pop Culture"`, `"Social Change"`) to scraped articles via URL path heuristics, meta tags, and AI analysis classification.
4. Enable dynamic category filtering across all niche pages (`/tech-vibe`, `/politics`, `/economy`, `/pop-culture`, `/social-change`) and Home category pills with real source pictures.

---

## Skills Read
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/ai-sdk/SKILL.md`
- `.agents/skills/web-scraper-api/SKILL.md`
- `AGENTS.md` (Sections 1, 5, 6, 7, 9, 13, 18, 19)

---

## Existing Code Inspected
- `lib/supabase/queries/articles.ts`: Uses `getMockArticlesFiltered` and `MOCK_ARTICLES` fallbacks when category queries return 0 rows.
- `lib/data/mock-articles.ts`: Static hardcoded articles that mask database state.
- `lib/scraping/parsers.ts`: Currently extracts category only from `meta[property='article:section']`, causing all scraped articles to have `category = null`.
- `lib/analysis/pipeline.ts` & `lib/analysis/analyze-article.ts`: Analyzes text but doesn't classify/update `articles.category`.
- `app/api/oxylabs/scheduled-results/process/route.ts`: Only calls `processScheduledResults()` without chaining `runAnalysis()`, leaving new articles unanalyzed and hidden from the homepage.
- `app/tech-vibe/page.tsx`, `app/politics/page.tsx`, `app/economy/page.tsx`, `app/pop-culture/page.tsx`, `app/social-change/page.tsx`: Query `getArticlesByCategory()` which falls back to mocks when category is null.

---

## Decisions & Assumptions

1. **Complete Mock Removal**:
   - Remove `MOCK_ARTICLES` and `getMockArticlesFiltered` from `lib/supabase/queries/articles.ts`.
   - All queries return only real Supabase data. If 0 articles exist for a category, return `[]` to let the UI display its existing elegant empty state.
   - Clean up any listing pages stored in DB (e.g., "AI News | Latest Headlines and Developments | Reuters").

2. **Multi-Stage Category Classification**:
   - **Stage 1 (Scraping)**: Extract category in `parsers.ts` from:
     - Meta tags: `article:section`, `og:article:section`, `parsely-section`, `keywords`
     - URL path segment matching:
       - `/tech/`, `/technology/`, `/ai/`, `/cyber/` -> `"Tech-Vibe"`
       - `/business/`, `/markets/`, `/economy/`, `/finance/` -> `"Economy"`
       - `/politics/`, `/world/`, `/national/`, `/government/`, `/defense/` -> `"Politics"`
       - `/entertainment/`, `/lifestyle/`, `/culture/`, `/arts/` -> `"Pop Culture"`
       - `/climate/`, `/environment/`, `/society/`, `/health/` -> `"Social Change"`
   - **Stage 2 (AI Analysis)**: AI model classifies article into canonical category (`"Politics" | "Tech-Vibe" | "Economy" | "Pop Culture" | "Social Change"`). When saving analysis, update `articles.category`.
   - **Stage 3 (Existing Data)**: Categorize existing unclassified articles in Supabase.

3. **Chained Analysis on Scheduled Processing**:
   - Update `app/api/oxylabs/scheduled-results/process/route.ts` and `lib/scraping/scheduler.ts` to automatically trigger `runAnalysis({ limit: 50 })` after scheduled result processing.
   - Analyze all currently pending articles in Supabase so newly scraped news immediately appears on Home and niche pages.

4. **Normalized Category Matching**:
   - Update `getArticles(category)` in `lib/supabase/queries/articles.ts` to support category normalization and aliases (e.g. matching `"Tech-Vibe"` with `"tech-vibe"`, `"tech"`, `"technology"`).

---

## Files Likely to Create / Modify
1. `lib/supabase/queries/articles.ts` — Remove all `MOCK_ARTICLES` imports/fallbacks, improve category filtering.
2. `lib/scraping/parsers.ts` — Enhance section/category extraction using URL paths and meta tags.
3. `lib/analysis/schema.ts` & `lib/analysis/analyze-article.ts` — Include category classification in AI prompt/schema.
4. `lib/analysis/pipeline.ts` — Update `articles.category` when persisting analysis.
5. `app/api/oxylabs/scheduled-results/process/route.ts` — Chain AI analysis after scheduled scraping.
6. `scripts/classify-existing-articles.ts` (scratch) — Classify existing articles and run analysis on pending ones.

---

## Implementation Requirements
1. Remove all mock article fallbacks from `getArticles`, `getArticleById`, and `getRelatedArticles`.
2. Enhance `parseArticleDetail` in `parsers.ts` to deduce category from URL path and meta headers.
3. Add canonical category output to `analyzeArticle` and persist it to `articles.category`.
4. Ensure `POST /api/oxylabs/scheduled-results/process` runs `runAnalysis({ limit: 50 })` so articles become immediately visible on the homepage with pictures and analysis metrics.
5. Update existing pending articles in Supabase with AI analysis and categories.

---

## Security Requirements
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` server-side only.
- Maintain admin secret protection on mutating endpoints.

---

## Acceptance Criteria
- Zero mock articles returned on any page (Home, Details, `/tech-vibe`, `/politics`, `/economy`, `/pop-culture`, `/social-change`).
- Newly scraped articles (e.g. bond markets, oil prices) get analyzed and appear dynamically on the homepage with real pictures.
- Category pages display real articles matching their respective niches.
- `npm run typecheck` and `npm run lint` pass with 0 errors.

---

## Checks to Run
1. `npm run typecheck`
2. `npm run lint`
3. Database verification script confirming categorized, analyzed articles with valid images.

---

## Exact Manual Test Steps Expected After Implementation
1. Visit `http://localhost:3000/` and verify newly scraped articles (with real images) appear at the top.
2. Visit `http://localhost:3000/tech-vibe` and verify real AI/Tech articles (Anthropic, Micron, FTC AI probe) appear with images.
3. Visit `http://localhost:3000/economy` and verify real Economy articles (World bond markets, Treasury yields, Oil prices) appear with images.
4. Visit `http://localhost:3000/politics` and verify real Politics articles appear with images.
5. Check details page `http://localhost:3000/article/<id>` for a real article to confirm full sentiment & framing metrics.
