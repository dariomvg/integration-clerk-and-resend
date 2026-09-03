# Resend Email Module

Usage examples for sending, scheduling, and managing emails with this module.

Everything you need for standard usage is imported from `actions.ts` — it's the only file you need to import from. The examples further down that import from `service.ts` or `webhooks/handler.ts` cover advanced, less common cases (resending, checking status, custom webhook handling) and are optional.

## Usage Examples

Send a plain text email. `sendEmail` is the main entry point in `actions.ts` and works from Server Components or your own Server Actions.

```ts
import { sendEmail } from "@/email/resend/actions";

await sendEmail({
  from: "Acme <no-reply@your-domain.com>",
  to: "user@example.com",
  subject: "Hello",
  text: "This is a plain text email.",
});
```

Send an HTML email instead — pass `html` in place of `text`. Only one of `text`, `html`, or `react` can be set per call.

```ts
await sendEmail({
  from: "Acme <no-reply@your-domain.com>",
  to: "user@example.com",
  subject: "Hello",
  html: "<p>This is an <strong>HTML</strong> email.</p>",
});
```

Send one of the included React Email templates by passing it as `react`. This renders the component to HTML on the server before sending.

```ts
import { sendEmail } from "@/email/resend/actions";
import { WelcomeEmail } from "@/email/resend/templates/welcome";

await sendEmail({
  from: "Acme <no-reply@your-domain.com>",
  to: "user@example.com",
  subject: "Welcome!",
  react: WelcomeEmail({ recipientName: "John", ctaUrl: "https://yourapp.com/onboarding" }),
});
```

Build the `react`/`html` content on the server if you're calling `sendEmail` as a Server Action from a Client Component (e.g. a form or button click) — a `ReactElement` argument won't survive serialization across that boundary.

```ts
"use server";

async function sendWelcome(userEmail: string, userName: string) {
  return sendEmail({
    from: "Acme <no-reply@your-domain.com>",
    to: userEmail,
    subject: "Welcome!",
    react: WelcomeEmail({ recipientName: userName }),
  });
}
```

Cover multiple recipients, CC, BCC, tags, custom metadata, and an idempotency key to avoid duplicate sends on retry.

```ts
await sendEmail({
  from: "Acme <no-reply@your-domain.com>",
  to: ["a@example.com", "b@example.com"],
  cc: "manager@example.com",
  bcc: "audit@example.com",
  replyTo: "support@your-domain.com",
  subject: "Order update",
  html: "<p>Your order was updated.</p>",
  tags: [{ name: "category", value: "order_update" }],
  metadata: { orderId: "1234" },
  idempotencyKey: "order-1234-status-update",
});
```

Schedule an email for later using `scheduleEmail`, passing the ISO timestamp separately from the email options.

```ts
import { scheduleEmail } from "@/email/resend/actions";

await scheduleEmail(
  {
    from: "Acme <no-reply@your-domain.com>",
    to: "user@example.com",
    subject: "Reminder",
    text: "Don't forget your meeting tomorrow.",
  },
  "2026-08-01T09:00:00Z",
);
```

Cancel a scheduled email before it goes out, or push its send time back with `rescheduleEmail`. Both take the email id returned by the original send/schedule call.

```ts
import { cancelScheduledEmail, rescheduleEmail } from "@/email/resend/actions";

await cancelScheduledEmail("email_id_here");

await rescheduleEmail({ id: "email_id_here", scheduledAt: "2026-08-02T09:00:00Z" });
```

Every function in `actions.ts` returns a result object instead of throwing for expected errors (validation, rate limits, Resend API errors), so you can check `success` and branch on `error.type`.

```ts
const result = await sendEmail({
  from: "Acme <no-reply@your-domain.com>",
  to: "user@example.com",
  subject: "Hello",
  text: "Hi there.",
});

if (!result.success) {
  console.error(result.error.type, result.error.message);
}
```

If you'd rather have it throw — for example inside a `try/catch` in a Server Action — use `sendEmailOrThrow` from `service.ts` instead of `sendEmail` from `actions.ts`.

```ts
import { sendEmailOrThrow } from "@/email/resend/service";

try {
  await sendEmailOrThrow({
    from: "Acme <no-reply@your-domain.com>",
    to: "user@example.com",
    subject: "Hello",
    text: "Hi there.",
  });
} catch (err) {
  // err.message is already normalized
}
```

`resendEmail` and `getEmailStatus` are less common operations, so they don't have a dedicated Server Action — import them straight from `service.ts`. Note Resend has no native "resend" endpoint (this just re-sends the content) and no endpoint to list full send history (only lookup by id).

```ts
import { resendEmail, getEmailStatus } from "@/email/resend/service";

await resendEmail({
  originalEmailId: "original_email_id",
  from: "Acme <no-reply@your-domain.com>",
  to: "user@example.com",
  subject: "Re: Order update",
  html: "<p>Resending this in case you missed it.</p>",
});

const status = await getEmailStatus("email_id_here");
if (status.success) console.log(status.data.last_event); // "delivered", "bounced", etc.
```

Inside the webhook route (or anywhere else you process an already-verified event), use the `is*` type guards from `webhooks/handler.ts` if you prefer an explicit `if` over the `handlers` dispatch object.

```ts
import { verifyWebhookSignatureOrThrow, isBounced } from "@/email/resend/webhooks/handler";

const event = verifyWebhookSignatureOrThrow(payload, headers);

if (isBounced(event)) {
  // event.data.email_id, event.data.to, etc.
}
```