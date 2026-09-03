/**
 * templates/invitation.tsx
 * Invitation email (e.g., inviting a user to a team/workspace).
 * A thin layer built on top of BaseTemplate, just like welcome.tsx.
 */

import { BaseTemplate } from "./base";
import type { BaseTemplateProps } from "../types";

export interface InvitationEmailProps extends BaseTemplateProps {
  previewText?: string;
  /** Who is sending the invitation. */
  inviterName: string;
  /** What the invitation is for (team, workspace, project).  */
  teamName: string;
  /** URL to accept the invitation. */
  inviteUrl: string;
}

export function InvitationEmail({
  recipientName,
  inviterName,
  teamName,
  inviteUrl,
  previewText,
  logoUrl,
}: InvitationEmailProps) {
  return (
    <BaseTemplate
      previewText={previewText ?? `${inviterName} te invitó a ${teamName}`}
      heading={`sharing you ${teamName}`}
      body={`${inviterName} te invitó a formar parte de ${teamName}. Aceptá la invitación para empezar.`}
      ctaLabel="Aceptar invitación"
      ctaUrl={inviteUrl}
      recipientName={recipientName}
      logoUrl={logoUrl}
    />
  );
}

export default InvitationEmail;

InvitationEmail.PreviewProps = {
  recipientName: "Juan",
  inviterName: "María",
  teamName: "Equipo de Diseño",
  inviteUrl: "https://example.com/invite/abc123",
} satisfies InvitationEmailProps;
