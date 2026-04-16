# DOMAIN.md Optimization Standards

**Purpose**: Ensure every DOMAIN.md enables "zero-guess" implementation — AI agents and developers can generate code deterministically with no implicit assumptions.

## Zero-Guess Definition

A DOMAIN.md achieves "zero-guess" status when:

- Every callchain is fully explicit (API → application service → aggregate method → event)
- All types, methods, DTOs, and error codes are explicitly defined
- Patterns (IDs, audit fields, events, loading) follow a single, documented standard
- No external design discussions are needed to implement any feature

## Core Principles

### 1. Base Schema Inheritance

| Base Schema           | Inherited Fields                                                                     |
| :-------------------- | :----------------------------------------------------------------------------------- |
| `AggregateRootSchema` | `id: BIGINT`, `createdAt: TIMESTAMPTZ`, `updatedAt: TIMESTAMPTZ`, `version: INTEGER` |
| `EntitySchema`        | `id: BIGINT`, `createdAt: TIMESTAMPTZ`, `updatedAt: TIMESTAMPTZ`                     |

**Rule**: Entities **do not** list inherited fields. Use an `extends` row in tables.

### 2. ID Type: `bigint`

All entity IDs are `BIGINT` (PostgreSQL `BIGSERIAL`). Method signatures must use `bigint`, never `string`.

### 3. Domain Events Pattern

Events are **recorded** in aggregate methods, **published** by the repository after `flush()` to ensure atomicity.

**Aggregate**:

- `protected _domainEvents: DomainEvent[] = []`
- `getDomainEvents(): DomainEvent[]` (returns copy)
- `clearDomainEvents(): void`

**Repository**:

```typescript
async save(aggregate: T): Promise<void> {
  await this.em.persist(aggregate).flush();
  const events = aggregate.getDomainEvents();
  for (const event of events) await this.eventBus.publish(event);
  aggregate.clearDomainEvents();
}
```

### 4. Relationship Loading: Explicit Include

Collections are empty by default; load only via explicit `include` option:

```typescript
findById(id: bigint, options?: { include?: string[] }): Promise<Aggregate | null>
```

### 5. Aggregate Method Documentation

Provide **full TypeScript implementation** in code block showing validation, state changes, event recording, and exception throwing.

### 6. Application Service Completeness

Each user operation must have a method with: Input, Output, and **numbered orchestration steps**.

### 7. Error Codes & DTOs

- Every exception must have a 4-digit code and trigger condition.
- Every DTO referenced in services must be defined with fields and validation.

---

## Required Document Structure

```
0. Architecture Conventions (include Base Schema table)
1. Aggregates and Entities
2. Entities (One-to-Many)
3. Aggregate Root Methods: Implementation Patterns
4. Domain Events and Dispatching Pattern
5. Application Layer (Orchestration)
6. Domain Services
7. Key Business Rules & Invariants
8. Repository Interfaces
9. Error Codes & Exceptions
10. Data Transfer Objects (DTOs)
11. Query Operations
12. Microservice Integration Note
13. Aggregate Root Relationship Loading (ORM Pattern)
```

---

## Section Validation Checklist

| Section | Must Include                                                                                                                                           |
| :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0**   | Base Schema table; conventions for ID generation, events, uniqueness, external refs, collections, side effects                                         |
| **1**   | `extends AggregateRootSchema` row; no explicit `id`, `createdAt`, `updatedAt`, `version`; method signatures with `bigint`; side effects and exceptions |
| **2**   | `extends EntitySchema` row; foreign key field; `bigint` IDs                                                                                            |
| **3**   | Full TypeScript code for every non-trivial method                                                                                                      |
| **4**   | Aggregate and repository code examples; events table with triggers                                                                                     |
| **5**   | One method per user operation; Input/Output; numbered steps                                                                                            |
| **6**   | Method signatures with `bigint`; business rule enforced                                                                                                |
| **7**   | Rule ID, description, enforcement location                                                                                                             |
| **8**   | `save()`, `findById()` with `include`; implementation with event dispatch                                                                              |
| **9**   | All exceptions with 4-digit code and trigger condition                                                                                                 |
| **10**  | All input/response DTOs; optional fields marked `?`                                                                                                    |
| **11**  | Read-only methods; relationship loading notes                                                                                                          |
| **12**  | External dependencies, events published/consumed                                                                                                       |
| **13**  | Empty-by-default loading pattern with code example                                                                                                     |

---

## Common Fixes

| Issue                              | Fix                                                                           |
| :--------------------------------- | :---------------------------------------------------------------------------- |
| String ID in signature             | Change to `bigint`                                                            |
| Explicit audit fields in tables    | Replace with `extends` row                                                    |
| Missing application service method | Add method with numbered orchestration steps                                  |
| Missing error code                 | Add to Section 9 with 4-digit code                                            |
| Missing DTO definition             | Add to Section 10 with fields and validation                                  |
| Incomplete method example          | Expand to show validation, state changes, event recording, exception throwing |
| Missing relationship loading doc   | Add Section 13 with `include` examples                                        |

---

## Optimization Workflow

1. **Audit**: Trace callchains; list missing methods, DTOs, error codes, type issues.
2. **Section 0**: Add Base Schema table.
3. **Sections 1-2**: Replace explicit audit fields with `extends`; change `string` IDs to `bigint`.
4. **Section 3**: Add full TypeScript implementations for each aggregate method.
5. **Section 4**: Add event pattern code examples.
6. **Sections 5-13**: Complete all missing tables.
7. **Validate**: Run checklist and grep commands.
