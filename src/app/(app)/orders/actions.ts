"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth-guards";
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
  /** The session ended while the form was open. The form keeps what was typed and offers sign-in. */
  signedOut?: boolean;
};

const SIGNED_OUT = "You've been signed out. Sign in again, then press Save. What you typed is still here.";

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
  const raw = Object.fromEntries(TEXT_FIELDS.map((k) => [k, String(formData.get(k) ?? "")]));
  const depositPaid = formData.get("depositPaid") === "on";

  // Signed out is expected (another tab, an expired session), so it comes back as a message
  // that keeps the typed values. Throwing here would replace the form with an error page.
  const session = await getSession();
  if (!session) {
    return { errors: { form: SIGNED_OUT }, values: { ...raw, depositPaid: depositPaid ? "on" : "" }, signedOut: true };
  }

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

export type StatusResult = { error: string };

export async function changeStatus(id: string, status: OrderStatus): Promise<StatusResult> {
  const session = await getSession();
  if (!session) return { error: "You've been signed out. Sign in again, then try again." };
  if (!ORDER_STATUSES.includes(status)) throw new Error("Unknown status");
  const found = await setOrderStatus(id, status, session.user.id);
  if (!found) return { error: "That order no longer exists." };
  revalidatePath("/", "layout");
  redirect("/");
}
