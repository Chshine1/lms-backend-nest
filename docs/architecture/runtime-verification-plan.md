# Runtime Verification Plan

This document outlines the critical call chains, verification steps, and potential issues when running the LMS Backend system via Docker Compose. It serves as a pre-launch checklist and incident response guide.

## System Overview

```
docker-compose.development.yml
├── Infrastructure Services:  postgres, rabbitmq, loki, promtail, grafana
├── Migrations:              Runs database migrations
└── Application Services:   gateway, user-service, course-service, etc.
```

## Critical Call Chains

### Chain 1: Container Start → Infrastructure Load → Service Ready

| Step | What Happens                                                   | Critical Points                                                  | Potential Issues                                  |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| 1.1  | Docker Compose starts services in dependency order             | Depends on: `migrations` → `rabbitmq` (healthy)                  | Services may start before dependencies are ready  |
| 1.2  | Service container starts, runs `node dist/apps/{service}/main` | Dockerfile CMD                                                   | Wrong entry point, missing dist files             |
| 1.3  | `main.ts` calls `NestFactory.create[ApplicationContext]()`     | Gateway: `create()`, Microservices: `createApplicationContext()` | Missing HTTP server for microservices (expected)  |
| 1.4  | `InfrastructureModule.forRootAsync()` registers                | Imports ConfigurationModule, LoggerModule                        | Module not imported correctly                     |
| 1.5  | `InfrastructureModule.forMicroserviceAsync()` registers        | Imports TypeORM, RabbitMQModule                                  | Missing entities or exchanges config              |
| 1.6  | `InfrastructureService.onApplicationBootstrap()` fires         | Triggers config loading pipeline                                 | Config not loaded, YAML files missing             |
| 1.7  | **Config Pipeline**: `EnvLoader` → `YamlLoader` → `AwsLoader`  | Requires `CONFIG_BASE_PATH` env var                              | YAML files not mounted (volume mount issue)       |
| 1.8  | `'config.loaded'` event emitted                                | Triggers LoggerLoader                                            | Logger fails if config missing                    |
| 1.9  | Database connection established (TypeORM)                      | Uses `database` config from YAML                                 | Wrong host (localhost vs postgres container name) |
| 1.10 | RabbitMQ connection established                                | Uses `rabbitmq` config from YAML                                 | Wrong host (localhost vs rabbitmq container name) |

**Verification**: Check service logs for successful config load and DB/RabbitMQ connection messages.

### Chain 2: HTTP Request → Gateway → RabbitMQ RPC → Service → DB

**Test Endpoint**: `POST /auth/register` (or `/auth/login`)

| Step | What Happens                                       | Critical Points                                     | Potential Issues                                      |
| ---- | -------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| 2.1  | HTTP request hits gateway on port 3000             | Gateway must be listening                           | Port 3000 not exposed or mapped incorrectly           |
| 2.2  | Global `ValidationPipe` validates DTO              | class-validator decorators                          | DTO validation fails, 400 error                       |
| 2.3  | `AppController` receives request                   | Routes to handler                                   | Missing route handler                                 |
| 2.4  | `UserTypedClient.createUser()` called              | Uses `rpc()` method                                 | Client not properly connected to RabbitMQ             |
| 2.5  | `TypedClientBase.rpc()` sends message to RabbitMQ  | Exchange: `user-service`, routingKey: `user.create` | Exchange not declared, connection closed              |
| 2.6  | Message routed to `user-service-user-create` queue | Queue bound to exchange                             | Queue not created (service not started)               |
| 2.7  | `UserController` in user-service receives message  | `@RabbitRPC` decorator                              | Handler not registered, wrong routing key             |
| 2.8  | `UserService.createUser()` executes business logic | Calls repository                                    | Entity not registered in TypeORM                      |
| 2.9  | TypeORM inserts into PostgreSQL                    | Table exists via migrations                         | Table doesn't exist (migration not run), wrong schema |
| 2.10 | Response flows back through RabbitMQ RPC           | Timeout: 30 seconds                                 | Timeout, message lost                                 |
| 2.11 | Gateway receives response, generates JWT           | Uses `jwt` config                                   | JWT secret not loaded                                 |
| 2.12 | HTTP response returned to client                   | 200 OK with token                                   | Error responses not handled                           |

**Verification**: Call `POST /auth/register` with valid payload, expect JWT token in response.

## Critical Points to Monitor

### 1. Configuration Loading

| Check                          | How to Verify                                                 | Expected                      |
| ------------------------------ | ------------------------------------------------------------- | ----------------------------- |
| `CONFIG_BASE_PATH` env var set | `docker-compose logs gateway`                                 | `/app/config`                 |
| YAML files mounted             | `docker-compose exec gateway ls -la /app/config/development/` | `global.yaml`, `gateway.yaml` |
| Config loaded successfully     | Look for "Configuration loaded" log                           | No errors                     |

**Potential Problems**:

- Volume mount: `./config:/app/config:ro` - config directory must exist on host
- YAML parsing error: Invalid YAML syntax
- Missing required keys: `environment`, `serviceName` must be set

### 2. Database Connection

| Check              | How to Verify                 | Expected                |
| ------------------ | ----------------------------- | ----------------------- |
| PostgreSQL healthy | `docker-compose ps`           | postgres: healthy       |
| Migrations ran     | Check logs or DB tables exist | Tables created          |
| TypeORM connects   | Service logs                  | "Connected to database" |

**Potential Problems**:

- Hostname: Must use `postgres` (Docker service name), not `localhost`
- Credentials: `lms:lms` from docker-compose.yml
- Database: `lms` must exist (created by migrations service)

### 3. RabbitMQ Connection

| Check                    | How to Verify                    | Expected                           |
| ------------------------ | -------------------------------- | ---------------------------------- |
| RabbitMQ healthy         | `docker-compose ps`              | rabbitmq: healthy                  |
| Management UI accessible | http://localhost:15672 (lms/lms) | Login successful                   |
| Exchanges declared       | Check Management UI → Exchanges  | `user-service` exchange exists     |
| Queues declared          | Check Management UI → Queues     | Queues created when services start |

**Potential Problems**:

- Hostname: Must use `rabbitmq` (Docker service name), not `localhost`
- Credentials: `lms:lms`
- Port: 5672 (AMQP), 15672 (management)

### 4. Service Startup Order

The compose file defines dependencies:

```
gateway → migrations (completed) + rabbitmq (healthy)
user-service → migrations (completed) + rabbitmq (healthy)
```

**Potential Problems**:

- If migrations fail but services start anyway → DB tables missing
- If RabbitMQ not healthy but services start → connection errors in logs

## Test Execution Plan

### Phase 1: Pre-Start Verification

1. Ensure `config/development/` directory exists with all YAML files
2. Ensure Docker daemon is running
3. Clean up any previous containers:
   ```bash
   docker-compose down -v
   ```

### Phase 2: Start Services

```bash
docker-compose up --build
```

Watch logs in real-time. Look for errors in each service.

### Phase 3: Verify Infrastructure

1. **PostgreSQL**: `docker-compose ps` → healthy
2. **RabbitMQ**: `docker-compose ps` → healthy, accessible at http://localhost:15672
3. **Migrations**: Check logs show "migration completed"

### Phase 4: Verify Gateway

1. Check gateway logs for config load success
2. Check RabbitMQ connection established
3. Test health endpoint (if exists): `curl http://localhost:3000/health`

### Phase 5: Test API Call Chain

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test1234!","email":"test@example.com","identityType":"student"}'
```

- Expected: 201 with JWT token
- If fails: Check user-service logs for error details

### Phase 6: Test RabbitMQ Message Flow

1. Login to RabbitMQ Management (http://localhost:15672)
2. Check Exchanges tab - `user-service` should exist
3. Check Queues tab - queues should be created per service
4. After API call, check message flow in "Messages" section

## Common Failure Patterns

| Symptom                           | Likely Cause                               | Fix                                            |
| --------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| "CONFIG_BASE_PATH not set"        | Environment variable not passed in compose | Add to service environment section             |
| "Cannot find module ./config"     | Volume mount failed                        | Check `./config` exists on host                |
| "ECONNREFUSED postgres:5432"      | Hostname wrong or PostgreSQL not ready     | Use service name `postgres`, check dependency  |
| "ECONNREFUSED rabbitmq:5672"      | Hostname wrong or RabbitMQ not ready       | Use service name `rabbitmq`, check healthcheck |
| "relation users does not exist"   | Migrations not run                         | Check migration service completed              |
| "exchange user-service not found" | RabbitMQ module not configured correctly   | Check exchanges config in forMicroserviceAsync |
| "JWT secret is required"          | JWT config not loaded                      | Check gateway.yaml has jwt section             |
| Service exits immediately         | Entry point error                          | Check `node dist/apps/.../main` path exists    |
| Timeout on API call               | Service not started or queue not bound     | Check service logs, RabbitMQ queues            |

## Related Documentation

- [Architecture Overview](./README.md)
- [ADR 0001: Centralized Infrastructure Usage](../adr/0001-centralized-infrastructure-usage.md)
- [ADR 0006: RabbitMQ Message Queue Pattern](../adr/0006-rabbitmq-message-queue-pattern.md)
