# ADR 0005: Configuration Pipeline Pattern

## Status

Accepted

## Context

Configuration loading in a microservices environment often requires combining multiple sources: environment variables,
local config files, and remote parameter stores. Each source may have dependencies on values from previous sources (
e.g., region needed to query remote store).

We need a pattern that:

- Loads configuration in a defined order with explicit dependencies
- Validates configuration at each stage
- Allows easy addition of new configuration sources
- Provides clear error messages when validation fails

## Decision

Configuration loading follows a **Pipeline Middleware Pattern**:

### Middleware Contract

Each pipeline stage is a middleware that:

1. Declares its dependencies as schema classes
2. Receives validated values from previous stages
3. Loads its own configuration segment
4. Validates and returns the merged configuration

### Dependency Schema Pattern

Middlewares declare dependencies as class constructors. The pipeline framework:

1. Extracts values from the accumulated configuration
2. Validates them against the dependency schema
3. Passes validated instances to the middleware

This ensures each middleware receives only valid, type-safe dependencies.

### Validation at Each Stage

Each middleware validates:

- **Before loading**: Its declared dependencies exist and are valid
- **After loading**: The newly loaded configuration meets its schema requirements

Failures are caught immediately at the problematic stage with clear error context.

### Composition

Middlewares are composed into a pipeline. The output of one middleware becomes the input of the next, with each stage
adding its configuration segment.

## Consequences

### Positive

1. **Explicit Dependencies**: Each middleware clearly declares what it needs
2. **Fail Fast**: Invalid configuration fails immediately at the problematic stage
3. **Composable**: Easy to add new middlewares (e.g., Vault, Consul)
4. **Validated**: Configuration is validated incrementally, not just at the end
5. **Testable**: Each middleware can be tested with mock dependencies

### Negative

1. **Ordering Complexity**: Middlewares must be ordered to respect dependencies
2. **Schema Proliferation**: Each middleware needs a corresponding schema
3. **Debugging**: Tracing failures requires understanding the pipeline

## Compliance

- New loaders must follow the middleware contract
- Each middleware must declare its dependencies as schema classes
- The pipeline order must be documented when adding new stages
- Tests must verify behavior with both valid and invalid inputs
