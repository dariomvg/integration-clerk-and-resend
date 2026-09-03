/**
 * templates/notification.tsx
 * Generic notification (e.g., “Your payment was processed,” “New comment”).
 * A thin wrapper around BaseTemplate, just like welcome.tsx and invitation.tsx.
 */

import { BaseTemplate } from "./base";
import type { BaseTemplateProps } from "../types";

export interface NotificationEmailProps extends BaseTemplateProps {
  previewText?: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export function NotificationEmail({
  recipientName,
  title,
  message,
  actionUrl,
  actionLabel,
  previewText,
  logoUrl,
}: NotificationEmailProps) {
  return (
    <BaseTemplate
      previewText={previewText ?? title}
      heading={title}
      body={message}
      ctaLabel={actionUrl ? actionLabel ?? "View ebook" : undefined}
      ctaUrl={actionUrl}
      recipientName={recipientName}
      logoUrl={logoUrl}
    />
  );
}

export default NotificationEmail;

NotificationEmail.PreviewProps = {
  recipientName: "Juan",
  title: "Your payment has been processed",
  message: "We received your payment of $49.00. You can view the receipt in your account.",
  actionUrl: "https://example.com/billing",
  actionLabel: "View receipt",
} satisfies NotificationEmailProps;
