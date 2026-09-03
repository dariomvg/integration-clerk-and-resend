// service.ts
// INTERNAL. Raw server-side logic against the Clerk SDK: current user/session,
// auth guards, and account deletion. Not imported directly from components —
// use actions.ts, the public entry point that wraps these as Server Actions.
//
// Design decision: password update / reset are NOT handled here. Sign-in,
// sign-up, and password reset are Clerk's prebuilt <SignIn>/<SignUp>
// components; password changes for a signed-in user go through <UserButton>'s
// built-in "Manage Account" screen. None of that needs custom logic on either
// side of this boilerplate.

import "server-only";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { AppSession, AppUser, AuthResult, Permission, Role } from "./types";
import { ROLE_PERMISSIONS } from "./types";

/**
 * Maps Clerk's backend User object into the app's normalized AppUser shape.
 * Kept private (not exported) — this boilerplate has no client-side mapper
 * anymore since it relies on Clerk's prebuilt <SignIn>/<SignUp>/<UserButton>
 * components instead of custom client-side auth logic.
 */
function mapToAppUser(user: User): AppUser {
  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    emailVerified: user.primaryEmailAddress?.verification?.status === "verified",
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role: (user.publicMetadata?.role as Role) ?? "user",
    createdAt: user.createdAt ? new Date(user.createdAt) : null,
  };
}

/**
 * Returns the currently authenticated user, normalized to AppUser.
 * Use this when the caller wants to branch on "authenticated or not" itself.
 */
export async function getCurrentUser(): Promise<AuthResult<AppUser>> {
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      error: { code: "not_authenticated", message: "No authenticated user found." },
    };
  }
  return { success: true, data: mapToAppUser(user) };
}

/**
 * Returns the current session, normalized to AppSession.
 */
export async function getCurrentSession(): Promise<AuthResult<AppSession>> {
  const { sessionId, userId, sessionClaims } = await auth();
  if (!sessionId || !userId) {
    return {
      success: false,
      error: { code: "session_not_found", message: "No active session." },
    };
  }
  return {
    success: true,
    data: {
      sessionId,
      userId,
      status: "active",
      // Clerk's session token claims don't include last-active timestamp;
      // fetch it via clerkClient().sessions.getSession(sessionId) if needed.
      lastActiveAt: null,
      expireAt: sessionClaims?.exp ? new Date(sessionClaims.exp * 1000) : null,
    },
  };
}

/**
 * Guards a Server Component / Server Action / Route Handler.
 * Redirects to the sign-in page if there is no active session.
 * Use this (instead of getCurrentUser()) when the route must never render
 * without an authenticated user.
 */
export async function requireAuth(): Promise<AppUser> {
  const result = await getCurrentUser();
  if (!result.success) {
    redirect(process.env.NEXT_PUBLIC_CLERK_UNAUTHENTICATED_REDIRECT_URL ?? "/sign-in");
  }
  return result.data;
}

/**
 * Guards a Server Component / Server Action behind a specific role.
 * With a single "user" role today this is effectively a safety net for the
 * future — kept so call sites don't need to change when roles are added.
 */
export async function requireRole(role: Role): Promise<AppUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    redirect("/");
  }
  return user;
}

/**
 * Checks whether a given role grants a given permission.
 * Pure lookup against ROLE_PERMISSIONS in types.ts — no network call.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Permanently deletes the currently authenticated user's account via the
 * Clerk Backend API. This action cannot be undone.
 */
export async function deleteAccount(): Promise<AuthResult> {
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      error: { code: "not_authenticated", message: "No authenticated user found." },
    };
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
    return { success: true, data: undefined };
  } catch {
    return {
      success: false,
      error: { code: "unknown_error", message: "Failed to delete account." },
    };
  }
}