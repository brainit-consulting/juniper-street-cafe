"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireUserAction } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { oauthConsent } from "@/lib/db/schema";
import { revokeAgentAccess } from "@/lib/mcp/revoke";

export async function revokeConnection(form: FormData) {
  const session = await requireUserAction();
  const consentId = String(form.get("consentId") ?? "");

  // Looked up as the signed-in person, so somebody else's consent id finds nothing.
  const [consent] = await db
    .select({ clientId: oauthConsent.clientId })
    .from(oauthConsent)
    .where(and(eq(oauthConsent.id, consentId), eq(oauthConsent.userId, session.user.id)))
    .limit(1);
  if (!consent) throw new Error("That connection wasn't found.");

  await revokeAgentAccess(session.user.id, consent.clientId);
  revalidatePath("/settings/connections");
}
