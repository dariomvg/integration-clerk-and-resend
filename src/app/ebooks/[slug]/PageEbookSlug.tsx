// components/page-ebook-slug.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Button } from "@/components/ui/button";
import { DialogGetResume } from "@/components/sections/dialog-get-resume";
import { DialogShareEbook } from "@/components/sections/dialog-share-ebook";
import { getEbookBySlug } from "@/lib/ebooks";
import { getEbookMeta } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Show } from "@clerk/nextjs";

export async function PageEbookSlug({ slug }: { slug: string }) {
  const ebook = getEbookMeta(slug);
  const post = getEbookBySlug(slug);

  return (
    <>
      <header className="sticky top-0 z-50 border-b-4 border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 px-4 sm:px-6 lg:h-20">
          <Button variant="ghost" size="sm">
            <Link href="/#ebooks" className="flex items-center gap-2">
              <ArrowLeft />
              Back
            </Link>
          </Button>

          {/* TODO (Dari): envolver este contenedor con <SignedIn> de Clerk.
              "Get resume" y "Share" solo deben verse con sesión iniciada;
              sin login, no se renderiza nada acá. */}
              <Show when="signed-in">
                <div className="flex items-center gap-2">
            <DialogGetResume slug={slug} title={ebook?.title ?? ""} />
            <DialogShareEbook slug={slug} title={ebook?.title ?? ""} />
          </div>
              </Show>
          
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <article
          className={cn(
            "prose prose-neutral dark:prose-invert max-w-none",
            "prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-(--letter-spacing-tight)",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            "prose-strong:text-foreground",
            "prose-code:rounded prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5",
            "prose-code:font-mono prose-code:text-sm prose-code:text-primary",
            "prose-code:before:content-none prose-code:after:content-none",
            "prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-card",
            "prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground",
            "prose-hr:border-border"
          )}
        >
          <MDXRemote source={post.content} />
        </article>
      </main>
    </>
  );
}