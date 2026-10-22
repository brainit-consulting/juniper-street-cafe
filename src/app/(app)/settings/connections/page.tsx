import type { Metadata } from "next";
import { desc, eq, max } from "drizzle-orm";
import { requireUser } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { mcpCallLog, oauthClient, oauthConsent } from "@/lib/db/schema";
import { MCP_RESOURCE, SCOPE_LABELS } from "@/lib/mcp-resource";
import { revokeConnection } from "@/lib/mcp/actions";
import { APP_TIME_ZONE } from "@/lib/time";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Connected assistants" };

/** The plugin stores the scope list as JSON text inside JSON, so it can need unwrapping more than once. */
function scopeList(value: unknown): string[] {
  let v: unknown = value;
  for (let i = 0; i < 3 && typeof v === "string"; i++) {
    const text: string = v;
    try {
      v = JSON.parse(text);
    } catch {
      return text.split(" ").filter(Boolean);
    }
  }
  return Array.isArray(v) ? v.map(String) : [];
}

const when = (d: Date) =>
  d.toLocaleString("en-GB", { timeZone: APP_TIME_ZONE, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function ConnectionsPage() {
  const { user } = await requireUser();

  const consents = await db
    .select({
      id: oauthConsent.id,
      clientId: oauthConsent.clientId,
      scopes: oauthConsent.scopes,
      createdAt: oauthConsent.createdAt,
      name: oauthClient.name,
    })
    .from(oauthConsent)
    .leftJoin(oauthClient, eq(oauthConsent.clientId, oauthClient.clientId))
    .where(eq(oauthConsent.userId, user.id))
    .orderBy(desc(oauthConsent.createdAt));

  const used = await db
    .select({ clientId: mcpCallLog.clientId, last: max(mcpCallLog.createdAt) })
    .from(mcpCallLog)
    .where(eq(mcpCallLog.userId, user.id))
    .groupBy(mcpCallLog.clientId);
  const lastUsed = new Map(used.map((u) => [u.clientId, u.last]));

  return (
    <>
      <section>
        <h1 className="text-4xl">Connected assistants</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          An assistant like Claude can look up orders, add an order and change an order&apos;s status for you. It
          acts as you, sees what you see, and cannot delete anything.
        </p>
        <p className="mt-4 max-w-prose">
          To connect one, give it this address: <code className="break-all font-medium">{MCP_RESOURCE}</code>
        </p>
      </section>

      <section>
        <h2 className="text-2xl">Who has access</h2>
        {consents.length === 0 ? (
          <p className="mt-2">No assistant is connected.</p>
        ) : (
          <ul className="mt-2 border-t border-border">
            {consents.map((c) => {
              const scopes = scopeList(c.scopes);
              const last = lastUsed.get(c.clientId);
              return (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{c.name ?? "An assistant"}</p>
                    <p className="text-sm text-muted-foreground">
                      {scopes
                        .filter((s) => s.startsWith("orders:"))
                        .map((s) => SCOPE_LABELS[s] ?? s)
                        .join(" · ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Allowed {when(c.createdAt)} · {last ? `last used ${when(last)}` : "not used yet"}
                    </p>
                  </div>
                  <form action={revokeConnection}>
                    <input type="hidden" name="consentId" value={c.id} />
                    <Button type="submit" variant="destructive" size="lg">
                      Take access away
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
