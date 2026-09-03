# Ebooks Platform

A minimal ebooks reading platform built with **Next.js**, **Tailwind CSS v4** and **Shadcn/UI Theme** integrated with **Clerk** for authentication and **Resend** for transactional emails. Anyone can read the full catalog for free — signing in unlocks a small set of email-powered actions on top of that.

---

## ✨ Features

**Available to everyone (no account needed)**
- Browse the full ebook catalog on the home page.
- Read any ebook in full, for free, rendered from MDX.

**Available once signed in (Clerk)**
- **Get resume** — send the pre-written summary of the ebook you're reading to any email address.
- **Share** — send the current ebook's link, plus a personal message, to any email address.
- **Welcome email** — automatically sent via a Clerk webhook the moment a new account is created, and lands the user on `/welcome`.

There is no CRUD in this project — content (ebooks + their summaries) is static, defined in `lib/config.tsx` and `content/ebooks/*.mdx`.

---

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, neo-brutalism design system (no dark mode) |
| UI components | shadcn/ui |
| Animation | Motion |
| Icons | lucide-react (UI), react-icons/fa6 (brand logos) |
| Content | MDX via `next-mdx-remote` + `gray-matter` |
| Auth | Clerk |
| Email | Resend |
| Font | Geist / Geist Mono |

---

## 🔌 Integrations

### Clerk — Authentication
Clerk gates every email-powered action behind a signed-in session. Signed-out visitors can read every ebook, but the "Get resume" and "Share" actions on the ebook page only render for signed-in users (`<SignedIn>`).

A Clerk webhook listens for `user.created` and triggers the welcome email (see [Resend](#resend--transactional-email) below) — no user action is needed on the frontend for this to happen.

- Auth proxy / middleware: `src/middleware.ts`
- Provider config: `lib/clerk/`

### Resend — Transactional email
Every email sent by the app — the resume, the share message, and the welcome email — goes through Resend. Each flow is a plain async function so it can be called from a Server Action or a Route Handler without duplicating logic:

```
lib/resend/
  ├─ client.ts     → Resend client, initialized once
  ├─ sendWelcome()  → triggered by the Clerk webhook on signup
  ├─ sendResume()   → triggered by the "Get resume" form
  └─ sendShare()    → triggered by the "Share" form
```

```ts
async function sendWelcome(userEmail: string, userName: string) {
  return sendEmail({
    from: "Acme <no-reply@your-domain.com>",
    to: userEmail,
    subject: "Welcome!",
    react: WelcomeEmail({ recipientName: userName }),
  });
}
```

The webhook route only verifies the payload and calls the function — it holds no email-sending logic itself:

```
app/api/webhooks/clerk/route.ts   → verifies the Clerk webhook, calls sendWelcome()
```

Keeping the send functions out of the route handler means the same `sendResume` / `sendShare` calls triggered from the ebook page's forms reuse the exact same Resend client and templates as the webhook — one source of truth for every email the app sends.

---

## 📁 Project structure

```
src/

  app/
  ├─ page.tsx                      → Home route (renders PageHome)
  ├─ welcome/
  │  └─ page.tsx                   → /welcome route 
  ├─ sign-in/
  │  └─ page.tsx                   → /welcome route login
  ├─ sign-up/
  │  └─ page.tsx                   → /welcome route sign up
  ├─ ebook/
  │  └─ [slug]/
  │     └─ page.tsx                → /ebook/[slug] route (renders PageEbookSlug)
  └─ api/
   └─ webhooks/
      └─ clerk/
         └─ route.ts             → Clerk webhook → triggers sendWelcome()

components/
├─ page-home.tsx                 → Home page composition
├─ page-welcome.tsx              → Welcome page content
├─ page-ebook-slug.tsx           → Ebook reader page composition
├─ navbar.tsx                    → Centered site name, auth entry point
├─ hero.tsx                      → Home hero section
├─ card-ebook.tsx                → Ebook card (category-colored banner)
├─ ebooks-list.tsx               → Catalog grid
├─ dialog-get-resume.tsx         → "Get resume" modal + form
├─ dialog-share-ebook.tsx        → "Share" modal + form
└─ ui/                           → shadcn/ui components

lib/
├─ config.tsx                    → Site config, categories, ebooks metadata, resumes
├─ mdx.ts                        → getAllEbooks() / getEbookBySlug()
├─ clerk/                        → Clerk provider setup
└─ resend/                       → Resend client + send functions

├─ proxy.ts                 → Auth proxy (Clerk middleware)

content/
└─ ebooks/
   └─ *.mdx                      → Ebook content, one file per slug
```

---

## 🎨 Design system

The UI follows a neo-brutalism style: hard borders, offset shadows, flat colors, `--radius: 0px`, no dark mode toggle. Every color used across the app comes from the CSS variables defined in `globals.css` — nothing is hardcoded, and category colors (`Business`, `English`, `Tech`) map directly to the theme's `primary`, `secondary`, and `accent` tokens rather than a separate palette.

Typography and spacing use Tailwind's default scale throughout; no custom values were added to `globals.css`.

---

## 🚀 Environment variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SIGNING_SECRET=
RESEND_API_KEY=
```

---

## 🛠️ Built with formaui

The Clerk and Resend integrations in this project were scaffolded with **[formaui](https://formaui.site)** — a CLI that drops production-ready auth, AI, payments, and email integrations straight into a Next.js project (`lib/<provider>/` modules, middleware injection, env var sync, and a `SETUP.md` per provider).

```bash
npx @dariomvg/formaui add clerk
npx @dariomvg/formaui add resend
```

Built by [Dari](https://github.com/dariomvg) — [formaui.site](https://formaui.site)