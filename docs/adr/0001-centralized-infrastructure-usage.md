# ADR 0001: Centralized Infrastructure Usage

## Status

Accepted

## Context

Infrastructure-related services (logging, configuration, event handling) are currently scattered across modules. This creates duplication, inconsistency, and maintenance burden across the project.

## Decision

All infrastructure concerns **must** be handled through the centralized `@app/infrastructure` module.

If a required capability is missing from `@app/infrastructure`, it **must be reported** rather than implemented separately.

### Allowed Exceptions

- Third-party libraries with required infrastructure (e.g., TypeORM, Kafka)

## Consequences

### Positive

- Consistent patterns across all services
- Single point of maintenance for infrastructure
- Reusable testing patterns

### Negative

- Initial overhead when adding new infrastructure capabilities
- Coupling to the infrastructure module

## Compliance

- Code review: reject duplicate infrastructure implementations
- AI assistants: always check `@app/infrastructure` first; report missing capabilities instead of implementing alternatives
- Documentation: keep `@app/infrastructure/API.md` current
