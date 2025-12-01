# @kb-labs/ai-tests-plugin

CLI + workflows implementation for KB Labs AI Tests.

## Vision & Purpose

**@kb-labs/ai-tests-plugin** provides CLI and workflows implementation for KB Labs AI Tests. It includes commands for initializing, planning, generating, running, repairing, and auditing tests.

### Core Goals

- **Init Command**: Initialize test configuration
- **Plan Command**: Plan test generation
- **Generate Command**: Generate tests
- **Run Command**: Run tests
- **Repair Command**: Repair failing tests
- **Audit Command**: Audit test coverage

## Package Status

- **Version**: 0.0.1
- **Stage**: Stable
- **Status**: Production Ready ✅

## Architecture

### High-Level Overview

```
AI Tests Plugin
    │
    ├──► CLI Commands
    ├──► Application Layer
    ├──► Domain Layer
    ├──► Infrastructure Layer
    ├──► Workflows
    └──► Studio Widgets
```

### Key Components

1. **CLI Commands** (`cli/commands/`): CLI command implementations
2. **Application Layer** (`application/`): Use cases and services
3. **Domain Layer** (`domain/`): Domain logic (config, entities, iteration, plan, run, status)
4. **Infrastructure Layer** (`infra/`): Adapters (config-store, logger, mind-client, runner, tests-generator, workspace)
5. **Workflows** (`workflows/`): Workflow implementations
6. **Studio Widgets** (`studio/widgets/`): Studio widget implementations

## ✨ Features

- **Init Command**: Initialize test configuration
- **Plan Command**: Plan test generation
- **Generate Command**: Generate tests
- **Run Command**: Run tests
- **Repair Command**: Repair failing tests
- **Audit Command**: Audit test coverage
- **Studio Widgets**: Status widget for Studio
- **REST Handlers**: REST API handlers

## 📦 API Reference

### Main Exports

#### CLI Commands

- `init`: Initialize test command
- `plan`: Plan test command
- `generate`: Generate test command
- `run`: Run test command
- `repair`: Repair test command
- `audit`: Audit test command

#### Use Cases

- `initTests`: Initialize tests use case
- `planTests`: Plan tests use case
- `generateTests`: Generate tests use case
- `runTests`: Run tests use case
- `repairTests`: Repair tests use case
- `auditTests`: Audit tests use case

## 🔧 Configuration

### Configuration Options

All configuration via CLI flags and kb-labs.config.json.

### CLI Flags

- `--config`: Configuration file path
- `--output`: Output directory
- `--profile`: Profile name

## 🔗 Dependencies

### Runtime Dependencies

- `@kb-labs/ai-tests-contracts` (`workspace:*`): AI Tests contracts
- `@kb-labs/plugin-manifest` (`link:../../../kb-labs-plugin/packages/manifest`): Plugin manifest
- `@kb-labs/shared-cli-ui` (`link:../../../kb-labs-shared/packages/cli-ui`): Shared CLI UI
- `fast-glob` (`^3.3.2`): File globbing
- `react` (`^18.3.0`): React
- `react-dom` (`^18.3.0`): React DOM
- `zod` (`^3.23.8`): Schema validation

### Development Dependencies

- `@kb-labs/devkit` (`link:../../../kb-labs-devkit`): DevKit presets
- `@types/node` (`^20.16.10`): Node.js types
- `@types/react` (`^18.3.8`): React types
- `@types/react-dom` (`^18.3.0`): React DOM types
- `tsup` (`^8.1.0`): TypeScript bundler
- `typescript` (`^5.6.3`): TypeScript compiler
- `vitest` (`^3.2.4`): Test runner

## 🧪 Testing

### Test Structure

```
tests/
├── application/
│   └── ai-tests-flow.spec.ts
├── domain/
│   └── config.spec.ts
└── rest/
    └── status-handler.spec.ts
```

### Test Coverage

- **Current Coverage**: ~55%
- **Target Coverage**: 90%

## 📈 Performance

### Performance Characteristics

- **Time Complexity**: O(n) for command execution, O(1) for command registration
- **Space Complexity**: O(n) where n = test suite size
- **Bottlenecks**: Test generation and execution time

## 🔒 Security

### Security Considerations

- **Input Validation**: Command input validation
- **Path Validation**: Path validation for file operations

### Known Vulnerabilities

- None

## 🐛 Known Issues & Limitations

### Known Issues

- None currently

### Limitations

- **Command Types**: Fixed command types
- **Output Formats**: Fixed output formats

### Future Improvements

- **More Commands**: Additional commands
- **Custom Output Formats**: Custom output format support

## 🔄 Migration & Breaking Changes

### Migration from Previous Versions

No breaking changes in current version (0.0.1).

### Breaking Changes in Future Versions

- None planned

## 📚 Examples

### Example 1: Initialize Tests

```bash
kb ai-tests:init
```

### Example 2: Plan Tests

```bash
kb ai-tests:plan
```

### Example 3: Generate Tests

```bash
kb ai-tests:generate
```

### Example 4: Run Tests

```bash
kb ai-tests:run
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT © KB Labs

