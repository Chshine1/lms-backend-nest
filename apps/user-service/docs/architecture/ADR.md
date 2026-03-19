# ADR

## ADR-001: User Identity Data Storage Using Class Table Inheritance

**Date**: 2026-03-18  
**Status**: Accepted

### Context

Different user types (students, teachers, parents, etc.) need to store different attributes. For example, students
require student ID and grade; teachers require employee ID and qualifications. We need a design that ensures data
integrity while being easy to extend with new types.

### Options Considered

- **Single Table Inheritance**: Include all possible fields in the `users` table, distinguishing by `type`. Drawbacks:
  large number of nullable columns, need to alter table structure when adding new types, no guarantee that each row
  contains only the fields relevant to its type.
- **Key-Value Pair Extension Table**: Use a `user_attributes` table storing `(user_id, key, value)`. Drawbacks: no
  schema constraints, complex queries, poor performance.
- **JSON Column**: Add a JSON column in the `users` table to hold type‑specific data. Drawbacks: validation moves to the
  application layer, limited querying and indexing capabilities.
- **Class Table Inheritance**: A base table plus one extension table per type, linked by a 1:1 foreign key relationship.

### Decision

Adopt **Class Table Inheritance**.

### Rationale

- Data integrity is enforced by foreign keys and table structures.
- Adding a new type only requires creating a new table, without modifying existing ones.
- Querying type‑specific data needs only a single join, providing acceptable performance.
- If future requirements demand that a user can have multiple identities, a bridge table `user_identity` can be
  introduced while keeping the extension tables unchanged – the design is forward‑looking.

---

## ADR-002: Username Unique Within Tenant

**Date**: 2026-03-18  
**Status**: Accepted

### Context

Users typically log in with a username. We need to decide whether usernames should be globally unique or unique only
within a tenant.

### Options Considered

- **Globally Unique**: Usernames cannot be duplicated across any tenant.
- **Unique Within Tenant**: Usernames are unique only within the same tenant; they may repeat across different tenants.

### Decision

Adopt **Unique Within Tenant**, enforced by a composite unique constraint `(tenant_id, username)`.

### Rationale

- Better fits B2B scenarios: students from different schools may coincidentally share the same name; allowing repetition
  avoids unnecessary naming conflicts.
- During login, the frontend already knows the tenant (via subdomain or tenant code), so the tenant identifier can be
  provided alongside the username without affecting the authentication flow.
- Simplifies username selection and reduces operational overhead.