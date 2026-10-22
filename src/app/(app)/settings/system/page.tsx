import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guards";
import { getSystemStatus } from "@/lib/system-status";
import { listActivity } from "@/lib/activity";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { mcpCallLog, user } from "@/lib/db/schema";
import { APP_TIME_ZONE } from "@/lib/time";
import { countExampleOrders } from "@/lib/orders";
import { RemoveExamplesCard } from "@/components/remove-examples-card";

const ACTION_WORDS: Record<string, string> = {
  "order.created": "Added an order",
  "order.changed": "Changed an order",
  "order.done": "Marked an order done",
  "order.cancelled": "Cancelled an order",
  "order.upcoming": "Put an order back on the upcoming list",
  "member.invited": "Let someone sign up",
  "member.joined": "Joined the team",
  "member.left": "Left the team",
  "orders.examples_removed": "Removed the example orders",
};

function describe(detail: unknown) {
  if (!detail || typeof detail !== "object") return "";
  const d = detail as { customer?: string; email?: string; name?: string; count?: number; via?: string };
  if (typeof d.count === "number") return `${d.count} removed`;
  const who = d.customer ?? d.name ?? d.email ?? "";
  return d.via === "agent" ? `${who} (by an assistant)` : who;
}

export const metadata: Metadata = { title: "System" };

/** What assistants did through /mcp, newest first. Reads count: that is how orders leave the book. */
async function listAssistantCalls(limit = 100) {
  return db
    .select({
      id: mcpCallLog.id,
      tool: mcpCallLog.tool,
      args: mcpCallLog.args,
      ok: mcpCallLog.ok,
      error: mcpCallLog.error,
      rowCount: mcpCallLog.rowCount,
      createdAt: mcpCallLog.createdAt,
      userName: user.name,
    })
    .from(mcpCallLog)
    .leftJoin(user, eq(mcpCallLog.userId, user.id))
    .orderBy(desc(mcpCallLog.createdAt))
    .limit(limit);
}

export default async function SystemPage() {
  await requireAdmin();
  const [{ checks, database }, activity, exampleCount, calls] = await Promise.all([
    getSystemStatus(),
    listActivity(),
    countExampleOrders(),
    listAssistantCalls(),
  ]);

  return (
    <>
      <section>
        <h1 className="text-4xl">System</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          What is set up, and what has happened. Only the owner can see this page.
        </p>
        <ul className="mt-4 border-t border-border">
          <li className="flex items-baseline justify-between gap-4 border-b border-border py-3">
            <span className="font-medium">Order book (database)</span>
            <span className={database ? "" : "font-semibold text-destructive"}>
              {database ? "Working" : "Not reachable"}
            </span>
          </li>
          {checks.map((c) => (
            <li key={c.name} className="border-b border-border py-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium">{c.name}</span>
                <span className={c.ready ? "" : "font-semibold text-destructive"}>
                  {c.ready ? "Set" : "Not set yet"}
                </span>
              </div>
              {!c.ready && <p className="mt-1 text-sm text-muted-foreground">{c.hint}</p>}
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-4 border-b border-border py-3">
            <span className="font-medium">Café time zone</span>
            <span>{APP_TIME_ZONE}</span>
          </li>
        </ul>
      </section>

      {exampleCount > 0 && (
        <section>
          <h2 className="text-2xl">Example orders</h2>
          <div className="mt-3">
            <RemoveExamplesCard count={exampleCount} />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl">What assistants did</h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Every time an assistant looked something up or wrote something down, with what it asked for. This can
          include customer names and phone numbers.
        </p>
        {calls.length === 0 ? (
          <p className="mt-2">No assistant has used the order book yet.</p>
        ) : (
          <ul className="mt-2 border-t border-border">
            {calls.map((c) => (
              <li key={c.id} className="border-b border-border py-3">
                <p className="font-medium">
                  {c.tool.replaceAll("_", " ")}
                  {c.ok ? "" : " · refused or failed"}
                </p>
                <p className="break-words text-sm">{c.args ? JSON.stringify(c.args) : ""}</p>
                {c.error && <p className="text-sm text-destructive">{c.error}</p>}
                <p className="text-sm text-muted-foreground">
                  as {c.userName ?? "someone who has since left"} ·{" "}
                  {c.createdAt.toLocaleString("en-GB", {
                    timeZone: APP_TIME_ZONE,
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl">What happened</h2>
        {activity.length === 0 ? (
          <p className="mt-2">Nothing yet. Add an order and it shows up here.</p>
        ) : (
          <ul className="mt-2 border-t border-border">
            {activity.map((a) => (
              <li key={a.id} className="border-b border-border py-3">
                <p className="font-medium">
                  {ACTION_WORDS[a.action] ?? a.action}
                  {describe(a.detail) ? `: ${describe(a.detail)}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {a.userName ?? "Someone who has since left"} ·{" "}
                  {a.createdAt.toLocaleString("en-GB", {
                    timeZone: APP_TIME_ZONE,
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
