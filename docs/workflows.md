# Workflows & Repair Loop

The plugin ships four workflow handlers (`src/workflows/*.ts`) that call the same application use-cases as the CLI. This document explains the artefact flow, emitted events, and guardrails enforced by the repair loop.

## End-to-end flow

```
plan → generate → run → repair
          ↘───────────────↗
```

1. **Plan (`ai-tests.workflow.plan`)**
   - Calls `planTests`.
   - Emits `ai-tests.plan.json`.
   - Event: `ai-tests.plan.completed` with plan summary.
2. **Generate (`ai-tests.workflow.generate`)**
   - Calls `generateTests`.
   - Consumes the latest plan.
   - Updates `ai-tests.iterations.json` with a `pending` iteration (even for suggestion-only runs).
3. **Run (`ai-tests.workflow.run`)**
   - Calls `runTests`.
   - Persists `ai-tests.run.json` and `logs/run-*.log`.
   - Event: `ai-tests.run.completed` with runner result payload.
4. **Repair (`ai-tests.workflow.repair`)**
   - Calls `repairTests`.
   - Consumes `ai-tests.run.json` + `ai-tests.iterations.json`.
   - Produces new iteration records and optionally a fresh `ai-tests.run.json`.
   - Event: `ai-tests.repair.attempt` with the latest iteration snapshot.

## Repair loop rules

| Rule | Implementation detail |
| ---- | --------------------- |
| `maxAttempts` guard | `AiTestsConfigModel.ensureAttemptWithinLimit` throws if the requested attempt index ≥ configured limit. |
| Status transitions | `IterationRecordBuilder` sets status to `fixed`, `needs-review`, or `exhausted`. `needs-review` is used when the rerun still fails but attempts remain. |
| Suggestions vs file writes | Repairs always produce suggestion files under `.kb/artifacts/ai-tests/suggestions/` so developers can vet patches before applying. |
| Runner reuse | Repairs reuse the same runner adapter as `ai-tests:run`. In mock mode, the adapter returns deterministic output for CI. |
| Metadata | Each iteration stores `failedFiles`, generated blocks, fix pointers (`filePath` + `suggestionPath`), and rerun result to enable auditing. |

## Extending workflows

- **New steps**: add them to both `src/workflows/*.ts` and `packages/contracts/src/contract.ts` so contracts stay aligned.
- **Events**: if a step needs additional telemetry, add `events` in the contracts manifest and emit the same payload from the workflow handler.
- **Permissions**: keep workflow handlers side-effect free—they should rely on application services, which already enforce safe filesystem operations.

Need a visual? The Studio widget + REST status endpoint leverage the same artifacts documented in [`docs/artifacts.md`](./artifacts.md), so you can wire dashboards without duplicating logic.

