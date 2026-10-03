# Fix Gemini Models Prompt

## Goal

Fix the `[analysis] model attempt failed` error by updating `ANALYSIS_MODEL` and `EMBEDDING_MODEL` in `lib/analysis/analyze-article.ts` from invalid/non-existent model names (`gemini-3.6-flash` and `gemini-embedding-001`) to valid Google Gemini model IDs (`gemini-1.5-flash` and `text-embedding-004`).

## Skills read

- `AGENTS.md`
- `.agents/skills/ai-sdk/SKILL.md`

## Existing code inspected

- `lib/analysis/analyze-article.ts`: currently uses `ANALYSIS_MODEL = "gemini-3.6-flash"` and `EMBEDDING_MODEL = "gemini-embedding-001"`.

## Decisions or assumptions

- Google API rejects `gemini-3.6-flash` and `gemini-embedding-001` with 404/400 errors.
- Switching to `gemini-1.5-flash` for analysis and `text-embedding-004` for embeddings ensures successful API calls with structured output and vector generation.

## Files likely to change

- `lib/analysis/analyze-article.ts`

## Implementation requirements

1. Update `ANALYSIS_MODEL` to `"gemini-1.5-flash"` in `lib/analysis/analyze-article.ts`.
2. Update `EMBEDDING_MODEL` to `"text-embedding-004"` in `lib/analysis/analyze-article.ts`.
3. Verify that `POST /api/analyze` successfully runs and analyzes pending articles without model attempt failures.

## Security requirements

- Keep `GEMINI_API_KEY` strictly server-side.

## Acceptance criteria

- `analyzeArticle()` successfully generates structured analysis and text embeddings using `gemini-1.5-flash` and `text-embedding-004`.
- Running `POST /api/analyze` processes pending articles and sets `analyzed_at` successfully.

## Checks to run

1. `npm run typecheck`
2. `npm run lint`

## Exact manual test steps expected after implementation

1. Ensure `GEMINI_API_KEY` is set in `.env.local`.
2. Trigger analysis via curl:
```powershell
curl -X POST http://localhost:3000/api/analyze -H "x-vibexnews-admin-secret: <your-admin-secret>"
```
3. Verify response returns `status: "completed"` with `analyzed > 0` and `failed: 0`.
