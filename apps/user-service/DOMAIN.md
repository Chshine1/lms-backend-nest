## Domain Model

### 1. Aggregates and Entities

#### 1.1 User Aggregate

**Core Responsibility**: Manages the core identity, credentials, and tenant association of a user. It does **not** hold role assignments or student-specific profile data.

| Member Type        | Member Name         | PostgreSQL Type | Description / Domain Behavior                                                                                                                                                                                                                                                                 | Domain Constraints / Rules                                             |
| :----------------- | :------------------ | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **Aggregate Root** | **User**            | -               | The central identity in the system. (PRD Mapping: Overall Architecture / Registration & Login)                                                                                                                                                                                                | -                                                                      |
| Field              | `id`                | `BIGINT`        | Unique user identifier.                                                                                                                                                                                                                                                                       | `PRIMARY KEY`                                                          |
| Field              | `tenantId`          | `BIGINT`        | Reference to the owning `Tenant`. (PRD Mapping: Tenant isolation)                                                                                                                                                                                                                             | `FOREIGN KEY (tenantId) REFERENCES Tenant(id)`, `NOT NULL`             |
| Field              | `email`             | `VARCHAR(255)`  | User's email, used for login. **Modeled as `Email` value object in domain layer.** (PRD Mapping: Sign-up Information - Email Address)                                                                                                                                                         | `UNIQUE`, `NOT NULL`, immutable after creation.                        |
| Field              | `phoneNumber`       | `VARCHAR(20)`   | User's phone number. **Modeled as `PhoneNumber` value object.** **Business Rule Note: Phone number is mutable and unique. When a user changes their number, the old number is immediately released and can be registered by another user.** (PRD Mapping: Sign-up Information - Phone Number) | `UNIQUE`, optional, mutable with verification.                         |
| Field              | `hashedPassword`    | `VARCHAR(255)`  | Stored credential hash. **Encapsulated as `PasswordHash` value object.** (PRD Mapping: Sign-up Information - Password)                                                                                                                                                                        | `NOT NULL`                                                             |
| Field              | `status`            | `VARCHAR(30)`   | Account lifecycle status (`ACTIVE`, `INACTIVE`, `LOCKED`). (PRD Mapping: Account lifecycle, not explicitly defined in PRD)                                                                                                                                                                    | `NOT NULL`, restricted to `UserStatus` enum.                           |
| **Entity Method**  | `updatePhoneNumber` | -               | Replaces `phoneNumber` after external verification. Validates format via `PhoneNumber` VO. (PRD Mapping: Sign-up Information - Phone Number is updatable)                                                                                                                                     | Throws `InvalidPhoneNumberException`.                                  |
| **Entity Method**  | `updatePassword`    | -               | Replaces `hashedPassword` with a new `PasswordHash`. Does **not** verify old password (done externally). (PRD Mapping: Sign-up Information - Password is changeable)                                                                                                                          | Throws `WeakPasswordException` if hash does not meet complexity rules. |

---

#### 1.2 StudentProfile Aggregate

**Core Responsibility**: Manages student-specific attributes and onboarding progress. Separated from `User` to respect microservice boundaries and single responsibility.

| Member Type        | Member Name          | PostgreSQL Type | Description / Domain Behavior                                                                                                | Domain Constraints / Rules                                                            |
| :----------------- | :------------------- | :-------------- | :--------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| **Aggregate Root** | **StudentProfile**   | -               | Extended profile for a user who holds the `Student` role. (PRD Mapping: Student Profile)                                     | Must reference an existing `User`.                                                    |
| Field              | `id`                 | `BIGINT`        | Unique profile identifier.                                                                                                   | `PRIMARY KEY`                                                                         |
| Field              | `userId`             | `BIGINT`        | Reference to the base `User`. (PRD Mapping: Link to base user)                                                               | `FOREIGN KEY (userId) REFERENCES User(id)`, `UNIQUE` (one profile per student).       |
| Field              | `onboardingStatus`   | `VARCHAR(30)`   | Progress of mandatory onboarding (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`). (PRD Mapping: OC Onboarding)                   | `NOT NULL`, restricted to `OnboardingStatus` enum.                                    |
| **Entity Method**  | `completeOnboarding` | -               | Transitions `onboardingStatus` to `COMPLETED` and records completion timestamp. (PRD Mapping: OC Onboarding completion step) | Throws `OnboardingAlreadyCompletedException`. Publishes `StudentOnboardingCompleted`. |

---

#### 1.3 Role Aggregate (Reference)

**Core Responsibility**: Defines a named set of static permission **tags**. The actual authorization logic for relationship-based permissions resides in `AuthorizationService`.

| Member Type        | Member Name   | PostgreSQL Type  | Description                                                                                                                              | Domain Constraints / Rules                                     |
| :----------------- | :------------ | :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **Aggregate Root** | **Role**      | -                | A template of permissions. (PRD Mapping: User Roles & Permissions)                                                                       | -                                                              |
| Field              | `id`          | `BIGINT`         | Unique identifier.                                                                                                                       | `PRIMARY KEY`                                                  |
| Field              | `name`        | `VARCHAR(50)`    | e.g., "Student", "Parent", "Teacher". (PRD Mapping: 1.2 User Roles Definition)                                                           | `UNIQUE`, `NOT NULL`                                           |
| Field              | `permissions` | `VARCHAR(100)[]` | Array of permission tags (e.g., `["student:read:linked_parent", "finance:view:linked_student"]`). (PRD Mapping: 1.4 Data Access Control) | Each string follows the pattern `<resource>:<action>:<scope>`. |

---

#### 1.4 Tenant Aggregate

**Core Responsibility**: Represents an organization and provides an invitation mechanism for joining users.

| Member Type        | Member Name           | PostgreSQL Type | Description                                                                                                                 | Domain Constraints / Rules                                   |
| :----------------- | :-------------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| **Aggregate Root** | **Tenant**            | -               | An organization using the system. (PRD Mapping: Tenant/Organization concept)                                                | -                                                            |
| Field              | `id`                  | `BIGINT`        | Unique identifier.                                                                                                          | `PRIMARY KEY`                                                |
| Field              | `invitationCode`      | `VARCHAR(32)`   | Code used for joining the tenant. **Modeled as `InvitationCode` VO.** (PRD Mapping: Sign-up Information - Invitation Code)  | `UNIQUE`, `NOT NULL`, case‑insensitive, generated by system. |
| **Entity Method**  | `isInvitationValid()` | -               | Compares input string to the stored `InvitationCode` value object. (PRD Mapping: Invitation code validation during sign-up) | Returns `true` if match; otherwise `false`.                  |

---

#### 1.5 ParentStudentLink (Relationship Entity)

**Core Responsibility**: Persists the many‑to‑many relationship between parent and student users. **No business rule validation is performed inside this entity.** Validation (e.g., ensuring correct roles) is performed by `ParentStudentLinkingService`.

| Member Type | Member Name       | PostgreSQL Type | Description                                                                                     | Domain Constraints / Rules                                                         |
| :---------- | :---------------- | :-------------- | :---------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| Entity      | ParentStudentLink | -               | Links a parent user to a student user. (PRD Mapping: 1.2.2 Parent accesses linked student data) | Existence of both users is enforced by foreign keys.                               |
| Field       | `parentUserId`    | `BIGINT`        | References the parent's `User.id`. (PRD Mapping: Parent user)                                   | `FOREIGN KEY (parentUserId) REFERENCES User(id)`, part of composite `PRIMARY KEY`  |
| Field       | `studentUserId`   | `BIGINT`        | References the student's `User.id`. (PRD Mapping: Student user)                                 | `FOREIGN KEY (studentUserId) REFERENCES User(id)`, part of composite `PRIMARY KEY` |

---

#### 1.6 UserRoleLink (Relationship Entity)

**Core Responsibility**: Persists the many‑to‑many relationship between users and roles. Implements the rule that each user must have at least one role.

| Member Type | Member Name      | PostgreSQL Type | Description                                                                                                                    | Domain Constraints / Rules                                                  |
| :---------- | :--------------- | :-------------- | :----------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| Entity      | **UserRoleLink** | -               | Associates a user with a specific role. (PRD Mapping: 1.3 Role Assignment Rules - Users can have multiple roles, at least one) | Existence of both `User` and `Role` is enforced by foreign keys.            |
| Field       | `userId`         | `BIGINT`        | References the `User.id`. (PRD Mapping: User)                                                                                  | `FOREIGN KEY (userId) REFERENCES User(id)`, part of composite `PRIMARY KEY` |
| Field       | `roleId`         | `BIGINT`        | References the `Role.id`. (PRD Mapping: Role)                                                                                  | `FOREIGN KEY (roleId) REFERENCES Role(id)`, part of composite `PRIMARY KEY` |
| Field       | `assignedBy`     | `BIGINT`        | References the `User.id` of the administrator who made the assignment. (PRD Mapping: 1.3 Admin assigns roles)                  | `FOREIGN KEY (assignedBy) REFERENCES User(id)`                              |

---

### 2. Value Objects (Domain Primitives)

These are immutable types that encapsulate validation and behavior for core concepts.

| Value Object     | Internal Representation | Invariants / Validation                                                                                             | Behavior         |
| :--------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------ | :--------------- |
| `Email`          | `VARCHAR`               | Must conform to RFC 5322 format. Normalized to lowercase. (PRD Mapping: Sign-up Information - Email format)         |                  |
| `PhoneNumber`    | `VARCHAR`               | Must conform to E.164 format (or tenant‑specific pattern). (PRD Mapping: Sign-up Information - Phone number format) |                  |
| `PasswordHash`   | `VARCHAR`               | Must be a valid bcrypt/argon2 hash string. (PRD Mapping: Sign-up Information - Password)                            |                  |
| `InvitationCode` | `VARCHAR`               | Alphanumeric, exactly 8 characters, case‑insensitive. (PRD Mapping: Sign-up Information - Invitation Code)          | `matches(input)` |

---

### 3. Application Layer (Orchestration)

**Application Services** coordinate use cases. They own the transaction boundary, convert DTOs to domain objects, and delegate business logic to aggregates and domain services.

| Application Service              | Method                     | Input                                                 | Output    | Dependencies / Notes                                                                                                                                                               |
| :------------------------------- | :------------------------- | :---------------------------------------------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UserApplicationService**       | `registerByEmail`          | `email`, `plainPassword`, `invitationCode` (optional) | `UserDto` | Uses `TenantRepository`, `UserRepository`, `PasswordHasher`. Calls `RegistrationDomainService`. Publishes `AccountCreated`. (PRD Mapping: Sign-up Information - Registration flow) |
| **UserApplicationService**       | `verifyEmail`              | `userId`, `token`                                     | `void`    | Uses `TokenRepository`. Calls `User.markEmailVerified()` (if email status managed in User). (PRD Mapping: Registration email verification)                                         |
| **OnboardingApplicationService** | `confirmStudentOnboarding` | `studentUserId`, `signatureData`                      | `void`    | Uses `StudentProfileRepository`, `SignatureVerificationService`. Updates `StudentProfile.completeOnboarding()`. (PRD Mapping: OC Onboarding)                                       |
| **RoleApplicationService**       | `assignRoleToUser`         | `adminUserId`, `targetUserId`, `roleId`               | `void`    | Uses `AuthorizationService` to verify admin permission, then updates `UserRoleAssignment`. (PRD Mapping: 1.3 Role Assignment Rules)                                                |
| **LinkingApplicationService**    | `linkParentToStudent`      | `parentUserId`, `studentUserId`                       | `void`    | Uses `ParentStudentLinkingService` for validation, then persists `ParentStudentLink`. (PRD Mapping: 1.2.2 Parent links to student)                                                 |

---

### 4. Domain Services (Encapsulated Business Rules)

These services contain logic that naturally spans multiple aggregates or requires external policy checks.

| Domain Service                  | Method            | Responsibility                                                                                                                                                                                                                                 | Dependencies                                                       |
| :------------------------------ | :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **RegistrationService**         | `registerUser`    | Validates invitation code (via `Tenant.isInvitationValid()`), checks email/phone uniqueness, and creates a `User` aggregate. Returns the new `User`. (PRD Mapping: Sign-up Information - Invitation code validation, email/phone uniqueness)   | `TenantRepository`, `UserRepository`, `PasswordHasher`.            |
| **ParentStudentLinkingService** | `validateAndLink` | Ensures both users belong to the same tenant, parent has `Parent` role, and student has `Student` role. Returns a `ParentStudentLink` ready for persistence. (PRD Mapping: 1.2.2 Parent role and linked student role, same tenant restriction) | `UserRepository`, `RoleRepository`.                                |
| **AuthorizationService**        | `can`             | Determines if a user can perform an action on a resource. **Implements layered RBAC + ReBAC.** (PRD Mapping: 1.4 Data Access Control, 1.5 Permission Principles)                                                                               | `UserRepository`, `RoleRepository`, `ParentStudentLinkRepository`. |

**`AuthorizationService.can()` Implementation Strategy**:

```typescript
async can(userId: UserId, action: string, resourceId?: ResourceId): Promise<boolean> {
    const roles = await this.userRepo.getRoles(userId);
    for (const role of roles) {
        for (const permTag of role.permissions) {
            if (matchesActionPattern(permTag, action)) {
                // Static permission (no relationship scope) → grant
                if (!hasScopeSuffix(permTag)) return true;

                // Relationship‑based scope (e.g., ":linked_parent") → check link table
                if (permTag.includes(':linked_parent') && resourceId) {
                    const link = await this.linkRepo.findParentStudentLink(userId, resourceId);
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

### 5. Domain Events

| Event Name                     | Payload Data                                | Triggering Point                                                                                                  |
| :----------------------------- | :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| **AccountCreated**             | `userId`, `email`, `tenantId`, `createdAt`  | `UserApplicationService.registerByEmail` after persistence. (PRD Mapping: Account creation successful)            |
| **EmailVerificationRequested** | `userId`, `email`, `expiresAt`              | When a verification email is queued (out of scope for this model). (PRD Mapping: Registration email verification) |
| **EmailVerified**              | `userId`, `verifiedAt`                      | After successful token validation. (PRD Mapping: Email verification successful)                                   |
| **StudentOnboardingCompleted** | `studentUserId`, `completedAt`              | `StudentProfile.completeOnboarding()` called via application service. (PRD Mapping: OC Onboarding completed)      |
| **ParentLinkedToStudent**      | `parentUserId`, `studentUserId`, `linkedAt` | After `ParentStudentLink` is persisted. (PRD Mapping: Parent linked to student successfully)                      |
| **RoleAssignedToUser**         | `userId`, `roleId`, `assignedBy`            | After a role assignment is saved (via RoleApplicationService). (PRD Mapping: Role assignment)                     |

---

### 6. Key Business Rules & Invariants

| Rule ID   | Description                                                     | Enforcement Location                                                                                      |
| :-------- | :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **BR-01** | Students/Parents self-register; Teacher/Admin created by admin. | `RegistrationDomainService` checks role restrictions; `RoleApplicationService` requires admin permission. |
| **BR-02** | Parents have read‑only access **only** to linked student data.  | `AuthorizationService.can()` verifies `ParentStudentLink` existence for actions tagged `:linked_parent`.  |
| **BR-03** | Email addresses are unique and immutable.                       | Database `UNIQUE` constraint; no mutator method in `User`.                                                |
| **BR-04** | Onboarding completion is a prerequisite for course access.      | `AuthorizationService` checks `StudentProfile.onboardingStatus` before granting `course:view` permission. |
| **BR-05** | A user belongs to exactly one tenant.                           | `User.tenantId` is required and immutable after creation.                                                 |

---

### 7. Repository Interfaces (Conceptual)

Defined in the domain layer; implemented in infrastructure.

```typescript
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  existsByPhone(phone: PhoneNumber): Promise<boolean>;
  getRoles(userId: UserId): Promise<Role[]>;
}

interface StudentProfileRepository {
  save(profile: StudentProfile): Promise<void>;
  findByUserId(userId: UserId): Promise<StudentProfile | null>;
}

interface TenantRepository {
  findById(id: TenantId): Promise<Tenant | null>;
  findByInvitationCode(code: InvitationCode): Promise<Tenant | null>;
}

interface ParentStudentLinkRepository {
  save(link: ParentStudentLink): Promise<void>;
  findLink(
    parentId: UserId,
    studentId: UserId,
  ): Promise<ParentStudentLink | null>;
  findByParentId(parentId: UserId): Promise<ParentStudentLink[]>;
}
```

---

### 8. Microservice Integration Note

- **Course & Enrollment aggregates** reside in a separate `CourseService`.
- This service publishes `StudentOnboardingCompleted` events to a message broker.
- `CourseService` subscribes to these events and updates its local read model to enforce access without runtime RPC calls.
