# Remove Theme Switcher UI & Maintain Default Obsidian Dark Theme

## Goal

Remove the interactive theme switcher toggle button and related theme state handlers from the navigation header, locking the application into the default **vibeXnews Obsidian Dark Theme**.

## Skills read

- `AGENTS.md` — specifications for vibeXnews product, dark design system reference, and UI architecture.

## Existing code inspected

- `app/page.tsx` — contains `IconSun`, `IconMoon`, `theme` state, `toggleTheme` method, and the header theme toggle `<button>` element.
- `app/layout.tsx` — loads `dark` class on `<html>`.
- `app/globals.css` — defines `.dark` obsidian theme tokens.

## Decisions and assumptions

- Remove the Sun/Moon button from the desktop and mobile headers in `app/page.tsx`.
- Remove the unused `theme` state, `toggleTheme` function, and icon components (`IconSun`, `IconMoon`).
- Ensure the application displays the obsidian dark theme by default seamlessly.
- Preserve the thick bias meter improvements and existing layout structure.

## Files likely to change

- `app/page.tsx`

## Implementation requirements

1. Remove `IconSun` and `IconMoon` SVG components from `app/page.tsx`.
2. Remove `theme` state, `useEffect` theme synchronization, and `toggleTheme` handler from `VibeXnewsHome` component.
3. Remove the Theme Toggle `<button>` from the header navigation bar.
4. Clean up any unused imports or variables to maintain zero lint warnings.

## Security requirements

- Purely presentational change; no security implications.

## Acceptance criteria

- Theme toggle button is completely removed from the header.
- The UI consistently renders in the signature vibeXnews dark theme without errors.
- `npm run typecheck` and `npm run lint` pass with 0 errors/warnings.

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000`.
2. Verify that the header contains only the VXN brand logo, nav links, search bar, Sign In, and Stay Vibe buttons (no theme toggle icon).
3. Verify that the full news feed displays in the obsidian dark theme with thick bias meters intact.
