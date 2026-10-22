import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col justify-center py-12 gutter short-landscape:py-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Juniper Street Café</p>
      <h1 className="mt-1 text-4xl">That page isn&apos;t here</h1>
      <p className="mt-4">
        The link may be old, or the order may have been removed. Go back to what&apos;s coming up.
      </p>
      <p className="mt-6">
        <Link href="/" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">
          Back to coming up
        </Link>
      </p>
    </main>
  );
}
