import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-prose px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Juniper Street Café</p>
      <div className="mt-6 space-y-5 text-base [&_h2]:mt-10 [&_h2]:text-2xl [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
      <p className="mt-12">
        <Link href="/sign-in" className="underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
