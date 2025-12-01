import type { InitTestsInput, InitTestsOutput, AiTestsApplicationServices } from '../types';
import { AiTestsConfigModel } from '../../domain/config';
import { TEST_README_CONTENT } from '../../shared/constants';

const PLUGIN_VERSION = process.env.KB_AI_TESTS_VERSION ?? '0.0.1';

export async function initTests(input: InitTestsInput, services: AiTestsApplicationServices): Promise<InitTestsOutput> {
  const currentConfig = await services.configStore.read();
  const configModel = AiTestsConfigModel.from(currentConfig);
  const testsDir = input.testsDir ?? configModel.testsDir;
  const actions = { created: [] as string[], skipped: [] as string[] };

  if (!input.dryRun) {
    const ensuredDir = await services.workspace.ensureTestsDir(testsDir);
    if (ensuredDir.created) {
      actions.created.push(testsDir);
    } else {
      actions.skipped.push(testsDir);
    }

    const readmeResult = await services.workspace.ensureTestsReadme(testsDir, TEST_README_CONTENT);
    if (readmeResult.created) {
      actions.created.push(`${testsDir}/README.md`);
    } else {
      actions.skipped.push(`${testsDir}/README.md`);
    }
  }

  const nextConfigModel = AiTestsConfigModel.merge(currentConfig, { testsDir });
  const nextConfig = nextConfigModel.value;

  if (!input.dryRun) {
    await services.workspace.writeMetadata({
      pluginVersion: PLUGIN_VERSION,
      configSnapshot: nextConfig,
      runnerMode: nextConfig.runner.mode,
      strategy: nextConfig.strategy,
      lastUpdated: services.clock().toISOString()
    });
  }

  const summary = [
    `Tests dir: ${testsDir}`,
    'Config update: managed by kb CLI',
    `Created: ${actions.created.length}`,
    `Skipped: ${actions.skipped.length}`
  ].join(' · ');

  return {
    testsDir,
    configUpdated: false,
    created: actions.created,
    skipped: actions.skipped,
    summary
  };
}

