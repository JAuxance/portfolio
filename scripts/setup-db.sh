#!/usr/bin/env bash
set -euo pipefail

cd ~/portfolio

# Load nvm so node is on PATH
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null

# Wait for Postgres readiness
echo "Waiting for Postgres…"
for i in {1..30}; do
  if docker exec auxance-pg pg_isready -U postgres -d portfolio > /dev/null 2>&1; then
    echo "  Postgres ready."
    break
  fi
  sleep 1
done

# .env (read by both Prisma and Next.js) + .env.local (Next-only overrides)
if [ ! -f .env ]; then
  SECRET=$(openssl rand -base64 32)
  cat > .env <<EOF
DATABASE_URL="postgresql://postgres:pw@localhost:5432/portfolio"
NEXTAUTH_SECRET="${SECRET}"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="${SECRET}"
AUTH_TRUST_HOST="true"
ADMIN_EMAIL="jauxance@gmail.com"
ADMIN_PASSWORD="auxance-dev-2026"
EOF
  echo ".env created."
else
  echo ".env already exists — keeping as-is."
fi

# Prisma migrate + seed
npx prisma migrate dev --name init --skip-seed
npx tsx prisma/seed.ts

echo "DB ready."
