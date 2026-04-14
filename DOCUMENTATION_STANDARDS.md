# Part 1: Domain Model Template (English)

This template should be used as the structural blueprint. Replace all content within `[Square Brackets]` with service‑specific information.

## Domain Model

### 1. Aggregates and Entities

#### 1.1 [AggregateName] Aggregate

**Core Responsibility**: [Concise statement of what this aggregate manages and, importantly, what it does **not** manage. Define its consistency boundary.]

| Member Type        | Member Name         | [Database] Type | Description / Domain Behavior                                                                                                                                                           | Domain Constraints / Rules                                             |
| :----------------- | :------------------ | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **Aggregate Root** | **[AggregateName]** | -               | [High-level description and PRD mapping reference.]                                                                                                                                     | -                                                                      |
| Field              | `[fieldName]`       | `[DB_TYPE]`     | [Description of the field and its domain meaning. Reference PRD mapping if applicable.]                                                                                                 | [`PRIMARY KEY` / `NOT NULL` / `UNIQUE` / `FOREIGN KEY` / Immutability] |
| Field              | `[valueObjectField]`| `[DB_TYPE]`     | **Modeled as `[ValueObjectName]` value object in the domain layer.** [Description.]                                                                                                     | [Constraints]                                                          |
| **Entity Method**  | `[methodName]`      | -               | [Description of the domain behavior. Explain side effects like state changes or validation. Reference PRD mapping.]                                                                     | [Throws `[SpecificDomainException]` / Publishes `[DomainEvent]`]       |

---

#### 1.2 [RelationshipEntityName] (Relationship Entity)

**Core Responsibility**: Persists the relationship between [Entity A] and [Entity B]. **Business rule validation is performed by `[DomainServiceName]`, not inside this entity.**

| Member Type | Member Name           | [Database] Type | Description                                                                         | Domain Constraints / Rules                                                         |
| :---------- | :-------------------- | :-------------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| Entity      | **[RelationshipName]**| -               | [Description of the relationship.]                                                   | [High-level rule, e.g., Foreign keys ensure referential integrity.]                |
| Field       | `[sourceId]`          | `[DB_TYPE]`     | References `[SourceEntity].id`.                                                      | `FOREIGN KEY ([sourceId]) REFERENCES [SourceEntity](id)`, part of composite `PK`   |
| Field       | `[targetId]`          | `[DB_TYPE]`     | References `[TargetEntity].id`.                                                      | `FOREIGN KEY ([targetId]) REFERENCES [TargetEntity](id)`, part of composite `PK`   |
| Field       | `[metadataField]`     | `[DB_TYPE]`     | [e.g., assignedBy, linkedAt].                                                        | [Constraints]                                                                      |

---

### 2. Value Objects (Domain Primitives)

These are immutable types that encapsulate validation and behavior for core concepts.

| Value Object     | Internal Representation | Invariants / Validation                                                                                             | Behavior         |
| :--------------- | :---------------------- | :------------------------------------------------------------------------------------------------------------------ | :--------------- |
| `[ValueObjectName]` | `[PrimitiveType]`    | [List specific validation rules (format, length, regex). Normalization rules.] (PRD Mapping: [Reference])           | `[methodName]()` |

---

### 3. Application Layer (Orchestration)

**Application Services** coordinate use cases. They own the transaction boundary, convert DTOs to domain objects, and delegate business logic to aggregates and domain services.

| Application Service              | Method                     | Input                                                 | Output    | Dependencies / Notes                                                                                                                                                               |
| :------------------------------- | :------------------------- | :---------------------------------------------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[ServiceName]ApplicationService** | `[methodName]`          | `[param1]`, `[param2]`                                | `[ReturnDto]` | Uses `[Repository]`, `[DomainService]`. Calls `[Aggregate].[method]()`. Publishes `[DomainEvent]`. (PRD Mapping: [Reference]) |

---

### 4. Domain Services (Encapsulated Business Rules)

These services contain logic that naturally spans multiple aggregates or requires external policy checks.

| Domain Service                  | Method            | Responsibility                                                                                                                                                                                                                                 | Dependencies                                                       |
| :------------------------------ | :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **[ServiceName]DomainService**  | `[methodName]`    | [Detailed explanation of the business rule enforced. Describe the checks performed and the outcome.]                                                                                                                                           | `[Repository]`, `[ExternalServiceInterface]`.                       |

**`[ServiceName].[methodName]()` Implementation Strategy**:
```[language]
// Optional: Pseudo-code or flowchart describing complex logic (e.g., Authorization, State Machine transitions).
```

---

### 5. Domain Events

| Event Name                     | Payload Data                                | Triggering Point                                                                                                  |
| :----------------------------- | :------------------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| **[EventName]**                | `[propertyName]`, `[propertyName]`          | [Exact location: e.g., `[Aggregate].[method]()` or `[ApplicationService].[method]` after persistence.] (PRD Mapping: [Reference]) |

---

### 6. Key Business Rules & Invariants

| Rule ID   | Description                                                     | Enforcement Location                                                                                      |
| :-------- | :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **BR-01** | [Concise statement of the business rule.]                       | [Where is this rule checked? Aggregate method, Domain Service, or Database Constraint?]                   |

---

### 7. Repository Interfaces (Conceptual)

Defined in the domain layer; implemented in infrastructure.

```typescript
interface [AggregateName]Repository {
  save([aggregate]: [AggregateName]): Promise<void>;
  findById(id: [IdType]): Promise<[AggregateName] | null>;
  // Additional query methods specific to domain invariants
}

interface [AnotherAggregate]Repository {
  // ...
}
```

---

### 8. Microservice Integration Note

- **[External Dependency/Aggregate]** reside in a separate `[ServiceName]`.
- This service publishes `[EventName]` events to a message broker.
- `[OtherService]` subscribes to these events and updates its local read model to enforce access without runtime RPC calls.


---

# Part 2: DDD Specification & Style Guide for AI Generation

When instructing the AI to fill out the template above, provide these **strict guidelines** to ensure consistency with the original document's quality.

### 1. Structural & Formatting Rules
- **Table Format**: **Must** use Markdown tables exactly as shown in the template. Do not use bullet points for field definitions.
- **Database Column**: The third column header must be the specific database technology used by the microservice (e.g., `PostgreSQL Type`, `MongoDB Collection`, `DynamoDB Attribute`).
- **PRD Mapping**: Every major element (Fields, Methods, Services) **must** include a `(PRD Mapping: [Section/Requirement])` note in its description to ensure traceability.
- **Naming Convention**: Member names must be `camelCase`. Aggregate/Entity names must be `PascalCase`.

### 2. Aggregate & Entity Definition Guidelines
- **Core Responsibility**: The first paragraph under an Aggregate heading **must** define both what it *does* and what it *explicitly does not do* (boundary definition).
- **Member Type Column**: Use only the following exact values: `Aggregate Root`, `Field`, `Entity Method`, `Entity`.
- **Entity Methods**: Only include methods that change the internal state of the Aggregate or enforce a business invariant. **Do not include simple getters/setters.**
- **Relationship Entities**: For join tables (Many-to-Many), explicitly state: *"No business rule validation is performed inside this entity."* This clarifies the thin, persistence-focused nature of these objects.

### 3. Value Object Specification
- **Immutability**: Describe all Value Objects as immutable.
- **Behavior Column**: Only list public methods that the Value Object exposes (e.g., `matches(input)`, `equals(other)`). Leave blank if none.

### 4. Application Service Specification
- **Orchestration Only**: Application Services must **not** contain business logic. They should only: Load aggregates -> Call aggregate/domain service methods -> Save aggregates -> Publish events.
- **Input/Output**: Define DTOs implicitly via the Input/Output column. Do not define full DTO classes in this document.

### 5. Authorization & Permission Tags (If Applicable)
- **Pattern**: If the system uses permissions, adhere to the pattern: `<resource>:<action>:<scope>`.
- **Scopes**:
    - `:own` - User acts on their own data.
    - `:linked_parent` - User acts on a linked child resource.
    - `:[tenant]` - User acts within tenant boundary.

### 6. Exception & Event Naming
- **Exceptions**: Use explicit names in the constraints column, e.g., `Throws [SpecificCondition]Exception`.
- **Event Naming**: Use **Past Tense** for events that have happened (e.g., `AccountCreated`, `ParentLinkedToStudent`).

### 7. Repository Interface Definition
- **Technology Agnostic**: Define these as conceptual interfaces (TypeScript/Python-like signatures) without implementation details.
- **Return Types**: Always return `Promise<[Type] | null>` to reflect async nature and potential for missing entities.

### 8. Tone and Language
- **Use Active Voice**: "Validates the code" instead of "The code is validated".
- **Precision**: Use specific verbs: `persists`, `encapsulates`, `delegates`, `transitions`.