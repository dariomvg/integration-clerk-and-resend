/**
 * templates/base.tsx
 * Generic base template: heading + text + optional button. It can be used both
 * as a standalone email (for simple cases) and as a reference for building
 * more specific templates (welcome, invitation, notification).
 */

import { Button, Heading, Text } from "@react-email/components";
import { TransactionalLayout } from "./layouts/transactional";
import type { BaseTemplateProps } from "../types";

export interface BaseTemplateEmailProps extends BaseTemplateProps {
  previewText?: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function BaseTemplate({
  previewText,
  heading,
  body,
  ctaLabel,
  ctaUrl,
  recipientName,
  logoUrl,
}: BaseTemplateEmailProps) {
  return (
    <TransactionalLayout previewText={previewText} logoUrl={logoUrl}>
      <Heading style={styles.heading}>{heading}</Heading>
      <Text style={styles.text}>{recipientName ? `Hola ${recipientName},` : "Hola,"}</Text>
      <Text style={styles.text}>{body}</Text>
      {ctaUrl && ctaLabel ? (
        <Button href={ctaUrl} style={styles.button}>
          {ctaLabel}
        </Button>
      ) : null}
    </TransactionalLayout>
  );
}

export default BaseTemplate;

// Sample props for the `react-email dev` preview (see setup.md).

BaseTemplate.PreviewProps = {
  heading: "Título del email",
  body: "Este es el cuerpo del mensaje. Reemplazá este texto por tu contenido.",
  recipientName: "Juan",
  ctaLabel: "Ver más",
  ctaUrl: "https://example.com",
} satisfies BaseTemplateEmailProps;

export const styles = {
  heading: {
    fontSize: "20px",
    fontWeight: 700,
    margin: "0 0 16px",
  },
  text: {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#374151",
    margin: "0 0 16px",
  },
  button: {
    backgroundColor: "#111827",
    color: "#ffffff",
    borderRadius: "6px",
    padding: "10px 20px",
    fontSize: "14px",
    textDecoration: "none",
    display: "inline-block",
  },
} as const;
