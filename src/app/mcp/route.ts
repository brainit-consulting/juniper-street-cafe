import { requireMcpAuth } from "@better-auth/mcp";
import { createMcpHandler, McpServer, originValidationResponse } from "@modelcontextprotocol/server";
import { auth } from "@/lib/auth";
import { MCP_RESOURCE } from "@/lib/mcp-resource";
import { connectionStillAllowed } from "@/lib/mcp/still-allowed";
import { registerTools } from "@/lib/mcp/tools";

export const runtime = "nodejs";

const mcp = createMcpHandler(() => {
  const server = new McpServer({ name: "juniper-catering", version: "1.0.0" });
  registerTools(server);
  return server;
});

// A missing or bad token is a real 401 with WWW-Authenticate, which is what
// makes Claude start sign-in. Reading is the least a connection needs; the
// tools that write check orders:write themselves.
const authed = requireMcpAuth(
  auth,
  async (request, claims) => {
    const scopes = typeof claims.scope === "string" ? claims.scope.split(" ").filter(Boolean) : [];
    const rawClientId = claims.client_id ?? claims.azp;
    const clientId = typeof rawClientId === "string" ? rawClientId : "";

    // A signed token stays good for an hour; this is what makes Revoke stop the next call.
    if (!(await connectionStillAllowed(String(claims.sub ?? ""), clientId))) {
      const metadata = `${new URL(MCP_RESOURCE).origin}/.well-known/oauth-protected-resource/mcp`;
      return new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          error: { code: -32001, message: "This connection has been revoked." },
          id: null,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "WWW-Authenticate": `Bearer error="invalid_token", error_description="This connection has been revoked", resource_metadata="${metadata}"`,
          },
        },
      );
    }

    return mcp.fetch(request, {
      authInfo: {
        token: request.headers.get("authorization")?.replace(/^\S+\s+/, "") ?? "",
        clientId,
        scopes,
        expiresAt: claims.exp,
        extra: { userId: claims.sub },
      },
    });
  },
  { resource: MCP_RESOURCE, requiredScopes: ["orders:read"], challengeScopes: ["orders:read", "orders:write"] },
);

// POST only, and no CORS headers: this route carries the token, so a page on another site is refused.
export async function POST(request: Request) {
  const refused = originValidationResponse(request, [new URL(MCP_RESOURCE).hostname]);
  return refused ?? authed(request);
}
