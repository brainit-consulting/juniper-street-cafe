"use client";

import Link from "next/link";

// Anything unexpected on a signed-in page lands here instead of the framework's bare error screen.
export default function AppError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="max-w-prose">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="mt-4">
        That didn&apos;t work. Anything already saved is safe. Try again, and if it keeps happening, tell the
        owner.
      </p>
      <div className="mt-6 flex items-center gap-6">
        <button
          type="button"
          onClick={() => retry()}
          className="h-12 rounded-lg bg-primary px-5 font-medium text-primary-foreground"
        >
          Try again
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center font-medium underline underline-offset-4">
          Back to coming up
        </Link>
      </div>
    </div>
  );
}
