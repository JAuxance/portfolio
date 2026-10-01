#!/usr/bin/env bash
# Non-destructive production update: apply migrations, sync the site copy
# (no full seed, so /admin edits survive), then rebuild the app.
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "▶ 1/2  Migrations + content sync…"
# The migrate image bakes in prisma/ — rebuild it so it sees the new files.
$COMPOSE build migrate
$COMPOSE run --rm migrate sh -c \
  "node_modules/.bin/prisma migrate deploy && node_modules/.bin/tsx prisma/sync-content.ts"

echo "▶ 2/2  Rebuilding the app…"
$COMPOSE up -d --build app

echo "✅ Done — check /en and /fr"
