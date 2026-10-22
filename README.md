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

## Changes after the skill finished

- `data/.gitkeep` so a fresh clone has the database folder. Without it, `pnpm build` stopped with "Cannot open
  database because the directory does not exist" (found when we tested a fresh clone on 22 October 2026).

- Episode 2 (security-scanner): security headers, a sign-in limit of 10 tries per 5 minutes, and a 10-character
  minimum for new passwords. Trade-off we measured: the app can't tell people apart when nothing sits in front of it,
  so all sign-ins share one counter. Ten wrong tries by anyone locked out every sign-in, the owner's too, for 5
  minutes. Before putting it online behind a proxy, set Better Auth's `advanced.ipAddress.ipAddressHeaders`.

## Licence

MIT. See [LICENSE](LICENSE).
