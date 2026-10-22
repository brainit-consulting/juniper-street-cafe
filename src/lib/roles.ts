export const ROLES = ["owner", "staff"] as const;
export type Role = (typeof ROLES)[number];

/** The one role that may open the system page and add people. */
export const ADMIN_ROLE: Role = "owner";

/** What an added person gets when nothing else is said. Never the admin role. */
export const DEFAULT_ROLE: Role = "staff";
