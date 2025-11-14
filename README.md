# KB Labs Plugin Template (@kb-labs/plugin-template)

> Reference toolkit for building KB Labs plugins with CLI, REST, and Studio surfaces in one place.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9+-orange.svg)](https://pnpm.io/)

## 🧭 Start here

If you just copied this template, read [Template Setup Guide](./docs/template-setup-guide.md) for a step-by-step walkthrough:
- rename the plugin IDs and packages
- decide which surfaces (CLI/REST/Studio) you want to keep
- align runtime code with the new contracts package
- run build/test/type-check pipelines safely

> `pnpm install` runs DevKit sync automatically. Expect config diffs (tsconfig, eslint, etc.) on the first run — commit them with your scaffold.

## 🔄 Staying current with DevKit

To migrate an existing plugin to the latest DevKit standards:
1. Bump the `@kb-labs/devkit` version in `package.json` (root and any package-specific `package.json` files).
2. Run `pnpm install` to update lockfiles.
3. Execute `pnpm devkit:paths` to regenerate `tsconfig.paths.json` so cross-repo aliases stay in sync.
4. Execute `pnpm devkit:sync` to apply the new presets. Use `pnpm devkit:force` if you need to overwrite local tweaks.
5. Review the generated diffs (eslint/tsconfig/vitest/tsup adjustments) and commit them together with the version bump.

These commands keep linting, TypeScript, and tooling configuration aligned across the ecosystem. Regenerating `tsconfig.paths.json` ensures TypeScript can resolve the `@kb-labs/...` aliases that point to neighbouring repositories in the mono-repo workspace.

## 🎯 What this template provides

- Devkit-powered configs (ESLint, TS, Vitest, TSUP) ready to use
- Canonical plugin package with layered architecture and manifest v2
- HelloWorld example spanning CLI command, REST route, and Studio widget
- Sandbox scripts for exercising compiled artifacts locally
- Contributor docs that explain how to extend each surface
- Lightweight `contracts` package that documents artifacts/commands/workflows and is safe to consume from other products

## 🗺️ Architecture map

```
┌─────────────┐
│ contracts   │  ← public promises (artifacts, commands, workflows, API)
└─────┬───────┘
      │ imports
┌─────▼───────┐    ┌───────────┐
│ shared      │    │ manifest  │
├─────────────┤    └───────────┘
│ domain      │ ← pure entities & value objects
├─────────────┤
│ application │ ← use-cases orchestrating domain
├─────────────┤
│ infra       │ ← adapters (logger, fs, etc.)
├─────────────┤
│ cli / rest / studio │ ← interface layers calling application logic
└─────────────┘
```

Use `docs/architecture.md` for full layering rules.

## 🔌 Choose your surfaces

The template enables CLI, REST, and Studio simultaneously. To build a lighter plugin:
- Keep only the directories you need (`src/cli`, `src/rest`, `src/studio`).
- Remove unneeded sections from `manifest.v2.ts` and the contracts manifest.
- Delete matching tests and sandbox scripts you no longer use.

The [Template Setup Guide](./docs/template-setup-guide.md) lists the exact files to touch for each surface.

## 🚀 Quick start

```bash
# Clone repository
git clone https://github.com/kirill-baranov/kb-labs-plugin-template.git
cd kb-labs-plugin-template

# Install dependencies
pnpm install

# Build and test the reference plugin
pnpm --filter @kb-labs/plugin-template-cli run build
pnpm --filter @kb-labs/plugin-template-cli test
```

Preview the HelloWorld command:

```bash
pnpm sandbox:cli --name Developer
```

## ✨ Features

- **Manifest-ready**: CLI, REST, Studio declarations plus permissions and quotas
- **Layered structure**: shared → domain → application → interface adapters
- **Testing included**: Vitest smoke tests for CLI and REST samples
- **Sandboxes**: `pnpm sandbox:*` scripts for CLI/REST/Studio exploration
- **Docs-first**: Guides describing architecture, setup, CLI/REST/Studio patterns

## 📁 Repository layout

```
kb-labs-plugin-template/
├── packages/
│   └── plugin-cli/         # Reference plugin package
│       ├── src/
│       │   ├── cli/        # CLI commands (HelloWorld)
│       │   ├── rest/       # REST handlers + schemas
│       │   ├── studio/     # Widgets, menus, layouts
│       │   ├── shared/     # Constants/helpers
│       │   ├── domain/     # Entities/value objects
│       │   └── application/# Use-cases orchestrating the domain
│       └── tests/          # CLI + REST smoke tests
├── docs/                   # Contributor guides and ADRs
└── scripts/                # Devkit sync + sandbox scripts
```

## 🧱 Architecture at a glance

- **shared** → reusable constants and helpers
- **domain** → pure entities (e.g., `Greeting`)
- **application** → use-cases (`createGreetingUseCase`)
- **infrastructure** → adapters (logger, fs, etc.)
- **cli/rest/studio** → interface layers calling application logic

See [`docs/architecture.md`](./docs/architecture.md) for details and dependency rules.

## 🧪 Tooling & scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build workspace packages |
| `pnpm test` | Run package test suites |
| `pnpm lint` | Lint using devkit presets |
| `pnpm type-check` | TypeScript project references |
| `pnpm verify` | Convenience wrapper (lint + type-check + test) |
| `pnpm sandbox:cli` | Execute compiled CLI command |
| `pnpm sandbox:rest` | Invoke REST handler with sample data |
| `pnpm sandbox:studio` | Render Studio widget markup |

Devkit helpers: `pnpm devkit:sync`, `pnpm devkit:check`, `pnpm devkit:force`, `pnpm devkit:help`.

## 📚 Documentation

- [`docs/overview.md`](./docs/overview.md) – why the template exists
- [`docs/getting-started.md`](./docs/getting-started.md) – setup & sandbox walkthrough
- [`docs/template-setup-guide.md`](./docs/template-setup-guide.md) – turning the template into your own plugin
- [`docs/cli-guide.md`](./docs/cli-guide.md) – adding CLI commands
- [`docs/rest-guide.md`](./docs/rest-guide.md) – creating REST routes
- [`docs/studio-guide.md`](./docs/studio-guide.md) – wiring Studio widgets
- [`docs/architecture.md`](./docs/architecture.md) – layering philosophy
- [`docs/faq.md`](./docs/faq.md) – troubleshooting and common questions

## 🤝 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for coding standards, layering rules, and PR checklists.

## 📄 License

MIT © KB Labs
