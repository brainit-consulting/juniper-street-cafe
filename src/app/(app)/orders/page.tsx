import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth-guards";
import { ORDER_STATUSES, listOrders, type OrderStatus } from "@/lib/orders";
import { todayInCafe } from "@/lib/time";
import { OrderRow } from "@/components/order-row";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FILTERS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "done", label: "Done" },
  { key: "cancelled", label: "Cancelled" },
];

export const metadata: Metadata = { title: "All orders" };

export default async function AllOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireUser();
  const { q = "", status = "all" } = await searchParams;
  const selected = ORDER_STATUSES.find((s) => s === status);
  const rows = await listOrders({ status: selected, search: q });
  const today = todayInCafe();

  const href = (key: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (key !== "all") params.set("status", key);
    const qs = params.toString();
    return qs ? `/orders?${qs}` : "/orders";
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-4xl">All orders</h1>
        <Link href="/orders/new" className={cn(buttonVariants({ size: "lg" }))}>
          Add order
        </Link>
      </div>

      <form action="/orders" className="mt-6 flex gap-3">
        {selected && <input type="hidden" name="status" value={selected} />}
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name or phone"
          aria-label="Search by name or phone"
          autoComplete="off"
        />
        <Button type="submit" variant="outline" size="lg">
          Search
        </Button>
      </form>

      <nav className="mt-4 flex flex-wrap gap-x-5" aria-label="Filter by status">
        {FILTERS.map((f) => {
          const active = (selected ?? "all") === f.key;
          return (
            <Link
              key={f.key}
              href={href(f.key)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "border-b-2 py-2 font-medium",
                active ? "border-primary" : "border-transparent text-muted-foreground",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-8 text-lg">
          {q || selected ? "No orders match that." : "No orders yet. Add the first one when the phone rings."}
        </p>
      ) : (
        <ul className="mt-2 border-t border-border">
          {rows.map(({ order, takenByName }) => (
            <OrderRow key={order.id} order={order} takenByName={takenByName} today={today} />
          ))}
        </ul>
      )}
    </div>
  );
}
