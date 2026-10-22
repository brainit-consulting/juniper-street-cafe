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
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1 gutter">
          <Link href="/" className="inline-flex min-h-11 items-center font-display text-xl active:bg-muted">
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
        <nav className="mx-auto flex max-w-3xl gap-6 pb-1 font-medium gutter" aria-label="Main">
          <Link href="/" className="inline-flex min-h-11 items-center active:bg-muted">
            Coming up
          </Link>
          <Link href="/orders" className="inline-flex min-h-11 items-center active:bg-muted">
            All orders
          </Link>
          <Link href="/settings" className="inline-flex min-h-11 items-center active:bg-muted">
            Settings
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl py-8 gutter">{children}</main>
    </div>
  );
}
