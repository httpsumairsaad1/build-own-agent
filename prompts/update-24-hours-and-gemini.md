# 24-Hour Update Schedule and Gemini API Analysis Prompt

## Goal

Configure the scraping and analysis pipeline to update every 24 hours (once per day) instead of hourly, ensuring that new scraped articles are analyzed using the Gemini API key (`GEMINI_API_KEY`) so they appear correctly on the UI.

## Skills read

- `AGENTS.md`
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/ai-sdk/SKILL.md`

## Existing code inspected

- `vercel.json`: currently sets cron schedule to hourly (`"15 * * * *"`).
- `lib/scraping/scheduler.ts`: currently sets Oxylabs schedule cron to hourly (`"0 * * * *"`).
- `lib/analysis/analyze-article.ts`: uses `GEMINI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` for AI analysis and embedding generation.
- `lib/supabase/queries/articles.ts`: filters articles to require `analyzed_at` is not null and `article_analyses` exists.

## Decisions or assumptions

- Updating every 24 hours means both Vercel Cron in `vercel.json` and Oxylabs Scheduler in `lib/scraping/scheduler.ts` should be changed to run daily (`"0 0 * * *"`).
- Gemini API key (`GEMINI_API_KEY`) will be used to analyze pending articles so that new articles get their `analyzed_at` set and show up on the UI.

## Files likely to change

- `vercel.json`
- `lib/scraping/scheduler.ts`

## Implementation requirements

1. Update `vercel.json` cron schedule to `"0 0 * * *"` (every 24 hours / daily).
2. Update `lib/scraping/scheduler.ts` Oxylabs schedule cron to `"0 0 * * *"` (every 24 hours / daily).
3. Verify `lib/analysis/analyze-article.ts` correctly reads `GEMINI_API_KEY`.

## Security requirements

- Keep `GEMINI_API_KEY` strictly server-side.
- Protect cron route with `CRON_SECRET`.

## Acceptance criteria

- `vercel.json` schedules pipeline execution every 24 hours.
- Oxylabs Scheduler creates/updates schedules with daily frequency (`"0 0 * * *"`).
- New articles are successfully scraped and analyzed via Gemini API (`GEMINI_API_KEY`) and displayed on the UI.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`

## Exact manual test steps expected after implementation

1. Ensure `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env.local`.
2. Sync schedules: `POST /api/oxylabs/schedules`
3. Trigger pipeline / analysis manually or via cron to verify articles are fetched, analyzed via Gemini API, and shown on the UI.
