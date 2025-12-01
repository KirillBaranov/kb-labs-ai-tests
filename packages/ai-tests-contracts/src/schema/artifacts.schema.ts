import { z } from 'zod';

export const TestPrioritySchema = z.enum(['critical', 'important', 'nice-to-have']);
export const CoverageStatusSchema = z.enum(['not_covered', 'partial', 'ok']);
export const TestKindSchema = z.enum(['unit', 'integration']);
export const TestStatusSchema = z.enum(['passed', 'failed', 'flaky', 'repaired', 'unrepairable']);

export const TestPlanTargetSchema = z.object({
  path: z.string().min(1),
  displayName: z.string().optional(),
  moduleName: z.string().optional(),
  testType: TestKindSchema.default('unit'),
  priority: TestPrioritySchema.default('important'),
  coverageStatus: CoverageStatusSchema.default('not_covered'),
  coverageEstimate: z.number().min(0).max(1).optional(),
  hasExistingTests: z.boolean().optional(),
  tags: z.array(z.string().min(1)).optional(),
  notes: z.array(z.string().min(1)).optional()
});

export const TestPlanSummarySchema = z.object({
  totalTargets: z.number().int().nonnegative(),
  notCovered: z.number().int().nonnegative(),
  partial: z.number().int().nonnegative(),
  ok: z.number().int().nonnegative()
});

export const AiTestsPlanArtifactSchema = z.object({
  generatedAt: z.string().datetime(),
  sources: z.array(z.string().min(1)).nonempty(),
  targets: z.array(TestPlanTargetSchema),
  summary: TestPlanSummarySchema,
  heuristics: z.array(z.string().min(1)).optional()
});

export const GeneratedTestBlockSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  reason: z.string().optional()
});

export const AiTestsStrategySchema = z.enum(['suggest-only', 'write-and-run', 'repair-loop', 'llm-generate']);

export const TestGenerationRequestSchema = z.object({
  filePath: z.string().min(1),
  testType: TestKindSchema.default('unit'),
  priority: TestPrioritySchema.default('important'),
  strategy: AiTestsStrategySchema
});

export const TestGenerationResultSchema = z.object({
  request: TestGenerationRequestSchema,
  outputPath: z.string().min(1),
  blocks: z.array(GeneratedTestBlockSchema).nonempty(),
  needsReview: z.boolean().optional(),
  warnings: z.array(z.string().min(1)).optional(),
  durationMs: z.number().int().nonnegative().optional()
});

export const TestRunFileResultSchema = z.object({
  filePath: z.string().min(1),
  passed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative().optional(),
  errors: z
    .array(
      z.object({
        testName: z.string().optional(),
        message: z.string(),
        stack: z.string().optional()
      })
    )
    .optional()
});

export const TestRunStatusSchema = z.enum(['success', 'failed', 'partial']);

export const TestRunResultSchema = z.object({
  status: TestRunStatusSchema,
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  durationMs: z.number().int().nonnegative(),
  summary: z.object({
    passed: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative()
  }),
  files: z.array(TestRunFileResultSchema),
  runner: z.object({
    mode: z.enum(['shell', 'mock']),
    command: z.string().optional(),
    exitCode: z.number().int(),
    stdout: z.string().optional(),
    stderr: z.string().optional()
  })
});

export const IterationStatusSchema = z.enum(['pending', 'fixed', 'needs-review', 'exhausted']);

export const IterationRecordSchema = z.object({
  attemptIndex: z.number().int().nonnegative(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  generated: z.array(TestGenerationResultSchema).optional(),
  failedFiles: z.array(z.string().min(1)).optional(),
  fixes: z
    .array(
      z.object({
        filePath: z.string().min(1),
        suggestionPath: z.string().min(1),
        description: z.string().optional()
      })
    )
    .optional(),
  run: TestRunResultSchema.optional(),
  status: IterationStatusSchema,
  notes: z.array(z.string().min(1)).optional()
});

export const IterationHistorySchema = z.array(IterationRecordSchema);

export const AiTestsRunnerModeSchema = z.enum(['shell', 'mock']);

export const AiTestsRunnerConfigSchema = z.object({
  mode: AiTestsRunnerModeSchema.default('shell'),
  command: z.string().optional(),
  env: z.record(z.string()).optional(),
  cwd: z.string().optional()
});

export const AiTestsThresholdsSchema = z.object({
  repair: z.enum(['low', 'medium', 'high']).default('medium'),
  allowedFailurePercentage: z.number().min(0).max(1).optional()
});

export const AiTestsConfigSchema = z.object({
  sources: z.array(z.string().min(1)).default(['src/**/*.ts']),
  testsDir: z.string().min(1).default('tests'),
  runner: z.union([AiTestsRunnerConfigSchema, z.string().min(1)]).default('shell'),
  strategy: AiTestsStrategySchema.default('llm-generate'),
  maxAttempts: z.number().int().positive().default(3),
  thresholds: AiTestsThresholdsSchema.default({ repair: 'medium' })
});

export const AiTestsMetadataSchema = z.object({
  pluginVersion: z.string().min(1),
  configSnapshot: AiTestsConfigSchema,
  runnerMode: AiTestsRunnerModeSchema,
  strategy: AiTestsStrategySchema,
  lastUpdated: z.string().datetime(),
  timings: z
    .object({
      planMs: z.number().int().nonnegative().optional(),
      generateMs: z.number().int().nonnegative().optional(),
      runMs: z.number().int().nonnegative().optional(),
      repairMs: z.number().int().nonnegative().optional()
    })
    .optional(),
  artifacts: z
    .object({
      planPath: z.string().min(1).optional(),
      runPath: z.string().min(1).optional(),
      iterationsPath: z.string().min(1).optional(),
      metadataPath: z.string().min(1).optional()
    })
    .optional()
});

export const AiTestsRunArtifactSchema = TestRunResultSchema;
export const AiTestsIterationsArtifactSchema = IterationHistorySchema;
export const AiTestsMetadataArtifactSchema = AiTestsMetadataSchema;

export const artifactExampleSchema = z.object({
  summary: z.string().optional(),
  payload: z.unknown().optional()
});

export const artifactContractSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['file', 'json', 'markdown', 'binary', 'dir', 'log']),
  description: z.string().optional(),
  pathPattern: z.string().min(1).optional(),
  mediaType: z.string().min(1).optional(),
  schemaRef: z.string().min(1).optional(),
  example: artifactExampleSchema.optional()
});

export const artifactsContractMapSchema = z.record(artifactContractSchema);
