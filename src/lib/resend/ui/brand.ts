/**
 * brand.ts
 * Config de contenido/diseño para templates y layouts (no es config técnica
 * de infraestructura, por eso vive separada de constants.ts).
 *
 * Único lugar para personalizar marca: editá estos valores y se reflejan en
 * todos los templates y layouts sin tocar su lógica.
 */

export const BRAND = {
  companyName: "Acme Inc.",
  logoUrl: "https://example.com/logo.png",
  supportEmail: "support@example.com",
  primaryColor: "#111827",
  footerAddress: "Acme Inc., 123 Main St, Buenos Aires, Argentina",
} as const;