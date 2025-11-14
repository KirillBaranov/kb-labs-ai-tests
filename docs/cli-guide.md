# CLI Guide

This guide explains how to add or modify CLI commands in the plugin template.

## Folder structure

```
packages/plugin-cli/src/cli/
└── commands/
    └── hello/
        └── run.ts
```

Each command lives inside its own folder and exports a `run*` function. The function should:

1. Accept a serialisable args object (parsed by the host CLI).
2. Return a serialisable payload (used by tests and potential API consumers).
3. Write to the provided `stdout` stream and optionally log via the injected logger.

## Creating a new command

1. Duplicate the `hello` command folder and rename it to match your command id (e.g. `templates/build`).
2. Implement `runYourCommand` to perform the desired logic. Call application use-cases instead of embedding business logic in the command file.
3. Add the handler to `src/manifest.v2.ts` with metadata (`describe`, `flags`, `examples`).
4. Update `tsup.config.ts` `entry` array to include the new command file.
5. Add tests under `packages/plugin-cli/tests/cli/` validating console output and return payloads.

## Command context helpers

- `@app/application`: use-cases that orchestrate domain logic.
- `@app/infrastructure`: adapters (e.g. logger, fs) to integrate with the runtime.
- `@app/shared`: shared constants / helpers.

## Testing guidelines

Use Vitest to assert both the returned payload and stdout interactions:

```ts
const write = vi.fn();
const result = await runMyCommand(args, { stdout: { write } as any });
expect(result).toMatchObject({...});
expect(write).toHaveBeenCalledWith('Expected output\n');
```

Add negative cases to confirm argument validation behaviour when applicable.

