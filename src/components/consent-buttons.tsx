"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function ConsentButtons({
  scopes,
  canRead,
  canWrite,
  labels,
  other,
}: {
  scopes: string[];
  canRead: boolean;
  canWrite: boolean;
  labels: { read: string; write: string };
  other: string[];
}) {
  const [write, setWrite] = useState(canWrite);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function answer(accept: boolean) {
    setBusy(true);
    setError(null);
    // The write permission can be left out. Sign-in scopes pass through untouched,
    // and an empty list is never sent, so a refusal is sent as a refusal.
    const granted = scopes.filter((s) => s !== "orders:write" || write).join(" ");
    const { data, error } = await authClient.oauth2.consent({ accept, ...(accept ? { scope: granted } : {}) });
    if (error) {
      setBusy(false);
      setError(error.message ?? "That didn't work. Close this page and start again from the assistant.");
      return;
    }
    if (data?.url) window.location.href = data.url;
  }

  return (
    <div className="mt-6">
      <p className="font-medium">It will be able to:</p>
      <ul className="mt-2 border-t border-border">
        {canRead && <li className="border-b border-border py-3">{labels.read}</li>}
        {canWrite && (
          <li className="border-b border-border">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 py-2">
              <input
                type="checkbox"
                className="size-5 accent-primary"
                checked={write}
                onChange={(e) => setWrite(e.target.checked)}
              />
              <span>{labels.write}</span>
            </label>
          </li>
        )}
        {other.map((line) => (
          <li key={line} className="border-b border-border py-3">
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground">
        It cannot delete anything. You can take this away again under Settings, Connected assistants.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-destructive">
          {error}
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" size="lg" disabled={busy} onClick={() => answer(false)}>
          Don&apos;t allow
        </Button>
        <Button variant="outline" size="lg" disabled={busy || !canRead} onClick={() => answer(true)}>
          Allow
        </Button>
      </div>
    </div>
  );
}
