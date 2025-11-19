# Architecture Guide

AI Tests follows a layered architecture to keep CLI/REST/Studio surfaces thin while the core rules live in reusable domain objects.

## Layer stack

| Layer | Responsibilities | Key modules |
| ----- | ---------------- | ----------- |
| `shared/` | Constants such as artifact paths, default config, and kb.config filename. | `shared/constants.ts` |
| `domain/` | Pure entities/value objects (`TestPlan`, `IterationHistory`, `AiTestsConfigModel`, `TestStatus`). Enforces invariants like `maxAttempts` and `needsReview`. | `domain/plan.ts`, `domain/iteration.ts`, `domain/config.ts`, `domain/status.ts` |
| `application/` | Use-cases orchestrating workflows (`initTests`, `planTests`, `generateTests`, `runTests`, `repairTests`, `auditTests`). No filesystem or network code. | `application/use-cases/*.ts` |
| `infra/` | Adapters injected into use-cases: workspace (safe FS writes + dry-runs), test runner (shell + mock), Mind client stub, tests generator stub, logger. | `infra/adapters/*.ts`, `infra/services.ts` |
| `cli/rest/studio` | Request/response glue that parses flags/payloads and calls application services. | `cli/commands/*`, `rest/handlers/status-handler.ts`, `studio/widgets/status-widget.tsx` |
| `workflows/` | KB workflow entry points that call the same application use-cases as the CLI. | `workflows/*.ts` |

## Domain rules worth noting

1. **No silent overwrites** – `workspace.writeGeneratedTests` skips existing files and `TestPlan.classifyGeneration` downgrades conflicting suggestions to `needsReview`.
2. **`maxAttempts` guardrail** – `AiTestsConfigModel.ensureAttemptWithinLimit` throws when the repair loop would exceed the configured attempts.
3. **Iteration states** – `IterationRecordBuilder` ensures every iteration captures `startedAt`, `completedAt`, `status`, and optional notes/fixes.
4. **Runner modes** – the configuration layer normalises runner definitions into `{ mode, command, env, cwd }` regardless of how they are specified in `kb.config.json`.
5. **Needs-review flagging** – generation and repair results automatically append warnings when heuristics detect low confidence (existing tests, explicit warnings, repair flow).

## Infrastructure adapters

- **Workspace adapter** – wraps `fs/promises`, writes JSON artifacts under `.kb/artifacts/ai-tests`, keeps dry-run and suggestion helpers, and ensures directories exist before writes.
- **TestRunnerAdapter** – executes shell commands via `child_process.exec` or returns predictable fixtures in `mock` mode for CI.
- **MindTestClient** – stub returning deterministic context so tests don’t rely on network access.
- **TestsGenerator** – mock generator that produces deterministic Vitest snippets and marks repairs as `needsReview`.
- **Logger** – thin wrapper around `console.log`, but the interface lets us swap to structured logging later.

All adapters are wired together in `infra/services.ts`. CLI commands and workflows call `createCliServices()` by default; tests inject their own in-memory services.

## Manifest integration

`src/manifest.v2.ts` gathers:

- CLI command declarations (IDs, descriptions, handlers, flags).
- Workflow handlers for plan/generate/run/repair.
- Artifact metadata (IDs aligned with the contracts package).
- REST status route plus FS/NET permissions.
- Studio widget metadata + mock data source.

Touching any surface requires updating the manifest and the contracts manifest (`packages/contracts/src/contract.ts`) to keep guarantees in sync.

## Testing strategy

| Scope | Example |
| ----- | ------- |
| Contracts | `packages/contracts/tests/ai-tests.schema.test.ts` validates schemas against happy/sad payloads. |
| Domain | `packages/plugin-cli/tests/domain/config.spec.ts` exercises `AiTestsConfigModel` and `IterationHistory`. |
| Application | `packages/plugin-cli/tests/application/ai-tests-flow.spec.ts` runs an in-memory plan→generate→run→repair lifecycle. |
| REST | `packages/plugin-cli/tests/rest/status-handler.spec.ts` smoke tests the `/status` handler. |

Use `pnpm sandbox:*` scripts for manual verification of compiled artifacts.

## Extending the system

- Create new domain objects before touching infrastructure whenever you add cross-cutting rules.
- Keep adapters stateless and injectable; declare new permissions in both manifests.
- Record deviations or major decisions in `docs/adr/`.
- When adding artifacts/commands/workflows, update both `packages/contracts` and `manifest.v2.ts`, then cover them with Vitest specs.


