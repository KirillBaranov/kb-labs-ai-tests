# KB Labs AI Tests

> Plan, generate, run, repair, and audit automated tests powered by KB Mind context.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9+-orange.svg)](https://pnpm.io/)

This repository contains two packages:

| Package | Description |
| ------- | ----------- |
| `packages/contracts` | Public contracts (artifacts, commands, workflows, schemas) that other KB products consume. |
| `packages/plugin-cli` | Manifest v2 plugin that implements CLI commands, workflows, REST/Studio stubs, and infrastructure adapters. |

## 📦 Workspace quick start

```bash
git clone https://github.com/kirill-baranov/kb-labs-ai-tests.git
cd kb-labs-ai-tests

pnpm install                # installs deps + runs devkit sync
pnpm devkit:paths           # refresh cross-repo TS path aliases
pnpm devkit:sync            # ensure eslint/tsconfig/vitest presets are aligned

pnpm build                  # builds both packages
pnpm test                   # runs Vitest suites (contracts + plugin)
```

Useful scripts:

| Command | Purpose |
| ------- | ------- |
| `pnpm sandbox:cli` | Execute the compiled `ai-tests:plan` command locally. |
| `pnpm sandbox:rest` | Hit the REST status handler without deploying the plugin. |
| `pnpm sandbox:studio` | Render the Studio status widget in Node. |

## 🧪 CLI surface

`kb ai-tests <command>` exposes the following workflows (see detailed flags in [`docs/cli-guide.md`](./docs/cli-guide.md)):

| Command | Summary |
| ------- | ------- |
| `ai-tests:init` | Scaffold `tests/`, write README, and capture config snapshot. |
| `ai-tests:plan` | Scan source globs and emit `ai-tests.plan.json` with coverage heuristics. |
| `ai-tests:generate` | Use KB Mind context to generate or suggest test files from the plan. |
| `ai-tests:run` | Execute the configured runner (shell or mock) and store `ai-tests.run.json`. |
| `ai-tests:repair` | Iterate on failing tests, record iteration history, and rerun suites. |
| `ai-tests:audit` | Produce a markdown digest that combines plan coverage and last runs. |

Every command supports `--json`, `--dry-run`, `--debug`, and `--profile` for automation-friendly output.

## 📂 Artifacts

All artifacts live under `.kb/artifacts/ai-tests/`:

| File | Description |
| ---- | ----------- |
| `ai-tests.plan.json` | Targets that lack coverage, prioritised with heuristics. |
| `ai-tests.run.json` | Structured run results (summary + file-level stats). |
| `ai-tests.iterations.json` | Chronological repair attempts with generated suggestions and reruns. |
| `metadata.json` | Snapshot of config/runner/strategy used for the latest lifecycle. |
| `ai-tests.audit.md` | Markdown report emitted by `ai-tests:audit`. |
| `logs/run-*.log` | Raw runner output captured from each execution. |

See [`docs/artifacts.md`](./docs/artifacts.md) for schema references and example payloads.

## 🧱 Architecture

```
packages/
├── contracts/      # Zod schemas + TypeScript types
└── plugin-cli/
    ├── shared/     # constants reused across layers
    ├── domain/     # entities (TestPlan, IterationHistory, config model, statuses)
    ├── application/# use-cases orchestrating workflows
    ├── infra/      # adapters (fs workspace, runners, mind client)
    ├── cli/        # command handlers wired into manifest
    ├── rest/       # status endpoint stub
    ├── studio/     # status widget
    └── workflows/  # KB workflow hooks invoking use-cases
```

The layering rules, domain invariants (max attempts, needs-review tagging), and serialization contracts are described in [`docs/architecture.md`](./docs/architecture.md).

## ⚙️ Configuration

`kb.config.json` hosts the AI Tests config that the plugin reads and writes:

```json
{
  "aiTests": {
    "sources": ["src/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
    "testsDir": "tests",
    "runner": { "mode": "shell", "command": "pnpm test" },
    "strategy": "llm-generate",
    "maxAttempts": 3,
    "thresholds": {
      "repair": "medium",
      "allowedFailurePercentage": 0.1
    }
  }
}
```

The config gets snapshotted into `metadata.json` on every `init`/`plan` run so audits can trace changes. A more detailed walkthrough plus a worked end-to-end example lives in [`docs/getting-started.md`](./docs/getting-started.md).

## 🔁 Workflows

Workflow files in `src/workflows` call the same application use-cases as the CLI. The canonical sequence:

1. `ai-tests.workflow.plan` → harvest uncovered modules and emit plan artifact.
2. `ai-tests.workflow.generate` → create suggestions/test files while guarding against silent overwrites.
3. `ai-tests.workflow.run` → execute the configured runner (`shell` or `mock`) and persist run + log artifacts.
4. `ai-tests.workflow.repair` → iterate with `maxAttempts`, record iteration history, set `needsReview` when fixes are uncertain, and stop when attempts are exhausted.

[`docs/workflows.md`](./docs/workflows.md) documents each step, emitted events, and how artifacts flow between them.

## 🧪 Testing & quality

| Scope | Tests |
| ----- | ----- |
| `packages/contracts` | Zod schema validation (happy + unhappy paths) ensuring contracts don’t drift. |
| `packages/plugin-cli` | Domain unit tests (config + iteration rules), end-to-end mock runner flow, REST handler smoke tests. |

Run `pnpm test` to execute everything or `pnpm --filter @kb-labs/ai-tests-plugin test` for plugin-only coverage.

## 📚 Documentation index

- [`docs/overview.md`](./docs/overview.md) – product vision, supported artifacts, and surfaces.
- [`docs/architecture.md`](./docs/architecture.md) – layering rules, domain entities, and adapter contracts.
- [`docs/cli-guide.md`](./docs/cli-guide.md) – flags, JSON outputs, and piping tips for each command.
- [`docs/artifacts.md`](./docs/artifacts.md) – schema references with shape summaries.
- [`docs/workflows.md`](./docs/workflows.md) – plan/generate/run/repair lifecycle + repair loop rules.
- [`docs/getting-started.md`](./docs/getting-started.md) – config walkthrough, kb.config.json sample, and a plan→generate→run scenario.

## 🧰 Contribution guidelines

- Run `pnpm devkit:paths && pnpm devkit:sync` after pulling upstream changes.
- Keep manifests and public contracts in sync (update both the contracts package and `manifest.v2.ts`).
- Prefer adapters from `infra/` in tests via dependency injection — the e2e spec shows an in-memory example.

MIT © KB Labs
