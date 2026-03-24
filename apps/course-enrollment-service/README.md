# Course Enrollment Service

## Purpose

Manages the relationship between students and courses. This service acts as a join table capturing which students are enrolled in which courses, providing a foundation for other services like Assignment Service to track student work.

## Architecture

The service follows a simple MVC pattern with NestJS:

- **Controller**: Handles HTTP requests and response mapping
- **Service**: Contains business logic and domain operations
- **Module**: Groups related components and dependencies

The service maintains the enrollment relationship and validates that students have the correct role before enrollment.

## File Structure

```
apps/course-enrollment-service/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── course-enrollment-service.module.ts  # Module definition
│   ├── course-enrollment-service.controller.ts  # HTTP controller
│   └── course-enrollment-service.service.ts    # Business logic
├── test/
│   ├── app.e2e-spec.ts            # E2E tests
│   └── jest-e2e.json              # Jest e2e config
└── tsconfig.app.json              # TypeScript config
```

## Internal Dependencies

- `@app/infrastructure` - Logging, configuration
- `@app/contracts` - Shared interfaces and error codes
- `typeorm` - Database ORM
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation

## Coding Conventions

Follows the global standards defined in root `AGENTS.md`. No module-specific deviations.

## Testing

- Unit tests: Controller and service logic
- E2E tests: API endpoint integration
- Run tests with `yarn test`

## Local Development

```bash
# Start in watch mode
yarn start:dev course-enrollment-service

# Build
yarn build course-enrollment-service
```

## Service Communication

- **Course Service**: Uses course ID as foreign reference. Validates course existence.
- **User Service**: Uses student ID as foreign reference. Validates user has student role.
- **Assignment Service**: Consumes enrollment data to link submissions to students.
