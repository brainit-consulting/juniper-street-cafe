import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth-guards";
import { SCOPE_LABELS } from "@/lib/mcp-resource";
import { ConsentButtons } from "@/components/consent-buttons";

export const metadata: Metadata = { title: "Let an assistant in?" };

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const session = await getSession();
  if (!session) {
    // Keep the whole signed request, or the assistant that asked is forgotten by the time sign-in is done.
    const kept = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string") kept.set(key, value);
    }
    redirect(`/sign-in?${kept.toString()}`);
  }

  const clientId = typeof query.client_id === "string" ? query.client_id : "";
  const scopes = (typeof query.scope === "string" ? query.scope : "").split(" ").filter(Boolean);
  const client = clientId
    ? await auth.api.getOAuthClientPublic({ query: { client_id: clientId }, headers: await headers() }).catch(() => null)
    : null;

  // The sign-in details are not something to choose; only the order permissions are.
  const plain = scopes.filter((s) => s !== "orders:write" && s !== "orders:read" && s !== "offline_access" && s !== "openid");
  const canRead = scopes.includes("orders:read");
  const canWrite = scopes.includes("orders:write");

  return (
    <>
      <h2 className="text-2xl">Let an assistant in?</h2>
      <p className="mt-3">
        <strong>{client?.client_name ?? "An assistant"}</strong> wants to work in the order book as{" "}
        <strong>{session.user.email}</strong>.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        That name is chosen by whoever is connecting. Only go on if you started this yourself.
      </p>

      <ConsentButtons
        scopes={scopes}
        canRead={canRead}
        canWrite={canWrite}
        labels={{
          read: SCOPE_LABELS["orders:read"],
          write: SCOPE_LABELS["orders:write"],
        }}
        other={plain.map((s) => SCOPE_LABELS[s] ?? `Something this page has no words for yet (${s})`)}
      />
    </>
  );
}
