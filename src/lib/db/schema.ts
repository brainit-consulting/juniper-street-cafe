import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

/**
 * A pending permission to create an account. The owner adds an address here,
 * the sign-up hook in auth.ts checks it, and it is marked accepted once used.
 */
export const invitation = sqliteTable("invitation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull(), // stored lower-cased
  role: text("role", { enum: ["owner", "staff"] }).notNull(),
  invitedBy: text("invited_by").references(() => user.id, { onDelete: "set null" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
});

/**
 * A catering order. Shared by the whole team: both roles see every order, so
 * there is no owner column. `takenBy` records who wrote it down, and keeps
 * the order if that person's account is ever removed.
 */
export const cateringOrder = sqliteTable("catering_order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  dueDate: text("due_date").notNull(), // YYYY-MM-DD, in the café's own time zone
  dueTime: text("due_time").notNull(), // HH:MM, 24-hour
  items: text("items").notNull(), // free text: "coffee for 12, a tray of cinnamon rolls"
  fulfilment: text("fulfilment", { enum: ["pickup", "delivery"] }).notNull(),
  deliveryAddress: text("delivery_address"),
  totalCents: integer("total_cents").notNull().default(0),
  depositPaid: integer("deposit_paid", { mode: "boolean" }).notNull().default(false),
  notes: text("notes"),
  status: text("status", { enum: ["upcoming", "done", "cancelled"] })
    .notNull()
    .default("upcoming"),
  takenBy: text("taken_by").references(() => user.id, { onDelete: "set null" }),
  // Made-up sample orders. The owner can remove these, and only these, from the System page.
  isExample: integer("is_example", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/** What happened, when, and who did it. Written by the shared functions in src/lib. */
export const activityLog = sqliteTable("activity_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  detail: text("detail", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Every call an assistant made through /mcp: which tool, what it asked for, and what came back. */
export const mcpCallLog = sqliteTable("mcp_call_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  clientId: text("client_id"),
  tool: text("tool").notNull(),
  args: text("args", { mode: "json" }),
  ok: integer("ok", { mode: "boolean" }).notNull(),
  durationMs: integer("duration_ms"),
  rowCount: integer("row_count"),
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});
