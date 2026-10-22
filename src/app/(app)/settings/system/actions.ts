"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/auth-guards";
import { removeExampleOrders } from "@/lib/orders";

export async function removeExamplesAction() {
  const session = await requireAdminAction();
  await removeExampleOrders(session.user.id);
  revalidatePath("/", "layout");
}
