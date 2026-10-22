import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { oauthConsent, user } from "@/lib/db/schema";

/**
 * On every call: does the person still exist, and have they left this
 * connection approved? This is what makes Revoke stop the very next call.
 */
export async function connectionStillAllowed(userId: string, clientId: string): Promise<boolean> {
  if (!userId || !clientId) return false;
  const [row] = await db
    .select({ id: oauthConsent.id })
    .from(oauthConsent)
    .innerJoin(user, eq(oauthConsent.userId, user.id))
    .where(and(eq(oauthConsent.userId, userId), eq(oauthConsent.clientId, clientId)))
    .limit(1);
  return Boolean(row);
}
