/**
 * layouts/marketing.tsx
 * A variant of the default layout for marketing emails and newsletters.
 * Adds an unsubscribe link to the footer (required by
 * regulations such as CAN-SPAM).
 */

import { Layout } from "./default";
import type { BaseLayoutProps } from "../../types";

export function MarketingLayout(props: BaseLayoutProps & { logoUrl?: string }) {
  return <Layout {...props} variant="marketing" />;
}
