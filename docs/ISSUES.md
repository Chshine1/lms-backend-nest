# Code Review Findings

This document records all issues identified during the pre-launch code review of the LMS Backend NestJS monorepo.

## Table of Contents

- [Medium Severity Issues](#medium-severity-issues)
- [Low Severity Issues](#low-severity-issues)

---

## Medium Severity Issues

### 1. FileService.createFile Signature Mismatch

**Location**: `apps/file-service/src/file.service.ts:34-37`

**Issue**: Method expects `file: Express.Multer.File` as a required parameter, but the typed-client doesn't pass this parameter.

**Impact**: File upload via typed-client will fail.

---

### 2. TenantId Missing in CreateUserDto

**Location**: `libs/contracts/src/user/dto/create-user.dto.ts`

**Issue**: `CreateUserDto` lacks a `tenantId` field, but `UserContract` requires it. The service creates users without setting `tenantId`.

**Impact**: Data integrity issues; users created without tenant association.

---

### 3. Optional Fields in CourseVideo Marked Required

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

### 4. Duplicate Version Column in CourseMaterial

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

### 5. TypedClientBase Has Unused Constructor Parameter

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

### 6. Silent Permission Fetch Failures

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

### 1. Missing Unit Tests

**Location**: All services in `apps/*/`

**Issue**: No test files exist anywhere in the project (`*.spec.ts`).

**Impact**: No automated verification of business logic.

---

### 2. No Global Exception Filter

**Location**: All services

**Issue**: Services lack global exception filters to standardize error responses.

**Recommendation**: Add a global exception filter that returns consistent error response format.

---

### 3. JWT Expiry Type Inconsistency

**Location**:

- `libs/contracts/src/config/jwt.config.ts:12-13` (number)
- `apps/gateway/src/main.ts` (may expect string like '1h')

**Issue**: Config defines `expiry: number` but JWT libraries often expect string formats.

---

### 4. Constructor Parameter Order in InfrastructureModule

**Location**: `libs/infrastructure/src/infrastructure.module.ts`

**Issue**: The `forMicroserviceAsync` options interface expects a specific order of parameters. TypeScript may not enforce this at compile time, leading to runtime issues if called incorrectly.

---

### 5. ConfigurationService Generic Constraint

**Location**: `libs/infrastructure/src/modules/configuration/configuration.service.ts:19`

**Issue**: Generic constraint uses `(...args: unknown[])` instead of `(...args: never[])` for proper typing.

---

## Summary by Priority

| Priority | Count | Issues |
| -------- |-------|--------|
| Medium   | 6     | #1-6   |
| Low      | 5     | #1-5   |

---

_Document generated: 2026-03-26_
_Review scope: Full codebase review before first deployment_
