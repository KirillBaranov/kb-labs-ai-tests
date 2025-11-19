# FAQ & Troubleshooting

## Build fails with “Cannot resolve @kb-labs/...”

The workspace links to neighbouring repositories (`kb-labs-plugin`, `kb-labs-shared`, `kb-labs-devkit`, etc.) via `tsconfig.paths.json`. Run `pnpm devkit:paths` after cloning or whenever the path map drifts. If you prefer registry versions, replace `link:`/`workspace:` entries in `package.json`.

## `pnpm lint` complains about missing files in the project service

Make sure test files are included in `tsconfig.json`. The template already includes `tests` in the `include` array. If you move or rename directories, adjust the configuration accordingly.

## `tsc --noEmit` finds files outside `rootDir`

The template config removes explicit `rootDir` to avoid conflicts. If you reintroduce it, ensure it covers both `src` and `tests`, or move tests under `src/__tests__`.

## Sandbox scripts report “Build artifacts missing”

Run `pnpm --filter @kb-labs/ai-tests-plugin run build` first. Sandboxes operate on compiled outputs in `packages/plugin-cli/dist/`.

## CLI command exits without output

All commands write to `stdout` via the resolver context. If you run a compiled handler manually, pass a `stdout` with a `write` method (the sandboxes do this for you). When using `kb ai-tests ...`, the host CLI wires everything automatically.

## REST handler logs unexpected context

The sandbox passes `console.log` as the runtime logger. In the plugin runtime, `ctx.runtime.log` comes from the KB host and includes request IDs. Adjust `scripts/sandbox/rest-sandbox.mjs` to mimic your environment if you need structured logs.

## Studio sandbox prints raw markup

`sandbox:studio` renders the status widget with `react-dom/server` so you can inspect the HTML quickly. For visual previews, import `AiTestsStatusWidget` into Storybook or another React playground.

## Manifest change checklist

1. Update `src/manifest.v2.ts`.
2. Ensure new entries are listed in `tsup.config.ts`.
3. Adjust permissions and quotas as needed.
4. Add tests and sandbox examples if runtime behaviour changed.
5. Document the update in `docs/` (guides or ADRs).


