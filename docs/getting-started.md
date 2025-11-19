# Getting Started

This walkthrough takes you from a clean checkout to an end-to-end AI Tests lifecycle. It also includes a ready-to-copy `kb.config.json` snippet and highlights the artifacts produced along the way.

## 1. Install & align devkit presets

```bash
pnpm install
pnpm devkit:paths
pnpm devkit:sync
```

These commands ensure TypeScript path aliases and lint/test configs match the current DevKit release.

## 2. Configure `kb.config.json`

Use this baseline (adjust glob patterns if your code lives elsewhere):

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

Commit the file so the plugin can pick it up locally and in CI.

## 3. Run the lifecycle locally

```bash
kb ai-tests init --tests-dir tests
kb ai-tests plan --json
kb ai-tests generate --strategy llm-generate
kb ai-tests run
kb ai-tests repair --max-attempts 2
kb ai-tests audit --json
```

### What happens at each step?

| Step | Resulting artifact(s) | Notes |
| ---- | --------------------- | ----- |
| `init` | `.kb/artifacts/ai-tests/metadata.json` | Stores config snapshot + plugin version. |
| `plan` | `.kb/artifacts/ai-tests/ai-tests.plan.json` | Contains coverage heuristics and prioritised targets. |
| `generate` | `.kb/artifacts/ai-tests/ai-tests.iterations.json`, optional suggestion files | Never overwrites existing tests and marks risky generations as `needsReview`. |
| `run` | `.kb/artifacts/ai-tests/ai-tests.run.json`, `.kb/artifacts/ai-tests/logs/run-<ts>.log` | Uses shell or mock runner based on config. |
| `repair` | updates `ai-tests.iterations.json` + optionally `ai-tests.run.json` | Executes up to `maxAttempts` and records iteration notes/fixes. |
| `audit` | `.kb/artifacts/ai-tests/ai-tests.audit.md` | Markdown digest for dashboards or PR comments. |

## 4. Use the sandboxes

| Script | Usage | Purpose |
| ------ | ----- | ------- |
| `pnpm sandbox:cli [--sources src/**/*.ts]` | Calls the compiled `ai-tests:plan` handler directly. |
| `pnpm sandbox:rest [profile]` | Invokes the REST status endpoint without deploying. |
| `pnpm sandbox:studio [pendingTargets]` | Renders the Studio status widget to static markup. |

Each sandbox expects that `pnpm --filter @kb-labs/ai-tests-plugin run build` has been executed beforehand.

## 5. Example scenario

1. **Plan** flags `src/core/order-service.ts` and `src/utils/money.ts` as uncovered.
2. **Generate** writes `tests/core/order-service.test.ts` but only produces a suggestion for `money.ts` because the file already has a sibling spec.
3. **Run** fails with 2 errors; logs live under `.kb/artifacts/ai-tests/logs/`.
4. **Repair** consumes the last run, writes two suggestion files (with context) and re-runs the suite. On success it marks the iteration as `fixed`; if still failing it sets `needsReview` unless `maxAttempts` was exceeded (then `exhausted`).
5. **Audit** summarises: plan ✅, last run ✅, iterations = 2, score = 90.

## 6. Running tests

```bash
pnpm test                          # workspace-wide
pnpm --filter @kb-labs/ai-tests-plugin test   # plugin package only
pnpm --filter @kb-labs/ai-tests-contracts test # contracts package only
```

Contracts tests cover Zod schemas; plugin tests include domain rules, an in-memory lifecycle, and REST handler smoke tests.

## 7. Troubleshooting

- **Artifacts missing** – ensure `kb ai-tests plan` was executed before `generate` or `run`.
- **Runner errors** – switch `aiTests.runner.mode` to `"mock"` while wiring CI to avoid executing a real test suite.
- **Max attempts reached** – raise `aiTests.maxAttempts` in `kb.config.json` or pass `--max-attempts` to `repair`.

Need more depth? Head to [`docs/workflows.md`](./workflows.md) for a flowchart of the repair loop and [`docs/artifacts.md`](./artifacts.md) for schema-focused details.

