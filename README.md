# Goodplays

[![CI](https://github.com/vissicchioj/GoodPlays/actions/workflows/ci.yml/badge.svg)](https://github.com/vissicchioj/GoodPlays/actions/workflows/ci.yml)

**Live:** https://good-plays-jhti.vercel.app

Goodplays is a video game library and backlog tracker, inspired by Goodreads and
Letterboxd. Discover games through IGDB, save them to your personal library,
track where you are with each one, and organize your collection with your own
tags.

<!--
  Screenshots: add images to docs/screenshots/ and uncomment.
  ![Discover page](docs/screenshots/discover.png)
  ![Library with filters](docs/screenshots/library.png)
  ![Game details modal](docs/screenshots/modal.png)
-->

---

## Features

### Discover
- Trending games from the last 90 days, ranked by rating count
- Search the full IGDB catalog
- Game details: cover, summary, release date, rating, genres, platforms
- One-click **Add to Backlog**, with "already in your library" detection
- Signed-out visitors are sent to GitHub sign-in when they try to add a game

### Library
- Track each game as **Backlog**, **Playing**, **Completed**, or **Dropped**
- Filter by status, genre, and custom tag, combined, with live counts
- **Custom tags**: create, attach, rename, and delete your own tags
  (case-insensitive, so "RPG" and "rpg" are the same tag)
- Optimistic status updates, and a confirmation step before removing a game

### Across the app
- GitHub sign-in with database-backed sessions
- Responsive, mobile-friendly layout. Hover-only controls are disabled on
  touch screens so a tap can't trigger a hidden button.
- Keyboard and screen-reader support: focusable cards, Escape closes the modal,
  labelled controls
- Loading skeletons, friendly error pages with retry, and a custom 404

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Auth | NextAuth.js with GitHub OAuth and the Prisma adapter |
| Database | PostgreSQL on [Neon](https://neon.tech), accessed through Prisma 7 (`@prisma/adapter-pg`) |
| Game data | [IGDB API](https://api-docs.igdb.com), authenticated with Twitch client credentials |
| Testing | Vitest |
| CI / hosting | GitHub Actions, Vercel |

---

## Architecture

```
src/
├── app/                      # Routes (Next.js App Router)
│   ├── layout.tsx            # Shared frame: navbar, footer, session provider
│   ├── page.tsx              # Discover
│   ├── library/              # My Library (+ loading.tsx skeleton)
│   ├── api/games/search/     # Route handler: IGDB search + "in your library" flags
│   ├── api/auth/             # NextAuth endpoints
│   ├── error.tsx             # Error page with retry
│   └── not-found.tsx         # 404
├── components/               # React components (games/, library/, layout/, auth/)
├── server/
│   ├── actions/              # Server Actions: every write to the database
│   └── queries/              # Server-side reads (database and IGDB)
├── lib/                      # Shared helpers: db, auth, igdb, statuses, tags
└── types/                    # Shared TypeScript types
prisma/
├── schema.prisma             # Data model
└── migrations/               # Versioned SQL migrations
```

### How data flows
- **Reads:** the Library page is a Server Component that loads the user's
  games and tags with Prisma and passes them to a Client Component for
  filtering. Discover calls `/api/games/search`, which queries IGDB and marks
  games already in the user's library.
- **Writes:** every change (add a game, change status, tag, remove) is a
  **Server Action**. Each action checks the session, validates its input, and
  scopes every database query to the signed-in user (`where: { id, userId }`),
  so users can only ever change their own data.
- **Game data is trusted only from IGDB:** when adding a game, the browser
  sends only the IGDB ID. The server fetches the details itself, so a user
  can't change the shared game catalog.

### Data model
- **User / Account / Session**: authentication (NextAuth)
- **Game**: shared catalog, one row per IGDB game (title, cover, genres, platforms...)
- **GameLog**: one user's entry for one game, with its status (unique per user + game)
- **LibraryTag**: a tag owned by one user (names unique per user)
- **GameLogTag**: attaches a tag to a library entry

---

## Running locally

### Prerequisites
- Node.js 22 or newer
- A [Neon](https://neon.tech) project (free tier is fine). Use a separate
  **development branch** rather than your production database.
- A [GitHub OAuth app](https://github.com/settings/developers) for local
  development, with callback URL `http://localhost:3000/api/auth/callback/github`
- [Twitch developer credentials](https://dev.twitch.tv/console) for IGDB

### Setup
```bash
git clone https://github.com/vissicchioj/GoodPlays.git
cd GoodPlays
npm install                # also runs `prisma generate`
```

Create a `.env` file in the project root (it's git-ignored):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string, used by the app |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string, used by Prisma CLI / migrations |
| `NEXTAUTH_URL` | `http://localhost:3000` locally |
| `NEXTAUTH_SECRET` | Random string, e.g. `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | From your GitHub OAuth app |
| `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` | From the Twitch developer console |

Then apply the migrations and start the dev server:
```bash
npx prisma migrate deploy
npm run dev
```

### Scripts
| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production (includes type checking) |
| `npm test` | Run the unit tests once (`npm run test:watch` to re-run on save) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler without building |

---

## Testing and CI

Unit tests (Vitest) cover the shared helpers and every Server Action. The
action tests mock the session and database to verify the security rules:
signed-out callers are rejected, and every query is limited to the caller's
own rows.

GitHub Actions runs lint, tests, and a full production build on every push
and pull request (see `.github/workflows/ci.yml`).

---

## Deployment

Hosted on Vercel, which deploys automatically on every push to `master`.

Production and development use separate Neon branches and separate GitHub
OAuth apps. Schema changes follow this workflow:

1. `npx prisma migrate dev --create-only --name <change>`: generate the SQL
   and review it before it runs
2. `npx prisma migrate dev`: apply it to the development branch and test
3. Back up production (create a Neon branch), then run `npx prisma migrate deploy`
   against production
4. Push the code; Vercel deploys it against the already-migrated database

---

## Roadmap

- **Profile**: your six favorite games of all time
- **Gaming journal**: entries and playtime logs for games you're playing
- **Reviews**: star ratings and written reviews, marked "Not completed" when relevant
- **Friends**: add friends and see what they're playing

---

© 2026 Jake Vissicchio. All rights reserved.
