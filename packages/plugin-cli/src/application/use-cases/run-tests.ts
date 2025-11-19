import type { RunTestsInput, RunTestsOutput, AiTestsApplicationServices } from '../types.js';
import { AiTestsConfigModel } from '../../domain/config.js';

export async function runTests(input: RunTestsInput, services: AiTestsApplicationServices): Promise<RunTestsOutput> {
  const configModel = AiTestsConfigModel.from(await services.configStore.read());
  const runnerOutput = await services.runner.run(configModel.value, { dryRun: input.dryRun });

  if (input.dryRun) {
    return {
      runPath: 'dry-run',
      logPath: 'dry-run',
      result: runnerOutput.result
    };
  }

  const { runPath, logPath } = await services.workspace.writeRunArtifact(runnerOutput.result, runnerOutput.log);
  return {
    runPath,
    logPath,
    result: runnerOutput.result
  };
}

