# KB Labs AI Tests – Overview

AI Tests helps KB teams keep automated test coverage healthy by combining KB Mind context, deterministic runners, and repair loops. The plugin exposes CLI commands, workflows, REST hooks, and Studio widgets that are backed by a contracts package documenting each artifact.

## Goals

- **Visibility** – produce plan/run/audit artifacts that downstream systems can ingest.
- **Safety** – prevent silent overwrites, mark low-confidence generations as `needsReview`, and respect `maxAttempts`.
- **Automation** – allow CI/CD pipelines to drive the same lifecycle that developers trigger locally (`plan → generate → run → repair → audit`).

## Surfaces

| Surface | Description |
| ------- | ----------- |
| CLI | Six commands (`init`, `plan`, `generate`, `run`, `repair`, `audit`) with JSON output for scripting. |
| Workflows | Reusable KB workflows that call the same application use-cases as the CLI. |
| REST | A lightweight `/status` endpoint for dashboards or Studio widgets. |
| Studio | A status widget summarising pending targets, last run status, and iteration count. |

## Public artifacts

The contracts package defines the artifacts exported by the plugin:

- `ai-tests.plan.json`
- `ai-tests.run.json`
- `ai-tests.iterations.json`
- `metadata.json`
- `ai-tests.audit.md`
- `logs/run-*.log`

Each artifact has an associated Zod schema and is referenced by both the contracts manifest and `manifest.v2.ts`. See [`docs/artifacts.md`](./artifacts.md) for the field breakdown.

## Typical lifecycle

1. **Init** – scaffold `tests/` and capture a config snapshot in `metadata.json`.
2. **Plan** – glob sources, flag modules/files without test partners, and prioritise them.
3. **Generate** – fetch Mind context and produce tests or suggestions; skip overwriting existing files.
4. **Run** – execute the configured runner (`pnpm test`, `vitest`, `mock`) and persist logs/results.
5. **Repair** – iterate with LLM patches, respect `maxAttempts`, and append iteration history.
6. **Audit** – summarise coverage deltas, run status, and iteration stats for leadership or CI.

Refer to [`docs/workflows.md`](./workflows.md) for the detailed event flow and invariants enforced at each step.

