# ADR 0001: Centralized Infrastructure Usage via @app/infrastructure

## Status

Accepted

## Context

The project contains infrastructure-related services scattered across different modules and apps. Some services like logging, event handling, and configuration are implemented in isolation within individual services rather than using centralized infrastructure. This leads to:

1. **Duplication** - Similar infrastructure patterns repeated across services
2. **Inconsistency** - Different implementations of logging, events, and configuration
3. **Maintenance burden** - Multiple places to maintain and update infrastructure code
4. **Testing complexity** - Each service re-implements testing patterns for infrastructure

We need a unified approach to ensure all infrastructure concerns are handled through the centralized `@app/infrastructure` module.

## Decision

All infrastructure-related functionalities in the project **must** use the `@app/infrastructure` module. This includes but is not limited to:

1. **Logging** - All logging operations must use `LoggerService` from `@app/infrastructure/modules/logger`
2. **Configuration** - All configuration retrieval must use `ConfigurationService` from `@app/infrastructure/modules/configuration`

If a required infrastructure capability is **missing** from the `@app/infrastructure` module, it **must be reported** (via issue or ADR) rather than implementing a separate solution in another module.

### Allowed Exceptions

- Third-party libraries that provide their own infrastructure (e.g., TypeORM connection management, Kafka consumer groups) may have their own configuration when explicitly required by the library
- Temporary workarounds for critical production issues must be documented and tracked for later migration

## Consequences

### Positive

1. **Consistency** - All logs, events, and configs follow the same patterns
2. **Maintainability** - Infrastructure changes only need to happen in one place
3. **Testing** - Shared infrastructure can be tested once and reused
4. **Documentation** - Single source of truth for infrastructure capabilities
5. **Monitoring** - Unified logging and event tracking across the system

### Negative

1. **Initial development overhead** - Adding new infrastructure capabilities requires changes to `@app/infrastructure`
2. **Module coupling** - Services become coupled to the infrastructure module

## Compliance

### Code Review

- Reviewers must reject any new code that introduces duplicate infrastructure implementations
- PRs must demonstrate that any infrastructure needs are met by `@app/infrastructure`

### Lint Rules (Future)

- ESLint rule to detect direct imports of infrastructure-like patterns from non-infrastructure modules (TBD)

### AI Instructions

AI assistants working on this codebase must:

1. Always check `@app/infrastructure` first when infrastructure capabilities are needed
2. If the required capability is missing, report this to the user instead of implementing a separate solution
3. Update the infrastructure module first when new infrastructure needs are identified

### Documentation

- The `@app/infrastructure/API.md` must be kept up-to-date with all available infrastructure capabilities
- Any missing infrastructure should be documented as a TODO or enhancement request in the module's documentation
