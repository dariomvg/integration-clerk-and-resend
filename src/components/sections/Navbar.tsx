
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-border bg-background">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-end px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight sm:text-xl">
          {siteConfig.name}
        </Link>

            <Show when="signed-out">
              <SignInButton mode="redirect">
          <Button size="sm">Sign in</Button>
        </SignInButton>
              </Show>

        
        <Show when="signed-in">
        <UserButton />

        </Show>
      </div>
    </header>
  );
}
