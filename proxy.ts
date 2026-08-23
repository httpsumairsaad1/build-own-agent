import { clerkMiddleware } from "@clerk/nextjs/server";

// All currently implemented routes are public. Clerk still runs here to make
// authentication state available to the provider and Clerk UI components.
// Protect future resources at the page, layout, route-handler, or server-action
// boundary where the resource is accessed.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
