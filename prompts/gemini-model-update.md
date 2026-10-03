# Gemini Model Update & AI Analysis Fix

## Goal

Fix the AI article analysis pipeline failure (`analysis_failed: 5`) when using Google Gemini by updating the model name in `lib/analysis/analyze-article.ts` from the deprecated `gemini-flash-latest` alias to `gemini-3.6-flash`.

## Skills and documentation read

- `AGENTS.md`
- `.agents/skills/ai-sdk/SKILL.md`
- `.agents/skills/supabase/SKILL.md`
- Gemini API model availability listing via `https://generativelanguage.googleapis.com/v1beta/models`

## Existing code inspected

- `lib/analysis/analyze-article.ts`: contains hardcoded `ANALYSIS_MODEL = "gemini-flash-latest"` which Google API rejects as no longer available.
- `lib/analysis/pipeline.ts`: handles batch processing and error logging for analysis runs.
- `app/api/analyze/route.ts`: action route for triggering AI analysis.
- `.env.local`: contains `GEMINI_API_KEY`.

## Decisions or assumptions

- The Gemini API returns HTTP 404/400 for `gemini-flash-latest` because Google retired that alias for content generation.
- Model `gemini-3.6-flash` is active, verified, and succeeds with structured output generation for the provided `GEMINI_API_KEY`.
- We will update `ANALYSIS_MODEL` in `lib/analysis/analyze-article.ts` to `gemini-3.6-flash` and ensure proper error handling and model string reporting.

## Files likely to change

- `lib/analysis/analyze-article.ts`

## Implementation requirements

1. Update `ANALYSIS_MODEL` in `lib/analysis/analyze-article.ts` to `"gemini-3.6-flash"`.
2. Ensure `analyzeArticle` cleanly handles AI structured generation and embedding using `GEMINI_API_KEY`.
3. Verify that `lib/analysis/pipeline.ts` and `app/api/analyze/route.ts` execute analysis batches without failing.

## Security requirements

- Keep `GEMINI_API_KEY` strictly server-side in `.env.local`. Never expose API keys or internal prompt text to the client.
- Secure action endpoints with `x-vibexnews-admin-secret` header matching `VIBEXNEWS_ADMIN_SECRET`.

## Acceptance criteria

- `analyzeArticle()` successfully generates structured article analysis and embeddings using `gemini-3.6-flash`.
- Running `POST /api/analyze` processes pending unanalyzed articles without `analysis_failed` errors.
- `article_analyses` rows and `articles.analyzed_at` are properly populated in Supabase.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`

## Exact manual test steps expected after implementation

1. Ensure `GEMINI_API_KEY` and `VIBEXNEWS_ADMIN_SECRET` are set in `.env.local`.
2. Trigger the analysis pipeline via curl:
```powershell
curl -X POST http://localhost:3000/api/analyze -H "x-vibexnews-admin-secret: UmairSaad18+"
```
3. Verify that the response returns `status: "completed"` with `analyzed > 0` and `failed: 0`.
