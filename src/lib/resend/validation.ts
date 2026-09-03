/**
 * validation.ts
 * Runtime validations and error normalization.
 *
 * Important: the types in types.ts guarantee correct shape at compile
 * time, but any data coming from a Route Handler (JSON from a request)
 * never went through the compiler. That's why server.ts and route.ts must
 * always pass send options through `validateSendEmailOptions` before
 * calling Resend.
 */

import { LIMITS } from "./constants";
import type {
  EmailAttachment,
  NormalizedEmailError,
  Recipient,
  SendEmailOptions,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                                Error helper                                */
/* -------------------------------------------------------------------------- */

export function createEmailError(
  type: NormalizedEmailError["type"],
  message: string,
  extra?: Partial<Pick<NormalizedEmailError, "statusCode" | "cause">>,
): NormalizedEmailError {
  return { type, message, ...extra };
}

/* -------------------------------------------------------------------------- */
/*                              Email validation                              */
/* -------------------------------------------------------------------------- */

/** Pragmatic regex (not full RFC 5322) good enough to validate user input. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Extracts the address from a string like `"Name <email@domain.com>"`.
 * If it doesn't match that format, returns the string as-is.
 */
export function extractEmailAddress(input: string): string {
  const match = input.match(/<([^>]+)>/);
  return match ? match[1].trim() : input.trim();
}

export function isValidEmailAddress(input: string): boolean {
  return EMAIL_REGEX.test(extractEmailAddress(input));
}

/* -------------------------------------------------------------------------- */
/*                          Recipient normalization                           */
/* -------------------------------------------------------------------------- */

export function normalizeRecipients(recipient: Recipient): string[] {
  return Array.isArray(recipient) ? recipient : [recipient];
}

export function validateRecipients(
  recipient: Recipient | undefined,
  fieldName: "to" | "cc" | "bcc" | "replyTo",
): NormalizedEmailError | null {
  if (recipient === undefined) return null;

  const list = normalizeRecipients(recipient);

  if (list.length === 0) {
    return createEmailError("invalid_recipient", `The "${fieldName}" field can't be empty.`);
  }

  if (list.length > LIMITS.MAX_RECIPIENTS_PER_FIELD) {
    return createEmailError(
      "invalid_recipient",
      `The "${fieldName}" field exceeds the maximum of ${LIMITS.MAX_RECIPIENTS_PER_FIELD} recipients.`,
    );
  }

  const invalid = list.find((email) => !isValidEmailAddress(email));
  if (invalid) {
    return createEmailError(
      "invalid_recipient",
      `"${invalid}" is not a valid email address in the "${fieldName}" field.`,
    );
  }

  return null;
}

export function validateFrom(from: string | undefined): NormalizedEmailError | null {
  if (!from || !isValidEmailAddress(from)) {
    return createEmailError("invalid_from", `"${from}" is not a valid sender.`);
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*                            Attachment validation                           */
/* -------------------------------------------------------------------------- */

export function validateAttachments(
  attachments: EmailAttachment[] | undefined,
): NormalizedEmailError | null {
  if (!attachments || attachments.length === 0) return null;

  const totalBytes = attachments.reduce((sum, att) => {
    const size = typeof att.content === "string" ? Buffer.byteLength(att.content, "base64") : att.content.length;
    return sum + size;
  }, 0);

  const totalMB = totalBytes / (1024 * 1024);

  if (totalMB > LIMITS.MAX_ATTACHMENTS_SIZE_MB) {
    return createEmailError(
      "validation_error",
      `Attachments exceed the ${LIMITS.MAX_ATTACHMENTS_SIZE_MB}MB maximum allowed by Resend.`,
    );
  }

  const missingFilename = attachments.find((att) => !att.filename);
  if (missingFilename) {
    return createEmailError("validation_error", "Every attachment must have a `filename`.");
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                    Content validation (text/html/react)                    */
/* -------------------------------------------------------------------------- */

export function validateContentPresence(
  options: Pick<SendEmailOptions, "text" | "html" | "react">,
): NormalizedEmailError | null {
  const provided = [options.text, options.html, options.react].filter(
    (value) => value !== undefined,
  );

  if (provided.length === 0) {
    return createEmailError(
      "validation_error",
      'Exactly one of "text", "html", or "react" must be specified.',
    );
  }

  if (provided.length > 1) {
    return createEmailError(
      "validation_error",
      'Only one of "text", "html", or "react" can be specified, not several at once.',
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                      Aggregate validation of a send                        */
/* -------------------------------------------------------------------------- */

/**
 * Runs all validations on a `SendEmailOptions`.
 * Returns the first error found, or `null` if everything is valid.
 * This is the function `server.ts` must call before invoking Resend.
 */
export function validateSendEmailOptions(options: SendEmailOptions): NormalizedEmailError | null {
  if (!options.subject || options.subject.trim().length === 0) {
    return createEmailError("validation_error", "The \"subject\" field is required.");
  }

  return (
    validateFrom(options.from) ??
    validateRecipients(options.to, "to") ??
    validateRecipients(options.cc, "cc") ??
    validateRecipients(options.bcc, "bcc") ??
    validateRecipients(options.replyTo, "replyTo") ??
    validateContentPresence(options) ??
    validateAttachments(options.attachments) ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/*                         Resend error normalization                         */
/* -------------------------------------------------------------------------- */

/**
 * Converts any error (from the Resend SDK, from fetch, or a generic
 * exception) into a `NormalizedEmailError` consistent across the app.
 */
export function normalizeResendError(error: unknown): NormalizedEmailError {
  // Errors returned by the official Resend SDK have the shape { name, message, statusCode }.
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const err = error as { message: string; name?: string; statusCode?: number };

    if (err.statusCode === 429) {
      return createEmailError("rate_limit_exceeded", err.message, {
        statusCode: 429,
        cause: error,
      });
    }

    if (err.name === "validation_error" || err.statusCode === 422) {
      return createEmailError("validation_error", err.message, {
        statusCode: err.statusCode,
        cause: error,
      });
    }

    if (err.name === "missing_api_key" || err.statusCode === 401) {
      return createEmailError("missing_api_key", err.message, {
        statusCode: err.statusCode,
        cause: error,
      });
    }

    return createEmailError("resend_api_error", err.message, {
      statusCode: err.statusCode,
      cause: error,
    });
  }

  return createEmailError("unknown_error", "An unknown error occurred while sending the email.", {
    cause: error,
  });
}