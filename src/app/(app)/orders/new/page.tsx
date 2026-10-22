import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-guards";
import { OrderForm } from "@/components/order-form";
import { addDays, todayInCafe } from "@/lib/time";

export const metadata: Metadata = { title: "Add order" };

export default async function NewOrderPage() {
  await requireUser();

  return (
    <div className="max-w-xl">
      <h1 className="text-4xl">Add order</h1>
      <div className="mt-6">
        <OrderForm
          submitLabel="Save order"
          initial={{
            customerName: "",
            phone: "",
            dueDate: addDays(todayInCafe(), 1),
            dueTime: "09:00",
            items: "",
            fulfilment: "pickup",
            deliveryAddress: "",
            total: "",
            depositPaid: false,
            notes: "",
          }}
        />
      </div>
    </div>
  );
}
