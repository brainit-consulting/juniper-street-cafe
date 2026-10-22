import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { oauthAccessToken, oauthClient, oauthConsent, oauthRefreshToken } from "@/lib/db/schema";

/** Take one assistant's access away from one person. */
export async function revokeAgentAccess(userId: string, clientId: string) {
  if (!userId || !clientId) return;

  await db
    .delete(oauthConsent)
    .where(and(eq(oauthConsent.userId, userId), eq(oauthConsent.clientId, clientId)));
  await db
    .delete(oauthAccessToken)
    .where(and(eq(oauthAccessToken.userId, userId), eq(oauthAccessToken.clientId, clientId)));
  await db
    .delete(oauthRefreshToken)
    .where(and(eq(oauthRefreshToken.userId, userId), eq(oauthRefreshToken.clientId, clientId)));

  // The registration goes too, but only when nobody else still uses it.
  const [stillUsed] = await db
    .select({ id: oauthConsent.id })
    .from(oauthConsent)
    .where(eq(oauthConsent.clientId, clientId))
    .limit(1);
  if (!stillUsed) await db.delete(oauthClient).where(eq(oauthClient.clientId, clientId));
}

/** Account deletion: every connection this person approved. */
export async function revokeAllAgentAccess(userId: string) {
  const rows = await db
    .select({ clientId: oauthConsent.clientId })
    .from(oauthConsent)
    .where(eq(oauthConsent.userId, userId));
  for (const clientId of new Set(rows.map((row) => row.clientId))) {
    await revokeAgentAccess(userId, clientId);
  }
}
