# Project Testing Standards

This document outlines a consistent, maintainable, and reliable approach to writing unit tests for JavaScript/TypeScript projects using Jest. Following these guidelines ensures that tests are easy to read, modify, and trust—even without a dedicated QA team.

## 1. Test Structure: AAA (Arrange–Act–Assert)

Every test should clearly separate three phases:

- **Arrange**: Set up mocks, test data, and the object under test.
- **Act**: Invoke the method being tested.
- **Assert**: Verify the results (outputs, calls, errors).

Example:
```typescript
it('should route to trueSink when predicate returns true', async () => {
  // Arrange
  predicate.mockReturnValue(true);
  const conditionalSink = createConditionalSink();

  // Act
  await conditionalSink.emit(testEntry);

  // Assert
  expect(predicate).toHaveBeenCalledWith(testEntry);
  expect(trueSink.emit).toHaveBeenCalledWith(testEntry);
  expect(falseSink.emit).not.toHaveBeenCalled();
});
```

## 2. Naming Conventions

### 2.1 `describe` Blocks
Use outer `describe` blocks to name the **condition** or **scenario**. Inner `describe` blocks can further group related behaviors.

```typescript
describe('ConditionalSink', () => {
  describe('emit', () => {
    describe('when predicate returns true', () => {
      it('should call trueSink.emit', async () => { ... });
      it('should wrap trueSink errors in LoggerSinkError', async () => { ... });
    });

    describe('when predicate returns false', () => {
      it('should call falseSink.emit', async () => { ... });
      it('should wrap falseSink errors in LoggerSinkError', async () => { ... });
    });
  });
});
```

### 2.2 `it` Blocks
Use the template: `it('should [expected behavior] when [condition]')`.  
If the condition is already described by a parent `describe`, you can shorten it: `it('should [expected behavior]')`.

## 3. Setup and Teardown

- Use `beforeEach` to reset all mocks and create fresh instances **before every test**. This guarantees test isolation.
- Avoid sharing mutable state between tests.

```typescript
beforeEach(() => {
  trueSink = { id: 'true-sink', emit: jest.fn().mockResolvedValue(undefined) };
  falseSink = { id: 'false-sink', emit: jest.fn().mockResolvedValue(undefined) };
  predicate = jest.fn();
  testEntry = { level: LogLevel.INFO, message: 'test', timestamp: new Date(), serviceName: 'test' };
});
```

## 4. Reducing Duplication

### 4.1 Factory Functions
Create helper functions to build the object under test with sensible defaults, while allowing overrides.

```typescript
function createConditionalSink(predicateOverride?: jest.Mock) {
  const finalPredicate = predicateOverride ?? predicate;
  return new ConditionalSink('conditional-1', finalPredicate, trueSink, falseSink);
}
```

### 4.2 Parameterized Tests with `test.each`
When multiple tests share the same structure but vary in input/output, use `test.each` to generate them.

```typescript
describe.each([
  { predicateReturn: true, expectedSink: 'trueSink', errorMsg: 'true sink error' },
  { predicateReturn: false, expectedSink: 'falseSink', errorMsg: 'false sink error' }
])('when predicate returns $predicateReturn', ({ predicateReturn, expectedSink, errorMsg }) => {
  it(`should wrap ${expectedSink} error in LoggerSinkError`, async () => {
    predicate.mockReturnValue(predicateReturn);
    const sink = predicateReturn ? trueSink : falseSink;
    const originalError = new Error(errorMsg);
    sink.emit.mockRejectedValue(originalError);
    const conditionalSink = createConditionalSink();

    const error = await expect(conditionalSink.emit(testEntry)).rejects.toThrow(LoggerSinkError);
    expect(error.cause).toBe(originalError);
  });
});
```

### 4.3 Builder Pattern for Complex Test Data
When an object has many fields, use a builder to create variations without repeating the full construction.

```typescript
class LogEntryBuilder {
  private entry: LogEntry = {
    level: LogLevel.INFO,
    message: 'default message',
    timestamp: new Date(),
    serviceName: 'defaultService'
  };

  withLevel(level: LogLevel): this { this.entry.level = level; return this; }
  withMessage(message: string): this { this.entry.message = message; return this; }
  // ... other fields

  build(): LogEntry { return this.entry; }
}

// Usage
const testEntry = new LogEntryBuilder().withMessage('custom').build();
```

## 5. Testing Errors

### 5.1 Use `rejects` Instead of `try/catch`
- `await expect(promise).rejects` **does not execute the function twice**. It captures the rejection of the same promise.
- If the promise resolves instead of rejects, the test automatically fails.

### 5.2 Performing Multiple Assertions on an Error
Capture the error object and assert on it directly.

```typescript
it('should wrap error with additional context', async () => {
  // Arrange
  const originalError = new Error('fail');
  primarySink.emit.mockRejectedValue(originalError);

  // Act & Assert
  const error = await expect(failoverSink.emit(testEntry)).rejects.toThrow(LoggerSinkError);

  // Multiple assertions
  expect(error.message).toBe('Logging pipeline breaks due to sink errors');
  expect(error.context.sinkErrorStack).toHaveLength(1);
  expect(error.context.sinkErrorStack[0]).toMatchObject({
    type: 'failover',
    id: 'failover-1',
    details: { allFailed: true }
  });
  expect(primarySink.emit).toHaveBeenCalledWith(testEntry);
});
```

### 5.3 Partial Matching with `toMatchObject`
Use `toMatchObject` to check only the relevant parts of a complex error object.

## 6. Assertions

- **Avoid hard‑coded literals** that appear in multiple places. Define constants at the top of the file or import them from the implementation (if exported).
- **Use variables to convey intent**: `const expectedErrorMessage = 'Logging pipeline breaks due to sink errors';`
- **Leverage Jest’s matchers**: `toHaveBeenCalledWith`, `toMatchObject`, `toHaveLength`, `toBeInstanceOf`.

## 7. Test Doubles (Mocks)

- Create **factory functions** for your mocks to ensure consistency across tests.
- Reset all mocks in `beforeEach` (Jest’s `jest.clearAllMocks()` or manual reassignments).

```typescript
function createMockSink(id: string): jest.Mocked<Sink> {
  return {
    id,
    emit: jest.fn().mockResolvedValue(undefined),
  };
}

// In beforeEach
trueSink = createMockSink('true-sink-1');
falseSink = createMockSink('false-sink-1');
```

## 8. Test Independence

- Each test should be able to run alone and in any order.
- Do not share variables that are mutated between tests (always re‑create in `beforeEach`).
- Avoid using `afterAll` to clean up state that could affect subsequent tests.

## 9. Documentation and Review

### 9.1 Test Case Inventory
Maintain a Markdown file (`TESTCASES.md`) listing all scenarios, conditions, and expected outcomes. This serves as a quick reference for reviewers and helps track coverage.

| Module / Class  | Method | Scenario            | Condition                             | Expected Result        |
|-----------------|--------|---------------------|---------------------------------------|------------------------|
| ConditionalSink | emit   | Route to trueSink   | predicate returns true                | trueSink.emit called   |
| ConditionalSink | emit   | Wrap trueSink error | predicate true, trueSink.emit rejects | LoggerSinkError thrown |

### 9.2 Code Review Checklist
When reviewing test code, check:

- [ ] Does each test follow AAA?
- [ ] Are test names descriptive?
- [ ] Is there any duplication that could be extracted?
- [ ] Are mocks properly reset?
- [ ] Do error tests fail if no error is thrown? (using `rejects` guarantees this)
- [ ] Are assertions free of hard‑coded magic values?
- [ ] Is the test independent and repeatable?
