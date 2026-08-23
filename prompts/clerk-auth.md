# Clerk Authentication Implementation for vibeXnews

## Goal

Integrate Clerk authentication (`@clerk/nextjs` and `@clerk/themes`) into **vibeXnews**, providing secure, full-stack user authentication, obsidian dark-themed `<SignIn />` and `<SignUp />` routes, user session state in the navigation header with `<SignedIn>`, `<SignedOut>`, and `<UserButton />`, and non-blocking public route middleware.

## Skills read

- `AGENTS.md` — Section 1 (Product scope: Clerk authentication), Section 5 (Architecture: Website auth UI), Section 6 (Tech stack), Section 21 (Environment variables: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
- `.agents/skills/clerk` — Clerk SDK architecture and router.
- `.agents/skills/clerk-setup` — Next.js `@clerk/nextjs` setup, `ClerkProvider` placement inside `<body>`, environment variables configuration.
- `.agents/skills/clerk-nextjs-patterns` — `clerkMiddleware` public route matching, `auth()` usage, `SignedIn` / `SignedOut` components.

## Existing code inspected

- `package.json` — currently Next.js 16.3.1, React 19; `@clerk/nextjs` and `@clerk/themes` need to be installed.
- `.env.local` — contains `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`.
- `app/layout.tsx` — root layout where `<ClerkProvider>` will wrap `children` inside `<body>`.
- `components/Header.tsx` — contains static Sign In button; needs to dynamically render `<SignedOut>` (Sign In button) vs `<SignedIn>` (`<UserButton />`).
- `app/sign-in/page.tsx` — current placeholder sign-in; will be replaced by `app/sign-in/[[...sign-in]]/page.tsx` using Clerk's `<SignIn />`.
- `app/sign-up/[[...sign-up]]/page.tsx` — new sign-up page using Clerk's `<SignUp />`.

## Decisions and assumptions

- **Package Installation**: Install `@clerk/nextjs` and `@clerk/themes` for Next.js App Router and dark theming.
- **Provider Configuration**: Wrap children in `app/layout.tsx` with `<ClerkProvider>` styled with `dark` base theme and custom vibeXnews color tokens (`#E64A19` primary accent, `#1E1E1E` panel surface, `#0A0A0A` base background, `#2C2C2C` borders).
- **Middleware**: Create `middleware.ts` utilizing `clerkMiddleware()` with public route matching for all news feeds (`/`, `/politics`, `/tech-vibe`, `/social-change`, `/economy`, `/pop-culture`, `/article/(.*)`), auth endpoints (`/sign-in(.*)`, `/sign-up(.*)`), and public APIs.
- **Dedicated Auth Routes**:
  - `app/sign-in/[[...sign-in]]/page.tsx` with Clerk `<SignIn />` centered in a branded obsidian dark container.
  - `app/sign-up/[[...sign-up]]/page.tsx` with Clerk `<SignUp />` centered in a branded obsidian dark container.
- **Header Auth State**:
  - Unauthenticated visitors see the "Sign In" button linking to `/sign-in`.
  - Authenticated visitors see their `<UserButton />` and user avatar with access to profile and sign-out controls.
- **Environment Variables**:
  - Add `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, and fallback redirect variables to `.env.local` / `.env.example`.

## Files likely to change / create

- `package.json` [MODIFY] — add `@clerk/nextjs` and `@clerk/themes`.
- `.env.local` [MODIFY] — add Clerk sign-in/sign-up route path variables.
- `middleware.ts` [NEW] — configure `clerkMiddleware` with public routes matcher.
- `app/layout.tsx` [MODIFY] — wrap application body with styled `<ClerkProvider>`.
- `components/Header.tsx` [MODIFY] — add `<SignedIn>`, `<SignedOut>`, and `<UserButton />`.
- `app/sign-in/[[...sign-in]]/page.tsx` [NEW] — Clerk `<SignIn />` route in dark theme layout.
- `app/sign-up/[[...sign-up]]/page.tsx` [NEW] — Clerk `<SignUp />` route in dark theme layout.
- `app/sign-in/page.tsx` [DELETE] — replaced by catch-all route `app/sign-in/[[...sign-in]]/page.tsx`.

## Implementation requirements

1. **Install Dependencies**:
   - `npm install @clerk/nextjs @clerk/themes`
2. **Configure Middleware (`middleware.ts`)**:
   - Use `clerkMiddleware` with `createRouteMatcher` for public feed routes.
3. **Configure `<ClerkProvider>` (`app/layout.tsx`)**:
   - Place inside `<body>` tags.
   - Apply `appearance` with `dark` theme, `colorPrimary: "#E64A19"`, `colorBackground: "#1E1E1E"`, `colorInputBackground: "#141414"`, `colorInputBorder: "#2C2C2C"`, `colorText: "#FFFFFF"`.
4. **Build Sign-In & Sign-Up Pages**:
   - Create `app/sign-in/[[...sign-in]]/page.tsx` with `<SignIn />`.
   - Create `app/sign-up/[[...sign-up]]/page.tsx` with `<SignUp />`.
   - Include VXN brand header and link back to feed.
5. **Update Navigation Header (`components/Header.tsx`)**:
   - Show `<UserButton />` when user is signed in with custom dark styling.
   - Show `Sign In` button when user is signed out.

## Visual interpretation

- Clerk components blend seamlessly into the obsidian dark design system: `#0A0A0A` background, `#1E1E1E` card surfaces, `#2C2C2C` borders, and `#E64A19` flame orange buttons.
- Responsive centering with ample padding and clean brand identity.

## Security requirements

- `CLERK_SECRET_KEY` remains strictly server-only in `.env.local` and is never referenced in client code.
- Only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is accessible to the browser.
- Public news reading routes remain accessible without mandatory sign-in walls.

## Acceptance criteria

- `@clerk/nextjs` is installed and functioning with Next.js 16 App Router.
- Visiting `/sign-in` renders Clerk's dark-themed `<SignIn />` interface.
- Visiting `/sign-up` renders Clerk's dark-themed `<SignUp />` interface.
- Header dynamically reflects auth state (`Sign In` button vs `<UserButton />`).
- All public feeds and article detail pages remain browseable without authentication errors.
- `npx tsc --noEmit` and `npm run lint` pass with 0 errors.

## Checks to run

1. `npx tsc --noEmit`
2. `npm run lint`

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000`.
2. Click "Sign In" in the header — verify `/sign-in` loads with Clerk's dark-themed sign-in card.
3. Test signing in with credentials or OAuth — verify redirect back to home page.
4. Verify the header now displays the `<UserButton />` avatar instead of the Sign In button.
5. Click `<UserButton />` to verify profile menu and sign-out action.
6. Verify all public feeds (`/politics`, `/tech-vibe`, `/social-change`, `/economy`, `/pop-culture`, `/article/[id]`) load smoothly.
