/**
 * layouts/transactional.tsx
 * A variation of the default layout for transactional emails (welcome,
 * invitation, notification, status reset, etc.). Minimalist footer,
 * without an unsubscribe link.
 */

import { Layout } from "./default";
import type { BaseLayoutProps } from "../../types";

export function TransactionalLayout(props: BaseLayoutProps & { logoUrl?: string }) {
  return <Layout {...props} variant="transactional" />;
}
