import type { AiTestsApplicationServices } from '../application/types.js';
import { createConfigStore } from './adapters/config-store.js';
import { createConsoleLogger } from './adapters/logger.js';
import { createWorkspaceAdapter } from './adapters/workspace.js';
import { createTestRunnerAdapter } from './adapters/runner.js';
import { createMockMindClient } from './adapters/mind-client.js';
import { createMockTestsGenerator } from './adapters/tests-generator.js';

export function createCliServices(rootDir = process.cwd()): AiTestsApplicationServices {
  const logger = createConsoleLogger('@kb-labs/ai-tests');
  return {
    configStore: createConfigStore(rootDir),
    workspace: createWorkspaceAdapter(rootDir),
    mind: createMockMindClient(),
    generator: createMockTestsGenerator(),
    runner: createTestRunnerAdapter(),
    logger,
    clock: () => new Date()
  };
}

