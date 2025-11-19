# CLI Guide

All commands are exposed under `kb ai-tests <command>`. The implementation for each handler lives in `packages/plugin-cli/src/cli/commands/<name>/run.ts` and calls the corresponding application use-case. Every command accepts `--json`, `--debug`, `--profile`, and `--dry-run` for consistency.

## Command reference

| Command | Flags | Description |
| ------- | ----- | ----------- |
| `ai-tests:init` | `--tests-dir <path>` | Ensures the tests directory exists, writes a README, and snapshots config into `metadata.json`. |
| `ai-tests:plan` | `--sources <glob,glob>` | Scans source files, detects coverage gaps, and writes `ai-tests.plan.json`. |
| `ai-tests:generate` | `--targets <path,path>`, `--strategy <mode>` | Reads the latest plan, fetches KB Mind context, and generates tests or suggestion files. |
| `ai-tests:run` | *none besides shared flags* | Executes the configured runner (`shell` or `mock`) and persists `ai-tests.run.json` + logs. |
| `ai-tests:repair` | `--max-attempts <n>` | Iterates over failing tests, produces suggestions, optionally reruns suites, and appends `ai-tests.iterations.json`. |
| `ai-tests:audit` | `--include-plan`, `--include-runs` | Builds a markdown report combining plan, run, and iteration insights. |

### init

```bash
kb ai-tests init --tests-dir tests --json
```

Outputs:

```json
{
  "testsDir": "tests",
  "configUpdated": false,
  "created": ["tests", "tests/README.md"],
  "skipped": [],
  "summary": "Tests dir: tests · Config update: managed by kb CLI · Created: 2 · Skipped: 0"
}
```

### plan

- Reads `aiTests.sources` from `kb.config.json` by default.
- `--sources` accepts a comma-separated list that overrides config for one run.
- Writes `.kb/artifacts/ai-tests/ai-tests.plan.json` unless `--dry-run` is set.

### generate

- Targets default to uncovered entries from the latest plan.
- Strategies:
  - `suggest-only` – never touch the filesystem; writes suggestions into `.kb/artifacts/ai-tests/suggestions/`.
  - `write-and-run` / `llm-generate` – write files if they do not already exist.
- Returns generated payloads and a list of artifacts (iterations file + created files or suggestion paths).

### run

- Delegates to the `TestRunnerAdapter`.
- `--dry-run` short-circuits to a synthetic “success” result, useful for CI smoke checks.
- Persists JSON output and the raw log (timestamped file in `.kb/artifacts/ai-tests/logs/`).

### repair

- Requires a prior `ai-tests:run` artifact; errors if missing.
- Limits attempts via config or `--max-attempts`.
- Stores suggestion files even when running in dry-run mode, so developers can inspect diffs.
- Iteration status is `fixed`, `needs-review`, or `exhausted` depending on rerun outcomes.

### audit

- Aggregates plan availability, last run status, iteration count, and an overall score (0–100).
- Writes `ai-tests.audit.md` unless `--dry-run` is passed.

## Writing new CLI surfaces

1. Create `src/cli/commands/<command>/run.ts` exporting `run<CommandName>`.
2. Inject services via `resolveContext` from `src/cli/context.ts`.
3. Update `src/manifest.v2.ts` (CLI + permissions) and `tsup.config.ts` entries.
4. Document the command here and add tests in `packages/plugin-cli/tests`.

Commands must only orchestrate IO/flag parsing—business rules stay in the application layer so workflows and REST handlers can reuse them.
