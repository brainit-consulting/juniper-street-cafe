import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export type Check = { name: string; ready: boolean; hint: string };

/** Whether things are set up, never what they are set to. No keys, no addresses, no tails. */
export async function getSystemStatus() {
  const checks: Check[] = [
    {
      name: "Sign-in secret",
      ready: Boolean(process.env.BETTER_AUTH_SECRET),
      hint: "BETTER_AUTH_SECRET in .env",
    },
    {
      name: "Site address",
      ready: Boolean(process.env.APP_URL || process.env.BETTER_AUTH_URL),
      hint: "APP_URL in .env. Set it to the real web address once the site is online.",
    },
  ];

  let database = false;
  try {
    db.run(sql`select 1`);
    database = true;
  } catch {
    database = false;
  }

  return { checks, database };
}
