/**
 * layouts/default.tsx
 * Base layout shared by all templates: defines the common header and
 * footer. The `transactional.tsx` and `marketing.tsx` layouts are
 * slight variations of this one, so the header and footer are written only once.
 */

import { Body, Container, Head, Hr, Html, Img, Preview, Section, Text } from "@react-email/components";
import { BRAND } from "../brand";
import type { BaseLayoutProps } from "../../types";

export type LayoutVariant = "transactional" | "marketing";

interface LayoutProps extends BaseLayoutProps {
  variant?: LayoutVariant;
  /** Sobreescribe el logo por default de BRAND para un email puntual. */
  logoUrl?: string;
}

export function Layout({ previewText, children, variant = "transactional", logoUrl }: LayoutProps) {
  return (
    <Html>
      <Head />
      {previewText ? <Preview>{previewText}</Preview> : null}
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Header logoUrl={logoUrl} />
          <Section>{children}</Section>
          <Hr style={styles.hr} />
          <Footer variant={variant} />
        </Container>
      </Body>
    </Html>
  );
}

function Header({ logoUrl }: { logoUrl?: string }) {
  return (
    <Section style={styles.header}>
      <Img src={logoUrl ?? BRAND.logoUrl} alt={BRAND.companyName} width="120" style={styles.logo} />
    </Section>
  );
}

function Footer({ variant }: { variant: LayoutVariant }) {
  return (
    <Section>
      <Text style={styles.footerText}>{BRAND.footerAddress}</Text>
      <Text style={styles.footerText}>¿Dudas? Escribinos a {BRAND.supportEmail}</Text>
      {variant === "marketing" ? (
        <Text style={styles.footerText}>
          Si no querés recibir más estos emails, podés darte de baja en cualquier momento.
        </Text>
      ) : null}
    </Section>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f6f6",
    fontFamily: "Helvetica, Arial, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "32px 24px",
    maxWidth: "480px",
    borderRadius: "8px",
  },
  header: {
    marginBottom: "16px",
  },
  logo: {
    display: "block",
  },
  hr: {
    borderColor: "#e5e7eb",
    margin: "24px 0",
  },
  footerText: {
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 4px",
  },
} as const;
