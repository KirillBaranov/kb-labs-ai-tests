import path from 'node:path';
import type { TestGenerationResult } from '@kb-labs/ai-tests-contracts';
import type { GenerateTestsInput, GenerateTestsOutput, AiTestsApplicationServices } from '../types.js';
import { AiTestsConfigModel } from '../../domain/config.js';
import { TestPlan } from '../../domain/plan.js';
import { IterationHistory, IterationRecordBuilder } from '../../domain/iteration.js';

function deriveTestPath(sourcePath: string, testsDir: string): string {
  const parsed = path.parse(sourcePath);
  const relativeBase = path.relative('src', path.join(parsed.dir, parsed.name));
  const normalized = relativeBase.startsWith('..') ? path.join(parsed.dir, parsed.name) : relativeBase;
  const sanitized = normalized.replace(/\\/g, '/').replace(/^\.\//, '');
  return path.join(testsDir, `${sanitized}.test${parsed.ext || '.ts'}`);
}

export async function generateTests(
  input: GenerateTestsInput,
  services: AiTestsApplicationServices
): Promise<GenerateTestsOutput> {
  const configModel = AiTestsConfigModel.from(await services.configStore.read());
  const planArtifact = (await services.workspace.readPlanArtifact()) ?? TestPlan.empty(configModel.sources).toJSON();
  const plan = TestPlan.fromArtifact(planArtifact);
  const targets = plan.needsGeneration(input.targets);

  if (!targets.length) {
    return {
      generated: [],
      artifacts: [],
      summary: 'No uncovered targets detected.'
    };
  }

  const strategy = input.strategy ?? configModel.value.strategy;
  const results: TestGenerationResult[] = [];

  for (const target of targets) {
    const outputPath = deriveTestPath(target.path, configModel.testsDir);
    const context = await services.mind.fetchContext({ path: target.path });
    const result = await services.generator.generate({
      filePath: target.path,
      testType: target.testType,
      priority: target.priority,
      strategy,
      context,
      outputPath
    });
    results.push(result);
  }

  const shouldWriteFiles = strategy !== 'suggest-only' && !input.dryRun;
  const writeOutcome = await services.workspace.writeGeneratedTests(results, {
    dryRun: !shouldWriteFiles
  });

  const iterationHistory = IterationHistory.from(await services.workspace.readIterations());
  const iterationBuilder = new IterationRecordBuilder(iterationHistory.nextAttemptIndex()).withGenerated(results);
  const iteration = iterationBuilder.complete('pending');
  const iterationsPath = await services.workspace.writeIterations([...iterationHistory.list, iteration]);

  const artifacts: string[] = [iterationsPath];

  if (!shouldWriteFiles) {
    const suggestionPaths = await services.workspace.ensureSuggestions(results);
    artifacts.push(...suggestionPaths);
  } else {
    artifacts.push(...writeOutcome.created);
  }

  const summaryParts = [
    `Targets: ${targets.length}`,
    `Strategy: ${strategy}`,
    `Created: ${writeOutcome.created.length}`,
    `Dry-run entries: ${writeOutcome.dryRun.length}`
  ];

  return {
    generated: results,
    artifacts,
    summary: summaryParts.join(' · ')
  };
}

