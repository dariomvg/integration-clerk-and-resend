
import { CardEbook } from "@/components/sections/card-ebook";
import { ebooks } from "@/lib/config";

export function EbooksList() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" id="ebooks">
      <h2 className="text-2xl font-bold sm:text-3xl">All ebooks</h2>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ebooks.map((ebook) => (
          <CardEbook key={ebook.slug} ebook={ebook} />
        ))}
      </div>
    </section>
  );
}