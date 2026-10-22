import Link from "next/link";
import { addDays, clockTime, dayOfMonth, dollars, weekdayShort } from "@/lib/time";
import type { cateringOrder } from "@/lib/db/schema";

type Order = typeof cateringOrder.$inferSelect;

/**
 * One order in a list. The day number hangs in the left margin on purpose
 * (DESIGN.md section 4). Orders due today or tomorrow get a green rule on the
 * left; open orders whose date has passed get a red one.
 */
export function OrderRow({
  order,
  takenByName,
  today,
}: {
  order: Order;
  takenByName: string | null;
  today: string;
}) {
  const open = order.status === "upcoming";
  const overdue = open && order.dueDate < today;
  const soon = open && (order.dueDate === today || order.dueDate === addDays(today, 1));
  const cancelled = order.status === "cancelled";

  const rule = overdue
    ? "border-l-[3px] border-l-destructive pl-3"
    : soon
      ? "border-l-[3px] border-l-primary pl-3"
      : "border-l-[3px] border-l-transparent pl-3"; // same left edge on every row, so the day numbers line up

  return (
    <li className="border-b border-border">
      <Link
        href={`/orders/${order.id}`}
        className={`grid min-h-14 grid-cols-[3.25rem_1fr] gap-x-3 py-4 ${rule}`}
      >
        <div className="text-center leading-none">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {weekdayShort(order.dueDate)}
          </div>
          <div className={`mt-1 font-display text-3xl ${cancelled ? "text-muted-foreground" : ""}`}>
            {dayOfMonth(order.dueDate)}
          </div>
        </div>

        <div className={cancelled ? "text-muted-foreground" : ""}>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className={soon || overdue ? "font-semibold" : "font-medium"}>
              {clockTime(order.dueTime)}
            </span>
            <span className={`font-semibold ${cancelled ? "line-through" : ""}`}>{order.customerName}</span>
            {overdue && (
              <span className="text-xs font-semibold uppercase tracking-wide text-destructive">Overdue</span>
            )}
            {order.status !== "upcoming" && (
              <span className="text-xs font-semibold uppercase tracking-wide">
                {order.status === "done" ? "Done" : "Cancelled"}
              </span>
            )}
          </div>
          <p className={`mt-0.5 line-clamp-2 ${cancelled ? "line-through" : ""}`}>{order.items}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.fulfilment === "delivery" ? "Delivery" : "Pickup"}
            {" · "}
            {order.depositPaid ? "Deposit paid" : "Deposit not paid"}
            {" · "}
            {dollars(order.totalCents)}
            {takenByName ? ` · Taken by ${takenByName}` : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}
