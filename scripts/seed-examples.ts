// Adds a few made-up example orders so the app has something to show.
// Run it once, after the owner account exists:  pnpm db:seed:examples
// It refuses to run if there are already orders, so it can't pile up duplicates.
import { count, eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { cateringOrder, user } from "../src/lib/db/schema";
import { createOrder, setOrderStatus, type OrderInput } from "../src/lib/orders";
import { addDays, todayInCafe } from "../src/lib/time";

async function main() {
  const [owner] = await db.select({ id: user.id, name: user.name }).from(user).where(eq(user.role, "owner")).limit(1);
  if (!owner) {
    console.error("There is no owner account yet. Sign up in the app first, then run this again.");
    process.exit(1);
  }

  const [existing] = await db.select({ n: count() }).from(cateringOrder);
  if (existing.n > 0) {
    console.error(`There are already ${existing.n} orders. Not adding examples on top of them.`);
    process.exit(1);
  }

  const today = todayInCafe();
  const day = (offset: number) => addDays(today, offset);

  const examples: { input: OrderInput; status?: "done" | "cancelled" }[] = [
    {
      input: {
        customerName: "Marguerite Holloway",
        phone: "555-0142",
        dueDate: day(1),
        dueTime: "08:30",
        items: "Coffee for 12, a tray of cinnamon rolls",
        fulfilment: "pickup",
        total: "64.00",
        depositPaid: true,
        notes: "One person is gluten free. Pickup at the side door.",
      },
    },
    {
      input: {
        customerName: "Brightwater Dental Office",
        phone: "555-0178",
        dueDate: day(3),
        dueTime: "11:45",
        items: "Lunch for 20: soup of the day, sandwich platters, two salads, lemon bars",
        fulfilment: "delivery",
        deliveryAddress: "220 Alder Lane, second floor reception",
        total: "285.00",
        depositPaid: true,
        notes: "Ask for Priya at the front desk. No nuts in anything.",
      },
    },
    {
      input: {
        customerName: "Tomas Reyes",
        phone: "555-0109",
        dueDate: day(5),
        dueTime: "15:00",
        items: "Birthday: two dozen assorted cookies, a large lemon cake",
        fulfilment: "pickup",
        total: "92.50",
        depositPaid: false,
        notes: "Write \"Happy 40th, Dani\" on the cake.",
      },
    },
    {
      input: {
        customerName: "Old Mill Book Club",
        phone: "555-0163",
        dueDate: day(-1),
        dueTime: "18:30",
        items: "Tea and coffee for 15, scones with jam",
        fulfilment: "pickup",
        total: "58.00",
        depositPaid: true,
      },
    },
    {
      input: {
        customerName: "Hartley Plumbing",
        phone: "555-0120",
        dueDate: day(-3),
        dueTime: "07:30",
        items: "Breakfast boxes x 10",
        fulfilment: "delivery",
        deliveryAddress: "9 Quarry Road, Unit B",
        total: "110.00",
        depositPaid: true,
      },
      status: "done",
    },
    {
      input: {
        customerName: "Ines Alvarado",
        phone: "555-0187",
        dueDate: day(2),
        dueTime: "10:00",
        items: "Coffee for 8",
        fulfilment: "pickup",
        total: "30.00",
        depositPaid: false,
        notes: "Called to cancel, her meeting moved.",
      },
      status: "cancelled",
    },
  ];

  for (const { input, status } of examples) {
    const id = await createOrder(input, owner.id, { isExample: true });
    if (status) await setOrderStatus(id, status, owner.id);
  }
  console.log(`Added ${examples.length} example orders, taken by ${owner.name}.`);
}

main();
