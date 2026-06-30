#!/usr/bin/env sh
set -eu

: "${BASE_URL:?BASE_URL is required}"

for endpoint in live ready metrics docs/openapi.json; do
  url="$BASE_URL/$endpoint"
  code="$(curl -fsS -o /dev/null -w '%{http_code}' "$url")"
  test "$code" = "200"
  echo "validated $url"
done
