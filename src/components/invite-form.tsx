"use client";

import { useActionState } from "react";
import { invitePersonAction, type InviteState } from "@/app/(app)/settings/people/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteForm() {
  const [state, action, pending] = useActionState<InviteState, FormData>(invitePersonAction, {});

  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <Label htmlFor="email">Their email address</Label>
      <Input id="email" name="email" type="email" required autoComplete="off" key={state.invited ?? "new"} />
      <Button type="submit" disabled={pending} className="self-start">
        Let them sign up
      </Button>
      {state.error && (
        <p role="alert" className="text-destructive">
          {state.error}
        </p>
      )}
      {state.invited && (
        <p role="status">
          Done. {state.invited} can now open the sign-up page and choose a password. The invitation lasts 7 days.
        </p>
      )}
    </form>
  );
}
