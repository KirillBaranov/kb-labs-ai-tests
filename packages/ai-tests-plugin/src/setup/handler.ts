import { AiTestsConfigModel } from '../domain/config';
import { DEFAULT_TESTS_DIR } from '../shared/constants';
import { createCliServices } from '../infra/services';

export async function run(): Promise<void> {
  const services = createCliServices();
  const config = AiTestsConfigModel.from(await services.configStore.read());
  const testsDir = config.testsDir || DEFAULT_TESTS_DIR;

  await services.workspace.ensureTestsDir(testsDir);
  await services.workspace.writeMetadata({
    pluginVersion: process.env.KB_AI_TESTS_VERSION ?? '0.0.1',
    configSnapshot: config.value,
    runnerMode: config.value.runner.mode,
    strategy: config.value.strategy,
    lastUpdated: new Date().toISOString()
  });
}

