// components/page-home.tsx
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { EbooksList } from "@/components/sections/ebooks-list";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <EbooksList />
      </main>
    </>
  );
}