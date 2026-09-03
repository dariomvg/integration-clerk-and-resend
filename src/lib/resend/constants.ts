/**
 * constants.ts
 * Technical configuration and default values for the Email (Resend)
 * boilerplate. The only place where these values live: service.ts,
 * webhooks/, and validation.ts must import from here, never hardcode.
 *
 * Content/design config (brand, logo, colors) lives in `brand.ts`, not
 * here — this is infrastructure config only.
 */

/* -------------------------------------------------------------------------- */
/*                              Env var names                                 */
/* -------------------------------------------------------------------------- */

export const ENV_KEYS = {
  RESEND_API_KEY: "RESEND_API_KEY",
  RESEND_WEBHOOK_SECRET: "RESEND_WEBHOOK_SECRET",
  EMAIL_FROM_DEFAULT: "EMAIL_FROM_DEFAULT",
  EMAIL_REPLY_TO_DEFAULT: "EMAIL_REPLY_TO_DEFAULT",
} as const;

/* -------------------------------------------------------------------------- */
/*                             Send defaults                                  */
/* -------------------------------------------------------------------------- */

/**
 * Default sender if `from` is not specified on the send.
 * Must be a verified domain in Resend.
 */
export const DEFAULT_FROM_EMAIL =
  process.env[ENV_KEYS.EMAIL_FROM_DEFAULT] ?? "onboarding@resend.dev";

/** Default Reply-To, optional. */
export const DEFAULT_REPLY_TO = process.env[ENV_KEYS.EMAIL_REPLY_TO_DEFAULT];

/** Tag automatically added to every email sent by this boilerplate. */
export const DEFAULT_SOURCE_TAG = { name: "source", value: "email-boilerplate" };

/* -------------------------------------------------------------------------- */
/*                          Limits (imposed by Resend)                        */
/* -------------------------------------------------------------------------- */

export const LIMITS = {
  /** Maximum combined recipients (to + cc + bcc) per email. */
  MAX_RECIPIENTS_PER_FIELD: 50,
  /** Maximum total attachments size, in MB. */
  MAX_ATTACHMENTS_SIZE_MB: 40,
  /** Maximum emails per batch request (not covered in v1 of this boilerplate). */
  MAX_BATCH_SIZE: 100,
} as const;

/* -------------------------------------------------------------------------- */
/*                                  Webhooks                                  */
/* -------------------------------------------------------------------------- */

export const WEBHOOK_CONFIG = {
  /** Clock tolerance (seconds) when validating the Svix timestamp. */
  TIMESTAMP_TOLERANCE_SECONDS: 300,
  /** Events this boilerplate processes by default in the webhooks.ts helpers. */
  HANDLED_EVENTS: [
    "email.sent",
    "email.delivered",
    "email.delivery_delayed",
    "email.complained",
    "email.bounced",
    "email.opened",
    "email.clicked",
    "email.scheduled",
    "email.canceled",
    "email.failed",
  ] as const,
} as const;

/* -------------------------------------------------------------------------- */
/*                              Retries / timeouts                            */
/* -------------------------------------------------------------------------- */

export const RETRY_CONFIG = {
  /** Retries on 429 error (rate limit) from the Resend API. */
  MAX_RETRIES: 2,
  /** Base backoff in ms (multiplied exponentially per attempt). */
  BASE_DELAY_MS: 500,
} as const;