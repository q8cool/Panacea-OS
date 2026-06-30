#!/usr/bin/env sh
set -eu

: "${BACKUP_DIR:?BACKUP_DIR is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"

mkdir -p "$BACKUP_DIR"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/panacea-v3-$timestamp.sql"
echo "backup.completed $BACKUP_DIR/panacea-v3-$timestamp.sql"
