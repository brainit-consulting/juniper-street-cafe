import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { mcp } from "@better-auth/mcp";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import { db } from "./db";
import { logActivity } from "./activity";
import { invitation } from "./db/schema"; // relative on purpose: the Better Auth CLI cannot resolve the alias here
import { user as userTable } from "./db/auth-schema";
import { ROLES, ADMIN_ROLE, DEFAULT_ROLE } from "./roles";
import { BASE_URL, MCP_RESOURCE, MCP_SCOPES } from "./mcp-resource"; // relative on purpose, like the imports above

export const auth = betterAuth({
  baseURL: BASE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  // Off by default outside production, and the built-in sign-in rule (3 tries per 10
  // seconds) lets a patient guesser try ~18 passwords a minute all day. 10 tries per
  // 5 minutes is plenty for a person who mistypes.
  rateLimit: {
    enabled: true,
    customRules: {
      "/sign-in/email": { window: 300, max: 10 },
      "/oauth2/register": { window: 60, max: 5 },
      "/oauth2/token": { window: 60, max: 30 },
    },
  },
  // freshAge 0: by default a session older than a day is "not fresh" and the devices
  // list answers 403 for anyone who has been signed in since yesterday. Deleting an
  // account asks for the password instead. Leave this at 0.
  session: { freshAge: 0 },
  user: {
    additionalFields: {
      role: {
        type: [...ROLES],
        required: false,
        defaultValue: DEFAULT_ROLE,
        input: false, // the security control: without it a user can set their own role
      },
    },
    // No email sending in this app, so deleting an account is confirmed by the typed
    // address and the password in the dialog, not by a link.
    deleteUser: {
      enabled: true,
      beforeDelete: async (target) => {
        const [row] = await db
          .select({ role: userTable.role })
          .from(userTable)
          .where(eq(userTable.id, target.id))
          .limit(1);
        if (row?.role === ADMIN_ROLE) {
          throw new APIError("BAD_REQUEST", {
            message:
              "The owner account can't be deleted from the app, because nobody would be left in charge.",
          });
        }
      },
      // The account is gone by now, so the entry carries the name instead of a link to the person.
      afterDelete: async (gone) => {
        await logActivity("member.left", { name: gone.name });
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // The first account is the owner. After that, only an address with a
        // pending invitation can create one, and the role comes from the invitation.
        before: async (user) => {
          const [row] = await db.select({ n: count() }).from(userTable);
          if (row.n === 0) return { data: { ...user, role: ADMIN_ROLE } };

          const [invite] = await db
            .select()
            .from(invitation)
            .where(
              and(
                eq(invitation.email, user.email.toLowerCase()),
                isNull(invitation.acceptedAt),
                gt(invitation.expiresAt, new Date()),
              ),
            )
            .limit(1);
          if (!invite) {
            throw new APIError("FORBIDDEN", {
              message: "Sign-up is closed. Ask the owner to add you.",
            });
          }
          return { data: { ...user, role: invite.role } };
        },
        // Once the person exists, their invitation is used up, and it is written down that they joined.
        after: async (created) => {
          await db
            .update(invitation)
            .set({ acceptedAt: new Date() })
            .where(and(eq(invitation.email, created.email.toLowerCase()), isNull(invitation.acceptedAt)));
          await logActivity("member.joined", { name: created.name }, created.id);
        },
      },
    },
  },
  plugins: [
    jwt(), // the agent-access plugin signs its access tokens with it
    mcp({
      loginPage: "/sign-in",
      consentPage: "/oauth/consent",
      resource: MCP_RESOURCE,
      // Claude registers itself before anybody has signed in; registering creates
      // a client record, not access. Nothing can be read until a person says Allow.
      allowDynamicClientRegistration: true,
      allowUnauthenticatedClientRegistration: true,
      scopes: ["openid", "profile", "email", "offline_access", ...MCP_SCOPES],
      clientRegistrationDefaultScopes: ["openid", "profile", "email"],
      // Written out on purpose, not derived from MCP_SCOPES.
      clientRegistrationAllowedScopes: ["offline_access", "orders:read", "orders:write"],
    }),
    cimd({
      fetchClientMetadataResource,
      metadataProfile: "mcp-2026-07-28",
    }),
    nextCookies(), // must stay last in the list
  ],
});
