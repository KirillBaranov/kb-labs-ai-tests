# REST Guide

Use this guide to add or modify REST endpoints in the plugin template.

## Directory layout

```
packages/plugin-cli/src/rest/
├── handlers/
│   └── hello-handler.ts
└── schemas/
    └── hello-schema.ts
```

- **schemas/** – request/response contracts defined with Zod.
- **handlers/** – executable functions invoked by the plugin runtime.

## Adding a route

1. **Define schemas**
   - Create `src/rest/schemas/<resource>-schema.ts`.
   - Export `RequestSchema` and `ResponseSchema` via Zod and associated `z.infer` types.
2. **Implement handler**
   - Add `src/rest/handlers/<resource>-handler.ts`.
   - Parse input with `RequestSchema.parse`, call application use-cases, return `ResponseSchema.parse(...)`.
   - Log via `ctx.runtime?.log` when useful.
3. **Update manifest**
   - Append a route entry to `src/manifest.v2.ts`.
   - Provide `method`, `path`, schema refs, handler path, and permissions (fs/net/env/quotas).
4. **Expose build output**
   - Ensure `tsup.config.ts` includes the handler and schema in `entry`.
5. **Write tests**
   - Create `packages/plugin-cli/tests/rest/<resource>-handler.spec.ts`.
   - Cover success and error cases with Vitest.

## Permissions checklist

- Declare only the filesystem paths the handler requires.
- Allowlisted env vars should be explicit (e.g., `KB_LABS_REPO_ROOT`).
- Prefer conservative quotas (`timeoutMs`, `memoryMb`, `cpuMs`).
- Document changes in `docs/rest-guide.md` or ADRs if they affect contracts.

## Example handler

```ts
export async function handleHello(input: unknown, ctx: HandlerContext = {}) {
  const parsed = HelloRequestSchema.parse((input ?? {}) as Partial<HelloRequest>);
  const greeting = createGreetingUseCase({ name: parsed.name });
  ctx.runtime?.log?.('info', 'Hello REST endpoint executed', {
    requestId: ctx.requestId,
    target: greeting.target,
  });
  const response = { message: greeting.message, target: greeting.target };
  return HelloResponseSchema.parse(response);
}
```

Follow this pattern for new routes and keep business logic inside application use-cases for easier testing.


