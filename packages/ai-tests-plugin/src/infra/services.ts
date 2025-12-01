import type { AiTestsApplicationServices } from '../application/types';
import { createConfigStore } from './adapters/config-store';
import { createConsoleLogger } from './adapters/logger';
import { createWorkspaceAdapter } from './adapters/workspace';
import { createTestRunnerAdapter } from './adapters/runner';
import { createMockMindClient } from './adapters/mind-client';
import { createMockTestsGenerator } from './adapters/tests-generator';

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

