# Juniper Street Café: catering orders

A small catering order book for a made-up café. Two staff add orders on their phones, the first screen shows what's
coming up (today and tomorrow first, anything overdue in red), and nothing is ever deleted: orders are marked done or
cancelled.

This app was built for **AI Pro Tips**, a video series that runs one free agent skill per episode on the same app.
Episode 1 built it from scratch with the
[`start-an-app`](https://github.com/brainit-consulting/skills/tree/main/start-an-app) skill in Claude Code. Clone it to
start where the episodes end.

- Videos: the **AI Pro Tips** playlist on the BrainIT Consulting YouTube channel
- Cheat sheets and lessons: [CodeDungeon on Skool](https://www.skool.com/codedungeon-1002)
- Skills: [brainit-consulting/skills](https://github.com/brainit-consulting/skills), a fork of
  [Leon van Zyl's skills](https://github.com/leonvanzyl/skills)

Each episode's finished state has a tag:

- `ep01-built`: the app as start-an-app left it (episode 1).
- `ep02-secured`: after the security-scanner skill's report and its two fixes (episode 2). The report is in
  `audit/2026-10-22/security-report.md`.
- `ep03-healthy`: after the app-health-check skill's report (`audit/2026-10-22.md`) and its fixes (episode 3).
- `ep04-polished`: after the mobile-web-polish skill's changes for iPhone and iPad (episode 4).
- `ep05-agent`: with agent access built in (episode 5): Claude can look up orders, add one and change an order's status.

## Run it on your computer

You need [Node.js](https://nodejs.org) 22 or newer, [Git](https://git-scm.com) and [pnpm](https://pnpm.io/installation) 10.

```bash
git clone https://github.com/brainit-consulting/juniper-street-cafe.git
cd juniper-street-cafe
pnpm install
```

Copy `.env.example` to `.env` (Windows: `copy .env.example .env`; Mac or Linux: `cp .env.example .env`). Make a secret
and paste it after `BETTER_AUTH_SECRET=`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then build and start it:

```bash
pnpm build
pnpm start
```

Open http://localhost:3456. The first account you create is the owner; after that, sign-up closes and only people
the owner adds under **Settings → People** can join. To see it with made-up example orders, stop the app and run
`pnpm db:seed:examples`, then `pnpm start` again.

To start from one episode's version: `git checkout ep01-built` (or another tag above).

## What it is and isn't

- Next.js, SQLite (a file in `data/`), Better Auth with email and password. No email sending, no payments.
- It runs on one computer. Phones can't reach it unless you put it online, which the series doesn't do.
- `src/lib/legal.ts` has a blank contact email for the privacy note; the page shows a marker until you fill it in.
- Everything in it is made up. Don't put real customer data in it before you've checked it yourself.

## Changes by episode

- Episode 1 (our fix after the skill finished): `data/.gitkeep` so a fresh clone has the database folder. Without it, `pnpm build` stopped with "Cannot open
  database because the directory does not exist" (found when we tested a fresh clone on 22 October 2026).
- Episode 2 (security-scanner): security headers, a sign-in limit of 10 tries per 5 minutes, and a 10-character
  minimum for new passwords. Trade-off we measured: the app can't tell people apart when nothing sits in front of it,
  so all sign-ins share one counter. Ten wrong tries by anyone locked out every sign-in, the owner's too, for 5
  minutes. Before putting it online behind a proxy, set Better Auth's `advanced.ipAddress.ipAddressHeaders`.
- Episode 3 (app-health-check): a half-typed order is kept when the session ends (it used to show "This page
  couldn't load" and lose the order), an error page, the privacy contact address (made up), and sign-in pages that
  send a signed-in person home.
- Episode 4 (mobile-web-polish): form fields stay 16px on iPad so Safari doesn't zoom, notch-safe side padding
  (`viewport-fit=cover`), every tap target at least 44px, a shorter sign-in page in phone landscape, and pressed
  states. Measured in Chromium at phone and tablet sizes; not yet tried on a real iPhone.
- Episode 5 (bring-your-own-agent): the skill said this app is a poor fit for it (2 of 17 routes reachable; the work
  lives in Server Actions) and recommended building agent access inside the app. Done that way: an MCP endpoint at
  `/mcp` with four tools (list orders, get an order, add an order, set an order's status; no delete), a consent screen,
  Settings > Connected assistants with "Take access away", and a log of every assistant call on the System page.
  Connect from Claude Code on the same computer: `claude mcp add --transport http juniper-catering http://localhost:3456/mcp`,
  then `/mcp` in Claude Code to sign in and allow it. Run `pnpm build` again after `pnpm install` (a new migration adds tables).

## Licence

MIT. See [LICENSE](LICENSE).
