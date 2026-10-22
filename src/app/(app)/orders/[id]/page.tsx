import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth-guards";
import { getOrder } from "@/lib/orders";
import { longDate } from "@/lib/time";
import { OrderForm } from "@/components/order-form";
import { StatusButtons } from "@/components/status-buttons";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const found = await getOrder(id);
  if (!found) notFound();
  const { order, takenByName } = found;

  return (
    <div className="max-w-xl">
      <Link href="/" className="text-muted-foreground underline underline-offset-4">
        Back to coming up
      </Link>
      <h1 className="mt-3 text-4xl">{order.customerName}</h1>
      <p className="mt-1 text-muted-foreground">
        {longDate(order.dueDate)}
        {order.status === "done" && " · Done"}
        {order.status === "cancelled" && " · Cancelled"}
        {takenByName ? ` · Taken by ${takenByName}` : ""}
      </p>

      <div className="mt-6">
        <StatusButtons id={order.id} status={order.status} />
      </div>

      <h2 className="mt-10 text-2xl">Details</h2>
      <div className="mt-4">
        <OrderForm
          submitLabel="Save changes"
          initial={{
            id: order.id,
            customerName: order.customerName,
            phone: order.phone,
            dueDate: order.dueDate,
            dueTime: order.dueTime,
            items: order.items,
            fulfilment: order.fulfilment,
            deliveryAddress: order.deliveryAddress ?? "",
            total: (order.totalCents / 100).toFixed(2),
            depositPaid: order.depositPaid,
            notes: order.notes ?? "",
          }}
        />
      </div>
    </div>
  );
}
