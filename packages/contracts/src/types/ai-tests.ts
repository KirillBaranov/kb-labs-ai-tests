export type TestPriority = 'critical' | 'important' | 'nice-to-have';

export type CoverageStatus = 'not_covered' | 'partial' | 'ok';

export type TestKind = 'unit' | 'integration';

export type TestStatus = 'passed' | 'failed' | 'flaky' | 'repaired' | 'unrepairable';

export interface TestPlanTarget {
  path: string;
  displayName?: string;
  moduleName?: string;
  testType: TestKind;
  priority: TestPriority;
  coverageStatus: CoverageStatus;
  coverageEstimate?: number;
  hasExistingTests?: boolean;
  tags?: string[];
  notes?: string[];
}

export interface TestPlanSummary {
  totalTargets: number;
  notCovered: number;
  partial: number;
  ok: number;
}

export interface AiTestsPlanArtifact {
  generatedAt: string;
  sources: string[];
  targets: TestPlanTarget[];
  summary: TestPlanSummary;
  heuristics?: string[];
}

export interface GeneratedTestBlock {
  title: string;
  code: string;
  reason?: string;
}

export type AiTestsStrategy = 'suggest-only' | 'write-and-run' | 'repair-loop' | 'llm-generate';

export interface TestGenerationRequest {
  filePath: string;
  testType: TestKind;
  priority: TestPriority;
  strategy: AiTestsStrategy;
}

export interface TestGenerationResult {
  request: TestGenerationRequest;
  outputPath: string;
  blocks: GeneratedTestBlock[];
  needsReview?: boolean;
  warnings?: string[];
  durationMs?: number;
}

export type TestRunStatus = 'success' | 'failed' | 'partial';

export interface TestRunFileResult {
  filePath: string;
  passed: number;
  failed: number;
  skipped: number;
  durationMs?: number;
  errors?: Array<{
    testName?: string;
    message: string;
    stack?: string;
  }>;
}

export interface TestRunResult {
  status: TestRunStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  summary: {
    passed: number;
    failed: number;
    skipped: number;
  };
  files: TestRunFileResult[];
  runner: {
    mode: 'shell' | 'mock';
    command?: string;
    exitCode: number;
    stdout?: string;
    stderr?: string;
  };
}

export type IterationStatus = 'pending' | 'fixed' | 'needs-review' | 'exhausted';

export interface IterationRecord {
  attemptIndex: number;
  startedAt: string;
  completedAt?: string;
  generated?: TestGenerationResult[];
  failedFiles?: string[];
  fixes?: Array<{
    filePath: string;
    suggestionPath: string;
    description?: string;
  }>;
  run?: TestRunResult;
  status: IterationStatus;
  notes?: string[];
}

export type AiTestsRunnerMode = 'shell' | 'mock';

export interface AiTestsRunnerConfig {
  mode: AiTestsRunnerMode;
  command?: string;
  env?: Record<string, string>;
  cwd?: string;
}

export type AiTestsRunnerSetting = AiTestsRunnerConfig | AiTestsRunnerMode | string;

export interface AiTestsThresholds {
  repair: 'low' | 'medium' | 'high';
  allowedFailurePercentage?: number;
}

export interface AiTestsConfig {
  sources: string[];
  testsDir: string;
  runner: AiTestsRunnerSetting;
  strategy: AiTestsStrategy;
  maxAttempts: number;
  thresholds: AiTestsThresholds;
}

export interface AiTestsMetadata {
  pluginVersion: string;
  configSnapshot: AiTestsConfig;
  runnerMode: AiTestsRunnerMode;
  strategy: AiTestsStrategy;
  lastUpdated: string;
  timings?: {
    planMs?: number;
    generateMs?: number;
    runMs?: number;
    repairMs?: number;
  };
  artifacts?: {
    planPath?: string;
    runPath?: string;
    iterationsPath?: string;
    metadataPath?: string;
  };
}

