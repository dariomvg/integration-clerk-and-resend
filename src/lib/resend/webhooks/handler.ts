/**
 * webhooks/handler.ts
 * Signature verification logic (Svix) and event dispatch for Resend events.
 *
 * INTERNAL FILE — not imported from components. `webhooks/route.ts`
 * (in this same folder) is the only consumer: it's the exact content
 * that the CLI copies to `app/api/webhooks/resend/route.ts`.
 *
 * Resend signs its webhooks using Svix, that's why signature verification
 * uses the official `svix` package instead of reimplementing HMAC by hand —
 * it's the practice recommended by Resend's documentation.
 */

import "server-only";
import { Webhook } from "svix";
import { ENV_KEYS } from "../constants";
import { createEmailError } from "../validation";
import type { WebhookEvent, WebhookEventType, WebhookVerificationResult } from "../types";

/* -------------------------------------------------------------------------- */
/*                           Signature verification                           */
/* -------------------------------------------------------------------------- */

export interface SvixHeaders {
  "svix-id": string;
  "svix-timestamp": string;
  "svix-signature": string;
}

/**
 * Verifies the signature of a Resend webhook and returns the parsed event.
 *
 * `payload` must be the **raw body** (string) of the request, not parsed
 * to JSON beforehand: Svix validates the signature against the exact
 * text received.
 */
export function verifyWebhookSignature(payload: string, headers: SvixHeaders): WebhookVerificationResult {
  const secret = process.env[ENV_KEYS.RESEND_WEBHOOK_SECRET];

  if (!secret) {
    return { valid: false, error: `Missing environment variable ${ENV_KEYS.RESEND_WEBHOOK_SECRET}.` };
  }

  try {
    const webhook = new Webhook(secret);
    const event = webhook.verify(payload, headers) as unknown as WebhookEvent;
    return { valid: true, event };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid webhook signature.",
    };
  }
}

/** Same as `verifyWebhookSignature` but throws a normalized exception on failure. */
export function verifyWebhookSignatureOrThrow(payload: string, headers: SvixHeaders): WebhookEvent {
  const result = verifyWebhookSignature(payload, headers);

  if (!result.valid || !result.event) {
    throw createEmailError("webhook_signature_invalid", result.error ?? "Invalid webhook signature.");
  }

  return result.event;
}

/* -------------------------------------------------------------------------- */
/*                          Event type helpers                                */
/* -------------------------------------------------------------------------- */

export function isEventType<T extends WebhookEventType>(
  event: WebhookEvent,
  type: T,
): event is WebhookEvent & { type: T } {
  return event.type === type;
}

export const isDelivered = (event: WebhookEvent) => isEventType(event, "email.delivered");
export const isBounced = (event: WebhookEvent) => isEventType(event, "email.bounced");
export const isComplained = (event: WebhookEvent) => isEventType(event, "email.complained");
export const isDeliveryDelayed = (event: WebhookEvent) => isEventType(event, "email.delivery_delayed");
export const isOpened = (event: WebhookEvent) => isEventType(event, "email.opened");
export const isClicked = (event: WebhookEvent) => isEventType(event, "email.clicked");

/* -------------------------------------------------------------------------- */
/*                              Generic dispatcher                            */
/* -------------------------------------------------------------------------- */

export type WebhookHandlers = Partial<Record<WebhookEventType, (event: WebhookEvent) => void | Promise<void>>>;

/**
 * Dispatches an already verified event to the corresponding handler in `handlers`.
 * Meant to be used from `route.ts`:
 *
 * ```ts
 * await dispatchWebhookEvent(event, {
 *   "email.delivered": async (e) => markAsDelivered(e.data.email_id),
 *   "email.bounced": async (e) => markAsBounced(e.data.email_id),
 *   "email.complained": async (e) => suppressRecipient(e.data.to[0]),
 * });
 * ```
 */
export async function dispatchWebhookEvent(event: WebhookEvent, handlers: WebhookHandlers): Promise<void> {
  const handler = handlers[event.type];
  if (handler) await handler(event);
}