import { and, asc, count, desc, eq, gte, like, lt, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { cateringOrder, user } from "./db/schema";
import { logActivity } from "./activity";

export const ORDER_STATUSES = ["upcoming", "done", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** What the form sends. Money arrives as dollars typed by a person and is stored as cents. */
export const orderInput = z
  .object({
    customerName: z.string().trim().min(1, "Add the customer's name."),
    phone: z.string().trim().min(1, "Add a phone number."),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the date."),
    dueTime: z.string().regex(/^\d{2}:\d{2}$/, "Pick the time."),
    items: z.string().trim().min(1, "Write what they ordered."),
    fulfilment: z.enum(["pickup", "delivery"], { error: "Choose pickup or delivery." }),
    deliveryAddress: z.string().trim().optional(),
    total: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, "Enter the total as a number, like 85 or 85.50."),
    depositPaid: z.boolean(),
    notes: z.string().trim().optional(),
  })
  .refine((v) => v.fulfilment !== "delivery" || !!v.deliveryAddress, {
    path: ["deliveryAddress"],
    message: "Add the delivery address.",
  });

export type OrderInput = z.infer<typeof orderInput>;

function toRow(input: OrderInput) {
  return {
    customerName: input.customerName,
    phone: input.phone,
    dueDate: input.dueDate,
    dueTime: input.dueTime,
    items: input.items,
    fulfilment: input.fulfilment,
    deliveryAddress: input.fulfilment === "delivery" ? input.deliveryAddress || null : null,
    totalCents: Math.round(Number(input.total) * 100),
    depositPaid: input.depositPaid,
    notes: input.notes || null,
  };
}

const withTaker = {
  order: cateringOrder,
  takenByName: user.name,
};

/** Upcoming orders from `today` on, soonest first. */
export async function listComingUp(today: string) {
  return db
    .select(withTaker)
    .from(cateringOrder)
    .leftJoin(user, eq(cateringOrder.takenBy, user.id))
    .where(and(eq(cateringOrder.status, "upcoming"), gte(cateringOrder.dueDate, today)))
    .orderBy(asc(cateringOrder.dueDate), asc(cateringOrder.dueTime));
}

/** Orders still marked upcoming whose date has passed. Someone forgot to close them. */
export async function listOverdue(today: string) {
  return db
    .select(withTaker)
    .from(cateringOrder)
    .leftJoin(user, eq(cateringOrder.takenBy, user.id))
    .where(and(eq(cateringOrder.status, "upcoming"), lt(cateringOrder.dueDate, today)))
    .orderBy(asc(cateringOrder.dueDate), asc(cateringOrder.dueTime));
}

export async function listOrders(opts: { status?: OrderStatus; search?: string }) {
  const search = opts.search?.trim();
  const conditions = [
    opts.status ? eq(cateringOrder.status, opts.status) : undefined,
    search
      ? or(
          like(cateringOrder.customerName, `%${search}%`),
          like(cateringOrder.phone, `%${search}%`),
        )
      : undefined,
  ].filter((c) => c !== undefined);

  return db
    .select(withTaker)
    .from(cateringOrder)
    .leftJoin(user, eq(cateringOrder.takenBy, user.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(cateringOrder.dueDate), desc(cateringOrder.dueTime));
}

export async function getOrder(id: string) {
  const [row] = await db
    .select(withTaker)
    .from(cateringOrder)
    .leftJoin(user, eq(cateringOrder.takenBy, user.id))
    .where(eq(cateringOrder.id, id))
    .limit(1);
  return row ?? null;
}

export async function createOrder(input: OrderInput, takenBy: string, opts: { isExample?: boolean } = {}) {
  const [row] = await db
    .insert(cateringOrder)
    .values({ ...toRow(input), takenBy, isExample: opts.isExample ?? false })
    .returning({ id: cateringOrder.id });
  await logActivity("order.created", { id: row.id, customer: input.customerName }, takenBy);
  return row.id;
}

/** Returns false when there is no such order. Keeps who first took it. */
export async function updateOrder(id: string, input: OrderInput, userId: string) {
  const rows = await db
    .update(cateringOrder)
    .set(toRow(input))
    .where(eq(cateringOrder.id, id))
    .returning({ id: cateringOrder.id });
  if (rows.length === 0) return false;
  await logActivity("order.changed", { id, customer: input.customerName }, userId);
  return true;
}

export async function countExampleOrders() {
  const [row] = await db.select({ n: count() }).from(cateringOrder).where(eq(cateringOrder.isExample, true));
  return row.n;
}

/** Deletes the made-up sample orders and nothing else. Real orders are never deleted. */
export async function removeExampleOrders(userId: string) {
  const removed = await db
    .delete(cateringOrder)
    .where(eq(cateringOrder.isExample, true))
    .returning({ id: cateringOrder.id });
  if (removed.length > 0) await logActivity("orders.examples_removed", { count: removed.length }, userId);
  return removed.length;
}

export async function setOrderStatus(id: string, status: OrderStatus, userId: string) {
  const rows = await db
    .update(cateringOrder)
    .set({ status })
    .where(eq(cateringOrder.id, id))
    .returning({ id: cateringOrder.id });
  if (rows.length === 0) return false;
  await logActivity(`order.${status}`, { id }, userId);
  return true;
}
