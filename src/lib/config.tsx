// lib/config.tsx

// ============================================================
// Site config
// ============================================================
export const siteConfig = {
  name: "Clerk/Resend",
  description: "Integration with Resend and Clerk.",
  githubUrl: "https://github.com/dariomvg",
  githubHandle: "/dariomvg",
};

// ============================================================
// Categories
// ============================================================
export type EbookCategory = "Business" | "English" | "Tech";

export const categories: EbookCategory[] = ["Business", "English", "Tech"];

// Mapea cada categoría a las variables de color ya definidas en globals.css.
// Nunca usar hex/hardcode acá: solo utilidades de Tailwind atadas al theme.
export const categoryStyles: Record<
  EbookCategory,
  { bg: string; fg: string; border: string }
> = {
  Business: {
    bg: "bg-primary",
    fg: "text-primary-foreground",
    border: "border-primary",
  },
  English: {
    bg: "bg-secondary",
    fg: "text-secondary-foreground",
    border: "border-secondary",
  },
  Tech: {
    bg: "bg-accent",
    fg: "text-accent-foreground",
    border: "border-accent",
  },
};

// ============================================================
// Ebooks metadata
// (el contenido real vive en content/ebooks/[slug].mdx)
// ============================================================
export interface EbookMetaEntry {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: EbookCategory;
}

export const ebooks = [
  {
    slug: "ai-developer-playbook",
    title: "The AI Developer Playbook",
    description:
      "A practical guide to using artificial intelligence to build, automate, and ship software faster.",
    date: "2026-09-02",
    category: "Tech",
  },
  {
    slug: "saas-launch",
    title: "30 Days to Launch Your First SaaS",
    description:
      "A step-by-step roadmap for validating an idea, building an MVP, and launching your first software business in just 30 days.",
    date: "2026-09-02",
    category: "English",
  },
  {
    slug: "technical-sales",
    title: "Sales for Technical Founders",
    description:
      "Learn practical sales skills to find customers, handle objections, and close your first deals without becoming a traditional salesperson.",
    date: "2026-09-02",
    category: "Business",
  },
  {
    slug: "english-developers",
    title: "English for Developers",
    description:
      "Build the vocabulary and communication skills needed to work confidently with technical teams, documentation, and international clients.",
    date: "2026-09-02",
    category: "English",
  },
  {
    slug: "startup-growth",
    title: "100 Growth Strategies for Startups",
    description:
      "A practical collection of marketing and growth strategies for early-stage startups looking to attract users and build momentum.",
    date: "2026-09-02",
    category: "Business",
  },
  {
    slug: "freelancer-agency",
    title: "From Freelancer to Agency",
    description:
      "A practical guide to building systems, finding better clients, and turning freelance work into a scalable service business.",
    date: "2026-09-02",
    category: "Tech",
  },
  {
    slug: "modern-nextjs",
    title: "Modern Next.js",
    description:
      "A practical guide to building fast, maintainable, and scalable web applications with modern Next.js patterns.",
    date: "2026-09-02",
    category: "Tech",
  },
  {
    slug: "personal-startup",
    title: "The Personal Startup",
    description:
      "A practical framework for treating your skills, time, and career like a business that compounds over time.",
    date: "2026-09-02",
    category: "English",
  },
  {
    slug: "startup-english",
    title: "Business English for Startups",
    description:
      "A practical guide to communicating clearly in meetings, presentations, negotiations, and international business conversations.",
    date: "2026-09-02",
    category: "English",
  },
  {
    slug: "first-100-customers",
    title: "The First 100 Customers",
    description:
      "A practical roadmap for finding, converting, and retaining the first 100 customers of a new business.",
    date: "2026-09-02",
    category: "Business",
  },
] as const satisfies EbookMetaEntry[];

export type EbookSlug = (typeof ebooks)[number]["slug"];

export function getEbookMeta(slug: string): EbookMetaEntry | undefined {
  return ebooks.find((ebook) => ebook.slug === slug);
}


export interface EbookResumeEntry {
  id: string;
  slug: EbookSlug;
  resume: string;
}

export const ebookResumes = [
  {
    id: "1",
    slug: "ai-developer-playbook",
    resume:
      "This guide explores how artificial intelligence can become a practical tool for software developers, from generating code and writing documentation to debugging and refactoring. It explains how to write better prompts, integrate AI into real development workflows, and maintain human judgment when making technical, security, and quality decisions.",
  },
  {
    id: "2",
    slug: "saas-launch",
    resume:
      "A practical 30-day roadmap for turning an idea into a launched SaaS product. It walks through validating a real problem, building a focused MVP, implementing authentication and payments, preparing a landing page, gathering beta users, and using post-launch metrics to learn and improve quickly.",
  },
  {
    id: "3",
    slug: "technical-sales",
    resume:
      "Designed for developers and technical founders with little sales experience, this guide teaches how to find customers, run discovery conversations, communicate value instead of features, handle objections, discuss pricing with confidence, and build a repeatable sales process that creates long-term relationships.",
  },
  {
    id: "4",
    slug: "english-developers",
    resume:
      "A practical guide to improving the English developers use every day. It covers technical vocabulary, reading documentation, writing pull requests, participating in code reviews, communicating with remote teams, and discussing technical ideas clearly, while providing a simple routine for building confidence through consistent practice.",
  },
  {
    id: "5",
    slug: "startup-growth",
    resume:
      "A collection of practical growth strategies covering content marketing, SEO, communities, referrals, partnerships, email marketing, social media, and product-led growth. Rather than promising a single formula, it encourages continuous experimentation, measurement, and iteration to build a sustainable customer acquisition system.",
  },
  {
    id: "6",
    slug: "freelancer-agency",
    resume:
      "This guide explains how to transition from freelance work to building a scalable agency. It covers specialization, productized services, delivery processes, hiring, pricing, documentation, client retention, and creating systems that allow the business to grow beyond the founder's individual capacity.",
  },
  {
    id: "7",
    slug: "modern-nextjs",
    resume:
      "A practical guide to building fast, scalable, and maintainable applications with modern Next.js. It explores project architecture, Server Components, Server Actions, authentication, data access patterns, performance optimization, testing, deployment, and the organizational practices that help applications remain manageable as they grow.",
  },
  {
    id: "8",
    slug: "personal-startup",
    resume:
      "This book encourages readers to treat their career like a long-term startup. It explains how to combine complementary skills, build compounding advantages, create public proof of expertise through projects, develop productive systems, strengthen professional relationships, and make decisions that expand future opportunities.",
  },
  {
    id: "9",
    slug: "startup-english",
    resume:
      "Focused on professional communication in international startup environments, this guide teaches how to introduce yourself, explain a business, participate in meetings, give presentations, negotiate, write professional emails, network effectively, and communicate clearly using simple, natural business English.",
  },
  {
    id: "10",
    slug: "first-100-customers",
    resume:
      "A practical roadmap for acquiring the first hundred customers of a new business. It explains how to define an ideal customer, validate real problems, start meaningful conversations, create a compelling offer, build social proof, improve conversion rates, develop a simple sales pipeline, and turn early customer feedback into a repeatable growth system.",
  },
] as const satisfies EbookResumeEntry[];

export function getEbookResume(slug: string): EbookResumeEntry | undefined {
  return ebookResumes.find((entry) => entry.slug === slug);
}
