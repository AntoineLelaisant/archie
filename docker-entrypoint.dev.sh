#!/bin/sh
set -e

if [ "$CI" = "true" ]; then
  echo "[entrypoint] Installing dependencies (frozen lockfile)..."
  pnpm install --frozen-lockfile
else
  echo "[entrypoint] Installing dependencies..."
  pnpm install
fi

exec "$@"
