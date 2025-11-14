# Getting Started

Follow these steps to explore and extend the KB Labs Plugin Template.

## 1. Install dependencies

```bash
pnpm install
```

This runs `devkit:sync` automatically to align local configs with the latest presets.

## 2. Build the sample plugin

```bash
pnpm --filter @kb-labs/plugin-template-cli run build
```

You will find compiled assets in `packages/plugin-cli/dist/`.

## 3. Run the HelloWorld command

```bash
node packages/plugin-cli/dist/cli/commands/hello/run.js --name Developer
```

Expected output:

```
Hello, Developer!
```

Add `--json` to see the structured payload emitted by the command.

## 4. Hit the REST endpoint locally

Use the REST sandbox:

```bash
pnpm sandbox:rest Developer
```

Expected console log:

```
REST response: { message: 'Hello, Developer!', target: 'Developer' }
```

It also prints the structured log emitted by the handler.

## 5. Render the Studio widget

```bash
pnpm sandbox:studio Developer
```

The script renders the widget to static markup so you can quickly check the layout:

```
<section ...>Hello, Developer! ...</section>
```

If you need to preview visuals, import `HelloWidget` into a React playground and reuse the same props.

---

### Sandbox summary

| Command | Purpose | Notes |
|---------|---------|-------|
| `pnpm sandbox:cli` | Runs the compiled CLI command | Pass `--name` and `--json`; prints returned payload after command execution |
| `pnpm sandbox:rest` | Executes the REST handler directly | Accepts an optional name argument; logs mimic plugin runtime |
| `pnpm sandbox:studio` | Renders the Studio widget to static markup | Useful for snapshot review; run after `pnpm build` |

### Troubleshooting

- `Build artifacts missing`: run `pnpm --filter @kb-labs/plugin-template-cli run build` before the sandbox command.
- Permission errors: double-check `manifest.v2.ts` permissions if you modify the handler to read files or env variables.
- Manifest drift: see [`docs/faq.md`](./faq.md) for the manifest change checklist.

---

## 6. Iterate with tests

```bash
pnpm --filter @kb-labs/plugin-template-cli test
```

Vitest runs CLI and REST smoke tests located in `packages/plugin-cli/tests/`.

---

For deeper dives, check the CLI/REST/Studio guides in this repository.

