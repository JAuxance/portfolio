#!/usr/bin/env bash
set -euo pipefail

# 1. nvm + node 20
if [ ! -s "$HOME/.nvm/nvm.sh" ]; then
  echo "Installing nvm…"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

if ! command -v node >/dev/null 2>&1; then
  nvm install 20
fi
nvm use 20
node --version
npm --version

# 2. Nuke Windows-installed node_modules
cd ~/portfolio
rm -rf node_modules package-lock.json .next

# 3. Fresh install (postinstall runs prisma generate)
npm install --no-audit --no-fund
