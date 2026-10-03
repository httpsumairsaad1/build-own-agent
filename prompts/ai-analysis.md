# AI article analysis pipeline

## Goal

Implement a server-only AI analysis pipeline for vibeXnews. `POST /api/analyze` will find valid articles that lack an `article_analyses` row, generate a neutral summary and AI-estimated sentiment/framing analysis with OpenAI through Vercel AI SDK, validate the result, store it in Supabase, and set `articles.analyzed_at` only after the analysis row has been successfully saved.

This scope excludes embeddings, pgvector related-article search, scheduler processing, and UI changes. Embeddings are a later project stage.


out of scope (do not bild here)
* §20 pgvector / embeddings — explicitly "after AI analysis is working". No `embedding` column, no `text-embedding-3-small`, no Related Articles.
* §18 Oxylabs Scheduler and `/api/cron/pipeline`. The cron route will later call this same analysis layer, so the core logic must be reusable, but building the cron/scheduler is separate work.

## Skills and documentation read

- `AGENTS.md`
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/ai-sdk/SKILL.md`
- Current Next.js 16 route-handler documentation.
- Current AI SDK structured-output and OpenAI provider documentation.

## Existing code inspected

- `app/api/scrape/route.ts`: established action-route auth and request-validation pattern.
- `lib/scraping/pipeline.ts`: existing server-only pipeline and structured run summary pattern.
- `lib/supabase/server.ts`: service-role server client.
- `lib/supabase/types.ts` and `supabase/schema.sql`: existing `articles`, `article_analyses`, and `logs` shape.
- `.env.example` and `package.json`.

Supabase currently contains seven article rows available for the pipeline to inspect.

## Decisions and assumptions

- `POST /api/analyze` is protected with `x-vibexnews-admin-secret` and `VIBEXNEWS_ADMIN_SECRET`, matching the manual scrape action route.
- Default behavior processes all pending eligible articles in configurable batches. `ANALYSIS_BATCH_SIZE` defaults to `5` when missing/invalid.
- The request body may narrow processing with `articleIds` and/or `limit`; these are validated. It does not hardcode source, scrape, or one-time batches.
- Pending detection is based on the real presence of an `article_analyses` row, not `articles.analyzed_at` alone. The implementation will select articles with their analyses and filter missing analysis rows in JavaScript, avoiding the joined-table filter gotcha.
- Install direct runtime dependencies `ai`, `@ai-sdk/openai`, and `zod`; use the installed package documentation/version to confirm the exact structured-output API and current OpenAI structured-output-capable model before coding.
- The AI prompt treats political framing as an estimate based only on the article text, never on source identity.

## Files likely to change

- `app/api/analyze/route.ts`
- `lib/analysis/schema.ts`
- `lib/analysis/analyze-article.ts`
- `lib/analysis/pipeline.ts`
- `lib/supabase/queries/analysis.ts`
- `package.json` and `package-lock.json`
- `.env.example` only if an additional server-only analysis setting is genuinely required.

## Implementation requirements

1. Keep the route handler thin: authorize the request, validate JSON input, call the server-only pipeline, and return its final summary.
2. Fetch candidate articles using a joined `articles`/`article_analyses` query, then detect pending rows in JavaScript where no analysis row exists. Do not use `analyzed_at IS NULL` as the pending condition.
3. Process in batches and continue until no pending matching articles remain for an unrestricted run. Respect a validated `limit` and selected `articleIds` when supplied.
4. Require an article to have meaningful `raw_text` before calling the model; skip otherwise and report the reason.
5. Use Vercel AI SDK and the OpenAI provider from server-only code. Never expose `OPENAI_API_KEY`, prompt text, or model calls to the browser.
6. Generate validated structured output containing: `summary`, numeric `sentimentScore` and `sentimentLabel`, `politicalFramingLabel`, integer `leftPercentage`, `centerPercentage`, and `rightPercentage`, numeric `confidence`, `framingNotes`, `loadedTerms`, and `disclaimer`.
7. Use Zod to enforce: sentiment from `positive|neutral|negative`; framing label from `left|center|right|mixed|unclear`; scores/confidence in their documented ranges; percentages 0–100 and totaling exactly 100. Compute `bias_score` in code as `(rightPercentage - leftPercentage) / 100`; do not trust a model-provided bias score.
8. Prompt for a neutral summary and an AI-estimated framing assessment from article text evidence only. Require `unclear` and low confidence when evidence is weak. Include an explicit user-facing disclaimer in stored output.
9. Retry an invalid/failed model result once. On a second failure, record a failure count/reason but do not save partial or invalid analysis data.
10. Insert exactly one valid `article_analyses` row per article, then update `articles.analyzed_at`. Do not set `analyzed_at` before the analysis insert succeeds.
11. Write started/completed/failed summaries to `logs`, and emit concise console progress per batch: pending, analyzed, skipped, failed, plus final totals. Do not log secrets or complete article text.
12. Return a typed summary containing status, articles considered, analyzed, skipped, failed, batch count, duration, and grouped reasons.

## Security requirements

- Require a valid admin secret; return `401` for missing/invalid values.
- Keep the OpenAI key and service-role client in server-only modules only.
- Do not send source names as framing evidence or expose article text/model failures through API errors.
- Validate all externally generated model output before database writes.
- Use parameterized Supabase queries through the client; no browser-initiated analysis or database mutations.

## Acceptance criteria

- An authorized default request analyzes every valid pending article, not merely a fixed or latest subset.
- `article_analyses` contains a validated row with all required fields for each success.
- `analyzed_at` is set only after that row is saved.
- An existing `analyzed_at` value with no analysis row remains eligible for analysis.
- Invalid model output is retried once and never persisted when invalid.
- API responses and server logs provide accurate batch and final totals.
- Missing/invalid secret returns `401`; malformed input returns `400`.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`

## Manual test steps after implementation

1. Add a valid server-only `GEMINI_API_KEY` and `VIBEXNEWS_ADMIN_SECRET` to `.env.local`, then restart the dev server:

```powershell
npm run dev
```

2. In another PowerShell terminal, set a transient variable (do not commit it):

```powershell
$adminSecret = '<your VIBEXNEWS_ADMIN_SECRET>'
```

3. Confirm missing authorization returns `401`:

```powershell
curl.exe -i -X POST "http://localhost:3000/api/analyze" -H "Content-Type: application/json" --data-raw "{}"
```

4. Run the default full pending-analysis pass:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/analyze" -Headers @{ "x-vibexnews-admin-secret" = $adminSecret } -ContentType "application/json" -Body "{}"
```

5. Test one selected article after copying an ID from Supabase:

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/analyze" -Headers @{ "x-vibexnews-admin-secret" = $adminSecret } -ContentType "application/json" -Body '{"articleIds":["<article-uuid>"],"limit":1}'
```

6. Repeat the default request and verify it returns zero analyzed pending articles. Watch the `npm run dev` terminal for batch progress and final summary logs.
