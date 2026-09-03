// app/ebook/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageEbookSlug } from "./PageEbookSlug";
import { getEbookMeta } from "@/lib/config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ebook = getEbookMeta(slug);

  return {
    title: ebook?.title ?? "Ebook",
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const ebook = getEbookMeta(slug);

  if (!ebook) {
    notFound();
  }

  return <PageEbookSlug slug={slug} />;
}