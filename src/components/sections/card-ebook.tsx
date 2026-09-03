// components/card-ebook.tsx
import Link from "next/link";
import { BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryStyles, type EbookMetaEntry } from "@/lib/config";

export function CardEbook({ ebook }: { ebook: EbookMetaEntry }) {
  const styles = categoryStyles[ebook.category];

  return (
    <Link href={`/ebooks/${ebook.slug}`} className="group block">
      <Card className="h-full overflow-hidden py-0 transition-transform group-hover:-translate-y-1 flex flex-col gap-3">
        {/* Banner (placeholder de imagen, color según categoría) */}
        <div
          className={`flex h-40 items-center justify-center border-b-4 border-border ${styles.bg}`}
        >
          <BookOpen className={`size-14 ${styles.fg} opacity-40`} strokeWidth={1.5} />
        </div>

        <CardHeader className="pt-5">
          <Badge className={`${styles.bg} ${styles.fg} rounded-none`}>
            {ebook.category}
          </Badge>
        </CardHeader>

        <CardContent>
          <h3 className="text-lg font-bold text-balance">{ebook.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {ebook.description}
          </p>
        </CardContent>

        <CardFooter className="pb-5 border-none">
          <span className="text-sm font-medium underline underline-offset-4">
            Read for free
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}