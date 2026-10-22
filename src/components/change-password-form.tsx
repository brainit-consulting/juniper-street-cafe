"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [message, setMessage] = useState<{ text: string; bad: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMessage(null);
    const result = await authClient.changePassword({
      currentPassword: String(data.get("current") ?? ""),
      newPassword: String(data.get("next") ?? ""),
      revokeOtherSessions: data.get("others") === "on",
    });
    setBusy(false);
    if (result.error) {
      setMessage({ text: result.error.message ?? "That didn't work. Check the current password.", bad: true });
      return;
    }
    form.reset();
    setMessage({ text: "Password changed.", bad: false });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="current">Current password</Label>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="next">New password</Label>
        <Input id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input type="checkbox" name="others" defaultChecked className="size-5 accent-primary" />
        <span>Sign out my other devices</span>
      </label>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={busy}>
          Change password
        </Button>
        {message && (
          <span role="status" className={message.bad ? "text-destructive" : ""}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  );
}
