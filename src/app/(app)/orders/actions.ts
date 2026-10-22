"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUserAction } from "@/lib/auth-guards";
import {
  ORDER_STATUSES,
  createOrder,
  orderInput,
  setOrderStatus,
  updateOrder,
  type OrderStatus,
} from "@/lib/orders";

export type FormState = {
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

const TEXT_FIELDS = [
  "customerName",
  "phone",
  "dueDate",
  "dueTime",
  "items",
  "fulfilment",
  "deliveryAddress",
  "total",
  "notes",
] as const;

export async function saveOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireUserAction();

  const raw = Object.fromEntries(TEXT_FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));
  const depositPaid = formData.get("depositPaid") === "on";
  const parsed = orderInput.safeParse({ ...raw, depositPaid });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { errors, values: { ...raw, depositPaid: depositPaid ? "on" : "" } };
  }

  const id = String(formData.get("id") ?? "");
  if (id) {
    const found = await updateOrder(id, parsed.data, session.user.id);
    if (!found) {
      return { errors: { form: "That order no longer exists." }, values: { ...raw, depositPaid: depositPaid ? "on" : "" } };
    }
  } else {
    await createOrder(parsed.data, session.user.id);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function changeStatus(id: string, status: OrderStatus) {
  const session = await requireUserAction();
  if (!ORDER_STATUSES.includes(status)) throw new Error("Unknown status");
  await setOrderStatus(id, status, session.user.id);
  revalidatePath("/", "layout");
  redirect("/");
}
