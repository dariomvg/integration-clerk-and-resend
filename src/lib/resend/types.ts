/**
 * types.ts
 * Shared types for the Email (Resend) boilerplate.
 * No other file should redefine these types: everything imports from here.
 */

import type { ReactElement } from "react";

/* -------------------------------------------------------------------------- */
/*                                 Recipients                                 */
/* -------------------------------------------------------------------------- */

/** One or multiple recipients. Resend accepts string or string[] interchangeably. */
export type Recipient = string | string[];

/* -------------------------------------------------------------------------- */
/*                                    Tags                                    */
/* -------------------------------------------------------------------------- */

export interface EmailTag {
  name: string;
  value: string;
}

/* -------------------------------------------------------------------------- */
/*                                 Attachments                                */
/* -------------------------------------------------------------------------- */

export interface EmailAttachment {
  filename: string;
  /** Content as base64 or Buffer. */
  content: string | Buffer;
  /** Optional Content-Type (e.g. "application/pdf"). */
  contentType?: string;
  /** Use to attach by reference instead of inline content. */
  path?: string;
}

/* -------------------------------------------------------------------------- */
/*                                Send options                                */
/* -------------------------------------------------------------------------- */

/**
 * Base options for sending an email.
 * Exactly one of `text`, `html`, or `react` must be included.
 */
export interface BaseSendEmailOptions {
  from?: string;
  to: Recipient;
  cc?: Recipient;
  bcc?: Recipient;
  replyTo?: Recipient;
  subject: string;
  headers?: Record<string, string>;
  tags?: EmailTag[];
  attachments?: EmailAttachment[];
  /** Internal boilerplate metadata (not sent to Resend, tracing only). */
  metadata?: Record<string, unknown>;
  /** Idempotency key to avoid duplicate sends on retries. */
  idempotencyKey?: string;
  /** ISO 8601 or natural language expression ("in 1 hour") supported by Resend. */
  scheduledAt?: string;
}

export type SendEmailOptions =
  | (BaseSendEmailOptions & { text: string; html?: never; react?: never })
  | (BaseSendEmailOptions & { html: string; text?: never; react?: never })
  | (BaseSendEmailOptions & { react: ReactElement; text?: never; html?: never });

/* -------------------------------------------------------------------------- */
/*                                Send results                                */
/* -------------------------------------------------------------------------- */

export interface SendEmailResult {
  id: string;
}

export interface GetEmailResult {
  id: string;
  from: string;
  to: string[];
  cc?: string[] | null;
  bcc?: string[] | null;
  reply_to?: string[] | null;
  subject: string;
  html?: string | null;
  text?: string | null;
  tags?: EmailTag[] | null;
  created_at: string;
  last_event: EmailEventStatus;
  scheduled_at?: string | null;
}

export type EmailEventStatus =
  | "scheduled"
  | "queued"
  | "sent"
  | "delivered"
  | "delivery_delayed"
  | "bounced"
  | "complained"
  | "canceled";

/* -------------------------------------------------------------------------- */
/*                            Cancellation / Update                           */
/* -------------------------------------------------------------------------- */

export interface CancelEmailResult {
  id: string;
  object: "email";
}

export interface UpdateScheduledEmailOptions {
  id: string;
  scheduledAt: string;
}

/* -------------------------------------------------------------------------- */
/*                                   Resend                                   */
/* -------------------------------------------------------------------------- */

/**
 * Resending an email means: getting its original content (or whatever the
 * caller provides) and sending it again as a new send. There's no native
 * "resend" endpoint in the Resend API, which is why this type reuses
 * SendEmailOptions.
 */
export type ResendEmailOptions = SendEmailOptions & {
  /** Original email ID, tracing/metadata only. */
  originalEmailId?: string;
};

/* -------------------------------------------------------------------------- */
/*                                   Errors                                   */
/* -------------------------------------------------------------------------- */

export type EmailErrorType =
  | "validation_error"
  | "missing_api_key"
  | "invalid_from"
  | "invalid_recipient"
  | "rate_limit_exceeded"
  | "resend_api_error"
  | "webhook_signature_invalid"
  | "webhook_payload_invalid"
  | "unknown_error";

export interface NormalizedEmailError {
  type: EmailErrorType;
  message: string;
  statusCode?: number;
  /** Original Resend error or caught exception, for debugging. */
  cause?: unknown;
}

/* -------------------------------------------------------------------------- */
/*                             Webhooks (events)                              */
/* -------------------------------------------------------------------------- */

export type WebhookEventType =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.complained"
  | "email.bounced"
  | "email.opened"
  | "email.clicked"
  | "email.scheduled"
  | "email.canceled"
  | "email.failed";

export interface WebhookEventBase<T extends WebhookEventType = WebhookEventType> {
  type: T;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    [key: string]: unknown;
  };
}

export type WebhookEvent = WebhookEventBase;

export interface WebhookVerificationResult {
  valid: boolean;
  event?: WebhookEvent;
  error?: string;
}

/* -------------------------------------------------------------------------- */
/*                             Templates / Layouts                            */
/* -------------------------------------------------------------------------- */

/** Common props every global layout receives. */
export interface BaseLayoutProps {
  previewText?: string;
  children: React.ReactNode;
}

/** Common props every template (welcome, invitation, etc.) receives. */
export interface BaseTemplateProps {
  /** Name used to personalize the greeting. */
  recipientName?: string;
  /** Logo URL, overrides the default from constants.ts. */
  logoUrl?: string;
}