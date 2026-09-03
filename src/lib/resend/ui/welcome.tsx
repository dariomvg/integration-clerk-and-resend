/**
 * templates/welcome.tsx
 * Welcome email. A thin layer on top of BaseTemplate: it only defines the
 * specific content; all structure and styles come from base.tsx.
 */

import { BaseTemplate } from "./base";
import type { BaseTemplateProps } from "../types";

export interface WelcomeEmailProps extends BaseTemplateProps {
  previewText?: string;
  /** URL a la que lleva el botón "Comenzar". Si no se pasa, no se muestra botón. */
  ctaUrl?: string;
}

export function WelcomeEmail({ recipientName, ctaUrl, previewText, logoUrl }: WelcomeEmailProps) {
  return (
    <BaseTemplate
      previewText={previewText ?? "¡Welcome aboard!"}
      heading="¡Welcome!"
      body="Thanks for joining. You can start using your account anytime."
      ctaLabel={ctaUrl ? "Get Started" : undefined}
      ctaUrl={ctaUrl}
      recipientName={recipientName}
      logoUrl={logoUrl}
    />
  );
}

export default WelcomeEmail;

WelcomeEmail.PreviewProps = {
  recipientName: "Juan",
  ctaUrl: "https://example.com/get-started",
} satisfies WelcomeEmailProps;
