#!/usr/bin/env bash
# One-command production-mode run.
#
# Ordered because the optimized image prerenders DB-backed pages at build time,
# so Postgres must be up AND seeded before `app` is built.
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.prod.yml"

echo "▶ 1/4  Starting Postgres…"
$COMPOSE up -d db

echo "▶ 2/4  Waiting for Postgres to become healthy…"
cid="$($COMPOSE ps -q db)"
until [ "$(docker inspect -f '{{.State.Health.Status}}' "$cid" 2>/dev/null)" = "healthy" ]; do
  sleep 1
done

echo "▶ 3/4  Applying migrations + seeding (needed before the build prerenders pages)…"
$COMPOSE run --rm migrate

echo "▶ 4/4  Building the optimized image + starting the app…"
$COMPOSE up -d --build app

echo
echo "✅ Up:"
echo "   Public → http://localhost:3000/en"
echo "   Admin  → http://localhost:3000/admin/login"
echo
echo "   Logs:  $COMPOSE logs -f app"
echo "   Stop:  $COMPOSE down        (add -v to also wipe the database volume)"
