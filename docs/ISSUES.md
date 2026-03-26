# Code Review Findings

This document records all issues identified during the pre-launch code review of the LMS Backend NestJS monorepo.

## Table of Contents

- [High Severity Issues](#high-severity-issues)
- [Medium Severity Issues](#medium-severity-issues)
- [Low Severity Issues](#low-severity-issues)

---

## High Severity Issues

### 1. JWT Payload Type Mismatch

**Location**: `apps/gateway/src/auth/jwt.strategy.ts:18-23`

**Issue**: The JWT payload has `sub: string`, but user IDs in the database are `number`. The `validate()` method returns `userId: string` instead of `number`.

**Current Code**:

```typescript
validate(payload: { sub: string; username: string }): {
  userId: string;  // Should be number
  username: string;
} {
  return { userId: payload.sub, username: payload.username };
}
```

**Impact**: Type inconsistency when `userId` is used for database lookups.

**Recommendation**: Change `sub: string` to `sub: number` and return `userId: number`.

---

### 2. ValidateUserDto Has No Validators

**Location**: `libs/contracts/src/user/dto/validate-user.dto.ts:1-4`

**Issue**: The DTO has no class-validator decorators, allowing empty strings and invalid values to reach the service layer.

**Current Code**:

```typescript
export class ValidateUserDto {
  username!: string; // NO VALIDATION
  password!: string; // NO VALIDATION
}
```

**Impact**: Authentication accepts any non-null value, including empty strings.

**Recommendation**: Add validators:

```typescript
@IsDefined()
@IsString()
@IsNotEmpty()
username!: string;

@IsDefined()
@IsString()
@IsNotEmpty()
password!: string;
```

---

### 3. Phone Field Uses @IsEmail Validator

**Location**: `libs/contracts/src/user/dto/create-user.dto.ts:25`

**Issue**: The `phone` field incorrectly uses `@IsEmail()` validator instead of phone validation.

**Current Code**:

```typescript
@IsDefined()
@IsString()
@IsEmail()  // WRONG: Phone should not be email
phone!: string;
```

**Recommendation**: Replace `@IsEmail()` with appropriate phone validation or remove the validator.

---

### 4. PermissionModule Not Imported in course-service

**Location**: `apps/course-service/src/course.module.ts:14`

**Issue**: The `InfrastructureModule.forMicroserviceAsync()` is missing the `permissionEntity` configuration. Compare with user-service which correctly includes it.

**Current Code (course-service)**:

```typescript
InfrastructureModule.forMicroserviceAsync({
  entities: [...],
  exchanges: [...],
  // MISSING: permissionEntity: UserPermission,
}),
```

**Impact**: Authorization guards will not function in course-service.

---

### 5. File.size Type Mismatch Between Contract and Entity

**Location**:

- `libs/contracts/src/file/entities/file.contract.ts:12` (number)
- `apps/file-service/src/entities/file.entity.ts:28` (bigint)

**Issue**: Contract defines `size!: number` but entity uses `@Column({ type: 'bigint' }) size!: number`.

**Impact**: Type coercion issues when converting between contract and entity.

---

## Medium Severity Issues

### 6. PermissionGuard and PermissionService Not Exported

**Location**: `libs/authentication/src/index.ts`

**Issue**: `PermissionGuard` and `PermissionService` are not exported from the authentication library.

**Current Exports**:

```typescript
export { PermissionModule } from './permission/permission.module';
export { RequirePermissions } from './permission/permission.decorator';
export { type Permission } from './permission/permission.interface';
```

**Missing**:

```typescript
export { PermissionGuard } from './permission/permission.guard';
export { PermissionService } from './permission/permission.service';
```

---

### 7. FileService.createFile Signature Mismatch

**Location**: `apps/file-service/src/file.service.ts:34-37`

**Issue**: Method expects `file: Express.Multer.File` as a required parameter, but the typed-client doesn't pass this parameter.

**Impact**: File upload via typed-client will fail.

---

### 8. TenantId Missing in CreateUserDto

**Location**: `libs/contracts/src/user/dto/create-user.dto.ts`

**Issue**: `CreateUserDto` lacks a `tenantId` field, but `UserContract` requires it. The service creates users without setting `tenantId`.

**Impact**: Data integrity issues; users created without tenant association.

---

### 9. Optional Fields in CourseVideo Marked Required

**Location**: `apps/course-service/src/entities/course-video.entity.ts:26-30`

**Issue**: `unlockCondition` and `validityPeriod` are optional in the contract but marked as required in the entity.

**Contract** (optional):

```typescript
unlockCondition?: string;
validityPeriod?: Date;
```

**Entity** (required):

```typescript
@Column({ name: 'unlock_condition', type: 'text', nullable: true })
unlockCondition!: string;  // Should be unlockCondition?
```

---

### 10. Duplicate Version Column in CourseMaterial

**Location**: `apps/course-service/src/entities/course-material.entity.ts:44`

**Issue**: `version` is defined twice - once as `@Column({ default: 1 })` and again via `@VersionColumn()`.

```typescript
@Column({ default: 1 })
version!: number;  // Duplicate

@VersionColumn()
version!: number;  // Original
```

**Impact**: Potential database conflicts or unexpected behavior.

---

### 11. TypedClientBase Has Unused Constructor Parameter

**Location**: `libs/typed-client/src/typed-client.base.ts:16-21`

**Issue**: `TraceService` is injected but never used in the base class.

```typescript
protected constructor(
  private readonly amqpConnection: AmqpConnection,
  private readonly traceService: TraceService,  // Never used
  @Inject(TYPED_CLIENT_MQ_OPTIONS) options: TypedClientMqOptions,
) {
```

---

### 12. Silent Permission Fetch Failures

**Location**: `libs/authentication/src/permission/permission.service.ts:11-15`

**Issue**: Database errors during permission fetch are silently swallowed, returning an empty array.

```typescript
try {
  return await this.permissionRepo.find({ where: { userId } });
} catch {
  return []; // Silent failure - logs nothing
}
```

**Impact**: Permission errors are hidden, making debugging difficult.

---

## Low Severity Issues

### 13. Missing Unit Tests

**Location**: All services in `apps/*/`

**Issue**: No test files exist anywhere in the project (`*.spec.ts`).

**Impact**: No automated verification of business logic.

---

### 14. No Global Exception Filter

**Location**: All services

**Issue**: Services lack global exception filters to standardize error responses.

**Recommendation**: Add a global exception filter that returns consistent error response format.

---

### 15. JWT Expiry Type Inconsistency

**Location**:

- `libs/contracts/src/config/jwt.config.ts:12-13` (number)
- `apps/gateway/src/main.ts` (may expect string like '1h')

**Issue**: Config defines `expiry: number` but JWT libraries often expect string formats.

---

### 16. RabbitMQ Config Type Error

**Location**: `apps/gateway/src/user-client/user-client.module.ts:12-13`

**Issue**: `port` field uses `@IsString()` decorator but port is a number.

```typescript
@IsString()  // WRONG
@IsDefined()
port!: number;  // port is number
```

---

### 17. Constructor Parameter Order in InfrastructureModule

**Location**: `libs/infrastructure/src/infrastructure.module.ts`

**Issue**: The `forMicroserviceAsync` options interface expects a specific order of parameters. TypeScript may not enforce this at compile time, leading to runtime issues if called incorrectly.

---

### 18. ConfigurationService Generic Constraint

**Location**: `libs/infrastructure/src/modules/configuration/configuration.service.ts:19`

**Issue**: Generic constraint uses `(...args: unknown[])` instead of `(...args: never[])` for proper typing.

---

## Summary by Priority

| Priority | Count | Issues |
| -------- | ----- | ------ |
| High     | 5     | #1-5   |
| Medium   | 7     | #6-12  |
| Low      | 6     | #13-18 |

## Recommended Fix Order

1. **Fix #2** (ValidateUserDto) - Security vulnerability
2. **Fix #1** (JWT types) - Type inconsistency
3. **Fix #3** (Phone validator) - Incorrect validation
4. **Fix #4** (PermissionModule in course-service) - Missing auth
5. **Fix #5** (File.size type) - Type mismatch

---

_Document generated: 2026-03-26_
_Review scope: Full codebase review before first deployment_
