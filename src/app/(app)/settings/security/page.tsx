import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-guards";
import { ChangePasswordForm } from "@/components/change-password-form";
import { SessionsList } from "@/components/sessions-list";

export const metadata: Metadata = { title: "Password and devices" };

export default async function SecurityPage() {
  await requireUser();

  return (
    <>
      <section>
        <h1 className="text-4xl">Password and devices</h1>
        <h2 className="mt-8 text-2xl">Change password</h2>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>

      <section>
        <h2 className="text-2xl">Where you&apos;re signed in</h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          If you lose a phone, sign it out here.
        </p>
        <div className="mt-4">
          <SessionsList />
        </div>
      </section>
    </>
  );
}
