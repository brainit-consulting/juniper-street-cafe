/** The café's own time zone. "Today" and "tomorrow" are worked out here, never from the server's clock. */
export const APP_TIME_ZONE = process.env.APP_TIME_ZONE || "America/Chicago";

/** Today's date in the café's time zone, as YYYY-MM-DD. */
export function todayInCafe(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Add days to a YYYY-MM-DD date. Done in UTC so the café's clock changes can't shift it. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function weekdayShort(date: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(parts(date));
}

export function dayOfMonth(date: string): string {
  return String(Number(date.slice(8, 10)));
}

/** "Saturday 25 October" */
export function longDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(parts(date));
}

/** "10:30 am" from "10:30" */
export function clockTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function dollars(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
