# ADR 0004: No Physical Foreign Keys in Databases

## Status

Accepted

## Context

In a microservices architecture, each service maintains its own database. Physical foreign key constraints between
tables inherently assume a single, unified database where cross-table relationships can be enforced at the database
engine level. This assumption breaks down in a distributed system where:

1. **Database independence**: Each microservice owns its data and may use different database technologies.
2. **Cross-database references**: Relationships between services require references across database boundaries, which
   physical foreign keys cannot enforce.
3. **Performance overhead**: Foreign key constraints introduce locking and validation costs during write operations.
4. **Relaxed consistency**: Many microservices tolerate eventual consistency, making strict database-level enforcement
   unnecessary.

## Decision

Physical foreign keys (i.e., database-level `FOREIGN KEY` constraints) will **not** be used in any microservice
database. Data integrity and referential relationships will be maintained through **application-level logic** instead.

### Implementation Approach

1. **Logical relationships**: Define relationships between entities using application logic, not database constraints.
   Entities may store foreign key values (e.g., `user_id`) for logical association, but no `FOREIGN KEY` constraint is
   added to the database schema.

2. **Application-level integrity**: Services are responsible for enforcing referential integrity before creating,
   updating, or deleting related records. This includes:
    - Validating that referenced entities exist before inserting
    - Handling orphaned references gracefully (e.g., soft deletes, cascade application logic)
    - Ensuring data consistency through business logic in domain services and application services

3. **Documentation**: Entity relationship diagrams and API contracts should clearly document logical relationships, even
   without physical constraints.

## Consequences

### Positive

- **Database independence**: Services remain free to change database providers without schema migration of foreign key
  constraints.
- **Performance**: Write operations avoid locking and constraint validation overhead.
- **Flexibility**: Application logic can implement complex, conditional, or event-driven relationship handling that
  foreign keys cannot express.
- **Microservice autonomy**: Each service fully owns its schema without cross-service coordination.

### Negative

- **Manual integrity enforcement**: Developers must explicitly implement referential logic, increasing code
  responsibility.
- **Orphaned data risk**: Without database-level cascades, orphaned records may appear if application logic fails.
- **Testing burden**: Integration tests must verify referential integrity that was previously delegated to the database.

## Compliance

- Database migration scripts must not include `FOREIGN KEY` constraints.
- Code reviews should verify that foreign key constraints are not added to TypeORM entities.
- Application services must validate foreign key references before creating or updating related records.
- Documentation must clearly indicate logical relationships between entities.
