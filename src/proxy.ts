// proxy.ts
// Next.js 16+: place this file at the project root (or inside /src if you use
// one), same level as /app. Only the FILENAME changed from middleware.ts —
// the code and the `clerkMiddleware()` export are identical either way.
// On Next.js ≤15, name this file middleware.ts instead; nothing else changes.
//
// Strategy: this file's only job is attaching the session to matched requests
// so `auth()`/`currentUser()` resolve in Server Components/Actions further
// down the request. It does NOT decide what's protected — that decision
// lives at the point of use (`requireAuth()`/`requireRole()` in actions.ts),
// per Clerk's current guidance to protect access where data is read or
// mutated rather than centralizing an allow/deny list at the network edge.

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};