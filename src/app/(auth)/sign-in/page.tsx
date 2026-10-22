import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-guards";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ client_id?: string }> }) {
  // Someone arriving from an assistant keeps this page, so the request is not dropped.
  const { client_id } = await searchParams;
  if ((await getSession()) && !client_id) redirect("/");

  return (
    <>
      <h2 className="mb-5 text-2xl">Sign in</h2>
      <AuthForm mode="sign-in" />
      <p className="mt-8 text-muted-foreground">
        No account yet? The owner adds new people from inside the app. Then open the{" "}
        <Link href="/sign-up" className="py-3.5 underline underline-offset-4">
          sign-up page
        </Link>
        .
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        <Link href="/privacy" className="inline-flex min-h-11 items-center underline underline-offset-4">
          What this stores
        </Link>
      </p>
    </>
  );
}
