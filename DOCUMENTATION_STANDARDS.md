## 1. Meta-Document: `DOCUMENTATION_STANDARDS.md`

````markdown
# Documentation Standards

This document defines the structure, format, and naming conventions for all documentation files in this project. It is
intended for both human contributors and AI assistants.

## 1. Document Types

We maintain four main types of documentation:

| Type             | Location             | Purpose                                    |
| ---------------- | -------------------- | ------------------------------------------ |
| ADR              | `docs/adr/`          | Architecture Decision Records              |
| Root AGENTS.md   | `/AGENTS.md`         | Global AI behavior and project overview    |
| Module AGENTS.md | `<module>/AGENTS.md` | Internal development guidelines per module |
| Module API.md    | `<module>/API.md`    | Public API contract for external usage     |

## 2. General Rules (All Documents)

- **Language**: English (for consistency with code and tooling).
- **Format**: Markdown (`.md`).
- **Line width**: Wrap at 80–100 characters for readability.
- **Headings**: Use ATX style (`#`, `##`, `###`). Do not skip levels.
- **Code blocks**: Use triple backticks with language specification.
- **File names**: `kebab-case.md` (except `AGENTS.md` which is capitalized).

## 3. ADR Format (`docs/adr/NNNN-title.md`)

Each ADR must contain the following sections:

```markdown
# ADR NNNN: <Short title>

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

What is the problem? Why is this decision needed?

## Decision

What we decided and why.

## Consequences

What becomes easier or harder after this decision.

## Compliance

How to enforce this decision (e.g., linting rules, code review, AI instructions).
```
````

- File naming: `0001-title.md`, with leading zeros to keep order.

## 4. Root `AGENTS.md`

This file is the primary entry point for AI assistants. It must contain:

- **Project overview** (tech stack, monorepo structure).
- **AI behavior constraints** (no command execution, no git, etc.).
- **How to load knowledge** (point to ADRs, module-level docs).
- **Common tasks** (optional, but keep concise).

See the existing root `AGENTS.md` for reference; updates must preserve the core sections.

## 5. Module-Level `AGENTS.md` (for apps and libs)

Each module that contains code may have an `AGENTS.md` file in its root (e.g., `apps/course-service/AGENTS.md`). This
file is for **internal development only**.

Required sections:

```markdown
# <Module Name> – Internal Development Guide

## File Structure

- Describe the folder layout and purpose of each subdirectory.

## Internal Dependencies

- Which shared libraries are allowed (e.g., `@app/infrastructure`).
- Which external libraries are used.

## Coding Conventions

- Module-specific naming, patterns, or TypeScript rules.

## Testing

- Coverage expectations, testing patterns, mock strategies.

## Exports

- What is exposed to the outside world (via `index.ts` or `public-api.ts`). If index exports are forbidden, state that
  explicitly.
```

## 6. Module-Level `API.md` (for apps and libs)

This file documents the **public interface** of the module. It should be read by any developer (or AI) that wants to use
this module from another part of the system.

> **Important**: API.md documents what is **exported by the module** (via `exports` array in `@Module()`), NOT what is
> exported in the TypeScript sense. For NestJS modules, only the services/classes that consumers need to use should be
> documented. Internal implementations used only within the module are implementation details and must NOT be exposed.

### What to Include

- Only the services/classes that are actually exported from the module's `exports` array
- Types/interfaces that are necessary for using those exported services (e.g., method parameters, return types)
- Types that consumers need to reference directly (e.g., enums for configuration)

### What to Exclude

- Internal helper classes, dependencies classes (e.g., `*Dependencies` classes)
- Sinks, buffers, loaders, or other internal components not meant for external use
- Internal error classes used only within the module
- Internal types or interfaces not needed by consumers

Required sections:

```markdown
# <Module Name> – Public API

## Purpose

One-sentence summary of what this module provides to consumers.

## Exported Services

List only the services/classes that are exported by the module and available for injection/use.

## Exported Types

List only the types/enums that consumers need to use the exported services.

## Usage Example

Show a minimal example of how to import and use the module's exported services.

## Configuration

If the module requires any configuration (e.g., environment variables, module imports), describe them.

## Error Handling

What errors can be thrown? Use error codes from `@app/contracts/errors`.

## Notes

Any special considerations (e.g., performance, thread safety, versioning).
```

## 7. When to Create/Update Documentation

- **New ADR**: When a significant architectural decision is made.
- **New module**: Create both `AGENTS.md` and `API.md` in the module root.
- **Changes to public API**: Update the module's `API.md`.
- **Changes to internal practices**: Update the module's `AGENTS.md`.
- **Changes to global AI rules**: Update root `AGENTS.md`.

## 8. AI Workflow for Documentation Tasks

When asked to **create or update any documentation**, the AI must:

1. **Read this `DOCUMENTATION_STANDARDS.md`** to understand the expected format.
2. **Locate the target document** based on the type (ADR, root AGENTS, module AGENTS, module API).
3. **Gather context**:
   - For module docs: read the module's source code, its `package.json`, and any existing `AGENTS.md`/`API.md`.
   - For ADRs: review related code and previous ADRs to maintain consistency.
4. **Generate or modify** the document following the section requirements above.
5. **Preserve existing sections** unless explicitly asked to replace.
6. **Output the final document content** with a brief summary of changes.

## 9. Validation Checklist (for Humans and AI)

After writing/updating a document, verify:

- [ ] File name and location match the rules.
- [ ] All required sections are present.
- [ ] Code examples are correct and use proper imports.
- [ ] No internal implementation details leaked in `API.md`.
- [ ] The document is self-contained (references to other docs are optional but encouraged).

````

---

## 2. Integrating the Meta-Document into Root `AGENTS.md`

Add a section in your root `AGENTS.md` that instructs AI to always consult the meta-document when handling documentation tasks. For example:

```markdown
## Documentation Tasks

When you are asked to create or modify any documentation file (ADR, AGENTS.md, API.md), you **must** first read the file `DOCUMENTATION_STANDARDS.md` in the project root. It contains the exact format, structure, and naming conventions for each document type.

Follow the workflow described in that meta-document to ensure consistency.
````

This ensures that every time the AI is asked to work on documentation, it will automatically load the standards.

---

## 3. Example: AI Assigned to Create a Module's Documentation

**User prompt**:

> “Create `AGENTS.md` and `API.md` for the `user-service` app. Follow our documentation standards.”

**AI internal steps** (if following the meta-document):

1. Read `DOCUMENTATION_STANDARDS.md`.
2. Locate `apps/user-service/`.
3. Analyze the source code of `user-service` to understand its structure, public services, and dependencies.
4. Create `apps/user-service/AGENTS.md` with sections:
   - File structure: list folders like `src/controllers/`, `src/services/`, `src/entities/`.
   - Internal dependencies: `@app/infrastructure`, `@app/authentication`, `@app/contracts`.
   - Coding conventions: use of DTOs with class-validator, repository pattern, etc.
   - Testing: must cover all public methods, use `jest`.
   - Exports: state that no `index.ts` exports are allowed; explicit imports only.
5. Create `apps/user-service/API.md` with sections:
   - Purpose: Manage users, profiles, and authentication integration.
   - Provided services: `UserService`, `UserController` (maybe list endpoints), DTOs from `@app/contracts`.
   - Usage example: show how to import `UserService` from `@app/user-service` (if aliased) or from the module.
   - Error handling: uses `UserError` codes from contracts.
6. Output both files with a summary.
