#!/usr/bin/env sh
set -eu

: "${NAMESPACE:?NAMESPACE is required}"
: "${RELEASE_NAME:?RELEASE_NAME is required}"

kubectl -n "$NAMESPACE" rollout undo deployment "$RELEASE_NAME"
kubectl -n "$NAMESPACE" rollout status deployment "$RELEASE_NAME"
echo "rollback.completed $RELEASE_NAME"
