"use client";

import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type SessionRow = {
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date | string;
};

/** "Chrome on Windows" instead of the raw string. A small lookup is enough here. */
function describeDevice(ua?: string | null) {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Firefox\//.test(ua)
      ? "Firefox"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Browser";
  const system = /iPhone|iPad/.test(ua)
    ? "iPhone or iPad"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "Mac"
          : /Linux/.test(ua)
            ? "Linux"
            : "an unknown system";
  return `${browser} on ${system}`;
}

export function SessionsList() {
  const current = useSession();
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey((k) => k + 1);

  // The list comes from the server, so it loads here. State is set from the response, not synchronously.
  useEffect(() => {
    let cancelled = false;
    authClient.listSessions().then((result) => {
      if (cancelled) return;
      if (result.error) {
        setError("Couldn't load the list of devices.");
        return;
      }
      setRows(result.data as SessionRow[]);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!rows) return <p className="text-muted-foreground">Loading…</p>;

  const currentToken = current.data?.session.token;

  return (
    <div>
      <ul className="border-t border-border">
        {rows.map((row) => {
          const here = row.token === currentToken;
          return (
            <li key={row.token} className="flex items-center justify-between gap-4 border-b border-border py-3">
              <div>
                <p className="font-medium">
                  {describeDevice(row.userAgent)}
                  {here && <span className="ml-2 text-sm font-semibold text-primary">This device</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  Signed in {new Date(row.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}
                  {row.ipAddress ? ` · ${row.ipAddress}` : ""}
                </p>
              </div>
              {!here && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    await authClient.revokeSession({ token: row.token });
                    load();
                  }}
                >
                  Sign out
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {rows.length > 1 && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={async () => {
            await authClient.revokeOtherSessions();
            load();
          }}
        >
          Sign out everywhere else
        </Button>
      )}
    </div>
  );
}
