import { desc } from "drizzle-orm";
import { db } from "./db";
import { activityLog, user } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Record something that happened, in the app's own words ("order.created").
 * Called from the shared functions in src/lib, so every screen is covered.
 * Never put a password or a whole record in `detail`: ids and changed fields are enough.
 */
export async function logActivity(action: string, detail?: Record<string, unknown>, userId?: string) {
  await db.insert(activityLog).values({ action, detail: detail ?? null, userId: userId ?? null });
}

/** The latest few hundred entries, newest first, for the system page. */
export async function listActivity(limit = 200) {
  return db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      detail: activityLog.detail,
      createdAt: activityLog.createdAt,
      userName: user.name,
    })
    .from(activityLog)
    .leftJoin(user, eq(activityLog.userId, user.id))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}
