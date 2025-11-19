# @kb-labs/ai-tests-contracts

Lightweight public contracts package for the plugin: it describes guaranteed artifacts, commands, workflows, API payloads, and the version of these promises.

## Vision & Purpose

**@kb-labs/ai-tests-contracts** provides lightweight public contracts for KB Labs AI Tests. It describes guaranteed artifacts, commands, workflows, API payloads, and the version of these promises.

### Core Goals

- **Contract Definition**: Define public contracts for AI Tests
- **Schema Validation**: Zod schemas for validation
- **Type Safety**: TypeScript types derived from schemas
- **Versioning**: SemVer-based contract versioning

## Package Status

- **Version**: 0.0.1
- **Stage**: Stable
- **Status**: Production Ready ✅

## Architecture

### High-Level Overview

```
AI Tests Contracts
    │
    ├──► Contract Manifest
    ├──► Zod Schemas
    ├──► TypeScript Types
    └──► Helper Parsers
```

### Key Components

1. **Contract Manifest** (`contract.ts`): Plugin contracts manifest
2. **Schemas** (`schema/`): Zod validation schemas
3. **Types** (`types.ts`): TypeScript type definitions
4. **Parsers** (`schema.ts`): Helper parsers

## ✨ Features

- **Contract Manifest**: Single source of truth for plugin's public capabilities
- **Zod Schemas**: Validation schemas for artifacts, commands, workflows, API payloads
- **TypeScript Types**: Type definitions for command inputs/outputs
- **Helper Parsers**: `parsePluginContracts` for runtime validation

## 📦 API Reference

### Main Exports

#### Contract Manifest

- `pluginContractsManifest`: Single source of truth for plugin's public capabilities
- `contractsVersion`: SemVer version for contract coordination
- `contractsSchemaId`: Schema ID for contract validation

#### Schemas

- `parsePluginContracts`: Parse plugin contracts
- `pluginContractsSchema`: Plugin contracts schema

#### Types

- `PluginContracts`: Plugin contracts type
- `ArtifactDecl`: Artifact declaration type
- `CommandDecl`: Command declaration type

## 🔧 Configuration

### Configuration Options

No configuration needed - pure contract definitions.

## 🔗 Dependencies

### Runtime Dependencies

- `zod` (`^3.23.8`): Schema validation

### Development Dependencies

- `@kb-labs/devkit` (`link:../../../kb-labs-devkit`): DevKit presets
- `@types/node` (`^20.16.10`): Node.js types
- `tsup` (`^8.1.0`): TypeScript bundler
- `typescript` (`^5.6.3`): TypeScript compiler
- `vitest` (`^3.2.4`): Test runner

## 🧪 Testing

### Test Structure

```
tests/
├── ai-tests.schema.test.ts
└── contracts.manifest.test.ts
```

### Test Coverage

- **Current Coverage**: ~65%
- **Target Coverage**: 90%

## 📈 Performance

### Performance Characteristics

- **Time Complexity**: O(1) for type operations, O(n) for schema validation
- **Space Complexity**: O(1)
- **Bottlenecks**: Schema validation for large payloads

## 🔒 Security

### Security Considerations

- **Schema Validation**: Input validation via Zod schemas
- **Type Safety**: TypeScript type safety

### Known Vulnerabilities

- None

## 🐛 Known Issues & Limitations

### Known Issues

- None currently

### Limitations

- **Schema Validation**: Basic validation only

### Future Improvements

- **Enhanced Validation**: More validation rules

## 🔄 Migration & Breaking Changes

### Versioning Rules

- **MAJOR** — breaking changes (removing/renaming artifacts, changing payload formats)
- **MINOR** — backwards-compatible extensions (new artifacts, commands, fields)
- **PATCH** — documentation/metadata updates without altering payload formats

### Breaking Changes in Future Versions

- None planned

## 📚 Examples

### Example 1: Use Contract Manifest

```typescript
import { pluginContractsManifest } from '@kb-labs/ai-tests-contracts';

const planArtifactId = pluginContractsManifest.artifacts['ai-tests.plan.json'].id;
```

### Example 2: Parse Plugin Contracts

```typescript
import { parsePluginContracts } from '@kb-labs/ai-tests-contracts';

const contracts = parsePluginContracts(rawManifest);
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT © KB Labs
