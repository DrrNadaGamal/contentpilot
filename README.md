# ContentPilot

**Multi-channel content automation platform with human-in-the-loop approval.**
React 19 · Next.js 16 (App Router) · TypeScript · Prisma · Recharts · Tailwind CSS 4
English + Arabic (full RTL) UI.

> **Attribution:** This project was built by an AI assistant (Instinct) under the
> direction of **Nada Gamal** — scope, product decisions, review and acceptance
> are hers; the code was AI-assisted. It is a **portfolio demo**: seeded data
> only, no real social accounts are connected and nothing posts anywhere.

![Dashboard](docs/screenshots/01-dashboard.png)

## What it does

- **Content calendar** — month view of scheduled/published posts across brands, reschedule any post, unscheduled queue.
- **Composer** — multi-channel post editor (X, LinkedIn, Facebook, Instagram) with per-channel live preview, character limits, media attachment, and an optional Arabic version per post.
- **Approval workflow** — every draft, AI-assisted or manual, must be approved by an OWNER/ADMIN before it can be scheduled. **Nothing auto-publishes.** Approval history is kept with reviewer, decision and note.
- **Multi-brand workspaces** — one agency workspace, several client brands, team roles (OWNER, ADMIN, MEMBER, CLIENT).
- **Media library** — tagged, searchable asset library used by the composer.
- **Analytics** — engagement trend, per-channel breakdown, post status mix, best-weekday chart, follower totals (90 days of seeded metrics per brand and channel).
- **Internationalization** — full English and Arabic UI with proper RTL layout, Arabic-Indic numerals and localized dates.

## Screenshots

| | |
|---|---|
| Calendar | ![Calendar](docs/screenshots/02-calendar.png) |
| Composer | ![Composer](docs/screenshots/03-composer.png) |
| Approvals | ![Approvals](docs/screenshots/04-approvals.png) |
| Analytics | ![Analytics](docs/screenshots/06-analytics.png) |
| Arabic RTL | ![RTL](docs/screenshots/09-dashboard-ar-rtl.png) |

More in `docs/screenshots/` (login, media, team, settings, Arabic calendar & composer).

## Run it

```bash
npm install          # also runs prisma generate
npm run db:push      # creates the SQLite demo database (dev.db)
npm run db:seed      # seeds 4 users, 3 brands, 32 posts, 12 assets, ~90 days of metrics
npm run dev          # http://localhost:3000
```

Sign in on `/login` by picking a demo user (no passwords in the demo; role-based
behavior still applies — sign in as **Nada Gamal (OWNER)** or **Sarah Chen (ADMIN)**
to use the approval buttons).

### Postgres instead of SQLite

The Prisma schema is database-agnostic. To run against Postgres:

```bash
docker compose up -d db
DATABASE_URL="postgresql://contentpilot:contentpilot@localhost:5432/contentpilot?schema=public" npx prisma db push
```

(point `DATABASE_URL` in `.env` at the Postgres URL before `npm run db:seed`.)

## Architecture

```
src/
  app/
    (auth)/login        demo sign-in
    (app)/              dashboard, calendar, composer, approvals, media, analytics, team, settings
    api/                login/logout/locale, posts (create, reschedule), approvals
  components/           sidebar, post card, badges, calendar/composer/approvals/analytics clients
  lib/                  prisma client, session (cookie), i18n dictionaries (en/ar), utils
prisma/
  schema.prisma         users, workspaces, brands, posts, approvals, media, analytics metrics
  seed.ts               deterministic demo data
```

## Benchmark against paid tools (honest)

Compared with Buffer (~$6/channel/mo), Hootsuite (~$99/mo) and ContentStudio (~$25/mo):

**On par (demo scope):**
- Visual content calendar with drag-free rescheduling
- Multi-channel composer with per-channel previews and limits
- Approval queue with roles and decision history
- Media library, multi-brand workspaces, analytics dashboards
- Arabic/RTL support, which several paid tools still handle poorly

**What the paid products have and this demo does not (yet):**
- Real publishing through official social APIs (this demo intentionally connects to nothing)
- Real analytics ingestion from the platforms (metrics here are seeded)
- Social listening / inbox, RSS feeds, link shortening, UTM automation
- Native mobile apps, SSO, audit logs, billing
- Production auth (the demo login is role selection, not authentication)

## Notes

- Demo asset images in `public/media/` are generated SVG covers; in a real
  deployment they would be user uploads.
- `prisma/dev.db` is intentionally git-ignored; run the seed to reproduce the data.

## Hosted demo

Live demo: https://contentpilot-rho.vercel.app (pick a demo user on the sign-in screen; there are no passwords). It is fully interactive: create posts, submit and approve them. Honest note on how: serverless routes on Vercel each get their own temporary filesystem, so SQLite cannot be shared between them directly. For the demo, the SQLite file is stored in a Vercel Blob store: each request loads the newest copy and every write uploads a new one (last writer wins, no locking). All visitors share one database, which resets to the seed data after 6 hours. This is a demo workaround; a real deployment should use Postgres. The layout is responsive: the sidebar becomes a top bar with scrolling navigation on phones, and the calendar scrolls sideways.
