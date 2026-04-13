# User Service Domain Model Implementation Summary

This document summarizes the implementation of the domain model for user-service based on `DOMAIN.md`.

## Implementation Overview

The implementation follows Domain-Driven Design (DDD) principles with:

- **MikroORM** for database persistence (as requested)
- **RabbitMQ RPC** for inter-service communication
- **Typed Client** pattern for type-safe RPC calls
- Clear separation between domain, application, and infrastructure layers

## Structure

```
apps/user-service/src/
├── domain/                           # Domain Layer
│   ├── entities/                     # Aggregates & Entities
│   │   ├── user.entity.ts           # User aggregate root
│   │   ├── student-profile.entity.ts # StudentProfile aggregate root
│   │   ├── tenant.entity.ts         # Tenant aggregate root
│   │   ├── role.entity.ts           # Role aggregate root
│   │   ├── parent-student-link.entity.ts  # Relationship entity
│   │   └── user-role-assignment.entity.ts # Relationship entity
│   ├── value-objects/                # Value Objects
│   │   ├── email.value-object.ts
│   │   ├── phone-number.value-object.ts
│   │   ├── password-hash.value-object.ts
│   │   └── invitation-code.value-object.ts
│   ├── enums/
│   │   ├── user-status.enum.ts
│   │   └── onboarding-status.enum.ts
│   ├── services/                     # Domain Services
│   │   ├── registration-domain.service.ts
│   │   ├── parent-student-linking.service.ts
│   │   └── authorization.service.ts
│   ├── repositories/                 # Repository Interfaces
│   │   ├── user.repository.interface.ts
│   │   ├── student-profile.repository.interface.ts
│   │   ├── tenant.repository.interface.ts
│   │   ├── role.repository.interface.ts
│   │   ├── parent-student-link.repository.interface.ts
│   │   └── user-role-assignment.repository.interface.ts
│   ├── exceptions/
│   │   └── domain.exceptions.ts
│   ├── events/
│   │   └── domain.events.ts
│   └── shared/
│       └── base-entity-v2.ts        # MikroORM base entity
├── application/                      # Application Layer
│   ├── services/
│   │   ├── user-application.service.ts
│   │   ├── onboarding-application.service.ts
│   │   ├── role-application.service.ts
│   │   └── linking-application.service.ts
│   └── dtos/
│       ├── register-user.dto.ts
│       ├── user.dto.ts
│       ├── assign-role.dto.ts
│       ├── link-parent-student.dto.ts
│       └── complete-onboarding.dto.ts
├── user.controller.ts                # RabbitMQ RPC Controller
└── user.module.ts                    # NestJS Module
```

## Key Implementation Details

### 1. MikroORM Integration

Created `BaseEntityV2` for MikroORM (separate from TypeORM's `BaseEntity` used in course-service):

```typescript
// apps/user-service/src/domain/shared/base-entity-v2.ts
export abstract class BaseEntityV2 {
  @PrimaryKey({ type: 'bigint' })
  id!: number;

  @Property({ fieldName: 'created_at' })
  createdAt: Date = new Date();

  @Property({ fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ fieldName: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @Property({ version: true })
  version!: number;
}
```

### 2. Entities with Domain Methods

All entities include business logic as specified in DOMAIN.md:

- **User**: `updatePhoneNumber()`, `updatePassword()`, `lock()`, `activate()`, `deactivate()`
- **StudentProfile**: `startOnboarding()`, `completeOnboarding()` (returns domain event)
- **Tenant**: `isInvitationValid()` (validates invitation codes)

### 3. Value Objects with Validation

All value objects are immutable and enforce invariants:

- **Email**: RFC 5322 validation, normalized to lowercase
- **PhoneNumber**: E.164 format validation
- **PasswordHash**: Validates bcrypt/argon2 hash format
- **InvitationCode**: 8 alphanumeric characters, case-insensitive

### 4. Domain Services

Three domain services encapsulate cross-aggregate business rules:

- **RegistrationDomainService**: Validates invitation codes, checks uniqueness, creates users
- **ParentStudentLinkingService**: Validates role requirements and tenant consistency
- **AuthorizationService**: Implements layered RBAC + ReBAC with relationship-based permissions

### 5. Application Services

Four application services orchestrate use cases:

- **UserApplicationService**: User registration and queries
- **OnboardingApplicationService**: Student onboarding completion
- **RoleApplicationService**: Role assignment with authorization
- **LinkingApplicationService**: Parent-student linking

### 6. RabbitMQ RPC Integration

The controller implements RabbitMQ RPC patterns matching course-service:

```typescript
@RabbitRPC({
  exchange: 'user-service',
  routingKey: 'user.register',
  queue: 'user-service-user-register',
  errorHandler: defaultNackErrorHandler,
  queueOptions: { durable: true, autoDelete: false },
})
registerUser(data: RegisterUserDto): Promise<UserDto> {
  return this.userApplicationService.registerByEmail(data);
}
```

### 7. Typed Client Pattern

Updated `UserTypedClient` and `UserPatterns` for type-safe inter-service communication:

```typescript
// libs/typed-client/src/patterns/user.patterns.ts
export interface UserPatterns {
  'user.register': { request: RegisterUserDto; response: UserDto };
  'user.find-by-id': { request: { userId: number }; response: UserDto | null };
  'user.assign-role': { request: AssignRoleDto; response: void };
  'user.link-parent-student': { request: LinkParentStudentDto; response: void };
  'user.complete-onboarding': {
    request: CompleteOnboardingDto;
    response: void;
  };
}
```

## Domain Events

Six domain events are defined for publishing:

- `AccountCreated`
- `EmailVerificationRequested`
- `EmailVerified`
- `StudentOnboardingCompleted`
- `ParentLinkedToStudent`
- `RoleAssignedToUser`

_Note: Event publishing is currently stubbed with console.log. Integration with an event bus (e.g., RabbitMQ, EventEmitter) needs to be added._

## Next Steps

To complete the implementation, you'll need to:

1. **Add MikroORM configuration** to `user.module.ts`
2. **Implement repository classes** in `infrastructure/` layer
3. **Implement PasswordHasher** service (bcrypt/argon2)
4. **Add event bus integration** for domain events
5. **Create database migrations** for entities
6. **Add unit tests** for domain logic
7. **Add integration tests** for application services

## Differences from course-service

As requested:

- ✅ Uses **MikroORM** instead of TypeORM
- ✅ Created **BaseEntityV2** (separate from course-service BaseEntity)
- ✅ Follows **RabbitMQ RPC pattern** from course-service controller
- ✅ Uses **typed-client pattern** for inter-service calls
- ✅ Implements **proper domain services** (unlike course-service)
- ✅ Follows **DDD principles** with rich domain model

## File Locations Reference

All files follow the project's path alias conventions:

- `@/user-service/src/*` for user-service code
- `@app/contracts` for shared contracts
- `@app/typed-client` for typed client patterns
