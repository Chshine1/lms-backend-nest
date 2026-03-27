#!/bin/bash
set -e

COMPOSE_FILE="./migrations/scripts/docker-compose.migrations.yml"
NAME=$1

if [ -z "${NAME}" ]; then
  echo "Usage: $0 <migration-name>"
  exit 1
fi

echo "Starting PostgreSQL..."
docker compose -f "$COMPOSE_FILE" up -d postgres-migration

echo "Waiting for PostgreSQL healthcheck..."
CONTAINER_ID=$(docker compose -f "$COMPOSE_FILE" ps -q postgres-migration)
while [ "$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_ID")" != "healthy" ]; do
  sleep 1s
done

echo "PostgreSQL ready. Running migrations..."
docker compose -f "$COMPOSE_FILE" run --env "MIGRATION_NAME=${NAME}" --rm migration

echo "Releasing all resources..."
docker compose -f "$COMPOSE_FILE" down -v

echo "Migration complete"
