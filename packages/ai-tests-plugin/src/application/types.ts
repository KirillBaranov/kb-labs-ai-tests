import type {
  AiTestsConfig,
  AiTestsMetadata,
  AiTestsPlanArtifact,
  IterationRecord,
  TestGenerationRequest,
  TestGenerationResult,
  TestRunResult
} from '@kb-labs/ai-tests-contracts';
import type { NormalizedAiTestsConfig } from '../domain/config';
import type { Logger } from '../infra/adapters/logger';

export interface AiTestsConfigStore {
  read(): Promise<AiTestsConfig | undefined>;
}

export interface PlanDetectionResult {
  path: string;
  hasSiblingTest: boolean;
  hasDedicatedTest: boolean;
}

export interface AiTestsWorkspace {
  rootDir: string;
  ensureTestsDir(testsDir: string): Promise<{ created: boolean }>;
  ensureTestsReadme(testsDir: string, content: string): Promise<{ created: boolean }>;
  globSources(globs: string[]): Promise<string[]>;
  detectTestsForSources(sources: string[], testsDir: string): Promise<Record<string, PlanDetectionResult>>;
  writeGeneratedTests(
    results: TestGenerationResult[],
    options: { dryRun?: boolean }
  ): Promise<{ created: string[]; skipped: string[]; dryRun: string[] }>;
  writePlanArtifact(plan: AiTestsPlanArtifact): Promise<string>;
  readPlanArtifact(): Promise<AiTestsPlanArtifact | undefined>;
  writeIterations(records: IterationRecord[]): Promise<string>;
  readIterations(): Promise<IterationRecord[]>;
  writeRunArtifact(result: TestRunResult, log: string): Promise<{ runPath: string; logPath: string }>;
  readRunArtifact(): Promise<TestRunResult | undefined>;
  writeMetadata(metadata: AiTestsMetadata): Promise<string>;
  writeAudit(markdown: string): Promise<string>;
  ensureSuggestions(results: TestGenerationResult[]): Promise<string[]>;
}

export interface MindTestContext {
  summary: string;
  relatedAdrs: string[];
  examples: string[];
}

export interface MindTestClient {
  fetchContext(request: { path: string }): Promise<MindTestContext>;
}

export interface TestsGenerator {
  generate(
    request: TestGenerationRequest & { context: MindTestContext; outputPath: string }
  ): Promise<TestGenerationResult>;
  repair(request: {
    filePath: string;
    error: string;
    context: MindTestContext;
    outputPath: string;
  }): Promise<TestGenerationResult>;
}

export interface TestRunnerOutput {
  result: TestRunResult;
  log: string;
}

export interface TestRunnerAdapter {
  run(config: NormalizedAiTestsConfig, options?: { dryRun?: boolean }): Promise<TestRunnerOutput>;
}

export interface AiTestsApplicationServices {
  configStore: AiTestsConfigStore;
  workspace: AiTestsWorkspace;
  mind: MindTestClient;
  generator: TestsGenerator;
  runner: TestRunnerAdapter;
  logger: Logger;
  clock: () => Date;
}

export interface InitTestsInput {
  testsDir?: string;
  dryRun?: boolean;
}

export interface InitTestsOutput {
  testsDir: string;
  configUpdated: boolean;
  created: string[];
  skipped: string[];
  summary: string;
}

export interface PlanTestsInput {
  sources?: string[];
  dryRun?: boolean;
}

export interface PlanTestsOutput {
  planPath: string;
  summary: AiTestsPlanArtifact['summary'];
  totalTargets: number;
  notCovered: number;
}

export interface GenerateTestsInput {
  targets?: string[];
  dryRun?: boolean;
  strategy?: AiTestsConfig['strategy'];
}

export interface GenerateTestsOutput {
  generated: TestGenerationResult[];
  artifacts: string[];
  summary: string;
}

export interface RunTestsInput {
  dryRun?: boolean;
}

export interface RunTestsOutput {
  runPath: string;
  logPath: string;
  result: TestRunResult;
}

export interface RepairTestsInput {
  dryRun?: boolean;
  maxAttempts?: number;
}

export interface RepairTestsOutput {
  iteration: IterationRecord;
  maxAttemptsReached: boolean;
}

export interface AuditTestsInput {
  includePlan?: boolean;
  includeRuns?: boolean;
  dryRun?: boolean;
}

export interface AuditTestsOutput {
  reportPath: string;
  score: number;
  summary: string;
}

