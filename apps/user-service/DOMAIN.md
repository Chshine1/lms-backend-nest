# Domain Model – User Service

## Overview

The User Service manages tenants and users in a B2B education platform. It provides authentication, user management, and
tenant-scoped authorization. The domain follows a bounded context where tenant and user concepts are cohesive and kept
together.

## Aggregates

### Tenant Aggregate

**Purpose**: Represents an organization (school, training center) that registers and uses the platform. It serves as the
root of isolation for all operations—every user, campus, and permission is scoped to a tenant.

**Transactional Boundary**: All operations within the Tenant aggregate are transactional. Modifications to tenant
properties affect all related entities consistently.

**Root Entity**: `Tenant`

**Contained Entities**:

- `Tenant` — the aggregate root
- `Campus` — locations belonging to the tenant

**Business Invariants Enforced**:

- Tenant code must be globally unique across the system
- Tenant status (active/suspended) determines whether related users can authenticate
- Soft delete ensures data consistency while maintaining audit trail

### User Aggregate

**Purpose**: Represents an individual who accesses the system within a tenant. It encapsulates user identity,
authentication credentials, and role-specific data.

**Transactional Boundary**: User creation or modification is atomic—base user record and identity-specific data are
persisted together. Changes to user status affect authentication eligibility.

**Root Entity**: `User`

**Contained Entities**:

- `User` — the aggregate root with common attributes
- `Student` — extended identity for students
- `Teacher` — extended identity for teachers
- `Parent` — extended identity for parents
- `Admin` — extended identity for tenant administrators
- `UserPermission` — permission grants for the user

**Business Invariants Enforced**:

- Username must be unique within a tenant
- Email must be unique within a tenant
- User must have exactly one identity type (student/teacher/parent/admin)
- Password hash is required for authentication
- User status (active/inactive/locked) controls authentication eligibility

## Entities

### Tenant

| Attribute | Type                    | Description                      |
|-----------|-------------------------|----------------------------------|
| id        | number                  | Primary key                      |
| name      | string                  | Display name of the organization |
| code      | string                  | Unique identifier for the tenant |
| status    | 'active' \| 'suspended' | Operational status               |
| createdAt | Date                    | Creation timestamp               |
| updatedAt | Date                    | Last modification timestamp      |
| deletedAt | Date?                   | Soft delete timestamp            |
| version   | number                  | Optimistic locking version       |

**Lifecycle**: Created during tenant registration, can be suspended by administrators, soft-deleted rather than
permanently removed.

### User

| Attribute    | Type         | Description                             |
|--------------|--------------|-----------------------------------------|
| id           | number       | Primary key                             |
| tenantId     | number       | Foreign key to Tenant                   |
| username     | string       | Login identifier (unique within tenant) |
| email        | string       | Contact email (unique within tenant)    |
| phone        | string       | Contact phone                           |
| passwordHash | string       | Bcrypt hash of the password             |
| status       | UserStatus   | Operational status                      |
| identityType | IdentityType | Discriminator for identity type         |
| createdAt    | Date         | Creation timestamp                      |
| updatedAt    | Date         | Last modification timestamp             |
| deletedAt    | Date?        | Soft delete timestamp                   |
| version      | number       | Optimistic locking version              |

**Lifecycle**: Created via user registration or admin provisioning, can be deactivated or locked, soft-deleted.

### Campus

| Attribute | Type    | Description                     |
|-----------|---------|---------------------------------|
| id        | number  | Primary key                     |
| tenantId  | number  | Foreign key to Tenant           |
| name      | string  | Display name of the campus      |
| location  | string  | Physical address or description |
| timezone  | string? | Operational timezone            |
| createdAt | Date    | Creation timestamp              |
| updatedAt | Date    | Last modification timestamp     |
| deletedAt | Date?   | Soft delete timestamp           |
| version   | number  | Optimistic locking version      |

**Lifecycle**: Created when setting up physical locations, can be deactivated, soft-deleted.

### Student (Identity Entity)

| Attribute      | Type   | Description                      |
|----------------|--------|----------------------------------|
| userId         | number | Primary key, foreign key to User |
| studentId      | string | Student identifier               |
| gradeLevel     | string | Grade or level                   |
| enrollmentDate | Date   | Date of enrollment               |

**Lifecycle**: Created when a user is identified as a student, deleted when identity changes.

### Teacher (Identity Entity)

| Attribute      | Type   | Description                      |
|----------------|--------|----------------------------------|
| userId         | number | Primary key, foreign key to User |
| employeeId     | string | Employee identifier              |
| qualifications | string | qualifications summary           |
| hireDate       | Date   | Date of hire                     |

**Lifecycle**: Created when a user is identified as a teacher, deleted when identity changes.

### Parent (Identity Entity)

| Attribute         | Type    | Description                      |
|-------------------|---------|----------------------------------|
| userId            | number  | Primary key, foreign key to User |
| relationToStudent | string  | Relationship to student          |
| occupation        | string? | Occupation information           |

**Lifecycle**: Created when a user is identified as a parent, deleted when identity changes.

### Admin (Identity Entity)

| Attribute  | Type    | Description                      |
|------------|---------|----------------------------------|
| userId     | number  | Primary key, foreign key to User |
| department | string  | Administrative department        |
| jobTitle   | string? | Job title within the tenant      |

**Lifecycle**: Created when a user is identified as an administrator, deleted when identity changes.

### UserPermission

| Attribute | Type                | Description                      |
|-----------|---------------------|----------------------------------|
| userId    | number              | Primary key, foreign key to User |
| resource  | UserServiceResource | Resource being accessed          |
| action    | UserServiceAction   | Action permitted                 |
| createdAt | Date                | Creation timestamp               |
| deletedAt | Date?               | Revocation timestamp             |

**Lifecycle**: Granted when assigning permissions, revoked via soft delete.

## Value Objects

### UserStatus

Enumeration: `ACTIVE`, `INACTIVE`, `LOCKED`

Defines the operational state of a user account. Determines authentication eligibility and system access.

### IdentityType

Enumeration: `STUDENT`, `TEACHER`, `PARENT`, `ADMIN`

Discriminator value that determines which identity table contains the user's extended attributes. Enables class-table
inheritance pattern.

### TenantStatus

Enumeration: `active`, `suspended`

Defines the operational state of a tenant. Suspended tenants prevent all associated users from authenticating.

## Domain Events

### TenantCreated

**Triggering Condition**: A new tenant is registered in the system.

**Data Carried**:

- tenantId: number
- tenantCode: string
- tenantName: string
- createdAt: Date

**Consumers**: Other services may subscribe to provision tenant-specific resources.

### UserCreated

**Triggering Condition**: A new user is registered or provisioned within a tenant.

**Data Carried**:

- userId: number
- tenantId: number
- username: string
- identityType: IdentityType
- createdAt: Date

**Consumers**: Other services may create corresponding records (e.g., course enrollment for students).

### UserStatusChanged

**Triggering Condition**: User status changes (activation, deactivation, lock).

**Data Carried**:

- userId: number
- tenantId: number
- oldStatus: UserStatus
- newStatus: UserStatus
- changedAt: Date

**Consumers**: Authentication service invalidates sessions; other services revoke access.

### TenantSuspended

**Triggering Condition**: Tenant status changes to suspended.

**Data Carried**:

- tenantId: number
- suspendedAt: Date

**Consumers**: All services deny access to the tenant's users.

## Business Invariants

### Tenant-Level Invariants

1. **Unique Tenant Code**: Tenant code must be globally unique across all tenants. This is enforced at the database
   level with a unique constraint.
2. **Tenant Status Controls Access**: If a tenant is suspended, no users within that tenant can authenticate or access
   system resources.
3. **Campus Belongs to Tenant**: Every campus must be associated with a valid, non-deleted tenant.

### User-Level Invariants

1. **Unique Username per Tenant**: Username must be unique within a tenant. This is enforced with a composite unique
   constraint on (tenantId, username).
2. **Unique Email per Tenant**: Email must be unique within a tenant. This is enforced with a composite unique
   constraint on (tenantId, email).
3. **Exactly One Identity Type**: Each user must have exactly one identity type. The identity type discriminator
   determines which extended table contains the user's attributes.
4. **Password Required**: Users must have a password hash set before they can authenticate.
5. **Status Determines Authentication**: Only users with status ACTIVE can authenticate successfully.
6. **User Belongs to Tenant**: Every user must be associated with a valid, non-deleted tenant.

### Permission-Level Invariants

1. **Permissions Are Tenant-Scoped**: User permissions are implicitly scoped to the user's tenant. A permission grant
   for a user applies only within that user's tenant context.
2. **Permission Actions Are Limited**: Actions are restricted to READ, WRITE, DELETE, MANAGE.

## Domain Services

### UserService

**Responsibilities**:

- Create, read, update, and delete users
- Manage user identity types (link identity-specific data)
- Handle user authentication (verify credentials)
- Manage user status transitions

**Complex Operations**:

- Registration with automatic identity creation
- Bulk user import with identity mapping
- User status changes with side effects (session invalidation)

### TenantService

**Responsibilities**:

- Create, read, update, and delete tenants
- Manage tenant status (suspension)
- Validate tenant code uniqueness

**Complex Operations**:

- Tenant suspension propagates to all users
- Tenant deletion cascades to soft-delete all related data

### CampusService

**Responsibilities**:

- Create, read, update, and delete campuses
- Assign campuses to users (where applicable)

**Complex Operations**:

- Campus reassignment for users

### PermissionService

**Responsibilities**:

- Grant and revoke user permissions
- Check user permissions for resource-action pairs

**Complex Operations**:

- Bulk permission updates
- Permission inheritance from roles (future enhancement)
