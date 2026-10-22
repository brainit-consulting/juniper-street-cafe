import "server-only";
import type { CallToolResult, ServerContext } from "@modelcontextprotocol/server";
import { db } from "@/lib/db";
import { mcpCallLog } from "@/lib/db/schema";
import { SCOPE_LABELS } from "@/lib/mcp-resource";
import { AppError } from "@/lib/errors";

// What a tool hands back: the data for the assistant, and how many rows that was, for the call log.
export type ToolOutput = { data: unknown; rows?: number };

function text(value: string, isError = false): CallToolResult {
  return { content: [{ type: "text", text: value }], ...(isError ? { isError: true } : {}) };
}

/** Every tool goes through this: the person comes from the token, the scope is checked, the call is written down. */
export function logged<A>(
  tool: string,
  scope: string,
  run: (args: A, userId: string) => Promise<ToolOutput>,
) {
  return async (args: A, ctx: ServerContext): Promise<CallToolResult> => {
    const authInfo = ctx.http?.authInfo;
    const userId = typeof authInfo?.extra?.userId === "string" ? authInfo.extra.userId : "";
    if (!userId) throw new Error("No user on this token");

    const clientId = authInfo?.clientId || null;
    const startedAt = Date.now();
    const write = (row: { ok: boolean; rowCount?: number; error?: string }) =>
      db.insert(mcpCallLog).values({
        tool,
        userId,
        clientId,
        args: args ?? null,
        ok: row.ok,
        durationMs: Date.now() - startedAt,
        rowCount: row.rowCount ?? null,
        error: row.error ?? null,
      });

    if (!authInfo?.scopes.includes(scope)) {
      const message = `This connection wasn't allowed to: ${SCOPE_LABELS[scope] ?? scope}. Connect again and allow it.`;
      await write({ ok: false, error: message });
      return text(message, true);
    }

    try {
      const { data, rows } = await run(args, userId);
      await write({ ok: true, rowCount: rows });
      return text(JSON.stringify(data));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await write({ ok: false, error: message });
      if (error instanceof AppError) return text(message, true);
      throw error;
    }
  };
}
