# Package Architecture Audit: @kb-labs/ai-tests-plugin

**Date**: 2025-11-16  
**Package Version**: 0.1.0

## 1. Package Purpose & Scope

CLI/REST/Studio plugin для AI Tests: декларация manifest и setup-команд для `ai-tests`.

---

## 9. CLI Commands Audit

### 9.1 Product-level help

- `pnpm kb ai-tests --help`:
  - продукт `ai-tests` отображается;
  - доступны команды:
    - `ai-tests:audit`
    - `ai-tests:generate`
    - `ai-tests:init`
    - `ai-tests:plan`
    - `ai-tests:repair`
    - `ai-tests:run`.

- `pnpm kb ai-tests-plugin --help`:
  - продукт `ai-tests-plugin` отображается;
  - доступны setup-команды:
    - `ai-tests-plugin:setup`
    - `ai-tests-plugin:setup:rollback`.

### 9.2 Статус команд (уровень help)

| Product           | Command IDs                                                            | Status        | Notes                                        |
|-------------------|------------------------------------------------------------------------|---------------|----------------------------------------------|
| `ai-tests`        | `ai-tests:audit`, `:generate`, `:init`, `:plan`, `:repair`, `:run`    | **OK (help)** | Все видны в `kb ai-tests --help`             |
| `ai-tests-plugin` | `ai-tests-plugin:setup`, `:setup:rollback`                            | **OK (help)** | Видны в `kb ai-tests-plugin --help`          |

В этом проходе проверялась только доступность/отображение команд; поведение handler’ов не тестировалось.


