# AGENTS.md - LMS Backend NestJS

## AI RULES – DO NOT DEVIATE

1. **NEVER run any shell commands** unless explicitly asked in the current conversation.
2. **Exception**: When you are explicitly asked to **create or modify documentation** (ADRs, AGENTS.md, API.md), you may use the following commands **only** to create the necessary directories and files:
   - `mkdir` – to create parent directories if they don't exist.
   - `touch` – to create new documentation files.
   - `echo` – to write content to files (if needed).
   - **No other commands** (like `git`, `yarn`, `nest`, `npm`, `rm`, `mv`) are allowed, even during documentation tasks.
3. **NEVER modify git history or commit changes** – code generation only.
4. **Only write code files** (`.ts`, `.spec.ts`, etc.) – do not run them.

### No Index Exports

- **DO NOT create `index.ts` files** for barrel exports
- **DO NOT use barrel exports** (`export * from './module'`) in this project
- Always use explicit imports to the specific file (e.g., `import { Foo } from '@app/foo/foo.service'` not `import { Foo } from '@app/foo'`)
- This rule applies to all code writing and documentation tasks

## Documentation Tasks

When you are asked to create or modify any documentation file (ADR, AGENTS.md, README.md, API.md), you **must** first read the file `DOCUMENTATION_STANDARDS.md` in the project root. It contains the exact format, structure, and naming conventions for each document type.

**You may use the allowed filesystem commands (`mkdir -p`, `touch`, `echo`) to create directories and files as needed, but only to produce the documentation structure.** Follow the workflow described in `DOCUMENTATION_STANDARDS.md` to ensure consistency.

### Verification Before Creating New Documentation

Before claiming something is **not documented** and creating new documentation:

1. **Read existing documentation** in the relevant module (README.md, API.md, docs/adr/\*.md)
2. **Search for existing patterns** using grep to find if the concept is already covered
3. **Verify the gap**: Only create new documentation if it truly adds architectural value not already captured

**Common mistakes to avoid**:

- Claiming a pattern is undocumented after code exploration without checking existing docs
- Creating duplicate documentation for concepts already covered elsewhere
- Mixing implementation details (class names, file paths) into ADRs — these belong in README/API

## Project Overview

This is a NestJS monorepo with microservices architecture. The project contains:

- **Apps**: `gateway`, `user-service`, `course-service`
- **Libs**: `audit`, `authentication`, `contracts`, `health`, `infrastructure`, `typed-client`

## Build, Lint, and Test Commands

### Build

```bash
yarn build                    # Build all projects
yarn build course-service    # Build specific app
```

### Development

```bash
yarn start:dev               # Start with watch mode
yarn start:debug            # Start with debug and watch
yarn start:prod             # Start production build
```

### Linting and Formatting

```bash
yarn lint                   # Run ESLint with auto-fix
yarn format                 # Format code with Prettier
```

### Testing

```bash
yarn test                   # Run all tests
yarn test path/to/file.spec.ts  # Run single test file
yarn test:watch            # Run tests in watch mode
yarn test:cov              # Run tests with coverage
yarn test:e2e              # Run e2e tests
```

## Code Style Guidelines

### TypeScript Configuration

- Uses `strict: true` with all strict flags enabled
- TypeScript target: ES2023
- Module resolution: nodenext
- Path aliases:
  - `@app/*` - refers to libs (e.g., `@app/authentication`, `@app/contracts`)
  - `@/*` - refers to apps (e.g., `@/user-service/src/*`)

### Imports

- Use path aliases for all imports from libs and apps
- Group imports: external (NestJS), then internal (@app libs), then relative
- Example:

```typescript
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from '@app/authentication/permission/permission.interface';
import { UserService } from './user.service';
```

### Formatting (Prettier)

- Single quotes (`'`)
- Trailing commas (`all`)
- End of line: `auto`

### Naming Conventions

- **Classes/Types/Interfaces**: `PascalCase` (e.g., `CourseService`, `UserContract`)
- **Functions/Variables**: `camelCase` (e.g., `getUserPermissions`, `userId`)
- **Enums/Constants**: `SCREAMING_SNAKE_CASE` (e.g., `ErrorCode`, `CourseStatus`)
- **Files**: `kebab-case` (e.g., `course-service.service.ts`)
- **Tests**: `{name}.spec.ts`

### ESLint Rules (Strict)

- No explicit `any` allowed
- Explicit function return types required
- No floating promises
- No unsafe member access, assignment, call, or argument
- Unused variables must be prefixed with `_` or removed
- Use `import/no-extraneous-dependencies` to check dependencies

### Type Safety

- Use `exactOptionalPropertyTypes`
- Use `noUncheckedIndexedAccess`
- Use `noPropertyAccessFromIndexSignature`
- Always define return types for functions
- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of type assertions

### Error Handling

- Use `ErrorCode` enum from `@app/contracts/errors/error.codes`
- Use custom error classes extending `BaseError`
- Use try-catch blocks with proper error handling
- Example:

```typescript
try {
  return await this.permissionRepo.find({ where: { userId } });
} catch {
  return [];
}
```

### NestJS Patterns

#### DTOs

- Use `class-validator` decorators (`@IsDefined()`, `@IsString()`, `@IsEmail()`, etc.)
- Use `class-transformer` with `@Transform()` for data mapping
- Example:

```typescript
export class CreateUserDto {
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEnum(IdentityType)
  @Transform(({ value }) => map[String(value).toLowerCase()])
  identityType!: IdentityType;
}
```

#### Entities

- Use TypeORM decorators (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`)
- Use soft deletes with `@DeleteDateColumn`
- Implement contract interfaces from `@app/contracts`
- Example:

```typescript
@Entity('courses')
export class Course implements CourseContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
```

#### Microservices

- Use `@MessagePattern` decorator for message-based communication
- Use `@Payload()` to extract message data
- Example:

```typescript
@Controller()
export class UserController {
  @MessagePattern('user.create')
  createUser(@Payload() createUserDto: CreateUserDto): Promise<UserContract> {
    return this.userService.create(createUserDto);
  }
}
```

#### Modules

- Use `@Module()` decorator
- Explicitly define `imports`, `controllers`, `providers`
- Example:

```typescript
@Module({
  imports: [],
  controllers: [],
  providers: [UserService],
})
export class UserModule {}
```

### Testing Patterns

- Use `describe` blocks with nested `describe` for test organization
- Use `beforeEach` to set up mocks
- Create mock functions with `jest.fn()`
- Use `jest.Mocked<T>` for typed mocks
- Example pattern:

```typescript
describe('PermissionService', () => {
  let permissionService: PermissionService;
  let permissionRepo: jest.Mocked<Repository<Permission>>;

  function createMockRepository(): jest.Mocked<Repository<Permission>> {
    return { find: jest.fn() } as unknown as jest.Mocked<
      Repository<Permission>
    >;
  }

  beforeEach(() => {
    permissionRepo = createMockRepository();
    permissionService = new PermissionService(permissionRepo);
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      // test implementation
    });
  });
});
```

### Database

- Use TypeORM with PostgreSQL
- Use snake_case for column names
- Use appropriate column types (`smallint`, `int`, `varchar`, etc.)
- Include audit columns: `created_at`, `updated_at`, `deleted_at`, `version`

### Dependencies

- Use `@app/contracts` for shared interfaces and DTOs between services
- Use `@app/authentication` for auth and permission handling
- Use `@app/infrastructure` for logging, configuration, event bus
