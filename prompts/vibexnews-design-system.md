# vibeXnews Design System and Home Page Implementation

## Goal

Implement the complete **vibeXnews** design system and responsive news feed interface based on the provided UI reference (`vibeXnews-design-system`). Establish global CSS design tokens, typography, color architecture, UI components (buttons, chips, bias meters, cards, icons), and a polished, accessible dark-theme home page.

## Skills read

- `AGENTS.md` — specifications for vibeXnews product, data architecture, sentiment and AI-estimated framing meters (Left / Center / Right percentages summing to 100), and UI constraints (presentation of data only, no client scraping or direct DB mutation).
- Next.js App Router guides in `node_modules/next/dist/docs/` for font optimization (`next/font/google` with Inter), layout configuration, and server/client component boundaries.

## Existing code inspected

- `app/layout.tsx` — current base layout with font setup and metadata.
- `app/globals.css` — Tailwind v4 configuration and color variable definitions.
- `app/page.tsx` — placeholder home page.
- `package.json` — Next.js 16.3.1, React 19, Tailwind CSS v4.

## Decisions and assumptions

- **Brand identity**: Official name **vibeXnews** with **VXN** stylized monogram logo and tagline *"Vibrancy in perspectives. Data-driven clarity."*
- **Theme**: Premium obsidian dark palette:
  - Base Background: `#0A0A0A` (Obsidian Base)
  - Surface Panel: `#1E1E1E` (Panel Surface)
  - Elevated Surface: `#2C2C2C` (Smoky Live / Hover Surface)
  - Dark Accent / Primary Brand: `#E64A19` (Burnt Orange / Coral)
  - Secondary Accent: `#FF9800` (Amber / Jade Glow)
  - Foundation Accent: `#D32F2F` (Foundation Crimson)
  - Ember Highlight: `#FDD835` / `#FFD54F` (Ember Gold)
  - Bias Scale:
    - Left Bias: `#C62828`
    - Center Neutral: `#757575`
    - Right Bias: `#FFD54F`
- **Typography**: Google Font `Inter` applied globally:
  - `H1`: 32px / Bold (700) / line-height 1.2
  - `H2`: 24px / SemiBold (600) / line-height 1.3
  - `H3`: 20px / Medium (500) / line-height 1.3
  - `H4`: 16px / Regular (400) / line-height 1.6
  - `Body Large`: 16px / Regular / line-height 1.6
  - `Body Medium`: 14px / Regular / line-height 1.6
  - `Body Small`: 12px / Regular / line-height 1.6
  - `Caption`: 11px / Regular / line-height 1.6 (letter-spacing 0.05em uppercase)
- **Spacing & Radius**:
  - Base 4px/8px scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px.
  - Border Radii: Small `4px`, Medium `8px`, Large `12px`, Full `9999px` (pill).
  - Shadows: Small (`0 4px 12px rgba(0,0,0,0.4)`), Medium (`0 4px 13px rgba(0,0,0,0.65)`), Large / Glow (`0 4px 13px rgba(0,0,0,0.9)`, orange accent glow `0 0 20px rgba(230,74,25,0.15)`).
- **Icons**: Clean inline SVG 2px-stroke rounded icons in brand accent (`#E64A19` / `#FF9800`) and neutral tones (Search, Filter, Bookmark, Time, Trending, Share, User, Bell, Chevron, Sliders).
- **Data presentation**: All cards render realistic mock data matching the Supabase article & analysis schema (title, source, published date, read time, image treatment, sentiment label, AI-estimated framing label, left/center/right percentage breakdown, confidence).

## Files likely to change

- `app/globals.css` — complete design system token definitions and Tailwind v4 theme integration.
- `app/layout.tsx` — Inter font configuration and vibeXnews metadata.
- `app/page.tsx` — comprehensive home page featuring navigation header, hero banner, category chips, featured article card, news card grid, bias meter visualizations, and footer with design system metadata.
- `package.json` — package name set to `"vibexnews"`.

## Implementation requirements

1. **Design tokens (`app/globals.css`)**:
   - Define CSS custom properties for all colors, surfaces, borders, shadows, and typography tokens.
   - Configure Tailwind v4 `@theme` mappings for obsidian surfaces, brand accents, and bias scale colors.
2. **Document shell (`app/layout.tsx`)**:
   - Load `Inter` from `next/font/google` with full weight support (400, 500, 600, 700).
   - Set metadata title to `"vibeXnews - AI-Powered News Analysis & Framing"` and description.
3. **Application Header**:
   - Sticky top bar with VXN gradient logo + "vibeXnews" wordmark.
   - Primary navigation (Home, Politics, Tech, Economy, Culture).
   - Search bar with 2px stroke icon and keyboard shortcut badge (`⌘K`).
   - Action buttons: "Sign In" (outline / ghost) and "Subscribe / Get Alerts" (primary brand accent).
4. **Hero & Filter Bar**:
   - Tagline banner: *"Vibrancy in perspectives. Data-driven clarity."*
   - Interactive category chips ("All", "Pop Culture", "Social Change", "Tech-Vibe", "Politics", "Economy", "More +").
   - Filter & sort controls (Latest, Most Biased, Balanced Perspectives).
5. **Featured Article Card**:
   - Large prominent card with editorial image treatment, source badge ("VibeXnews • Politics"), high-contrast headline, summary text, and full segmented Left/Center/Right bias meter with percentages.
   - Time ago ("2h ago"), read time ("12 min read"), and bookmark/share actions.
6. **Article Grid**:
   - 2-to-3 column responsive grid of news cards.
   - Each card contains thumbnail media, source & category, title, snippet, sentiment badge (Positive / Neutral / Negative), AI-estimated framing badge (Left / Center / Right / Mixed), segmented bias progress bar, and timestamp.
7. **Bias & Sentiment Key / Explanatory Section**:
   - Dedicated explanatory card breaking down how AI estimates framing percentages and confidence scores.
   - Live sample meter demonstrating Left (Crimson), Center (Neutral Gray), and Right (Warm Gold) metrics.
8. **Footer**:
   - Brand logo, tagline *"Stay Vibe. Data-driven. Stay consistent. Stay un-biased."*, design system v1.1 stamp, and copyright.

## Visual interpretation

- **Background & Panels**: Deep obsidian (`#0A0A0A`) with subtle 1px border (`#2C2C2C`) on panels (`#1E1E1E`). Elevated card hover effect with glowing orange accent borders.
- **Typography & Hierarchy**: Inter font throughout with crisp contrast, generous letter-spacing on small caps labels, bold punchy headlines.
- **Meters & Data**: Clean 3-segment progress bars with distinct color stops (`#C62828`, `#757575`, `#FFD54F`) paired with clear text percentage readouts.
- **Responsiveness**: Fluid 12-column desktop layout (max container 1200px / 1440px wide) transitioning smoothly to 4-column single/dual column on tablets and mobile screens.

## Security requirements

- All UI logic remains purely client-safe with zero server secrets, tokens, or direct mutation handlers exposed.

## Acceptance criteria

- Design system matches the attached UI reference in typography, color palette, component styling, and layout structure.
- Home page is rich, interactive, and completely responsive without layout shifts or horizontal overflow.
- TypeScript compiles cleanly (`npx tsc --noEmit`) and linter passes (`npm run lint`).

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`

## Manual test steps

1. Run `npm run dev` and open `http://localhost:3000`.
2. Verify that the dark obsidian theme, VXN brand header, category chips, featured story, and news grid display correctly with the exact color architecture.
3. Test interactive elements (filter chip switching, search input, card hover states, bookmark toggles).
4. Resize viewport to mobile (375px) and tablet (768px) to verify responsive grid collapse and mobile navigation.
5. Inspect bias meters on all cards to verify accurate 3-way percentage rendering and visual clarity.
