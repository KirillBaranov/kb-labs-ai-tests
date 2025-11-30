import { describe, expect, it } from 'vitest';
import {
  AiTestsConfigSchema,
  AiTestsMetadataSchema,
  AiTestsPlanArtifactSchema,
  AuditCommandInputSchema,
  GenerateCommandOutputSchema,
  IterationRecordSchema,
  PlanCommandOutputSchema,
  TestGenerationResultSchema,
  TestRunResultSchema
} from '../src/schema';

const samplePlan = {
  generatedAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  sources: ['src/**/*.ts'],
  targets: [
    {
      path: 'src/foo/service.ts',
      displayName: 'Foo service',
      moduleName: 'foo',
      testType: 'unit',
      priority: 'critical',
      coverageStatus: 'not_covered',
      tags: ['core']
    }
  ],
  summary: {
    totalTargets: 1,
    notCovered: 1,
    partial: 0,
    ok: 0
  },
  heuristics: ['missing-tests-glob']
};

const sampleRunResult = {
  status: 'failed',
  startedAt: new Date('2024-01-01T00:10:00.000Z').toISOString(),
  finishedAt: new Date('2024-01-01T00:11:30.000Z').toISOString(),
  durationMs: 90000,
  summary: {
    passed: 10,
    failed: 2,
    skipped: 0
  },
  files: [
    {
      filePath: 'tests/foo.spec.ts',
      passed: 5,
      failed: 2,
      skipped: 0,
      errors: [
        {
          testName: 'renders foo',
          message: 'expected true to be false'
        }
      ]
    }
  ],
  runner: {
    mode: 'shell',
    command: 'pnpm test',
    exitCode: 1,
    stdout: '...'
  }
};

describe('AiTests schemas', () => {
  it('validates plan artifact payloads', () => {
    expect(AiTestsPlanArtifactSchema.parse(samplePlan)).toBeDefined();
  });

  it('rejects plan with invalid timestamp', () => {
    const invalidPlan = { ...samplePlan, generatedAt: 'invalid' };
    expect(() => AiTestsPlanArtifactSchema.parse(invalidPlan)).toThrow();
  });

  it('validates test run results', () => {
    expect(TestRunResultSchema.parse(sampleRunResult)).toBeDefined();
  });

  it('rejects run payload when summary counters are negative', () => {
    const invalid = {
      ...sampleRunResult,
      summary: {
        ...sampleRunResult.summary,
        failed: -1
      }
    };

    expect(() => TestRunResultSchema.parse(invalid)).toThrow();
  });

  it('validates iteration record combined payloads', () => {
    const iteration = {
      attemptIndex: 0,
      startedAt: new Date('2024-01-01T00:12:00.000Z').toISOString(),
      completedAt: new Date('2024-01-01T00:15:00.000Z').toISOString(),
      generated: [
        TestGenerationResultSchema.parse({
          request: {
            filePath: 'src/foo/service.ts',
            testType: 'unit',
            priority: 'important',
            strategy: 'llm-generate'
          },
          outputPath: 'tests/foo/service.spec.ts',
          blocks: [
            {
              title: 'should return value',
              code: 'it("works", () => expect(fn()).toBe(1));'
            }
          ],
          durationMs: 1500
        })
      ],
      run: sampleRunResult,
      failedFiles: ['tests/foo.spec.ts'],
      status: 'needs-review',
      notes: ['requires manual investigation']
    };

    expect(IterationRecordSchema.parse(iteration)).toBeDefined();
  });

  it('rejects iteration records missing mandatory status', () => {
    const invalid = {
      attemptIndex: 1,
      startedAt: new Date().toISOString()
    };

    expect(() => IterationRecordSchema.parse(invalid)).toThrow();
  });

  it('enforces positive summary counters in plan outputs', () => {
    const planOutput = {
      planPath: '.kb/artifacts/ai-tests/ai-tests.plan.json',
      summary: samplePlan.summary,
      totalTargets: 1,
      notCovered: 1
    };

    expect(PlanCommandOutputSchema.parse(planOutput)).toEqual(planOutput);
  });

  it('applies defaults for config schema', () => {
    const parsed = AiTestsConfigSchema.parse({ testsDir: 'custom-tests' });
    expect(parsed).toMatchObject({
      testsDir: 'custom-tests',
      strategy: 'llm-generate',
      maxAttempts: 3,
      thresholds: { repair: 'medium' }
    });
  });

  it('validates metadata snapshots', () => {
    const metadata = {
      pluginVersion: '0.0.1',
      configSnapshot: AiTestsConfigSchema.parse({}),
      runnerMode: 'shell',
      strategy: 'llm-generate',
      lastUpdated: new Date('2024-01-01T00:20:00.000Z').toISOString(),
      artifacts: {
        planPath: '.kb/artifacts/ai-tests/ai-tests.plan.json'
      }
    };

    expect(AiTestsMetadataSchema.parse(metadata)).toBeDefined();
  });

  it('fails metadata validation when plugin version missing', () => {
    const invalid = {
      configSnapshot: AiTestsConfigSchema.parse({}),
      runnerMode: 'shell',
      strategy: 'llm-generate',
      lastUpdated: new Date().toISOString()
    };

    expect(() => AiTestsMetadataSchema.parse(invalid)).toThrow();
  });

  it('validates generation command output artifacts', () => {
    const payload = {
      generated: [
        {
          request: {
            filePath: 'src/foo/service.ts',
            testType: 'unit',
            priority: 'important',
            strategy: 'llm-generate'
          },
          outputPath: 'tests/foo/service.spec.ts',
          blocks: [
            {
              title: 'should do things',
              code: 'it("works", () => expect(true).toBe(true));'
            }
          ]
        }
      ],
      artifacts: ['.kb/artifacts/ai-tests/ai-tests.iterations.json'],
      summary: 'Generated 1 test file'
    };

    expect(GenerateCommandOutputSchema.parse(payload)).toBeDefined();
  });

  it('accepts audit command input with dryRun flag', () => {
    const input = {
      includePlan: true,
      includeRuns: false,
      dryRun: true
    };

    expect(AuditCommandInputSchema.parse(input)).toEqual(input);
  });
});
