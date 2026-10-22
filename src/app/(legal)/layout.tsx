import Link from "next/link";
import { getSession } from "@/lib/auth-guards";

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const signedIn = Boolean(await getSession());

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-prose py-12 gutter">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Juniper Street Café</p>
      <div className="mt-6 space-y-5 text-base [&_h2]:mt-10 [&_h2]:text-2xl [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
      <p className="mt-12">
        <Link href={signedIn ? "/" : "/sign-in"} className="inline-flex min-h-11 items-center underline underline-offset-4">
          {signedIn ? "Back to coming up" : "Back to sign in"}
        </Link>
      </p>
    </main>
  );
}
