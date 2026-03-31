# LMS Backend NestJS

Monorepo NestJS microservices backend for a Learning Management System.

## Services

| Service                   | Port       | Description           |
| ------------------------- | ---------- | --------------------- |
| Gateway                   | 3000       | API Gateway           |
| User Service              | -          | User management       |
| Course Service            | -          | Course management     |
| Assignment Service        | -          | Assignment management |
| Course Enrollment Service | -          | Enrollment management |
| Course Scheduling Service | -          | Scheduling management |
| File Service              | -          | File handling         |
| PostgreSQL                | 5432       | Database              |
| RabbitMQ                  | 5672/15672 | Message broker        |
| Loki                      | 3100       | Log aggregation       |
| Grafana                   | 3030       | Log dashboards        |

## Docker Development Setup

### Quick Start

```bash
# 1. Build a stable base dependency image
docker build -f Dockerfile.deps -t lms-deps-base:latest .

# 2. Build and start all containers
docker compose -f docker-compose.development.yml up --build

# 3. Access services
open http://localhost:3000        # Gateway API
open http://localhost:15672       # RabbitMQ Management (lms/lms)
open http://localhost:3030        # Grafana Logs Dashboard
```

### Cleanup

```bash
# Stop and remove containers
docker compose -f docker-compose.development.yml down

# Full reset (removes all images)
docker compose -f docker-compose.development.yml down --rmi local
```

## Local Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run in development mode
yarn start:dev

# Run tests
yarn test

# Lint
yarn lint
```
