# Oxylabs manual scraping pipeline

## Goal

Implement the server-only, manual Oxylabs scrape-to-insert pipeline for vibeXnews. It will expose `POST /api/scrape`, load selected active sources from Supabase, fetch only each source's stored homepage through Oxylabs, extract and validate article links, scrape valid article pages, and append valid articles to Supabase.

This scope intentionally excludes Oxylabs Scheduler, Vercel Cron, and AI analysis; those are separate deliverables under the project architecture.

## Skills and documentation read

- `AGENTS.md`
- `.agents/skills/supabase/SKILL.md`
- Current official Oxylabs Scheduler documentation was consulted as a fallback because `.agents/skills/oxylabs-web-scraper/SKILL.md` is absent from this checkout.
- Current Supabase JavaScript select documentation.
- Relevant Next.js route-handler documentation will be read again immediately before implementation.

## Existing code inspected

- `lib/supabase/server.ts`: existing service-role client factory.
- `lib/supabase/types.ts`: typed `sources`, `articles`, and `logs` tables.
- `lib/supabase/queries/sources.ts`: existing public active-source query.
- `supabase/schema.sql`: append-only articles, logs table, and service-role-only pipeline tables.
- `.env.example` and `package.json`.

The active Supabase sources are: BBC News, Fox News, NPR, Reuters, and The Guardian.

## Decisions and assumptions

- Default runtime selection is all active sources and a maximum of five accepted articles per source. The JSON request body may narrow this using source IDs and a validated per-source limit.
- Source listing URLs remain database-owned; no source or sub-endpoint URLs will be hardcoded.
- `parser_strategy` will support source-specific URL/selector behavior where necessary; generic extraction remains conservative.
- `cheerio` will be added as the HTML parser dependency if it is not already installed.
- The action route accepts only a server-side `x-vibexnews-admin-secret` header matched with `VIBEXNEWS_ADMIN_SECRET`. No secret reaches client code or logs.

## Files likely to change

- `app/api/scrape/route.ts`
- `lib/scraping/oxylabs.ts`
- `lib/scraping/parsers.ts`
- `lib/scraping/pipeline.ts`
- `lib/supabase/queries/scraping.ts`
- `.env.example`
- `package.json` and `package-lock.json`

## Implementation requirements

1. Add small typed, server-only modules that separate Oxylabs requests, homepage/detail parsing, Supabase access, and pipeline orchestration; keep the route handler thin.
2. Fetch homepages and accepted article detail pages through Oxylabs Universal Scraper, using Basic authentication from `OXY_WSA_USERNAME` and `OXY_WSA_PASSWORD`; handle non-2xx and malformed response bodies safely.
3. Load only active selected sources. Reject an unknown or inactive requested source rather than silently scraping it.
4. Extract only visible homepage story-card links. Normalize URL fragments/tracking parameters, keep same-origin links, apply source-specific article URL checks, and reject every non-article category named in `AGENTS.md` before detail scraping.
5. Deduplicate candidates locally and against both `original_url` and `canonical_url` in chunks of at most 15 URLs per Supabase `.in()` filter.
6. Parse detail pages using structured metadata plus article DOM blocks. Require article


-specific URL/title, meaningful cleaned text, image URL, and published date. Accept body text only with three meaningful paragraphs or at least 900 cleaned characters; reject generic/listing/product/live/etc. pages.
7. Remove scripts, styles, ads, navigation, newsletters, related-content blocks, social/share text, CSS/error dumps, and repeated boilerplate before saving `raw_text`.
8. Insert accepted rows append-only, preserving original and canonical URLs. Do not delete, update, reset, or seed articles in the pipeline.
9. Emit clear server console progress plus a final typed summary: status, sources checked, candidates found/rejected, duplicates skipped, detail pages scraped, articles inserted/rejected/failed, duration, and rejection counts. Write start/completed/failed summaries to `logs` without secrets or article body content.
10. Return the final summary from `POST /api/scrape`. Validate JSON input and return clear 400/401/500 responses.

## Security requirements

- Keep Oxylabs credentials, Supabase service role key, and admin secret in server-only modules.
- Require a constant-time-safe comparison for the configured admin secret where practical; fail closed when it is absent.
- Never return credentials, raw upstream headers, or full article text in API errors/logs.
- Ensure all external URLs originate from an active source homepage or validated same-origin candidate URL, and cap work per source to avoid accidental over-scraping.

## Acceptance criteria

- A valid authorized `POST /api/scrape` inserts only valid, previously unseen, article detail pages.
- Missing/invalid admin secret returns 401; GET returns 405 or is unsupported.
- The default run considers all five active sources and accepts at most five valid articles per source.
- Runs do not scrape stored sub-endpoints, listing/category pages, or duplicate article URLs.
- Failure of one source is recorded and does not prevent other selected sources from completing.
- The returned and logged summaries make every skip/rejection category observable.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`

## Manual test steps after implementation

1. Add `OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`, and a strong `VIBEXNEWS_ADMIN_SECRET` to `.env.local`; do not add them with a `NEXT_PUBLIC_` prefix.
2. Start the app with `npm run dev` and watch that terminal for pipeline progress logs.
3. In PowerShell, set a transient shell variable: `$adminSecret = '<your VIBEXNEWS_ADMIN_SECRET>'`.
4. Run the default all-active-source scrape:

```powershell
curl.exe -X POST http://localhost:3000/api/scrape `
  -H "x-vibexnews-admin-secret: $adminSecret" `
  -H "Content-Type: application/json" `
  -d "{}"
```

5. Run a deliberately limited selected-source scrape after obtaining source IDs from Supabase:

```powershell
curl.exe -X POST http://localhost:3000/api/scrape `
  -H "x-vibexnews-admin-secret: $adminSecret" `
  -H "Content-Type: application/json" `
  -d '{"sourceIds":["<source-uuid>"],"perSourceLimit":2}'
```

6. Confirm a bad secret returns 401:

```powershell
curl.exe -i -X POST http://localhost:3000/api/scrape `
  -H "x-vibexnews-admin-secret: wrong" `
  -H "Content-Type: application/json" `
  -d "{}"
```

7. Repeat the successful request and confirm duplicate counts rise while no duplicate article rows are inserted.
