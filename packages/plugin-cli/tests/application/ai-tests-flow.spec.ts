import { describe, expect, it } from 'vitest';
import type { AiTestsConfig } from '@kb-labs/ai-tests-contracts';
import type {
  AiTestsApplicationServices,
  AiTestsConfigStore,
  AiTestsWorkspace,
  MindTestClient,
  TestsGenerator,
  TestRunnerAdapter
} from '../../src/application/types.js';
import {
  planTests,
  generateTests,
  runTests,
  repairTests,
  initTests
} from '../../src/application/index.js';
import { createConsoleLogger } from '../../src/infra/adapters/logger.js';

function createInMemoryWorkspace(): { workspace: AiTestsWorkspace; state: any } {
  const state = {
    ensuredDirs: new Set<string>(),
    readmeCreated: false,
    generatedFiles: [] as string[],
    plan: undefined as any,
    iterations: [] as any[],
    run: undefined as any,
    audit: undefined as any,
    metadata: undefined as any,
    logs: [] as string[],
    suggestions: [] as string[]
  };

  const planPath = '.kb/artifacts/ai-tests/ai-tests.plan.json';
  const iterationsPath = '.kb/artifacts/ai-tests/ai-tests.iterations.json';
  const runPath = '.kb/artifacts/ai-tests/ai-tests.run.json';
  const logPath = '.kb/artifacts/ai-tests/logs/run-latest.log';

  const workspace: AiTestsWorkspace = {
    rootDir: '/tmp/mock',
    async ensureTestsDir(dir) {
      const created = !state.ensuredDirs.has(dir);
      state.ensuredDirs.add(dir);
      return { created };
    },
    async ensureTestsReadme(_dir, content) {
      state.readmeCreated = true;
      state.generatedFiles.push(`tests/README.md:${content.length}`);
      return { created: true };
    },
    async globSources() {
      return ['src/core/service.ts', 'src/utils/helpers.ts'];
    },
    async detectTestsForSources() {
      return {
        'src/core/service.ts': {
          path: 'src/core/service.ts',
          hasDedicatedTest: false,
          hasSiblingTest: false
        },
        'src/utils/helpers.ts': {
          path: 'src/utils/helpers.ts',
          hasDedicatedTest: false,
          hasSiblingTest: false
        }
      };
    },
    async writeGeneratedTests(results) {
      results.forEach((result) => state.generatedFiles.push(result.outputPath));
      return { created: results.map((r) => r.outputPath), skipped: [], dryRun: [] };
    },
    async writePlanArtifact(plan) {
      state.plan = plan;
      return planPath;
    },
    async readPlanArtifact() {
      return state.plan;
    },
    async writeIterations(records) {
      state.iterations = records;
      return iterationsPath;
    },
    async readIterations() {
      return state.iterations;
    },
    async writeRunArtifact(result, log) {
      state.run = result;
      state.logs.push(log);
      return { runPath, logPath };
    },
    async readRunArtifact() {
      return state.run;
    },
    async writeMetadata(metadata) {
      state.metadata = metadata;
      return '.kb/artifacts/ai-tests/metadata.json';
    },
    async writeAudit(markdown) {
      state.audit = markdown;
      return '.kb/artifacts/ai-tests/ai-tests.audit.md';
    },
    async ensureSuggestions(results) {
      const paths = results.map((result, index) => `.kb/suggestions/${index}-${result.outputPath}`);
      state.suggestions.push(...paths);
      return paths;
    }
  };

  return { workspace, state };
}

function createServices() {
  const config: AiTestsConfig = {
    sources: ['src/**/*.ts'],
    testsDir: 'tests',
    runner: { mode: 'mock' },
    strategy: 'llm-generate',
    maxAttempts: 2,
    thresholds: { repair: 'medium' }
  };

  const configStore: AiTestsConfigStore = {
    async read() {
      return config;
    }
  };

  const { workspace, state } = createInMemoryWorkspace();

  const mind: MindTestClient = {
    async fetchContext(request) {
      return {
        summary: `Mock summary for ${request.path}`,
        relatedAdrs: [],
        examples: []
      };
    }
  };

  const generator: TestsGenerator = {
    async generate(request) {
      return {
        request,
        outputPath: request.outputPath,
        blocks: [
          {
            title: 'generates test',
            code: `it('works for ${request.filePath}', () => expect(true).toBe(true));`
          }
        ]
      };
    },
    async repair(request) {
      return {
        request: {
          filePath: request.filePath,
          priority: 'important',
          strategy: 'repair-loop',
          testType: 'unit'
        },
        outputPath: request.outputPath,
        blocks: [
          {
            title: 'repairs failing test',
            code: `it('repairs ${request.filePath}', () => expect(true).toBe(true));`
          }
        ],
        needsReview: false
      };
    }
  };

  let runnerInvocation = 0;
  const runner: TestRunnerAdapter = {
    async run(_config) {
      runnerInvocation += 1;
      const failed = runnerInvocation === 1;
      const result = {
        status: failed ? 'failed' : 'success',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 100,
        summary: {
          passed: failed ? 0 : 2,
          failed: failed ? 2 : 0,
          skipped: 0
        },
        files: [
          {
            filePath: 'tests/core/service.spec.ts',
            passed: failed ? 0 : 2,
            failed: failed ? 2 : 0,
            skipped: 0,
            errors: failed
              ? [
                  {
                    message: 'Example failure'
                  }
                ]
              : undefined
          }
        ],
        runner: {
          mode: 'mock',
          command: 'mock',
          exitCode: failed ? 1 : 0,
          stdout: '',
          stderr: failed ? 'boom' : ''
        }
      };

      return { result, log: failed ? 'mock failure' : 'mock success' };
    }
  };

  const logger = createConsoleLogger('tests');

  const services: AiTestsApplicationServices = {
    configStore,
    workspace,
    mind,
    generator,
    runner,
    logger,
    clock: () => new Date('2024-01-01T00:00:00.000Z')
  };

  return { services, state };
}

describe('AI Tests application use-cases', () => {
  it('runs init → plan → generate → run → repair lifecycle against in-memory services', async () => {
    const { services, state } = createServices();

    const initResult = await initTests({ testsDir: 'tests' }, services);
    expect(initResult.testsDir).toBe('tests');
    expect(state.metadata).toBeDefined();

    const planResult = await planTests({}, services);
    expect(planResult.planPath).toBe('.kb/artifacts/ai-tests/ai-tests.plan.json');
    expect(planResult.totalTargets).toBeGreaterThan(0);

    const generateResult = await generateTests({}, services);
    expect(generateResult.generated.length).toBeGreaterThan(0);
    expect(state.iterations).toHaveLength(1);

    const runResult = await runTests({}, services);
    expect(runResult.result.status).toBe('failed');
    expect(state.run?.status).toBe('failed');

    const repairResult = await repairTests({}, services);
    expect(repairResult.iteration.status).toBe('fixed');
    expect(repairResult.maxAttemptsReached).toBe(true);
    expect(state.iterations).toHaveLength(2);
  });
});

