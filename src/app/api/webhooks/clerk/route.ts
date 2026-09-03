// webhooks/route.ts
// Destination: app/api/webhooks/clerk/route.ts — the CLI copies this file
// there directly, no manual re-export or edits needed.
//
// This qualifies for its own route.ts under the 3-reason rule: Clerk calls
// THIS app (a third-party webhook), so it must be a real HTTP endpoint —
// it cannot be a Server Action.
//
// Verifies and handles Clerk's webhook events using `verifyWebhook`, Clerk's
// official helper (wraps svix signature verification internally) — the
// approach documented in Clerk's own webhooks guide, instead of validating
// signatures by hand.

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sendWelcome } from "@/lib/resend/actions";

export async function POST(req: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    event = await verifyWebhook(req);
  } catch (err) {
    console.error("[clerk webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const userId = event.data.id;
  const email = event.data.email_addresses[0]?.email_address;

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, { publicMetadata: { role: "user" } });

    if (email) {
      await sendWelcome(email, event.data.first_name || "there");
    }
  } catch (err) {
    console.error("[clerk webhook] failed on user.created:", err);
  }
  break;
    }

    case "user.deleted": {
      // Extension point: if this app later adds its own database, delete or
      // anonymize any rows tied to `event.data.id` here.
      break;
    }

    default:
      // Other event types (session.*, organization.*, etc.) are intentionally
      // ignored by this boilerplate. Add cases here as the app needs them.
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}