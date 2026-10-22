# Security Report: Juniper Street Café catering orders

Date: 2026-10-22 · Standard: OWASP Top 10:2025 · Method: read the source, `pnpm audit --prod`, pattern search. Read-only. The app was **not** run or attacked, so nothing below was confirmed against a live server.

## Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 3 |
| Info | 3 |

**Risk score: 14 (Moderate)**, from 2 Medium (8) + 3 Low (6). **No Critical or High findings.** A finding is not a breach: nothing here lets a stranger into the order book. The score is high only because a few defence-in-depth items are missing.

Stack: Next.js 16.4.2, React 19, Better Auth 1.7 (email + password), Drizzle + SQLite file (`data/app.db`), Zod. Runs locally on port 3456; no deployment.

## Findings

### M1. No security headers (Medium) — A02, CWE-693
`next.config.ts:3-12` sets no headers. No `X-Frame-Options`/`frame-ancestors` (the sign-in page can be framed for clickjacking), no `X-Content-Type-Options`, no `Referrer-Policy`, no CSP.
Not measured against a running server; read from config only.
Fix:
```ts
async headers() {
  return [{ source: "/(.*)", headers: [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  ]}];
}
```

### M2. Sign-in brute-force protection is unconfigured (Medium) — A06/A07, CWE-307
`src/lib/auth.ts:15` enables email + password with no `rateLimit` block and no lockout. Better Auth ships a default limiter, but it is documented to apply in production only; I did not test what it does under `next dev`. Passwords have only the default 8-character minimum (`auth-form.tsx:55`, client-side attribute; server default also 8).
Fix: add `rateLimit: { enabled: true, window: 60, max: 10 }` and `emailAndPassword: { enabled: true, minPasswordLength: 10 }`, then test with 20 wrong sign-ins.

### L1. Vulnerable dev-tool dependencies (Low) — A03, CWE-1395
`pnpm audit --prod` reports 2: `braces` (high, DoS via deeply nested glob) under `shadcn > fast-glob`, and `esbuild` (moderate, dev-server request reading) under `better-auth > drizzle-kit`. Both sit in command-line tooling, not in code that handles web requests, so I rate them Low here. The "high" label is the advisory's, not mine.
Fix: `pnpm update shadcn drizzle-kit better-auth`, re-run audit. If still flagged, move `shadcn` to devDependencies (it is a CLI).

### L2. Session cookies are only "Secure" once the site address is https (Low) — A04/A07, CWE-614
`.env`: `BETTER_AUTH_URL=http://localhost:3456`. Fine for local use. If this ever goes online, set `BETTER_AUTH_URL`/`APP_URL` to the https address, or the cookie flags will not be hardened.

### L3. Activity log is a database table only (Low) — A09, CWE-778
`src/lib/activity.ts:11` records order and team changes (good, no passwords or whole records). It records **no sign-in successes, failures, or denied access attempts**, so a guessing attack would leave no trace.
Fix: log `auth.signin_failed` via a Better Auth `hooks.after` on `/sign-in/email`.

### I1. Every signed-in person can edit every order (Info) — A01
`orders/actions.ts` and `lib/orders.ts:114,140` check "is signed in", not ownership. This is stated design (`schema.ts` comment and People page: "Everyone you add can see and change every order"). Noted so the owner knows staff can also cancel orders.

### I2. Search uses LIKE with the user's text (Info) — A05
`lib/orders.ts:80-81` is parameterised by Drizzle (no SQL injection). `%` and `_` typed by a user act as wildcards, which is harmless here.

### I3. Empty catch blocks (Info) — A10
`settings/export/route.ts:10` and `lib/system-status.ts:26` swallow errors deliberately (401 and "database not reachable"). Both fail closed.

## Category-by-category

| # | Category | Result | What was checked |
|---|---|---|---|
| A01 | Broken Access Control | No issues (see I1) | Every page calls `requireUser`/`requireAdmin`; every server action calls `requireUserAction`/`requireAdminAction`; export route returns 401 and filters by `takenBy`; People and System pages return 404 to staff; role field has `input: false` so users can't set their own role. No middleware/proxy file, but each route guards itself. |
| A02 | Security Misconfiguration | M1 | `.env` is git-ignored, never committed (`git log -- .env` empty), secret is 44 characters and not a placeholder. System page reports set/not-set only, never values. |
| A03 | Supply Chain | L1 | Lockfile present (`pnpm-lock.yaml`). No CDN scripts. Fonts via `next/font` (self-hosted at build). |
| A04 | Cryptographic Failures | L2 | Password hashing is Better Auth's (not hand-rolled). No `Math.random`; ids use `crypto.randomUUID()`. |
| A05 | Injection | No issues (see I2) | No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `child_process`, or raw SQL with user input. All input passes Zod. React escapes output. |
| A06 | Insecure Design | M2 | Sign-up is closed: first account becomes owner, later ones need an unexpired invitation (`auth.ts:52-72`). Owner account can't be deleted. |
| A07 | Authentication Failures | M2 | Sessions handled by Better Auth. Account deletion needs password. Sign-up closed message is generic enough; invite check does reveal whether an address is invited (minor). |
| A08 | Integrity Failures | No issues | No deserialization, no dynamic code, no CDN scripts. Mass assignment blocked: actions pick named fields only (`TEXT_FIELDS`). |
| A09 | Logging & Alerting | L3 | See L3. No sensitive data in logs. |
| A10 | Exceptional Conditions | No issues (see I3) | Guards throw rather than fail open; unknown order ids return not-found. |

## Fix order
1. **M2** rate limit and password length: the only item that makes guessing a password easier.
2. **M1** headers: five lines.
3. **L1** `pnpm update`, re-audit.
4. **L3** log failed sign-ins (before it goes online).
5. **L2** use an https address when deployed.

## Not covered
Running the app (headers, cookies and rate limiting above are read from code, not observed). The SQLite file's contents. Windows file permissions on `data/app.db`. Backups.
