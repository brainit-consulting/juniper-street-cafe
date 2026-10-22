// `||`, not `??`: a blank variable counts as missing.
export const BASE_URL = (
  process.env.BETTER_AUTH_URL?.trim() ||
  process.env.APP_URL?.trim() ||
  "http://localhost:3456"
).replace(/\/$/, "");

export const ISSUER = `${BASE_URL}/api/auth`;
export const MCP_RESOURCE = `${BASE_URL}/mcp`;

export const MCP_SCOPES = ["orders:read", "orders:write"] as const;

// What each scope means, in the café's words. The consent screen and the
// Connected apps page show these, never the raw strings.
export const SCOPE_LABELS: Record<string, string> = {
  "orders:read": "Look up catering orders",
  "orders:write": "Add orders and change an order's status",
  openid: "Confirm who you are",
  profile: "See your name",
  email: "See your email address",
  offline_access: "Stay connected without asking you to sign in each time",
};
