# Implementation Prompt: Oxylabs Scheduler with Vercel Cron Pipeline

## Goal
Implement the Oxylabs Scheduler integration with Vercel Cron for automated hourly news scraping and AI analysis in **vibeXnews**, strictly adhering to `AGENTS.md` (Sections 9, 14, 15, 17, 18, 19, 21), `.agents/skills/web-scraper-api/SKILL.md`, and `.agents/skills/supabase/SKILL.md`.

---

## Skills Read
- `.agents/skills/web-scraper-api/SKILL.md`
- `.agents/skills/supabase/SKILL.md`
- Live Oxylabs Scheduler API Documentation: `https://developers.oxylabs.io/products/web-scraper-api/features/scheduler.md`
- Live Oxylabs Push-Pull Query Results Documentation: `https://developers.oxylabs.io/products/web-scraper-api/integration-methods/push-pull.md`
- `AGENTS.md` (specifically sections 9, 10, 11, 12, 13, 14, 15, 17, 18)

---

## Existing Code Inspected
- `lib/scraping/scheduler.ts`: Existing prototype for scheduler sync and processing
- `lib/scraping/pipeline.ts`: Canonical manual scrape-to-insert pipeline and validation logic
- `lib/scraping/oxylabs.ts`: Oxylabs credentials and Realtime API query helper
- `lib/scraping/parsers.ts`: Homepage candidate extraction and article detail validation/cleaning
- `lib/analysis/pipeline.ts`: AI analysis pipeline (`runAnalysis`) for pending articles
- `lib/supabase/queries/scraping.ts`: Active source fetching, URL dedupe batching, run logging
- `app/api/oxylabs/schedules/route.ts`: Sync (`POST`) and list (`GET`) schedules API route
- `app/api/oxylabs/scheduled-results/process/route.ts`: Manual trigger (`POST`) for processing scheduled results
- `app/api/cron/pipeline/route.ts`: Automated Vercel Cron trigger (`GET`) chaining scraping and AI analysis
- `vercel.json`: Vercel Cron configuration scheduled at `:15` past every hour
- `supabase/schema.sql`: Definitions for `sources`, `articles`, `oxylabs_schedules`, `oxylabs_schedule_runs`, and `logs`

---

## Decisions & Assumptions

1. **Oxylabs Scheduler API Conformance**:
   - `POST https://data.oxylabs.io/v1/schedules` requires:
     - `cron`: `"0 * * * *"` (hourly at top of hour)
     - `items`: `[{ source: "universal", url: source.listing_url }]`
     - `end_time`: `"2035-01-01 00:00:00"` (required inclusive end time)
   - Response contains `schedule_id` (a 64-bit integer) and `active: true`.

2. **Critical 64-Bit Integer Precision**:
   - Oxylabs `schedule_id`, run `id`, and job `id` exceed `Number.MAX_SAFE_INTEGER`.
   - Before passing any response text to `JSON.parse`, quote all 15+ digit integer IDs using regex (or parse IDs directly from raw text) to prevent silent truncation.
   - Example transform: `rawText.replace(/"(id|schedule_id|run_id|job_id)":\s*(\d{15,})/g, '"$1": "$2"')`.

3. **Job Result Retrieval via Push-Pull Endpoint**:
   - `GET /v1/schedules/{id}/runs` provides run jobs and their execution metadata (`id`, `result_status`).
   - `GET /schedules/{id}/jobs` must NOT be used because it lacks status.
   - For jobs where `result_status === "done"`, the scraped HTML content is fetched via:
     `GET https://data.oxylabs.io/v1/queries/{job_id}/results?type=raw` using Oxylabs Basic Auth.
   - The returned `results[0].content` contains the homepage HTML for processing.

4. **Orphan Schedule Deactivation**:
   - In `syncSchedules()`, query `GET https://data.oxylabs.io/v1/schedules` to retrieve all remote schedule IDs.
   - Compare remote IDs against `oxylabs_schedules` records in Supabase.
   - Deactivate any remote schedule not associated with an active source using `PUT https://data.oxylabs.io/v1/schedules/{id}/state` with body `{"active": false}`.

5. **Shared Pipeline & DB Ingestion**:
   - Reuse candidate extraction (`extractHomepageCandidates`), URL candidate filtering, and URL existence check (`findExistingUrls` in batches of <= 15).
   - Detail pages scraped via `fetchHtmlThroughOxylabs` and validated via `parseArticleDetail` (must have body content, published date, image URL, and article-specific title).
   - Insert valid articles append-only into `articles`.
   - Record run status into `oxylabs_schedule_runs` (`schedule_id`, `oxylabs_run_id`, `status`, `articles_found`, `articles_inserted`).
   - Log execution into `logs` (`run_type: "scheduler_process"`).

6. **Automatic Hourly Pipeline (`/api/cron/pipeline`)**:
   - Configured in `vercel.json` at `"15 * * * *"` (15 minutes after Oxylabs runs).
   - Method: `GET` (required by Vercel Cron).
   - Protected by `CRON_SECRET` (`Authorization: Bearer <CRON_SECRET>` or `x-vercel-cron: 1`), bypassed in development (`NODE_ENV === "development"` or `!process.env.CRON_SECRET`).
   - Chains Step 1 (`processScheduledResults`) then Step 2 (`runAnalysis({ limit: 50 })`).
   - If Step 1 fails, Step 2 still executes to catch any previously pending unanalyzed articles.
   - Logs overall execution to `logs` (`run_type: "cron_pipeline"`).

7. **Admin Authorization**:
   - `POST /api/oxylabs/schedules` and `POST /api/oxylabs/scheduled-results/process` require header `x-vibexnews-admin-secret` verified with timing-safe comparison against `VIBEXNEWS_ADMIN_SECRET`.
   - Read routes `GET /api/oxylabs/schedules` return status and rows.

---

## Files Likely to Change
1. `lib/scraping/scheduler.ts` — Update sync logic, payload format, 64-bit ID parsing, Push-Pull query result retrieval, and `oxylabs_schedule_runs` recording.
2. `app/api/oxylabs/schedules/route.ts` — Ensure clean error handling, secret verification, and status reporting.
3. `app/api/oxylabs/scheduled-results/process/route.ts` — Ensure strict admin secret verification and error handling.
4. `app/api/cron/pipeline/route.ts` — Ensure secret verification, sequenced pipeline execution (scrape then analyze), and structured run summary response.
5. `vercel.json` — Validate cron configuration for `/api/cron/pipeline` at `"15 * * * *"`.

---

## Implementation Requirements
1. **Oxylabs Scheduler Sync (`syncSchedules`)**:
   - Load active sources from `sources` table.
   - For any active source missing an active schedule, post to `https://data.oxylabs.io/v1/schedules` with `{ "cron": "0 * * * *", "items": [{ "source": "universal", "url": source.listing_url }], "end_time": "2035-01-01 00:00:00" }`.
   - Extract `schedule_id` preserving 64-bit integer precision.
   - Save schedule mapping into `oxylabs_schedules` table.
   - Query remote schedules and deactivate orphaned schedules via `PUT /v1/schedules/{id}/state` with `{"active": false}`.
2. **Process Scheduled Results (`processScheduledResults`)**:
   - Fetch active schedules from Supabase.
   - For each schedule, call `GET /v1/schedules/{id}/runs` and preserve 64-bit IDs.
   - For jobs with `result_status === "done"`, fetch raw HTML from `GET /v1/queries/{job_id}/results?type=raw`.
   - Run candidate extraction, deduplication, detail scraping, validation, and database insertion.
   - Insert execution records into `oxylabs_schedule_runs` and log to `logs` (`run_type: "scheduler_process"`).
   - Return canonical `ScrapeSummary`.
3. **Cron Pipeline (`/api/cron/pipeline`)**:
   - Verify `CRON_SECRET` (bypassed in dev mode).
   - Execute `processScheduledResults()`.
   - Execute `runAnalysis()`.
   - Record run to `logs` (`run_type: "cron_pipeline"`).
   - Return `{ status: "completed", timestamp, scrapeSummary, analysisSummary }`.

---

## Security Requirements
- All mutating endpoints (`POST /api/oxylabs/schedules`, `POST /api/oxylabs/scheduled-results/process`) require `x-vibexnews-admin-secret`.
- Reject missing/invalid admin secret with HTTP `401`.
- Cron route (`GET /api/cron/pipeline`) requires `CRON_SECRET` via Bearer token in production; reject unauthorized requests with HTTP `401`.
- Oxylabs credentials (`OXY_WSA_USERNAME`, `OXY_WSA_PASSWORD`) and Supabase Service Role Key must remain server-side only.

---

## Acceptance Criteria
- Oxylabs schedule creation payload matches live Oxylabs documentation specifications (`cron`, `items`, `end_time`).
- 64-bit integer IDs (`schedule_id`, `run_id`, `job_id`) are preserved as strings without numerical corruption.
- HTML content from scheduled jobs is correctly retrieved from `/v1/queries/{job_id}/results?type=raw`.
- Orphaned schedules on Oxylabs are deactivated (`active: false`).
- Pipeline chains scraping and AI analysis sequentially and writes audit logs.
- `npm run typecheck` passes with 0 errors.
- `npm run lint` passes with 0 errors.

---

## Checks to Run
1. `npm run typecheck`
2. `npm run lint`

---

## Exact Manual Test Steps Expected After Implementation

1. **Verify Oxylabs Schedules Sync**:
   ```bash
   curl -X POST http://localhost:3000/api/oxylabs/schedules \
     -H "x-vibexnews-admin-secret: your_admin_secret_here"
   ```
   *Expected response:* JSON with `{ "status": "completed", "created": N, "deactivated": M, "total": T }`.

2. **Verify Stored Schedules Listing**:
   ```bash
   curl http://localhost:3000/api/oxylabs/schedules
   ```
   *Expected response:* JSON with `{ "schedules": [...] }` displaying active source schedules.

3. **Verify Manual Processing of Scheduled Results**:
   ```bash
   curl -X POST http://localhost:3000/api/oxylabs/scheduled-results/process \
     -H "x-vibexnews-admin-secret: your_admin_secret_here"
   ```
   *Expected response:* JSON with canonical `ScrapeSummary` and live progress logs in the dev server terminal.

4. **Verify Automated Cron Pipeline (Scrape + AI Analysis)**:
   ```bash
   curl http://localhost:3000/api/cron/pipeline
   ```
   *Expected response:* JSON with `{ "status": "completed", "scrapeSummary": {...}, "analysisSummary": {...} }`.
