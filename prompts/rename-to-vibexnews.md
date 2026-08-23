# vibeXnews Project Renaming and Branding Update

## Goal

Update the project name from "SKEW" / "skew news" to **"vibeXnews"** across all important project specification, configuration, metadata, and documentation files, establishing consistent branding, headers, environment variable naming, and product descriptions.

## Skills read

No external third-party integration skill is required for this configuration and documentation update. Inspected `AGENTS.md` and App Router conventions in Next.js documentation.

## Existing code inspected

- `AGENTS.md` — contains references to SKEW as the product name, `x-SKEW-admin-secret` request header, and `SKEW_ADMIN_SECRET` environment variable.
- `package.json` — currently named `"build-own-agent"`.
- `app/layout.tsx` — currently has placeholder metadata (`"Create Next App"`).
- `README.md` — default starter Next.js README.
- `prompts/skew-design-system.md` — earlier design system prompt referencing SKEW.

## Decisions and assumptions

- The official product name is **vibeXnews** (exact capitalization: "vibeXnews").
- Admin request header and environment variable naming in `AGENTS.md` should align with the new name:
  - Header: `x-vibexnews-admin-secret` (replacing `x-SKEW-admin-secret`).
  - Environment variable: `VIBEXNEWS_ADMIN_SECRET` (replacing `SKEW_ADMIN_SECRET`).
- `package.json` name should be updated to `"vibexnews"`.
- `app/layout.tsx` metadata should feature `vibeXnews` with an accurate description for the AI news analysis platform.
- `README.md` should be updated to describe the vibeXnews platform and setup instructions.
- `prompts/skew-design-system.md` will be updated / synced to reflect vibeXnews branding.

## Files likely to change

- `AGENTS.md`
- `package.json`
- `app/layout.tsx`
- `README.md`
- `prompts/skew-design-system.md`

## Implementation requirements

1. **Update `AGENTS.md`**:
   - Change product name from "SKEW" to "**vibeXnews**".
   - Update Section 1 ("Product") description to reflect vibeXnews.
   - Update Section 15 ("Admin secret rule"), Section 16, Section 17, Section 18, Section 19, and Section 21 environment variables table:
     - Change `x-SKEW-admin-secret` to `x-vibexnews-admin-secret`.
     - Change `SKEW_ADMIN_SECRET` to `VIBEXNEWS_ADMIN_SECRET`.
2. **Update `package.json`**:
   - Set `"name": "vibexnews"`.
3. **Update `app/layout.tsx`**:
   - Set `metadata.title` to `"vibeXnews - AI-Powered News Analysis & Framing"`.
   - Set `metadata.description` to `"vibeXnews collects real news articles, analyzes them with AI, and displays sentiment and framing insights."`.
4. **Update `README.md`**:
   - Change title to `# vibeXnews`.
   - Add overview describing vibeXnews as an AI-powered news analysis platform.
5. **Update `prompts/skew-design-system.md`**:
   - Replace references of SKEW with vibeXnews branding.

## Security requirements

- Maintain all existing security rules from `AGENTS.md`: `VIBEXNEWS_ADMIN_SECRET` is server-only and required on action/mutation endpoints; secrets must never be exposed to the client bundle or query strings.

## Acceptance criteria

- All occurrences of SKEW / skew news across core project files are updated to vibeXnews.
- Admin header and env variable conventions are updated consistently to `x-vibexnews-admin-secret` and `VIBEXNEWS_ADMIN_SECRET`.
- Next.js document metadata reflects vibeXnews.
- TypeScript checks and linter pass without errors.

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`

## Manual test steps

1. Inspect `AGENTS.md`, `package.json`, `app/layout.tsx`, and `README.md` to verify all project name references are `vibeXnews`.
2. Run `npm run dev` and open `http://localhost:3000` to verify page title in the browser tab is `vibeXnews - AI-Powered News Analysis & Framing`.
