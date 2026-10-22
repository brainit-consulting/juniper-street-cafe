import { eq } from "drizzle-orm";
import { requireUserAction } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { cateringOrder } from "@/lib/db/schema";

export async function GET() {
  let session;
  try {
    session = await requireUserAction();
  } catch {
    return new Response("Not signed in", { status: 401 });
  }

  // Only this person's own record and the orders they took, never the rest of the book.
  const orders = await db.select().from(cateringOrder).where(eq(cateringOrder.takenBy, session.user.id));

  const data = {
    exportedAt: new Date().toISOString(),
    user: { name: session.user.name, email: session.user.email, createdAt: session.user.createdAt },
    ordersTaken: orders,
  };
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="my-data.json"',
    },
  });
}
