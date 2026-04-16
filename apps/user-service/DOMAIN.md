## Domain Model

### 0. Architecture Conventions

#### Base Schemas

| Base Schema           | Inherited Fields                                                                                               | Use Case                                                                  |
| :-------------------- | :------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| `AggregateRootSchema` | `id: BIGINT`, `createdAt: TIMESTAMPTZ`, `updatedAt: TIMESTAMPTZ`, `version: INTEGER`, `deletedAt: TIMESTAMPTZ` | Aggregate roots (User, StudentProfile, Role, Tenant)                      |
| `EntitySchema`        | `id: BIGINT`, `createdAt: TIMESTAMPTZ`, `updatedAt: TIMESTAMPTZ`                                               | Regular entities                                                          |
| `LinkEntitySchema`    | `createdAt: TIMESTAMPTZ`, `deletedAt: TIMESTAMPTZ`                                                             | Read-only relationship linking entities (no `id`, `updatedAt`, `version`) |

#### Core Conventions

1. **ID Types**: All entity IDs are `BIGINT` (PostgreSQL `BIGSERIAL`). Method signatures must use `bigint`, never `string`.
2. **Aggregate Fields**: Do not list inherited fields in entity tables. Use an `extends` row instead.
3. **Collections**: Relationships are empty by default; load only via explicit `include` option in repository methods.
4. **Events**: Domain events are recorded in aggregate methods, published by the repository after `flush()` for atomicity.
5. **Immutability**: Email addresses and tenant associations are immutable after creation.
6. **Soft Deletes**: All aggregates support soft deletes via `deletedAt` column.

---

### 1. Aggregates and Entities

#### 1.1 User Aggregate

Core Responsibility: Manages the core identity, credentials, and tenant association of a user. It does not hold role assignments or student-specific profile data.

| Member Type    | Member Name                                     | PostgreSQL Type | Description / Domain Behavior                                                                                                                                                                                                                                   | Domain Constraints / Rules                                        |
| :------------- | :---------------------------------------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| Base Schema    | extends AggregateRootSchema                     | -               | Inherits `id`, `createdAt`, `updatedAt`, `version`, `deletedAt`                                                                                                                                                                                                 |                                                                   |
| Aggregate Root | User                                            | -               | The central identity in the system. (PRD Mapping: Overall Architecture / Registration & Login)                                                                                                                                                                  | -                                                                 |
| Field          | tenantId                                        | BIGINT          | Reference to the owning Tenant. (PRD Mapping: Tenant isolation)                                                                                                                                                                                                 | FOREIGN KEY (tenantId) REFERENCES Tenant(id), NOT NULL, immutable |
| Field          | email                                           | VARCHAR(255)    | User's email, used for login. Modeled as Email value object in domain layer. (PRD Mapping: Sign-up Information - Email Address)                                                                                                                                 | UNIQUE, NOT NULL, immutable after creation.                       |
| Field          | phoneNumber                                     | VARCHAR(20)     | User's phone number. Modeled as PhoneNumber value object. Phone number is mutable and unique. When a user changes their number, the old number is immediately released and can be registered by another user. (PRD Mapping: Sign-up Information - Phone Number) | UNIQUE, optional, mutable.                                        |
| Field          | passwordHash                                    | VARCHAR(255)    | Stored credential hash. Encapsulated as PasswordHash value object. (PRD Mapping: Sign-up Information - Password)                                                                                                                                                | NOT NULL                                                          |
| Field          | status                                          | VARCHAR(30)     | Account lifecycle status. Allowed values: ACTIVE, INACTIVE. (PRD Mapping: Account lifecycle)                                                                                                                                                                    | NOT NULL, restricted to UserStatus enum.                          |
| Field          | emailVerifiedAt                                 | TIMESTAMPTZ     | Timestamp when email was verified. null if not yet verified. (PRD Mapping: Registration email verification)                                                                                                                                                     | Nullable, set by markEmailVerified() method.                      |
| Method         | updatePhoneNumber(phoneNumber: PhoneNumberVo)   | void            | Replaces phoneNumber after external verification. Validates format via PhoneNumber VO. (PRD Mapping: Sign-up Information - Phone Number is updatable)                                                                                                           | Throws InvalidPhoneNumberError (1000) if validation fails.        |
| Method         | updatePassword(newPasswordHash: PasswordHashVo) | void            | Replaces passwordHash with a new PasswordHash. Does not verify old password (done externally). (PRD Mapping: Sign-up Information - Password is changeable)                                                                                                      | Throws WeakPasswordError (1001) if hash validation fails.         |
| Method         | markEmailVerified()                             | void            | Records the timestamp when email verification is confirmed. Sets emailVerifiedAt to current timestamp. Emits EmailVerified event (recorded in `_domainEvents` list). (PRD Mapping: Registration email verification)                                             | Sets emailVerifiedAt to current date/time.                        |

**Aggregate Method Implementations:**

```typescript
// User.updatePhoneNumber(phoneNumber: PhoneNumberVo): void
updatePhoneNumber(phoneNumber: PhoneNumberVo): void {
  try {
    // PhoneNumber VO validates format internally
    this.phoneNumber = phoneNumber;
  } catch {
    throw new InvalidPhoneNumberError(phoneNumber.value);
  }
}

// User.updatePassword(newPasswordHash: PasswordHashVo): void
updatePassword(newPasswordHash: PasswordHashVo): void {
  try {
    // PasswordHash VO validates hash format internally
    this.passwordHash = newPasswordHash;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new WeakPasswordError(message);
  }
}

// User.markEmailVerified(): void
markEmailVerified(): void {
  this.emailVerifiedAt = new Date();
  // Event is recorded in application service (not in aggregate)
}
```

---

#### 1.2 StudentProfile Aggregate

Core Responsibility: Manages student-specific attributes and onboarding progress. Separated from User to respect microservice boundaries and single responsibility.

| Member Type    | Member Name                 | PostgreSQL Type            | Description / Domain Behavior                                                                                                      | Domain Constraints / Rules                                                                         |
| :------------- | :-------------------------- | :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| Base Schema    | extends AggregateRootSchema | -                          | Inherits `id`, `createdAt`, `updatedAt`, `version`, `deletedAt`                                                                    |                                                                                                    |
| Aggregate Root | StudentProfile              | -                          | Extended profile for a user who holds the Student role. (PRD Mapping: Student Profile)                                             | Must reference an existing User.                                                                   |
| Field          | userId                      | BIGINT                     | Reference to the base User. (PRD Mapping: Link to base user)                                                                       | FOREIGN KEY (userId) REFERENCES User(id), UNIQUE (one profile per student).                        |
| Field          | onboardingStatus            | VARCHAR(30)                | Progress of mandatory onboarding. Allowed values: NOT_STARTED, IN_PROGRESS, COMPLETED. (PRD Mapping: OC Onboarding)                | NOT NULL, restricted to OnboardingStatus enum.                                                     |
| Method         | completeOnboarding()        | StudentOnboardingCompleted | Transitions onboardingStatus to COMPLETED and emits StudentOnboardingCompleted event. (PRD Mapping: OC Onboarding completion step) | Throws OnboardingAlreadyCompletedError (1002) if already COMPLETED. Returns event for publication. |

**Aggregate Method Implementations:**

```typescript
// StudentProfile.completeOnboarding(): StudentOnboardingCompleted
completeOnboarding(): StudentOnboardingCompleted {
  // Validate current state
  if (this.onboardingStatus === OnboardingStatus.COMPLETED) {
    throw new OnboardingAlreadyCompletedError(this.userId);
  }

  // Record state change
  this.onboardingStatus = OnboardingStatus.COMPLETED;

  // Create and return domain event (to be published by application service)
  return new StudentOnboardingCompleted(this.userId, new Date());
}
```

**Constructor:**

```typescript
constructor(userId: bigint) {
  super();
  this.userId = userId;
  this.onboardingStatus = OnboardingStatus.NOT_STARTED;
}
```

---

#### 1.3 Role Aggregate (Reference)

Core Responsibility: Defines a named set of static permission tags. The actual authorization logic for relationship-based permissions resides in AuthorizationService.

| Member Type    | Member Name                 | PostgreSQL Type | Description                                                                                                                              | Domain Constraints / Rules                                     |
| :------------- | :-------------------------- | :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| Base Schema    | extends AggregateRootSchema | -               | Inherits `id`, `createdAt`, `updatedAt`, `version`, `deletedAt`                                                                          |                                                                |
| Aggregate Root | Role                        | -               | A template of permissions. (PRD Mapping: User Roles & Permissions)                                                                       | -                                                              |
| Field          | name                        | VARCHAR(50)     | e.g., "Student", "Parent", "Teacher". (PRD Mapping: 1.2 User Roles Definition)                                                           | UNIQUE, NOT NULL                                               |
| Field          | permissions                 | VARCHAR(100)[]  | Array of permission tags (e.g., `["student:read:linked_parent", "finance:view:linked_student"]`). (PRD Mapping: 1.4 Data Access Control) | Each string follows the pattern `<resource>:<action>:<scope>`. |

**Note**: The detailed implementation of permission tag parsing and authorization logic in `AuthorizationService` requires further refinement and will be addressed in a subsequent iteration of this document.

---

#### 1.4 Tenant Aggregate

Core Responsibility: Represents an organization and provides an invitation mechanism for joining users.

| Member Type    | Member Name                      | PostgreSQL Type | Description                                                                                                                                  | Domain Constraints / Rules                               |
| :------------- | :------------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| Base Schema    | extends AggregateRootSchema      | -               | Inherits `id`, `createdAt`, `updatedAt`, `version`, `deletedAt`                                                                              |                                                          |
| Aggregate Root | Tenant                           | -               | An organization using the system. (PRD Mapping: Tenant/Organization concept)                                                                 | -                                                        |
| Field          | invitationCode                   | VARCHAR(32)     | Code used for joining the tenant. Modeled as InvitationCode VO. (PRD Mapping: Sign-up Information - Invitation Code)                         | UNIQUE, NOT NULL, case‑insensitive, generated by system. |
| Method         | isInvitationValid(input: string) | boolean         | Compares input string to the stored InvitationCode value object (case-insensitive). (PRD Mapping: Invitation code validation during sign-up) | Returns true if match; otherwise false.                  |

---

#### 1.5 ParentStudentLink (Relationship Entity - Read-Only)

Core Responsibility: Persists the many‑to‑many relationship between parent and student users. No business rule validation is performed inside this entity. Validation is performed by ParentStudentLinkingService. Read-only: records creation timestamp only, no updates or versioning.

| Member Type | Member Name              | PostgreSQL Type | Description                                                                                     | Domain Constraints / Rules                                                     |
| :---------- | :----------------------- | :-------------- | :---------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| Base Schema | extends LinkEntitySchema | -               | Inherits `createdAt`, `deletedAt` (no `id`, `updatedAt`, `version`)                             |                                                                                |
| Entity      | ParentStudentLink        | -               | Links a parent user to a student user. (PRD Mapping: 1.2.2 Parent accesses linked student data) | Existence of both users is enforced by foreign keys. Composite primary key.    |
| Field       | parentUserId             | BIGINT          | References the parent's User.id. (PRD Mapping: Parent user)                                     | FOREIGN KEY (parentUserId) REFERENCES User(id), part of composite PRIMARY KEY  |
| Field       | studentUserId            | BIGINT          | References the student's User.id. (PRD Mapping: Student user)                                   | FOREIGN KEY (studentUserId) REFERENCES User(id), part of composite PRIMARY KEY |

**Constructor:**

```typescript
constructor(parentUserId: bigint, studentUserId: bigint) {
  super();
  this.parentUserId = parentUserId;
  this.studentUserId = studentUserId;
  // createdAt is set by LinkEntitySchema onCreate hook
}
```

---

#### 1.6 UserRoleLink (Relationship Entity - Read-Only)

Core Responsibility: Persists the many‑to‑many relationship between users and roles. Tracks which admin assigned each role. Read-only: records creation timestamp and assignment metadata, no updates or versioning.

| Member Type | Member Name              | PostgreSQL Type | Description                                                                                                                    | Domain Constraints / Rules                                                                 |
| :---------- | :----------------------- | :-------------- | :----------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| Base Schema | extends LinkEntitySchema | -               | Inherits `createdAt`, `deletedAt` (no `id`, `updatedAt`, `version`)                                                            |                                                                                            |
| Entity      | UserRoleLink             | -               | Associates a user with a specific role. (PRD Mapping: 1.3 Role Assignment Rules - Users can have multiple roles, at least one) | Existence of both User and Role is enforced by foreign keys. Composite primary key.        |
| Field       | userId                   | BIGINT          | References the User.id. (PRD Mapping: User)                                                                                    | FOREIGN KEY (userId) REFERENCES User(id), part of composite PRIMARY KEY                    |
| Field       | roleId                   | BIGINT          | References the Role.id. (PRD Mapping: Role)                                                                                    | FOREIGN KEY (roleId) REFERENCES Role(id), part of composite PRIMARY KEY                    |
| Field       | assignedBy               | BIGINT          | References the User.id of the administrator who made the assignment. (PRD Mapping: 1.3 Admin assigns roles)                    | FOREIGN KEY (assignedBy) REFERENCES User(id), NOT NULL. Tracks audit trail of assignments. |

**Constructor:**

```typescript
constructor(userId: bigint, roleId: bigint, assignedBy: bigint) {
  super();
  this.userId = userId;
  this.roleId = roleId;
  this.assignedBy = assignedBy;
  // createdAt is set by LinkEntitySchema onCreate hook
}
```

---

### 2. Value Objects (Domain Primitives)

These are immutable types that encapsulate validation and behavior for core concepts.

| Value Object   | Internal Representation | Invariants / Validation                                                                                             | Key Methods                                                                |
| :------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
| Email          | VARCHAR                 | Must conform to RFC 5322 format. Normalized to lowercase. (PRD Mapping: Sign-up Information - Email format)         | `create(email: string): Email`, `.value: string`                           |
| PhoneNumber    | VARCHAR                 | Must conform to E.164 format (or tenant‑specific pattern). (PRD Mapping: Sign-up Information - Phone number format) | `create(phone: string): PhoneNumber`, `.value: string`                     |
| PasswordHash   | VARCHAR                 | Must be a valid bcrypt/argon2 hash string. (PRD Mapping: Sign-up Information - Password)                            | `create(hash: string): PasswordHash`, `.value: string`                     |
| InvitationCode | VARCHAR                 | Alphanumeric, exactly 8 characters, case‑insensitive. (PRD Mapping: Sign-up Information - Invitation Code)          | `create(code: string): InvitationCode`, `.matches(input: string): boolean` |

---

### 3. Application Layer (Orchestration)

Application Services coordinate use cases. They own the transaction boundary, convert DTOs to domain objects, and delegate business logic to aggregates and domain services.

#### 3.1 UserApplicationService

**Method: `registerByEmail(dto: RegisterUserDto): Promise<UserDto>`**

Registers a new user via email with optional invitation code and phone number.

**Numbered Orchestration Steps:**

1. Validate input DTO (email format, password minimum length)
2. Call `RegistrationService.registerUser(dto.email, dto.password, dto.phoneNumber, dto.invitationCode)`
   - Service validates email uniqueness, phone uniqueness (if provided)
   - Service validates invitation code (if provided) via TenantRepository
   - Service derives tenantId from invitation code or uses default tenant
   - Service hashes password via PasswordHashService
   - Service creates User aggregate with status=ACTIVE, emailVerifiedAt=null
   - Throws: EmailAlreadyExistsError (1004), PhoneNumberAlreadyExistsError (1005), InvalidInvitationCodeError (1003)
3. Call `UserRepository.save(user)` to persist the new User aggregate
4. Extract domain events from aggregate (none emitted in this flow; AccountCreated published by application service)
5. Create and publish AccountCreated event via EventBusService with userId, email, tenantId, createdAt
6. Map User aggregate to UserDto and return

---

**Method: `findById(userId: bigint): Promise<UserDto | null>`**

Retrieves a user by ID.

**Numbered Orchestration Steps:**

1. Validate input (userId must be non-null)
2. Call `UserRepository.findById(userId)`
3. If user not found, return null
4. Map User aggregate to UserDto (id, tenantId, email, phoneNumber, status, createdAt, updatedAt)
5. Return UserDto

---

**Method: `authenticate(username: string, password: string): Promise<string>`**

Authenticates a user by email and password, returns JWT token.

**Numbered Orchestration Steps:**

1. Validate input (username and password non-empty)
2. Create EmailVo from username string
3. Call `UserRepository.findByEmail(emailVo)`
4. If user not found → throw UnauthorizedActionError or InvalidCredentialsError (custom code needed)
5. Call `PasswordHashService.compare(plainPassword, user.passwordHash.value)` to verify
6. If hash mismatch → throw InvalidCredentialsError
7. Generate JWT token with claims: userId (subject), exp (1 hour from now)
8. Return token string

---

#### 3.2 OnboardingApplicationService

**Method: `confirmStudentOnboarding(dto: CompleteOnboardingDto): Promise<void>`**

Completes student onboarding after signature verification.

**Numbered Orchestration Steps:**

1. Validate input DTO (studentUserId required)
2. Call `StudentProfileRepository.findByUserId(dto.studentUserId)`
3. If profile not found → throw UserNotFoundError (1006)
4. Call `studentProfile.completeOnboarding()` to transition status to COMPLETED and get event
   - Throws: OnboardingAlreadyCompletedError (1002) if already COMPLETED
   - Returns: StudentOnboardingCompleted event
5. Call `StudentProfileRepository.save(studentProfile)` to persist state change
6. Publish StudentOnboardingCompleted event via EventBusService
7. Return void

---

#### 3.3 RoleApplicationService

**Method: `assignRoleToUser(adminUserId: bigint, dto: AssignRoleDto): Promise<void>`**

Assigns a role to a user after verifying admin authorization.

**Numbered Orchestration Steps:**

1. Validate input (adminUserId, dto.targetUserId, dto.roleId all required)
2. Call `AuthorizationService.can(adminUserId, 'role:assign')` to check admin permission
3. If not authorized → throw UnauthorizedActionError (1010)
4. Create UserRoleLink instance: `new UserRoleLink(dto.targetUserId, dto.roleId, adminUserId)`
5. Call `UserRoleAssignmentRepository.save(userRoleLink)` to persist the assignment
6. Create RoleAssignedToUser event with userId, roleId, assignedBy
7. Publish event via EventBusService
8. Return void

---

#### 3.4 LinkingApplicationService

**Method: `linkParentToStudent(dto: LinkParentStudentDto): Promise<void>`**

Links a parent user to a student user after validation.

**Numbered Orchestration Steps:**

1. Validate input DTO (parentUserId, studentUserId required)
2. Call `ParentStudentLinkingService.validateAndLink(dto.parentUserId, dto.studentUserId)`
   - Service verifies both users exist
   - Service verifies both users belong to same tenant
   - Service verifies parent has Parent role
   - Service verifies student has Student role
   - Service creates and returns ParentStudentLink
   - Throws: UserNotFoundError (1006), DifferentTenantError (1009), InvalidRoleLinkingError (1008)
3. Call `ParentStudentLinkRepository.save(parentStudentLink)` to persist the link
4. Create ParentLinkedToStudent event with parentUserId, studentUserId, linkedAt (link.createdAt)
5. Publish event via EventBusService
6. Return void

---

### 4. Domain Events and Dispatching Pattern

Domain events are recorded in aggregate methods and published by repositories after successful persistence. This ensures atomicity: if persistence fails, events are not published.

#### 4.1 Event Accumulation in Aggregates

Aggregates maintain a private event list and provide controlled access:

```typescript
// In aggregate base class or individual aggregates
protected _domainEvents: DomainEvent[] = [];

// Get copy of events (prevents external modification)
getDomainEvents(): DomainEvent[] {
  return [...this._domainEvents];
}

// Clear events after publishing
clearDomainEvents(): void {
  this._domainEvents = [];
}

// Record event (called by aggregate methods)
protected addEvent(event: DomainEvent): void {
  this._domainEvents.push(event);
}
```

#### 4.2 Event Publication in Repositories

Repositories publish events after successful persistence:

```typescript
// In repository implementation
async save(aggregate: T): Promise<void> {
  // Persist aggregate to database
  await this.em.persist(aggregate).flush();

  // Extract events
  const events = aggregate.getDomainEvents();

  // Publish each event
  for (const event of events) {
    await this.eventBus.publish(event);
  }

  // Clear events to prevent re-publication
  aggregate.clearDomainEvents();
}
```

#### 4.3 Domain Events Catalog

| Event Name                 | Payload Data                          | Triggering Point                                                                                        | Aggregate Method                       |
| :------------------------- | :------------------------------------ | :------------------------------------------------------------------------------------------------------ | :------------------------------------- |
| AccountCreated             | userId, email, tenantId, createdAt    | Creation of a new User aggregate in RegistrationService.registerUser(). (PRD Mapping: Account creation) | N/A (application service publishes)    |
| EmailVerified              | userId, verifiedAt                    | User.markEmailVerified() method called by application service. (PRD Mapping: Email verification)        | `User.markEmailVerified()`             |
| StudentOnboardingCompleted | studentUserId, completedAt            | StudentProfile.completeOnboarding() returns this event. (PRD Mapping: OC Onboarding completed)          | `StudentProfile.completeOnboarding()`  |
| ParentLinkedToStudent      | parentUserId, studentUserId, linkedAt | After ParentStudentLink is persisted by repository. (PRD Mapping: Parent linked to student)             | N/A (published by application service) |
| RoleAssignedToUser         | userId, roleId, assignedBy            | After UserRoleLink is persisted by repository. (PRD Mapping: Role assignment)                           | N/A (published by application service) |

---

### 5. Domain Services (Encapsulated Business Rules)

These services contain logic that naturally spans multiple aggregates or requires external policy checks.

| Domain Service              | Method          | Responsibility                                                                                                                                                                                                                                                                                                                                                                               | Dependencies                                                 |
| :-------------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| RegistrationService         | registerUser    | Validates invitation code (via Tenant.isInvitationValid()), checks email/phone uniqueness, hashes the plain password, and creates a User aggregate with status set to ACTIVE and emailVerifiedAt set to null. Tenant ID is derived from the invitation code. Returns the new User. (PRD Mapping: Sign-up Information - Invitation code validation, email/phone uniqueness, password hashing) | TenantRepository, UserRepository, PasswordHasher.            |
| ParentStudentLinkingService | validateAndLink | Ensures both users belong to the same tenant, parent has Parent role, and student has Student role. If all validations pass, creates and returns a new ParentStudentLink entity ready for persistence. (PRD Mapping: 1.2.2 Parent role and linked student role, same tenant restriction)                                                                                                     | UserRepository, RoleRepository.                              |
| AuthorizationService        | can             | Determines if a user can perform an action on a resource. Implements layered RBAC + ReBAC. (PRD Mapping: 1.4 Data Access Control, 1.5 Permission Principles)                                                                                                                                                                                                                                 | UserRepository, RoleRepository, ParentStudentLinkRepository. |

**AuthorizationService.can() Implementation Strategy (To Be Refined):**

```typescript
async can(userId: bigint, action: string, resourceId?: bigint): Promise<boolean> {
  const roles = await this.userRepo.getRoles(userId);

  for (const role of roles) {
    for (const permTag of role.permissions) {
      // Check if permission tag matches action pattern
      if (this.matchesActionPattern(permTag, action)) {
        // Static permission (no relationship scope) → grant
        if (!this.hasScopeSuffix(permTag)) return true;

        // Relationship‑based scope (e.g., ":linked_parent") → check link table
        if (permTag.includes(':linked_parent') && resourceId) {
          const link = await this.linkRepo.findLink(userId, resourceId);
          if (link) return true;
        }
        // Additional relationship checks (e.g., ":own") can be added here.
      }
    }
  }

  return false;
}
```

---

### 6. Key Business Rules & Invariants

| Rule ID | Description                                                     | Enforcement Location                                                                                |
| :------ | :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| BR-01   | Students/Parents self-register; Teacher/Admin created by admin. | RegistrationService checks role restrictions; RoleApplicationService requires admin permission.     |
| BR-02   | Parents have read‑only access only to linked student data.      | AuthorizationService.can() verifies ParentStudentLink existence for actions tagged :linked_parent.  |
| BR-03   | Email addresses are unique and immutable.                       | Database UNIQUE constraint; no mutator method in User.                                              |
| BR-04   | Onboarding completion is a prerequisite for course access.      | AuthorizationService checks StudentProfile.onboardingStatus before granting course:view permission. |
| BR-05   | A user belongs to exactly one tenant.                           | User.tenantId is required and immutable after creation.                                             |

---

### 7. Reserved for Future Patterns

This section is reserved for additional domain-level patterns not yet documented.

---

### 8. Repository Interfaces

Defined in the domain layer; implemented in infrastructure. All repositories must publish domain events after successful persistence.

```typescript
interface IUserRepository {
  // Persistence
  save(user: User): Promise<void>;

  // Retrieval
  findById(id: bigint, options?: { include?: string[] }): Promise<User | null>;
  // Options: include: ['roles'] loads UserRoleLink entities

  findByEmail(email: EmailVo): Promise<User | null>;

  // Checks
  existsByPhone(phone: PhoneNumberVo): Promise<boolean>;

  // Aggregated queries
  getRoles(userId: bigint): Promise<Role[]>;
}

interface IStudentProfileRepository {
  save(profile: StudentProfile): Promise<void>;

  findByUserId(
    userId: bigint,
    options?: { include?: string[] },
  ): Promise<StudentProfile | null>;
  // Options: include: ['user'] loads User aggregate
}

interface ITenantRepository {
  findById(
    id: bigint,
    options?: { include?: string[] },
  ): Promise<Tenant | null>;

  findByInvitationCode(code: InvitationCodeVo): Promise<Tenant | null>;
}

interface IParentStudentLinkRepository {
  save(link: ParentStudentLink): Promise<void>;

  findLink(
    parentId: bigint,
    studentId: bigint,
  ): Promise<ParentStudentLink | null>;

  findByParentId(parentId: bigint): Promise<ParentStudentLink[]>;
}

interface IUserRoleAssignmentRepository {
  save(link: UserRoleLink): Promise<void>;

  findByUserId(userId: bigint): Promise<UserRoleLink[]>;

  findByRoleId(roleId: bigint): Promise<UserRoleLink[]>;
}

interface IRoleRepository {
  findById(id: bigint): Promise<Role | null>;

  findByName(name: string): Promise<Role | null>;
}
```

---

### 9. Error Codes & Exceptions

All domain exceptions use 4-digit error codes. Exceptions are thrown at the point where a business rule is violated.

| Code | Name                         | Trigger Condition                                                                       | Throwing Method/Service                                                                  |
| :--- | :--------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| 1000 | INVALID_PHONE_NUMBER         | PhoneNumber VO validation fails (E.164 format, tenant-specific pattern)                 | `User.updatePhoneNumber()`                                                               |
| 1001 | WEAK_PASSWORD                | PasswordHash VO validation fails (invalid bcrypt/argon2 hash)                           | `User.updatePassword()`                                                                  |
| 1002 | ONBOARDING_ALREADY_COMPLETED | StudentProfile.completeOnboarding() called when onboardingStatus is already COMPLETED   | `StudentProfile.completeOnboarding()`                                                    |
| 1003 | INVALID_INVITATION_CODE      | Invitation code not found or invalid in TenantRepository during registration            | `RegistrationService.registerUser()`                                                     |
| 1004 | EMAIL_ALREADY_EXISTS         | Email uniqueness check fails in UserRepository during registration                      | `RegistrationService.registerUser()`                                                     |
| 1005 | PHONE_NUMBER_ALREADY_EXISTS  | Phone number uniqueness check fails in UserRepository during registration (if provided) | `RegistrationService.registerUser()`                                                     |
| 1006 | USER_NOT_FOUND               | User lookup fails in repository queries                                                 | `OnboardingApplicationService.confirmStudentOnboarding()`, `ParentStudentLinkingService` |
| 1007 | TENANT_NOT_FOUND             | Tenant lookup fails in TenantRepository                                                 | `RegistrationService.registerUser()`                                                     |
| 1008 | INVALID_ROLE_LINKING         | User does not have expected role (Parent/Student) during linking or assignment          | `ParentStudentLinkingService.validateAndLink()`                                          |
| 1009 | DIFFERENT_TENANT             | Parent and student belong to different tenants during linking                           | `ParentStudentLinkingService.validateAndLink()`                                          |
| 1010 | UNAUTHORIZED_ACTION          | Admin permission check fails for role assignment or other privileged operations         | `RoleApplicationService.assignRoleToUser()`, `AuthorizationService.can()`                |
| 1011 | INVALID_VERIFICATION_CODE    | Email verification code is invalid, expired, or mismatches during verification workflow | `EmailVerificationService.verifyEmailAndIssueToken()`                                    |

---

### 10. Data Transfer Objects (DTOs)

All input and response DTOs are validated using Zod schemas. Optional fields are marked with `?`.

#### 10.1 RegisterUserDto (Input)

```typescript
{
  email: string;           // RFC 5322 format, required
  password: string;        // Minimum 8 characters, required
  phoneNumber?: string;    // E.164 format or tenant-specific pattern, optional
  invitationCode?: string; // Alphanumeric, 8 chars, optional (default tenant if not provided)
}
```

**Validation:** Email format, password minimum length.

---

#### 10.2 UserDto (Output)

```typescript
{
  id: bigint;              // Unique user identifier
  tenantId: bigint;        // User's tenant
  email: string;           // User's email address
  phoneNumber?: string;    // User's phone number (optional if not set)
  status: UserStatus;      // ACTIVE | INACTIVE
  createdAt: Date;         // Account creation timestamp
  updatedAt: Date;         // Last modification timestamp
}
```

---

#### 10.3 CompleteOnboardingDto (Input)

```typescript
{
  studentUserId: bigint;        // ID of student completing onboarding, required
  signatureData?: Record<string, unknown>; // Optional signature metadata for future use
}
```

---

#### 10.4 LinkParentStudentDto (Input)

```typescript
{
  parentUserId: bigint; // ID of parent user, required
  studentUserId: bigint; // ID of student user, required
}
```

---

#### 10.5 AssignRoleDto (Input)

```typescript
{
  targetUserId: bigint; // ID of user receiving role, required
  roleId: bigint; // ID of role to assign, required
}
```

---

### 11. Query Operations (Read-Only)

Read-only methods return data without recording domain events.

#### UserRepository Query Methods

- `findByEmail(email: EmailVo): Promise<User | null>` - Find user by email address (case-insensitive match)
- `existsByPhone(phone: PhoneNumberVo): Promise<boolean>` - Check if phone number is registered
- `getRoles(userId: bigint): Promise<Role[]>` - Get all roles assigned to a user

#### StudentProfileRepository Query Methods

- `findByUserId(userId: bigint, options?: { include?: string[] }): Promise<StudentProfile | null>` - Find profile by user ID

#### TenantRepository Query Methods

- `findByInvitationCode(code: InvitationCodeVo): Promise<Tenant | null>` - Find tenant by invitation code

#### ParentStudentLinkRepository Query Methods

- `findByParentId(parentId: bigint): Promise<ParentStudentLink[]>` - Get all students linked to a parent
- `findLink(parentId: bigint, studentId: bigint): Promise<ParentStudentLink | null>` - Check if link exists

#### UserRoleAssignmentRepository Query Methods

- `findByUserId(userId: bigint): Promise<UserRoleLink[]>` - Get all role assignments for a user
- `findByRoleId(roleId: bigint): Promise<UserRoleLink[]>` - Get all users with a specific role

#### RoleRepository Query Methods

- `findById(id: bigint): Promise<Role | null>` - Find role by ID
- `findByName(name: string): Promise<Role | null>` - Find role by name (e.g., "Student", "Parent", "Teacher")

---

### 12. Aggregate Root Relationship Loading (ORM Pattern)

Collections and relationships are **empty by default** to avoid N+1 query problems. Use explicit `include` option in repository methods to load relationships.

#### Pattern: Empty-by-Default with Explicit Include

```typescript
// Default: User without roles
const user = await userRepository.findById(userId);
// user.roles is undefined or empty array

// Explicit: Load roles with user
const userWithRoles = await userRepository.findById(userId, { include: ['roles'] });
// userWithRoles.roles contains UserRoleLink[] from database

// Example query in application service
async getFullUser(userId: bigint): Promise<UserDto> {
  const user = await this.userRepository.findById(userId, { include: ['roles'] });
  if (!user) throw new UserNotFoundError(userId);

  // Now user.roles is populated
  return this.mapToDto(user);
}
```

#### Relationship Types

| Relationship             | Collection Field | Include Key      | Related Entity      | Loading Notes                                   |
| :----------------------- | :--------------- | :--------------- | :------------------ | :---------------------------------------------- |
| User ← UserRoleLink      | roles            | 'roles'          | UserRoleLink[]      | Empty by default; load for authorization checks |
| User ← ParentStudentLink | linkedStudents   | 'linkedStudents' | ParentStudentLink[] | Lazy-load; parent users only                    |
| StudentProfile ← User    | user             | 'user'           | User                | Lazy-load if needed for aggregated data         |

**Key Principle**: Always specify `include` explicitly in repository calls. Never assume relationships are loaded.

---

### 13. Microservice Integration Note

- Course & Enrollment aggregates reside in a separate CourseService.
- This service publishes StudentOnboardingCompleted events to a message broker.
- CourseService subscribes to these events and updates its local read model to enforce access without runtime RPC calls.
- UserService publishes: AccountCreated, EmailVerified, StudentOnboardingCompleted, ParentLinkedToStudent, RoleAssignedToUser
- UserService consumes: (none currently; ready for future events from CourseService)
