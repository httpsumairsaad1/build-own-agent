# Scrape 7 News Articles & UI Update Pipeline

## Goal

Scrape candidate news articles from active sources stored in Supabase, validate and insert them into the `articles` database table, process AI sentiment and political framing analysis using `gemini-3.6-flash`, and set `articles.analyzed_at` so that 7+ fresh analyzed news cards update on the UI.

## Skills and documentation read

- `AGENTS.md`
- `.agents/skills/web-scraper-api/SKILL.md`
- `.agents/skills/ai-sdk/SKILL.md`
- `.agents/skills/supabase/SKILL.md`

## Existing code inspected

- `app/api/scrape/route.ts`: validates `perSourceLimit` (currently max 5).
- `lib/scraping/pipeline.ts`: executes Oxylabs homepage scraping, link extraction, candidate filtering, detail scraping, validation, and insertion into Supabase.
- `app/api/analyze/route.ts`: triggers AI analysis pipeline.
- `lib/analysis/pipeline.ts` & `lib/analysis/analyze-article.ts`: executes Gemini structured analysis & embedding, saving to `article_analyses` and setting `articles.analyzed_at`.
- Active sources in Supabase: Reuters, BBC News, NPR, The Guardian, Fox News.

## Decisions or assumptions

- Update `perSourceLimit` input validation in `app/api/scrape/route.ts` to accept limits from `1` through `10` (allowing scraping 7 articles or 2-3 per source across active sources).
- Run `POST /api/scrape` with `perSourceLimit: 2` across active sources to collect fresh article detail pages.
- Immediately run `POST /api/analyze` to analyze all newly inserted pending articles with `gemini-3.6-flash`.
- Because the UI displays only analyzed articles (`analyzed_at IS NOT NULL`), completing AI analysis automatically publishes the articles to the UI news cards and news details pages.

## Files likely to change

- `app/api/scrape/route.ts`

## Implementation requirements

1. Update `app/api/scrape/route.ts` validation to permit `perSourceLimit` between 1 and 10.
2. Execute manual scrape via `POST /api/scrape` for active sources.
3. Execute AI analysis via `POST /api/analyze` to generate structured sentiment and framing analysis for all newly scraped articles.
4. Verify articles display `analyzed_at` in Supabase and populate the UI news feed.

## Security requirements

- Protect `/api/scrape` and `/api/analyze` endpoints with `x-vibexnews-admin-secret` matching `VIBEXNEWS_ADMIN_SECRET`.
- Perform all Oxylabs WSA API requests and Gemini model calls strictly server-side.

## Acceptance criteria

- At least 7 valid articles are scraped, validated, and stored in Supabase `articles`.
- All inserted articles undergo Gemini AI analysis (`article_analyses` created) and have `analyzed_at` set.
- Fresh articles appear on the home page UI news cards and detail pages.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`

## Exact manual test steps expected after implementation

1. Trigger scrape endpoint:
```powershell
curl -X POST http://localhost:3000/api/scrape -H "x-vibexnews-admin-secret: UmairSaad18+" -H "Content-Type: application/json" -d '{\"perSourceLimit\": 2}'
```
2. Trigger AI analysis endpoint:
```powershell
curl -X POST http://localhost:3000/api/analyze -H "x-vibexnews-admin-secret: UmairSaad18+"
```
3. Open `http://localhost:3000` in the browser or check Supabase to view the newly updated news cards on the UI.
