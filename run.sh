#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
PORT=8000

open_browser() {
  URL="http://localhost:$PORT/"
  sleep 1
  if command -v xdg-open >/dev/null; then xdg-open "$URL"
  elif command -v open >/dev/null; then open "$URL"
  else echo "Open $URL in your browser."
  fi
}

if command -v python3 >/dev/null; then
  open_browser &
  python3 -m http.server "$PORT"
elif command -v python >/dev/null; then
  open_browser &
  python -m http.server "$PORT"
elif command -v npx >/dev/null; then
  open_browser &
  npx --yes serve -l "$PORT" .
else
  echo "Could not find Python or Node.js. Please install one and try again."
  exit 1
fi
