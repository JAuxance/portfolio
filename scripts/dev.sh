#!/usr/bin/env bash
set -euo pipefail
cd ~/portfolio
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null
exec npm run dev
