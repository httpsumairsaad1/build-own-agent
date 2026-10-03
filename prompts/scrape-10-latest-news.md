# Scrape 10 Latest News Prompt

## Goal

Update the scraping pipeline and scheduler (`lib/scraping/pipeline.ts` and `lib/scraping/scheduler.ts`) to scrape 10 latest news articles per source (defaulting to 10 instead of 5), ensuring they are analyzed and displayed on the UI while running on the 24-hour update schedule.

## Skills read

- `AGENTS.md`
- `.agents/skills/supabase/SKILL.md`

## Existing code inspected

- `lib/scraping/pipeline.ts`: `DEFAULT_PER_SOURCE_LIMIT = 5`
- `lib/scraping/scheduler.ts`: `DEFAULT_PER_SOURCE_LIMIT = 5`
- `app/api/scrape/route.ts`: validates `perSourceLimit` up to 10 (`<= 10`).

## Decisions or assumptions

- Change `DEFAULT_PER_SOURCE_LIMIT` from `5` to `10` in both `lib/scraping/pipeline.ts` and `lib/scraping/scheduler.ts`.
- Ensure 24-hour schedule (`"0 0 * * *"`) remains active.

## Files likely to change

- `lib/scraping/pipeline.ts`
- `lib/scraping/scheduler.ts`

## Implementation requirements

1. Set `DEFAULT_PER_SOURCE_LIMIT = 10` in `lib/scraping/pipeline.ts`.
2. Set `DEFAULT_PER_SOURCE_LIMIT = 10` in `lib/scraping/scheduler.ts`.
3. Verify that articles are successfully scraped (up to 10 per source), analyzed with Gemini API, and displayed on the UI.

## Security requirements

- Keep credentials server-side only.

## Acceptance criteria

- Manual scraping and 24-hour scheduler scrape up to 10 latest news articles per source.
- Analyzed articles appear correctly on the UI.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`

## Exact manual test steps expected after implementation

1. Ensure `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env.local`.
2. Run manual scrape or scheduler sync.
3. Verify up to 10 articles per source are scraped, analyzed, and displayed on the UI.
