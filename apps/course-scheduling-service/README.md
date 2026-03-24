# Course Scheduling Service

## Purpose

Manages the logistical details of when and where a course meets. This service maintains a clean separation between the course's academic content (handled by Course Service) and its operational schedule.

## Architecture

The service follows a simple MVC pattern with NestJS:

- **Controller**: Handles HTTP requests and response mapping
- **Service**: Contains business logic and domain operations
- **Module**: Groups related components and dependencies

The service acts as a facade that validates schedule data and persists CourseSchedule entities. It communicates with the Course Service to verify course existence.

## File Structure

```
apps/course-scheduling-service/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── course-scheduling-service.module.ts  # Module definition
│   ├── course-scheduling-service.controller.ts  # HTTP controller
│   └── course-scheduling-service.service.ts    # Business logic
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
yarn start:dev course-scheduling-service

# Build
yarn build course-scheduling-service
```

## Service Communication

- **Course Service**: Uses course ID as foreign reference. Validates course existence via Course Service API or message pattern.
- No direct database dependency on Course Service tables.
