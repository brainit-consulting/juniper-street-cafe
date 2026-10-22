export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col justify-center px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Juniper Street Café
      </p>
      <h1 className="mt-1 text-4xl">Catering orders</h1>
      <div className="mt-8">{children}</div>
    </main>
  );
}
