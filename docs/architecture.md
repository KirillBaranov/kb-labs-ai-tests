# Architecture Guide

The plugin template adopts a pragmatic layered architecture inspired by Domain-Driven Design and hexagonal patterns. The goal is to keep surfaces thin while offering clear boundaries for contributors.

## Layers

| Layer | Purpose | Depends on |
|-------|---------|------------|
| **shared** | Cross-cutting constants, helpers, types | – |
| **domain** | Pure entities and value objects | shared |
| **application** | Use-cases orchestrating domain logic | domain, shared |
| **infrastructure** | Adapters to external systems (logging, fs, net) | shared |
| **cli / rest / studio** | Interface adapters wiring runtime requests to use-cases | application, shared, infrastructure |

Principles:

- Interface layers (CLI, REST, Studio) should not contain business logic—delegate to application use-cases.
- Application coordinates domain behaviour and defines contracts for infrastructure adapters.
- Domain remains pure and side-effect free.
- Shared utilities stay lightweight and framework-agnostic.

## Folder layout

```
packages/plugin-cli/src/
├── shared/
├── domain/
├── application/
├── infrastructure/
├── cli/
├── rest/
└── studio/
```

## Manifest as the contract

`src/manifest.v2.ts` ties all surfaces together:

- Declares CLI commands with metadata, flags, and handlers.
- Lists REST routes, schemas, permissions, and error specs.
- Registers Studio widgets, menus, and layouts plus their data sources.
- Documents global capabilities and artefacts.

Any change to CLI/REST/Studio should update the manifest and include tests + docs.

## Testing strategy

- **Unit**: domain entities and application use-cases.
- **Integration**: CLI commands, REST handlers, Studio widgets (smoke tests).
- **Manual**: sandbox scripts (`pnpm sandbox:*`) to exercise compiled outputs.

## Extensibility tips

- Start simple—add logic to application/use-cases first, refactor into new domain objects as complexity grows.
- Infrastructure adapters should be stateless and injected; declare required permissions in the manifest.
- Record significant architecture decisions or deviations in `docs/adr/`.

This structure keeps the template approachable for new contributors while offering a clear path to scale more sophisticated plugins.


