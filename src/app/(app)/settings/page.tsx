import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { ADMIN_ROLE } from "@/lib/roles";
import { ProfileNameForm } from "@/components/profile-name-form";
import { DeleteAccountCard } from "@/components/delete-account-card";

export const metadata: Metadata = { title: "You" };

export default async function YouPage() {
  const { user } = await requireUser();

  return (
    <>
      <section>
        <h1 className="text-4xl">You</h1>
        <p className="mt-2 text-muted-foreground">
          Signed in as {user.email}. {user.role === ADMIN_ROLE ? "You are the owner." : "You are on the staff."}
        </p>
        <div className="mt-6">
          <ProfileNameForm name={user.name} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl">Your data</h2>
        <p className="mt-2 max-w-prose">A file with your name and the orders you took.</p>
        <a
          href="/settings/export"
          download
          className="mt-3 inline-block font-medium underline underline-offset-4"
        >
          Download my data
        </a>
      </section>

      <section>
        <h2 className="text-2xl">What the order book stores</h2>
        <p className="mt-2 max-w-prose">What is kept about orders and about you, and who can see it.</p>
        <Link href="/privacy" className="mt-3 inline-block font-medium underline underline-offset-4">
          Read what this stores
        </Link>
      </section>

      <section className="border-t border-border pt-10">
        <h2 className="text-2xl text-destructive">Delete my account</h2>
        <div className="mt-4">
          <DeleteAccountCard email={user.email} isOwner={user.role === ADMIN_ROLE} />
        </div>
      </section>
    </>
  );
}
