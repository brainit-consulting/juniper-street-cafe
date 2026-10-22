"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountCard({ email, isOwner }: { email: string; isOwner: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isOwner) {
    return (
      <p className="max-w-prose">
        This is the owner account, so it can&apos;t be deleted from the app. Nobody would be left in charge of
        the order book.
      </p>
    );
  }

  if (!open) {
    return (
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete my account
      </Button>
    );
  }

  async function confirm() {
    setBusy(true);
    setError(null);
    const result = await authClient.deleteUser({ password });
    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? "That didn't work. Check the password.");
      return;
    }
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <p>
        This deletes your account for good. The orders you took stay in the book, with your name taken off. The change record keeps a note that you left.
        There is no undo.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-email">Type your email address to confirm: {email}</Label>
        <Input
          id="confirm-email"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">Your password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          variant="destructive"
          disabled={busy || typed.trim().toLowerCase() !== email.toLowerCase() || !password}
          onClick={confirm}
        >
          Delete my account
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Keep it
        </Button>
      </div>
    </div>
  );
}
