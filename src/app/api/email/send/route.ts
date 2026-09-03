/**
 * EXACT content for: app/api/webhooks/resend/route.ts
 *
 * The CLI copies this file directly to that path — it doesn't require
 * re-export or manual editing of plumbing, imports, or signature
 * verification. The only place meant for the consumer to edit is the
 * `handlers` object below (marked with TODO), where their own business
 * logic goes.
 *
 * Optional submodule: only generated if the user chooses to receive
 * Resend events (delivered, bounced, complained, etc.) when creating
 * the project.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  dispatchWebhookEvent,
  verifyWebhookSignature,
  type SvixHeaders,
  type WebhookHandlers,
} from "@/lib/resend/webhooks/handler";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const headers: SvixHeaders = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  const verification = verifyWebhookSignature(payload, headers);

  if (!verification.valid || !verification.event) {
    return NextResponse.json(
      { error: { type: "webhook_signature_invalid", message: verification.error } },
      { status: 401 },
    );
  }

  // TODO: customize what to do with each event (save to your database,
  // mark a recipient as invalid after a bounce, etc.)
  const handlers: WebhookHandlers = {
    "email.delivered": (event) => {
      console.log("Email delivered:", event.data.email_id);
    },
    "email.bounced": (event) => {
      console.warn("Email bounced:", event.data.email_id);
    },
    "email.complained": (event) => {
      console.warn("Recipient marked as spam:", event.data.email_id);
    },
  };

  await dispatchWebhookEvent(verification.event, handlers);

  return NextResponse.json({ received: true }, { status: 200 });
}