"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth-guards";
import { invitePerson } from "@/lib/people";

export type InviteState = { error?: string; invited?: string };

export async function invitePersonAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const session = await requireAdminAction();
  const result = await invitePerson(String(formData.get("email") ?? ""), session.user.id);
  if ("error" in result) return { error: result.error };
  revalidatePath("/settings/people");
  return { invited: result.email };
}
