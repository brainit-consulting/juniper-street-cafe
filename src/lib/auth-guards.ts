import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ADMIN_ROLE } from "@/lib/roles";

// cache() means a page, its layout and its data functions share one lookup per request.
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/** For pages: sends a signed-out visitor to sign-in. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function requireUserAction() {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  return session;
}

/** For pages: a signed-in person who isn't the owner sees a 404. A throw here would be a 500 page. */
export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== ADMIN_ROLE) notFound();
  return session;
}

/** For server actions and route handlers: throws instead. */
export async function requireAdminAction() {
  const session = await requireUserAction();
  if (session.user.role !== ADMIN_ROLE) throw new Error("Not allowed");
  return session;
}
