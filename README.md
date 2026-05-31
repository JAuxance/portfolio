# Auxance Portfolio

Personal portfolio + admin CMS for Auxance Jourdan.

- **Public site:** `/[locale]` — long-scroll portfolio in EN / FR
- **Admin CMS:** `/admin` — credentialed editor for every content piece

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion 11 · next-intl · Prisma + PostgreSQL · NextAuth v5

## Setup

```bash
pnpm install                         # or `npm install`
cp .env.example .env.local           # fill in DATABASE_URL, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
pnpm prisma migrate dev --name init
pnpm db:seed
pnpm dev
```

### Running from a WSL share on Windows

If you're editing this project from Windows but the files live under `\\wsl.localhost\...`, run **all node commands from inside WSL**, not PowerShell. The Windows Node toolchain spawns child processes via `CMD.EXE`, which can't `cd` into UNC paths — Next.js webpack will fail to resolve its own loaders. Either:

- `wsl -d <distro>` and run `pnpm install && pnpm dev` from inside,
- or `net use Z: \\wsl.localhost\<distro>` and work from `Z:\home\you\portfolio` (the drive letter sidesteps the UNC issue),
- or simply move the project to a Windows-native path (`C:\dev\portfolio`).

`pnpm install` on the WSL share from Windows also crashes (`copy_on_write` panic). Use `npm install` or one of the workarounds above.

Then open:
- Public site → http://localhost:3000/en
- Admin → http://localhost:3000/admin/login (use ADMIN_EMAIL / ADMIN_PASSWORD from `.env.local`)

## Run with Docker

Both flavors ship Postgres in the same stack, so there's nothing to install or seed by hand — just Docker.

### Development (hot reload)

```bash
docker compose up --build
```

Postgres comes up, the app runs `prisma migrate deploy` + `db:seed`, then starts `next dev` (Turbopack). Your source is bind-mounted, so edits hot-reload. Data persists in the `pgdata` volume.

- Public → http://localhost:3000/en
- Admin → http://localhost:3000/admin/login

Stop with `docker compose down` (add `-v` to also wipe the database).

### Production (optimized standalone image)

```bash
./docker/prod.sh
```

This builds the multi-stage [Dockerfile](Dockerfile) into a minimal standalone runtime image (`output: 'standalone'`). Because the public pages are statically prerendered from Postgres, the script brings the database **up and seeds it before building**, then starts the app:

`db → migrate + seed → build → start`. Re-run the script to rebuild after code changes; `docker compose -f docker-compose.prod.yml down` to stop.

> The build reaches the seeded database through `host.docker.internal:5432`. If your Docker setup can't resolve that, override it: `BUILD_DATABASE_URL=postgresql://... ./docker/prod.sh`.

### Notes

- Credentials come from `.env` (`NEXTAUTH_SECRET`, `ADMIN_*`…); `DATABASE_URL` is overridden to the in-stack `db` service automatically.
- pnpm's allowed build scripts (Prisma, sharp, esbuild) are whitelisted in [pnpm-workspace.yaml](pnpm-workspace.yaml) — without it, pnpm v11 aborts `install` with `ERR_PNPM_IGNORED_BUILDS` (this also fixes a bare `pnpm dev`/`pnpm install` on the host).

## Database

PostgreSQL. For dev:

```bash
docker run --name auxance-pg -e POSTGRES_PASSWORD=pw -e POSTGRES_DB=portfolio -p 5432:5432 -d postgres:16
# DATABASE_URL="postgresql://postgres:pw@localhost:5432/portfolio"
```

Or use Neon / Supabase.

## Architecture

- All public content lives in Postgres. Public Server Components read directly via Prisma.
- Admin writes through typed Server Actions in `src/actions/*`.
- Every mutation calls `revalidatePath('/', 'layout')`, so changes appear on the public site without a redeploy.
- i18n: `next-intl`. UI strings in `messages/{en,fr}.json`. Content strings stored bilingually on each Prisma model.
- Auth: NextAuth v5 credentials provider; single AdminUser row, bcrypt-hashed.

## Folder map

```
src/
├── app/
│   ├── [locale]/                 # public site (EN / FR)
│   │   ├── (sections)/           # home page sections
│   │   ├── work/[slug]/          # project detail page
│   │   └── page.tsx              # home
│   ├── admin/
│   │   ├── login/                # public login form
│   │   └── (authed)/             # auth-gated admin pages
│   │       ├── work/             # canonical list + inline edit
│   │       ├── now/
│   │       ├── research/
│   │       ├── references/
│   │       ├── trajectory/
│   │       ├── profile/
│   │       └── settings/
│   ├── api/auth/[...nextauth]/   # NextAuth handlers
│   └── globals.css               # design tokens (Tailwind v4 @theme)
├── actions/                      # typed server actions per section
├── components/
│   ├── public/                   # site components
│   └── admin/                    # admin shell + edit panels
├── lib/                          # db, auth, i18n, tokens, motion
└── types/content.ts
```

## Deploy (Vercel)

1. Push to GitHub.
2. Connect repo to Vercel.
3. Provision Postgres (Neon recommended). Add `DATABASE_URL` to Vercel env.
4. Add `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://yourdomain`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
5. Build command: `prisma generate && next build` (already set in `package.json`).
6. After first deploy, run `pnpm prisma migrate deploy && pnpm db:seed` against the prod DB.
7. Sign in at `/admin/login`, then immediately change the password in production by re-running the seed with a new `ADMIN_PASSWORD`.

## Notes

- Atmospheric glows live in a single `<GlowBackdrop />` component. Adjust the 5 instances in `src/components/public/atmospheric-glow.tsx` to fine-tune.
- The chat input on the hero is a static placeholder. To wire it to Claude:
  - Add an `/api/chat` route that reads from `db.profile/projects/etc.` and calls `claude-sonnet-4-6` with that content as system context.
  - Pass `onSubmit` to `<ChatInput />` in `src/app/[locale]/(sections)/hero.tsx`.
- Mobile blur is reduced from 24px → 16px in `globals.css` to avoid Safari jank.
- `prefers-reduced-motion` is honored: all transforms collapse to fade-only.
