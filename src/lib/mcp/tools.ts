import "server-only";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/server";
import { AppError } from "@/lib/errors";
import { ORDER_STATUSES, createOrder, getOrder, listOrders, orderInput, setOrderStatus } from "@/lib/orders";
import { logged } from "./log";

type OrderRow = NonNullable<Awaited<ReturnType<typeof getOrder>>>;

/** Pick the fields to hand over by name, so nothing added to the table later leaks out by accident. */
function shape({ order, takenByName }: OrderRow) {
  return {
    id: order.id,
    customerName: order.customerName,
    phone: order.phone,
    dueDate: order.dueDate,
    dueTime: order.dueTime,
    items: order.items,
    fulfilment: order.fulfilment,
    deliveryAddress: order.deliveryAddress,
    total: (order.totalCents / 100).toFixed(2),
    depositPaid: order.depositPaid,
    notes: order.notes,
    status: order.status,
    takenBy: takenByName,
  };
}

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");
const NO_SUCH_ORDER = "There is no order with that id. Use list_orders to find the right one.";

export function registerTools(server: McpServer) {
  server.registerTool(
    "list_orders",
    {
      title: "List catering orders",
      description:
        "List the café's catering orders, latest due date first. Filter by status, by a customer's name or phone number, or by due date. Use it to answer what is coming up, or to find an order's id before reading or changing it.",
      inputSchema: z.object({
        status: z.enum(ORDER_STATUSES).optional(),
        search: z.string().max(100).optional().describe("Part of a customer's name or phone number."),
        from: date.optional().describe("Only orders due on or after this date."),
        to: date.optional().describe("Only orders due on or before this date."),
        limit: z.number().int().min(1).max(50).default(20),
      }),
      annotations: { readOnlyHint: true },
    },
    logged("list_orders", "orders:read", async ({ status, search, from, to, limit }) => {
      const found = await listOrders({ status, search, from, to, limit: limit + 1 });
      const more = found.length > limit;
      const orders = found.slice(0, limit).map(shape);
      return { data: { orders, more }, rows: orders.length };
    }),
  );

  server.registerTool(
    "get_order",
    {
      title: "Look up one order",
      description: "Read one catering order in full. The id comes from list_orders.",
      inputSchema: z.object({ id: z.string().max(64) }),
      annotations: { readOnlyHint: true },
    },
    logged("get_order", "orders:read", async ({ id }) => {
      const row = await getOrder(id);
      if (!row) throw new AppError(NO_SUCH_ORDER);
      return { data: shape(row), rows: 1 };
    }),
  );

  server.registerTool(
    "add_order",
    {
      title: "Add a catering order",
      description:
        "Write down a new catering order as upcoming. Ask the person for anything missing: customer, phone, date, time, what was ordered, pickup or delivery (and the address for delivery), and the total.",
      inputSchema: z.object({
        customerName: z.string().max(200),
        phone: z.string().max(60),
        dueDate: date.describe("Day it is needed, YYYY-MM-DD."),
        dueTime: z.string().describe("Time it is needed, 24-hour HH:MM."),
        items: z.string().max(2000).describe('Free text, like "coffee for 12, a tray of cinnamon rolls".'),
        fulfilment: z.enum(["pickup", "delivery"]),
        deliveryAddress: z.string().max(300).optional().describe("Required when fulfilment is delivery."),
        total: z.string().describe('Dollars as a number, like "85" or "85.50".'),
        depositPaid: z.boolean().default(false),
        notes: z.string().max(2000).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    logged("add_order", "orders:write", async (input, userId) => {
      // The same rules the order form applies.
      const parsed = orderInput.safeParse(input);
      if (!parsed.success) throw new AppError(parsed.error.issues.map((i) => i.message).join(" "));
      const id = await createOrder(parsed.data, userId, { via: "agent" });
      const row = await getOrder(id);
      return { data: row ? shape(row) : { id }, rows: 1 };
    }),
  );

  server.registerTool(
    "set_order_status",
    {
      title: "Change an order's status",
      description:
        "Mark an order upcoming, done or cancelled. It does not delete anything; a cancelled order stays in the book. The id comes from list_orders.",
      inputSchema: z.object({ id: z.string().max(64), status: z.enum(ORDER_STATUSES) }),
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    logged("set_order_status", "orders:write", async ({ id, status }, userId) => {
      const found = await setOrderStatus(id, status, userId, "agent");
      if (!found) throw new AppError(NO_SUCH_ORDER);
      const row = await getOrder(id);
      return { data: row ? shape(row) : { id, status }, rows: 1 };
    }),
  );
}
