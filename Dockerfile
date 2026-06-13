# syntax=docker/dockerfile:1

# ──────────────────────────────────────────────────────────────────────────
# Multi-stage production build → minimal standalone runtime image.
# ──────────────────────────────────────────────────────────────────────────

# ── deps: install node_modules (also used by the prod `migrate` service) ──
FROM node:22-bookworm-slim AS deps
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# ── builder: compile the Next.js app ──
FROM node:22-bookworm-slim AS builder
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `next build` statically prerenders the public pages (generateStaticParams for
# locales + project slugs), and those pages read from Postgres — so a reachable,
# SEEDED database is required at build time. docker/prod.sh wires this up.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ── runner: tiny image, runs the standalone server as non-root ──
FROM node:22-bookworm-slim AS runner
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Public assets + the traced standalone server + static chunks.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma's generated client + native query engine are loaded dynamically and are
# not reliably traced into the standalone bundle — copy them in explicitly.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Runtime-written admin uploads (mounted as a named volume in compose) — the
# server runs as uid 1001, so the directory must be writable by it.
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
