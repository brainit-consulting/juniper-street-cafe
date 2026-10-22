import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <>
      <h2 className="mb-5 text-2xl">Sign in</h2>
      <AuthForm mode="sign-in" />
      <p className="mt-8 text-muted-foreground">
        No account yet? The owner adds new people from inside the app. Then open the{" "}
        <Link href="/sign-up" className="underline underline-offset-4">
          sign-up page
        </Link>
        .
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        <Link href="/privacy" className="underline underline-offset-4">
          What this stores
        </Link>
      </p>
    </>
  );
}
