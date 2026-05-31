#!/usr/bin/env bash
set -euo pipefail

# Fix Docker credential helper (points to broken Windows .exe)
mkdir -p ~/.docker
if [ -f ~/.docker/config.json ]; then
  python3 - <<'PY'
import json, os
p = os.path.expanduser("~/.docker/config.json")
d = json.load(open(p))
d.pop("credsStore", None)
d.pop("credsStores", None)
json.dump(d, open(p, "w"), indent=2)
print("docker config cleaned")
PY
else
  echo '{}' > ~/.docker/config.json
  echo "docker config created"
fi
