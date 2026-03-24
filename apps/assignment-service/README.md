# Assignment Service

## Purpose

Manages the lifecycle of student assignment submissions. This service handles the creation of submissions, the submission process (draft to submitted), and teacher reviews including grading and feedback.

## Architecture

The service follows a layered architecture:

- **Controller**: Handles HTTP requests and response mapping
- **Service**: Contains business logic and domain operations
- **Module**: Groups related components and dependencies

The service enforces submission state transitions and business invariants related to one active submission per assignment per student.

## File Structure

```
apps/assignment-service/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── assignment-service.module.ts  # Module definition
│   ├── assignment-service.controller.ts  # HTTP controller
│   └── assignment-service.service.ts    # Business logic
├── test/
│   ├── app.e2e-spec.ts            # E2E tests
│   └── jest-e2e.json               # Jest e2e config
└── tsconfig.app.json               # TypeScript config
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
yarn start:dev assignment-service

# Build
yarn build assignment-service
```

## Service Communication

- **Course Service**: Uses assignment ID as foreign reference
- **Enrollment Service**: Uses enrollment ID as foreign reference, validates student enrollment
- **User Service**: Validates teacher role for reviews
- **File Service**: Manages file references (external)
