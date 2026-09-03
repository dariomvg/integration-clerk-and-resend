import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";
import { requireAuth } from "@/lib/clerk/actions";

export const metadata: Metadata = {
  title: "Welcome",
};

export default async function PageWelcome() {
const user = await requireAuth();

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-20 text-center sm:px-6">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Welcome to {siteConfig.name} {user.firstName}!
        </h1>
        <p className="max-w-md text-muted-foreground">
          Your account is ready. Explore the ebooks and read any of them for
          free.
        </p>
      </div>

      <Button size="lg">
        <Link href="/">Go to home</Link>
      </Button>
    </main>
  );
}