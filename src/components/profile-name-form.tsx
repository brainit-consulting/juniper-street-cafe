"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileNameForm({ name }: { name: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const value = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    const result = await authClient.updateUser({ name: value });
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message ?? "That didn't save. Try again.");
      return;
    }
    setMessage("Saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm flex-col gap-3">
      <Label htmlFor="name">Your name</Label>
      <Input id="name" name="name" defaultValue={name} required autoComplete="name" />
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={busy}>
          Save name
        </Button>
        {message && <span role="status">{message}</span>}
      </div>
    </form>
  );
}
