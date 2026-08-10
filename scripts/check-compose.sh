#!/usr/bin/env bash
# Boots a compose file and waits for every service to report healthy, timing the whole thing.
# This is the CI gate: a compose file that cannot reach healthy cannot merge.
# Usage: scripts/check-compose.sh compose/foo.yml [--keep]
set -euo pipefail

file="$1"
keep="${2:-}"
project="check-$(basename "$file" .yml)"

cleanup() {
  if [ "$keep" != "--keep" ]; then
    docker compose -p "$project" -f "$file" down -v --remove-orphans >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "── $file"
start=$(date +%s)
if ! docker compose -p "$project" -f "$file" up -d --wait --quiet-pull; then
  echo "✗ $file: services did not reach healthy"
  docker compose -p "$project" -f "$file" ps
  docker compose -p "$project" -f "$file" logs --tail 40
  exit 1
fi
elapsed=$(( $(date +%s) - start ))
echo "✓ $file healthy in ${elapsed}s"
