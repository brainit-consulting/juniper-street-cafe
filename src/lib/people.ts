import { and, asc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { invitation, user } from "./db/schema";
import { logActivity } from "./activity";
import { DEFAULT_ROLE } from "./roles";

const INVITE_DAYS = 7;

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("That doesn't look like an email address."));

export async function listPeople() {
  return db
    .select({ id: user.id, name: user.name, email: user.email, role: user.role })
    .from(user)
    .orderBy(asc(user.createdAt));
}

export async function listPendingInvitations() {
  return db
    .select({ id: invitation.id, email: invitation.email, expiresAt: invitation.expiresAt })
    .from(invitation)
    .where(and(isNull(invitation.acceptedAt), gt(invitation.expiresAt, new Date())))
    .orderBy(asc(invitation.expiresAt));
}

/**
 * Let one more address create an account. The sign-up rule in auth.ts is what
 * enforces it; this only records the permission. The new person then opens the
 * sign-up page and chooses their own password.
 */
export async function invitePerson(emailInput: string, invitedBy: string) {
  const parsed = emailSchema.safeParse(emailInput);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const email = parsed.data;

  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (existing) return { error: "That person already has an account." };

  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
  const [pending] = await db
    .select({ id: invitation.id })
    .from(invitation)
    .where(and(eq(invitation.email, email), isNull(invitation.acceptedAt)))
    .limit(1);

  if (pending) {
    await db.update(invitation).set({ expiresAt, invitedBy }).where(eq(invitation.id, pending.id));
  } else {
    await db.insert(invitation).values({ email, role: DEFAULT_ROLE, invitedBy, expiresAt });
  }
  await logActivity("member.invited", { email }, invitedBy);
  return { ok: true as const, email };
}
