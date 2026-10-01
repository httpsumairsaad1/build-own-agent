# Source article images

## Goal
Display the real source image stored in `articles.image_url` wherever an analyzed news article is presented, replacing the current generated editorial placeholder when a valid stored URL is available.

## Skills read
- `.agents/skills/supabase/SKILL.md`
- Next.js Image Component documentation at `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`

## Existing code inspected
- `lib/supabase/queries/articles.ts` already selects `articles.*`, including `image_url`, but its UI mapper drops that value.
- `lib/data/mock-articles.ts` defines the shared `Article` UI type but has no source-image field.
- `components/ArticleCard.tsx`, `app/page.tsx`, and `app/article/[id]/page.tsx` render `ArticleThumbnail`, a generated placeholder.
- `next.config.ts` currently permits external HTTP/HTTPS image hosts.

## Decisions and assumptions
- `articles.image_url` is the persisted source of truth and is only rendered after it has passed the existing scrape validation.
- Use `next/image` with `fill`, responsive `sizes`, `object-cover`, and meaningful title-based alternative text.
- Keep `ArticleThumbnail` as a visual fallback for legacy/mock records or an absent/invalid URL; do not add any browser-side scraping or image proxying.
- The homepage featured article, article cards (including category and related cards), and article detail hero should all use the stored image consistently.

## Files likely to change
- `lib/data/mock-articles.ts`
- `lib/supabase/queries/articles.ts`
- `components/ArticleCard.tsx`
- `app/page.tsx`
- `app/article/[id]/page.tsx`
- optionally a small reusable image component under `components/`

## Implementation requirements
1. Add an optional `imageUrl` field to the shared UI `Article` type.
2. Map `row.image_url` to `imageUrl` in `mapSupabaseToArticle`.
3. Create or update a reusable presentation component that:
   - uses `next/image` when `imageUrl` is present;
   - places `Image fill` inside a relative, overflow-hidden container;
   - uses `object-cover`, appropriate `sizes`, and title-based `alt` text;
   - preserves current rounded corners, aspect ratios, hover scaling, dark border, and responsive layout;
   - shows the existing generated thumbnail fallback when no usable URL exists.
4. Replace every news-card, featured-card, and details-page generated thumbnail with this source-aware presentation.
5. Preserve all existing Supabase query, analysis, navigation, bookmarking, and mock-data behavior.
6. Do not alter the scraping pipeline, database schema, environment variables, or remote-host configuration unless a concrete image host error requires a narrowly scoped change.

## Security requirements
- Keep service-role credentials and all pipeline secrets server-only.
- Do not expose or fetch third-party content beyond the already stored public image URL.
- Rely on Next.js image remote pattern allowlisting; do not introduce an unrestricted custom loader.

## Visual interpretation
- Source photography is the visual priority: crop consistently with `object-cover` without changing card height.
- Feed cards retain the 16:9-like compact thumbnail area; the featured and detail areas retain their current larger responsive slots.
- If no image is available, the existing dark themed visual remains so cards never collapse or shift.

## Acceptance criteria
- A Supabase article with `image_url` shows the source image in the home featured panel, standard cards, category pages, related cards, and article detail page.
- An article without a usable image URL renders the current generated fallback without layout shift or runtime error.
- Images have accessible title-derived alternative text and retain responsive sizing.
- No secrets or database writes are added to browser code.

## Checks to run
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Manual test steps
1. Confirm one analyzed article in Supabase has a public `articles.image_url`.
2. Run `npm run dev`.
3. Open the home page and verify its featured article and feed cards use their source images.
4. Open a category page and an article detail page; verify source images appear there too.
5. Temporarily inspect an article record with an empty/missing image URL or use an existing mock article; confirm the placeholder remains visible and the page layout is stable.