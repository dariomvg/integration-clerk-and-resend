// types.ts
// Single source of truth for all Auth-related types used across this boilerplate.
// Consumed by: client.ts, server.ts, middleware.ts, hooks.ts, route.ts, protected-routes.ts.

/**
 * Application-level role.
 * This boilerplate ships with a single role. The type is kept as a union
 * (instead of a hardcoded literal everywhere) so adding roles later only
 * means extending this line — no other file needs to change.
 */
export type Role = "user";

/**
 * Permissions granted to every authenticated user.
 * There is no role-based branching yet: `hasPermission()` in server.ts
 * simply checks membership in this list. Extend both `Role` and this
 * list together if role-based permissions are introduced later.
 */
export type Permission =
  | "read:own_profile"
  | "update:own_profile"
  | "delete:own_account";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: ["read:own_profile", "update:own_profile", "delete:own_account"],
};

/**
 * Normalized application user shape.
 * Produced by mapping Clerk's User object (client and server variants)
 * into one consistent shape so consuming code never touches Clerk internals
 * directly.
 */
export interface AppUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  role: Role;
  createdAt: Date | null;
}

/**
 * Normalized session shape.
 */
export interface AppSession {
  sessionId: string;
  userId: string;
  status: "active" | "expired" | "revoked";
  lastActiveAt: Date | null;
  expireAt: Date | null;
}

/**
 * Discriminated error codes so calling code can branch on `error.code`
 * instead of parsing error messages.
 */
export type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_verified"
  | "email_already_exists"
  | "weak_password"
  | "user_not_found"
  | "session_not_found"
  | "not_authenticated"
  | "not_authorized"
  | "rate_limited"
  | "webhook_verification_failed"
  | "unknown_error";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/**
 * Standard result wrapper returned by every auth action across
 * client.ts, server.ts and hooks.ts. Keeps error handling uniform
 * across the whole boilerplate.
 */
export type AuthResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: AuthError };
