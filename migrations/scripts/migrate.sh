#!/bin/bash
set -e
NAME=$1

if [ -z "${NAME}" ]; then
  echo "Usage: $0 <migration-name>"
  exit 1
fi

echo "Starting PostgreSQL"
docker compose -f ./migrations/scripts/docker-compose.migrations.yml up -d postgres-migration

echo "Waiting for PostgreSQL healthcheck..."
CONTAINER_ID=$(docker compose -f ./migrations/scripts/docker-compose.migrations.yml ps -q postgres-migration)
while [ "$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_ID")" != "healthy" ]; do
  sleep 1s
done

echo "PostgreSQL ready, run migrations"
docker compose -f ./migrations/scripts/docker-compose.migrations.yml run --env "MIGRATION_NAME=${NAME}" --rm migration

echo "Release all resources"
docker compose -f ./migrations/scripts/docker-compose.migrations.yml down -v

echo "Migration complete"