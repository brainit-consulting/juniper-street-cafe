import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { listPeople, listPendingInvitations } from "@/lib/people";
import { ADMIN_ROLE } from "@/lib/roles";
import { InviteForm } from "@/components/invite-form";

export const metadata: Metadata = { title: "People" };

export default async function PeoplePage() {
  await requireAdmin();
  const [people, pending] = await Promise.all([listPeople(), listPendingInvitations()]);

  return (
    <>
      <section>
        <h1 className="text-4xl">People</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Who can use the order book. Everyone you add can see and change every order.
        </p>
        <ul className="mt-4 border-t border-border">
          {people.map((p) => (
            <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-border py-3">
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground">
                {p.email} · {p.role === ADMIN_ROLE ? "Owner" : "Staff"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {pending.length > 0 && (
        <section>
          <h2 className="text-2xl">Waiting to sign up</h2>
          <ul className="mt-2 border-t border-border">
            {pending.map((i) => (
              <li key={i.id} className="border-b border-border py-3">
                {i.email}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-2xl">Add a person</h2>
        <p className="mt-2 max-w-prose">
          Type their email address. Then they open the sign-up page on their own phone and choose their own
          password. Nobody else can sign up.
        </p>
        <div className="mt-4">
          <InviteForm />
        </div>
      </section>
    </>
  );
}
