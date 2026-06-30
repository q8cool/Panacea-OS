#!/usr/bin/env sh
set -eu

: "${RESTORE_FILE:?RESTORE_FILE is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"

psql "$DATABASE_URL" < "$RESTORE_FILE"
echo "restore.completed $RESTORE_FILE"
