import path from 'node:path';
import type { RepairTestsInput, RepairTestsOutput, AiTestsApplicationServices } from '../types';
import type { TestGenerationResult } from '@kb-labs/ai-tests-contracts';
import { AiTestsConfigModel } from '../../domain/config';
import { IterationHistory, IterationRecordBuilder } from '../../domain/iteration';

function deriveTestPath(sourcePath: string, testsDir: string): string {
  const parsed = path.parse(sourcePath);
  const relativeBase = path.relative('src', path.join(parsed.dir, parsed.name));
  const normalized = relativeBase.startsWith('..') ? path.join(parsed.dir, parsed.name) : relativeBase;
  const sanitized = normalized.replace(/\\/g, '/').replace(/^\.\//, '');
  return path.join(testsDir, `${sanitized}.test${parsed.ext || '.ts'}`);
}

export async function repairTests(
  input: RepairTestsInput,
  services: AiTestsApplicationServices
): Promise<RepairTestsOutput> {
  const configModel = AiTestsConfigModel.from(await services.configStore.read());
  const history = IterationHistory.from(await services.workspace.readIterations());
  const runArtifact = await services.workspace.readRunArtifact();

  if (!runArtifact) {
    throw new Error('No run artifact found. Run tests before attempting repair.');
  }

  const failingFiles = runArtifact.files.filter((file) => file.failed > 0).map((file) => file.filePath);
  const limit = Math.min(configModel.maxAttempts, input.maxAttempts ?? configModel.maxAttempts);
  const attemptIndex = history.nextAttemptIndex();

  if (attemptIndex >= limit) {
    throw new Error(`Reached maxAttempts=${limit}.`);
  }

  const iterationBuilder = new IterationRecordBuilder(attemptIndex).withFailedFiles(failingFiles);

  if (!failingFiles.length) {
    const iteration = iterationBuilder.complete('fixed', ['No failing tests detected.']);
    const iterationsPath = await services.workspace.writeIterations([...history.list, iteration]);
    services.logger.log('info', 'Repair skipped, nothing to fix', { iterationsPath });
    return {
      iteration,
      maxAttemptsReached: false
    };
  }

  const fixes: TestGenerationResult[] = [];
  for (const filePath of failingFiles) {
    const error =
      runArtifact.files.find((file) => file.filePath === filePath)?.errors?.[0]?.message ?? 'Unknown failure';
    const context = await services.mind.fetchContext({ path: filePath });
    const outputPath = deriveTestPath(filePath, configModel.testsDir);
    const generation = await services.generator.repair({
      filePath,
      error,
      context,
      outputPath
    });
    fixes.push(generation);
  }

  const suggestionPaths = await services.workspace.ensureSuggestions(fixes);
  const iterationFixes = suggestionPaths.map((suggestionPath, index) => ({
    filePath: fixes[index]?.outputPath ?? '',
    suggestionPath,
    description: 'LLM repair suggestion'
  }));

  iterationBuilder.withGenerated(fixes).withFixes(iterationFixes);

  let rerunResult = runArtifact;

  if (!input.dryRun) {
    const rerun = await services.runner.run(configModel.value);
    rerunResult = rerun.result;
    await services.workspace.writeRunArtifact(rerunResult, rerun.log);
  }

  iterationBuilder.withRun(rerunResult);

  const status =
    rerunResult.status === 'success'
      ? 'fixed'
      : attemptIndex + 1 >= limit
        ? 'exhausted'
        : 'needs-review';

  const iteration = iterationBuilder.complete(status, [
    status === 'fixed' ? 'Runner reported success.' : 'Manual review required.'
  ]);

  const iterationsPath = await services.workspace.writeIterations([...history.list, iteration]);
  services.logger.log('info', 'Repair attempt recorded', { iteration: attemptIndex, iterationsPath });

  return {
    iteration,
    maxAttemptsReached: attemptIndex + 1 >= limit
  };
}

