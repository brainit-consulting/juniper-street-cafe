import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { listComingUp, listOverdue } from "@/lib/orders";
import { addDays, longDate, todayInCafe } from "@/lib/time";
import { OrderRow } from "@/components/order-row";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Coming up" };

export default async function ComingUpPage() {
  await requireUser();
  const today = todayInCafe();
  const [coming, overdue] = await Promise.all([listComingUp(today), listOverdue(today)]);

  const days = new Map<string, typeof coming>();
  for (const row of coming) {
    const list = days.get(row.order.dueDate) ?? [];
    list.push(row);
    days.set(row.order.dueDate, list);
  }

  const dayLabel = (date: string) => {
    if (date === today) return `Today, ${longDate(date)}`;
    if (date === addDays(today, 1)) return `Tomorrow, ${longDate(date)}`;
    return longDate(date);
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-4xl">Coming up</h1>
        <Link href="/orders/new" className={cn(buttonVariants({ size: "lg" }))}>
          Add order
        </Link>
      </div>

      {overdue.length > 0 && (
        <section className="mt-8" aria-labelledby="overdue-heading">
          <h2 id="overdue-heading" className="text-xl text-destructive">
            Past their date and still open
          </h2>
          <p className="mt-1 text-muted-foreground">Mark each one done or cancelled so it stops showing here.</p>
          <ul className="mt-2 border-t border-border">
            {overdue.map(({ order, takenByName }) => (
              <OrderRow key={order.id} order={order} takenByName={takenByName} today={today} />
            ))}
          </ul>
        </section>
      )}

      {coming.length === 0 ? (
        <p className="mt-10 max-w-prose text-lg">
          No orders coming up. Add one when the phone rings.{" "}
          <Link href="/?help=add-an-order" className="underline underline-offset-4">
            How taking an order works
          </Link>
        </p>
      ) : (
        [...days.entries()].map(([date, rows]) => (
          <section key={date} className="mt-8" aria-labelledby={`day-${date}`}>
            <h2 id={`day-${date}`} className="text-xl">
              {dayLabel(date)}
            </h2>
            <ul className="mt-2 border-t border-border">
              {rows.map(({ order, takenByName }) => (
                <OrderRow key={order.id} order={order} takenByName={takenByName} today={today} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
