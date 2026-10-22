import { Suspense } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { helpChapters } from "@/content/help/chapters";
import { HelpGuide } from "@/components/help-guide";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const role = session.user.role ?? "";
  const chapters = helpChapters.filter((c) => !c.audience || c.audience.includes(role));

  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3">
          <Link href="/" className="font-display text-xl">
            Juniper Street Café
          </Link>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{session.user.name}</span>
            <SignOutButton />
            <Suspense fallback={null}>
              <HelpGuide chapters={chapters} />
            </Suspense>
          </div>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-6 px-4 pb-2 font-medium" aria-label="Main">
          <Link href="/" className="py-2">
            Coming up
          </Link>
          <Link href="/orders" className="py-2">
            All orders
          </Link>
          <Link href="/settings" className="py-2">
            Settings
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
