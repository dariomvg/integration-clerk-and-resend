"use server";

/**
 * actions.ts
 * Public API of the module for Server Components, forms, and Client
 * Component buttons. Wraps `service.ts` (internal) — don't call
 * `service.ts` directly from your app, use these functions instead.
 *
 * Covers the core flow: send (immediate or scheduled), cancel, and
 * reschedule. `resendEmail` and `getEmailStatus` are advanced utilities
 * and are left without a wrapper here — import them directly from
 * `./service` if you need them.
 *
 * Note about `react` (React Email/JSX): passing a ReactElement works
 * fine when you call these functions directly from a Server Component.
 * If instead you invoke them as a Server Action from a Client Component
 * (e.g. `onClick` or `<form action={...}>`), the argument crosses the
 * client→server boundary serialized, and a ReactElement doesn't
 * serialize well. In that case, build the content (`react`/`html`) on
 * the server side inside the Server Action itself, don't receive it as
 * a parameter from the client.
 */

import * as service from "./service";
import type {
  CancelEmailResult,
  SendEmailOptions,
  SendEmailResult,
  UpdateScheduledEmailOptions,
} from "./types";
import type { EmailActionResult } from "./service";


export async function sendEmail(options: SendEmailOptions): Promise<EmailActionResult<SendEmailResult>> {
  return service.sendEmail(options);
}

export async function scheduleEmail(
  options: Omit<SendEmailOptions, "scheduledAt">,
  scheduledAt: string,
): Promise<EmailActionResult<SendEmailResult>> {
  return service.scheduleEmail(options, scheduledAt);
}

export async function cancelScheduledEmail(id: string): Promise<EmailActionResult<CancelEmailResult>> {
  return service.cancelScheduledEmail(id);
}

export async function rescheduleEmail(
  options: UpdateScheduledEmailOptions,
): Promise<EmailActionResult<{ id: string }>> {
  return service.rescheduleEmail(options);
}

import { WelcomeEmail } from "./ui/welcome";
export async function sendWelcome(userEmail: string, userName: string) {
  return sendEmail({
    from: process.env.EMAIL_FROM_DEFAULT || "",
    to: userEmail,
    subject: "Welcome",
    react: WelcomeEmail({ recipientName: userName }),
  });
}

import { NotificationEmail } from "./ui/notification";

export async function sendInvitation(userEmail: string, userName: string, actionUrl: string, message: string, title: string) {
  return sendEmail({
    to: userEmail,
    subject: "Sharing you a ebook",
    react: NotificationEmail({ 
      recipientName: userName, 
      title,
      message,
      actionUrl
    }),
  });
}