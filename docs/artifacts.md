# Artifacts Reference

AI Tests writes everything under `.kb/artifacts/ai-tests/`. This document summarises each artifact, its schema, and which command produces it.

| File | Schema | Produced by | Notes |
| ---- | ------ | ----------- | ----- |
| `ai-tests.plan.json` | `AiTestsPlanArtifactSchema` (`packages/contracts`) | `ai-tests:plan`, `ai-tests:generate` (when targets change) | Contains `targets[]`, `priority`, coverage heuristics, and user-facing `summary`. |
| `ai-tests.run.json` | `AiTestsRunArtifactSchema` | `ai-tests:run`, `ai-tests:repair` (when rerunning) | Aggregates suite status, per-file stats, runner metadata, and logs references. |
| `ai-tests.iterations.json` | `AiTestsIterationsArtifactSchema` | `ai-tests:generate`, `ai-tests:repair` | Chronological log of generation/repair attempts. Each record captures generated blocks, failed files, rerun result, notes, and status (`pending`, `fixed`, `needs-review`, `exhausted`). |
| `metadata.json` | `AiTestsMetadataArtifactSchema` | `ai-tests:init`, `setup handler` | Snapshot of config/runner/strategy + plugin version; useful for audits/drift detection. |
| `ai-tests.audit.md` | Markdown (no schema) | `ai-tests:audit` | Human-readable report combining plan availability, last run status, iteration count, and score. |
| `logs/run-*.log` | Text | `ai-tests:run`, `ai-tests:repair` | Raw stdout/stderr captured for debugging. Path is referenced from `ai-tests.run.json`. |

## Sample payloads

### Plan

```json
{
  "generatedAt": "2025-01-10T08:00:00.000Z",
  "sources": ["src/**/*.ts"],
  "targets": [
    {
      "path": "src/core/order-service.ts",
      "displayName": "core/order-service.ts",
      "testType": "unit",
      "priority": "critical",
      "coverageStatus": "not_covered",
      "tags": ["needs-tests"],
      "notes": ["No sibling spec detected"]
    }
  ],
  "summary": {
    "totalTargets": 1,
    "notCovered": 1,
    "partial": 0,
    "ok": 0
  }
}
```

### Run

```json
{
  "status": "failed",
  "startedAt": "2025-01-10T08:05:00.000Z",
  "finishedAt": "2025-01-10T08:05:45.000Z",
  "durationMs": 45000,
  "summary": { "passed": 10, "failed": 2, "skipped": 0 },
  "files": [
    {
      "filePath": "tests/core/order-service.spec.ts",
      "passed": 5,
      "failed": 2,
      "skipped": 0,
      "errors": [{ "message": "expected 200 to equal 500" }]
    }
  ],
  "runner": { "mode": "shell", "command": "pnpm test", "exitCode": 1 }
}
```

### Iteration record

```json
{
  "attemptIndex": 1,
  "startedAt": "2025-01-10T08:06:00.000Z",
  "completedAt": "2025-01-10T08:07:10.000Z",
  "generated": [
    {
      "outputPath": "tests/core/order-service.repair.spec.ts",
      "needsReview": true,
      "blocks": [{ "title": "repairs failing assertion", "code": "..." }]
    }
  ],
  "failedFiles": ["tests/core/order-service.spec.ts"],
  "fixes": [
    { "filePath": "tests/core/order-service.spec.ts", "suggestionPath": ".kb/.../order-service.patch.ts" }
  ],
  "run": { "status": "success", "...": "..." },
  "status": "fixed",
  "notes": ["Runner reported success."]
}
```

Refer to `packages/contracts/src/schema/artifacts.schema.ts` for authoritative Zod definitions. Whenever you change payload shapes, bump the contracts version and update both manifests.

