import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, gt, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { invitation, user } from "@/lib/db/schema";
import { AuthForm } from "@/components/auth-form";

// Open for the first account, and while the owner has someone waiting to sign up.
// Otherwise it shows a sentence. The sign-up rule in auth.ts is what actually enforces this.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignUpPage() {
  if (await getSession()) redirect("/");

  const [users] = await db.select({ n: count() }).from(user);
  const [waiting] = await db
    .select({ n: count() })
    .from(invitation)
    .where(and(isNull(invitation.acceptedAt), gt(invitation.expiresAt, new Date())));

  if (users.n === 0) {
    return (
      <>
        <h2 className="mb-2 text-2xl">Set up the owner account</h2>
        <p className="mb-5 text-muted-foreground">
          The first account becomes the owner. After that, only people the owner adds can sign up.
        </p>
        <AuthForm mode="sign-up" />
      </>
    );
  }

  if (waiting.n > 0) {
    return (
      <>
        <h2 className="mb-2 text-2xl">Join the team</h2>
        <p className="mb-5 text-muted-foreground">
          Use the email address the owner added, and choose your own password.
        </p>
        <AuthForm mode="sign-up" />
      </>
    );
  }

  return (
    <>
      <h2 className="mb-3 text-2xl">Sign-up is closed</h2>
      <p>The owner adds new people from inside the app. Ask them to add you.</p>
      <p className="mt-6">
        <Link href="/sign-in" className="inline-flex min-h-11 items-center underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
