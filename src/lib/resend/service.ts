/**
 * service.ts
 * Resend client and all the raw send/schedule/cancel logic against the
 * Resend SDK.
 *
 * INTERNAL FILE — not imported from components or Server Actions in your
 * app. The public API for that is `actions.ts` (sendEmail, scheduleEmail,
 * cancelScheduledEmail, rescheduleEmail). `resendEmail` and
 * `getEmailStatus` are left here only as advanced utilities, without a
 * wrapper in actions.ts; import them directly from `service.ts` if you
 * need them.
 *
 * "server-only" ensures at build time that this module is never
 * accidentally included in a client bundle (official Next.js practice
 * for code that uses secrets like RESEND_API_KEY).
 */

import "server-only";
import { Resend } from "resend";
import { DEFAULT_FROM_EMAIL, DEFAULT_REPLY_TO, DEFAULT_SOURCE_TAG, ENV_KEYS, RETRY_CONFIG } from "./constants";
import { normalizeResendError, validateSendEmailOptions } from "./validation";
import type {
  CancelEmailResult,
  GetEmailResult,
  NormalizedEmailError,
  ResendEmailOptions,
  SendEmailOptions,
  SendEmailResult,
  UpdateScheduledEmailOptions,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                              Client (singleton)                            */
/* -------------------------------------------------------------------------- */

let client: Resend | null = null;

/**
 * Returns the singleton instance of the Resend client.
 * Created lazily so it doesn't fail at import time (e.g. when running
 * `next build` without the env var set in the build environment).
 */
export function getResendClient(): Resend {
  const apiKey = process.env[ENV_KEYS.RESEND_API_KEY];

  if (!apiKey) {
    throw buildError(
      normalizeAsError({
        type: "missing_api_key",
        message: `Missing environment variable ${ENV_KEYS.RESEND_API_KEY}.`,
      }),
    );
  }

  if (!client) {
    client = new Resend(apiKey);
  }

  return client;
}

/* -------------------------------------------------------------------------- */
/*                          Result with typed error                           */
/* -------------------------------------------------------------------------- */

/**
 * Instead of throwing exceptions for expected errors (validation, rate
 * limit, etc.), the send functions return a discriminated result.
 * The caller decides whether to `throw` (see `sendEmailOrThrow`) or
 * handle the error in UI/logs.
 */
export type EmailActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: NormalizedEmailError };

function normalizeAsError(error: NormalizedEmailError): NormalizedEmailError {
  return error;
}

function buildError(error: NormalizedEmailError): Error {
  const err = new Error(error.message);
  (err as Error & { normalized?: NormalizedEmailError }).normalized = error;
  return err;
}

/* -------------------------------------------------------------------------- */
/*                                   Retry                                    */
/* -------------------------------------------------------------------------- */

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let attempt = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (error) {
      const normalized = normalizeResendError(error);

      if (normalized.type !== "rate_limit_exceeded" || attempt >= RETRY_CONFIG.MAX_RETRIES) {
        throw error;
      }

      const delay = RETRY_CONFIG.BASE_DELAY_MS * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                              Apply defaults                                */
/* -------------------------------------------------------------------------- */

function withDefaults(options: SendEmailOptions): SendEmailOptions {
  return {
    ...options,
    from: options.from ?? DEFAULT_FROM_EMAIL,
    replyTo: options.replyTo ?? DEFAULT_REPLY_TO,
    tags: [...(options.tags ?? []), DEFAULT_SOURCE_TAG],
  };
}

/* -------------------------------------------------------------------------- */
/*                                Sending emails                              */
/* -------------------------------------------------------------------------- */

/**
 * Main send function. Covers plain text, HTML, and React (depending on
 * which field comes in `options`), immediate or scheduled sending (if
 * `scheduledAt` is passed), multiple recipients, CC, BCC, tags, metadata,
 * and idempotency key.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailActionResult<SendEmailResult>> {
  const merged = withDefaults(options);
  const validationError = validateSendEmailOptions(merged);

  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const resend = getResendClient();

    const result = await withRetry(() =>
      resend.emails.send(
        {
          from: merged.from,
          to: merged.to,
          cc: merged.cc,
          bcc: merged.bcc,
          replyTo: merged.replyTo,
          subject: merged.subject,
          headers: merged.headers,
          tags: merged.tags,
          attachments: merged.attachments,
          scheduledAt: merged.scheduledAt,
          text: merged.text,
          html: merged.html,
          react: merged.react,
        } as Parameters<Resend["emails"]["send"]>[0],
        merged.idempotencyKey ? { idempotencyKey: merged.idempotencyKey } : undefined,
      ),
    );

    if (result.error) {
      return { success: false, error: normalizeResendError(result.error) };
    }

    return { success: true, data: { id: result.data!.id } };
  } catch (error) {
    return { success: false, error: normalizeResendError(error) };
  }
}

/** Variant that throws instead of returning a discriminated result. Useful in Server Actions. */
export async function sendEmailOrThrow(options: SendEmailOptions): Promise<SendEmailResult> {
  const result = await sendEmail(options);
  if (!result.success) throw buildError(result.error);
  return result.data;
}

/**
 * Scheduled send. It's an explicit alias for `sendEmail` with
 * `scheduledAt` required, to make the intent clear in the caller's code.
 */
export async function scheduleEmail(
  options: Omit<SendEmailOptions, "scheduledAt">,
  scheduledAt: string,
): Promise<EmailActionResult<SendEmailResult>> {
  return sendEmail({ ...options, scheduledAt } as SendEmailOptions);
}

/**
 * Resending an email. Resend doesn't expose a native "resend" endpoint:
 * the official way is to call `emails.send` again with the same content.
 * This function is a semantic alias of `sendEmail` to make that explicit.
 */
export async function resendEmail(options: ResendEmailOptions): Promise<EmailActionResult<SendEmailResult>> {
  const { originalEmailId, ...sendOptions } = options;
  return sendEmail({
    ...sendOptions,
    metadata: { ...sendOptions.metadata, originalEmailId },
  } as SendEmailOptions);
}

/* -------------------------------------------------------------------------- */
/*                         Cancellation / rescheduling                        */
/* -------------------------------------------------------------------------- */

export async function cancelScheduledEmail(id: string): Promise<EmailActionResult<CancelEmailResult>> {
  try {
    const resend = getResendClient();
    const result = await resend.emails.cancel(id);

    if (result.error) {
      return { success: false, error: normalizeResendError(result.error) };
    }

    return { success: true, data: result.data as CancelEmailResult };
  } catch (error) {
    return { success: false, error: normalizeResendError(error) };
  }
}

export async function rescheduleEmail(
  options: UpdateScheduledEmailOptions,
): Promise<EmailActionResult<{ id: string }>> {
  try {
    const resend = getResendClient();
    const result = await resend.emails.update({ id: options.id, scheduledAt: options.scheduledAt });

    if (result.error) {
      return { success: false, error: normalizeResendError(result.error) };
    }

    return { success: true, data: { id: result.data!.id } };
  } catch (error) {
    return { success: false, error: normalizeResendError(error) };
  }
}

/* -------------------------------------------------------------------------- */
/*                              Status of a send                              */
/* -------------------------------------------------------------------------- */

/**
 * Gets the status/details of an email by id.
 *
 * Note: Resend doesn't expose an endpoint to list the full send history;
 * it only allows querying by id. To have a browsable "send history" in
 * your app, persist the events that arrive via webhook (see webhooks.ts)
 * in your own database.
 */
export async function getEmailStatus(id: string): Promise<EmailActionResult<GetEmailResult>> {
  try {
    const resend = getResendClient();
    const result = await resend.emails.get(id);

    if (result.error) {
      return { success: false, error: normalizeResendError(result.error) };
    }

    return { success: true, data: result.data as unknown as GetEmailResult };
  } catch (error) {
    return { success: false, error: normalizeResendError(error) };
  }
}