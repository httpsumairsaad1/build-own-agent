# SKEW design system and home-page implementation

## Goal

Transform the current starter home page into a polished, responsive SKEW news-analysis interface that takes visual direction from the supplied dark "VibeXnews" design-system reference, while using SKEW branding and only local, static presentation data. Establish reusable global design tokens for the product as part of the implementation.

## Skills read

No project-supported integration skill is needed for this static UI foundation. The reference image is the visual source of truth. Before changing Next.js source files, read the relevant current Next.js documentation in `node_modules/next/dist/docs/` for fonts and App Router layout conventions.

## Existing code inspected

- `app/page.tsx` — currently renders only `Home`.
- `app/globals.css` — standard generated Tailwind v4 baseline with light/dark system colors.
- `app/layout.tsx` — currently loads Geist / Geist Mono and generated metadata.
- `package.json` — Next.js 16.3.1, React 19, Tailwind CSS 4; no shadcn/ui or icon library is installed.
- `AGENTS.md` — confirms the future product is SKEW, a data-driven news-analysis product; UI must display stored data only. Since persistence is not implemented yet, use clearly labelled static mock data solely to demonstrate the UI.

## Decisions and assumptions

- Keep the product name as **SKEW**. Do not copy the reference's "VibeXnews" wordmark or avatar artwork.
- Translate the reference, rather than reproduce it literally: obsidian background, charcoal panels, restrained warm-red/orange accents, warm-gold positive/right framing, soft neutral center framing, rounded cards, thin low-contrast borders, and a compact editorial dashboard feel.
- Use Inter for the UI typography, loaded through Next.js. Use a lightweight text/geometry wordmark instead of an external logo asset.
- Do not add dependencies. Use inline SVG icons where needed.
- Build a complete, credible home page with static article cards and controls. It must not fetch, scrape, analyze, authenticate, or mutate data.
- Design for an accessible dark theme: semantic landmarks, keyboard-focus indicators, descriptive controls, sufficient contrast, and no information conveyed by color alone.

## Files likely to change

- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`

## Implementation requirements

1. Update document metadata for SKEW, including a concise product description.
2. Replace generated global styles with reusable CSS custom properties and Tailwind theme bindings:
   - background `#0A0A0A`
   - panel `#1E1E1E`
   - elevated surface `#2C2C2C`
   - text / muted text tokens
   - foundation red around `#D32F2F`
   - dark-orange accent around `#E64A19`
   - ember-gold highlight around `#FDD835`
   - left / center / right analysis colors based on `#C62828`, `#757575`, and `#FFD54F`
   - consistent borders, shadows, radii (4 / 8 / 12 / pill), and 8px-based spacing.
3. Build a responsive application shell:
   - sticky dark header with SKEW logo, primary navigation, search action, and sign-in button;
   - a compact mobile header with an accessible menu button;
   - main content constrained to roughly 1200px with consistent horizontal gutters.
4. Build the home-page content with static mock data shaped like stored article / analysis data:
   - intro area identifying the feed and explaining that framing is AI-estimated;
   - topic chips and a subtle filter/sort affordance;
   - one featured article card plus a grid/list of additional news cards;
   - every card shows an image treatment, source, title, published date, sentiment label, AI-estimated framing label, left/center/right meter, and confidence.
5. Use original CSS/SVG visual treatments instead of remote image URLs. Image areas should be attractive editorial gradients or abstract patterned placeholders, avoiding copied copyrighted or generated portraits.
6. Add a compact analysis key / disclaimer section that explains sentiment and AI-estimated framing.
7. Ensure the desktop layout has clear hierarchy and enough density without crowding; collapse naturally to one column on small screens, maintain at least 16px mobile gutters, and make header navigation usable on narrow screens.
8. Avoid business logic and API calls. Keep mock data colocated with the page and make presentational helpers small and typed.

## Visual interpretation

- **Typography:** Inter with a strong editorial display headline (about 32px desktop / 26px mobile), 20–24px section headers, 14–16px body copy, and uppercase 11–12px metadata labels with generous tracking.
- **Layout:** 12-column-feeling desktop container; featured card spans more visual weight; standard cards form a two- or three-column layout depending on space; mobile is one column.
- **Cards:** dark elevated panels, 1px charcoal border, 12px radius, subtle shadow/glow on interaction; article images use a fixed, balanced aspect ratio.
- **Color:** warm accents should guide attention sparingly. Analysis meters are segmented left / center / right bars with textual percentage labels, never color-only.
- **Interaction:** clear focus rings, card hover elevation, buttons/chips with distinct hover and disabled-ready styling.
- **Pixel fidelity:** align with the supplied reference's dark, refined, warm-accent visual language, but keep content, logo, and graphics unique to SKEW.

## Security requirements

- Do not expose or add credentials, secrets, server-only environment variables, or external service calls.
- Do not add browser-side scraping, AI calls, or database mutation.

## Acceptance criteria

- The home page is a complete, responsive SKEW news-feed interface—not a starter placeholder.
- Global design tokens reflect the supplied visual reference and can support future routes.
- The UI uses SKEW branding and static mock content only.
- Every displayed article demonstrates source, date, sentiment, AI-estimated framing, three-way percentages, and confidence.
- It works without added packages, external images, or runtime network calls.
- It has sensible mobile, keyboard, and accessibility behavior.

## Checks to run

1. `npx tsc --noEmit` (there is currently no `typecheck` npm script)
2. `npm run lint`
3. `npm run build`

## Manual test steps

1. Run `npm run dev` from the repository root.
2. Open `http://localhost:3000` and confirm the dark SKEW feed appears with a header, featured article, topic chips, article cards, analysis meters, and explanatory note.
3. Resize the browser to approximately 375px wide and confirm that cards become one column, text remains readable, and navigation/actions remain usable.
4. Tab through interactive elements to confirm visible keyboard focus states.
5. Confirm DevTools Network shows no external data, AI, scraping, or database calls caused by the UI.
