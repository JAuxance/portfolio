#!/usr/bin/env bash
# Smoke test the /api/chat endpoint.
set -euo pipefail
curl -sS -X POST http://localhost:3000/api/chat \
  -H 'content-type: application/json' \
  -d '{"message":"What is JobMatch?","locale":"en"}' \
  --max-time 25
echo
