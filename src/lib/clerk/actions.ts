"use server";

// actions.ts
// PUBLIC entry point for server-side usage — Server Components, Server
// Actions bound to forms/buttons, and Route Handlers all import from here,
// never from service.ts directly.
//
// Every export here is a thin wrapper around service.ts. Kept thin on
// purpose: service.ts owns the actual logic against the Clerk SDK, this
// file only exists to give it a stable "use server" public surface.
//
// Note: hasPermission() in service.ts is synchronous. A "use server" file
// requires every export to be an async function, so checkPermission() below
// wraps it — this is the one function here that isn't a 1:1 passthrough.

import * as service from "./service";
import type { AppSession, AppUser, AuthResult, Permission, Role } from "./types";

export async function getCurrentUser(): Promise<AuthResult<AppUser>> {
  return service.getCurrentUser();
}

export async function getCurrentSession(): Promise<AuthResult<AppSession>> {
  return service.getCurrentSession();
}

export async function requireAuth(): Promise<AppUser> {
  return service.requireAuth();
}

export async function requireRole(role: Role): Promise<AppUser> {
  return service.requireRole(role);
}

export async function checkPermission(role: Role, permission: Permission): Promise<boolean> {
  return service.hasPermission(role, permission);
}

export async function deleteAccount(): Promise<AuthResult> {
  return service.deleteAccount();
}