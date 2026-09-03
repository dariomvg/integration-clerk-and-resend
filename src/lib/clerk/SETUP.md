# Clerk Auth

Authentication logic for Next.js App Router, built on Clerk. No UI included —
every function returns data or an `AuthResult`; your components decide how to render it.

Import server-side functions from `actions.ts`, and client-side functions/hooks from `client.ts` and `hooks.ts`.

```ts
// Server Components, Server Actions, Route Handlers
import { requireAuth, getCurrentUser, deleteAccount } from "@/lib/auth/clerk/actions";
```

```ts
// Client Components
import { useSignInFlow, useSignUpFlow, useCurrentUser, useSignOut, useOAuthSignIn, useResetPasswordFlow } from "@/lib/auth/clerk/hooks";
import { updatePassword, resendEmailVerification } from "@/lib/auth/clerk/client";
```

## Configuration

These are manual steps outside the codebase — the CLI can copy files and
install dependencies, but can't configure Clerk's Dashboard or edit an
existing `app/layout.tsx` for you.

**1. Wrap the app in `<ClerkProvider>`** (`app/layout.tsx`):

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**2. Add the OAuth callback page** — the one page Clerk itself requires
(`app/sign-in/sso-callback/page.tsx`):

```tsx
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
```

**3. Enable OAuth providers** — Clerk Dashboard > Configure > SSO Connections:
enable Google, GitHub, and Facebook. Clerk gives you a Redirect URI to paste
into each provider's own developer console. Development instances use
Clerk's shared credentials by default; add your own per-provider credentials
there for production.

**4. Configure the webhook** — Clerk Dashboard > Configure > Webhooks > Add Endpoint:
- URL: `https://yourdomain.com/api/webhooks/clerk`
- Subscribe to `user.created` (and `user.deleted` if you extend the handler
  to clean up your own database).
- Copy the Signing Secret into `CLERK_WEBHOOK_SECRET`.

**5. Redirect URL env vars** — read directly by Clerk's SDK, set in
`.env.local` (see `env.example`):
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` — your sign-in/sign-up pages.
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` — where to send the user after success.
- `NEXT_PUBLIC_CLERK_UNAUTHENTICATED_REDIRECT_URL` — used by `requireAuth()` when redirecting a signed-out user.

## Usage examples

**Protect a Server Component:**

```tsx
import { requireAuth } from "@/lib/auth/clerk/actions";

export default async function DashboardPage() {
  const user = await requireAuth(); // redirects to sign-in if unauthenticated
  return <p>Welcome, {user.firstName}</p>;
}
```

**Read the current user without redirecting:**

```tsx
import { getCurrentUser } from "@/lib/auth/clerk/actions";

export default async function ProfileBadge() {
  const result = await getCurrentUser();
  if (!result.success) return null;
  return <span>{result.data.email}</span>;
}
```

**Sign in from a Client Component:**

```tsx
"use client";
import { useSignInFlow } from "@/lib/auth/clerk/hooks";

export function SignInForm() {
  const { submit, isLoading } = useSignInFlow();

  async function handleSubmit(formData: FormData) {
    const result = await submit(
      formData.get("email") as string,
      formData.get("password") as string
    );
    if (!result.success) {
      // show result.error.message
    }
  }

  return <form action={handleSubmit}>{/* fields */}</form>;
}
```

**Sign up with email verification:**

```tsx
"use client";
import { useSignUpFlow } from "@/lib/auth/clerk/hooks";

export function SignUpForm() {
  const { step, submit, verifyEmail, isLoading } = useSignUpFlow();

  // step === "form"          -> render email/password fields, call submit()
  // step === "verify_email"  -> render code input, call verifyEmail(code)
  // step === "complete"      -> user is signed in
}
```

**Sign in with Google/GitHub/Facebook:**

```tsx
"use client";
import { useOAuthSignIn } from "@/lib/auth/clerk/hooks";

export function OAuthButtons() {
  const { signInWithGoogle, signInWithGitHub, signInWithFacebook } = useOAuthSignIn();
  return (
    <>
      <button onClick={signInWithGoogle}>Continue with Google</button>
      <button onClick={signInWithGitHub}>Continue with GitHub</button>
      <button onClick={signInWithFacebook}>Continue with Facebook</button>
    </>
  );
}
```

**Reset a forgotten password:**

```tsx
"use client";
import { useResetPasswordFlow } from "@/lib/auth/clerk/hooks";

export function ResetPasswordForm() {
  const { step, requestReset, resetPassword } = useResetPasswordFlow();

  // step === "request" -> ask for email, call requestReset(email)
  // step === "reset"   -> ask for code + new password, call resetPassword(code, newPassword)
  // step === "complete" -> user is signed in with the new password
}
```

**Change password for a signed-in user:**

```tsx
"use client";
import { useUser } from "@clerk/nextjs";
import { updatePassword } from "@/lib/auth/clerk/client";

async function handleChangePassword(currentPassword: string, newPassword: string) {
  const { user } = useUser();
  if (!user) return;
  const result = await updatePassword(user, currentPassword, newPassword);
}
```

**Sign out:**

```tsx
"use client";
import { useSignOut } from "@/lib/auth/clerk/hooks";

export function SignOutButton() {
  const { signOut, isLoading } = useSignOut();
  return <button onClick={signOut} disabled={isLoading}>Sign out</button>;
}
```

**Delete the current account:**

```tsx
import { deleteAccount } from "@/lib/auth/clerk/actions";

async function handleDeleteAccount() {
  "use server";
  const result = await deleteAccount();
}
```

**Guard by role:**

```ts
import { requireRole } from "@/lib/auth/clerk/actions";

const user = await requireRole("user");
```