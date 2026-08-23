# Implementation Prompt: Topic Pages, Article Details Page, Sign-In & Card Navigation

## Goal

Implement complete, fully interactive pages for all header navigation destinations in **vibeXnews** (`/politics`, `/tech-vibe`, `/social-change`, `/economy`, `/pop-culture`, `/sign-in`), along with the comprehensive **Article Details Page** (`/article/[id]`) with full AI framing and sentiment analysis, enabling users to click any card or topic to explore in-depth perspectives under the signature Obsidian Dark Theme.

## Skills read

- `AGENTS.md` — Section 19 (AI analysis and UI framing specifications, full details layout, framing notes, loaded terms, disclaimer), Section 20 (related articles), and Section 5 (presentation of stored data, UI must display stored data only).
- `.agents/skills/clerk` — Clerk authentication setup and styling patterns for sign-in flows.
- Next.js App Router routing guides for dynamic routes (`app/article/[id]/page.tsx`), layout structure, and navigation (`next/link`).

## Existing code inspected

- `app/page.tsx` — home page feed, mock articles data with full bias and sentiment properties, icons, and components.
- `app/layout.tsx` — root layout with Inter font and global dark styling.
- `app/globals.css` — design tokens for obsidian surfaces, brand accents, and thick bias meters.

## Decisions and assumptions

- **Modular Components & Shared Data**: Extract shared mock article data and UI components (e.g. Header, Footer, BiasMeter, ArticleCard, SentimentBadge, FramingBadge) into reusable modules under `components/` and `lib/data/` so all pages share unified state, navigation, bookmarks, and search.
- **Dynamic Topic Pages**:
  - Implement `/politics`, `/tech-vibe`, `/social-change`, `/economy`, `/pop-culture` with topic-specific hero banners, filtered perspective feeds, and sort affordances.
- **Full Article Details Page (`/article/[id]`)**:
  - Full article content reading view.
  - Complete AI analysis panel displaying:
    - AI Neutral Summary
    - Thick 3-way Segmented Bias Meter (Left %, Center %, Right %)
    - AI-Estimated Framing Label & Confidence Score
    - Derived Bias Score (`(right - left) / 100`)
    - Sentiment Score & Polarity Indicator (-1.00 to +1.00)
    - Framing Notes & Rhetorical Nuances
    - Detected Loaded Terms
    - AI Estimation Disclaimer & Model Name
  - Related Articles section matching topic and framing.
- **Sign In Page (`/sign-in`)**:
  - Dedicated authentication page with VXN branding, social sign-in buttons (Google, GitHub, Apple), email credentials form, and Clerk sign-in readiness.
- **Theme**:
  - 100% strict Obsidian Dark Theme (`#0A0A0A` background, `#1E1E1E` panels, `#2C2C2C` elevated surfaces, `#E64A19` / `#FF9800` accents, thick bias meters).

## Files likely to change / create

- `lib/data/mock-articles.ts` [NEW] — centralized mock articles dataset with full text, analysis breakdown, loaded terms, and framing notes.
- `components/Header.tsx` [NEW] — reusable header with active route highlighting, search bar, navigation links, and Sign In CTA.
- `components/Footer.tsx` [NEW] — reusable footer with branding and methodology links.
- `components/BiasMeter.tsx` [NEW] — reusable thick 3-way segmented bias meter.
- `components/ArticleCard.tsx` [NEW] — reusable news card with clickable routing to `/article/[id]`.
- `app/page.tsx` [MODIFY] — home page utilizing modular components.
- `app/politics/page.tsx` [NEW] — Politics topic page.
- `app/tech-vibe/page.tsx` [NEW] — Tech-Vibe topic page.
- `app/social-change/page.tsx` [NEW] — Social Change topic page.
- `app/economy/page.tsx` [NEW] — Economy topic page.
- `app/pop-culture/page.tsx` [NEW] — Pop Culture topic page.
- `app/article/[id]/page.tsx` [NEW] — comprehensive Article Details & AI Analysis page.
- `app/sign-in/page.tsx` [NEW] — Sign-in authentication page.

## Implementation requirements

1. **Centralized Data & Types (`lib/data/mock-articles.ts`)**:
   - Provide realistic, rich articles across Politics, Tech-Vibe, Social Change, Economy, and Pop Culture.
   - Include complete analysis details: `summary`, `sentiment`, `bias` (left, center, right), `biasLabel`, `derivedBiasScore`, `confidence`, `framingNotes`, `loadedTerms`, `fullText`, `model`.
2. **Reusable Navigation Header (`components/Header.tsx`)**:
   - Navigation links to `/`, `/politics`, `/tech-vibe`, `/social-change`, `/economy`, `/pop-culture`.
   - Highlight active page.
   - Search input and `Sign In` button linking to `/sign-in`.
3. **Card Navigation**:
   - Every article card in all feeds is wrapped or links to `/article/[id]`.
4. **Article Details Page (`/article/[id]/page.tsx`)**:
   - Hero header with back button, source badge, publish time, read time, and bookmark action.
   - Two-column desktop layout (or stacked mobile):
     - Left / Main column: Full article content, key takeaways, and related articles.
     - Right column (sticky analysis card): Deep AI perspective breakdown, thick bias meter, sentiment gauge, loaded terms pills, framing notes, and disclaimer.
5. **Topic Pages (`app/[topic]/page.tsx`)**:
   - Dedicated header explaining the topic perspective stream.
   - Topic-specific article grid with thick bias meters and category filtering.
6. **Sign In Page (`app/sign-in/page.tsx`)**:
   - Sleek dark card with VXN glowing logo, email/password form, social providers, and return link to home.

## Visual interpretation

- **Theme**: Deep obsidian (`#0A0A0A`), panel surfaces (`#1E1E1E`), border accents (`#2C2C2C`), warm flame accents (`#E64A19`, `#FF9800`).
- **Bias Meters**: Thick 16px–24px bars with Left crimson (`#C62828`), Center gray (`#757575`), Right gold (`#FFD54F`).
- **Typography**: Crisp Inter typography with generous line heights and uppercase metadata tracking.
- **Responsiveness**: Smooth 12-column to 4-column responsive adaptation for desktop, tablet, and mobile.

## Security requirements

- Pure presentation & client routing; zero secrets or tokens exposed to client bundles.

## Acceptance criteria

- All header navigation links (`/politics`, `/tech-vibe`, `/social-change`, `/economy`, `/pop-culture`, `/sign-in`) load their respective pages without 404 errors.
- Clicking any news card navigates to its full Article Details page (`/article/[id]`).
- Article Details page displays complete article analysis (neutral summary, thick bias meter, sentiment score, framing notes, loaded terms, model name, disclaimer, and related stories).
- All pages strictly follow the obsidian dark theme.
- `npx tsc --noEmit` and `npm run lint` pass with 0 errors.

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000`.
2. Click on each header navigation item: Politics, Tech-Vibe, Social Change, Economy, Pop Culture — verify topic page loads with filtered articles.
3. Click on any article card — verify it opens `/article/[id]` showing full article text and the complete AI framing analysis sidebar.
4. Click "Sign In" in the header — verify `/sign-in` loads with the styled dark login interface.
5. Test back navigation and related article links.
